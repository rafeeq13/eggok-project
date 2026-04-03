import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Customer } from '../customers/customer.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
        private jwtService: JwtService,
    ) { }

    async register(data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password: string;
    }) {
        // Check if email already registered
        const existing = await this.customersRepository.findOne({
            where: { email: data.email },
        });

        if (existing) {
            // If customer exists but has no password (created via old order flow), let them claim the account
            if (!existing.password) {
                const hashedPassword = await bcrypt.hash(data.password, 10);
                await this.customersRepository.update(existing.id, {
                    password: hashedPassword,
                    name: `${data.firstName} ${data.lastName}`,
                    phone: data.phone,
                });
                const token = this.jwtService.sign({ sub: existing.id, email: existing.email });
                return {
                    token,
                    user: {
                        id: existing.id,
                        name: `${data.firstName} ${data.lastName}`,
                        email: existing.email,
                        phone: data.phone,
                    },
                };
            }
            throw new ConflictException('An account with this email already exists');
        }

        const today = new Date().toISOString().split('T')[0];
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const customer = this.customersRepository.create({
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
            totalOrders: 0,
            totalSpent: 0,
            points: 50, // Sign-up bonus
            totalPointsEarned: 50,
            tier: 'Bronze',
            redemptions: 0,
            lastActivity: today,
            status: 'Active',
        });

        const saved = await this.customersRepository.save(customer);

        const token = this.jwtService.sign({ sub: saved.id, email: saved.email });
        return {
            token,
            user: {
                id: saved.id,
                name: saved.name,
                email: saved.email,
                phone: saved.phone,
            },
        };
    }

    async login(email: string, password: string) {
        // Need to explicitly select password since it's excluded by default
        const customer = await this.customersRepository
            .createQueryBuilder('customer')
            .addSelect('customer.password')
            .where('customer.email = :email', { email })
            .getOne();

        if (!customer || !customer.password) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // Update last activity
        const today = new Date().toISOString().split('T')[0];
        await this.customersRepository.update(customer.id, { lastActivity: today });

        const token = this.jwtService.sign({ sub: customer.id, email: customer.email });
        return {
            token,
            user: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                points: customer.points,
                tier: customer.tier,
                totalOrders: customer.totalOrders,
                totalSpent: customer.totalSpent,
                joinDate: customer.joinDate,
            },
        };
    }

    async getProfile(customerId: number) {
        const customer = await this.customersRepository.findOne({
            where: { id: customerId },
        });
        if (!customer) {
            throw new UnauthorizedException('User not found');
        }
        return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            points: customer.points,
            totalPointsEarned: customer.totalPointsEarned,
            tier: customer.tier,
            totalOrders: customer.totalOrders,
            totalSpent: customer.totalSpent,
            redemptions: customer.redemptions,
            joinDate: customer.joinDate,
            status: customer.status,
        };
    }

    async updateProfile(customerId: number, data: {
        name?: string;
        email?: string;
        phone?: string;
        currentPassword?: string;
        newPassword?: string;
    }) {
        const updateData: Partial<Customer> = {};

        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.phone) updateData.phone = data.phone;

        // Handle password change
        if (data.newPassword && data.currentPassword) {
            const customer = await this.customersRepository
                .createQueryBuilder('customer')
                .addSelect('customer.password')
                .where('customer.id = :id', { id: customerId })
                .getOne();

            if (!customer || !customer.password) {
                throw new UnauthorizedException('User not found');
            }

            const isMatch = await bcrypt.compare(data.currentPassword, customer.password);
            if (!isMatch) {
                throw new UnauthorizedException('Current password is incorrect');
            }

            updateData.password = await bcrypt.hash(data.newPassword, 10);
        }

        if (Object.keys(updateData).length > 0) {
            await this.customersRepository.update(customerId, updateData);
        }

        return this.getProfile(customerId);
    }
}
