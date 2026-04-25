import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { GiftCardRedemption } from './gift-card-redemption.entity';

@Entity('gift_cards')
export class GiftCard {
  @PrimaryGeneratedColumn()
  id: number;

  // Customer-facing redemption code (e.g. GC-K3FQ-7H2P-XR81). Always uppercase.
  @Index({ unique: true })
  @Column({ length: 32 })
  code: string;

  // Stripe PaymentIntent that funded this card. Used for idempotent issuance —
  // the webhook and the post-payment fallback can both safely call issueFromPayment.
  @Index({ unique: true })
  @Column({ nullable: true })
  paymentIntentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  initialBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  remainingBalance: number;

  @Column({ length: 20, default: 'active' })
  status: 'active' | 'used' | 'expired' | 'cancelled' | string;

  @Column({ nullable: true })
  recipientName: string;

  @Column({ nullable: true })
  recipientEmail: string;

  @Column({ nullable: true })
  senderName: string;

  @Column({ nullable: true })
  senderEmail: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  // Optional expiry. Null = never expires (the gift cards page advertises this).
  @Column({ type: 'date', nullable: true })
  expiresAt: string | null;

  @OneToMany(() => GiftCardRedemption, (r) => r.giftCard)
  redemptions: GiftCardRedemption[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
