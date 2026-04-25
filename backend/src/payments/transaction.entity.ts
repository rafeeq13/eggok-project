import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ unique: true })
    id: string; // e.g. EO-1001

    @Column()
    customer: string;

    @Column()
    type: string; // 'Pickup' | 'Delivery'

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    orderTotal: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    stripeFee: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    deliveryFee: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    tip: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    netRevenue: number;

    @Column({ default: 'Paid' })
    status: string; // 'Paid' | 'Refunded' | 'Partial Refund'

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    refundAmount: number;

    // Split-payment tracking for orders partially paid by gift card.
    // giftCardPaid was booked as revenue when the gift card itself was sold,
    // so it's excluded from netRevenue here to avoid double-counting.
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    giftCardPaid: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    stripePaid: number;

    @CreateDateColumn()
    date: Date;
}
