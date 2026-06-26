import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { Lltenrollreceipt } from './entities/lltenrollreceipt.entity';
import { Lltreceipt } from './entities/lltreceipt.entity';
import { Lltexportreceiptlog } from './entities/lltexportreceiptlog.entity';
import { QueryEnrollreceiptDto } from './dto/query-enrollreceipt.dto';
import { CancelReceiptDto } from './dto/cancel-receipt.dto';
import { ImportPaymentDto } from './dto/import-payment.dto';
import { ImportAndGenerateDto } from './dto/import-and-generate.dto';
import { ReceiptSummaryQueryDto } from './dto/receipt-summary-query.dto';

export interface ImportResult {
  inserted: number;
  skipped: number;
  failed: number;
  records: Lltenrollreceipt[];
}

export interface ReceiptResult {
  enrollReceiptId: number;
  receiptId: number;
  receiptFilename: string;
  receiptType: string;
}

export interface ImportAndGenerateResponse {
  summary: {
    totalImported: number;
    totalReceiptGenerated: number;
    totalSkipped: number;
    totalFailed: number;
    errors?: string[];
  };
  receipts: ReceiptResult[];
}

export interface ReceiptSummaryItem {
  id: number | string;
  no: number;
  receiptNo: string;
  receiptFilename?: string;
  receiptType?: 'R' | 'D';
  customerName: string;
  amount: number | string;
  effectiveDate: string;
  learnerName: string;
  courseName: string;
  collector: string;
  status: string;
}

@Injectable()
export class LltenrollreceiptService {
  private readonly logger = new Logger(LltenrollreceiptService.name);

