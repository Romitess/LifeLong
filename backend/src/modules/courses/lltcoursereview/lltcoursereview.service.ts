import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { CreateLltcoursereviewDto } from './dto/create-lltcoursereview.dto';
import { LltcoursereviewListDto } from './dto/lltcoursereview-list.dto';
import { LltcoursereviewResponseDto } from './dto/lltcoursereview-response.dto';
import {
  LltcoursereviewSummaryDto,
  RatingDistributionDto,
} from './dto/lltcoursereview-summary.dto';
import { MyLltcoursereviewDto } from './dto/my-lltcoursereview.dto';
import { QueryLltcoursereviewDto } from './dto/query-lltcoursereview.dto';
import { QueryModerationDto } from './dto/query-moderation.dto';

interface EligibilityResult {
  enrollId: number | null;
  reason: string | null;
}

interface ReviewRow {
  reviewId: number | string;
  userId: number | string;
  rating: number | string;
  comment: string | null;
  createDate: Date | string | null;
  firstNameTh: string | null;
  lastNameTh: string | null;
  imageUrl: string | null;
}

interface SummaryRow {
  average: string | number | null;
  total: string | number;
  r1: string | number;
  r2: string | number;
  r3: string | number;
  r4: string | number;
  r5: string | number;
}

interface CountRow {
  total: string | number;
}

interface ModerationRow extends ReviewRow {
  status: string;
  courseId: number | string;
}

@Injectable()
export class LltcoursereviewService {
  private readonly logger = new Logger(LltcoursereviewService.name);

  constructor(private readonly dataSource: DataSource) {}

  // ─── Eligibility ────────────────────────────────────────────────────────────

  async getEligibility(courseId: number, userId: number): Promise<EligibilityResult> {
    // Check if any enrollment exists for this user+course
    const allRows = await this.dataSource.query<
      Array<{ enrollId: number | string; status: string | null }>
    >(
      `SELECT ENROLL_ID AS enrollId, ENROLL_STATUS AS status
       FROM LLTENROLL
       WHERE COSE_ID = ? AND USER_ID = ?
       ORDER BY ENROLL_ID DESC`,
      [courseId, userId],
    );

    if (allRows.length === 0) {
      return { enrollId: null, reason: 'NOT_ENROLLED' };
    }

    // Find the latest completed enrollment
    const completed = allRows.find((r) => r.status === 'C');
    if (!completed) {
      return { enrollId: null, reason: 'NOT_COMPLETED' };
    }

    return { enrollId: Number(completed.enrollId), reason: null };
  }

  // ─── Public: list reviews for a course ──────────────────────────────────────

  async findByCourse(
    courseId: number,
    query: QueryLltcoursereviewDto,
  ): Promise<LltcoursereviewListDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    let orderBy: string;
    switch (query.sort ?? 'newest') {
      case 'highest':
        orderBy = 'r.REVIEW_RATING DESC, r.CREATEDATE DESC';
        break;
      case 'lowest':
        orderBy = 'r.REVIEW_RATING ASC, r.CREATEDATE DESC';
        break;
      default:
        orderBy = 'r.CREATEDATE DESC';
    }

    const ratingFilter = query.rating != null ? 'AND r.REVIEW_RATING = ?' : '';
    const params: (number | string)[] = [courseId];
    if (query.rating != null) params.push(query.rating);
    params.push(limit, offset);

