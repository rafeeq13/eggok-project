import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rewards')
export class Reward {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    pointsCost: number;

    @Column()
    type: string; // 'discount' | 'freeItem' | 'freeDelivery'

    @Column()
    value: string;

    @Column({ default: true })
    active: boolean;

    @Column({ default: 0 })
    redemptions: number;
}
