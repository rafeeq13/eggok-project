import { Global, Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { SquareService } from './square.service';

@Global()
@Module({
  imports: [SettingsModule],
  providers: [SquareService],
  exports: [SquareService],
})
export class SquareModule {}
