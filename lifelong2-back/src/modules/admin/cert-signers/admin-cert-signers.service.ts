import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { AdminCertSignersQueryDto } from './dto/admin-cert-signers-query.dto';
import {
  AdminCertSignerItemDto,
  AdminCertSignersResponseDto,
} from './dto/admin-cert-signers-response.dto';

interface CertSignerRow {
  id: number | string | null;
  name: string | null;
  position: string | null;
  filename: string | null;
  imgSize: string | null;
  imgType: string | null;
  path: string | null;
  url: string | null;
  status: string | null;
}

interface CountRow {
  total: number | string | null;
}

export interface CertSignerFileData {
  filename: string;
  imgSize: string;
  imgType: string;
  path: string;
  url: string;
}

@Injectable()
export class AdminCertSignersService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(query: AdminCertSignersQueryDto): Promise<AdminCertSignersResponseDto> {
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.max(query.pageSize ?? 10, 1);
    const offset = (page - 1) * pageSize;
    const search = query.search?.trim() || null;

    const filters: string[] = [];
    const params: Array<string | number> = [];

    if (search) {
      filters.push('(SIGN_NAME LIKE ? OR SIGN_POSITION LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const [countRows, itemRows] = await Promise.all([
      this.dataSource.query<CountRow[]>(
        `SELECT COUNT(*) AS total FROM LLTSIGNCERTIFICATE ${whereClause}`,
        params,
      ),
      this.dataSource.query<CertSignerRow[]>(
        `SELECT
          SIGN_ID       AS id,
          SIGN_NAME     AS name,
          SIGN_POSITION AS position,
          SIGN_FILENAME AS filename,
          SIGN_IMGSIZE  AS imgSize,
          SIGN_IMGTYPE  AS imgType,
          SIGN_PATH     AS path,
          SIGN_URL      AS url,
          SIGN_STATUS   AS status
        FROM LLTSIGNCERTIFICATE
        ${whereClause}
        ORDER BY SIGN_ID ASC
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

  async findOne(id: number): Promise<CertSignerRow> {
    const rows = await this.dataSource.query<CertSignerRow[]>(
      `SELECT SIGN_ID AS id, SIGN_PATH AS path FROM LLTSIGNCERTIFICATE WHERE SIGN_ID = ?`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException(`Certificate signer ${id} not found`);
    return rows[0];
  }

  async create(
    name: string,
    position: string,
    status: string,
    file?: CertSignerFileData,
  ): Promise<AdminCertSignerItemDto> {
    const result = await this.dataSource.query<{ insertId: number }>(
      `INSERT INTO LLTSIGNCERTIFICATE
        (SIGN_NAME, SIGN_POSITION, SIGN_FILENAME, SIGN_IMGSIZE, SIGN_IMGTYPE, SIGN_PATH, SIGN_URL, SIGN_STATUS, CREATEDATE, UPDATEDATE, UPDATEPROG)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 'ADMIN')`,
      [
        name,
        position,
        file?.filename ?? null,
        file?.imgSize ?? null,
        file?.imgType ?? null,
        file?.path ?? null,
        file?.url ?? null,
        status,
      ],
    );

    const rows = await this.dataSource.query<CertSignerRow[]>(
      `SELECT SIGN_ID AS id, SIGN_NAME AS name, SIGN_POSITION AS position,
              SIGN_FILENAME AS filename, SIGN_IMGSIZE AS imgSize, SIGN_IMGTYPE AS imgType,
              SIGN_PATH AS path, SIGN_URL AS url, SIGN_STATUS AS status
       FROM LLTSIGNCERTIFICATE WHERE SIGN_ID = ?`,
      [result.insertId],
    );

    return this.mapRow(rows[0]);
  }

  async update(
    id: number,
    data: { name?: string; position?: string; status?: string; deleteFile?: boolean },
    file?: CertSignerFileData,
  ): Promise<AdminCertSignerItemDto> {
    const existing = await this.findOne(id);

    const setClauses: string[] = ['UPDATEDATE = NOW()'];
    const params: Array<string | number | null> = [];

    if (data.name !== undefined) {
      setClauses.push('SIGN_NAME = ?');
      params.push(data.name);
    }

    if (data.position !== undefined) {
      setClauses.push('SIGN_POSITION = ?');
      params.push(data.position);
    }

    if (data.status !== undefined) {
      setClauses.push('SIGN_STATUS = ?');
      params.push(data.status);
    }

    if (file) {
      setClauses.push(
        'SIGN_FILENAME = ?',
        'SIGN_IMGSIZE = ?',
        'SIGN_IMGTYPE = ?',
        'SIGN_PATH = ?',
        'SIGN_URL = ?',
      );
      params.push(file.filename, file.imgSize, file.imgType, file.path, file.url);
      await this.unlinkFile(existing.path);
    } else if (data.deleteFile) {
      setClauses.push(
        'SIGN_FILENAME = NULL',
        'SIGN_IMGSIZE = NULL',
        'SIGN_IMGTYPE = NULL',
        'SIGN_PATH = NULL',
        'SIGN_URL = NULL',
      );
      await this.unlinkFile(existing.path);
    }

    params.push(id);

    await this.dataSource.query(
      `UPDATE LLTSIGNCERTIFICATE SET ${setClauses.join(', ')} WHERE SIGN_ID = ?`,
      params,
    );

    const rows = await this.dataSource.query<CertSignerRow[]>(
      `SELECT SIGN_ID AS id, SIGN_NAME AS name, SIGN_POSITION AS position,
              SIGN_FILENAME AS filename, SIGN_IMGSIZE AS imgSize, SIGN_IMGTYPE AS imgType,
              SIGN_PATH AS path, SIGN_URL AS url, SIGN_STATUS AS status
       FROM LLTSIGNCERTIFICATE WHERE SIGN_ID = ?`,
      [id],
    );

    return this.mapRow(rows[0]);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.dataSource.query('DELETE FROM LLTSIGNCERTIFICATE WHERE SIGN_ID = ?', [id]);
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

  private mapRow(row: CertSignerRow): AdminCertSignerItemDto {
    return {
      id: Number(row.id),
      name: row.name ?? '',
      position: row.position ?? '',
      filename: row.filename ?? null,
      imgSize: row.imgSize ?? null,
      imgType: row.imgType ?? null,
      path: row.path ?? null,
      url: row.url ?? null,
      status: row.status ?? 'N',
    };
  }
}
