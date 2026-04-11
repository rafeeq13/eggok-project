import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { Reward } from './reward.entity';
import { Customer } from '../customers/customer.entity';
import { AdminGuard } from '../auth/admin.guard';

@Controller('loyalty')
export class LoyaltyController {
    constructor(private readonly loyaltyService: LoyaltyService) { }

    @Get('rewards')
    findAllRewards(): Promise<Reward[]> {
        return this.loyaltyService.findAllRewards();
    }

    @Post('rewards')
    @UseGuards(AdminGuard)
    createReward(@Body() reward: Partial<Reward>): Promise<Reward> {
        return this.loyaltyService.createReward(reward);
    }

    @Put('rewards/:id')
    @UseGuards(AdminGuard)
    updateReward(@Param('id') id: string, @Body() reward: Partial<Reward>): Promise<Reward | null> {
        return this.loyaltyService.updateReward(+id, reward);
    }

    @Delete('rewards/:id')
    @UseGuards(AdminGuard)
    removeReward(@Param('id') id: string): Promise<void> {
        return this.loyaltyService.removeReward(+id);
    }

    @Get('members')
    @UseGuards(AdminGuard)
    findAllMembers(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.loyaltyService.findAllMembers(page ? +page : 1, limit ? +limit : 50);
    }
}
