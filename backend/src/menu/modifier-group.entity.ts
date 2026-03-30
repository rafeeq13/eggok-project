import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ModifierOption } from './modifier-option.entity';
import { ItemModifierGroup } from './item-modifier-group.entity';

@Entity('modifier_groups')
export class ModifierGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: false })
  required: boolean;

  @Column({ default: 0 })
  minSelections: number;

  @Column({ default: 1 })
  maxSelections: number;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(() => ModifierOption, option => option.modifierGroup, { cascade: true, eager: true })
  options: ModifierOption[];

  @OneToMany(() => ItemModifierGroup, img => img.modifierGroup)
  itemModifierGroups: ItemModifierGroup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}