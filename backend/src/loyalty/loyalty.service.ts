import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './reward.entity';
import { Customer } from '../customers/customer.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class LoyaltyService {
    constructor(
        @InjectRepository(Reward)
        private readonly rewardRepository: Repository<Reward>,
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
        private readonly settingsService: SettingsService,
    ) { }

    // Calculate tier based on lifetime points
    static calculateTier(totalPointsEarned: number): string {
        if (totalPointsEarned >= 1500) return 'Gold';
        if (totalPointsEarned >= 500) return 'Silver';
        return 'Bronze';
    }

    // Get tier-based point multiplier
    static getTierMultiplier(tier: string): number {
        switch (tier) {
            case 'Gold': return 2;
            case 'Silver': return 1.5;
            default: return 1;
        }
    }

    // Update customer tier if needed
    async updateCustomerTier(customerId: number): Promise<void> {
        const customer = await this.customerRepository.findOne({ where: { id: customerId } });
        if (!customer) return;
        const newTier = LoyaltyService.calculateTier(customer.totalPointsEarned);
        if (newTier !== customer.tier) {
            await this.customerRepository.update(customerId, { tier: newTier });
        }
    }

    // Get loyalty settings
    async getLoyaltySettings() {
        const settings = await this.settingsService.getSetting('loyalty');
        return {
            loyaltyEnabled: settings?.loyaltyEnabled ?? true,
            pointsPerDollar: settings?.pointsPerDollar ?? 1,
            signupBonus: settings?.signupBonus ?? 50,
            minRedeemPoints: settings?.minRedeemPoints ?? 100,
            pointsExpiry: settings?.pointsExpiry ?? 12,
            birthdayBonus: settings?.birthdayBonus ?? 100,
            referralBonus: settings?.referralBonus ?? 75,
        };
    }

    // Rewards CRUD
    findAllRewards(): Promise<Reward[]> {
        return this.rewardRepository.find();
    }

    findReward(id: number): Promise<Reward | null> {
        return this.rewardRepository.findOneBy({ id });
    }

    createReward(reward: Partial<Reward>): Promise<Reward> {
        const newReward = this.rewardRepository.create(reward);
        return this.rewardRepository.save(newReward);
    }

    async updateReward(id: number, reward: Partial<Reward>): Promise<Reward | null> {
        await this.rewardRepository.update(id, reward);
        return this.findReward(id);
    }

    async removeReward(id: number): Promise<void> {
        await this.rewardRepository.delete(id);
    }

    // Members
    async findAllMembers(page = 1, limit = 50): Promise<{ data: Customer[]; total: number; page: number; limit: number }> {
        const [data, total] = await this.customerRepository.findAndCount({
            order: { points: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }
}
