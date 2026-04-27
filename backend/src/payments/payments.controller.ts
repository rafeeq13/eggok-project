import { Controller, Get, Post, Body, UseGuards, Param, Req, Res, Logger, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { Transaction } from './transaction.entity';
import { AdminGuard } from '../auth/admin.guard';
import { GiftCardsService } from '../gift-cards/gift-cards.service';

@Controller('payments')
export class PaymentsController {
    private readonly logger = new Logger('PaymentsController');

    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly ordersService: OrdersService,
        private readonly giftCardsService: GiftCardsService,
    ) { }

    @Get('stripe-key')
    getPublishableKey() {
        return this.paymentsService.getPublishableKey();
    }

    @Post('create-payment-intent')
    createPaymentIntent(@Body() data: {
        amount: number;
        orderNumber: string;
        customerEmail: string;
        customerName: string;
    }) {
        return this.paymentsService.createPaymentIntent(data);
    }

    /**
     * New checkout flow accepts the full cart (no pre-existing order in DB)
     * and embeds it in Stripe metadata. The order row is only created after
     * Stripe confirms the charge, so failed/abandoned payments leave nothing behind.
     */
    @Post('create-payment-intent-for-cart')
    createPaymentIntentForCart(@Body() cart: any) {
        return this.paymentsService.createPaymentIntentForCart(cart);
    }

    /**
     * Stripe Webhook the single source of truth for payment confirmation.
     * Triggers Square sync, transaction recording, and order status transitions.
     * This endpoint receives raw body for signature verification.
     */
    @Post('webhooks/stripe')
    async handleStripeWebhook(
        @Req() req: any,
        @Res() res: any,
        @Headers('stripe-signature') signature: string,
    ) {
        const webhookSecret = await this.paymentsService.getWebhookSecret();

        // If no webhook secret configured, fall back to trusting the payload
        // (for initial setup / migration period log a warning)
        let event: any;
        if (webhookSecret && signature) {
            const rawBody = req.rawBody || req.body;
            event = this.paymentsService.verifyWebhookEvent(
                Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(JSON.stringify(rawBody)),
                signature,
                webhookSecret,
            );
            if (!event) {
                this.logger.error('[STRIPE WEBHOOK] Invalid signature, rejecting');
                return res.status(400).json({ error: 'Invalid signature' });
            }
        } else {
            // During migration: accept unverified webhooks but log warning
            this.logger.warn('[STRIPE WEBHOOK] No webhook secret configured accepting unverified event. Configure stripeWebhookSecret in Admin → Integrations.');
            event = req.body;
        }

        // Always respond 200 immediately to prevent Stripe retries on slow processing
        res.status(200).json({ received: true });

        // Process asynchronously
        try {
            await this.processStripeEvent(event);
        } catch (err: any) {
            this.logger.error(`[STRIPE WEBHOOK] Processing error: ${err.message}`, err.stack);
        }
    }

    private async processStripeEvent(event: any) {
        const eventType = event.type || event.data?.object?.object;

        switch (eventType) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data?.object || event;
                const paymentIntentId = paymentIntent.id;

                // Gift card purchase issue the card and email the recipient.
                if (paymentIntent.metadata?.type === 'gift_card') {
                    this.logger.log(`[STRIPE WEBHOOK] Gift card payment succeeded (PI: ${paymentIntentId}) issuing card`);
                    await this.giftCardsService.issueFromPayment(paymentIntentId);
                    break;
                }

                // New flow: cart embedded in metadata, create order from PI
                if (paymentIntent.metadata?.cart_chunks) {
                    this.logger.log(`[STRIPE WEBHOOK] Payment succeeded (PI: ${paymentIntentId}) creating order`);
                    await this.ordersService.createOrderFromPayment(paymentIntentId);
                    break;
                }

                // Legacy flow fallback (orderNumber in metadata, order already in DB)
                const orderNumber = paymentIntent.metadata?.orderNumber;
                if (orderNumber) {
                    this.logger.log(`[STRIPE WEBHOOK] Payment succeeded (legacy): ${orderNumber} (PI: ${paymentIntentId})`);
                    await this.ordersService.handlePaymentConfirmed(orderNumber, paymentIntentId);
                } else {
                    this.logger.warn('[STRIPE WEBHOOK] payment_intent.succeeded with no cart/orderNumber metadata');
                }
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data?.object || event;
                this.logger.warn(`[STRIPE WEBHOOK] Payment failed (PI: ${paymentIntent.id})`);
                // New flow: nothing to clean up — order was never created.
                // Legacy flow: purge the placeholder row.
                const orderNumber = paymentIntent.metadata?.orderNumber;
                if (orderNumber && !paymentIntent.metadata?.cart_chunks) {
                    await this.ordersService.handlePaymentFailed(orderNumber);
                }
                break;
            }

            default:
                this.logger.log(`[STRIPE WEBHOOK] Unhandled event type: ${eventType}`);
        }
    }

    @Get('transactions')
    @UseGuards(AdminGuard)
    findAll(): Promise<Transaction[]> {
        return this.paymentsService.findAll();
    }

    @Get('stats')
    @UseGuards(AdminGuard)
    getStats() {
        return this.paymentsService.getStats();
    }

    @Post('refund/:orderNumber')
    @UseGuards(AdminGuard)
    refund(@Param('orderNumber') orderNumber: string, @Body('amount') amount: number) {
        return this.paymentsService.refundTransaction(orderNumber, amount);
    }
}
