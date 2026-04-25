import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNumber: string;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column()
  customerPhone: string;

  @Column({ type: 'enum', enum: ['pickup', 'delivery'], default: 'pickup' })
  orderType: string;

  @Column({ type: 'enum', enum: ['asap', 'scheduled'], default: 'asap' })
  scheduleType: string;

  @Column({ nullable: true })
  scheduledDate: string;

  @Column({ nullable: true })
  scheduledTime: string;

  @Column({ nullable: true })
  deliveryAddress: string;

  @Column({ nullable: true })
  deliveryApt: string;

  @Column({ nullable: true })
  deliveryInstructions: string;

  @Column({ type: 'json' })
  items: any[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tip: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar', length: 50, default: 'pending_payment' })
  status: string;

  @Column({ nullable: true })
  promoCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ nullable: true })
  notes: string;

  // Stripe payment tracking
  @Column({ nullable: true, unique: true })
  paymentIntentId: string;

  // Gift card payment tracking. giftCardAmount is the amount debited from the
  // card; the rest of the total is charged via Stripe (or zero if the card
  // covers the whole order — in that case paymentIntentId stays null).
  @Column({ nullable: true })
  giftCardCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  giftCardAmount: number;

  // Square POS sync tracking
  @Column({ nullable: true })
  squareOrderId: string;

  @Column({ default: 'pending' })
  squareSyncStatus: string; // 'pending' | 'synced' | 'failed' | 'not_required'

  @Column({ default: 0 })
  squareSyncAttempts: number;

  @Column({ nullable: true })
  squareSyncLastError: string;

  // Delivery dispatch tracking
  @Column({ nullable: true })
  deliveryProvider: string; // 'uber_direct' | 'doordash' | null

  @Column({ nullable: true })
  deliveryQuoteId: string;

  @Column({ nullable: true })
  deliveryTrackingUrl: string;

  @Column({ nullable: true })
  deliveryDriverName: string;

  @Column({ nullable: true })
  deliveryDriverPhone: string;

  @Column({ nullable: true })
  deliveryEta: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}