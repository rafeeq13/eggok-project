import { Controller, Get, Put, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { SettingsService } from './settings.service';
import { AdminGuard } from '../auth/admin.guard';
import { SquareService } from '../square/square.service';
import { DeliveryService } from '../delivery/delivery.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly squareService: SquareService,
    private readonly deliveryService: DeliveryService,
  ) { }

  @Get('hours')
  getBusinessHours() {
    return this.settingsService.getBusinessHours();
  }

  @Put('hours')
  @UseGuards(AdminGuard)
  updateBusinessHours(@Body() hours: any) {
    return this.settingsService.updateBusinessHours(hours);
  }

  @Get('status')
  isStoreOpen() {
    return this.settingsService.isStoreOpen();
  }

  @Post('validate-delivery')
  validateDelivery(@Body() body: { lat: number; lng: number }) {
    return this.settingsService.validateDeliveryAddress(body.lat, body.lng);
  }

  @Post('test-connection/square')
  @UseGuards(AdminGuard)
  testSquare() {
    return this.squareService.testConnection();
  }

  @Post('test-connection/uberdirect')
  @UseGuards(AdminGuard)
  async testUberDirect() {
    try {
      const available = await this.deliveryService.isAvailable();
      if (!available) {
        return { success: false, message: 'Missing Uber Direct credentials or not marked as connected' };
      }
      // Try to get an OAuth token to verify credentials work
      const settings = await this.settingsService.getSetting('integrations');
      const res = await fetch('https://login.uber.com/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: settings.uberDirectClientId,
          client_secret: settings.uberDirectClientSecret,
          grant_type: 'client_credentials',
          scope: 'eats.deliveries',
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        return { success: false, message: `Authentication failed: ${err}` };
      }
      return { success: true, message: 'Connected to Uber Direct' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection failed' };
    }
  }

  @Post('test-connection/stripe')
  @UseGuards(AdminGuard)
  async testStripe() {
    try {
      const settings = await this.settingsService.getSetting('integrations');
      if (!settings?.stripeSecretKey) {
        return { success: false, message: 'Missing Stripe secret key' };
      }
      const Stripe = require('stripe');
      const stripe = new Stripe(settings.stripeSecretKey);
      const account = await stripe.accounts.retrieve();
      return { success: true, message: `Connected to ${account.business_profile?.name || 'Stripe account'}` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection failed' };
    }
  }

  @Get(':key')
  async getSetting(@Param('key') key: string, @Req() req: Request) {
    const value = await this.settingsService.getSetting(key);
    // Strip secrets from integrations for unauthenticated requests
    if (key === 'integrations' && value) {
      const authHeader = req.headers['authorization'];
      const hasAdminAuth = authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 7;
      if (!hasAdminAuth) {
        // Only expose public-safe keys (e.g. Google Maps key, publishable keys)
        const { googleMapsKey, googleMapsStatus, stripePublishableKey, squareAppId } = value;
        return { googleMapsKey, googleMapsStatus, stripePublishableKey, squareAppId };
      }
    }
    return value;
  }

  @Put(':key')
  @UseGuards(AdminGuard)
  setSetting(@Param('key') key: string, @Body() value: any) {
    return this.settingsService.setSetting(key, value);
  }
}
