import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

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

  @Get(':key')
  getSetting(@Param('key') key: string) {
    return this.settingsService.getSetting(key);
  }

  @Put(':key')
  setSetting(@Param('key') key: string, @Body() value: any) {
    return this.settingsService.setSetting(key, value);
  }
}
