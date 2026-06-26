import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { AdminCertTemplatesQueryDto } from './dto/admin-cert-templates-query.dto';
import {
  AdminCertTemplateItemDto,
  AdminCertTemplatesResponseDto,
  CertLayout,
} from './dto/admin-cert-templates-response.dto';

interface CertTemplateRow {
  id: number | string | null;
  name: string | null;
  filename: string | null;
  imgSize: string | null;
  imgType: string | null;
  path: string | null;
  url: string | null;
  status: string | null;
  layout: string | null;
}

interface CountRow {
  total: number | string | null;
}

export interface CertTemplateFileData {
  filename: string;
  imgSize: string;
  imgType: string;
  path: string;
  url: string;
}

const SELECT_COLS = `
  TEMP_ID       AS id,
  TEMP_NAME     AS name,
  TEMP_FILENAME AS filename,
  TEMP_IMGSIZE  AS imgSize,
  TEMP_IMGTYPE  AS imgType,
  TEMP_PATH     AS path,
  TEMP_URL      AS url,
  TEMP_STATUS   AS status,
  TEMP_LAYOUT   AS layout
`;

@Injectable()
export class AdminCertTemplatesService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(query: AdminCertTemplatesQueryDto): Promise<AdminCertTemplatesResponseDto> {
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.max(query.pageSize ?? 10, 1);
    const offset = (page - 1) * pageSize;
    const search = query.search?.trim() || null;

    const filters: string[] = [];
    const params: Array<string | number> = [];

    if (search) {
      filters.push('TEMP_NAME LIKE ?');
      params.push(`%${search}%`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const [countRows, itemRows] = await Promise.all([
      this.dataSource.query<CountRow[]>(
        `SELECT COUNT(*) AS total FROM LLTTEMPLATECERTIFICATE ${whereClause}`,
        params,
      ),
      this.dataSource.query<CertTemplateRow[]>(
        `SELECT ${SELECT_COLS}
        FROM LLTTEMPLATECERTIFICATE
        ${whereClause}
        ORDER BY TEMP_ID ASC
        LIMIT ? OFFSET ?`,
        [...params, pageSize, offset],
      ),
    ]);

    const total = Number(countRows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      items: itemRows.map((row) => this.mapRow(row)),
      pagination: { page, pageSize, total, totalPages },
    };
  }

  async findActive(): Promise<AdminCertTemplateItemDto[]> {
    const rows = await this.dataSource.query<CertTemplateRow[]>(
      `SELECT ${SELECT_COLS}
      FROM LLTTEMPLATECERTIFICATE
      WHERE TEMP_STATUS = 'Y'
      ORDER BY TEMP_ID ASC`,
    );
    return rows.map((row) => this.mapRow(row));
  }

  async findOne(id: number): Promise<CertTemplateRow> {
    const rows = await this.dataSource.query<CertTemplateRow[]>(
      `SELECT TEMP_ID AS id, TEMP_PATH AS path FROM LLTTEMPLATECERTIFICATE WHERE TEMP_ID = ?`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException(`Certificate template ${id} not found`);
    return rows[0];
  }

  async create(
    name: string,
    status: string,
    file?: CertTemplateFileData,
    layout?: string,
  ): Promise<AdminCertTemplateItemDto> {
    const result = await this.dataSource.query<{ insertId: number }>(
      `INSERT INTO LLTTEMPLATECERTIFICATE
        (TEMP_NAME, TEMP_FILENAME, TEMP_IMGSIZE, TEMP_IMGTYPE, TEMP_PATH, TEMP_URL, TEMP_STATUS, TEMP_LAYOUT, CREATEDATE, UPDATEDATE, UPDATEPROG)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 'ADMIN')`,
      [
        name,
        file?.filename ?? null,
        file?.imgSize ?? null,
        file?.imgType ?? null,
        file?.path ?? null,
        file?.url ?? null,
        status,
        layout ?? null,
      ],
    );

    const rows = await this.dataSource.query<CertTemplateRow[]>(
      `SELECT ${SELECT_COLS} FROM LLTTEMPLATECERTIFICATE WHERE TEMP_ID = ?`,
      [result.insertId],
    );

    return this.mapRow(rows[0]);
  }

  async update(
    id: number,
    data: { name?: string; status?: string; deleteFile?: boolean; layout?: string | null },
    file?: CertTemplateFileData,
  ): Promise<AdminCertTemplateItemDto> {
    const existing = await this.findOne(id);

    const setClauses: string[] = ['UPDATEDATE = NOW()'];
    const params: Array<string | number | null> = [];

    if (data.name !== undefined) {
      setClauses.push('TEMP_NAME = ?');
      params.push(data.name);
    }

    if (data.status !== undefined) {
      setClauses.push('TEMP_STATUS = ?');
      params.push(data.status);
    }

    if (data.layout !== undefined) {
      setClauses.push('TEMP_LAYOUT = ?');
      params.push(data.layout);
    }

    if (file) {
      setClauses.push(
        'TEMP_FILENAME = ?',
        'TEMP_IMGSIZE = ?',
        'TEMP_IMGTYPE = ?',
        'TEMP_PATH = ?',
        'TEMP_URL = ?',
      );
      params.push(file.filename, file.imgSize, file.imgType, file.path, file.url);
      await this.unlinkFile(existing.path);
    } else if (data.deleteFile) {
      setClauses.push(
        'TEMP_FILENAME = NULL',
        'TEMP_IMGSIZE = NULL',
        'TEMP_IMGTYPE = NULL',
        'TEMP_PATH = NULL',
        'TEMP_URL = NULL',
      );
      await this.unlinkFile(existing.path);
    }

    params.push(id);

    await this.dataSource.query(
      `UPDATE LLTTEMPLATECERTIFICATE SET ${setClauses.join(', ')} WHERE TEMP_ID = ?`,
      params,
    );

    const rows = await this.dataSource.query<CertTemplateRow[]>(
      `SELECT ${SELECT_COLS} FROM LLTTEMPLATECERTIFICATE WHERE TEMP_ID = ?`,
      [id],
    );

    return this.mapRow(rows[0]);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.dataSource.query('DELETE FROM LLTTEMPLATECERTIFICATE WHERE TEMP_ID = ?', [id]);
    await this.unlinkFile(existing.path);
  }

  private async unlinkFile(filePath: string | null): Promise<void> {
    if (!filePath) return;
    if (filePath.startsWith('/api/uploads/') || /\/api\/uploads\//.test(filePath)) return;
    if (/^https?:\/\//i.test(filePath)) return;

    const normalizedPath = filePath.replace(/^\/+/, '');
    if (!normalizedPath.startsWith('uploads/')) return;

    try {
      await unlink(join(process.cwd(), normalizedPath));
    } catch {
      // file may already be gone
    }
  }

  private parseLayout(raw: string | null): CertLayout | null {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CertLayout;
    } catch {
      return null;
    }
  }

  private mapRow(row: CertTemplateRow): AdminCertTemplateItemDto {
    return {
      id: Number(row.id),
      name: row.name ?? '',
      filename: row.filename ?? null,
      imgSize: row.imgSize ?? null,
      imgType: row.imgType ?? null,
      path: row.path ?? null,
      url: row.url ?? null,
      status: row.status ?? 'N',
      layout: this.parseLayout(row.layout),
    };
  }
}
