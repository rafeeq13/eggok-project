import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './submission.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private repo: Repository<Submission>,
  ) {}

  async findAll(type?: string, page = 1, limit = 50): Promise<{ data: Submission[]; total: number; page: number; limit: number }> {
    const where = type ? { type } : {};
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  findOne(id: number): Promise<Submission | null> {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<Submission>): Promise<Submission> {
    return this.repo.save(this.repo.create(data));
  }

  async updateStatus(id: number, status: string, adminNotes?: string): Promise<Submission | null> {
    const update: any = { status };
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    await this.repo.update(id, update);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async getCounts(): Promise<{ hiring: number; catering: number; contact: number; total: number }> {
    const all = await this.repo.find({ where: { status: 'new' } });
    return {
      hiring: all.filter(s => s.type === 'hiring').length,
      catering: all.filter(s => s.type === 'catering').length,
      contact: all.filter(s => s.type === 'contact').length,
      total: all.length,
    };
  }
}
