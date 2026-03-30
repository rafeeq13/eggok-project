import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // ── PUBLIC ROUTES ──
  @Get()
  getFullMenu() {
    return this.menuService.getFullMenu();
  }

  @Get('categories')
  getAllCategories() {
    return this.menuService.getAllCategories();
  }

  @Get('popular')
  getPopularItems() {
    return this.menuService.getPopularItems();
  }

  @Get('items')
  getAllItems() {
    return this.menuService.getAllItems();
  }

  @Get('items/:id')
  getItemById(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.getItemById(id);
  }

  @Get('categories/:id')
  getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.getCategoryById(id);
  }

  @Get('categories/:id/items')
  getItemsByCategory(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.getItemsByCategory(id);
  }

  // ── ADMIN ROUTES ──
  @Post('categories')
  createCategory(@Body() data: any) {
    return this.menuService.createCategory(data);
  }

  @Put('categories/:id')
  updateCategory(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.menuService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.deleteCategory(id);
  }

  @Post('items')
  createItem(@Body() data: any) {
    return this.menuService.createItem(data);
  }

  @Put('items/:id')
  updateItem(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.menuService.updateItem(id, data);
  }

  @Delete('items/:id')
  deleteItem(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.deleteItem(id);
  }

  @Post('categories/reorder')
  reorderCategories(@Body() data: { orderedIds: number[] }) {
    return this.menuService.reorderCategories(data.orderedIds);
  }

  // ── SEED ──
  @Post('seed')
  seedMenu() {
    return this.menuService.seedMenu();
  }
  // ── MODIFIER GROUPS ──
  @Get('modifier-groups')
  getAllModifierGroups() {
    return this.menuService.getAllModifierGroups();
  }

  @Get('modifier-groups/:id')
  getModifierGroupById(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.getModifierGroupById(id);
  }

  @Post('modifier-groups')
  createModifierGroup(@Body() data: any) {
    return this.menuService.createModifierGroup(data);
  }

  @Put('modifier-groups/:id')
  updateModifierGroup(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.menuService.updateModifierGroup(id, data);
  }

  @Delete('modifier-groups/:id')
  deleteModifierGroup(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.deleteModifierGroup(id);
  }

  // ── ITEM-MODIFIER LINKING ──
  @Post('items/:itemId/modifiers/:modifierGroupId')
  linkModifier(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('modifierGroupId', ParseIntPipe) modifierGroupId: number,
    @Body() data: any,
  ) {
    return this.menuService.linkModifierToItem(itemId, modifierGroupId, data.sortOrder);
  }

  @Delete('items/:itemId/modifiers/:modifierGroupId')
  unlinkModifier(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Param('modifierGroupId', ParseIntPipe) modifierGroupId: number,
  ) {
    return this.menuService.unlinkModifierFromItem(itemId, modifierGroupId);
  }

  @Get('items/:itemId/modifiers')
  getItemModifiers(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.menuService.getItemModifiers(itemId);
  }

  @Get('modifier-groups/:id/items')
  getModifierLinkedItems(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.getModifierLinkedItems(id);
  }
}