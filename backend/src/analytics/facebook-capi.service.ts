import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { SettingsService } from '../settings/settings.service';
import { Order } from '../orders/order.entity';

// Facebook Conversions API. Sends server-side events that the browser pixel
// can't reliably (ad blockers, iOS ITP, JS errors). When the same orderNumber
// is used as event_id here AND as eventID in the browser pixel's Purchase
// event, Facebook deduplicates so the conversion is counted once.

const GRAPH_VERSION = 'v18.0';

@Injectable()
export class FacebookCapiService {
  private readonly logger = new Logger('FacebookCapi');

  constructor(private readonly settingsService: SettingsService) {}

  private hash(value: string | null | undefined): string | undefined {
    if (!value) return undefined;
    const normalized = String(value).trim().toLowerCase();
    if (!normalized) return undefined;
    return createHash('sha256').update(normalized).digest('hex');
  }

  /**
   * Send a Purchase event for the given order. Best-effort — never throws into
   * the order flow; logs and returns. Caller doesn't need to await unless it
   * cares about the result.
   */
  async sendPurchase(order: Order, opts: { clientIp?: string; userAgent?: string } = {}): Promise<void> {
    try {
      const integrations = await this.settingsService.getSetting('integrations');
      const pixelId = integrations?.facebookPixelId;
      const accessToken = integrations?.facebookCapiToken;
      const status = integrations?.facebookPixelStatus;
      if (!pixelId || !accessToken || status !== 'connected') {
        return;
      }

      const [firstName, ...rest] = String(order.customerName || '').split(' ');
      const lastName = rest.join(' ');
      const phoneDigits = String(order.customerPhone || '').replace(/\D/g, '');

      const payload = {
        data: [{
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          event_id: order.orderNumber,
          action_source: 'website',
          event_source_url: 'https://eggsokpa.com/confirmation',
          user_data: {
            em: this.hash(order.customerEmail) ? [this.hash(order.customerEmail)] : undefined,
            ph: phoneDigits ? [this.hash(phoneDigits)] : undefined,
            fn: this.hash(firstName) ? [this.hash(firstName)] : undefined,
            ln: this.hash(lastName) ? [this.hash(lastName)] : undefined,
            client_ip_address: opts.clientIp || undefined,
            client_user_agent: opts.userAgent || undefined,
          },
          custom_data: {
            currency: 'USD',
            value: Number(order.total) || 0,
            content_ids: Array.isArray(order.items)
              ? (order.items as any[]).map(i => String(i.id)).filter(Boolean)
              : [],
            content_type: 'product',
            num_items: Array.isArray(order.items)
              ? (order.items as any[]).reduce((n, i) => n + (Number(i.quantity) || 0), 0)
              : 0,
            order_id: order.orderNumber,
          },
        }],
        access_token: accessToken,
      };

      const url = `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        this.logger.warn(`[CAPI] Purchase event for ${order.orderNumber} failed: ${res.status} ${body}`);
        return;
      }
      this.logger.log(`[CAPI] ✓ Purchase event sent for ${order.orderNumber}`);
    } catch (err: any) {
      this.logger.warn(`[CAPI] Purchase event for ${order.orderNumber} threw: ${err.message}`);
    }
  }
}
