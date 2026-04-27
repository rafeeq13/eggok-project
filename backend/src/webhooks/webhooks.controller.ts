import { Controller, Post, Req, Res, Headers, Body, Logger, Inject, forwardRef } from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';
import { OrdersService } from '../orders/orders.service';
import { SettingsService } from '../settings/settings.service';
import * as crypto from 'crypto';

@Controller()
export class WebhooksController {
  private readonly logger = new Logger('WebhooksController');

  constructor(
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private readonly settingsService: SettingsService,
  ) {}

  // ──────────────────────────────────────────────
  // POST /api/stripe/webhook
  // ──────────────────────────────────────────────
  @Post('stripe/webhook')
  async handleStripeWebhook(
    @Req() req: any,
    @Res() res: any,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = await this.paymentsService.getWebhookSecret();

    // Express raw() middleware (configured in main.ts) gives req.body as a Buffer
    // for this route, which is exactly what Stripe needs for signature verification.
    const bodyBuffer: Buffer = Buffer.isBuffer(req.body)
      ? req.body
      : (req.rawBody || Buffer.from(JSON.stringify(req.body || {})));

    let event: any;
    if (webhookSecret && signature) {
      event = this.paymentsService.verifyWebhookEvent(bodyBuffer, signature, webhookSecret);
      if (!event) {
        this.logger.error('[STRIPE WEBHOOK] Invalid signature, rejecting');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } else {
      this.logger.warn('[STRIPE WEBHOOK] No webhook secret configured — accepting unverified event. Configure stripeWebhookSecret in Admin → Integrations.');
      try {
        event = JSON.parse(bodyBuffer.toString('utf8'));
      } catch {
        event = req.body;
      }
    }

    // Respond 200 immediately to prevent Stripe retries
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

        // New flow: cart embedded in PI metadata, create order from PI.
        if (paymentIntent.metadata?.cart_chunks) {
          this.logger.log(`[STRIPE WEBHOOK] Payment succeeded (PI: ${paymentIntentId}) creating order from cart metadata`);
          await this.ordersService.createOrderFromPayment(paymentIntentId);
          break;
        }

        // Legacy flow fallback (orderNumber pre-created in DB).
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
        // Legacy flow only: purge the placeholder row.
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

  // ──────────────────────────────────────────────
  // POST /api/uber/webhook
  // ──────────────────────────────────────────────
  @Post('uber/webhook')
  handleUberWebhook(@Body() payload: any) {
    this.logger.log(`[UBER WEBHOOK] Received event: ${payload.event_type || payload.status || 'unknown'}`);

    this.ordersService.handleDeliveryWebhook(payload).catch(err => {
      this.logger.error(`[UBER WEBHOOK] Error processing: ${err.message}`);
    });

    return { status: 'ok' };
  }

  // ──────────────────────────────────────────────
  // POST /api/square/webhook
  // ──────────────────────────────────────────────
  @Post('square/webhook')
  async handleSquareWebhook(
    @Req() req: any,
    @Res() res: any,
    @Headers('x-square-hmacsha256-signature') squareSignature: string,
  ) {
    // Verify Square webhook signature. Express raw() middleware in main.ts
    // gives req.body as a Buffer for this route — exactly what HMAC needs.
    const settings = await this.settingsService.getSetting('integrations');
    const signingKey = settings?.squareWebhookSigningKey;

    const bodyBuffer: Buffer = Buffer.isBuffer(req.body)
      ? req.body
      : (req.rawBody || Buffer.from(JSON.stringify(req.body || {})));
    const bodyStr = bodyBuffer.toString('utf8');

    if (signingKey && squareSignature) {
      // Square HMAC: HMAC-SHA256(signingKey, webhookUrl + body)
      const webhookUrl = settings?.squareWebhookUrl || `https://eggsokpa.com/api/square/webhook`;
      const hmac = crypto.createHmac('sha256', signingKey);
      hmac.update(webhookUrl + bodyStr);
      const expectedSignature = hmac.digest('base64');

      if (squareSignature !== expectedSignature) {
        this.logger.error('[SQUARE WEBHOOK] Invalid signature, rejecting');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } else if (signingKey) {
      this.logger.warn('[SQUARE WEBHOOK] Missing x-square-hmacsha256-signature header');
    }

    // Respond 200 immediately
    res.status(200).json({ received: true });

    try {
      let body: any;
      try { body = JSON.parse(bodyStr); } catch { body = req.body || {}; }
      const eventType = body.type;
      this.logger.log(`[SQUARE WEBHOOK] Event: ${eventType}`);

      switch (eventType) {
        case 'order.updated': {
          const squareOrder = body.data?.object?.order_updated?.order || body.data?.object;
          if (squareOrder?.reference_id) {
            this.logger.log(`[SQUARE WEBHOOK] Order updated: ${squareOrder.reference_id} → state: ${squareOrder.state}`);
          }
          break;
        }

        case 'terminal.checkout.updated': {
          const checkout = body.data?.object?.checkout;
          if (checkout) {
            this.logger.log(`[SQUARE WEBHOOK] Terminal checkout ${checkout.id}: status=${checkout.status}`);
          }
          break;
        }

        default:
          this.logger.log(`[SQUARE WEBHOOK] Unhandled event: ${eventType}`);
      }
    } catch (err: any) {
      this.logger.error(`[SQUARE WEBHOOK] Processing error: ${err.message}`);
    }
  }
}