  constructor(
    @InjectRepository(Lltenrollreceipt)
    private readonly enrollreceiptRepo: Repository<Lltenrollreceipt>,
    @InjectRepository(Lltreceipt)
    private readonly receiptRepo: Repository<Lltreceipt>,
    @InjectRepository(Lltexportreceiptlog)
    private readonly logRepo: Repository<Lltexportreceiptlog>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Import payment records from CSV data with upsert logic.
   * - Skips records that already exist with status 'Y' or 'C'
   * - Converts paymentDate from DD-MM-YYYY (พ.ศ.) to YYYY-MM-DD (พ.ศ.)
   */
  async importPaymentRecords(
    dtos: ImportPaymentDto[],
    username: string,
    manager?: EntityManager,
  ): Promise<ImportResult & { errors: string[] }> {
    const repo = manager ? manager.getRepository(Lltenrollreceipt) : this.enrollreceiptRepo;

    const result: ImportResult & { errors: string[] } = {
      inserted: 0,
      skipped: 0,
      failed: 0,
      records: [],
      errors: [],
    };

    if (!dtos || dtos.length === 0) return result;

    const rawUserIds = [
      ...new Set(dtos.map((d) => parseInt(d.learnerRef, 10)).filter((id) => !isNaN(id))),
    ];
    const rawEnrollCodes = [...new Set(dtos.map((d) => d.applicationRef).filter(Boolean))];
    const rawEnrollIds = [
      ...new Set(rawEnrollCodes.map((c) => parseInt(c, 10)).filter((id) => !isNaN(id))),
    ];

    const validUsers = new Set<number>();
    if (rawUserIds.length > 0) {
      const q = `SELECT USER_ID FROM LLTUMUSER WHERE USER_ID IN (${rawUserIds.join(',')})`;
      const userResult: unknown[] = manager
        ? await manager.query(q)
        : await this.dataSource.query(q);
      if (Array.isArray(userResult)) {
        userResult.forEach((r) => {
          if (r && typeof r === 'object' && 'USER_ID' in r) {
            validUsers.add(Number((r as Record<string, unknown>).USER_ID));
          }
        });
      }
    }

    let existingReceipts: Lltenrollreceipt[] = [];
    if (rawUserIds.length > 0 || rawEnrollCodes.length > 0) {
      const qb = repo.createQueryBuilder('er');
      if (rawUserIds.length > 0) qb.orWhere('er.userId IN (:...rawUserIds)', { rawUserIds });
      if (rawEnrollCodes.length > 0)
        qb.orWhere('er.enrollCode IN (:...rawEnrollCodes)', { rawEnrollCodes });
      existingReceipts = await qb.getMany();
    }

    interface EnrollDataRow {
      enrollId: string | number | null;
      userId: string | number | null;
      enrollRef2: string | null;
      coseId: string | number | null;
      coseCode: string | null;
      coseNameTh: string | null;
      facId: string | number | null;
      facName: string | null;
    }

    let enrollDataList: EnrollDataRow[] = [];
    if (rawEnrollCodes.length > 0 || rawEnrollIds.length > 0) {
      const cStr = rawEnrollCodes.length > 0 ? rawEnrollCodes.map((c) => `'${c}'`).join(',') : "''";
      const idStr = rawEnrollIds.length > 0 ? rawEnrollIds.join(',') : '0';
      const enrollQuery = `
        SELECT e.ENROLL_ID as enrollId, e.USER_ID as userId, e.ENROLL_REF2 as enrollRef2, e.COSE_ID as coseId, c.COSE_CODE as coseCode, c.COSE_NAMETH as coseNameTh, c.FAC_ID as facId, f.FAC_NAME as facName
        FROM LLTENROLL e
        LEFT JOIN LLTCOURSE c ON c.COSE_ID = e.COSE_ID
        LEFT JOIN LLTFACULTY f ON f.FAC_ID = c.FAC_ID
        WHERE e.ENROLL_REF2 IN (${cStr}) OR e.ENROLL_ID IN (${idStr})
      `;
      enrollDataList = manager
        ? await manager.query(enrollQuery)
        : await this.dataSource.query(enrollQuery);
    }

    for (const dto of dtos) {
      try {
        const parsedUserId = parseInt(dto.learnerRef, 10);
        let userId = isNaN(parsedUserId) ? null : parsedUserId;
        let enrollCode = dto.applicationRef || null;

        if (userId !== null && !validUsers.has(userId)) {
          this.logger.warn(
            `User ID ${userId} not found in LLTUMUSER. Setting to null to prevent FK error.`,
          );
          userId = null;
        }

        const existing = existingReceipts.find(
          (e) =>
            (userId === null || e.userId === userId) &&
            (enrollCode === null || e.enrollCode === enrollCode),
        );

        if (existing) {
          if (existing.receiptStatus === 'Y') {
            result.skipped++;
            continue;
          } else if (existing.receiptStatus === 'C') {
            result.skipped++;
            this.logger.warn(
              `Skipped canceled receipt: userId=${userId}, enrollCode=${enrollCode}`,
            );
            continue;
          }
        }

        let payDate: string | null = null;
        if (dto.paymentDate && dto.paymentDate.includes('-')) {
          const [dd, mm, yyyy] = dto.paymentDate.split('-');
          if (yyyy && mm && dd) {
            payDate = `${yyyy}-${mm}-${dd}`;
          }
        }

        let rawName = dto.payerName ? dto.payerName.trim() : '';
        const prefixes = ['นาย', 'นางสาว', 'นาง', 'น.ส.', 'ด.ช.', 'ด.ญ.'];
        for (const prefix of prefixes) {
          if (rawName.startsWith(prefix)) {
            rawName = rawName.substring(prefix.length).trim();
            break;
          }
        }

        const nameParts = rawName.split(/\s+/);
        const userFnameTh = nameParts[0] || '';
        const userLnameTh = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        let enrollId: number | null = null;
        let coseId: number | null = null;
        let coseCode: string | null = null;
        let coseNameTh: string | null = null;
        let facId: number | null = null;
        let facName: string | null = null;

        if (enrollCode) {
          const parsedEnrollId = parseInt(enrollCode, 10);
          const enrollIdParam = isNaN(parsedEnrollId) ? null : parsedEnrollId;

          const row = enrollDataList.find(
            (r) =>
              (r.enrollRef2 === enrollCode || r.enrollId === enrollIdParam) &&
              (!userId || r.userId === userId),
          );

          if (row) {
            enrollId = row.enrollId ? Number(row.enrollId) : null;
            enrollCode = row.enrollRef2 ? String(row.enrollRef2) : null;
            coseId = row.coseId ? Number(row.coseId) : null;
            coseCode = row.coseCode ? String(row.coseCode) : null;
            coseNameTh = row.coseNameTh ? String(row.coseNameTh) : null;
            facId = row.facId ? Number(row.facId) : null;
            facName = row.facName ? String(row.facName) : null;
          } else if (/^\d+$/.test(enrollCode)) {
            enrollId = parseInt(enrollCode, 10);
            enrollCode = null;
          }
        }

        const newRecord = repo.create({
          userId,
          enrollCode,
          enrollId,
          coseId,
          coseCode,
          coseNameTh,
          facId,
          facName,
          receiptStatus: 'Y',
          amount: dto.amount || 0,
          payDate,
          payTime: dto.paymentTime || null,
          userFnameTh,
          userLnameTh,
          receiptIdReal: null,
          receiptIdCopy: null,
          createUser: username,
          createDate: new Date(),
        });

        const saved = await repo.save(newRecord);
        result.inserted++;
        result.records.push(saved);
      } catch (error: unknown) {
        result.failed++;
        const errMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`Row error: ${errMsg}`);
        this.logger.error('Error importing record', dto, error);
      }
    }
    return result;
  }

