import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ default: 0 })
    totalOrders: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalSpent: number;

    @Column({ nullable: true })
    lastOrder: string;

    @Column({ default: 0 })
    points: number;

    @Column({ default: 0 })
    totalPointsEarned: number;

    @Column({ default: 'Bronze' })
    tier: string;

    @Column({ default: 0 })
    redemptions: number;

    @Column({ nullable: true })
    lastActivity: string;

    @CreateDateColumn()
    joinDate: Date;

    @Column({ type: 'json', nullable: true })
    savedAddresses: any; // Array of { id, label, address, apt, instructions, isDefault }

    @Column({ type: 'json', nullable: true })
    pointsHistory: any; // Array of { date, description, points, type: 'earned'|'redeemed' }

    @Column({ type: 'json', nullable: true })
    redeemedRewards: any; // Array of { id, code, rewardName, type, value, redeemedAt, used }

    @Column({ default: 'Active' })
    status: string; // 'Active' | 'Inactive' | 'Blocked'

    @Column({ nullable: true, select: false })
    password: string;

    @Column({ nullable: true, select: false })
    resetPasswordToken: string;

    @Column({ nullable: true, type: 'bigint', select: false })
    resetPasswordExpiry: number;
}
