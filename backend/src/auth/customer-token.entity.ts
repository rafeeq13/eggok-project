import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from '../customers/customer.entity';

@Entity('customer_tokens')
export class CustomerToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    token: string;

    @Column()
    customerId: number;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column({ type: 'bigint' })
    expiresAt: number;

    @CreateDateColumn()
    createdAt: Date;
}
