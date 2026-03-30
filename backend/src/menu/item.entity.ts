import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Category } from './category.entity';
import { OneToMany } from 'typeorm';
import { ItemModifierGroup } from './item-modifier-group.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pickupPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  deliveryPrice: number;

  @Column({ nullable: true })
  image: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  isPopular: boolean;
@Column({ default: false })
  isDeleted: boolean;
  @Column({ default: 0 })
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  modifiers: any;

  @OneToMany(() => ItemModifierGroup, img => img.item)
  itemModifierGroups: ItemModifierGroup[];

  @ManyToOne(() => Category, category => category.items)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}