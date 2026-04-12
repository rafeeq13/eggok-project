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

      const response = await client.locations.get(settings.squareLocationId);
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
        const itemTotal = Math.round((item.price || 0) * (item.quantity || 1) * 100);
        const modTotal = (item.modifiers || []).reduce((sum: number, mod: any) => {
          return sum + Math.round((mod.price || 0) * (item.quantity || 1) * 100);
        }, 0);

        return {
          name: item.name || 'Item',
          quantity: String(item.quantity || 1),
          basePriceMoney: {
            amount: BigInt(itemTotal + modTotal),
            currency: 'USD' as const,
          },
          note: [
            ...(item.modifiers || []).map((m: any) => `+ ${m.name}`),
            item.specialInstructions ? `Note: ${item.specialInstructions}` : '',
          ].filter(Boolean).join('\n') || undefined,
        };
      });

      // Add delivery fee as a line item if present
      if (order.deliveryFee && order.deliveryFee > 0) {
        lineItems.push({
          name: 'Delivery Fee',
          quantity: '1',
          basePriceMoney: {
            amount: BigInt(Math.round(order.deliveryFee * 100)),
            currency: 'USD' as const,
          },
          note: undefined,
        });
      }

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
          serviceCharges: order.tip && order.tip > 0 ? [
            {
              name: 'Tip',
              amountMoney: {
                amount: BigInt(Math.round(order.tip * 100)),
                currency: 'USD' as const,
              },
            },
          ] : undefined,
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
   * Update order state in Square when status changes.
   */
  async updateOrderState(squareOrderId: string, status: string): Promise<boolean> {
    const creds = await this.getCredentials();
    if (!creds || !squareOrderId) return false;

    // Map our statuses to Square order fulfillment states
    const stateMap: Record<string, string> = {
      confirmed: 'RESERVED',
      preparing: 'PREPARED',
      ready: 'COMPLETED',
      out_for_delivery: 'COMPLETED',
      delivered: 'COMPLETED',
      picked_up: 'COMPLETED',
      cancelled: 'CANCELED',
    };

    const squareState = stateMap[status];
    if (!squareState) return false;

    try {
      const client = this.getClient(creds);

      // Get current order version for optimistic concurrency
      const currentOrder = await client.orders.get({ orderId: squareOrderId });
      const version = currentOrder.order?.version;

      await client.orders.update({
        orderId: squareOrderId,
        order: {
          locationId: creds.squareLocationId,
          state: squareState as any,
          version,
        },
        idempotencyKey: `eggok-update-${squareOrderId}-${status}-${Date.now()}`,
      });

      console.log(`[SQUARE] Order ${squareOrderId} state → ${squareState}`);
      return true;
    } catch (err: any) {
      const message = err?.errors?.[0]?.detail || err?.message || 'Unknown error';
      console.error(`[SQUARE] State update failed for ${squareOrderId}:`, message);
      return false;
    }
  }
}
