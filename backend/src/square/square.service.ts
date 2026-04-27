import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { SquareClient, SquareEnvironment } from 'square';

type SquareCreds = {
  squareAccessToken: string;
  squareLocationId: string;
  squareEnvironment: string;
  squareStatus: string;
  squareAppId?: string;
};

type SquareOrderResult = {
  squareOrderId: string;
  squareReceiptUrl?: string;
};

@Injectable()
export class SquareService {
  constructor(private readonly settingsService: SettingsService) {}

  private async getCredentials(): Promise<SquareCreds | null> {
    const settings = await this.settingsService.getSetting('integrations');
    if (!settings?.squareAccessToken || !settings?.squareLocationId) {
      return null;
    }
    if (settings.squareStatus !== 'connected') {
      return null;
    }
    return settings as SquareCreds;
  }

  private getClient(creds: SquareCreds): SquareClient {
    return new SquareClient({
      token: creds.squareAccessToken,
      environment: creds.squareEnvironment === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
    });
  }

  async isAvailable(): Promise<boolean> {
    const creds = await this.getCredentials();
    return creds !== null;
  }

  /**
   * Test the Square connection by calling the Locations API.
   * Returns location name on success or throws on failure.
   */
  async testConnection(): Promise<{ success: boolean; locationName?: string; message: string }> {
    const settings = await this.settingsService.getSetting('integrations');
    if (!settings?.squareAccessToken || !settings?.squareLocationId) {
      return { success: false, message: 'Missing Square credentials (Access Token and Location ID required)' };
    }

    try {
      const client = new SquareClient({
        token: settings.squareAccessToken,
        environment: settings.squareEnvironment === 'production'
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
      });

      const response = await client.locations.get({ locationId: settings.squareLocationId });
      const locationName = response.location?.name || 'Unknown';
      return { success: true, locationName, message: `Connected to "${locationName}"` };
    } catch (err: any) {
      const message = err?.errors?.[0]?.detail || err?.message || 'Connection failed';
      console.error('[SQUARE] Test connection failed:', message);
      return { success: false, message };
    }
  }

  /**
   * Sync an order to Square POS so the kitchen can see and print it.
   * Creates an order in Square with line items matching our order.
   */
  /**
   * Convert a scheduled date+time pair (entered by the customer in store local
   * time) into a UTC ISO timestamp that Square's `pickup_at` / `expected_shipped_at`
   * fields require. Store is in America/New_York; we use the current NY offset
   * (EDT in summer, EST in winter) so DST is handled automatically.
   */
  private parseScheduledTime(date: string, time: string): string {
    const naive = new Date(`${date}T${time}:00`); // interpreted as server-local
    if (isNaN(naive.getTime())) return new Date(Date.now() + 15 * 60000).toISOString();
    // Find what NY says for an arbitrary reference instant use that to
    // compute the offset for our scheduled instant.
    const probe = new Date(`${date}T12:00:00Z`);
    const nyParts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(probe);
    const nyAsLocal = Date.UTC(
      Number(nyParts.find(p => p.type === 'year')?.value),
      Number(nyParts.find(p => p.type === 'month')?.value) - 1,
      Number(nyParts.find(p => p.type === 'day')?.value),
      Number(nyParts.find(p => p.type === 'hour')?.value),
      Number(nyParts.find(p => p.type === 'minute')?.value),
      Number(nyParts.find(p => p.type === 'second')?.value),
    );
    const offsetMs = nyAsLocal - probe.getTime();
    // The customer's local instant in NY = scheduled wallclock - offset
    const utcMs = Date.UTC(
      Number(date.slice(0, 4)),
      Number(date.slice(5, 7)) - 1,
      Number(date.slice(8, 10)),
      Number(time.slice(0, 2)),
      Number(time.slice(3, 5)),
    ) - offsetMs;
    return new Date(utcMs).toISOString();
  }

  /**
   * Look for an order already pushed to Square by reference_id. Used before
   * create to avoid duplicating an order if a previous attempt got through to
   * Square but we never saw the response (network drop / timeout). Square's
   * SearchOrders has no direct reference_id filter, so we scan recent orders
   * at our location and match in memory.
   */
  private async findExistingByReference(client: SquareClient, locationId: string, reference: string): Promise<{ id: string } | null> {
    try {
      // Short window only the last few minutes. Goal is to catch network-drop
      // retries (response lost between Square accepting our create and our process
      // reading it). NOT to adopt historical orders that happen to share a
      // reference_id (e.g. after truncating our DB and reusing EO-XXXX numbers).
      const since = new Date(Date.now() - 5 * 60_000).toISOString();
      const result = await client.orders.search({
        locationIds: [locationId],
        query: {
          filter: {
            dateTimeFilter: { createdAt: { startAt: since } },
          },
          sort: { sortField: 'CREATED_AT', sortOrder: 'DESC' },
        },
        limit: 100,
      });
      const match = (result.orders || []).find((o: any) => o.referenceId === reference);
      return match ? { id: match.id! } : null;
    } catch {
      return null;
    }
  }

