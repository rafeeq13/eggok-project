import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { SettingsModule } from './settings/settings.module';
import { MailModule } from './mail/mail.module';
import { CustomersModule } from './customers/customers.module';
import { PromotionsModule } from './promotions/promotions.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from './auth/auth.module';
import { DeliveryModule } from './delivery/delivery.module';
import { SquareModule } from './square/square.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { GiftCardsModule } from './gift-cards/gift-cards.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config: any = {
          type: 'mysql',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 3306),
          username: configService.get<string>('DB_USERNAME', 'root'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_DATABASE', 'eggok'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<string>('NODE_ENV', 'development') !== 'production',
          logging: false,
        };
        const socketPath = configService.get<string>('DB_SOCKET');
        if (socketPath) {
          config.extra = { socketPath };
        }
        return config;
      },
      inject: [ConfigService],
    }),
    MenuModule,
    OrdersModule,
    SettingsModule,
    MailModule,
    CustomersModule,
    PromotionsModule,
    LoyaltyModule,
    ReviewsModule,
    UsersModule,
    PaymentsModule,
    SeedModule,
    AuthModule,
    DeliveryModule,
    SquareModule,
    SubmissionsModule,
    WebhooksModule,
    GiftCardsModule,
    AuditLogsModule,
    AnalyticsModule,
  ],
})

export class AppModule { }