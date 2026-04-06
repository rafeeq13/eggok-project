import { Injectable } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

type UberDirectCreds = {
  uberDirectCustomerId: string;
  uberDirectClientId: string;
  uberDirectClientSecret: string;
  uberDirectEnvironment: string;
  uberDirectStatus: string;
};

type DeliveryQuote = {
  provider: string;
  quoteId: string;
  fee: number;
  eta: string;
  trackingUrl: string;
};

type DeliveryStatus = {
  status: string;
  driverName?: string;
  driverPhone?: string;
  eta?: string;
  trackingUrl?: string;
};

@Injectable()
export class DeliveryService {
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(private readonly settingsService: SettingsService) {}

  private async getIntegrationSettings(): Promise<UberDirectCreds | null> {
    const settings = await this.settingsService.getSetting('integrations');
    if (!settings?.uberDirectClientId || !settings?.uberDirectClientSecret) {
      return null;
    }
    if (settings.uberDirectStatus !== 'connected') {
      return null;
    }
    return settings as UberDirectCreds;
  }

  private getBaseUrl(env: string): string {
    return env === 'production'
      ? 'https://api.uber.com'
      : 'https://sandbox-api.uber.com';
  }

  private async getAccessToken(creds: UberDirectCreds): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const res = await fetch('https://login.uber.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: creds.uberDirectClientId,
        client_secret: creds.uberDirectClientSecret,
        grant_type: 'client_credentials',
        scope: 'eats.deliveries',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[UBER] Token fetch failed:', err);
      throw new Error('Failed to authenticate with Uber Direct');
    }

    const data = await res.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken!;
  }

  async isAvailable(): Promise<boolean> {
    const creds = await this.getIntegrationSettings();
    return creds !== null;
  }

  async createDelivery(order: {
    id: number;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryApt?: string;
    deliveryInstructions?: string;
    items: any[];
    total: number;
  }): Promise<DeliveryQuote | null> {
    const creds = await this.getIntegrationSettings();
    if (!creds) {
      console.log('[DELIVERY] Uber Direct not configured, skipping dispatch');
      return null;
    }

    try {
      const token = await this.getAccessToken(creds);
      const baseUrl = this.getBaseUrl(creds.uberDirectEnvironment);

      const itemsList = (order.items || []).map((item: any) => ({
        name: item.name || 'Item',
        quantity: item.quantity || 1,
        price: Math.round((item.price || 0) * 100),
      }));

      const payload = {
        pickup_name: 'Eggs Ok',
        pickup_address: '3517 Lancaster Ave, Philadelphia, PA 19104',
        pickup_phone_number: '+12155550100',
        dropoff_name: order.customerName,
        dropoff_address: order.deliveryAddress,
        dropoff_phone_number: order.customerPhone.startsWith('+') ? order.customerPhone : `+1${order.customerPhone.replace(/\D/g, '')}`,
        dropoff_notes: [order.deliveryApt, order.deliveryInstructions].filter(Boolean).join(' - ') || undefined,
        manifest_items: itemsList,
        manifest_total_value: Math.round(order.total * 100),
        external_id: order.orderNumber,
      };

      console.log(`[UBER] Creating delivery for order ${order.orderNumber}`);

      const res = await fetch(`${baseUrl}/v1/customers/${creds.uberDirectCustomerId}/deliveries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[UBER] Delivery creation failed (${res.status}):`, errText);
        throw new Error(`Uber Direct API error: ${res.status}`);
      }

      const delivery = await res.json();
      console.log(`[UBER] Delivery created: ${delivery.id}, tracking: ${delivery.tracking_url}`);

      return {
        provider: 'uber_direct',
        quoteId: delivery.id,
        fee: delivery.fee ? delivery.fee / 100 : 0,
        eta: delivery.dropoff_eta || '',
        trackingUrl: delivery.tracking_url || '',
      };
    } catch (err) {
      console.error('[UBER] Dispatch failed:', err);
      throw err;
    }
  }

  async getDeliveryStatus(quoteId: string): Promise<DeliveryStatus | null> {
    const creds = await this.getIntegrationSettings();
    if (!creds || !quoteId) return null;

    try {
      const token = await this.getAccessToken(creds);
      const baseUrl = this.getBaseUrl(creds.uberDirectEnvironment);

      const res = await fetch(`${baseUrl}/v1/customers/${creds.uberDirectCustomerId}/deliveries/${quoteId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) return null;

      const delivery = await res.json();
      return {
        status: delivery.status,
        driverName: delivery.courier?.name || undefined,
        driverPhone: delivery.courier?.phone_number || undefined,
        eta: delivery.dropoff_eta || undefined,
        trackingUrl: delivery.tracking_url || undefined,
      };
    } catch {
      return null;
    }
  }

  async cancelDelivery(quoteId: string): Promise<boolean> {
    const creds = await this.getIntegrationSettings();
    if (!creds || !quoteId) return false;

    try {
      const token = await this.getAccessToken(creds);
      const baseUrl = this.getBaseUrl(creds.uberDirectEnvironment);

      const res = await fetch(`${baseUrl}/v1/customers/${creds.uberDirectCustomerId}/deliveries/${quoteId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      return res.ok;
    } catch {
      return false;
    }
  }
}
