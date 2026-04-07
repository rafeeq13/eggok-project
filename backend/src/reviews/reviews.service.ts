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

    findAll(): Promise<Review[]> {
        return this.reviewRepository.find({ order: { date: 'DESC' } });
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
