import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../customers/customer.entity';
import { CustomerToken } from './customer-token.entity';
import { Reward } from '../loyalty/reward.entity';
import { AdminToken } from './admin-token.entity';
import { Order } from '../orders/order.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenGuard } from './token.guard';
import { AdminGuard } from './admin.guard';
import { SettingsModule } from '../settings/settings.module';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([Customer, CustomerToken, Reward, AdminToken]),
        SettingsModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, TokenGuard, AdminGuard],
    exports: [AuthService, TokenGuard, AdminGuard, TypeOrmModule],
})
export class AuthModule { }
