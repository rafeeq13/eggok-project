import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerToken } from './customer-token.entity';

@Injectable()
export class TokenGuard implements CanActivate {
    constructor(
        @InjectRepository(CustomerToken)
        private tokenRepository: Repository<CustomerToken>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader: string | undefined = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing token');
        }

        const rawToken = authHeader.slice(7);

        const record = await this.tokenRepository.findOne({
            where: { token: rawToken },
            relations: ['customer'],
        });

        if (!record) {
            throw new UnauthorizedException('Invalid token');
        }

        if (Date.now() > Number(record.expiresAt)) {
            await this.tokenRepository.delete(record.id);
            throw new UnauthorizedException('Token expired');
        }

        request.user = { id: record.customer.id, email: record.customer.email, name: record.customer.name };
        return true;
    }
}