  /**
   * Import records + generate receipts in a single transaction.
   */
  async importAndGenerate(
    dto: ImportAndGenerateDto,
    username: string,
  ): Promise<ImportAndGenerateResponse> {
    return this.dataSource.transaction(async (manager) => {
      const importResult = await this.importPaymentRecords(dto.records, username, manager);

      const receiptTypesToGenerate = ['R', 'D'];
      let generatedCount = 0;
      const receiptsResult: ReceiptResult[] = [];
      const errors = [...importResult.errors];

      if (importResult.records.length > 0) {
        const rRepo = manager.getRepository(Lltreceipt);
        const eRepo = manager.getRepository(Lltenrollreceipt);
        const logRepo = manager.getRepository(Lltexportreceiptlog);

        const newReceipts: Lltreceipt[] = [];
        for (const record of importResult.records) {
          for (const receiptType of receiptTypesToGenerate) {
            newReceipts.push(
              rRepo.create({
                enrollReceiptId: record.id,
                receiptFilename: `${record.coseCode || 'UNKNOWN'}_${record.id}_receipt`,
                receiptType,
                receiptCreate: 'P',
                createDate: new Date(),
              }),
            );
          }
        }

        try {
          const savedReceipts = await rRepo.save(newReceipts);
          const logs: Lltexportreceiptlog[] = [];

          for (const record of importResult.records) {
            const realR = savedReceipts.find(
              (r) => r.enrollReceiptId === record.id && r.receiptType === 'R',
            );
            const copyR = savedReceipts.find(
              (r) => r.enrollReceiptId === record.id && r.receiptType === 'D',
            );

            if (realR) {
              record.receiptIdReal = realR.id;
              receiptsResult.push({
                enrollReceiptId: record.id,
                receiptId: realR.id,
                receiptFilename: realR.receiptFilename ?? '',
                receiptType: 'R',
              });
              generatedCount++;
              logs.push(
                logRepo.create({
                  receiptId: realR.id,
                  userId: dto.creatorUserId ?? null,
                  receiptIp: dto.creatorIp ?? null,
                  receiptDevice: dto.creatorDevice ?? null,
                  createDate: new Date(),
                }),
              );
            }

            if (copyR) {
              record.receiptIdCopy = copyR.id;
              receiptsResult.push({
                enrollReceiptId: record.id,
                receiptId: copyR.id,
                receiptFilename: copyR.receiptFilename ?? '',
                receiptType: 'D',
              });
              generatedCount++;
              logs.push(
                logRepo.create({
                  receiptId: copyR.id,
                  userId: dto.creatorUserId ?? null,
                  receiptIp: dto.creatorIp ?? null,
                  receiptDevice: dto.creatorDevice ?? null,
                  createDate: new Date(),
                }),
              );
            }
          }

          await eRepo.save(importResult.records);
          if (logs.length > 0) {
            await logRepo.save(logs);
          }
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : String(error);
          errors.push(`Bulk receipt generation error: ${errMsg}`);
          this.logger.error(`Error in bulk generating receipts`, error);
          importResult.failed += importResult.inserted;
          importResult.inserted = 0;
        }
      }

      return {
        summary: {
          totalImported: importResult.inserted,
          totalReceiptGenerated: generatedCount,
          totalSkipped: importResult.skipped,
          totalFailed: importResult.failed,
          errors,
        },
        receipts: receiptsResult,
      };
    });
  }

