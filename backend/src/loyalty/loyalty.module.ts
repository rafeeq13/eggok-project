import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { Reward } from './reward.entity';
import { Customer } from '../customers/customer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Reward, Customer])],
    controllers: [LoyaltyController],
    providers: [LoyaltyService],
    exports: [LoyaltyService],
})
export class LoyaltyModule { }
