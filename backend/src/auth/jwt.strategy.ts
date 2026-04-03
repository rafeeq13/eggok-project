import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/customer.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(Customer)
        private customersRepository: Repository<Customer>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'eggok-jwt-secret-2026',
        });
    }

    async validate(payload: { sub: number; email: string }) {
        const customer = await this.customersRepository.findOne({
            where: { id: payload.sub },
        });
        if (!customer) {
            throw new UnauthorizedException();
        }
        return { id: customer.id, email: customer.email, name: customer.name };
    }
}
