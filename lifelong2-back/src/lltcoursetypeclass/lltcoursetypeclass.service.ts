import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLltcoursetypeclassDto } from './dto/create-lltcoursetypeclass.dto';
import { UpdateLltcoursetypeclassDto } from './dto/update-lltcoursetypeclass.dto';
import { Lltcoursetypeclass } from './entities/lltcoursetypeclass.entity';

@Injectable()
export class LltcoursetypeclassService {
  constructor(
    @InjectRepository(Lltcoursetypeclass)
    private readonly repository: Repository<Lltcoursetypeclass>,
  ) {}

  async create(dto: CreateLltcoursetypeclassDto, actor: string): Promise<Lltcoursetypeclass> {
    const existing = await this.repository.findOneBy({
      courseId: dto.courseId, //PK
      typeclassId: dto.typeclassId, //PK
    });
    if (existing) {
      throw new ConflictException(
        `Lltcoursetypeclass with Course ID ${dto.courseId} and Typeclass ID ${dto.typeclassId} already exists`,
      );
    }

    const item = this.repository.create({
      courseId: dto.courseId,
      typeclassId: dto.typeclassId,
      amount: dto.amount ?? null,
      remark: dto.remark?.trim() || null,
      createUser: actor,
      createDate: new Date(),
    });

    return await this.repository.save(item);
  }

  async findAll(): Promise<Lltcoursetypeclass[]> {
    return await this.repository.find({
      order: { courseId: 'ASC', typeclassId: 'ASC' },
    });
  }

  async findByCourseId(courseId: number): Promise<Lltcoursetypeclass[]> {
    return await this.repository.find({
      where: { courseId },
      order: { typeclassId: 'ASC' },
    });
  }

  async findOne(courseId: number, typeclassId: number): Promise<Lltcoursetypeclass> {
    const item = await this.repository.findOneBy({ courseId, typeclassId });
    if (!item) {
      throw new NotFoundException(
        `Lltcoursetypeclass with Course ID ${courseId} and Typeclass ID ${typeclassId} not found`,
      );
    }
    return item;
  }

  async update(
    courseId: number,
    typeclassId: number,
    dto: UpdateLltcoursetypeclassDto,
    actor: string,
  ): Promise<Lltcoursetypeclass> {
    const item = await this.findOne(courseId, typeclassId);

    if (dto.amount !== undefined) {
      item.amount = dto.amount ?? null;
    }
    if (dto.remark !== undefined) {
      item.remark = dto.remark?.trim() || null;
    }

    item.updateUser = actor;
    item.updateDate = new Date();
    item.updateProg = actor;

    return await this.repository.save(item);
  }

  async remove(courseId: number, typeclassId: number): Promise<{ success: boolean }> {
    await this.findOne(courseId, typeclassId);
    await this.repository.delete({ courseId, typeclassId });
    return { success: true };
  }
}
