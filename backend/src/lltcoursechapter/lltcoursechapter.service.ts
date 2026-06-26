import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateLltcoursechapterDto } from './dto/create-lltcoursechapter.dto';
import { UpdateLltcoursechapterDto } from './dto/update-lltcoursechapter.dto';
import { Lltcoursechapter } from './entities/lltcoursechapter.entity';
import { Lltcourse } from '../modules/lltcourse/entities/lltcourse.entity';
import { Lltcoursesubchapter } from '../lltcoursesubchapter/entities/lltcoursesubchapter.entity';

export interface CourseChapterWithSubchapters extends Lltcoursechapter {
  subchapters?: Lltcoursesubchapter[];
}

@Injectable()
export class LltcoursechapterService {
  constructor(
    @InjectRepository(Lltcoursechapter)
    private readonly chapterRepository: Repository<Lltcoursechapter>,
    @InjectRepository(Lltcourse)
    private readonly courseRepository: Repository<Lltcourse>,
    @InjectRepository(Lltcoursesubchapter)
    private readonly subchapterRepository: Repository<Lltcoursesubchapter>,
  ) {}

  async create(dto: CreateLltcoursechapterDto, actor: string): Promise<Lltcoursechapter> {
    await this.ensureCourseExists(dto.courseId);

    const chapter = this.chapterRepository.create({
      courseId: dto.courseId,
      name: dto.name?.trim() || null,
      hour: dto.hour !== undefined ? dto.hour : null,
      seq: dto.seq !== undefined ? dto.seq : null,
      createUser: actor,
      createDate: new Date(),
    });

    return await this.chapterRepository.save(chapter);
  }

  async findAll(): Promise<Lltcoursechapter[]> {
    return await this.chapterRepository.find({
      order: { courseId: 'ASC', seq: 'ASC', id: 'ASC' },
    });
  }

  async findAllByCourseId(courseId: number): Promise<CourseChapterWithSubchapters[]> {
    await this.ensureCourseExists(courseId);
    const chapters = await this.chapterRepository.find({
      where: { courseId },
      order: { seq: 'ASC', id: 'ASC' },
    });

    const result = chapters as CourseChapterWithSubchapters[];

    if (result.length > 0) {
      const chapterIds = result.map((c) => c.id);
      const subchapters = await this.subchapterRepository.find({
        where: { chapterId: In(chapterIds) },
        order: { seq: 'ASC', id: 'ASC' },
      });

      result.forEach((chapter) => {
        chapter.subchapters = subchapters.filter((sub) => sub.chapterId === chapter.id);
      });
    }

    return result;
  }

  async findOne(id: number): Promise<Lltcoursechapter> {
    const chapter = await this.chapterRepository.findOneBy({ id });
    if (!chapter) {
      throw new NotFoundException(`Course chapter with ID ${id} not found`);
    }
    return chapter;
  }

  async update(
    id: number,
    dto: UpdateLltcoursechapterDto,
    actor: string,
  ): Promise<Lltcoursechapter> {
    const chapter = await this.chapterRepository.findOneBy({ id });
    if (!chapter) {
      throw new NotFoundException(`Course chapter with ID ${id} not found`);
    }

    if (dto.courseId !== undefined) {
      await this.ensureCourseExists(dto.courseId);
      chapter.courseId = dto.courseId;
    }

    if (dto.name !== undefined) {
      chapter.name = dto.name?.trim() || null;
    }

    if (dto.hour !== undefined) {
      chapter.hour = dto.hour;
    }

    if (dto.seq !== undefined) {
      chapter.seq = dto.seq;
    }

    chapter.updateUser = actor;
    chapter.updateDate = new Date();

    return await this.chapterRepository.save(chapter);
  }

  async remove(id: number): Promise<{ success: true }> {
    const chapter = await this.chapterRepository.findOneBy({ id });
    if (!chapter) {
      throw new NotFoundException(`Course chapter with ID ${id} not found`);
    }

    await this.chapterRepository.delete(id);
    return { success: true };
  }

  private async ensureCourseExists(courseId: number): Promise<void> {
    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
  }
}
