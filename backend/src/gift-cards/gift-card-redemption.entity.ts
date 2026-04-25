import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { GiftCard } from './gift-card.entity';

// Append-only ledger of every debit/credit against a gift card.
// Lets us audit balance moves and reverse a redemption when an order is cancelled
// (we look up the redemption by orderNumber and credit its amount back).
@Entity('gift_card_redemptions')
export class GiftCardRedemption {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => GiftCard, (gc) => gc.redemptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'giftCardId' })
  giftCard: GiftCard;

  @Column()
  giftCardId: number;

  // Order this redemption is tied to. Unique per (giftCardId, orderNumber, type)
  // gives us idempotency: re-running redeem for the same order is a no-op.
  @Index()
  @Column({ length: 32 })
  orderNumber: string;

  // Positive = debit (used at checkout). Negative = credit (refund on cancel).
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 20, default: 'redeemed' })
  type: 'redeemed' | 'refunded' | string;

  @CreateDateColumn()
  createdAt: Date;
}
