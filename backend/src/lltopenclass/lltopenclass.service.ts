import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lltopenclass } from './entities/lltopenclass.entity';
import { CreateLltopenclassDto } from './dto/create-lltopenclass.dto';
import { UpdateLltopenclassDto } from './dto/update-lltopenclass.dto';
import { QueryLltopenclassDto } from './dto/query-lltopenclass.dto';

export interface OpenclassItem {
  id: number;
  courseId: number | null;
  isPublic: string | null;
  regStartDate: Date | null;
  regEndDate: Date | null;
  payStartDate: Date | null;
  payEndDate: Date | null;
  classStartDate: Date | null;
  classEndDate: Date | null;
  numOpen: number | null;
  grademId: number | null;
  typeclassId: number | null;
  amount: number | null;
  gen: string | null;
  group: string | null;
  notice: string | null;
  vdo: string | null;
  contractName: string | null;
  contractTel: string | null;
  contractEmail: string | null;
  contractUrl: string | null;
  contractName2: string | null;
  contractTel2: string | null;
  contractEmail2: string | null;
  contractUrl2: string | null;
  teachTime: string | null;
  moocUrl: string | null;
  gradeStatus: string | null;
  gradeApprove: string | null;
  costplanId: number | null;
  lmsStatus: string | null;
  lmsId: number | null;
  createDate: Date | null;
  updateDate: Date | null;
}