  async syncOrder(order: {
    orderNumber: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    orderType: string;
    items: any[];
    subtotal: number;
    tax: number;
    deliveryFee?: number;
    tip?: number;
    discount?: number;
    promoCode?: string;
    total: number;
    deliveryAddress?: string;
    notes?: string;
    scheduleType?: string; // 'asap' | 'scheduled'
    scheduledDate?: string; // 'YYYY-MM-DD'
    scheduledTime?: string; // 'HH:mm' (24h, store timezone)
  }): Promise<SquareOrderResult | null> {
    const creds = await this.getCredentials();
    if (!creds) {
      console.log('[SQUARE] Not configured, skipping order sync');
      return null;
    }

    try {
      const client = this.getClient(creds);

      // If a previous attempt actually reached Square (response lost on our
      // end), don't create a duplicate adopt the existing order.
      const already = await this.findExistingByReference(client, creds.squareLocationId, order.orderNumber);
      if (already) {
        console.log(`[SQUARE] Order ${order.orderNumber} already exists in Square (${already.id}), reusing`);
        // Best-effort: ensure external payment is recorded so it shows as Paid.
        try {
          await client.payments.create({
            sourceId: 'EXTERNAL',
            idempotencyKey: `eggok-pay-${order.orderNumber}-${already.id.slice(0, 16)}`,
            amountMoney: { amount: BigInt(Math.round(order.total * 100)), currency: 'USD' as const },
            orderId: already.id,
            locationId: creds.squareLocationId,
            externalDetails: { type: 'OTHER' as const, source: 'Stripe Online Payment' },
            note: `Online Order ${order.orderNumber} - Paid via Stripe`,
          });
        } catch { /* idempotent: already paid is fine */ }
        return { squareOrderId: already.id };
      }

      // Build line items from order items
      const lineItems = (order.items || []).map((item: any) => {
        // Base price + all modifier prices = true unit price
        const basePrice = Number(item.price) || 0;
        const modifierTotal = (item.modifiers || []).reduce(
          (sum: number, m: any) => sum + (Number(m.price) || 0), 0
        );
        const itemUnit = Math.round((basePrice + modifierTotal) * 100);

        // Build item name with modifiers for kitchen clarity
        const modifierNames = (item.modifiers || [])
          .map((m: any) => m.name)
          .filter(Boolean);
        const displayName = modifierNames.length > 0
          ? `${item.name || 'Item'} (${modifierNames.join(', ')})`
          : (item.name || 'Item');

        return {
          name: displayName,
          quantity: String(item.quantity || 1),
          basePriceMoney: {
            amount: BigInt(itemUnit),
            currency: 'USD' as const,
          },
          note: [
            ...(item.modifiers || []).map((m: any) => `+ ${m.name}${Number(m.price) > 0 ? ` ($${Number(m.price).toFixed(2)})` : ''}`),
            item.specialInstructions ? `Note: ${item.specialInstructions}` : '',
          ].filter(Boolean).join('\n') || undefined,
        };
      });

      // Build order note with relevant info
      const orderNotes = [
        `Online Order: ${order.orderNumber}`,
        `Type: ${order.orderType === 'delivery' ? 'DELIVERY' : 'PICKUP'}`,
        `Customer: ${order.customerName}`,
        order.customerPhone ? `Phone: ${order.customerPhone}` : '',
        order.orderType === 'delivery' && order.deliveryAddress ? `Deliver to: ${order.deliveryAddress}` : '',
        order.deliveryFee && order.deliveryFee > 0 ? `Delivery Fee: $${order.deliveryFee.toFixed(2)}` : '',
        order.notes ? `Notes: ${order.notes}` : '',
      ].filter(Boolean).join(' | ');

      // Build fulfillment based on order type.
      // For delivery orders we send Square `SHIPMENT` rather than `DELIVERY`.
      // Square Free plan filters DELIVERY-type orders out of Order Manager
      // (proven by direct experiments: TEST-A..D all hidden, TEST-E shipment shown);
      // SHIPMENT renders cleanly with the recipient name + address. The order
      // is still treated as delivery internally Uber Direct dispatch, customer
      // emails and our admin views all read `orderType = 'delivery'`. Only the
      // Square representation is normalised so kitchen sees it on the dashboard.
      const isDelivery = order.orderType === 'delivery';
      // Compute the target fulfillment time. For ASAP we use a short offset
      // (15 min pickup / 30 min delivery). For scheduled orders we honour the
      // customer's chosen date+time, interpreted in store timezone (defaults
      // to America/New_York; -04:00 EDT / -05:00 EST). This makes Square move
      // the order into its "Scheduled" tab instead of "Active".
      const isScheduled = order.scheduleType === 'scheduled' && !!order.scheduledDate && !!order.scheduledTime;
      const scheduledAt = isScheduled
        ? this.parseScheduledTime(order.scheduledDate!, order.scheduledTime!)
        : null;
      const pickupAt = scheduledAt || new Date(Date.now() + 15 * 60000).toISOString();
      const shipAt = scheduledAt || new Date(Date.now() + 30 * 60000).toISOString();

      const fulfillment = isDelivery
        ? {
            type: 'SHIPMENT' as const,
            state: 'PROPOSED' as const,
            shipmentDetails: {
              recipient: {
                displayName: `${order.customerName}`,
                phoneNumber: order.customerPhone,
              },
              expectedShippedAt: shipAt,
              shippingNote: [
                isScheduled ? `SCHEDULED for ${order.scheduledDate} ${order.scheduledTime}` : '',
                order.deliveryAddress ? `Deliver to: ${order.deliveryAddress}` : '',
                order.notes ? `Notes: ${order.notes}` : '',
              ].filter(Boolean).join(' | ').slice(0, 500) || undefined,
            },
          }
        : {
            type: 'PICKUP' as const,
            state: 'PROPOSED' as const,
            pickupDetails: {
              recipient: {
                displayName: order.customerName,
                phoneNumber: order.customerPhone,
              },
              scheduleType: isScheduled ? 'SCHEDULED' as const : 'ASAP' as const,
              pickupAt,
            },
          };

      const response = await client.orders.create({
        order: {
          locationId: creds.squareLocationId,
          referenceId: order.orderNumber,
          source: { name: 'Website' },
          lineItems,
          taxes: [
            {
              name: 'Tax',
              percentage: order.subtotal > 0
                ? ((order.tax / order.subtotal) * 100).toFixed(4)
                : '0',
              scope: 'ORDER' as const,
            },
          ],
          discounts: (order.discount && order.discount > 0)
            ? [{
                name: 'Promo / Discount',
                amountMoney: {
                  amount: BigInt(Math.round(order.discount * 100)),
                  currency: 'USD' as const,
                },
                scope: 'ORDER' as const,
              }]
            : undefined,
          serviceCharges: (() => {
            const charges: any[] = [];
            if (order.deliveryFee && order.deliveryFee > 0) {
              charges.push({
                name: 'Delivery Fee',
                amountMoney: {
                  amount: BigInt(Math.round(order.deliveryFee * 100)),
                  currency: 'USD' as const,
                },
                calculationPhase: 'SUBTOTAL_PHASE' as const,
                taxable: false,
              });
            }
            if (order.tip && order.tip > 0) {
              charges.push({
                name: 'Tip',
                amountMoney: {
                  amount: BigInt(Math.round(order.tip * 100)),
                  currency: 'USD' as const,
                },
                calculationPhase: 'SUBTOTAL_PHASE' as const,
                taxable: false,
              });
            }
            return charges.length ? charges : undefined;
          })(),
          fulfillments: [fulfillment],
          metadata: {
            source: 'eggok_online',
            order_number: order.orderNumber,
            order_type: order.orderType,
            note: orderNotes.slice(0, 255),
          },
        },
        // Per-attempt unique idempotency key. Square Orders API caches the
        // first response per key permanently, so a stuck error from a prior
        // attempt would otherwise repeat forever. The findExistingByReference
        // call above prevents the duplicate-creation risk this normally implies.
        idempotencyKey: `eggok-${order.orderNumber}-${Date.now()}`,
      });

      const squareOrderId = response.order?.id || '';
      console.log(`[SQUARE] Order synced: ${order.orderNumber} → Square ${squareOrderId}`);

      // Record external payment using Square's calculated total (avoids rounding mismatch)
      const squareTotal = response.order?.totalMoney?.amount;
      if (squareOrderId && squareTotal && squareTotal > 0n) {
        try {
          await client.payments.create({
            sourceId: 'EXTERNAL',
            // Bind the idempotency key to the Square order id so a re-sync that
// creates a fresh Square order records its own payment instead of returning
// the cached payment linked to a previous Square order with the same orderNumber.
idempotencyKey: `eggok-pay-${order.orderNumber}-${squareOrderId.slice(0, 16)}`,
            amountMoney: {
              amount: squareTotal,
              currency: 'USD' as const,
            },
            orderId: squareOrderId,
            locationId: creds.squareLocationId,
            externalDetails: {
              type: 'OTHER' as const,
              source: 'Stripe Online Payment',
            },
            note: `Online Order ${order.orderNumber} - Paid via Stripe`,
          });
          console.log(`[SQUARE] External payment recorded for ${order.orderNumber} ($${Number(squareTotal) / 100})`);
        } catch (payErr: any) {
          const payMsg = payErr?.errors?.[0]?.detail || payErr?.message || 'Unknown';
          console.error(`[SQUARE] External payment failed for ${order.orderNumber}:`, payMsg);
        }
      }

      return {
        squareOrderId,
        squareReceiptUrl: response.order?.netAmounts ? undefined : undefined,
      };
    } catch (err: any) {
      const message = err?.errors?.[0]?.detail || err?.message || 'Unknown error';
      console.error(`[SQUARE] Order sync failed for ${order.orderNumber}:`, message);
      return null;
    }
  }

