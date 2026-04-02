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

    @Column({ default: 'Active' })
    status: string; // 'Active' | 'Inactive' | 'Blocked'
}
