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

    async findAll(): Promise<Promotion[]> {
        // Auto-expire promotions past their end date
        const today = new Date().toISOString().split('T')[0];
        await this.promotionRepository
            .createQueryBuilder()
            .update(Promotion)
            .set({ status: 'Expired' })
            .where('endDate < :today AND status = :status', { today, status: 'Active' })
            .execute();
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

    async validateCode(code: string, subtotal: number): Promise<{
        valid: boolean;
        discountAmount: number;
        discountLabel: string;
        message: string;
    }> {
        const promo = await this.promotionRepository.findOne({
            where: { code: code.toUpperCase().trim() },
        });

        if (!promo) {
            return { valid: false, discountAmount: 0, discountLabel: '', message: 'Invalid promo code' };
        }

        if (promo.status !== 'Active') {
            return { valid: false, discountAmount: 0, discountLabel: '', message: 'This promo code is no longer active' };
        }

        const today = new Date().toISOString().split('T')[0];
        if (promo.endDate && promo.endDate < today) {
            return { valid: false, discountAmount: 0, discountLabel: '', message: 'This promo code has expired' };
        }
        if (promo.startDate && promo.startDate > today) {
            return { valid: false, discountAmount: 0, discountLabel: '', message: 'This promo code is not yet active' };
        }

        if (promo.usageLimit && promo.usedCount >= Number(promo.usageLimit)) {
            return { valid: false, discountAmount: 0, discountLabel: '', message: 'This promo code has reached its usage limit' };
        }

        if (promo.minOrder && subtotal < Number(promo.minOrder)) {
            return {
                valid: false, discountAmount: 0, discountLabel: '',
                message: `Minimum order of $${Number(promo.minOrder).toFixed(2)} required for this code`,
            };
        }

        let discountAmount = 0;
        let discountLabel = '';

        if (promo.type === 'Percentage') {
            discountAmount = subtotal * (Number(promo.value) / 100);
            discountLabel = `${promo.value}% off`;
        } else if (promo.type === 'Fixed Amount') {
            discountAmount = Math.min(Number(promo.value), subtotal);
            discountLabel = `$${Number(promo.value).toFixed(2)} off`;
        } else {
            // Free Item — no monetary discount computed here
            discountAmount = 0;
            discountLabel = promo.name;
        }

        return {
            valid: true,
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            discountLabel,
            message: `${promo.name} applied — ${discountLabel}!`,
        };
    }
}
