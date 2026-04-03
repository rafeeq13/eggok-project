import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';

const DEFAULT_HOURS = {
  monday: { open: '07:00', close: '21:00', isOpen: true },
  tuesday: { open: '07:00', close: '21:00', isOpen: true },
  wednesday: { open: '07:00', close: '21:00', isOpen: true },
  thursday: { open: '07:00', close: '21:00', isOpen: true },
  friday: { open: '07:00', close: '21:00', isOpen: true },
  saturday: { open: '08:00', close: '21:00', isOpen: true },
  sunday: { open: '08:00', close: '21:00', isOpen: true },
};

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) { }

  async onModuleInit() {
    const existing = await this.settingsRepository.findOne({ where: { key: 'business_hours' } });
    if (!existing) {
      await this.settingsRepository.save({
        key: 'business_hours',
        value: DEFAULT_HOURS,
      });
    }
  }

  async getBusinessHours(): Promise<any> {
    const setting = await this.settingsRepository.findOne({ where: { key: 'business_hours' } });
    return setting ? setting.value : DEFAULT_HOURS;
  }

  async updateBusinessHours(hours: any): Promise<any> {
    const setting = await this.settingsRepository.findOne({ where: { key: 'business_hours' } });
    if (setting) {
      setting.value = hours;
      await this.settingsRepository.save(setting);
    } else {
      await this.settingsRepository.save({ key: 'business_hours', value: hours });
    }
    return hours;
  }

  async isStoreOpen(): Promise<{ isOpen: boolean; message: string; hours: any }> {
    const hours = await this.getBusinessHours();
    const storeSettings = await this.getSetting('store');

    // Manual override check
    if (storeSettings && storeSettings.storeOpen === false) {
      return {
        isOpen: false,
        message: storeSettings.closedMessage || 'We are currently closed. Please check back during our business hours.',
        hours: null
      };
    }

    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[now.getDay()];
    const todayHours = hours[today];

    if (!todayHours || !todayHours.isOpen) {
      return { isOpen: false, message: 'Closed today', hours: todayHours };
    }

    const [openH, openM] = todayHours.open.split(':').map(Number);
    const [closeH, closeM] = todayHours.close.split(':').map(Number);
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;

    const isOpen = currentMins >= openMins && currentMins < closeMins;
    return {
      isOpen,
      message: isOpen
        ? `Open until ${todayHours.close}`
        : currentMins < openMins
          ? `Opens at ${todayHours.open}`
          : 'Closed for today',
      hours: todayHours,
    };
  }


  async getSetting(key: string): Promise<any> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: any): Promise<any> {
    const existing = await this.settingsRepository.findOne({ where: { key } });
    if (existing) {
      existing.value = value;
      await this.settingsRepository.save(existing);
    } else {
      await this.settingsRepository.save({ key, value });
    }
    return value;
  }
}