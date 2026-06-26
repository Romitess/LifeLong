import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLltsubtargetDto } from './dto/create-lltsubtarget.dto';
import { UpdateLltsubtargetDto } from './dto/update-lltsubtarget.dto';
import { Lltsubtarget } from './entities/lltsubtarget.entity';

@Injectable()
export class LltsubtargetService {
  constructor(
    @InjectRepository(Lltsubtarget)
    private readonly subtargetRepository: Repository<Lltsubtarget>,
  ) {}

  async create(dto: CreateLltsubtargetDto): Promise<Lltsubtarget> {
    const subtarget = this.subtargetRepository.create({
      id: dto.id,
      targetId: dto.targetId,
      name: dto.name,
      other: dto.other ?? 'N',
      sequence: dto.sequence ?? null,
    });
    return await this.subtargetRepository.save(subtarget);
  }

  async findAll(): Promise<Lltsubtarget[]> {
    return await this.subtargetRepository.find({
      order: { sequence: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Lltsubtarget> {
    const subtarget = await this.subtargetRepository.findOneBy({ id });
    if (!subtarget) {
      throw new NotFoundException(`Lltsubtarget with ID ${id} not found`);
    }
    return subtarget;
  }

  async findByTargetId(targetId: number): Promise<Lltsubtarget[]> {
    return await this.subtargetRepository.find({
      where: { targetId },
      order: { sequence: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateLltsubtargetDto): Promise<Lltsubtarget> {
    const subtarget = await this.findOne(id);

    if (dto.targetId !== undefined) {
      subtarget.targetId = dto.targetId;
    }
    if (dto.name !== undefined) {
      subtarget.name = dto.name;
    }
    if (dto.other !== undefined) {
      subtarget.other = dto.other;
    }
    if (dto.sequence !== undefined) {
      subtarget.sequence = dto.sequence;
    }

    return await this.subtargetRepository.save(subtarget);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.subtargetRepository.delete(id);
    return { success: true };
  }
}
