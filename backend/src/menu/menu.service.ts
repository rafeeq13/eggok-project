import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { Item } from './item.entity';
import { ModifierGroup } from './modifier-group.entity';
import { ModifierOption } from './modifier-option.entity';
import { ItemModifierGroup } from './item-modifier-group.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(ModifierGroup)
    private modifierGroupRepository: Repository<ModifierGroup>,
    @InjectRepository(ModifierOption)
    private modifierOptionRepository: Repository<ModifierOption>,
    @InjectRepository(ItemModifierGroup)
    private itemModifierGroupRepository: Repository<ItemModifierGroup>,
  ) {}

  // ── CATEGORIES ──
  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!category) throw new NotFoundException(`Category #${id} not found`);
    return category;
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    await this.categoryRepository.update(id, data);
    return this.getCategoryById(id);
  }

  async deleteCategory(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }

  // ── ITEMS ──
  async getAllItems(): Promise<Item[]> {
    return this.itemRepository.find({
      relations: ['category'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getItemsByCategory(categoryId: number): Promise<Item[]> {
    return this.itemRepository.find({
      where: { categoryId, isAvailable: true, isDeleted: false },
      order: { sortOrder: 'ASC' },
    });
  }

  async getPopularItems(): Promise<Item[]> {
    return this.itemRepository.find({
      where: { isPopular: true, isAvailable: true, isDeleted: false },
      relations: ['category'],
      order: { sortOrder: 'ASC' },
    });
  }

  async getItemById(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!item) throw new NotFoundException(`Item #${id} not found`);
    return item;
  }

  async createItem(data: Partial<Item>): Promise<Item> {
    const item = this.itemRepository.create({
      isAvailable: true,
      isPopular: false,
      isDeleted: false,
      sortOrder: 1,
      ...data,
    });
    return this.itemRepository.save(item);
  }

  async updateItem(id: number, data: Partial<Item>): Promise<Item> {
    await this.itemRepository.update(id, data);
    return this.getItemById(id);
  }

  async deleteItem(id: number): Promise<void> {
    await this.itemModifierGroupRepository.delete({ itemId: id });
    await this.itemRepository.delete(id);
  }

  // ── FULL MENU ──
  async getFullMenu(): Promise<any> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true, isDeleted: false },
      relations: ['items'],
      order: { sortOrder: 'ASC' },
    });
    return categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item => item.isAvailable && !item.isDeleted),
    }));
  }

  // ── SEED DATA ──
  async seedMenu(): Promise<void> {
    const count = await this.categoryRepository.count();
    if (count > 0) return;

    const categoriesData = [
      { name: 'Breakfast Sandwiches', sortOrder: 1 },
      { name: 'Burritos', sortOrder: 2 },
      { name: 'Not Sandwiches', sortOrder: 3 },
      { name: 'Pancakes', sortOrder: 4 },
      { name: 'Omelettes', sortOrder: 5 },
      { name: 'Lunch Sandwiches', sortOrder: 6 },
      { name: 'Specialty Lattes', sortOrder: 7 },
      { name: 'Matcha Edition', sortOrder: 8 },
      { name: 'Cold Foam', sortOrder: 9 },
      { name: 'Coffee', sortOrder: 10 },
      { name: 'Tea & Lemonade', sortOrder: 11 },
      { name: 'Smoothies', sortOrder: 12 },
      { name: 'Wellness Smoothies', sortOrder: 13 },
    ];

    const categories = await this.categoryRepository.save(
      categoriesData.map(c => this.categoryRepository.create(c))
    );

    const itemsData = [
      { name: 'Signature Bacon Egg & Cheese', description: 'Bacon of choice, Scrambled eggs, Coopersharp American cheese, Housemade OK sauce on toasted brioche bun.', pickupPrice: 11.00, deliveryPrice: 12.00, isPopular: true, categoryId: categories[0].id, sortOrder: 1 },
      { name: 'Sausage Egg & Cheese', description: 'Sausage of choice, Scrambled eggs, Coopersharp American, Housemade OK Sauce on Toasted Brioche Bun.', pickupPrice: 11.00, deliveryPrice: 12.00, isPopular: true, categoryId: categories[0].id, sortOrder: 2 },
      { name: 'Deluxe Sammies', description: 'Bacon of Choice, 2 Fried eggs, Cheddar, Hashbrown, Arugula, Housemade OK Sauce.', pickupPrice: 13.00, deliveryPrice: 14.00, isPopular: true, categoryId: categories[0].id, sortOrder: 3 },
      { name: 'Nashville Hot Chicken Breakfast Sandwich', description: 'Nashville Hot Chicken Tender, Over medium egg, pickles, coleslaw, Housemade OK sauce.', pickupPrice: 13.00, deliveryPrice: 14.00, isPopular: true, categoryId: categories[0].id, sortOrder: 4 },
      { name: 'OK Breakfast Burrito', description: 'Soft Scrambled Eggs, Cheddar, Choice of Bacon, Hashbrown, Arugula, Housemade OK sauce.', pickupPrice: 13.00, deliveryPrice: 14.00, isPopular: true, categoryId: categories[1].id, sortOrder: 1 },
      { name: 'Steak & Egg', description: 'Angus Steak, Choice of Eggs, Hashbrown.', pickupPrice: 16.00, deliveryPrice: 17.00, isPopular: true, categoryId: categories[2].id, sortOrder: 1 },
      { name: 'Hot Honey Chicken & Waffle', description: 'OK Hot Honey, 2 Chicken Tender on Belgian Waffle.', pickupPrice: 15.00, deliveryPrice: 16.00, isPopular: true, categoryId: categories[2].id, sortOrder: 2 },
      { name: 'Short Stack', description: '3 Fluffy pancakes with choice of toppings.', pickupPrice: 8.00, deliveryPrice: 9.00, categoryId: categories[3].id, sortOrder: 1 },
      { name: 'Long Stack', description: '5 Fluffy pancakes with choice of toppings.', pickupPrice: 10.00, deliveryPrice: 11.00, categoryId: categories[3].id, sortOrder: 2 },
      { name: 'OK Omelette', description: '3 Eggs, Turkey bacon, Turkey sausage, spinach & tomato.', pickupPrice: 13.00, deliveryPrice: 14.00, categoryId: categories[4].id, sortOrder: 1 },
      { name: 'Tiramisu Latte', description: 'Made W/ Real Mascarpone, espresso, ladyfinger syrup.', pickupPrice: 6.50, deliveryPrice: 6.50, isPopular: true, categoryId: categories[6].id, sortOrder: 1 },
      { name: 'Matcha Latte', description: 'Premium ceremonial grade matcha with steamed milk.', pickupPrice: 5.50, deliveryPrice: 5.50, isPopular: true, categoryId: categories[7].id, sortOrder: 1 },
      { name: 'Strawberry Matcha', description: 'Matcha latte layered with strawberry puree.', pickupPrice: 6.50, deliveryPrice: 6.50, isPopular: true, categoryId: categories[7].id, sortOrder: 2 },
    ];

    await this.itemRepository.save(
      itemsData.map(i => this.itemRepository.create(i))
    );
  }
  // ── MODIFIER GROUPS ──
  async getAllModifierGroups(): Promise<ModifierGroup[]> {
    return this.modifierGroupRepository.find({
      relations: ['options'],
      order: { createdAt: 'ASC' },
    });
  }

  async createModifierGroup(data: any): Promise<ModifierGroup> {
    const group = this.modifierGroupRepository.create({
      name: data.name,
      required: data.required || false,
      minSelections: data.minSelections || 0,
      maxSelections: data.maxSelections || 1,
    });
    const saved = await this.modifierGroupRepository.save(group);
    if (data.options && data.options.length > 0) {
      const options = data.options.map((o: any) => this.modifierOptionRepository.create({
        name: o.name,
        price: o.price || 0,
        isDefault: o.isDefault || false,
        modifierGroupId: saved.id,
      }));
      await this.modifierOptionRepository.save(options);
    }
    return this.getModifierGroupById(saved.id);
  }

  async getModifierGroupById(id: number): Promise<ModifierGroup> {
    const group = await this.modifierGroupRepository.findOne({
      where: { id },
      relations: ['options'],
    });
    if (!group) throw new NotFoundException(`ModifierGroup #${id} not found`);
    return group;
  }

  async updateModifierGroup(id: number, data: any): Promise<ModifierGroup> {
    await this.modifierGroupRepository.update(id, {
      name: data.name,
      required: data.required,
      minSelections: data.minSelections,
      maxSelections: data.maxSelections,
    });
    if (data.options) {
      await this.modifierOptionRepository.delete({ modifierGroupId: id });
      const options = data.options.map((o: any) => this.modifierOptionRepository.create({
        name: o.name,
        price: o.price || 0,
        isDefault: o.isDefault || false,
        modifierGroupId: id,
      }));
      await this.modifierOptionRepository.save(options);
    }
    return this.getModifierGroupById(id);
  }

  async deleteModifierGroup(id: number): Promise<void> {
    const links = await this.itemModifierGroupRepository.find({ where: { modifierGroupId: id } });
    for (const link of links) {
      const item = await this.itemRepository.findOne({ where: { id: link.itemId } });
      if (item?.modifiers && Array.isArray(item.modifiers)) {
        const updatedModifiers = item.modifiers.filter((m: any) => m.id !== id);
        await this.itemRepository.update(link.itemId, { modifiers: updatedModifiers });
      }
    }
    await this.itemModifierGroupRepository.delete({ modifierGroupId: id });
    await this.modifierGroupRepository.delete(id);
  }

  // ── ITEM-MODIFIER LINKING ──
  async linkModifierToItem(itemId: number, modifierGroupId: number, sortOrder: number = 0): Promise<void> {
    const existing = await this.itemModifierGroupRepository.findOne({
      where: { itemId, modifierGroupId },
    });
    if (!existing) {
      await this.itemModifierGroupRepository.save(
        this.itemModifierGroupRepository.create({ itemId, modifierGroupId, sortOrder })
      );
    }
  }

  async unlinkModifierFromItem(itemId: number, modifierGroupId: number): Promise<void> {
    await this.itemModifierGroupRepository.delete({ itemId, modifierGroupId });
  }

  async getItemModifiers(itemId: number): Promise<ModifierGroup[]> {
    const links = await this.itemModifierGroupRepository.find({
      where: { itemId },
      relations: ['modifierGroup', 'modifierGroup.options'],
      order: { sortOrder: 'ASC' },
    });
    return links.map(l => l.modifierGroup);
  }

  async getModifierLinkedItems(modifierGroupId: number): Promise<number[]> {
    const links = await this.itemModifierGroupRepository.find({
      where: { modifierGroupId },
    });
    return links.map(l => l.itemId);
  }
  async reorderCategories(orderedIds: number[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.categoryRepository.update(orderedIds[i], { sortOrder: i + 1 });
    }
  }
}