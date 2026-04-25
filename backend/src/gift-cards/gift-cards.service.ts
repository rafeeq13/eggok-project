import { BadRequestException, Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { GiftCard } from './gift-card.entity';
import { GiftCardRedemption } from './gift-card-redemption.entity';
import { PaymentsService } from '../payments/payments.service';
import { MailService } from '../mail/mail.service';

const MIN_AMOUNT = 5;
const MAX_AMOUNT = 500;
const STRIPE_MIN_CHARGE_CENTS = 50;

@Injectable()
export class GiftCardsService {
  private readonly logger = new Logger('GiftCardsService');

  constructor(
    @InjectRepository(GiftCard)
    private readonly giftCardsRepo: Repository<GiftCard>,
    @InjectRepository(GiftCardRedemption)
    private readonly redemptionsRepo: Repository<GiftCardRedemption>,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    private readonly mailService: MailService,
  ) {}

  // ────────────────────────────────────────────────────────────
  // Code generation
  // ────────────────────────────────────────────────────────────

  /**
   * Generate a 12-character base32-style code, formatted as GC-XXXX-XXXX-XXXX.
   * Avoids 0/O/1/I/L to prevent recipient typos when retyping at checkout.
   */
  private generateCode(): string {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const bytes = randomBytes(12);
    let raw = '';
    for (let i = 0; i < 12; i++) raw += alphabet[bytes[i] % alphabet.length];
    return `GC-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
  }

  private async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = this.generateCode();
      const exists = await this.giftCardsRepo.findOne({ where: { code } });
      if (!exists) return code;
    }
    throw new Error('Failed to generate unique gift card code after 5 attempts');
  }

  // ────────────────────────────────────────────────────────────
  // Purchase — Stripe PaymentIntent for buying a gift card
  // ────────────────────────────────────────────────────────────

  async createPurchaseIntent(payload: {
    amount: number;
    recipientName: string;
    recipientEmail: string;
    senderName: string;
    senderEmail?: string;
    message?: string;
  }): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      throw new BadRequestException(`Gift card amount must be between $${MIN_AMOUNT} and $${MAX_AMOUNT}.`);
    }
    if (!payload.recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.recipientEmail)) {
      throw new BadRequestException('Valid recipient email is required.');
    }
    if (!payload.recipientName?.trim()) throw new BadRequestException('Recipient name is required.');
    if (!payload.senderName?.trim()) throw new BadRequestException('Sender name is required.');

    const stripe = await this.paymentsService.getStripe();
    if (!stripe) {
      throw new BadRequestException('Stripe is not configured. Add your secret key in Admin → Integrations.');
    }

    const amountCents = Math.round(amount * 100);
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      payment_method_types: ['card'],
      // The webhook handler in PaymentsController branches on metadata.type to know
      // whether to create an order or to issue a gift card.
      metadata: {
        type: 'gift_card',
        gc_amount: String(amount),
        gc_recipient_name: payload.recipientName.slice(0, 200),
        gc_recipient_email: payload.recipientEmail.slice(0, 200),
        gc_sender_name: payload.senderName.slice(0, 200),
        gc_sender_email: (payload.senderEmail || '').slice(0, 200),
        gc_message: (payload.message || '').slice(0, 450),
      },
      receipt_email: payload.senderEmail || payload.recipientEmail,
      description: `Eggs Ok Gift Card $${amount.toFixed(2)} for ${payload.recipientName}`,
    });

    return { clientSecret: intent.client_secret!, paymentIntentId: intent.id };
  }

  /**
   * Issue (create) the actual gift card row from a confirmed Stripe payment.
   * Idempotent on paymentIntentId — webhook + post-payment fallback both call this safely.
   */
  async issueFromPayment(paymentIntentId: string): Promise<GiftCard> {
    if (!paymentIntentId) throw new BadRequestException('paymentIntentId is required');

    const existing = await this.giftCardsRepo.findOne({ where: { paymentIntentId } });
    if (existing) return existing;

    const stripe = await this.paymentsService.getStripe();
    if (!stripe) throw new BadRequestException('Stripe is not configured.');

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      throw new BadRequestException(`Gift card payment not yet succeeded (status: ${pi.status})`);
    }
    if (pi.metadata?.type !== 'gift_card') {
      throw new BadRequestException('PaymentIntent is not a gift card purchase');
    }

    const amount = Number(pi.metadata.gc_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Invalid gift card amount in PaymentIntent metadata');
    }

    const code = await this.generateUniqueCode();
    const card = this.giftCardsRepo.create({
      code,
      paymentIntentId,
      initialBalance: amount,
      remainingBalance: amount,
      status: 'active',
      recipientName: pi.metadata.gc_recipient_name || null,
      recipientEmail: pi.metadata.gc_recipient_email || null,
      senderName: pi.metadata.gc_sender_name || null,
      senderEmail: pi.metadata.gc_sender_email || null,
      message: pi.metadata.gc_message || null,
      expiresAt: null,
    });
    const saved = await this.giftCardsRepo.save(card);
    this.logger.log(`[GIFT-CARD] ✓ Issued ${code} for $${amount} (PI: ${paymentIntentId})`);

    // Side-effects (best-effort, never block issuance)
    this.mailService.sendGiftCardIssuedEmail(saved).catch(err => {
      this.logger.error(`[GIFT-CARD] Failed to send recipient email for ${code}: ${err.message}`);
    });
    this.paymentsService.recordTransaction({
      orderNumber: `GC-${saved.id.toString().padStart(6, '0')}`,
      customer: saved.senderName || 'Gift card buyer',
      type: 'Gift Card',
      orderTotal: Number(saved.initialBalance),
      deliveryFee: 0,
      tip: 0,
      paymentIntentId,
    }).catch(err => {
      this.logger.error(`[GIFT-CARD] Failed to record transaction for ${code}: ${err.message}`);
    });

    return saved;
  }

  // ────────────────────────────────────────────────────────────
  // Lookups
  // ────────────────────────────────────────────────────────────

  private normalizeCode(input: string): string {
    return String(input || '').trim().toUpperCase().replace(/\s+/g, '');
  }

  async findByCode(rawCode: string): Promise<GiftCard | null> {
    const code = this.normalizeCode(rawCode);
    if (!code) return null;
    return this.giftCardsRepo.findOne({ where: { code } });
  }

  async findAll(): Promise<GiftCard[]> {
    return this.giftCardsRepo.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Look up a code and report its usable balance for a given subtotal.
   * Returns a structured result the checkout page can render directly.
   */
  async validateForCheckout(rawCode: string, subtotal: number): Promise<{
    valid: boolean;
    code?: string;
    balance?: number;
    appliedAmount?: number;
    message: string;
  }> {
    const code = this.normalizeCode(rawCode);
    if (!code.startsWith('GC-')) {
      return { valid: false, message: 'Not a gift card code' };
    }

    const card = await this.findByCode(code);
    if (!card) return { valid: false, message: 'Gift card not found' };

    if (card.status === 'cancelled') return { valid: false, message: 'This gift card has been cancelled' };
    if (card.status === 'expired') return { valid: false, message: 'This gift card has expired' };
    if (card.expiresAt && card.expiresAt < new Date().toISOString().slice(0, 10)) {
      return { valid: false, message: 'This gift card has expired' };
    }

    const remaining = Number(card.remainingBalance);
    if (remaining <= 0) return { valid: false, message: 'This gift card has no remaining balance' };

    const sub = Number(subtotal) || 0;
    const applied = sub > 0 ? Math.min(remaining, sub) : remaining;
    return {
      valid: true,
      code: card.code,
      balance: remaining,
      appliedAmount: Number(applied.toFixed(2)),
      message: `Gift card applied — $${applied.toFixed(2)} of $${remaining.toFixed(2)} balance`,
    };
  }

  // ────────────────────────────────────────────────────────────
  // Redemption — atomic debit at checkout time
  // ────────────────────────────────────────────────────────────

  /**
   * Atomically debit `requestedAmount` from the gift card and write a redemption row.
   * Idempotent on (giftCardId, orderNumber): a second call for the same order returns
   * the prior redemption without double-debiting. Uses SELECT … FOR UPDATE so two
   * concurrent checkouts can't both spend the last dollar.
   */
  async redeem(params: {
    code: string;
    requestedAmount: number;
    orderNumber: string;
  }): Promise<{ redeemedAmount: number; remainingBalance: number }> {
    const code = this.normalizeCode(params.code);
    const requested = Number(params.requestedAmount);
    if (!code) throw new BadRequestException('Gift card code is required');
    if (!params.orderNumber) throw new BadRequestException('orderNumber is required for redemption');
    if (!Number.isFinite(requested) || requested <= 0) {
      throw new BadRequestException('Redemption amount must be positive');
    }

    return this.dataSource.transaction(async (manager) => {
      const card = await manager
        .getRepository(GiftCard)
        .createQueryBuilder('gc')
        .setLock('pessimistic_write')
        .where('gc.code = :code', { code })
        .getOne();

      if (!card) throw new BadRequestException('Gift card not found');
      if (card.status === 'cancelled') throw new BadRequestException('Gift card has been cancelled');
      if (card.status === 'expired') throw new BadRequestException('Gift card has expired');

      // Idempotency: if we already redeemed for this order, return that result.
      const prior = await manager.getRepository(GiftCardRedemption).findOne({
        where: { giftCardId: card.id, orderNumber: params.orderNumber, type: 'redeemed' },
      });
      if (prior) {
        return {
          redeemedAmount: Number(prior.amount),
          remainingBalance: Number(card.remainingBalance),
        };
      }

      const remaining = Number(card.remainingBalance);
      if (remaining <= 0) throw new BadRequestException('Gift card has no remaining balance');

      const debit = Math.min(remaining, requested);
      const newRemaining = Number((remaining - debit).toFixed(2));

      await manager.getRepository(GiftCardRedemption).save(
        manager.getRepository(GiftCardRedemption).create({
          giftCardId: card.id,
          orderNumber: params.orderNumber,
          amount: debit,
          type: 'redeemed',
        }),
      );

      await manager.getRepository(GiftCard).update(card.id, {
        remainingBalance: newRemaining,
        status: newRemaining === 0 ? 'used' : 'active',
      });

      this.logger.log(`[GIFT-CARD] ${code} debited $${debit.toFixed(2)} for ${params.orderNumber} (remaining $${newRemaining.toFixed(2)})`);
      return { redeemedAmount: debit, remainingBalance: newRemaining };
    });
  }

  /**
   * Refund a redemption back onto the card (e.g. order was cancelled).
   * Idempotent on (giftCardId, orderNumber, type='refunded').
   */
  async refundRedemption(orderNumber: string): Promise<void> {
    if (!orderNumber) return;

    await this.dataSource.transaction(async (manager) => {
      const debit = await manager.getRepository(GiftCardRedemption).findOne({
        where: { orderNumber, type: 'redeemed' },
      });
      if (!debit) return; // nothing to refund

      const alreadyRefunded = await manager.getRepository(GiftCardRedemption).findOne({
        where: { orderNumber, type: 'refunded' },
      });
      if (alreadyRefunded) return;

      const card = await manager
        .getRepository(GiftCard)
        .createQueryBuilder('gc')
        .setLock('pessimistic_write')
        .where('gc.id = :id', { id: debit.giftCardId })
        .getOne();
      if (!card) return;

      const newRemaining = Number((Number(card.remainingBalance) + Number(debit.amount)).toFixed(2));

      await manager.getRepository(GiftCardRedemption).save(
        manager.getRepository(GiftCardRedemption).create({
          giftCardId: card.id,
          orderNumber,
          amount: debit.amount,
          type: 'refunded',
        }),
      );

      await manager.getRepository(GiftCard).update(card.id, {
        remainingBalance: newRemaining,
        status: card.status === 'used' ? 'active' : card.status,
      });

      this.logger.log(`[GIFT-CARD] ${card.code} refunded $${Number(debit.amount).toFixed(2)} for cancelled ${orderNumber}`);
    });
  }

  // ────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────

  static get STRIPE_MIN_CHARGE_CENTS() {
    return STRIPE_MIN_CHARGE_CENTS;
  }
}
