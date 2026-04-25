import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftCard } from './gift-card.entity';
import { GiftCardRedemption } from './gift-card-redemption.entity';
import { GiftCardsService } from './gift-cards.service';
import { GiftCardsController } from './gift-cards.controller';
import { PaymentsModule } from '../payments/payments.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([GiftCard, GiftCardRedemption]),
    forwardRef(() => PaymentsModule),
  ],
  controllers: [GiftCardsController],
  providers: [GiftCardsService],
  exports: [GiftCardsService],
})
export class GiftCardsModule {}