    const rows = await this.dataSource.query<ReviewRow[]>(
      `SELECT
         r.REVIEW_ID      AS reviewId,
         r.USER_ID        AS userId,
         r.REVIEW_RATING  AS rating,
         r.REVIEW_COMMENT AS comment,
         r.CREATEDATE     AS createDate,
         COALESCE(NULLIF(TRIM(u.USER_FNAMETH), ''), u.USER_FNAMEEN) AS firstNameTh,
         COALESCE(NULLIF(TRIM(u.USER_LNAMETH), ''), u.USER_LNAMEEN) AS lastNameTh,
         u.USER_IMAGE_URL AS imageUrl
       FROM LLTCOURSEREVIEW r
       JOIN LLTUMUSER u ON u.USER_ID = r.USER_ID
       WHERE r.COSE_ID = ? AND r.REVIEW_STATUS = 'A' ${ratingFilter}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      params,
    );

    const countParams: (number | string)[] = [courseId];
    if (query.rating != null) countParams.push(query.rating);
    const countRows = await this.dataSource.query<CountRow[]>(
      `SELECT COUNT(*) AS total
       FROM LLTCOURSEREVIEW r
       WHERE r.COSE_ID = ? AND r.REVIEW_STATUS = 'A' ${ratingFilter}`,
      countParams,
    );

    const summary = await this.getSummary(courseId);

    return {
      items: rows.map((r) => this.mapReviewRow(r)),
      total: Number(countRows[0]?.total ?? 0),
      page,
      limit,
      summary,
    };
  }

  // ─── My review ──────────────────────────────────────────────────────────────

  async getMyReview(courseId: number, userId: number): Promise<MyLltcoursereviewDto> {
    const { enrollId, reason } = await this.getEligibility(courseId, userId);
    const canReview = reason === null;

    const rows = await this.dataSource.query<ReviewRow[]>(
      `SELECT
         r.REVIEW_ID      AS reviewId,
         r.USER_ID        AS userId,
         r.REVIEW_RATING  AS rating,
         r.REVIEW_COMMENT AS comment,
         r.CREATEDATE     AS createDate,
         COALESCE(NULLIF(TRIM(u.USER_FNAMETH), ''), u.USER_FNAMEEN) AS firstNameTh,
         COALESCE(NULLIF(TRIM(u.USER_LNAMETH), ''), u.USER_LNAMEEN) AS lastNameTh,
         u.USER_IMAGE_URL AS imageUrl
       FROM LLTCOURSEREVIEW r
       JOIN LLTUMUSER u ON u.USER_ID = r.USER_ID
       WHERE r.COSE_ID = ? AND r.USER_ID = ?`,
      [courseId, userId],
    );

    void enrollId; // used for eligibility, not needed here

    return {
      canReview,
      reason,
      review: rows.length > 0 ? this.mapReviewRow(rows[0]) : null,
    };
  }

  // ─── Upsert my review ───────────────────────────────────────────────────────

  async upsertMyReview(
    courseId: number,
    userId: number,
    dto: CreateLltcoursereviewDto,
    username: string,
  ): Promise<LltcoursereviewResponseDto> {
    const { enrollId, reason } = await this.getEligibility(courseId, userId);
    if (reason !== null) {
      throw new ForbiddenException(reason);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if a review already exists for this user+course (for audit fields)
      const existing = (await queryRunner.query(
        `SELECT REVIEW_ID AS id FROM LLTCOURSEREVIEW WHERE COSE_ID = ? AND USER_ID = ?`,
        [courseId, userId],
      )) as Array<{ id: number | string }>;

      if (existing.length > 0) {
        // Update
        await queryRunner.query(
          `UPDATE LLTCOURSEREVIEW
           SET REVIEW_RATING = ?, REVIEW_COMMENT = ?, ENROLL_ID = ?,
               REVIEW_STATUS = 'A', UPDATEUSER = ?, UPDATEDATE = NOW()
           WHERE COSE_ID = ? AND USER_ID = ?`,
          [dto.rating, dto.comment ?? null, enrollId, username, courseId, userId],
        );
      } else {
        // Insert
        await queryRunner.query(
          `INSERT INTO LLTCOURSEREVIEW
             (COSE_ID, USER_ID, ENROLL_ID, REVIEW_RATING, REVIEW_COMMENT, REVIEW_STATUS, CREATEUSER, CREATEDATE, UPDATEDATE)
           VALUES (?, ?, ?, ?, ?, 'A', ?, NOW(), NOW())`,
          [courseId, userId, enrollId, dto.rating, dto.comment ?? null, username],
        );
      }

      await this.recomputeCache(courseId, queryRunner.manager);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `upsertMyReview failed courseId=${courseId} userId=${userId}: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err;
    } finally {
      await queryRunner.release();
    }

