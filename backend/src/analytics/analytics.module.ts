import { Module, Global } from '@nestjs/common';
import { FacebookCapiService } from './facebook-capi.service';
import { SettingsModule } from '../settings/settings.module';

@Global()
@Module({
  imports: [SettingsModule],
  providers: [FacebookCapiService],
  exports: [FacebookCapiService],
})
export class AnalyticsModule {}
