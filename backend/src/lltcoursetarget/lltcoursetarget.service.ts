import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLltcoursetargetDto } from './dto/create-lltcoursetarget.dto';
import { UpdateLltcoursetargetDto } from './dto/update-lltcoursetarget.dto';
import { Lltcoursetarget } from './entities/lltcoursetarget.entity';

@Injectable()
export class LltcoursetargetService {
  constructor(
    @InjectRepository(Lltcoursetarget)
    private readonly targetRepository: Repository<Lltcoursetarget>,
  ) {}

  async create(dto: CreateLltcoursetargetDto, actor: string): Promise<Lltcoursetarget> {
    const coursetarget = this.targetRepository.create({
      courseId: dto.courseId,
      targetId: dto.targetId,
      subtargetId: dto.subtargetId ?? null,
      sequence: dto.sequence ?? null,
      other: dto.other?.trim() ?? null,
      createUser: actor,
      createDate: new Date(),
      updateUser: actor,
      updateDate: new Date(),
      updateProgram: actor,
    });

    return await this.targetRepository.save(coursetarget);
  }

  async findAll(): Promise<Lltcoursetarget[]> {
    return await this.targetRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Lltcoursetarget> {
    const coursetarget = await this.targetRepository.findOneBy({ id });
    if (!coursetarget) {
      throw new NotFoundException(`Lltcoursetarget with ID ${id} not found`);
    }
    return coursetarget;
  }

  async update(id: number, dto: UpdateLltcoursetargetDto, actor: string): Promise<Lltcoursetarget> {
    const coursetarget = await this.findOne(id);

    if (dto.courseId !== undefined) {
      coursetarget.courseId = dto.courseId;
    }
    if (dto.targetId !== undefined) {
      coursetarget.targetId = dto.targetId;
    }
    if (dto.subtargetId !== undefined) {
      coursetarget.subtargetId = dto.subtargetId;
    }
    if (dto.sequence !== undefined) {
      coursetarget.sequence = dto.sequence;
    }
    if (dto.other !== undefined) {
      coursetarget.other = dto.other?.trim() ?? null;
    }

    coursetarget.updateUser = actor;
    coursetarget.updateDate = new Date();
    coursetarget.updateProgram = actor;

    return await this.targetRepository.save(coursetarget);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.targetRepository.delete(id);
    return { success: true };
  }
}
