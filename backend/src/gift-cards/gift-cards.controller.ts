import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GiftCardsService } from './gift-cards.service';
import { AdminGuard } from '../auth/admin.guard';

@Controller('gift-cards')
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) {}

  // Buyer-facing: create a Stripe PaymentIntent for purchasing a gift card.
  @Post('create-payment-intent')
  createPurchaseIntent(@Body() body: {
    amount: number;
    recipientName: string;
    recipientEmail: string;
    senderName: string;
    senderEmail?: string;
    message?: string;
  }) {
    return this.giftCardsService.createPurchaseIntent(body);
  }

  // Post-payment fallback (in case the Stripe webhook is delayed). Idempotent
  // on paymentIntentId — webhook + this endpoint both safely produce the same card.
  @Post('issue-from-payment')
  async issue(@Body() body: { paymentIntentId: string }) {
    const card = await this.giftCardsService.issueFromPayment(body.paymentIntentId);
    return {
      success: true,
      code: card.code,
      amount: Number(card.initialBalance),
      recipientEmail: card.recipientEmail,
    };
  }

  // Public-ish: validate a code at checkout. Returns balance + how much would apply
  // to a given subtotal. Does NOT debit — that happens at order placement.
  @Post('validate')
  validate(@Body() body: { code: string; subtotal?: number }) {
    return this.giftCardsService.validateForCheckout(body.code, Number(body.subtotal) || 0);
  }

  // Admin
  @Get()
  @UseGuards(AdminGuard)
  list() {
    return this.giftCardsService.findAll();
  }

  @Get(':code')
  @UseGuards(AdminGuard)
  findOne(@Param('code') code: string) {
    return this.giftCardsService.findByCode(code);
  }
}
