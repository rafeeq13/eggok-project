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
    total: number;
    deliveryAddress?: string;
    notes?: string;
  }): Promise<SquareOrderResult | null> {
    const creds = await this.getCredentials();
    if (!creds) {
      console.log('[SQUARE] Not configured, skipping order sync');
      return null;
    }

    try {
      const client = this.getClient(creds);

      // Build line items from order items
      const lineItems = (order.items || []).map((item: any) => {
        // Unit price only — Square multiplies by quantity automatically
        // Modifiers go in note only (not in price) to keep Square total matching ours
        const itemUnit = Math.round((item.price || 0) * 100);

        return {
          name: item.name || 'Item',
          quantity: String(item.quantity || 1),
          basePriceMoney: {
            amount: BigInt(itemUnit),
            currency: 'USD' as const,
          },
          note: [
            ...(item.modifiers || []).map((m: any) => `+ ${m.name}${m.price > 0 ? ` ($${m.price})` : ''}`),
            item.specialInstructions ? `Note: ${item.specialInstructions}` : '',
          ].filter(Boolean).join('\n') || undefined,
        };
      });

      // Delivery fee added as non-taxable service charge (not line item)
      // to prevent Square from taxing it and causing total mismatch

      // Build order note with relevant info
      const orderNotes = [
        `Online Order: ${order.orderNumber}`,
        `Type: ${order.orderType === 'delivery' ? 'DELIVERY' : 'PICKUP'}`,
        `Customer: ${order.customerName}`,
        order.customerPhone ? `Phone: ${order.customerPhone}` : '',
        order.orderType === 'delivery' && order.deliveryAddress ? `Deliver to: ${order.deliveryAddress}` : '',
        order.notes ? `Notes: ${order.notes}` : '',
      ].filter(Boolean).join(' | ');

      const response = await client.orders.create({
        order: {
          locationId: creds.squareLocationId,
          referenceId: order.orderNumber,
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
          serviceCharges: [
            ...(order.deliveryFee && order.deliveryFee > 0 ? [{
              name: 'Delivery Fee',
              amountMoney: {
                amount: BigInt(Math.round(order.deliveryFee * 100)),
                currency: 'USD' as const,
              },
              calculationPhase: 'SUBTOTAL_PHASE' as const,
              taxable: false,
            }] : []),
            ...(order.tip && order.tip > 0 ? [{
              name: 'Tip',
              amountMoney: {
                amount: BigInt(Math.round(order.tip * 100)),
                currency: 'USD' as const,
              },
              calculationPhase: 'SUBTOTAL_PHASE' as const,
              taxable: false,
            }] : []),
          ],
          fulfillments: [
            {
              type: order.orderType === 'delivery' ? 'DELIVERY' : 'PICKUP',
              state: 'PROPOSED',
              ...(order.orderType === 'delivery'
                ? {
                    deliveryDetails: {
                      recipient: {
                        displayName: order.customerName,
                        phoneNumber: order.customerPhone,
                        address: order.deliveryAddress ? { addressLine1: order.deliveryAddress } : undefined,
                      },
                    },
                  }
                : {
                    pickupDetails: {
                      recipient: {
                        displayName: order.customerName,
                        phoneNumber: order.customerPhone,
                      },
                      pickupAt: new Date(Date.now() + 15 * 60000).toISOString(),
                    },
                  }),
            },
          ],
          metadata: {
            source: 'eggok_online',
            order_number: order.orderNumber,
            order_type: order.orderType,
            note: orderNotes.slice(0, 255),
          },
        },
        idempotencyKey: `eggok-${order.orderNumber}`,
      });

      const squareOrderId = response.order?.id || '';
      console.log(`[SQUARE] Order synced: ${order.orderNumber} → Square ${squareOrderId}`);

      // Record external payment using Square's calculated total (avoids rounding mismatch)
      const squareTotal = response.order?.totalMoney?.amount;
      if (squareOrderId && squareTotal && squareTotal > 0n) {
        try {
          await client.payments.create({
            sourceId: 'EXTERNAL',
            idempotencyKey: `eggok-pay-${order.orderNumber}`,
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

      // Update fulfillment state (not order state)
      const updatedFulfillments = fulfillments.map((f: any) => ({
        uid: f.uid,
        type: f.type,
        state: fulfillmentState as any,
      }));

      await client.orders.update({
        orderId: squareOrderId,
        order: {
          locationId: creds.squareLocationId,
          version,
          fulfillments: updatedFulfillments,
        },
        idempotencyKey: `eggok-update-${squareOrderId}-${status}-${Date.now()}`,
      });

      console.log(`[SQUARE] Order ${squareOrderId} fulfillment → ${fulfillmentState}`);
      return true;
    } catch (err: any) {
      const message = err?.errors?.[0]?.detail || err?.message || 'Unknown error';
      console.error(`[SQUARE] Fulfillment update failed for ${squareOrderId}:`, message);
      return false;
    }
  }
}