  /**
   * List paired Square Terminal devices for this location.
   */
  async listTerminalDevices(): Promise<{ devices: any[]; error?: string }> {
    const creds = await this.getCredentials();
    if (!creds) return { devices: [], error: 'Square not configured' };

    try {
      const client = this.getClient(creds);
      const response = await client.devices.list({
        locationId: creds.squareLocationId,
      });

      const devices = (response.data || [])
        .filter((d: any) => d.components?.some((c: any) => c.type === 'APPLICATION' && c.applicationDetails?.applicationType === 'TERMINAL_API'))
        .map((d: any) => ({
          deviceId: d.id,
          name: d.name || 'Square Terminal',
          code: d.components?.find((c: any) => c.type === 'APPLICATION')?.applicationDetails?.deviceCodeId,
          status: d.components?.find((c: any) => c.type === 'APPLICATION')?.applicationDetails?.sessionStatus || 'UNKNOWN',
        }));

      return { devices };
    } catch (err: any) {
      const message = err?.errors?.[0]?.detail || err?.message || 'Failed to list devices';
      console.error('[SQUARE] List devices failed:', message);
      return { devices: [], error: message };
    }
  }

  /**
   * Create a device code to pair a new Square Terminal.
   */
  async createTerminalDeviceCode(): Promise<{ deviceCode?: any; error?: string }> {
    const creds = await this.getCredentials();
    if (!creds) return { error: 'Square not configured' };

    try {
      const client = this.getClient(creds);
      const response = await (client as any).devicesApi?.createDeviceCode?.({
        idempotencyKey: `eggok-pair-${Date.now()}`,
        deviceCode: {
          productType: 'TERMINAL_API',
          locationId: creds.squareLocationId,
          name: 'EggOk Terminal',
        },
      });

      return { deviceCode: response?.result?.deviceCode };
    } catch (err: any) {
      const message = err?.errors?.[0]?.detail || err?.message || 'Failed to create device code';
      console.error('[SQUARE] Create device code failed:', message);
      return { error: message };
    }
  }

