import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './reward.entity';
import { Customer } from '../customers/customer.entity';

@Injectable()
export class LoyaltyService {
    constructor(
        @InjectRepository(Reward)
        private readonly rewardRepository: Repository<Reward>,
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

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
