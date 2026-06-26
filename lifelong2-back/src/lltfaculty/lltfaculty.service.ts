import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLltfacultyDto } from './dto/create-lltfaculty.dto';
import { UpdateLltfacultyDto } from './dto/update-lltfaculty.dto';
import { Lltfaculty } from './entities/lltfaculty.entity';

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
      name: dto.name?.trim() || null,
      facIdPsn: dto.facIdPsn?.trim() || null,
      campusId: dto.campusId ?? null,
      campusName: dto.campusName?.trim() || null,
      facSeq: dto.facSeq ?? null,
      facActive: dto.facActive?.trim() || null,
      facType: dto.facType?.trim() || null,
      compCode: dto.compCode?.trim() || null,
      suffix: dto.suffix?.trim() || null,
    });

    return await this.lltfacultyRepository.save(lltfaculty);
  }

  async findAll(): Promise<Lltfaculty[]> {
    return await this.lltfacultyRepository.find({
      order: { facSeq: 'ASC', id: 'ASC' },
    });
  }

  async findOptions(): Promise<{ id: number; name: string | null }[]> {
    const rows = await this.lltfacultyRepository.find({
      select: { id: true, name: true },
      where: { facActive: 'Y' },
      order: { facSeq: 'ASC', id: 'ASC' },
    });
    return rows.map((f) => ({ id: f.id, name: f.name }));
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
      lltfaculty.name = dto.name?.trim() || null;
    }
    if (dto.facIdPsn !== undefined) {
      lltfaculty.facIdPsn = dto.facIdPsn?.trim() || null;
    }
    if (dto.campusId !== undefined) {
      lltfaculty.campusId = dto.campusId ?? null;
    }
    if (dto.campusName !== undefined) {
      lltfaculty.campusName = dto.campusName?.trim() || null;
    }
    if (dto.facSeq !== undefined) {
      lltfaculty.facSeq = dto.facSeq ?? null;
    }
    if (dto.facActive !== undefined) {
      lltfaculty.facActive = dto.facActive?.trim() || null;
    }
    if (dto.facType !== undefined) {
      lltfaculty.facType = dto.facType?.trim() || null;
    }
    if (dto.compCode !== undefined) {
      lltfaculty.compCode = dto.compCode?.trim() || null;
    }
    if (dto.suffix !== undefined) {
      lltfaculty.suffix = dto.suffix?.trim() || null;
    }

    return await this.lltfacultyRepository.save(lltfaculty);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.lltfacultyRepository.delete(id);
    return { success: true };
  }
}
