import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    findAll(): Promise<Customer[]> {
        return this.customerRepository.find({ order: { joinDate: 'DESC' } });
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
