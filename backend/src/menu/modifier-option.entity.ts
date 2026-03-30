 import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ModifierGroup } from './modifier-group.entity';

@Entity('modifier_options')
export class ModifierOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => ModifierGroup, group => group.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modifierGroupId' })
  modifierGroup: ModifierGroup;

  @Column()
  modifierGroupId: number;
}
