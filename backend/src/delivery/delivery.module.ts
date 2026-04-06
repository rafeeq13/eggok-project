import { Global, Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { DeliveryService } from './delivery.service';

@Global()
@Module({
  imports: [SettingsModule],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
