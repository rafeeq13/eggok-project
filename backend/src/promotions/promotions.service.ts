import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './promotion.entity';

@Injectable()
export class PromotionsService {
    constructor(
        @InjectRepository(Promotion)
        private readonly promotionRepository: Repository<Promotion>,
    ) { }

    findAll(): Promise<Promotion[]> {
        return this.promotionRepository.find();
    }

    findOne(id: number): Promise<Promotion | null> {
        return this.promotionRepository.findOneBy({ id });
    }

    create(promotion: Partial<Promotion>): Promise<Promotion> {
        const newPromotion = this.promotionRepository.create(promotion);
        return this.promotionRepository.save(newPromotion);
    }

    async update(id: number, promotion: Partial<Promotion>): Promise<Promotion | null> {
        await this.promotionRepository.update(id, promotion);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.promotionRepository.delete(id);
    }
}
