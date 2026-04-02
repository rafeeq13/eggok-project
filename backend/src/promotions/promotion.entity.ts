import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('promotions')
export class Promotion {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    code: string;

    @Column()
    name: string;

    @Column()
    type: string; // 'Percentage' | 'Fixed Amount' | 'Free Item'

    @Column()
    value: string;

    @Column({ nullable: true })
    minOrder: string;

    @Column({ nullable: true })
    startDate: string;

    @Column({ nullable: true })
    endDate: string;

    @Column({ nullable: true })
    usageLimit: string;

    @Column({ default: 0 })
    usedCount: number;

    @Column({ default: 'Active' })
    status: string; // 'Active' | 'Scheduled' | 'Expired' | 'Paused'
}
