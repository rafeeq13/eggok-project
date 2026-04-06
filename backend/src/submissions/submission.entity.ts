import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['hiring', 'catering', 'contact'] })
  type: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ default: 'new' })
  status: string; // 'new' | 'reviewed' | 'archived'

  @Column({ nullable: true, type: 'text' })
  adminNotes: string;

  @CreateDateColumn()
  createdAt: Date;
}