export interface PaginatedOpenclass {
  items: OpenclassItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class LltopenclassService {
  constructor(
    @InjectRepository(Lltopenclass)
    private readonly repository: Repository<Lltopenclass>,
  ) {}

  async create(dto: CreateLltopenclassDto, actor: string): Promise<OpenclassItem> {
    const entity = this.repository.create({
      courseId: dto.courseId,
      isPublic: dto.isPublic ?? 'N',
      regStartDate: dto.regStartDate ? new Date(dto.regStartDate) : null,
      regEndDate: dto.regEndDate ? new Date(dto.regEndDate) : null,
      payStartDate: dto.payStartDate ? new Date(dto.payStartDate) : null,
      payEndDate: dto.payEndDate ? new Date(dto.payEndDate) : null,
      classStartDate: dto.classStartDate ? new Date(dto.classStartDate) : null,
      classEndDate: dto.classEndDate ? new Date(dto.classEndDate) : null,
      numOpen: dto.numOpen ?? null,
      grademId: dto.grademId ?? null,
      typeclassId: dto.typeclassId ?? null,
      amount: dto.amount ?? 0,
      gen: dto.gen ?? null,
      group: dto.group ?? null,
      notice: dto.notice ?? 'N',
      vdo: dto.vdo ?? null,
      contractName: dto.contractName ?? null,
      contractTel: dto.contractTel ?? null,
      contractEmail: dto.contractEmail ?? null,
      contractUrl: dto.contractUrl ?? null,
      contractName2: dto.contractName2 ?? null,
      contractTel2: dto.contractTel2 ?? null,
      contractEmail2: dto.contractEmail2 ?? null,
      contractUrl2: dto.contractUrl2 ?? null,
      teachTime: dto.teachTime ?? null,
      moocUrl: dto.moocUrl ?? null,
      gradeStatus: dto.gradeStatus ?? null,
      gradeApprove: dto.gradeApprove ?? null,
      costplanId: dto.costplanId ?? null,
      lmsStatus: 'N',
      createUser: actor,
      createDate: new Date(),
      updateUser: actor,
      updateDate: new Date(),
      updateProgram: 'BACKEND',
    });

    const saved = await this.repository.save(entity);
    return this.toItem(saved);
  }

  async findAll(query: QueryLltopenclassDto): Promise<PaginatedOpenclass> {
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.max(query.pageSize ?? 10, 1);

    const qb = this.repository.createQueryBuilder('oc').orderBy('oc.id', 'DESC');

    if (query.courseId) {
      qb.andWhere('oc.courseId = :courseId', { courseId: query.courseId });
    }
    if (query.isPublic) {
      qb.andWhere('oc.isPublic = :isPublic', { isPublic: query.isPublic });
    }
    if (query.gen) {
      qb.andWhere('oc.gen LIKE :gen', { gen: `%${query.gen}%` });
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      items: items.map((item) => this.toItem(item)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async findOne(id: number): Promise<OpenclassItem> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Openclass ${id} not found`);
    return this.toItem(entity);
  }

  async findByCourse(courseId: number): Promise<OpenclassItem[]> {
    const entities = await this.repository.find({
      where: { courseId },
      order: { id: 'ASC' },
    });
    return entities.map((item) => this.toItem(item));
  }

  async findPublicByCourse(courseId: number): Promise<OpenclassItem[]> {
    const entities = await this.repository.find({
      where: { courseId, isPublic: 'Y' },
      order: { id: 'ASC' },
    });
    return entities.map((item) => this.toItem(item));
  }

  async update(id: number, dto: UpdateLltopenclassDto, actor: string): Promise<OpenclassItem> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Openclass ${id} not found`);

    if (dto.courseId !== undefined) entity.courseId = dto.courseId;
    if (dto.isPublic !== undefined) entity.isPublic = dto.isPublic;
    if (dto.regStartDate !== undefined)
      entity.regStartDate = dto.regStartDate ? new Date(dto.regStartDate) : null;
    if (dto.regEndDate !== undefined)
      entity.regEndDate = dto.regEndDate ? new Date(dto.regEndDate) : null;
    if (dto.payStartDate !== undefined)
      entity.payStartDate = dto.payStartDate ? new Date(dto.payStartDate) : null;
    if (dto.payEndDate !== undefined)
      entity.payEndDate = dto.payEndDate ? new Date(dto.payEndDate) : null;
    if (dto.classStartDate !== undefined)
      entity.classStartDate = dto.classStartDate ? new Date(dto.classStartDate) : null;
    if (dto.classEndDate !== undefined)
      entity.classEndDate = dto.classEndDate ? new Date(dto.classEndDate) : null;
    if (dto.numOpen !== undefined) entity.numOpen = dto.numOpen;
    if (dto.grademId !== undefined) entity.grademId = dto.grademId;
    if (dto.typeclassId !== undefined) entity.typeclassId = dto.typeclassId;
    if (dto.amount !== undefined) entity.amount = dto.amount;
    if (dto.gen !== undefined) entity.gen = dto.gen;
    if (dto.group !== undefined) entity.group = dto.group;
    if (dto.notice !== undefined) entity.notice = dto.notice;
    if (dto.vdo !== undefined) entity.vdo = dto.vdo;
    if (dto.contractName !== undefined) entity.contractName = dto.contractName;
    if (dto.contractTel !== undefined) entity.contractTel = dto.contractTel;
    if (dto.contractEmail !== undefined) entity.contractEmail = dto.contractEmail;
    if (dto.contractUrl !== undefined) entity.contractUrl = dto.contractUrl;
    if (dto.contractName2 !== undefined) entity.contractName2 = dto.contractName2;
    if (dto.contractTel2 !== undefined) entity.contractTel2 = dto.contractTel2;
    if (dto.contractEmail2 !== undefined) entity.contractEmail2 = dto.contractEmail2;
    if (dto.contractUrl2 !== undefined) entity.contractUrl2 = dto.contractUrl2;
    if (dto.teachTime !== undefined) entity.teachTime = dto.teachTime;
    if (dto.moocUrl !== undefined) entity.moocUrl = dto.moocUrl;
    if (dto.gradeStatus !== undefined) entity.gradeStatus = dto.gradeStatus;
    if (dto.gradeApprove !== undefined) entity.gradeApprove = dto.gradeApprove;
    if (dto.costplanId !== undefined) entity.costplanId = dto.costplanId;

    entity.updateUser = actor;
    entity.updateDate = new Date();
    entity.updateProgram = 'BACKEND';

    const saved = await this.repository.save(entity);
    return this.toItem(saved);
  }

  async remove(id: number): Promise<{ success: true }> {
    const entity = await this.repository.findOneBy({ id });
    if (!entity) throw new NotFoundException(`Openclass ${id} not found`);
    await this.repository.delete(id);
    return { success: true };
  }

  private toItem(entity: Lltopenclass): OpenclassItem {
    return {
      id: entity.id,
      courseId: entity.courseId,
      isPublic: entity.isPublic,
      regStartDate: entity.regStartDate,
      regEndDate: entity.regEndDate,
      payStartDate: entity.payStartDate,
      payEndDate: entity.payEndDate,
      classStartDate: entity.classStartDate,
      classEndDate: entity.classEndDate,
      numOpen: entity.numOpen,
      grademId: entity.grademId,
      typeclassId: entity.typeclassId,
      amount: entity.amount,
      gen: entity.gen,
      group: entity.group,
      notice: entity.notice,
      vdo: entity.vdo,
      contractName: entity.contractName,
      contractTel: entity.contractTel,
      contractEmail: entity.contractEmail,
      contractUrl: entity.contractUrl,
      contractName2: entity.contractName2,
      contractTel2: entity.contractTel2,
      contractEmail2: entity.contractEmail2,
      contractUrl2: entity.contractUrl2,
      teachTime: entity.teachTime,
      moocUrl: entity.moocUrl,
      gradeStatus: entity.gradeStatus,
      gradeApprove: entity.gradeApprove,
      costplanId: entity.costplanId,
      lmsStatus: entity.lmsStatus,
      lmsId: entity.lmsId,
      createDate: entity.createDate,
      updateDate: entity.updateDate,
    };
  }
}
