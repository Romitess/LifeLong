import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLlttargetDto } from './dto/create-llttarget.dto';
import { UpdateLlttargetDto } from './dto/update-llttarget.dto';
import { Llttarget } from './entities/llttarget.entity';

@Injectable()
export class LlttargetService {
  constructor(
    @InjectRepository(Llttarget)
    private readonly targetRepository: Repository<Llttarget>,
  ) {}

  async create(dto: CreateLlttargetDto): Promise<Llttarget> {
    const target = this.targetRepository.create({
      id: dto.id,
      name: dto.name,
      sequence: dto.sequence ?? null,
      other: dto.other ?? 'N',
    });
    return await this.targetRepository.save(target);
  }

  async findAll(): Promise<Llttarget[]> {
    return await this.targetRepository.find({
      order: { sequence: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Llttarget> {
    const target = await this.targetRepository.findOneBy({ id });
    if (!target) {
      throw new NotFoundException(`Llttarget with ID ${id} not found`);
    }
    return target;
  }

  async update(id: number, dto: UpdateLlttargetDto): Promise<Llttarget> {
    const target = await this.findOne(id);

    if (dto.name !== undefined) {
      target.name = dto.name;
    }
    if (dto.sequence !== undefined) {
      target.sequence = dto.sequence;
    }
    if (dto.other !== undefined) {
      target.other = dto.other;
    }

    return await this.targetRepository.save(target);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.targetRepository.delete(id);
    return { success: true };
  }
}