  async findAll(
    query: QueryEnrollreceiptDto,
  ): Promise<{ data: Lltenrollreceipt[]; total: number }> {
    try {
      const qb = this.enrollreceiptRepo.createQueryBuilder('e');
      if (query.facId) qb.andWhere('e.facId = :facId', { facId: query.facId });
      if (query.budYear) qb.andWhere('e.budYear = :budYear', { budYear: query.budYear });
      if (query.receiptStatus)
        qb.andWhere('e.receiptStatus = :receiptStatus', {
          receiptStatus: query.receiptStatus,
        });
      if (query.userId) qb.andWhere('e.userId = :userId', { userId: query.userId });

      const page = query.page || 1;
      const limit = query.limit || 10;
      qb.skip((page - 1) * limit).take(limit);
      qb.orderBy('e.createDate', 'DESC');

      const [data, total] = await qb.getManyAndCount();
      return { data, total };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึงข้อมูล: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getReceiptSummary(
    query: ReceiptSummaryQueryDto,
    facCode?: number | string | null,
    authUserId?: number | null,
  ): Promise<{ success: true; total: number; data: ReceiptSummaryItem[] }> {
    try {
      let resolvedFacCode = facCode;
      if (
        (resolvedFacCode === undefined ||
          resolvedFacCode === null ||
          String(resolvedFacCode).trim() === '') &&
        authUserId
      ) {
        const queryResult: unknown = await this.dataSource.query(
          'SELECT FAC_ID AS facId FROM LLT_AUTH_USERS WHERE USER_ID = ?',
          [authUserId],
        );
        if (Array.isArray(queryResult) && queryResult.length > 0) {
          const first: unknown = (queryResult as unknown[])[0];
          if (first && typeof first === 'object' && !Array.isArray(first)) {
            const authUser = first as { facId?: number; FAC_ID?: number };
            resolvedFacCode = authUser.facId ?? authUser.FAC_ID;
          }
        }
      }

      const qb = this.enrollreceiptRepo
        .createQueryBuilder('e')
        .leftJoin(Lltreceipt, 'r', 'r.RECEIPT_ID = e.RECEIPT_ID_COPY')
        .leftJoin('LLTUMUSER', 'u', 'u.USER_USERNAME = e.CREATEUSER')
        .select('e.id', 'id')
        .addSelect('e.ENROLLRECEIPT_ID', 'receiptNo')
        .addSelect('r.RECEIPT_FILENAME', 'receiptFilename')
        .addSelect('r.RECEIPT_TYPE', 'receiptType')
        .addSelect(
          "NULLIF(LTRIM(RTRIM(CONCAT(COALESCE(e.USER_FNAMETH, ''), ' ', COALESCE(e.USER_LNAMETH, '')))), '')",
          'customerName',
        )
        .addSelect('e.amount', 'amount')
        .addSelect('e.payDate', 'effectiveDate')
        .addSelect(
          "NULLIF(LTRIM(RTRIM(CONCAT(COALESCE(e.USER_FNAMETH, ''), ' ', COALESCE(e.USER_LNAMETH, '')))), '')",
          'learnerName',
        )
        .addSelect('e.coseNameTh', 'courseName')
        .addSelect(
          "CONCAT(COALESCE(NULLIF(LTRIM(RTRIM(CONCAT(COALESCE(u.USER_FNAMETH, ''), ' ', COALESCE(u.USER_LNAMETH, '')))), ''), e.CREATEUSER, '-'), CHAR(10), COALESCE(DATE_FORMAT(e.CREATEDATE, '%Y-%m-%d %H:%i:%s'), '-'))",
          'collector',
        )
        .addSelect(
          "CASE e.RECEIPT_STATUS WHEN 'Y' THEN 'ใช้งาน' WHEN 'C' THEN 'ยกเลิก' ELSE NULL END",
          'status',
        );

      const allFacultiesRequested = query.allFaculties === true;
      const shouldFilterByFaculty = !allFacultiesRequested;
      if (
        shouldFilterByFaculty &&
        resolvedFacCode !== undefined &&
        resolvedFacCode !== null &&
        String(resolvedFacCode).trim() !== ''
      ) {
        qb.andWhere('e.FAC_ID = :facId', { facId: Number(resolvedFacCode) });
      }

      const receiptDateStart = this.parseDdMmYyyy(query.receiptDateStart, false);
      if (receiptDateStart) {
        qb.andWhere('e.CREATEDATE >= :receiptDateStart', { receiptDateStart });
      }

      const receiptDateEnd = this.parseDdMmYyyy(query.receiptDateEnd, true);
      if (receiptDateEnd) qb.andWhere('e.CREATEDATE <= :receiptDateEnd', { receiptDateEnd });

      const effectiveDateStart = this.parseDdMmYyyy(query.effectiveDateStart, false);
      if (effectiveDateStart) {
        qb.andWhere('e.PAYDATE >= :effectiveDateStart', { effectiveDateStart });
      }

      const effectiveDateEnd = this.parseDdMmYyyy(query.effectiveDateEnd, true);
      if (effectiveDateEnd) {
        qb.andWhere('e.PAYDATE <= :effectiveDateEnd', { effectiveDateEnd });
      }

      qb.orderBy('e.ENROLLRECEIPT_ID', 'ASC');

      const total = await qb.getCount();

      const page = query.page && query.page > 0 ? query.page : 1;
      const limit = query.limit && query.limit > 0 ? query.limit : 0;

      if (limit > 0) {
        qb.offset((page - 1) * limit).limit(limit);
      }

      const rows = await qb.getRawMany<Record<string, unknown>>();
      const data: ReceiptSummaryItem[] = rows.map((row, index) => {
        const receiptTypeRaw = this.valueOrDash(row.receiptType);
        const receiptFilenameRaw = this.valueOrDash(row.receiptFilename);
        const receiptType: 'R' | 'D' | undefined =
          receiptTypeRaw === 'R' || receiptTypeRaw === 'D' ? receiptTypeRaw : undefined;

        return {
          id: this.valueOrDash(row.id),
          no: index + 1,
          receiptNo: this.valueOrDash(row.receiptNo),
          ...(receiptFilenameRaw !== '-' ? { receiptFilename: receiptFilenameRaw } : {}),
          ...(receiptType ? { receiptType } : {}),
          customerName: this.valueOrDash(row.customerName),
          amount: this.numberOrDash(row.amount),
          effectiveDate: this.valueOrDash(row.effectiveDate),
          learnerName: this.valueOrDash(row.learnerName),
          courseName: this.valueOrDash(row.courseName),
          collector: this.valueOrDash(row.collector),
          status: this.valueOrDash(row.status),
        };
      });

      return { success: true, total, data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึงรายงานสรุปใบเสร็จ: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private parseDdMmYyyy(value?: string, endOfDay = false): Date | null {
    if (!value) return null;
    const [dd, mm, yyyy] = value.split('/');
    const day = Number(dd);
    const month = Number(mm);
    const year = Number(yyyy);
    if (!day || !month || !year) return null;

    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return null;
    if (endOfDay) date.setHours(23, 59, 59, 999);
    else date.setHours(0, 0, 0, 0);
    return date;
  }

  private valueOrDash(value: unknown): string {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '-';
      }
    }
    return '-';
  }

  private numberOrDash(value: unknown): number | string {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const numericValue = Number(value);
      return Number.isNaN(numericValue) ? value : numericValue;
    }
    if (typeof value === 'boolean') return Number(value);
    if (typeof value === 'object') {
      try {
        const str = JSON.stringify(value);
        const numericValue = Number(str);
        return Number.isNaN(numericValue) ? str : numericValue;
      } catch {
        return '-';
      }
    }
    return '-';
  }

  async findOne(id: number, manager?: EntityManager): Promise<Lltenrollreceipt> {
    try {
      const repo = manager ? manager.getRepository(Lltenrollreceipt) : this.enrollreceiptRepo;
      const record = await repo.findOne({
        where: { id },
        relations: ['realReceipt', 'copyReceipt'],
      });
      if (!record) throw new HttpException('ไม่พบข้อมูล', HttpStatus.NOT_FOUND);
      return record;
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึงข้อมูล: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateReceipt(
    enrollReceiptId: number,
    type: string,
    createdBy: string,
    manager?: EntityManager,
    userId?: number,
    ip?: string,
    device?: string,
  ): Promise<Lltreceipt> {
    const eRepo = manager ? manager.getRepository(Lltenrollreceipt) : this.enrollreceiptRepo;
    const rRepo = manager ? manager.getRepository(Lltreceipt) : this.receiptRepo;

    try {
      const enroll = await this.findOne(enrollReceiptId, manager);
      if (enroll.receiptStatus === 'C') {
        throw new HttpException('ใบเสร็จถูกยกเลิกแล้ว', HttpStatus.BAD_REQUEST);
      }

      let receiptToReturn: Lltreceipt | null = null;

      if (type === 'R' && enroll.receiptIdReal) {
        receiptToReturn =
          enroll.realReceipt ||
          (await rRepo.findOne({
            where: { id: enroll.receiptIdReal },
          }));
      } else if (type === 'D' && enroll.receiptIdCopy) {
        receiptToReturn =
          enroll.copyReceipt ||
          (await rRepo.findOne({
            where: { id: enroll.receiptIdCopy },
          }));
      }

      if (!receiptToReturn) {
        const newReceipt = rRepo.create({
          enrollReceiptId: enroll.id,
          receiptFilename: `${enroll.coseCode || 'UNKNOWN'}_${enroll.id}_receipt`,
          receiptType: type,
          receiptCreate: createdBy,
          createDate: new Date(),
        });
        receiptToReturn = await rRepo.save(newReceipt);

        if (type === 'R') {
          enroll.receiptIdReal = receiptToReturn.id;
        } else if (type === 'D') {
          enroll.receiptIdCopy = receiptToReturn.id;
        }
        await eRepo.save(enroll);
      }

      await this.logExport(receiptToReturn.id, userId, ip, device, manager);

      return receiptToReturn;
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        'เกิดข้อผิดพลาดในการออกใบเสร็จ: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logExport(
    receiptId: number,
    userId?: number,
    ip?: string,
    device?: string,
    manager?: EntityManager,
  ): Promise<Lltexportreceiptlog> {
    const repo = manager ? manager.getRepository(Lltexportreceiptlog) : this.logRepo;
    try {
      const log = repo.create({
        receiptId,
        userId: userId ?? null,
        receiptIp: ip ?? null,
        receiptDevice: device ?? null,
        createDate: new Date(),
      });
      return await repo.save(log);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        'เกิดข้อผิดพลาดในการบันทึก log: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cancelReceipt(id: number, dto: CancelReceiptDto): Promise<Lltenrollreceipt> {
    try {
      const enroll = await this.findOne(id);
      if (enroll.receiptStatus === 'C') {
        throw new HttpException('ใบเสร็จนี้ถูกยกเลิกไปแล้ว', HttpStatus.BAD_REQUEST);
      }
      enroll.receiptStatus = 'C';
      enroll.receiptCancleDate = new Date();
      enroll.receiptCancleUserId = dto.cancelUserId ?? null;
      enroll.receiptCancleUserName = dto.cancelUserName ?? null;
      enroll.receiptCancleRemark = dto.cancelRemark;
      return await this.enrollreceiptRepo.save(enroll);
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        'เกิดข้อผิดพลาดในการยกเลิกใบเสร็จ: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get enrollment receipt with LLTENROLL data for receipt generation
   */
  async getReceiptWithEnrollData(enrollReceiptId: number): Promise<{
    enrollReceipt: Lltenrollreceipt;
    enrollData: {
      enrollId: number;
      nameReceipt: string;
      citizen: string;
      address: string;
      updateDate: Date;
    } | null;
  }> {
    try {
      // Get the enrollment receipt
      const enrollReceipt = await this.enrollreceiptRepo.findOne({
        where: { id: enrollReceiptId },
        relations: ['realReceipt', 'copyReceipt'],
      });

      if (!enrollReceipt) {
        throw new HttpException('ไม่พบข้อมูลใบเสร็จ', HttpStatus.NOT_FOUND);
      }

      // If no enrollId, return without enroll data
      if (!enrollReceipt.enrollId) {
        return { enrollReceipt, enrollData: null };
      }

      // Query LLTENROLL for additional data
      const enrollQuery = `
        SELECT 
          ENROLL_ID as enrollId,
          ENROLL_NAMERECEIPT as nameReceipt,
          ENROLL_CITIZEN as citizen,
          ENROLL_ADDRESS as address,
          UPDATEDATE as updateDate
        FROM LLTENROLL
        WHERE ENROLL_ID = ?
      `;

      const enrollResult: unknown[] = await this.dataSource.query(enrollQuery, [
        enrollReceipt.enrollId,
      ]);

      if (!enrollResult || enrollResult.length === 0) {
        return { enrollReceipt, enrollData: null };
      }

      const enrollRow = enrollResult[0] as Record<string, string | number | Date | null>;
      const enrollData = {
        enrollId: Number(enrollRow.enrollId),
        nameReceipt: String(enrollRow.nameReceipt || ''),
        citizen: String(enrollRow.citizen || ''),
        address: String(enrollRow.address || ''),
        updateDate: enrollRow.updateDate ? new Date(enrollRow.updateDate) : new Date(),
      };

      return { enrollReceipt, enrollData };
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึงข้อมูลใบเสร็จ: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getReceiptDataById(id: number): Promise<{
    enrollReceiptId: number;
    realReceipt: {
      receiptId: number;
      filename: string;
      receiptType: string;
      url: string;
    } | null;
    copyReceipt: {
      receiptId: number;
      filename: string;
      receiptType: string;
      url: string;
    } | null;
    enrollData: {
      receiptNo: number;
      receivedFrom: string;
      taxId: string;
      address: string;
      date: string;
      amount: number | null;
      effectiveDate: Date | null;
      coseCode: string | null;
      coseNameTh: string | null;
      collectorName?: string;
    };
  }> {
    const enrollReceipt = await this.enrollreceiptRepo.findOne({
      where: { id },
      relations: ['realReceipt', 'copyReceipt'],
    });

    if (!enrollReceipt) {
      throw new HttpException('ไม่พบข้อมูลใบเสร็จ', HttpStatus.NOT_FOUND);
    }

    let collectorName = '';
    let enrollData = null;

    const creatorQuery = `
      SELECT CONCAT(COALESCE(USER_FNAMETH, ''), ' ', COALESCE(USER_LNAMETH, '')) AS fullName
      FROM LLTUMUSER
      WHERE USER_USERNAME = ?
      LIMIT 1
    `;
    const creatorPromise = enrollReceipt.createUser
      ? this.dataSource.query(creatorQuery, [enrollReceipt.createUser])
      : Promise.resolve([]);

    const enrollQuery = `
      SELECT 
        ENROLL_NAMERECEIPT as nameReceipt,
        ENROLL_CITIZEN as citizen,
        ENROLL_ADDRESS as address,
        UPDATEDATE as updateDate
      FROM LLTENROLL
      WHERE ENROLL_ID = ?
    `;
    const enrollPromise = enrollReceipt.enrollId
      ? this.dataSource.query(enrollQuery, [enrollReceipt.enrollId])
      : Promise.resolve([]);

    const [creatorResult, enrollResult] = await Promise.all([creatorPromise, enrollPromise] as [
      Promise<unknown[]>,
      Promise<unknown[]>,
    ]);

    if (enrollReceipt.createUser) {
      if (creatorResult && creatorResult.length > 0) {
        const row = creatorResult[0] as Record<string, unknown>;
        collectorName = (row.fullName as string)?.trim() || enrollReceipt.createUser;
      } else {
        collectorName = enrollReceipt.createUser;
      }
    }

    if (enrollReceipt.enrollId) {
      if (enrollResult && enrollResult.length > 0) {
        const row = enrollResult[0] as Record<string, unknown>;
        let dateOnly = '';
        if (row.updateDate) {
          const d = new Date(row.updateDate as string);
          dateOnly = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }

        enrollData = {
          receiptNo: enrollReceipt.id,
          receivedFrom: String((row.nameReceipt as string) || ''),
          taxId: String((row.citizen as string) || ''),
          address: String((row.address as string) || ''),
          date: dateOnly,
          amount: enrollReceipt.amount,
          effectiveDate: enrollReceipt.effectiveDate,
          coseCode: enrollReceipt.coseCode,
          coseNameTh: enrollReceipt.coseNameTh,
          collectorName,
        };
      }
    }

    if (!enrollData) {
      enrollData = {
        receiptNo: enrollReceipt.id,
        receivedFrom: '',
        taxId: '',
        address: '',
        date: '',
        amount: enrollReceipt.amount,
        effectiveDate: enrollReceipt.effectiveDate,
        coseCode: enrollReceipt.coseCode,
        coseNameTh: enrollReceipt.coseNameTh,
        collectorName,
      };
    }

    const mapReceipt = (
      receipt: Lltreceipt,
    ): { receiptId: number; filename: string; receiptType: string; url: string } => {
      const filename =
        receipt.receiptType === 'D' ? `${receipt.receiptFilename}_copy` : receipt.receiptFilename;
      return {
        receiptId: receipt.id,
        filename,
        receiptType: receipt.receiptType,
        url: `/api/files/receipts/${receipt.receiptFilename}`,
      };
    };

    return {
      enrollReceiptId: enrollReceipt.id,
      realReceipt: enrollReceipt.realReceipt ? mapReceipt(enrollReceipt.realReceipt) : null,
      copyReceipt: enrollReceipt.copyReceipt ? mapReceipt(enrollReceipt.copyReceipt) : null,
      enrollData,
    };
  }

  async getReceiptDataByEnrollId(enrollId: number): Promise<{
    enrollReceiptId: number;
    realReceipt: {
      receiptId: number;
      filename: string;
      receiptType: string;
      url: string;
    } | null;
    copyReceipt: {
      receiptId: number;
      filename: string;
      receiptType: string;
      url: string;
    } | null;
    enrollData: {
      receiptNo: number;
      receivedFrom: string;
      taxId: string;
      address: string;
      date: string;
      amount: number | null;
      effectiveDate: Date | null;
      coseCode: string | null;
      coseNameTh: string | null;
      collectorName?: string;
    };
  }> {
    const enrollReceipt = await this.enrollreceiptRepo.findOne({
      where: { enrollId },
      relations: ['realReceipt', 'copyReceipt'],
      order: { id: 'DESC' },
    });

    if (!enrollReceipt) {
      // No receipt yet is a normal state (free course / receipt not issued), not an error.
      // Return an empty payload with 200 so callers checking `hasReceipt` don't spam 404s.
      return {
        enrollReceiptId: 0,
        realReceipt: null,
        copyReceipt: null,
        enrollData: {
          receiptNo: 0,
          receivedFrom: '',
          taxId: '',
          address: '',
          date: '',
          amount: null,
          effectiveDate: null,
          coseCode: null,
          coseNameTh: null,
        },
      };
    }

    let collectorName = '';
    let enrollData = null;

    const creatorQuery = `
      SELECT CONCAT(COALESCE(USER_FNAMETH, ''), ' ', COALESCE(USER_LNAMETH, '')) AS fullName
      FROM LLTUMUSER
      WHERE USER_USERNAME = ?
      LIMIT 1
    `;
    const creatorPromise = enrollReceipt.createUser
      ? this.dataSource.query(creatorQuery, [enrollReceipt.createUser])
      : Promise.resolve([]);

    const enrollQuery = `
      SELECT 
        ENROLL_NAMERECEIPT as nameReceipt,
        ENROLL_CITIZEN as citizen,
        ENROLL_ADDRESS as address,
        UPDATEDATE as updateDate
      FROM LLTENROLL
      WHERE ENROLL_ID = ?
    `;
    const enrollPromise = this.dataSource.query(enrollQuery, [enrollId]);

    const [creatorResult, enrollResult] = await Promise.all([creatorPromise, enrollPromise] as [
      Promise<unknown[]>,
      Promise<unknown[]>,
    ]);

    if (enrollReceipt.createUser) {
      if (creatorResult && creatorResult.length > 0) {
        const row = creatorResult[0] as Record<string, unknown>;
        collectorName = (row.fullName as string)?.trim() || enrollReceipt.createUser;
      } else {
        collectorName = enrollReceipt.createUser;
      }
    }

    if (enrollResult && enrollResult.length > 0) {
      const row = enrollResult[0] as Record<string, unknown>;
      let dateOnly = '';
      if (row.updateDate) {
        const d = new Date(row.updateDate as string);
        dateOnly = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }

      enrollData = {
        receiptNo: enrollReceipt.id,
        receivedFrom: String((row.nameReceipt as string) || ''),
        taxId: String((row.citizen as string) || ''),
        address: String((row.address as string) || ''),
        date: dateOnly,
        amount: enrollReceipt.amount,
        effectiveDate: enrollReceipt.effectiveDate,
        coseCode: enrollReceipt.coseCode,
        coseNameTh: enrollReceipt.coseNameTh,
        collectorName,
      };
    } else {
      enrollData = {
        receiptNo: enrollReceipt.id,
        receivedFrom: '',
        taxId: '',
        address: '',
        date: '',
        amount: enrollReceipt.amount,
        effectiveDate: enrollReceipt.effectiveDate,
        coseCode: enrollReceipt.coseCode,
        coseNameTh: enrollReceipt.coseNameTh,
        collectorName,
      };
    }

    const mapReceipt = (
      receipt: Lltreceipt,
    ): { receiptId: number; filename: string; receiptType: string; url: string } => {
      const filename =
        receipt.receiptType === 'D' ? `${receipt.receiptFilename}_copy` : receipt.receiptFilename;
      return {
        receiptId: receipt.id,
        filename,
        receiptType: receipt.receiptType,
        url: `/api/files/receipts/${receipt.receiptFilename}`,
      };
    };

    return {
      enrollReceiptId: enrollReceipt.id,
      realReceipt: enrollReceipt.realReceipt ? mapReceipt(enrollReceipt.realReceipt) : null,
      copyReceipt: enrollReceipt.copyReceipt ? mapReceipt(enrollReceipt.copyReceipt) : null,
      enrollData,
    };
  }
}
