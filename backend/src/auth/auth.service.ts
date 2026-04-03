import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Customer } from '../customers/customer.entity';
import { CustomerToken } from './customer-token.entity';
import { MailService } from '../mail/mail.service';

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
        @InjectRepository(CustomerToken)
        private tokenRepository: Repository<CustomerToken>,
        private mailService: MailService,
        private configService: ConfigService,
    ) { }

    private async issueToken(customerId: number): Promise<string> {
        const token = crypto.randomBytes(32).toString('hex');
        await this.tokenRepository.save({
            token,
            customerId,
            expiresAt: Date.now() + TOKEN_TTL_MS,
        });
        return token;
    }

    async register(data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password: string;
    }) {
        const existing = await this.customersRepository.findOne({
            where: { email: data.email },
        });

        if (existing) {
            if (!existing.password) {
                const hashedPassword = await bcrypt.hash(data.password, 10);
                await this.customersRepository.update(existing.id, {
                    password: hashedPassword,
                    name: `${data.firstName} ${data.lastName}`,
                    phone: data.phone,
                });
                const token = await this.issueToken(existing.id);
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
            points: 50,
            totalPointsEarned: 50,
            tier: 'Bronze',
            redemptions: 0,
            lastActivity: today,
            status: 'Active',
        });

        const saved = await this.customersRepository.save(customer);
        const token = await this.issueToken(saved.id);

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

        const today = new Date().toISOString().split('T')[0];
        await this.customersRepository.update(customer.id, { lastActivity: today });

        const token = await this.issueToken(customer.id);

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

    async logout(rawToken: string) {
        await this.tokenRepository.delete({ token: rawToken });
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

    async forgotPassword(email: string) {
        const customer = await this.customersRepository.findOne({ where: { email } });

        if (!customer || !customer.password) {
            console.warn(`[AUTH] Password reset requested for missing or guest user: ${email}`);
            return { message: 'If an account with that email exists, a reset link has been sent.' };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + 3600000; // 1 hour

        await this.customersRepository.update(customer.id, {
            resetPasswordToken: token,
            resetPasswordExpiry: expiry,
        });

        const websiteUrl = this.configService.get<string>('WEBSITE_URL') ||
            this.configService.get<string>('FRONTEND_URL') ||
            'http://localhost:3001';
        const resetLink = `${websiteUrl}/reset-password?token=${token}`;

        console.log(`[DEBUG] Attempting password reset for: ${customer.email}`);
        console.log(`[DEBUG] Reset link: ${resetLink}`);

        try {
            const sent = await this.mailService.sendPasswordResetEmail(customer.email, customer.name, resetLink);
            if (!sent) {
                throw new BadRequestException('We are currently unable to send password reset emails. Please contact support.');
            }
        } catch (error) {
            console.error(`Unexpected mailer error for ${customer.email}:`, error);
            const msg = error instanceof Error ? error.message : 'Please check SMTP settings in Admin panel';
            throw new BadRequestException(`Email delivery failed: ${msg}`);
        }

        return { message: 'If an account with that email exists, a reset link has been sent.' };
    }

    async resetPassword(token: string, newPassword: string) {
        if (!token || !newPassword) {
            throw new BadRequestException('Token and new password are required');
        }
        if (newPassword.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters');
        }

        const customer = await this.customersRepository
            .createQueryBuilder('customer')
            .addSelect('customer.resetPasswordToken')
            .addSelect('customer.resetPasswordExpiry')
            .where('customer.resetPasswordToken = :token', { token })
            .getOne();

        if (!customer) {
            console.warn(`Password reset failed: Invalid token "${token}"`);
            throw new BadRequestException('Invalid or expired reset link');
        }

        if (!customer.resetPasswordExpiry || Date.now() > Number(customer.resetPasswordExpiry)) {
            throw new BadRequestException('Reset link has expired. Please request a new one.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.customersRepository.update(customer.id, {
            password: hashedPassword,
            resetPasswordToken: null as any,
            resetPasswordExpiry: null as any,
        });

        // Invalidate all existing sessions after password change
        await this.tokenRepository.delete({ customerId: customer.id });

        return { message: 'Password reset successfully. You can now sign in.' };
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
