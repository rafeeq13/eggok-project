import { Controller, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Transaction } from './transaction.entity';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get('transactions')
    findAll(): Promise<Transaction[]> {
        return this.paymentsService.findAll();
    }

    @Get('stats')
    getStats() {
        return this.paymentsService.getStats();
    }
}
