import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Transaction } from './transaction.entity';
import { AdminGuard } from '../auth/admin.guard';

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
    @UseGuards(AdminGuard)
    findAll(): Promise<Transaction[]> {
        return this.paymentsService.findAll();
    }

    @Get('stats')
    @UseGuards(AdminGuard)
    getStats() {
        return this.paymentsService.getStats();
    }
}
