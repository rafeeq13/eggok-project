import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { SettingsService } from '../settings/settings.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require('stripe');

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly settingsService: SettingsService,
    ) { }

    private async getStripe(): Promise<any> {
        const settings = await this.settingsService.getSetting('integrations');
        const secretKey = settings?.stripeSecretKey;
        if (!secretKey) return null;
        return new Stripe(secretKey);
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

    async recordTransaction(data: {
        orderNumber: string;
        customer: string;
        type: string;
        orderTotal: number;
        deliveryFee: number;
        paymentIntentId?: string;
    }): Promise<Transaction> {
        const stripeFee = Number((data.orderTotal * 0.029 + 0.30).toFixed(2));
        const netRevenue = Number((data.orderTotal - stripeFee).toFixed(2));

        return this.transactionRepository.save(this.transactionRepository.create({
            id: data.orderNumber,
            customer: data.customer,
            type: data.type,
            orderTotal: data.orderTotal,
            stripeFee,
            deliveryFee: data.deliveryFee,
            netRevenue,
            status: 'Paid',
        }));
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

        return {
            totalRevenue,
            totalStripeFees,
            totalDeliveryFees,
            totalRefunds,
            totalNet,
            totalProfit: totalRevenue - totalStripeFees - totalDeliveryFees - totalRefunds,
            transactionCount: transactions.length,
            recentTransactions: transactions.slice(0, 10),
        };
    }
}
