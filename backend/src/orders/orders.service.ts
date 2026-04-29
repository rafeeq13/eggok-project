import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, LessThan, MoreThan } from 'typeorm';
import { Order } from './order.entity';
import { Customer } from '../customers/customer.entity';
import { MailService } from '../mail/mail.service';
import { DeliveryService } from '../delivery/delivery.service';
import { PaymentsService } from '../payments/payments.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { SquareService } from '../square/square.service';
import { GiftCardsService } from '../gift-cards/gift-cards.service';
import { SettingsService } from '../settings/settings.service';
import { FacebookCapiService } from '../analytics/facebook-capi.service';

// Valid state transitions the order state machine
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['sent_to_kitchen', 'confirmed', 'preparing', 'cancelled'],
  sent_to_kitchen: ['confirmed', 'preparing', 'cancelled'],
  // Legacy statuses for backward compatibility
  pending: ['confirmed', 'preparing', 'paid', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['out_for_delivery', 'picked_up', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  picked_up: [],
  cancelled: [],
};

const SQUARE_MAX_SYNC_ATTEMPTS = 100; // ~50 min of attempts before pausing
const SQUARE_SYNC_INTERVAL_MS = 30_000; // 30 seconds
const SQUARE_RESCUE_INTERVAL_MS = 5 * 60_000; // 5 minutes — re-queue failed orders
const SQUARE_RESCUE_MAX_AGE_MS = 72 * 60 * 60_000; // give up only after 3 days

// Unpaid order lifecycle: rows exist only so we can attach the orderNumber to a Stripe
// PaymentIntent. They're invisible to admin/customer until payment confirms, and any
// order that doesn't pay within this window is purged so abandoned carts leave no trace.
const UNPAID_STATUSES = ['pending_payment', 'pending'] as const;
const ABANDONED_ORDER_TTL_MS = 30 * 60_000; // 30 minutes
const ABANDONED_CLEANUP_INTERVAL_MS = 5 * 60_000; // sweep every 5 minutes

@Injectable()
export class OrdersService {
  private readonly logger = new Logger('OrdersService');
  private squareSyncTimer: ReturnType<typeof setInterval> | null = null;
  private squareRescueTimer: ReturnType<typeof setInterval> | null = null;
  private abandonedCleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private mailService: MailService,
    private deliveryService: DeliveryService,
    @Inject(forwardRef(() => PaymentsService))
    private paymentsService: PaymentsService,
    private loyaltyService: LoyaltyService,
    private squareService: SquareService,
    private giftCardsService: GiftCardsService,
    private settingsService: SettingsService,
    private facebookCapi: FacebookCapiService,
  ) {
    // Start background workers on service init
    this.startSquareSyncWorker();
    this.startAbandonedOrderCleanup();
  }

  /**
   * Periodically delete unpaid orders older than the abandonment TTL. These rows only
   * exist to attach an orderNumber to a Stripe PaymentIntent — if payment never confirms,
   * we don't want them lingering in the DB or showing up anywhere.
   */
  private startAbandonedOrderCleanup() {
    this.abandonedCleanupTimer = setInterval(() => {
      this.cleanupAbandonedOrders().catch(err => {
        this.logger.error(`[ORDER CLEANUP] Unexpected error: ${err.message}`);
      });
    }, ABANDONED_CLEANUP_INTERVAL_MS);
  }

  private async cleanupAbandonedOrders() {
    const cutoff = new Date(Date.now() - ABANDONED_ORDER_TTL_MS);
    const result = await this.ordersRepository
      .createQueryBuilder()
      .delete()
      .where('status IN (:...statuses)', { statuses: UNPAID_STATUSES })
      .andWhere('createdAt < :cutoff', { cutoff })
      .execute();
    if ((result.affected || 0) > 0) {
      this.logger.log(`[ORDER CLEANUP] Purged ${result.affected} abandoned unpaid order(s) older than ${ABANDONED_ORDER_TTL_MS / 60_000}m`);
    }
  }

  // ──────────────────────────────────────────────
  // Square Sync Worker (DB-backed queue)
  // ──────────────────────────────────────────────

  private startSquareSyncWorker() {
    this.squareSyncTimer = setInterval(() => {
      this.processSquareSyncQueue().catch(err => {
        this.logger.error(`[SQUARE WORKER] Unexpected error: ${err.message}`);
      });
    }, SQUARE_SYNC_INTERVAL_MS);
    this.squareRescueTimer = setInterval(() => {
      this.rescueFailedSquareSyncs().catch(err => {
        this.logger.error(`[SQUARE RESCUE] Unexpected error: ${err.message}`);
      });
    }, SQUARE_RESCUE_INTERVAL_MS);
    this.logger.log('[SQUARE WORKER] Started pending sync every 30s, failed-rescue every 5m');
  }

  /**
   * Re-queue orders that exhausted their attempt budget but are still recent.
   * Resets attempt counter so the main worker picks them up again. Square API
   * outages can last hours; this prevents an order from being permanently stuck
   * when it's only the API that was temporarily failing.
   */
  private async rescueFailedSquareSyncs() {
    const cutoff = new Date(Date.now() - SQUARE_RESCUE_MAX_AGE_MS);
    const result = await this.ordersRepository
      .createQueryBuilder()
      .update()
      .set({ squareSyncStatus: 'pending', squareSyncAttempts: 0 })
      .where('squareSyncStatus = :failed', { failed: 'failed' })
      .andWhere('createdAt >= :cutoff', { cutoff })
      .andWhere('status IN (:...statuses)', {
        statuses: ['paid', 'sent_to_kitchen', 'confirmed', 'preparing', 'ready', 'out_for_delivery'],
      })
      .execute();
    if ((result.affected || 0) > 0) {
      this.logger.log(`[SQUARE RESCUE] Re-queued ${result.affected} failed order(s) for retry`);
    }
  }

  /**
   * Process all orders that need Square sync.
   * Picks orders where: paymentIntentId exists (payment confirmed), squareSyncStatus = 'pending', attempts < max.
   */
  private async processSquareSyncQueue() {
    const pendingOrders = await this.ordersRepository.find({
      where: {
        squareSyncStatus: 'pending',
        squareSyncAttempts: LessThan(SQUARE_MAX_SYNC_ATTEMPTS),
        // Only sync orders that have been paid (have paymentIntentId or are in paid+ status)
        status: In(['paid', 'sent_to_kitchen', 'confirmed', 'preparing', 'ready', 'out_for_delivery']),
      },
      order: { createdAt: 'ASC' },
      take: 10, // Process in batches
    });

    for (const order of pendingOrders) {
      await this.attemptSquareSync(order);
    }
  }

  private async attemptSquareSync(order: Order) {
    const attempt = order.squareSyncAttempts + 1;
    this.logger.log(`[SQUARE WORKER] Syncing ${order.orderNumber} (attempt ${attempt}/${SQUARE_MAX_SYNC_ATTEMPTS})`);

    try {
      const result = await this.squareService.syncOrder({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        orderType: order.orderType,
        items: order.items,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        deliveryFee: Number(order.deliveryFee),
        tip: Number(order.tip) || 0,
        discount: Number(order.discount) || 0,
        promoCode: order.promoCode || undefined,
        total: Number(order.total),
        deliveryAddress: order.deliveryAddress,
        notes: order.notes,
        scheduleType: order.scheduleType,
        scheduledDate: order.scheduledDate || undefined,
        scheduledTime: order.scheduledTime || undefined,
      });

      if (result?.squareOrderId) {
        await this.ordersRepository.update(order.id, {
          squareOrderId: result.squareOrderId,
          squareSyncStatus: 'synced',
          squareSyncAttempts: attempt,
          squareSyncLastError: undefined,
          status: order.status === 'paid' ? 'sent_to_kitchen' : order.status,
        });

        this.logger.log(`[SQUARE WORKER] ✓ ${order.orderNumber} synced → Square ${result.squareOrderId}`);

        // Push to Square Terminal (non-blocking)
        this.squareService.createTerminalCheckout({
          squareOrderId: result.squareOrderId,
          orderNumber: order.orderNumber,
          total: Number(order.total),
          note: `${order.orderType === 'delivery' ? 'DELIVERY' : 'PICKUP'} - ${order.customerName}`,
        }).catch(err => {
          this.logger.error(`[SQUARE WORKER] Terminal push failed for ${order.orderNumber}: ${err?.message}`);
        });
      } else {
        // Square returned null (not configured or unknown error)
        await this.ordersRepository.update(order.id, {
          squareSyncAttempts: attempt,
          squareSyncLastError: 'Square returned null may not be configured',
          squareSyncStatus: attempt >= SQUARE_MAX_SYNC_ATTEMPTS ? 'failed' : 'pending',
        });
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Unknown error';
      const isFinal = attempt >= SQUARE_MAX_SYNC_ATTEMPTS;

      await this.ordersRepository.update(order.id, {
        squareSyncAttempts: attempt,
        squareSyncLastError: errorMsg.slice(0, 500),
        squareSyncStatus: isFinal ? 'failed' : 'pending',
      });

      if (isFinal) {
        this.logger.error(`[SQUARE WORKER] ✗ ${order.orderNumber} PERMANENTLY FAILED after ${attempt} attempts: ${errorMsg}`);
      } else {
        this.logger.warn(`[SQUARE WORKER] ${order.orderNumber} attempt ${attempt} failed: ${errorMsg}`);
      }
    }
  }

  // ──────────────────────────────────────────────
  // Order Number Generation
  // ──────────────────────────────────────────────

  private async generateOrderNumber(): Promise<string> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const last = await this.ordersRepository
        .createQueryBuilder('order')
        .orderBy('order.id', 'DESC')
        .getOne();
      const next = (last ? last.id + 1 : 1) + attempt;
      const orderNumber = `EO-${next.toString().padStart(4, '0')}`;
      const exists = await this.ordersRepository.findOne({ where: { orderNumber } });
      if (!exists) return orderNumber;
    }
    return `EO-${Date.now().toString().slice(-6)}`;
  }

  // ──────────────────────────────────────────────
  // Customer Upsert
  // ──────────────────────────────────────────────

  private async upsertCustomer(data: {
    name: string;
    email: string;
    phone: string;
    total: number;
    orderNumber: string;
  }): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.customersRepository.findOne({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      await this.customersRepository
        .createQueryBuilder()
        .update()
        .set({
          totalOrders: () => '`totalOrders` + 1',
          totalSpent: () => `\`totalSpent\` + ${Number(data.total)}`,
          lastOrder: today,
          lastActivity: today,
          name: existing.name || data.name,
          phone: existing.phone || data.phone,
        })
        .where('id = :id', { id: existing.id })
        .execute();
    } else {
      const newCustomer = this.customersRepository.create({
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        totalOrders: 1,
        totalSpent: Number(data.total),
        lastOrder: today,
        lastActivity: today,
        points: 0,
        totalPointsEarned: 0,
        tier: 'Bronze',
        redemptions: 0,
        status: 'Active',
      });
      await this.customersRepository.save(newCustomer);
    }
  }

  // ──────────────────────────────────────────────
  // Order Creation (pre-payment)
  // ──────────────────────────────────────────────

  /**
   * Create the order in DB AFTER Stripe has confirmed the payment.
   * Cart data is recovered from PaymentIntent metadata (set by
   * payments.service.createPaymentIntentForCart). Idempotent on paymentIntentId,
   * so the Stripe webhook and the client-side fallback can both call this safely.
   */
  async createOrderFromPayment(paymentIntentId: string): Promise<Order> {
    if (!paymentIntentId) throw new Error('paymentIntentId is required');

    // Idempotency
    const existing = await this.ordersRepository.findOne({ where: { paymentIntentId } });
    if (existing) return existing;

    // Verify payment + recover cart from Stripe
    const { paid, cart } = await this.paymentsService.getCartFromPaymentIntent(paymentIntentId);
    if (!paid) throw new Error(`Payment not yet succeeded for ${paymentIntentId}`);

    const orderNumber = await this.generateOrderNumber();
    const giftCardCode: string | undefined = cart.giftCardCode
      ? String(cart.giftCardCode).trim().toUpperCase()
      : undefined;
    const giftCardAmount = Number(cart.giftCardAmount || 0);

    const order = this.ordersRepository.create({
      orderNumber,
      customerName: cart.customerName,
      customerEmail: cart.customerEmail,
      customerPhone: cart.customerPhone,
      orderType: cart.orderType,
      scheduleType: cart.scheduleType,
      scheduledDate: cart.scheduledDate || null,
      scheduledTime: cart.scheduledTime || null,
      deliveryAddress: cart.deliveryAddress || null,
      deliveryApt: cart.deliveryApt || null,
      deliveryInstructions: cart.deliveryInstructions || null,
      items: cart.items || [],
      subtotal: cart.subtotal,
      tax: cart.tax,
      deliveryFee: cart.deliveryFee || 0,
      tip: cart.tip || 0,
      total: cart.total,
      promoCode: cart.promoCode || null,
      discount: cart.discount || 0,
      notes: cart.notes || null,
      status: 'paid',
      paymentIntentId,
      giftCardCode,
      giftCardAmount,
      squareSyncStatus: 'pending',
    });
    const saved = await this.ordersRepository.save(order);
    this.logger.log(`[PAYMENT] ✓ Order ${orderNumber} created post-payment (PI: ${paymentIntentId})`);

    // Redeem gift card portion if present. Idempotent on (giftCardId, orderNumber),
    // so if the webhook + post-payment fallback both run, only one debit happens.
    if (giftCardCode && giftCardAmount > 0) {
      try {
        await this.giftCardsService.redeem({
          code: giftCardCode,
          requestedAmount: giftCardAmount,
          orderNumber,
        });
      } catch (err: any) {
        this.logger.error(`[GIFT-CARD] Redemption failed for ${orderNumber} (${giftCardCode}): ${err.message}`);
      }
    }

    // Post-payment side-effects (emails, transaction, customer upsert, loyalty, Square sync)
    this.runPostPaymentFlow(saved, paymentIntentId);
    return saved;
  }

  /**
   * Place an order paid 100% by gift card. The Stripe charge would be below the
   * $0.50 PaymentIntent minimum, so there's no Stripe leg — we redeem the card
   * inline and create the order in a single atomic operation.
   */
  async placeOrderWithGiftCard(cart: any): Promise<Order> {
    const acceptance = await this.settingsService.validateOrderAcceptance(cart?.orderType, cart?.scheduleType);
    if (!acceptance.ok) {
      throw new Error(acceptance.reason || 'Order cannot be placed right now.');
    }

    const code = cart?.giftCardCode ? String(cart.giftCardCode).trim().toUpperCase() : '';
    if (!code) throw new Error('giftCardCode is required');
    const total = Number(cart?.total);
    if (!Number.isFinite(total) || total <= 0) throw new Error('Invalid order total');

    // Validate the card has enough balance BEFORE creating the order so we don't
    // leave an orphan order if redemption fails.
    const validation = await this.giftCardsService.validateForCheckout(code, total);
    if (!validation.valid || (validation.balance ?? 0) < total) {
      throw new Error(validation.message || 'Gift card does not have enough balance to cover this order');
    }

    const orderNumber = await this.generateOrderNumber();
    const order = this.ordersRepository.create({
      orderNumber,
      customerName: cart.customerName,
      customerEmail: cart.customerEmail,
      customerPhone: cart.customerPhone,
      orderType: cart.orderType,
      scheduleType: cart.scheduleType,
      scheduledDate: cart.scheduledDate || null,
      scheduledTime: cart.scheduledTime || null,
      deliveryAddress: cart.deliveryAddress || null,
      deliveryApt: cart.deliveryApt || null,
      deliveryInstructions: cart.deliveryInstructions || null,
      items: cart.items || [],
      subtotal: cart.subtotal,
      tax: cart.tax,
      deliveryFee: cart.deliveryFee || 0,
      tip: cart.tip || 0,
      total,
      promoCode: cart.promoCode || null,
      discount: cart.discount || 0,
      notes: cart.notes || null,
      status: 'paid',
      giftCardCode: code,
      giftCardAmount: total,
      squareSyncStatus: 'pending',
    });
    const saved = await this.ordersRepository.save(order);

    try {
      await this.giftCardsService.redeem({ code, requestedAmount: total, orderNumber });
    } catch (err: any) {
      // Roll back: a failed redemption shouldn't leave a paid order with no real payment.
      await this.ordersRepository.delete(saved.id);
      throw new Error(`Gift card redemption failed: ${err.message}`);
    }

    this.logger.log(`[PAYMENT] ✓ Order ${orderNumber} created with full gift card payment (${code})`);
    this.runPostPaymentFlow(saved, '');
    return saved;
  }

  private runPostPaymentFlow(order: Order, paymentIntentId: string) {
    this.mailService.sendOrderConfirmation(order).catch(err => {
      this.logger.error(`Failed to send order confirmation email: ${err.message}`);
    });
    this.mailService.sendOwnerNotification(order).catch(err => {
      this.logger.error(`Failed to send owner notification email: ${err.message}`);
    });

    this.paymentsService.recordTransaction({
      orderNumber: order.orderNumber,
      customer: order.customerName,
      type: order.orderType === 'delivery' ? 'Delivery' : 'Pickup',
      orderTotal: Number(order.total),
      deliveryFee: Number(order.deliveryFee),
      tip: Number(order.tip) || 0,
      paymentIntentId,
      giftCardPaid: Number(order.giftCardAmount) || 0,
    }).catch(err => {
      this.logger.error(`[PAYMENT] Failed to record transaction for ${order.orderNumber}: ${err.message}`);
    });

    if (order.customerEmail) {
      this.upsertCustomer({
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        total: Number(order.total),
        orderNumber: order.orderNumber,
      }).catch(err => {
        this.logger.error(`Failed to upsert customer record: ${err.message}`);
      });
      this.awardLoyaltyPoints(order).catch(() => {});
    }

    this.attemptSquareSync(order).catch(err => {
      this.logger.warn(`[PAYMENT] Immediate Square sync failed for ${order.orderNumber}, worker will retry: ${err.message}`);
    });

    // Server-side Facebook conversion event. Browser pixel fires the same Purchase
    // with eventID=orderNumber; Facebook deduplicates so the conversion is counted once.
    this.facebookCapi.sendPurchase(order).catch(() => {});
  }

  async createOrder(data: any): Promise<Order> {
    const order = this.ordersRepository.create({
      orderNumber: await this.generateOrderNumber(),
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      orderType: data.orderType,
      scheduleType: data.scheduleType,
      scheduledDate: data.scheduledDate || null,
      scheduledTime: data.scheduledTime || null,
      deliveryAddress: data.deliveryAddress || null,
      deliveryApt: data.deliveryApt || null,
      deliveryInstructions: data.deliveryInstructions || null,
      items: data.items || [],
      subtotal: data.subtotal,
      tax: data.tax,
      deliveryFee: data.deliveryFee || 0,
      tip: data.tip || 0,
      total: data.total,
      promoCode: data.promoCode || null,
      discount: data.discount || 0,
      notes: data.notes || null,
      status: 'pending_payment',
      squareSyncStatus: 'pending',
    });
    const savedOrder = await this.ordersRepository.save(order);

    // No emails here — payment is not yet confirmed. Customer + owner notifications
    // are sent from handlePaymentConfirmed once Stripe confirms the charge succeeded,
    // so abandoned/failed-payment orders never trigger any external notifications.
    return savedOrder;
  }

  // ──────────────────────────────────────────────
  // Payment Event Handlers (called by Stripe webhook)
  // ──────────────────────────────────────────────

  /**
   * Called when Stripe confirms payment succeeded.
   * This is the SINGLE SOURCE OF TRUTH for payment confirmation.
   * Triggers: status → paid, transaction recording, customer upsert, loyalty points, Square sync queue.
   */
  async handlePaymentConfirmed(orderNumber: string, paymentIntentId: string): Promise<void> {
    const order = await this.ordersRepository.findOne({ where: { orderNumber } });
    if (!order) {
      this.logger.error(`[PAYMENT] Order not found for payment confirmation: ${orderNumber}`);
      return;
    }

    // Idempotency: if already paid, skip all downstream processing
    if (order.paymentIntentId && order.status !== 'pending_payment' && order.status !== 'pending') {
      this.logger.log(`[PAYMENT] Order ${orderNumber} already confirmed (status: ${order.status}), skipping`);
      return;
    }

    // Mark as paid and store paymentIntentId
    await this.ordersRepository.update(order.id, {
      status: 'paid',
      paymentIntentId,
      squareSyncStatus: 'pending', // Ensure it's queued for Square sync
    });

    this.logger.log(`[PAYMENT] ✓ Order ${orderNumber} confirmed (PI: ${paymentIntentId})`);

    // Send notifications NOW that payment is confirmed — customer confirmation
    // and owner notification. Pulled fresh so they include status='paid'.
    const paidOrder = await this.ordersRepository.findOne({ where: { id: order.id } });
    if (paidOrder) {
      this.mailService.sendOrderConfirmation(paidOrder).catch(err => {
        this.logger.error(`Failed to send order confirmation email: ${err.message}`);
      });
      this.mailService.sendOwnerNotification(paidOrder).catch(err => {
        this.logger.error(`Failed to send owner notification email: ${err.message}`);
      });
    }

    // Record transaction (idempotent won't duplicate)
    this.paymentsService.recordTransaction({
      orderNumber: order.orderNumber,
      customer: order.customerName,
      type: order.orderType === 'delivery' ? 'Delivery' : 'Pickup',
      orderTotal: Number(order.total),
      deliveryFee: Number(order.deliveryFee),
      tip: Number(order.tip) || 0,
      paymentIntentId,
    }).catch(err => {
      this.logger.error(`[PAYMENT] Failed to record transaction for ${orderNumber}: ${err.message}`);
    });

    // Customer upsert + loyalty points (for authenticated users)
    const isAuthenticated = !!order.customerEmail; // All orders with email are tracked
    if (isAuthenticated) {
      this.upsertCustomer({
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        total: Number(order.total),
        orderNumber: order.orderNumber,
      }).catch(err => {
        this.logger.error(`Failed to upsert customer record: ${err.message}`);
      });

      // Award loyalty points
      this.awardLoyaltyPoints(order).catch(() => {});
    }

    // Square sync will be picked up by the worker automatically (squareSyncStatus = 'pending')
    // But also attempt immediate sync for faster kitchen response
    const freshOrder = await this.ordersRepository.findOne({ where: { id: order.id } });
    if (freshOrder) {
      this.attemptSquareSync(freshOrder).catch(err => {
        this.logger.warn(`[PAYMENT] Immediate Square sync failed for ${orderNumber}, worker will retry: ${err.message}`);
      });
    }
  }

  /**
   * Called when Stripe reports payment failure.
   */
  async handlePaymentFailed(orderNumber: string): Promise<void> {
    const order = await this.ordersRepository.findOne({ where: { orderNumber } });
    if (!order) return;

    // If the order never made it past payment, purge it entirely so failed payments
    // leave no trace (no row in admin orders, no entry in customer history). Already-paid
    // orders that later "fail" (e.g. dispute webhooks) are left alone for accounting.
    if ((UNPAID_STATUSES as unknown as string[]).includes(order.status)) {
      await this.ordersRepository.delete(order.id);
      this.logger.warn(`[PAYMENT] Order ${orderNumber} payment failed purged from DB`);
    }
  }

  private async awardLoyaltyPoints(order: Order): Promise<void> {
    const settings = await this.loyaltyService.getLoyaltySettings();
    if (!settings.loyaltyEnabled) return;

    const customer = await this.customersRepository.findOne({
      where: { email: order.customerEmail },
    });
    if (!customer) return;

    const multiplier = LoyaltyService.getTierMultiplier(customer.tier);
    const basePoints = Math.floor(Number(order.total) * (settings.pointsPerDollar || 1));
    const pointsEarned = Math.floor(basePoints * multiplier);
    const history = Array.isArray(customer.pointsHistory) ? customer.pointsHistory : [];
    const desc = multiplier > 1
      ? `Order ${order.orderNumber} (${multiplier}x ${customer.tier} bonus)`
      : `Order ${order.orderNumber}`;
    history.unshift({ description: desc, points: pointsEarned, type: 'earned', date: new Date().toISOString() });
    if (history.length > 100) history.length = 100;
    const newTotalEarned = (customer.totalPointsEarned || 0) + pointsEarned;
    const newTier = LoyaltyService.calculateTier(newTotalEarned);
    await this.customersRepository.update(customer.id, {
      points: (customer.points || 0) + pointsEarned,
      totalPointsEarned: newTotalEarned,
      tier: newTier,
      pointsHistory: history,
    });
  }

  // ──────────────────────────────────────────────
  // Legacy confirm-payment (frontend fallback)
  // ──────────────────────────────────────────────

  /**
   * Backward-compatible endpoint called by frontend after Stripe payment.
   * Acts as a FALLBACK in case webhook hasn't arrived yet.
   * The webhook is the source of truth this just ensures we don't miss orders
   * if the webhook is delayed.
   */
  async confirmOrderPayment(orderNumber: string, paymentIntentId?: string): Promise<{ success: boolean; squareOrderId?: string }> {
    const order = await this.ordersRepository.findOne({ where: { orderNumber } });
    if (!order) return { success: false };

    // If already fully processed, return success
    if (order.squareOrderId) {
      return { success: true, squareOrderId: order.squareOrderId };
    }

    // If webhook hasn't fired yet, verify payment with Stripe directly
    if (order.status === 'pending_payment' || order.status === 'pending') {
      if (paymentIntentId) {
        try {
          const stripe = await this.paymentsService.getStripe();
          if (stripe) {
            const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (pi.status === 'succeeded') {
              // Webhook might be delayed trigger payment confirmation
              await this.handlePaymentConfirmed(orderNumber, paymentIntentId);
              const updated = await this.ordersRepository.findOne({ where: { orderNumber } });
              return { success: true, squareOrderId: updated?.squareOrderId };
            }
          }
        } catch (err: any) {
          this.logger.warn(`[CONFIRM-PAYMENT] Stripe verification failed for ${orderNumber}: ${err.message}`);
        }
      }

      // Without paymentIntentId, we can't verify just queue for Square sync
      // This preserves backward compatibility with the old frontend flow
      await this.ordersRepository.update(order.id, {
        status: 'paid',
        squareSyncStatus: 'pending',
      });
    }

    // Attempt immediate Square sync
    const freshOrder = await this.ordersRepository.findOne({ where: { id: order.id } });
    if (freshOrder && freshOrder.squareSyncStatus === 'pending') {
      await this.attemptSquareSync(freshOrder);
      const result = await this.ordersRepository.findOne({ where: { id: order.id } });
      return { success: true, squareOrderId: result?.squareOrderId };
    }

    return { success: true };
  }

  // ──────────────────────────────────────────────
  // Order Queries
  // ──────────────────────────────────────────────

  async getAllOrders(page = 1, limit = 50): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.ordersRepository.findAndCount({
      where: { status: Not(In(UNPAID_STATUSES as unknown as string[])) },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getOrderById(id: number): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { id } });
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { orderNumber } });
  }

  // ──────────────────────────────────────────────
  // Order Status Updates (with state machine validation)
  // ──────────────────────────────────────────────

  async updateOrderStatus(id: number, status: string): Promise<Order | null> {
    const order = await this.getOrderById(id);
    if (!order) return null;

    // Validate state transition
    const allowed = VALID_TRANSITIONS[order.status];
    if (allowed && !allowed.includes(status)) {
      this.logger.warn(`[ORDERS] Invalid transition: ${order.orderNumber} ${order.status} → ${status}`);
      // Allow the transition anyway for admin override, but log the warning
    }

    await this.ordersRepository.update(id, { status });
    const updated = await this.getOrderById(id);
    if (!updated) return null;

    // Sync status to Square POS
    if (updated.squareOrderId) {
      this.squareService.updateOrderState(updated.squareOrderId, status).catch(() => {});
    }

    // Send status update emails for all transitions
    const emailStatuses = ['confirmed', 'preparing', 'ready'];
    if (emailStatuses.includes(status)) {
      this.mailService.sendOrderStatusEmail(updated, status).catch(() => {});
    }

    // Out for delivery auto-dispatch if not already dispatched
    if (status === 'out_for_delivery' && updated.orderType === 'delivery') {
      this.mailService.sendDeliveryUpdateEmail(updated).catch(() => {});
      if (!updated.deliveryQuoteId) {
        this.dispatchDelivery(updated).catch(err => {
          this.logger.error(`[ORDERS] Auto-dispatch failed for ${updated.orderNumber}: ${err.message}`);
        });
      }
    }

    // Delivered
    if (status === 'delivered' && updated.orderType === 'delivery') {
      this.mailService.sendDeliveryCompletedEmail(updated).catch(() => {});
    }

    // Picked up
    if (status === 'picked_up') {
      this.mailService.sendPickupCompleteEmail(updated).catch(() => {});
    }

    // Cancelled cancel delivery if active, and refund any gift card amount.
    if (status === 'cancelled') {
      this.mailService.sendOrderCancelledEmail(updated).catch(() => {});
      if (updated.deliveryQuoteId) {
        this.deliveryService.cancelDelivery(updated.deliveryQuoteId).catch(err => {
          this.logger.error(`[ORDERS] Failed to cancel delivery: ${err}`);
        });
      }
      if (updated.giftCardCode && Number(updated.giftCardAmount) > 0) {
        this.giftCardsService.refundRedemption(updated.orderNumber).catch(err => {
          this.logger.error(`[ORDERS] Gift card refund failed for ${updated.orderNumber}: ${err.message}`);
        });
      }
    }

    return updated;
  }

  // ──────────────────────────────────────────────
  // Delivery Management (with state guards)
  // ──────────────────────────────────────────────

  async getDeliveryQuote(id: number): Promise<any> {
    const order = await this.getOrderById(id);
    if (!order || order.orderType !== 'delivery' || !order.deliveryAddress) {
      return { error: 'Not a delivery order' };
    }

    const quote = await this.deliveryService.getQuote({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryApt: order.deliveryApt,
      deliveryInstructions: order.deliveryInstructions,
      items: order.items,
      total: Number(order.total),
      orderNumber: order.orderNumber,
    });

    if (!quote) return { error: 'Could not get quote from Uber Direct' };
    return { fee: quote.fee, eta: quote.eta, currency: quote.currency };
  }

  async dispatchDelivery(order: Order): Promise<Order | null> {
    if (order.orderType !== 'delivery' || !order.deliveryAddress) {
      return order;
    }

    // State guard: only dispatch if order is paid and not already dispatched
    const unpaidStatuses = ['pending_payment', 'pending'];
    if (unpaidStatuses.includes(order.status)) {
      this.logger.warn(`[DELIVERY] Cannot dispatch ${order.orderNumber} not yet paid (status: ${order.status})`);
      return order;
    }

    // Idempotency: don't dispatch if already dispatched
    if (order.deliveryQuoteId) {
      this.logger.log(`[DELIVERY] ${order.orderNumber} already dispatched (quoteId: ${order.deliveryQuoteId})`);
      return order;
    }

    const result = await this.deliveryService.createDelivery({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryApt: order.deliveryApt,
      deliveryInstructions: order.deliveryInstructions,
      items: order.items,
      total: Number(order.total),
    });

    if (result) {
      await this.ordersRepository.update(order.id, {
        deliveryProvider: result.provider,
        deliveryQuoteId: result.quoteId,
        deliveryTrackingUrl: result.trackingUrl,
        deliveryEta: result.eta,
      });
      return this.getOrderById(order.id);
    }

    return order;
  }

  async cancelDeliveryDispatch(id: number): Promise<{ success: boolean; message: string }> {
    const order = await this.getOrderById(id);
    if (!order?.deliveryQuoteId) return { success: false, message: 'No active delivery to cancel' };

    const cancelled = await this.deliveryService.cancelDelivery(order.deliveryQuoteId);
    if (cancelled) {
      await this.ordersRepository.update(id, {
        deliveryProvider: undefined,
        deliveryQuoteId: undefined,
        deliveryTrackingUrl: undefined,
        deliveryDriverName: undefined,
        deliveryDriverPhone: undefined,
        deliveryEta: undefined,
      });
      return { success: true, message: 'Delivery cancelled successfully' };
    }
    return { success: false, message: 'Failed to cancel delivery with Uber' };
  }

  async getDeliveryStatus(id: number): Promise<any> {
    const order = await this.getOrderById(id);
    if (!order?.deliveryQuoteId) return { status: 'no_dispatch' };

    const status = await this.deliveryService.getDeliveryStatus(order.deliveryQuoteId);
    if (!status) return { status: 'unknown' };

    // Update order with latest driver info
    const updates: any = {};
    if (status.driverName && status.driverName !== order.deliveryDriverName) updates.deliveryDriverName = status.driverName;
    if (status.driverPhone && status.driverPhone !== order.deliveryDriverPhone) updates.deliveryDriverPhone = status.driverPhone;
    if (status.eta && status.eta !== order.deliveryEta) updates.deliveryEta = status.eta;
    if (Object.keys(updates).length > 0) {
      await this.ordersRepository.update(order.id, updates);
    }

    // Auto-complete order if Uber says delivered
    const mappedStatus = this.deliveryService.mapUberStatusToOrderStatus(status.uberStatus || status.status);
    if (mappedStatus === 'delivered' && order.status !== 'delivered') {
      await this.ordersRepository.update(order.id, { status: 'delivered' });
      this.logger.log(`[ORDERS] Auto-completed order ${order.orderNumber} (Uber status: delivered)`);
      const freshOrder = await this.getOrderById(order.id);
      if (freshOrder) {
        this.mailService.sendDeliveryCompletedEmail(freshOrder).catch(() => {});
      }
    }

    // Send driver assigned email (first time driver appears)
    if (status.driverName && !order.deliveryDriverName) {
      this.mailService.sendDriverAssignedEmail(order, status.driverName, status.eta).catch(() => {});
    }

    return status;
  }

  // ──────────────────────────────────────────────
  // Uber Direct Webhook Handler
  // ──────────────────────────────────────────────

  async handleDeliveryWebhook(payload: any): Promise<void> {
    const externalId = payload.data?.external_id || payload.external_id;
    const uberStatus = payload.data?.status || payload.status;
    const deliveryId = payload.data?.id || payload.id;

    if (!externalId && !deliveryId) {
      this.logger.log('[WEBHOOK] No external_id or delivery_id in payload');
      return;
    }

    let order: Order | null = null;
    if (externalId) {
      order = await this.ordersRepository.findOne({ where: { orderNumber: externalId } });
    }
    if (!order && deliveryId) {
      order = await this.ordersRepository.findOne({ where: { deliveryQuoteId: deliveryId } });
    }
    if (!order) {
      this.logger.log(`[WEBHOOK] Order not found for external_id=${externalId}, delivery_id=${deliveryId}`);
      return;
    }

    this.logger.log(`[WEBHOOK] Order ${order.orderNumber}: Uber status=${uberStatus}`);

    const courier = payload.data?.courier || payload.courier;
    const updates: any = {};
    if (courier?.name) updates.deliveryDriverName = courier.name;
    if (courier?.phone_number) updates.deliveryDriverPhone = courier.phone_number;
    if (payload.data?.dropoff_eta) updates.deliveryEta = payload.data.dropoff_eta;
    if (payload.data?.tracking_url) updates.deliveryTrackingUrl = payload.data.tracking_url;

    const mappedStatus = this.deliveryService.mapUberStatusToOrderStatus(uberStatus);
    if (mappedStatus && mappedStatus !== order.status) {
      updates.status = mappedStatus;
      this.logger.log(`[WEBHOOK] Order ${order.orderNumber}: status ${order.status} → ${mappedStatus}`);
    }

    if (Object.keys(updates).length > 0) {
      await this.ordersRepository.update(order.id, updates);
    }

    const freshOrder = await this.getOrderById(order.id);
    if (!freshOrder) return;

    if (courier?.name && !order.deliveryDriverName) {
      this.mailService.sendDriverAssignedEmail(freshOrder, courier.name, payload.data?.dropoff_eta).catch(() => {});
    }
    if (mappedStatus === 'delivered' && order.status !== 'delivered') {
      this.mailService.sendDeliveryCompletedEmail(freshOrder).catch(() => {});
    }
  }

  // ──────────────────────────────────────────────
  // Search & Queries
  // ──────────────────────────────────────────────

  async searchOrder(query: string): Promise<Order | null> {
    if (!query) return null;
    const q = query.trim();
    const byNumber = await this.ordersRepository.findOne({ where: { orderNumber: q } });
    if (byNumber) return byNumber;
    if (!q.startsWith('EO-')) {
      const byPrefix = await this.ordersRepository.findOne({ where: { orderNumber: `EO-${q}` } });
      if (byPrefix) return byPrefix;
    }
    const numId = Number(q);
    if (!isNaN(numId)) {
      const byId = await this.ordersRepository.findOne({ where: { id: numId } });
      if (byId) return byId;
    }
    const byEmail = await this.ordersRepository.findOne({
      where: { customerEmail: q.toLowerCase() },
      order: { createdAt: 'DESC' },
    });
    return byEmail;
  }

  async getActiveOrders(): Promise<Order[]> {
    // Drop unpaid (pending_payment / pending) those are pre-payment placeholders
    // that shouldn't appear anywhere customer- or admin-facing.
    return this.ordersRepository
      .createQueryBuilder('order')
      .where('order.status IN (:...statuses)', {
        statuses: ['paid', 'sent_to_kitchen', 'confirmed', 'preparing', 'ready', 'out_for_delivery'],
      })
      .orderBy('order.createdAt', 'ASC')
      .getMany();
  }

  async getScheduledOrders(): Promise<Order[]> {
    return this.ordersRepository
      .createQueryBuilder('order')
      .where('order.scheduleType = :type', { type: 'scheduled' })
      .andWhere('order.status NOT IN (:...statuses)', {
        statuses: ['delivered', 'picked_up', 'cancelled', ...UNPAID_STATUSES],
      })
      .orderBy('order.scheduledDate', 'ASC')
      .getMany();
  }

  async getOrderHistory(page = 1, limit = 50): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.ordersRepository.findAndCount({
      where: [
        { status: 'delivered' },
        { status: 'picked_up' },
        { status: 'cancelled' },
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async cancelOrder(id: number): Promise<Order | null> {
    return this.updateOrderStatus(id, 'cancelled');
  }

  // ──────────────────────────────────────────────
  // Stuck Order Detection
  // ──────────────────────────────────────────────

  /**
   * Find orders that may be stuck in a transitional state.
   * Called by the Square sync worker or an admin endpoint.
   */
  async getStuckOrders(): Promise<{
    unpaidOlderThan30Min: Order[];
    failedSquareSync: Order[];
    paidButNoKitchen: Order[];
  }> {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60_000);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60_000);

    const unpaidOlderThan30Min = await this.ordersRepository.find({
      where: {
        status: In(['pending_payment', 'pending']),
        createdAt: LessThan(thirtyMinAgo),
      },
    });

    const failedSquareSync = await this.ordersRepository.find({
      where: {
        squareSyncStatus: 'failed',
      },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    const paidButNoKitchen = await this.ordersRepository.find({
      where: {
        status: In(['paid']),
        squareSyncStatus: In(['pending', 'failed']),
        createdAt: LessThan(twoHoursAgo),
      },
    });

    return { unpaidOlderThan30Min, failedSquareSync, paidButNoKitchen };
  }

  // ──────────────────────────────────────────────
  // Stats
  // ──────────────────────────────────────────────

  async getTodayStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await this.ordersRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .andWhere('order.status != :status', { status: 'cancelled' })
      .getMany();

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      totalOrders: orders.length,
      totalRevenue: totalRevenue.toFixed(2),
      avgOrderValue: avgOrder.toFixed(2),
      pendingOrders: orders.filter(o => ['pending_payment', 'pending', 'paid'].includes(o.status)).length,
    };
  }

  async getHistoricalStats(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await this.ordersRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('order.status != :status', { status: 'cancelled' })
      .getMany();

    const dailyData: Record<string, { revenue: number, orders: number }> = {};
    orders.forEach(o => {
      const date = o.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) dailyData[date] = { revenue: 0, orders: 0 };
      dailyData[date].revenue += Number(o.total);
      dailyData[date].orders += 1;
    });

    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Number(data.revenue.toFixed(2)),
      orders: data.orders,
      rawDate: date
    })).sort((a, b) => a.rawDate.localeCompare(b.rawDate));

    const itemMap: Record<string, { orders: number, revenue: number }> = {};
    orders.forEach(o => {
      const items = Array.isArray(o.items) ? o.items : [];
      items.forEach((item: any) => {
        const name = item.name || 'Unknown Item';
        if (!itemMap[name]) itemMap[name] = { orders: 0, revenue: 0 };
        itemMap[name].orders += item.quantity || 1;
        itemMap[name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    const topItems = Object.entries(itemMap).map(([name, data]) => ({
      name,
      orders: data.orders,
      revenue: Number(data.revenue.toFixed(2)),
      trend: data.orders > 0 ? 'up' : 'neutral',
      change: '0%'
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    const pickupCount = orders.filter(o => o.orderType?.toLowerCase() === 'pickup').length;
    const deliveryCount = orders.filter(o => o.orderType?.toLowerCase() === 'delivery').length;
    const totalCount = orders.length;

    const orderTypeData = [
      { name: 'Pickup', value: totalCount > 0 ? Math.round((pickupCount / totalCount) * 100) : 60, color: '#E5B800' },
      { name: 'Delivery', value: totalCount > 0 ? Math.round((deliveryCount / totalCount) * 100) : 40, color: '#60A5FA' },
    ];

    const hourMap: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourMap[i] = 0;
    orders.forEach(o => {
      // Bucket by Philadelphia hour so the chart reflects the actual peak for the store,
      // independent of where the backend happens to be hosted.
      const hourStr = o.createdAt.toLocaleString('en-US', { timeZone: 'America/New_York', hour: '2-digit', hour12: false });
      const hour = Number(hourStr) % 24;
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });
    const peakHoursData = Object.entries(hourMap).map(([hour, count]) => {
      const h = parseInt(hour);
      const ampm = h < 12 ? 'am' : 'pm';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return { hour: `${h12}${ampm}`, orders: count, rawHour: h };
    }).sort((a, b) => a.rawHour - b.rawHour);

    const uniqueEmails = new Set(orders.map(o => o.customerEmail)).size;

    const emailOrderCounts: Record<string, number> = {};
    orders.forEach(o => {
      const email = o.customerEmail?.toLowerCase();
      if (email) emailOrderCounts[email] = (emailOrderCounts[email] || 0) + 1;
    });
    const singleOrderCustomers = Object.values(emailOrderCounts).filter(c => c === 1).length;
    const repeatCustomers = Object.values(emailOrderCounts).filter(c => c > 1).length;
    const newCustomerPct = uniqueEmails > 0 ? Math.round((singleOrderCustomers / uniqueEmails) * 100) : 0;
    const retentionPct = uniqueEmails > 0 ? Math.round((repeatCustomers / uniqueEmails) * 100) : 0;

    const customerData = [
      { label: 'Total Customers', value: String(uniqueEmails), color: '#22C55E', detail: 'Unique customers in period' },
      { label: 'New Customers', value: `${newCustomerPct}%`, color: '#E5B800', detail: `${singleOrderCustomers} first-time customers` },
      { label: 'Avg Orders / Cust', value: (totalCount / (uniqueEmails || 1)).toFixed(1), color: '#60A5FA', detail: 'Loyalty engagement' },
      { label: 'Retention Rate', value: `${retentionPct}%`, color: '#FECE86', detail: `${repeatCustomers} repeat customers` },
    ];

    return {
      chartData,
      topItems,
      orderTypeData,
      peakHoursData,
      customerData,
      totalRevenue: Number(orders.reduce((sum, o) => sum + Number(o.total), 0).toFixed(2)),
      totalTips: Number(orders.reduce((sum, o) => sum + (Number(o.tip) || 0), 0).toFixed(2)),
      totalOrders: totalCount,
    };
  }
}
