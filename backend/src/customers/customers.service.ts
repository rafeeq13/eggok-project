import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, IsNull, Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    async findAll(page = 1, limit = 50): Promise<{ data: Customer[]; total: number; page: number; limit: number }> {
        const [data, total] = await this.customerRepository.findAndCount({
            where: { password: Not(IsNull()) },
            order: { joinDate: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }

    findOne(id: number): Promise<Customer | null> {
        return this.customerRepository.findOneBy({ id });
    }

    create(customer: Partial<Customer>): Promise<Customer> {
        const newCustomer = this.customerRepository.create(customer);
        return this.customerRepository.save(newCustomer);
    }

    async update(id: number, customer: Partial<Customer>): Promise<Customer | null> {
        await this.customerRepository.update(id, customer);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.customerRepository.delete(id);
    }
}
