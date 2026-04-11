import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
    ) { }

    create(review: Partial<Review>): Promise<Review> {
        return this.reviewRepository.save(this.reviewRepository.create(review));
    }

    async findAll(page = 1, limit = 50): Promise<{ data: Review[]; total: number; page: number; limit: number }> {
        const [data, total] = await this.reviewRepository.findAndCount({
            order: { date: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }

    findOne(id: number): Promise<Review | null> {
        return this.reviewRepository.findOneBy({ id });
    }

    async update(id: number, review: Partial<Review>): Promise<Review | null> {
        await this.reviewRepository.update(id, review);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.reviewRepository.delete(id);
    }
}
