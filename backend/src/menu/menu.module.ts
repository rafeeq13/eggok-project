import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { Category } from './category.entity';
import { Item } from './item.entity';
import { ModifierGroup } from './modifier-group.entity';
import { ModifierOption } from './modifier-option.entity';
import { ItemModifierGroup } from './item-modifier-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Item, ModifierGroup, ModifierOption, ItemModifierGroup])],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}