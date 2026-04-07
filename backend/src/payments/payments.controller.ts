import { Controller, Get, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Transaction } from './transaction.entity';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

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

    @Get('transactions')
    findAll(): Promise<Transaction[]> {
        return this.paymentsService.findAll();
    }

    @Get('stats')
    getStats() {
        return this.paymentsService.getStats();
    }
}
