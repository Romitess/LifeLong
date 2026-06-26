import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLlttypestudyDto } from './dto/create-llttypestudy.dto';
import { UpdateLlttypestudyDto } from './dto/update-llttypestudy.dto';
import { Llttypestudy } from './entities/llttypestudy.entity';

@Injectable()
export class LlttypestudyService {
  constructor(
    @InjectRepository(Llttypestudy)
    private readonly typestudyRepository: Repository<Llttypestudy>,
  ) {}

  async create(dto: CreateLlttypestudyDto): Promise<Llttypestudy> {
    const existing = await this.typestudyRepository.findOneBy({ id: dto.id });
    if (existing) {
      throw new ConflictException(`Llttypestudy with ID ${dto.id} already exists`);
    }

    const typestudy = this.typestudyRepository.create({
      id: dto.id,
      name: dto.name.trim(),
    });

    return await this.typestudyRepository.save(typestudy);
  }

  async findAll(): Promise<Llttypestudy[]> {
    return await this.typestudyRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Llttypestudy> {
    const typestudy = await this.typestudyRepository.findOneBy({ id });
    if (!typestudy) {
      throw new NotFoundException(`Llttypestudy with ID ${id} not found`);
    }
    return typestudy;
  }

  async update(id: number, dto: UpdateLlttypestudyDto): Promise<Llttypestudy> {
    const typestudy = await this.findOne(id);

    if (dto.name !== undefined) {
      typestudy.name = dto.name.trim();
    }

    return await this.typestudyRepository.save(typestudy);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.typestudyRepository.delete(id);
    return { success: true };
  }
}
