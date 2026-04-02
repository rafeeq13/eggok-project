import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) { }

    @Post()
    async seed() {
        await this.seedService.seedAll();
        return { message: 'Database seeded successfully' };
    }

    @Post('clear')
    async clear() {
        await this.seedService.clearAll();
        return { message: 'Database cleared successfully' };
    }
}
