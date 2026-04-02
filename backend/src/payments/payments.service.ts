import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
    ) { }

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
