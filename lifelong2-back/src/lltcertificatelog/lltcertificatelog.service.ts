import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lltcertificatelog } from './entities/lltcertificatelog.entity';
import { CreateLltcertificatelogDto } from './dto/create-lltcertificatelog.dto';

@Injectable()
export class LltcertificatelogService {
  constructor(
    @InjectRepository(Lltcertificatelog)
    private readonly certificateLogRepo: Repository<Lltcertificatelog>,
  ) {}

  async create(
    dto: CreateLltcertificatelogDto,
    userId: number,
    clip: string,
    createUser: string,
  ): Promise<Lltcertificatelog> {
    const log = this.certificateLogRepo.create({
      userId,
      clip,
      device: dto.cldevice,
      createUser,
      createDate: new Date(),
    });
    return this.certificateLogRepo.save(log);
  }

  async findAll(): Promise<Lltcertificatelog[]> {
    return this.certificateLogRepo.find({
      order: { createDate: 'DESC' },
    });
  }

  async findByUser(userId: number): Promise<Lltcertificatelog[]> {
    return this.certificateLogRepo.find({
      where: { userId },
      order: { createDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Lltcertificatelog> {
    const log = await this.certificateLogRepo.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`ไม่พบ Certificate Log ID ${id}`);
    }
    return log;
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this.certificateLogRepo.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }
}
