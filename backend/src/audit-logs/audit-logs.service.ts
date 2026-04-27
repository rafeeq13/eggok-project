import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  action?: string;
  target?: string;
  userId?: string;
  from?: string; // ISO date
  to?: string; // ISO date
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async write(data: {
    userId?: string;
    userName?: string;
    userRole?: string;
    action: string;
    target: string;
    detail?: string;
    ipAddress?: string;
  }): Promise<AuditLog> {
    return this.repo.save(this.repo.create(data));
  }

  async list(query: AuditLogQuery): Promise<{ data: AuditLog[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(query.limit) || 50));

    const where: any = {};
    if (query.action) where.action = query.action;
    if (query.target) where.target = query.target;
    if (query.userId) where.userId = query.userId;
    if (query.from || query.to) {
      const from = query.from ? new Date(query.from) : new Date(0);
      const to = query.to ? new Date(query.to) : new Date();
      where.createdAt = Between(from, to);
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
