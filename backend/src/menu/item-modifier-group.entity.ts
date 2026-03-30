 import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Item } from './item.entity';
import { ModifierGroup } from './modifier-group.entity';

@Entity('item_modifier_groups')
export class ItemModifierGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column()
  itemId: number;

  @ManyToOne(() => ModifierGroup, group => group.itemModifierGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modifierGroupId' })
  modifierGroup: ModifierGroup;

  @Column()
  modifierGroupId: number;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;
}
