import { Module, forwardRef } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { PaymentsModule } from '../payments/payments.module';
import { OrdersModule } from '../orders/orders.module';
import { SquareModule } from '../square/square.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    forwardRef(() => PaymentsModule),
    forwardRef(() => OrdersModule),
    SquareModule,
    SettingsModule,
  ],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
