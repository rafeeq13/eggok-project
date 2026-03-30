import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('hours')
  getBusinessHours() {
    return this.settingsService.getBusinessHours();
  }

  @Put('hours')
  updateBusinessHours(@Body() hours: any) {
    return this.settingsService.updateBusinessHours(hours);
  }

  @Get('status')
  isStoreOpen() {
    return this.settingsService.isStoreOpen();
  }
}