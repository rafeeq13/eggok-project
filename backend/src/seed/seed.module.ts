import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { Customer } from '../customers/customer.entity';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Promotion } from '../promotions/promotion.entity';
import { Reward } from '../loyalty/reward.entity';
import { User } from '../users/user.entity';
import { Transaction } from '../payments/transaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Customer,
            Order,
            Review,
            Promotion,
            Reward,
            User,
            Transaction,
        ]),
    ],
    controllers: [SeedController],
    providers: [SeedService],
})
export class SeedModule { }
