import { Controller, Get, Put, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

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

  @Get(':key')
  getSetting(@Param('key') key: string) {
    return this.settingsService.getSetting(key);
  }

  @Put(':key')
  @UseGuards(AdminGuard)
  setSetting(@Param('key') key: string, @Body() value: any) {
    return this.settingsService.setSetting(key, value);
  }
}
