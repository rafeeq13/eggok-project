import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './customer.entity';
import { AdminGuard } from '../auth/admin.guard';

@Controller('customers')
@UseGuards(AdminGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.customersService.findAll(page ? +page : 1, limit ? +limit : 50);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Customer | null> {
        return this.customersService.findOne(+id);
    }

    @Post()
    create(@Body() customer: Partial<Customer>): Promise<Customer> {
        return this.customersService.create(customer);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() customer: Partial<Customer>): Promise<Customer | null> {
        return this.customersService.update(+id, customer);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.customersService.remove(+id);
    }
}
