import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    customer: string;

    @Column()
    email: string;

    @Column()
    rating: number; // 1 | 2 | 3 | 4 | 5

    @Column()
    title: string;

    @Column({ type: 'text' })
    body: string;

    @CreateDateColumn()
    date: Date;

    @Column()
    orderType: string; // 'Pickup' | 'Delivery'

    @Column()
    orderId: string;

    @Column({ default: 'Published' })
    status: string; // 'Published' | 'Hidden' | 'Flagged'

    @Column({ type: 'text', nullable: true })
    reply: string;

    @Column({ nullable: true })
    repliedAt: string;
}
