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

const DEFAULT_LOYALTY = {
  loyaltyEnabled: true,
  pointsPerDollar: 1,
  pointsExpiry: 12,
  signupBonus: 50,
  birthdayBonus: 100,
  minRedeemPoints: 100,
  referralBonus: 75,
};

const DEFAULT_STORE = {
  storeOpen: true,
  deliveryEnabled: true,
  pickupEnabled: true,
  pickupWait: 15,
  minOrder: 10,
  deliveryRadius: 5,
  deliveryFee: 3.99,
  taxRate: 0.08,
  storeName: 'Eggs Ok',
  storeAddress: '3517 Lancaster Ave, Philadelphia, PA 19104',
  storeLat: 39.9612,
  storeLng: -75.1832,
  storeTimezone: 'America/New_York',
  closedMessage: 'We are currently closed',
  storePhone: '',
  storeEmail: '',
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

    const loyaltyExisting = await this.settingsRepository.findOne({ where: { key: 'loyalty' } });
    if (!loyaltyExisting) {
      await this.settingsRepository.save({
        key: 'loyalty',
        value: DEFAULT_LOYALTY,
      });
    }

    const storeExisting = await this.settingsRepository.findOne({ where: { key: 'store' } });
    if (!storeExisting) {
      await this.settingsRepository.save({
        key: 'store',
        value: DEFAULT_STORE,
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
        message: storeSettings.closedMessage || 'Closed',
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


  async validateDeliveryAddress(lat: number, lng: number) {
    const deliverySettings = await this.getSetting('delivery_settings');
    const storeSettings = await this.getSetting('store');
    const zones = deliverySettings?.zones || [];
    const storeLat = storeSettings?.storeLat || parseFloat(process.env.STORE_LAT || '39.9612');
    const storeLng = storeSettings?.storeLng || parseFloat(process.env.STORE_LNG || '-75.1832');

    // Haversine distance in miles
    const R = 3958.8;
    const dLat = (lat - storeLat) * Math.PI / 180;
    const dLng = (lng - storeLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(storeLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const matchingZone = zones
      .filter((z: any) => z.active && distance <= z.radiusMiles)
      .sort((a: any, b: any) => a.radiusMiles - b.radiusMiles)[0];

    if (matchingZone) {
      return {
        eligible: true,
        distance: Math.round(distance * 10) / 10,
        zone: matchingZone.name,
        deliveryFee: matchingZone.deliveryFee,
        minOrder: matchingZone.minOrder,
        estimatedMinutes: matchingZone.estimatedMinutes,
      };
    }

    return {
      eligible: false,
      distance: Math.round(distance * 10) / 10,
      zone: null,
      deliveryFee: 0,
      minOrder: 0,
      estimatedMinutes: 0,
    };
  }

  async getSetting(key: string): Promise<any> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    if (!setting) {
      if (key === 'loyalty') return DEFAULT_LOYALTY;
      if (key === 'store') return DEFAULT_STORE;
      return null;
    }
    return setting.value;
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