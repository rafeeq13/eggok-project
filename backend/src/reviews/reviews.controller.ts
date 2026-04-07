import { Controller, Get, Post, Put, Patch, Delete, Body, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Review } from './review.entity';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Get()
    findAll(): Promise<Review[]> {
        return this.reviewsService.findAll();
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
    update(@Param('id') id: string, @Body() review: Partial<Review>): Promise<Review | null> {
        return this.reviewsService.update(+id, review);
    }

    @Patch(':id')
    patch(@Param('id') id: string, @Body() review: Partial<Review>): Promise<Review | null> {
        return this.reviewsService.update(+id, review);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.reviewsService.remove(+id);
    }
}
