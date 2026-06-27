import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLltcategoryDto } from './dto/create-lltcategory.dto';
import { UpdateLltcategoryDto } from './dto/update-lltcategory.dto';
import { Lltcategory } from './entities/lltcategory.entity';
import { Lltsubcategory } from '../lltsubcategory/entities/lltsubcategory.entity';
import { Lltcourse } from '../../courses/lltcourse/entities/lltcourse.entity';
import { MoodleService } from '../../moodle/moodle.service';

interface CourseCountMapValue {
  courseCount: number;
  activeCourseCount: number;
}

export interface AdminSubcategoryResponse {
  id: number;
  categoryId: number;
  name: string;
  activeFlag: string;
  url: string | null;
  courseCount: number;
  activeCourseCount: number;
}

export interface AdminCategoryResponse {
  id: number;
  name: string;
  nameEn: string | null;
  activeFlag: string;
  url: string | null;
  icon: string | null;
  color: string | null;
  courseCount: number;
  activeCourseCount: number;
  subcategories: AdminSubcategoryResponse[];
}

export interface PublicCategoryResponse {
  id: number;
  name: string;
  nameEn: string | null;
  icon: string | null;
  color: string | null;
}

@Injectable()
export class LltcategoryService {
  private readonly logger = new Logger(LltcategoryService.name);

  constructor(
    @InjectRepository(Lltcategory)
    private readonly categoryRepository: Repository<Lltcategory>,
    @InjectRepository(Lltsubcategory)
    private readonly subcategoryRepository: Repository<Lltsubcategory>,
    @InjectRepository(Lltcourse)
    private readonly courseRepository: Repository<Lltcourse>,
    private readonly moodleService: MoodleService,
  ) {}

