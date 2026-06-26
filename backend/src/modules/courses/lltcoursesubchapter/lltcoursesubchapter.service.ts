import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLltcoursesubchapterDto } from './dto/create-lltcoursesubchapter.dto';
import { UpdateLltcoursesubchapterDto } from './dto/update-lltcoursesubchapter.dto';
import { Lltcoursesubchapter } from './entities/lltcoursesubchapter.entity';
import { Lltcoursechapter } from '../lltcoursechapter/entities/lltcoursechapter.entity';

@Injectable()
export class LltcoursesubchapterService {
  constructor(
    @InjectRepository(Lltcoursesubchapter)
    private readonly subchapterRepository: Repository<Lltcoursesubchapter>,
    @InjectRepository(Lltcoursechapter)
    private readonly chapterRepository: Repository<Lltcoursechapter>,
  ) {}

  async create(dto: CreateLltcoursesubchapterDto, actor: string): Promise<Lltcoursesubchapter> {
    await this.ensureChapterExists(dto.chapterId);

    const subchapter = this.subchapterRepository.create({
      chapterId: dto.chapterId,
      subject: dto.subject?.trim() || null,
      seq: dto.seq !== undefined ? dto.seq : null,
      createUser: actor,
      createDate: new Date(),
    });

    return await this.subchapterRepository.save(subchapter);
  }

  async findAll(): Promise<Lltcoursesubchapter[]> {
    return await this.subchapterRepository.find({
      order: { chapterId: 'ASC', seq: 'ASC', id: 'ASC' },
    });
  }

  async findAllByChapterId(chapterId: number): Promise<Lltcoursesubchapter[]> {
    await this.ensureChapterExists(chapterId);
    return await this.subchapterRepository.find({
      where: { chapterId },
      order: { seq: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Lltcoursesubchapter> {
    const subchapter = await this.subchapterRepository.findOneBy({ id });
    if (!subchapter) {
      throw new NotFoundException(`Course subchapter with ID ${id} not found`);
    }
    return subchapter;
  }

  async update(
    id: number,
    dto: UpdateLltcoursesubchapterDto,
    actor: string,
  ): Promise<Lltcoursesubchapter> {
    const subchapter = await this.findOne(id);

    if (dto.chapterId !== undefined) {
      await this.ensureChapterExists(dto.chapterId);
      subchapter.chapterId = dto.chapterId;
    }

    if (dto.subject !== undefined) {
      subchapter.subject = dto.subject?.trim() || null;
    }

    if (dto.seq !== undefined) {
      subchapter.seq = dto.seq;
    }

    subchapter.updateUser = actor;
    subchapter.updateDate = new Date();
    subchapter.updateProgram = actor;

    return await this.subchapterRepository.save(subchapter);
  }

  async remove(id: number): Promise<{ success: true }> {
    await this.findOne(id);
    await this.subchapterRepository.delete(id);
    return { success: true };
  }

  private async ensureChapterExists(chapterId: number): Promise<void> {
    const chapter = await this.chapterRepository.findOneBy({ id: chapterId });
    if (!chapter) {
      throw new NotFoundException(`Course chapter with ID ${chapterId} not found`);
    }
  }
}
