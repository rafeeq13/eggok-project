import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, UseGuards } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { Promotion } from './promotion.entity';
import { AdminGuard } from '../auth/admin.guard';

@Controller('promotions')
export class PromotionsController {
    constructor(private readonly promotionsService: PromotionsService) { }

    @Get()
    findAll(): Promise<Promotion[]> {
        return this.promotionsService.findAll();
    }

    @Post('validate')
    @HttpCode(200)
    validate(@Body() data: { code: string; subtotal: number }) {
        return this.promotionsService.validateCode(data.code, data.subtotal);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Promotion | null> {
        return this.promotionsService.findOne(+id);
    }

    @Post()
    @UseGuards(AdminGuard)
    create(@Body() promotion: Partial<Promotion>): Promise<Promotion> {
        return this.promotionsService.create(promotion);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    update(@Param('id') id: string, @Body() promotion: Partial<Promotion>): Promise<Promotion | null> {
        return this.promotionsService.update(+id, promotion);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    remove(@Param('id') id: string): Promise<void> {
        return this.promotionsService.remove(+id);
    }
}
