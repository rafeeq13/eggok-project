import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './promotion.entity';
import { Customer } from '../customers/customer.entity';
import { GiftCardsService } from '../gift-cards/gift-cards.service';

@Injectable()
export class PromotionsService {
    constructor(
        @InjectRepository(Promotion)
        private readonly promotionRepository: Repository<Promotion>,
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
        private readonly giftCardsService: GiftCardsService,
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
        kind?: 'promo' | 'reward' | 'gift_card';
        giftCard?: { code: string; balance: number; appliedAmount: number };
    }> {
        const trimmed = (code || '').toUpperCase().trim();

        // Gift cards live in their own table and behave as a payment method, not a
        // discount. Route GC- codes through the gift card service so the checkout
        // page can render the redemption separately and split the Stripe charge.
        if (trimmed.startsWith('GC-')) {
            const result = await this.giftCardsService.validateForCheckout(trimmed, subtotal);
            if (!result.valid) {
                return { valid: false, discountAmount: 0, discountLabel: '', message: result.message, kind: 'gift_card' };
            }
            return {
                valid: true,
                discountAmount: 0, // not a discount — frontend adjusts the Stripe charge instead
                discountLabel: `Gift card $${(result.appliedAmount || 0).toFixed(2)}`,
                message: result.message,
                kind: 'gift_card',
                giftCard: {
                    code: result.code!,
                    balance: result.balance!,
                    appliedAmount: result.appliedAmount!,
                },
            };
        }

        const promo = await this.promotionRepository.findOne({
            where: { code: trimmed },
        });

        if (!promo) {
            // Check if it's a loyalty reward code (RW-xxx format)
            return this.validateRewardCode(code, subtotal);
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
            message: `${promo.name} applied  ${discountLabel}!`,
        };
    }

    private async validateRewardCode(code: string, subtotal: number): Promise<{
        valid: boolean;
        discountAmount: number;
        discountLabel: string;
        message: string;
    }> {
        const invalid = { valid: false, discountAmount: 0, discountLabel: '', message: 'Invalid promo code' };

        if (!code.startsWith('RW-')) return invalid;

        // Find customer with this reward code
        const customers = await this.customerRepository.find();
        let matchedCustomer: Customer | null = null;
        let matchedReward: any = null;
        let rewardIndex = -1;

        for (const customer of customers) {
            const rewards = Array.isArray(customer.redeemedRewards) ? customer.redeemedRewards : [];
            const idx = rewards.findIndex((r: any) => r.code === code && !r.used);
            if (idx !== -1) {
                matchedCustomer = customer;
                matchedReward = rewards[idx];
                rewardIndex = idx;
                break;
            }
        }

        if (!matchedCustomer || !matchedReward) {
            return { valid: false, discountAmount: 0, discountLabel: '', message: 'Invalid or already used reward code' };
        }

        let discountAmount = 0;
        let discountLabel = '';

        if (matchedReward.type === 'discount') {
            discountAmount = Math.min(Number(matchedReward.value), subtotal);
            discountLabel = `$${Number(matchedReward.value).toFixed(2)} off (Reward)`;
        } else if (matchedReward.type === 'freeDelivery') {
            discountAmount = 0; // Delivery fee handled separately
            discountLabel = 'Free Delivery (Reward)';
        } else if (matchedReward.type === 'freeItem') {
            discountAmount = 0;
            discountLabel = `${matchedReward.value} (Reward)`;
        }

        // Mark the reward code as used
        const rewards = Array.isArray(matchedCustomer.redeemedRewards) ? matchedCustomer.redeemedRewards : [];
        rewards[rewardIndex].used = true;
        await this.customerRepository.update(matchedCustomer.id, { redeemedRewards: rewards });

        return {
            valid: true,
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            discountLabel,
            message: `${matchedReward.rewardName} applied! ${discountLabel}`,
        };
    }
}
