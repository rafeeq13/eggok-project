import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminToken } from './admin-token.entity';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(
        @InjectRepository(AdminToken)
        private adminTokenRepository: Repository<AdminToken>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader: string | undefined = request.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing admin token');
        }

        const rawToken = authHeader.slice(7);
        const record = await this.adminTokenRepository.findOne({
            where: { token: rawToken },
            relations: ['user'],
        });

        if (!record) {
            throw new UnauthorizedException('Invalid admin token');
        }

        if (Date.now() > Number(record.expiresAt)) {
            await this.adminTokenRepository.delete(record.id);
            throw new UnauthorizedException('Admin token expired');
        }

        request.adminUser = {
            id: record.user.id,
            email: record.user.email,
            name: record.user.name,
            role: record.user.role,
        };
        return true;
    }
}
