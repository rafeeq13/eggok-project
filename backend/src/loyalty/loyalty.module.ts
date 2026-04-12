import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { Reward } from './reward.entity';
import { Customer } from '../customers/customer.entity';
import { SettingsModule } from '../settings/settings.module';

@Module({
    imports: [TypeOrmModule.forFeature([Reward, Customer]), SettingsModule],
    controllers: [LoyaltyController],
    providers: [LoyaltyService],
    exports: [LoyaltyService],
})
export class LoyaltyModule { }
