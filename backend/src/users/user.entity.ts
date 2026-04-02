import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ default: 'Staff' })
    role: string; // 'Super Admin' | 'Manager' | 'Staff'

    @Column({ default: 'Invited' })
    status: string; // 'Active' | 'Invited' | 'Suspended'

    @CreateDateColumn()
    joinDate: Date;

    @UpdateDateColumn()
    lastActive: Date;
}