  async create(dto: CreateLltcategoryDto, actor: string): Promise<AdminCategoryResponse> {
    await this.ensureCategoryNameAvailable(dto.name);

    const category = this.categoryRepository.create({
      name: dto.name.trim(),
      nameEn: this.normalizeOptionalString(dto.nameEn),
      activeFlag: this.normalizeActiveFlag(dto.activeFlag),
      url: this.normalizeOptionalString(dto.url),
      icon: this.normalizeOptionalString(dto.icon),
      color: this.normalizeOptionalString(dto.color),
      createUser: actor,
      createDate: new Date(),
    });

    const savedCategory = await this.categoryRepository.save(category);

    try {
      const moodleId = await this.moodleService.syncCategoryToMoodle(
        savedCategory.name ?? '',
        null,
      );
      await this.categoryRepository.update(savedCategory.id, {
        lmsId: moodleId,
        lmsUser: 'SYSTEM',
        lmsDate: new Date(),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Moodle category sync failed for "${savedCategory.name}": ${msg}`);
    }

    return this.findOne(savedCategory.id);
  }

  async findAll(): Promise<AdminCategoryResponse[]> {
    const [categories, subcategories, categoryCountMap, subcategoryCountMap] = await Promise.all([
      this.categoryRepository.find({ order: { id: 'ASC' } }),
      this.subcategoryRepository.find({ order: { categoryId: 'ASC', id: 'ASC' } }),
      this.getCategoryCountMap(),
      this.getSubcategoryCountMap(),
    ]);

    const subcategoriesByCategoryId = new Map<number, AdminSubcategoryResponse[]>();
    for (const subcategory of subcategories) {
      const categoryId = subcategory.categoryId;
      if (!categoryId) {
        continue;
      }

      const countInfo = subcategoryCountMap.get(subcategory.id) ?? {
        courseCount: 0,
        activeCourseCount: 0,
      };

      const bucket = subcategoriesByCategoryId.get(categoryId) ?? [];
      bucket.push({
        id: subcategory.id,
        categoryId,
        name: subcategory.name ?? '',
        activeFlag: subcategory.activeFlag ?? 'N',
        url: subcategory.url,
        courseCount: countInfo.courseCount,
        activeCourseCount: countInfo.activeCourseCount,
      });
      subcategoriesByCategoryId.set(categoryId, bucket);
    }

    return categories.map((category) => {
      const countInfo = categoryCountMap.get(category.id) ?? {
        courseCount: 0,
        activeCourseCount: 0,
      };

      return {
        id: category.id,
        name: category.name ?? '',
        nameEn: category.nameEn,
        activeFlag: category.activeFlag ?? 'N',
        url: category.url,
        icon: category.icon,
        color: category.color,
        courseCount: countInfo.courseCount,
        activeCourseCount: countInfo.activeCourseCount,
        subcategories: subcategoriesByCategoryId.get(category.id) ?? [],
      };
    });
  }

  async findOne(id: number): Promise<AdminCategoryResponse> {
    const categories = await this.findAll();
    const category = categories.find((item) => item.id === id);
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  async update(
    id: number,
    dto: UpdateLltcategoryDto,
    actor: string,
  ): Promise<AdminCategoryResponse> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    if (dto.name && dto.name.trim().toLowerCase() !== (category.name ?? '').trim().toLowerCase()) {
      await this.ensureCategoryNameAvailable(dto.name, id);
    }

    category.name = dto.name?.trim() ?? category.name;
    category.nameEn =
      dto.nameEn !== undefined ? this.normalizeOptionalString(dto.nameEn) : category.nameEn;
    category.activeFlag =
      dto.activeFlag !== undefined ? this.normalizeActiveFlag(dto.activeFlag) : category.activeFlag;
    category.url = dto.url !== undefined ? this.normalizeOptionalString(dto.url) : category.url;
    category.icon = dto.icon !== undefined ? this.normalizeOptionalString(dto.icon) : category.icon;
    category.color =
      dto.color !== undefined ? this.normalizeOptionalString(dto.color) : category.color;
    category.updateUser = actor;
    category.updateDate = new Date();

    await this.categoryRepository.save(category);

    try {
      await this.moodleService.syncCategoryToMoodle(category.name ?? '', category.lmsId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Moodle category update failed for "${category.name}": ${msg}`);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: true }> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }

    const subcategories = await this.subcategoryRepository.find({
      select: { id: true },
      where: { categoryId: id },
    });
    const subcategoryIds = subcategories.map((subcategory) => subcategory.id);

    const courseCountQuery = this.courseRepository
      .createQueryBuilder('course')
      .where('course.categoryId = :id', { id });

    if (subcategoryIds.length > 0) {
      courseCountQuery.orWhere('course.subcategoryId IN (:...subcategoryIds)', { subcategoryIds });
    }

    const courseCount = await courseCountQuery.getCount();

    if (courseCount > 0) {
      throw new BadRequestException('Cannot delete category with existing courses');
    }

    await this.subcategoryRepository.delete({ categoryId: id });
    await this.categoryRepository.delete(id);
    return { success: true };
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

  private async ensureCategoryNameAvailable(name: string, excludeId?: number): Promise<void> {
    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .where('LOWER(category.name) = LOWER(:name)', { name: name.trim() });

    if (excludeId !== undefined) {
      qb.andWhere('category.id != :excludeId', { excludeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(`Category name "${name}" already exists`);
    }
  }

  private async getCategoryCountMap(): Promise<Map<number, CourseCountMapValue>> {
    const rows = await this.courseRepository
      .createQueryBuilder('course')
      .select('course.categoryId', 'categoryId')
      .addSelect('COUNT(*)', 'courseCount')
      .addSelect("SUM(CASE WHEN course.status = 'Y' THEN 1 ELSE 0 END)", 'activeCourseCount')
      .where('course.categoryId IS NOT NULL')
      .groupBy('course.categoryId')
      .getRawMany<{
        categoryId: string;
        courseCount: string;
        activeCourseCount: string;
      }>();

    return new Map(
      rows.map((row) => [
        Number(row.categoryId),
        {
          courseCount: Number(row.courseCount),
          activeCourseCount: Number(row.activeCourseCount),
        },
      ]),
    );
  }

  private async getSubcategoryCountMap(): Promise<Map<number, CourseCountMapValue>> {
    const rows = await this.courseRepository
      .createQueryBuilder('course')
      .select('course.subcategoryId', 'subcategoryId')
      .addSelect('COUNT(*)', 'courseCount')
      .addSelect("SUM(CASE WHEN course.status = 'Y' THEN 1 ELSE 0 END)", 'activeCourseCount')
      .where('course.subcategoryId IS NOT NULL')
      .groupBy('course.subcategoryId')
      .getRawMany<{
        subcategoryId: string;
        courseCount: string;
        activeCourseCount: string;
      }>();

    return new Map(
      rows.map((row) => [
        Number(row.subcategoryId),
        {
          courseCount: Number(row.courseCount),
          activeCourseCount: Number(row.activeCourseCount),
        },
      ]),
    );
  }

  async findActiveForPublic(): Promise<PublicCategoryResponse[]> {
    const categories = await this.categoryRepository.find({
      where: { activeFlag: 'Y' },
      select: { id: true, name: true, nameEn: true, icon: true, color: true },
      order: { id: 'ASC' },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name ?? '',
      nameEn: category.nameEn,
      icon: category.icon,
      color: category.color,
    }));
  }
}
