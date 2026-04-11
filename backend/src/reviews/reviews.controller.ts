import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './review.entity';
import { AdminGuard } from '../auth/admin.guard';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Get()
    findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.reviewsService.findAll(page ? +page : 1, limit ? +limit : 50);
    }

    @Post()
    create(@Body() review: Partial<Review>): Promise<Review> {
        return this.reviewsService.create(review);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Review | null> {
        return this.reviewsService.findOne(+id);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    update(@Param('id') id: string, @Body() review: Partial<Review>): Promise<Review | null> {
        return this.reviewsService.update(+id, review);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    patch(@Param('id') id: string, @Body() review: Partial<Review>): Promise<Review | null> {
        return this.reviewsService.update(+id, review);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    remove(@Param('id') id: string): Promise<void> {
        return this.reviewsService.remove(+id);
    }
}
