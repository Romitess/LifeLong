import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLltfacultyDto } from './dto/create-lltfaculty.dto';
import { UpdateLltfacultyDto } from './dto/update-lltfaculty.dto';
import { Lltfaculty } from './entities/lltfaculty.entity';

interface FacultyOption {
  id: number;
  name: string | null;
  nameEn: string | null;
}

function trimOrNull(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

@Injectable()
export class LltfacultyService {
  constructor(
    @InjectRepository(Lltfaculty)
    private readonly lltfacultyRepository: Repository<Lltfaculty>,
  ) {}

  async create(dto: CreateLltfacultyDto): Promise<Lltfaculty> {
    const existing = await this.lltfacultyRepository.findOneBy({ id: dto.id });
    if (existing) {
      throw new ConflictException(`Lltfaculty with ID ${dto.id} already exists`);
    }

    const lltfaculty = this.lltfacultyRepository.create({
      id: dto.id,
      name: trimOrNull(dto.name),
      nameEn: trimOrNull(dto.nameEn),
      facIdPsn: trimOrNull(dto.facIdPsn),
      campusId: dto.campusId ?? null,
      campusName: trimOrNull(dto.campusName),
      facSeq: dto.facSeq ?? null,
      facActive: trimOrNull(dto.facActive),
      facType: trimOrNull(dto.facType),
      compCode: trimOrNull(dto.compCode),
      suffix: trimOrNull(dto.suffix),
    });

    return await this.lltfacultyRepository.save(lltfaculty);
  }

  async findAll(): Promise<Lltfaculty[]> {
    return await this.lltfacultyRepository.find({
      order: { facSeq: 'ASC', id: 'ASC' },
    });
  }

  async findOptions(): Promise<FacultyOption[]> {
    const rows = await this.lltfacultyRepository.find({
      where: { facActive: 'Y' },
      order: { facSeq: 'ASC', id: 'ASC' },
    });
    return rows.map(
      (f): FacultyOption => ({
        id: f.id,
        name: f.name,
        nameEn: f.nameEn,
      }),
    );
  }

  async findOne(id: number): Promise<Lltfaculty> {
    const lltfaculty = await this.lltfacultyRepository.findOneBy({ id });
    if (!lltfaculty) {
      throw new NotFoundException(`Lltfaculty with ID ${id} not found`);
    }
    return lltfaculty;
  }

  async update(id: number, dto: UpdateLltfacultyDto): Promise<Lltfaculty> {
    const lltfaculty = await this.findOne(id);

    if (dto.name !== undefined) {
      lltfaculty.name = trimOrNull(dto.name);
    }
    if (dto.nameEn !== undefined) {
      lltfaculty.nameEn = trimOrNull(dto.nameEn);
    }
    if (dto.facIdPsn !== undefined) {
      lltfaculty.facIdPsn = trimOrNull(dto.facIdPsn);
    }
    if (dto.campusId !== undefined) {
      lltfaculty.campusId = dto.campusId ?? null;
    }
    if (dto.campusName !== undefined) {
      lltfaculty.campusName = trimOrNull(dto.campusName);
    }
    if (dto.facSeq !== undefined) {
      lltfaculty.facSeq = dto.facSeq ?? null;
    }
    if (dto.facActive !== undefined) {
      lltfaculty.facActive = trimOrNull(dto.facActive);
    }
    if (dto.facType !== undefined) {
      lltfaculty.facType = trimOrNull(dto.facType);
    }
    if (dto.compCode !== undefined) {
      lltfaculty.compCode = trimOrNull(dto.compCode);
    }
    if (dto.suffix !== undefined) {
      lltfaculty.suffix = trimOrNull(dto.suffix);
    }

    return await this.lltfacultyRepository.save(lltfaculty);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.lltfacultyRepository.delete(id);
    return { success: true };
  }
}