    // Return the saved review
    const rows = await this.dataSource.query<ReviewRow[]>(
      `SELECT
         r.REVIEW_ID      AS reviewId,
         r.USER_ID        AS userId,
         r.REVIEW_RATING  AS rating,
         r.REVIEW_COMMENT AS comment,
         r.CREATEDATE     AS createDate,
         COALESCE(NULLIF(TRIM(u.USER_FNAMETH), ''), u.USER_FNAMEEN) AS firstNameTh,
         COALESCE(NULLIF(TRIM(u.USER_LNAMETH), ''), u.USER_LNAMEEN) AS lastNameTh,
         u.USER_IMAGE_URL AS imageUrl
       FROM LLTCOURSEREVIEW r
       JOIN LLTUMUSER u ON u.USER_ID = r.USER_ID
       WHERE r.COSE_ID = ? AND r.USER_ID = ?`,
      [courseId, userId],
    );

    return this.mapReviewRow(rows[0]);
  }

  // ─── Delete my review ───────────────────────────────────────────────────────

  async deleteMyReview(courseId: number, userId: number): Promise<void> {
    const existing = await this.dataSource.query<Array<{ id: number | string }>>(
      `SELECT REVIEW_ID AS id FROM LLTCOURSEREVIEW WHERE COSE_ID = ? AND USER_ID = ?`,
      [courseId, userId],
    );
    if (existing.length === 0) {
      throw new NotFoundException('Review not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`DELETE FROM LLTCOURSEREVIEW WHERE COSE_ID = ? AND USER_ID = ?`, [
        courseId,
        userId,
      ]);
      await this.recomputeCache(courseId, queryRunner.manager);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `deleteMyReview failed courseId=${courseId} userId=${userId}: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ─── Summary ────────────────────────────────────────────────────────────────

  async getSummary(courseId: number): Promise<LltcoursereviewSummaryDto> {
    const rows = await this.dataSource.query<SummaryRow[]>(
      `SELECT
         ROUND(AVG(REVIEW_RATING), 2)                          AS average,
         COUNT(*)                                               AS total,
         SUM(REVIEW_RATING = 1)                                AS r1,
         SUM(REVIEW_RATING = 2)                                AS r2,
         SUM(REVIEW_RATING = 3)                                AS r3,
         SUM(REVIEW_RATING = 4)                                AS r4,
         SUM(REVIEW_RATING = 5)                                AS r5
       FROM LLTCOURSEREVIEW
       WHERE COSE_ID = ? AND REVIEW_STATUS = 'A'`,
      [courseId],
    );

    const row = rows[0];
    const distribution: RatingDistributionDto = {
      1: Number(row?.r1 ?? 0),
      2: Number(row?.r2 ?? 0),
      3: Number(row?.r3 ?? 0),
      4: Number(row?.r4 ?? 0),
      5: Number(row?.r5 ?? 0),
    };

    return {
      average: row?.average != null ? Number(row.average) : 0,
      total: Number(row?.total ?? 0),
      distribution,
    };
  }

  // ─── Admin: moderation list ──────────────────────────────────────────────────

  async findForModeration(
    query: QueryModerationDto,
  ): Promise<{ items: ModerationReviewDto[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const statusFilter = query.status ? 'AND r.REVIEW_STATUS = ?' : '';
    const params: (number | string)[] = [];
    if (query.status) params.push(query.status);
    params.push(limit, offset);

    const rows = await this.dataSource.query<ModerationRow[]>(
      `SELECT
         r.REVIEW_ID      AS reviewId,
         r.USER_ID        AS userId,
         r.REVIEW_RATING  AS rating,
         r.REVIEW_COMMENT AS comment,
         r.REVIEW_STATUS  AS status,
         r.COSE_ID        AS courseId,
         r.CREATEDATE     AS createDate,
         COALESCE(NULLIF(TRIM(u.USER_FNAMETH), ''), u.USER_FNAMEEN) AS firstNameTh,
         COALESCE(NULLIF(TRIM(u.USER_LNAMETH), ''), u.USER_LNAMEEN) AS lastNameTh,
         u.USER_IMAGE_URL AS imageUrl
       FROM LLTCOURSEREVIEW r
       JOIN LLTUMUSER u ON u.USER_ID = r.USER_ID
       WHERE 1=1 ${statusFilter}
       ORDER BY r.CREATEDATE DESC
       LIMIT ? OFFSET ?`,
      params,
    );

    const countParams: (number | string)[] = [];
    if (query.status) countParams.push(query.status);
    const countRows = await this.dataSource.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM LLTCOURSEREVIEW r WHERE 1=1 ${statusFilter}`,
      countParams,
    );

    return {
      items: rows.map((r) => ({
        id: Number(r.reviewId),
        rating: Number(r.rating),
        comment: r.comment,
        status: r.status,
        courseId: Number(r.courseId),
        createDate:
          r.createDate instanceof Date
            ? r.createDate
            : r.createDate
              ? new Date(r.createDate)
              : null,
        reviewer: {
          name: this.buildName(r.firstNameTh, r.lastNameTh),
          imageUrl: r.imageUrl ?? null,
          avatarSeed: `lll-user-${r.userId}`,
        },
      })),
      total: Number(countRows[0]?.total ?? 0),
      page,
      limit,
    };
  }

  // ─── Admin: set review status ────────────────────────────────────────────────

  async setStatus(reviewId: number, status: 'A' | 'P' | 'H'): Promise<void> {
    const existing = await this.dataSource.query<Array<{ courseId: number | string }>>(
      `SELECT COSE_ID AS courseId FROM LLTCOURSEREVIEW WHERE REVIEW_ID = ?`,
      [reviewId],
    );
    if (existing.length === 0) {
      throw new NotFoundException('Review not found');
    }
    const courseId = Number(existing[0].courseId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `UPDATE LLTCOURSEREVIEW SET REVIEW_STATUS = ?, UPDATEDATE = NOW() WHERE REVIEW_ID = ?`,
        [status, reviewId],
      );
      await this.recomputeCache(courseId, queryRunner.manager);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `setStatus failed reviewId=${reviewId}: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ─── Cache recompute ─────────────────────────────────────────────────────────

  async recomputeCache(courseId: number, manager: EntityManager): Promise<void> {
    await manager.query(
      `UPDATE LLTCOURSE
       SET COSE_RATINGAVG   = COALESCE((
             SELECT ROUND(AVG(REVIEW_RATING), 2)
             FROM LLTCOURSEREVIEW
             WHERE COSE_ID = ? AND REVIEW_STATUS = 'A'
           ), 0.00),
           COSE_RATINGCOUNT = COALESCE((
             SELECT COUNT(*)
             FROM LLTCOURSEREVIEW
             WHERE COSE_ID = ? AND REVIEW_STATUS = 'A'
           ), 0)
       WHERE COSE_ID = ?`,
      [courseId, courseId, courseId],
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private mapReviewRow(row: ReviewRow): LltcoursereviewResponseDto {
    return {
      id: Number(row.reviewId),
      rating: Number(row.rating),
      comment: row.comment ?? null,
      createDate:
        row.createDate instanceof Date
          ? row.createDate
          : row.createDate
            ? new Date(row.createDate)
            : null,
      reviewer: {
        name: LltcoursereviewService.buildNameStatic(row.firstNameTh, row.lastNameTh),
        imageUrl: row.imageUrl ?? null,
        avatarSeed: `lll-user-${row.userId}`,
      },
    };
  }

  private buildName(first: string | null, last: string | null): string {
    return LltcoursereviewService.buildNameStatic(first, last);
  }

  private static buildNameStatic(first: string | null, last: string | null): string {
    const parts = [first, last].filter(Boolean);
    return parts.join(' ');
  }
}

// ─── Moderation response shape (inline, no separate DTO file needed) ──────────

export interface ModerationReviewDto {
  id: number;
  rating: number;
  comment: string | null;
  status: string;
  courseId: number;
  createDate: Date | null;
  reviewer: { name: string; imageUrl: string | null; avatarSeed: string };
}