  /**
   * Push an order to a Square Terminal device as a checkout.
   * This makes the order appear on the terminal screen.
   */
  async createTerminalCheckout(order: {
    squareOrderId: string;
    orderNumber: string;
    total: number;
    note?: string;
  }): Promise<{ checkoutId?: string; error?: string }> {
    const creds = await this.getCredentials();
    if (!creds) return { error: 'Square not configured' };

    // Get terminal device ID from settings
    const settings = await this.settingsService.getSetting('integrations');
    const deviceId = settings?.squareTerminalDeviceId;
    if (!deviceId) {
      console.log('[SQUARE] No terminal device configured, skipping terminal checkout');
      return { error: 'No terminal device configured' };
    }

    try {
      const client = this.getClient(creds);
      const response = await client.terminal.checkouts.create({
        idempotencyKey: `eggok-terminal-${order.orderNumber}-${Date.now()}`,
        checkout: {
          amountMoney: {
            amount: BigInt(Math.round(order.total * 100)),
            currency: 'USD' as const,
          },
          deviceOptions: {
            deviceId,
            skipReceiptScreen: true,
            collectSignature: false,
            showItemizedCart: true,
          },
          referenceId: order.orderNumber,
          orderId: order.squareOrderId,
          note: order.note || `Online Order ${order.orderNumber}`,
          paymentType: 'CARD_PRESENT' as const,
        },
      });

      const checkoutId = response.checkout?.id || '';
      console.log(`[SQUARE] Terminal checkout created: ${order.orderNumber} → ${checkoutId}`);
      return { checkoutId };
    } catch (err: any) {
      const message = err?.errors?.[0]?.detail || err?.message || 'Terminal checkout failed';
      console.error(`[SQUARE] Terminal checkout failed for ${order.orderNumber}:`, message);
      return { error: message };
    }
  }

