import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLltevaluationDto } from './dto/create-lltevaluation.dto';
import { UpdateLltevaluationDto } from './dto/update-lltevaluation.dto';
import { Lltevaluation } from './entities/lltevaluation.entity';

@Injectable()
export class LltevaluationService {
  constructor(
    @InjectRepository(Lltevaluation)
    private readonly evaluationRepository: Repository<Lltevaluation>,
  ) {}

  async create(createLltevaluationDto: CreateLltevaluationDto): Promise<Lltevaluation> {
    const maxEvaluation = await this.evaluationRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });
    const nextId = maxEvaluation ? maxEvaluation.id + 1 : 1;

    const evaluation = this.evaluationRepository.create({
      id: nextId,
      name: createLltevaluationDto.name?.trim() || null,
      other: createLltevaluationDto.other?.trim() || 'N',
    });
    return await this.evaluationRepository.save(evaluation);
  }

  async findAll(): Promise<Lltevaluation[]> {
    return await this.evaluationRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Lltevaluation> {
    const evaluation = await this.evaluationRepository.findOneBy({ id });
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
    return evaluation;
  }

  async update(id: number, updateLltevaluationDto: UpdateLltevaluationDto): Promise<Lltevaluation> {
    const evaluation = await this.findOne(id);

    if (updateLltevaluationDto.name !== undefined) {
      evaluation.name = updateLltevaluationDto.name?.trim() || null;
    }
    if (updateLltevaluationDto.other !== undefined) {
      evaluation.other = updateLltevaluationDto.other?.trim() || 'N';
    }

    return await this.evaluationRepository.save(evaluation);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.evaluationRepository.delete(id);
    return { success: true };
  }
}
