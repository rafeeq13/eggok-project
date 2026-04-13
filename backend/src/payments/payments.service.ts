import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { SettingsService } from '../settings/settings.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require('stripe');

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger('PaymentsService');

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly settingsService: SettingsService,
    ) { }

    async getStripe(): Promise<any> {
        const settings = await this.settingsService.getSetting('integrations');
        const secretKey = settings?.stripeSecretKey;
        if (!secretKey) return null;
        return new Stripe(secretKey);
    }

    async getWebhookSecret(): Promise<string | null> {
        const settings = await this.settingsService.getSetting('integrations');
        return settings?.stripeWebhookSecret || null;
    }

    async getPublishableKey(): Promise<{ key: string | null }> {
        const settings = await this.settingsService.getSetting('integrations');
        return { key: settings?.stripePublishableKey || null };
    }

    async createPaymentIntent(data: {
        amount: number; // in dollars
        orderNumber: string;
        customerEmail: string;
        customerName: string;
    }): Promise<{ clientSecret: string; paymentIntentId: string }> {
        const stripe = await this.getStripe();
        if (!stripe) {
            throw new BadRequestException('Stripe is not configured. Add your secret key in Admin → Integrations.');
        }

        const amountCents = Math.round(data.amount * 100);
        if (amountCents < 50) {
            throw new BadRequestException('Order amount too small for payment processing.');
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountCents,
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: {
                orderNumber: data.orderNumber,
                customerEmail: data.customerEmail,
            },
            receipt_email: data.customerEmail,
            description: `Eggs Ok Order ${data.orderNumber}`,
        });

        return {
            clientSecret: paymentIntent.client_secret!,
            paymentIntentId: paymentIntent.id,
        };
    }

    /**
     * Verify Stripe webhook signature and parse event.
     * Returns null if verification fails (signature mismatch or missing secret).
     */
    verifyWebhookEvent(rawBody: Buffer, signature: string, webhookSecret: string): any {
        try {
            return Stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        } catch (err: any) {
            this.logger.error(`[STRIPE WEBHOOK] Signature verification failed: ${err.message}`);
            return null;
        }
    }

    async recordTransaction(data: {
        orderNumber: string;
        customer: string;
        type: string;
        orderTotal: number;
        deliveryFee: number;
        tip: number;
        paymentIntentId?: string;
    }): Promise<Transaction> {
        // Idempotency: check if transaction already exists for this order
        const existing = await this.transactionRepository.findOne({ where: { id: data.orderNumber } });
        if (existing) {
            this.logger.log(`[TRANSACTION] Already exists for ${data.orderNumber}, skipping`);
            return existing;
        }

        const stripeFee = Number((data.orderTotal * 0.029 + 0.30).toFixed(2));
        const netRevenue = Number((data.orderTotal - stripeFee).toFixed(2));

        return this.transactionRepository.save(this.transactionRepository.create({
            id: data.orderNumber,
            customer: data.customer,
            type: data.type,
            orderTotal: data.orderTotal,
            stripeFee,
            deliveryFee: data.deliveryFee,
            tip: data.tip || 0,
            netRevenue,
            status: 'Paid',
        }));
    }

    async refundTransaction(orderNumber: string, amount: number): Promise<Transaction> {
        const tx = await this.transactionRepository.findOne({ where: { id: orderNumber } });
        if (!tx) throw new BadRequestException('Transaction not found');

        const refundAmount = Number(amount);
        if (refundAmount <= 0) throw new BadRequestException('Refund amount must be positive');
        if (refundAmount > Number(tx.orderTotal) - Number(tx.refundAmount)) {
            throw new BadRequestException('Refund amount exceeds remaining balance');
        }

        const totalRefunded = Number(tx.refundAmount) + refundAmount;
        const isFullRefund = totalRefunded >= Number(tx.orderTotal);

        // Recalculate net revenue after refund
        const stripeFee = Number(tx.stripeFee);
        const newNet = Number(tx.orderTotal) - totalRefunded - stripeFee;

        tx.refundAmount = totalRefunded;
        tx.status = isFullRefund ? 'Refunded' : 'Partial Refund';
        tx.netRevenue = Math.max(0, Number(newNet.toFixed(2)));

        return this.transactionRepository.save(tx);
    }

    findAll(): Promise<Transaction[]> {
        return this.transactionRepository.find({ order: { date: 'DESC' } });
    }

    async getStats() {
        const transactions = await this.findAll();

        const totalRevenue = transactions.reduce((acc, t) => acc + Number(t.orderTotal), 0);
        const totalStripeFees = transactions.reduce((acc, t) => acc + Number(t.stripeFee), 0);
        const totalDeliveryFees = transactions.reduce((acc, t) => acc + Number(t.deliveryFee), 0);
        const totalRefunds = transactions.reduce((acc, t) => acc + Number(t.refundAmount), 0);
        const totalNet = transactions.reduce((acc, t) => acc + Number(t.netRevenue), 0);
        const totalTips = transactions.reduce((acc, t) => acc + Number(t.tip || 0), 0);

        return {
            totalRevenue,
            totalStripeFees,
            totalDeliveryFees,
            totalRefunds,
            totalNet,
            totalTips,
            totalProfit: totalRevenue - totalStripeFees - totalDeliveryFees - totalRefunds,
            transactionCount: transactions.length,
            recentTransactions: transactions.slice(0, 10),
        };
    }
}
