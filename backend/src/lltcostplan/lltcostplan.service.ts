import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLltcostplanDto } from './dto/create-lltcostplan.dto';
import { UpdateLltcostplanDto } from './dto/update-lltcostplan.dto';
import { Lltcostplan } from './entities/lltcostplan.entity';

@Injectable()
export class LltcostplanService {
  constructor(
    @InjectRepository(Lltcostplan)
    private readonly costplanRepository: Repository<Lltcostplan>,
  ) {}

  async create(dto: CreateLltcostplanDto, actor: string): Promise<Lltcostplan> {
    const costplan = this.costplanRepository.create({
      facId: dto.facId,
      costplanCode: dto.costplanCode.trim(),
      costplanName: dto.costplanName.trim(),
      costplanStatus: dto.costplanStatus ?? 'Y',
      createUser: actor,
      createDate: new Date(),
      updateUser: actor,
      updateDate: new Date(),
      updateProgram: actor,
    });

    return await this.costplanRepository.save(costplan);
  }

  async findAll(): Promise<Lltcostplan[]> {
    return await this.costplanRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Lltcostplan> {
    const costplan = await this.costplanRepository.findOneBy({ id });
    if (!costplan) {
      throw new NotFoundException(`Lltcostplan with ID ${id} not found`);
    }
    return costplan;
  }

  async update(id: number, dto: UpdateLltcostplanDto, actor: string): Promise<Lltcostplan> {
    const costplan = await this.findOne(id);

    if (dto.facId !== undefined) {
      costplan.facId = dto.facId;
    }
    if (dto.costplanCode !== undefined) {
      costplan.costplanCode = dto.costplanCode.trim();
    }
    if (dto.costplanName !== undefined) {
      costplan.costplanName = dto.costplanName.trim();
    }
    if (dto.costplanStatus !== undefined) {
      costplan.costplanStatus = dto.costplanStatus;
    }

    costplan.updateUser = actor;
    costplan.updateDate = new Date();
    costplan.updateProgram = actor;

    return await this.costplanRepository.save(costplan);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.costplanRepository.delete(id);
    return { success: true };
  }
}