  /**
   * Get the status of a terminal checkout.
   */
  async getTerminalCheckoutStatus(checkoutId: string): Promise<{ status?: string; error?: string }> {
    const creds = await this.getCredentials();
    if (!creds || !checkoutId) return { error: 'Invalid request' };

    try {
      const client = this.getClient(creds);
      const response = await client.terminal.checkouts.get({ checkoutId });
      return { status: response.checkout?.status || 'UNKNOWN' };
    } catch (err: any) {
      const message = err?.errors?.[0]?.detail || err?.message || 'Failed to get checkout status';
      return { error: message };
    }
  }

  /**
   * Cancel a pending terminal checkout.
   */
  async cancelTerminalCheckout(checkoutId: string): Promise<boolean> {
    const creds = await this.getCredentials();
    if (!creds || !checkoutId) return false;

    try {
      const client = this.getClient(creds);
      await client.terminal.checkouts.cancel({ checkoutId });
      console.log(`[SQUARE] Terminal checkout cancelled: ${checkoutId}`);
      return true;
    } catch (err: any) {
      console.error(`[SQUARE] Cancel checkout failed:`, err?.message);
      return false;
    }
  }

  /**
   * Update fulfillment state in Square when order status changes.
   * Note: We update fulfillment state (not order state) because order
   * completion requires payment, and payments go through Stripe not Square.
   */
  async updateOrderState(squareOrderId: string, status: string): Promise<boolean> {
    const creds = await this.getCredentials();
    if (!creds || !squareOrderId) return false;

    // Map our statuses to Square fulfillment states
    const fulfillmentStateMap: Record<string, string> = {
      confirmed: 'RESERVED',
      preparing: 'PREPARED',
      ready: 'COMPLETED',
      out_for_delivery: 'COMPLETED',
      delivered: 'COMPLETED',
      picked_up: 'COMPLETED',
      cancelled: 'CANCELED',
    };

    const fulfillmentState = fulfillmentStateMap[status];
    if (!fulfillmentState) return false;

    // For terminal statuses, also flip the parent order.state so Square dashboard
    // moves the order out of "Active" into the matching tab. Square does NOT
    // auto-transition order.state when fulfillment.state hits COMPLETED.
    const orderStateMap: Record<string, string> = {
      delivered: 'COMPLETED',
      picked_up: 'COMPLETED',
      cancelled: 'CANCELED',
    };
    const orderState = orderStateMap[status];

    try {
      const client = this.getClient(creds);

      // Get current order to find fulfillment ID and version
      const currentOrder = await client.orders.get({ orderId: squareOrderId });
      const version = currentOrder.order?.version;
      const fulfillments = currentOrder.order?.fulfillments || [];

      if (fulfillments.length === 0) {
        console.log(`[SQUARE] No fulfillments found for ${squareOrderId}, skipping`);
        return false;
      }

      // Update fulfillment state preserve all existing fields (pickup_details,
      // delivery_details, recipient, etc.) so Square dashboard keeps showing the
      // proper Source / Type / Channel after completion. Sending only {uid,type,state}
      // makes Square strip the metadata and fall back to generic "In store" / "Order".
      const updatedFulfillments = fulfillments.map((f: any) => ({
        ...f,
        state: fulfillmentState as any,
      }));

      await client.orders.update({
        orderId: squareOrderId,
        order: {
          locationId: creds.squareLocationId,
          version,
          fulfillments: updatedFulfillments,
          ...(orderState ? { state: orderState as any } : {}),
        },
        idempotencyKey: `eggok-update-${squareOrderId}-${status}-${Date.now()}`,
      });

      console.log(`[SQUARE] Order ${squareOrderId} fulfillment → ${fulfillmentState}${orderState ? ` (order.state → ${orderState})` : ''}`);
      return true;
    } catch (err: any) {
      const message = err?.errors?.[0]?.detail || err?.message || 'Unknown error';
      console.error(`[SQUARE] Fulfillment update failed for ${squareOrderId}:`, message);
      return false;
    }
  }
}
