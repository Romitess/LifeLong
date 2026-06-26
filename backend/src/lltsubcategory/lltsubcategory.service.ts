import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLltsubcategoryDto } from './dto/create-lltsubcategory.dto';
import { UpdateLltsubcategoryDto } from './dto/update-lltsubcategory.dto';
import { Lltsubcategory } from './entities/lltsubcategory.entity';
import { Lltcategory } from '../lltcategory/entities/lltcategory.entity';
import { Lltcourse } from '../modules/lltcourse/entities/lltcourse.entity';
import { MoodleService } from '../modules/moodle/moodle.service';

export interface AdminSubcategoryDetailResponse {
  id: number;
  categoryId: number;
  name: string;
  activeFlag: string;
  url: string | null;
}

@Injectable()
export class LltsubcategoryService {
  private readonly logger = new Logger(LltsubcategoryService.name);

  constructor(
    @InjectRepository(Lltsubcategory)
    private readonly subcategoryRepository: Repository<Lltsubcategory>,
    @InjectRepository(Lltcategory)
    private readonly categoryRepository: Repository<Lltcategory>,
    @InjectRepository(Lltcourse)
    private readonly courseRepository: Repository<Lltcourse>,
    private readonly moodleService: MoodleService,
  ) {}

  async create(
    dto: CreateLltsubcategoryDto,
    actor: string,
  ): Promise<AdminSubcategoryDetailResponse> {
    await this.ensureCategoryExists(dto.categoryId);
    await this.ensureSubcategoryNameAvailable(dto.categoryId, dto.name);

    const subcategory = this.subcategoryRepository.create({
      categoryId: dto.categoryId,
      name: dto.name.trim(),
      activeFlag: this.normalizeActiveFlag(dto.activeFlag),
      url: this.normalizeOptionalString(dto.url),
      createUser: actor,
      createDate: new Date(),
    });

    const savedSubcategory = await this.subcategoryRepository.save(subcategory);

    try {
      const parent = await this.categoryRepository.findOneBy({
        id: savedSubcategory.categoryId ?? 0,
      });
      if (parent?.lmsId) {
        const moodleId = await this.moodleService.syncSubcategoryToMoodle(
          savedSubcategory.name ?? '',
          parent.lmsId,
          null,
        );
        await this.subcategoryRepository.update(savedSubcategory.id, {
          lmsId: moodleId,
          lmsUser: 'SYSTEM',
          lmsDate: new Date(),
        });
      } else {
        this.logger.warn(
          `Moodle subcategory sync skipped for "${savedSubcategory.name}": parent category has no LMS_ID`,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Moodle subcategory sync failed for "${savedSubcategory.name}": ${msg}`);
    }

    return this.findOne(savedSubcategory.id);
  }

  async findAll(): Promise<AdminSubcategoryDetailResponse[]> {
    const subcategories = await this.subcategoryRepository.find({
      order: { categoryId: 'ASC', id: 'ASC' },
    });

    return subcategories.map((subcategory) => ({
      id: subcategory.id,
      categoryId: subcategory.categoryId ?? 0,
      name: subcategory.name ?? '',
      activeFlag: subcategory.activeFlag ?? 'N',
      url: subcategory.url,
    }));
  }

  async findOne(id: number): Promise<AdminSubcategoryDetailResponse> {
    const subcategory = await this.subcategoryRepository.findOneBy({ id });
    if (!subcategory) {
      throw new NotFoundException(`Subcategory ${id} not found`);
    }

    return {
      id: subcategory.id,
      categoryId: subcategory.categoryId ?? 0,
      name: subcategory.name ?? '',
      activeFlag: subcategory.activeFlag ?? 'N',
      url: subcategory.url,
    };
  }

  async update(
    id: number,
    dto: UpdateLltsubcategoryDto,
    actor: string,
  ): Promise<AdminSubcategoryDetailResponse> {
    const subcategory = await this.subcategoryRepository.findOneBy({ id });
    if (!subcategory) {
      throw new NotFoundException(`Subcategory ${id} not found`);
    }

    const nextCategoryId = dto.categoryId ?? subcategory.categoryId;
    if (!nextCategoryId) {
      throw new BadRequestException('categoryId is required');
    }

    await this.ensureCategoryExists(nextCategoryId);

    const nextName = dto.name?.trim() ?? subcategory.name ?? '';
    if (
      nextName.toLowerCase() !== (subcategory.name ?? '').trim().toLowerCase() ||
      nextCategoryId !== subcategory.categoryId
    ) {
      await this.ensureSubcategoryNameAvailable(nextCategoryId, nextName, id);
    }

    subcategory.categoryId = nextCategoryId;
    subcategory.name = nextName;
    subcategory.activeFlag =
      dto.activeFlag !== undefined
        ? this.normalizeActiveFlag(dto.activeFlag)
        : subcategory.activeFlag;
    subcategory.url =
      dto.url !== undefined ? this.normalizeOptionalString(dto.url) : subcategory.url;
    subcategory.updateUser = actor;
    subcategory.updateDate = new Date();

    await this.subcategoryRepository.save(subcategory);

    try {
      const parent = await this.categoryRepository.findOneBy({ id: subcategory.categoryId ?? 0 });
      if (parent?.lmsId) {
        await this.moodleService.syncSubcategoryToMoodle(
          subcategory.name ?? '',
          parent.lmsId,
          subcategory.lmsId,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Moodle subcategory update failed for "${subcategory.name}": ${msg}`);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: true }> {
    const subcategory = await this.subcategoryRepository.findOneBy({ id });
    if (!subcategory) {
      throw new NotFoundException(`Subcategory ${id} not found`);
    }

    const courseCount = await this.courseRepository.countBy({ subcategoryId: id });
    if (courseCount > 0) {
      throw new BadRequestException('Cannot delete subcategory with existing courses');
    }

    await this.subcategoryRepository.delete(id);
    return { success: true };
  }

  private async ensureCategoryExists(categoryId: number): Promise<void> {
    const category = await this.categoryRepository.findOneBy({ id: categoryId });
    if (!category) {
      throw new NotFoundException(`Category ${categoryId} not found`);
    }
  }

  private async ensureSubcategoryNameAvailable(
    categoryId: number,
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const qb = this.subcategoryRepository
      .createQueryBuilder('subcategory')
      .where('subcategory.categoryId = :categoryId', { categoryId })
      .andWhere('LOWER(subcategory.name) = LOWER(:name)', { name: name.trim() });

    if (excludeId !== undefined) {
      qb.andWhere('subcategory.id != :excludeId', { excludeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(`Subcategory name "${name}" already exists in this category`);
    }
  }

  private normalizeActiveFlag(value?: string): string {
    return String(value ?? 'Y')
      .trim()
      .toUpperCase() === 'N'
      ? 'N'
      : 'Y';
  }

  private normalizeOptionalString(value?: string): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }
}
