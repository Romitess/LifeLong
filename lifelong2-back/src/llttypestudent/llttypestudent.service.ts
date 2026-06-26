import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLlttypestudentDto } from './dto/create-llttypestudent.dto';
import { UpdateLlttypestudentDto } from './dto/update-llttypestudent.dto';
import { Llttypestudent } from './entities/llttypestudent.entity';

@Injectable()
export class LlttypestudentService {
  constructor(
    @InjectRepository(Llttypestudent)
    private readonly llttypestudentRepository: Repository<Llttypestudent>,
  ) {}

  async create(dto: CreateLlttypestudentDto): Promise<Llttypestudent> {
    const llttypestudent = this.llttypestudentRepository.create({
      name: dto.name?.trim() || null,
      status: dto.status?.trim() || 'Y',
      createUser: dto.createUser?.trim() || 'SYSTEM',
      createDate: dto.createDate || new Date(),
      updateUser: dto.updateUser?.trim() || null,
      updateDate: dto.updateDate || null,
      updateProg: dto.updateProg?.trim() || 'LLTCOURSE',
    });

    return await this.llttypestudentRepository.save(llttypestudent);
  }

  async findAll(): Promise<Llttypestudent[]> {
    return await this.llttypestudentRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Llttypestudent> {
    const llttypestudent = await this.llttypestudentRepository.findOneBy({ id });
    if (!llttypestudent) {
      throw new NotFoundException(`Llttypestudent with ID ${id} not found`);
    }
    return llttypestudent;
  }

  async update(id: number, dto: UpdateLlttypestudentDto): Promise<Llttypestudent> {
    const llttypestudent = await this.findOne(id);

    if (dto.name !== undefined) {
      llttypestudent.name = dto.name?.trim() || null;
    }
    if (dto.status !== undefined) {
      llttypestudent.status = dto.status?.trim() || null;
    }
    if (dto.createUser !== undefined) {
      llttypestudent.createUser = dto.createUser?.trim() || null;
    }
    if (dto.createDate !== undefined) {
      llttypestudent.createDate = dto.createDate;
    }
    if (dto.updateUser !== undefined) {
      llttypestudent.updateUser = dto.updateUser?.trim() || null;
    }
    if (dto.updateProg !== undefined) {
      llttypestudent.updateProg = dto.updateProg?.trim() || null;
    }

    llttypestudent.updateDate = dto.updateDate || new Date();

    return await this.llttypestudentRepository.save(llttypestudent);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.llttypestudentRepository.delete(id);
    return { success: true };
  }
}
