import { Injectable, BadRequestException, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { MailService } from '../mail/mail.service';

const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
    ) { }

    async onModuleInit() {
        // Seed default Super Admin if none exists
        const existing = await this.userRepository.findOne({ where: { email: 'admin@eggok.com' } });
        if (!existing) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await this.userRepository.save({
                name: 'Admin',
                email: 'admin@eggok.com',
                password: hashedPassword,
                role: 'Super Admin',
                status: 'Active',
            });
            console.log('[USERS] Default Super Admin created: admin@eggok.com / admin123');
        } else if (existing.status === 'Invited') {
            // Fix: if admin exists but hasn't set password yet, set the default password
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await this.userRepository.update(existing.id, {
                password: hashedPassword,
                role: 'Super Admin',
                status: 'Active',
                inviteToken: null as any,
                inviteTokenExpiry: null as any,
            });
            console.log('[USERS] Default Super Admin activated: admin@eggok.com / admin123');
        }
    }

    findAll(): Promise<User[]> {
        return this.userRepository.find({ order: { joinDate: 'DESC' } });
    }

    findOne(id: string): Promise<User | null> {
        return this.userRepository.findOneBy({ id });
    }

    async create(user: Partial<User>): Promise<User> {
        const inviteToken = crypto.randomBytes(32).toString('hex');
        const newUser = this.userRepository.create({
            ...user,
            inviteToken,
            inviteTokenExpiry: Date.now() + INVITE_TOKEN_TTL_MS,
            status: 'Invited',
        });
        const saved = await this.userRepository.save(newUser);

        // Send invitation email (non-blocking)
        const adminUrl = this.configService.get<string>('ADMIN_URL') || 'http://localhost:3001';
        const setupLink = `${adminUrl}/set-password?token=${inviteToken}`;
        this.mailService.sendTeamInviteEmail({
            name: saved.name,
            email: saved.email,
            role: saved.role,
            setupLink,
        }).catch(err => {
            console.error(`[USERS] Failed to send invite email to ${saved.email}:`, err.message);
        });

        return saved;
    }

    async update(id: string, user: Partial<User>): Promise<User | null> {
        await this.userRepository.update(id, user);
        return this.findOne(id);
    }

    async setPasswordByToken(token: string, password: string) {
        if (!token || !password) {
            throw new BadRequestException('Token and password are required');
        }
        if (password.length < 8) {
            throw new BadRequestException('Password must be at least 8 characters');
        }

        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.inviteToken')
            .addSelect('user.inviteTokenExpiry')
            .where('user.inviteToken = :token', { token })
            .getOne();
        if (!user) {
            throw new BadRequestException('Invalid or expired invitation link');
        }
        if (user.inviteTokenExpiry && Date.now() > Number(user.inviteTokenExpiry)) {
            throw new BadRequestException('Invitation link has expired. Please ask your admin to resend the invite.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await this.userRepository.update(user.id, {
            password: hashedPassword,
            status: 'Active',
            inviteToken: null as any,
            inviteTokenExpiry: null as any,
        });

        return { message: 'Password set successfully. You can now sign in.' };
    }

    async login(email: string, password: string) {
        if (!email || !password) {
            throw new BadRequestException('Email and password are required');
        }

        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid email or password');
        }

        if (user.status === 'Suspended') {
            throw new UnauthorizedException('Your account has been suspended. Please contact the admin.');
        }

        if (user.status === 'Invited') {
            throw new UnauthorizedException('Please set your password using the invitation link sent to your email.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid email or password');
        }

        await this.userRepository.update(user.id, { lastActive: new Date() });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        };
    }

    async remove(id: string): Promise<void> {
        await this.userRepository.delete(id);
    }
}
