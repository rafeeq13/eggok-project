import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { Reward } from './reward.entity';
import { Customer } from '../customers/customer.entity';

@Controller('loyalty')
export class LoyaltyController {
    constructor(private readonly loyaltyService: LoyaltyService) { }

    @Get('rewards')
    findAllRewards(): Promise<Reward[]> {
        return this.loyaltyService.findAllRewards();
    }

    @Post('rewards')
    createReward(@Body() reward: Partial<Reward>): Promise<Reward> {
        return this.loyaltyService.createReward(reward);
    }

    @Put('rewards/:id')
    updateReward(@Param('id') id: string, @Body() reward: Partial<Reward>): Promise<Reward | null> {
        return this.loyaltyService.updateReward(+id, reward);
    }

    @Delete('rewards/:id')
    removeReward(@Param('id') id: string): Promise<void> {
        return this.loyaltyService.removeReward(+id);
    }

    @Get('members')
    findAllMembers(): Promise<Customer[]> {
        return this.loyaltyService.findAllMembers();
    }
}
