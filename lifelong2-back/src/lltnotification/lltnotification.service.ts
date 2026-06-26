import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lltnotification } from './entities/lltnotification.entity';

export interface CreateNotificationDto {
  userId: number;
  type: string;
  title: string;
  message: string;
  refId?: number;
  refType?: string;
}

@Injectable()
export class LltnotificationService {
  constructor(
    @InjectRepository(Lltnotification)
    private readonly repo: Repository<Lltnotification>,
  ) {}

  async createBulk(dtos: CreateNotificationDto[]): Promise<void> {
    if (!dtos.length) return;
    const entities = dtos.map((d) =>
      this.repo.create({
        userId: d.userId,
        type: d.type,
        title: d.title,
        message: d.message,
        refId: d.refId ?? null,
        refType: d.refType ?? null,
        isRead: false,
      }),
    );
    await this.repo.save(entities);
  }

  async findByUser(userId: number): Promise<Lltnotification[]> {
    return this.repo.find({
      where: { userId },
      order: { createDate: 'DESC' },
      take: 50,
    });
  }

  async markRead(id: number, userId: number): Promise<void> {
    await this.repo.update({ id, userId }, { isRead: true });
  }

  async markAllRead(userId: number): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
  }
}
