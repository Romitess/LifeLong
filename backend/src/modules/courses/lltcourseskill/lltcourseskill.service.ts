import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface SkillRow {
  skillId: number;
  skillName: string;
}

interface UserSkillRow {
  skillId: number;
  skillName: string;
  skillScore: number | string;
}

interface CourseSkillRow {
  courseId: number;
  skillId: number;
  skillName: string;
  skillWeight: number | string;
  courseScore: number | string | null;
}

@Injectable()
export class LltcourseskillService {
  private readonly logger = new Logger(LltcourseskillService.name);
  private cachedSkills: { id: number; label: string }[] | null = null;

  constructor(private readonly dataSource: DataSource) {}

  /** Get all master skills */
  async findAllSkills(): Promise<{ id: number; label: string }[]> {
    if (this.cachedSkills) {
      return this.cachedSkills;
    }

    const rows = await this.dataSource.query<SkillRow[]>(
      `SELECT SKILL_ID AS skillId, SKILL_NAME AS skillName FROM LLTSKILL ORDER BY SKILL_ID`,
    );
    this.cachedSkills = rows.map((r) => ({ id: r.skillId, label: r.skillName }));
    return this.cachedSkills;
  }

  /** Get user skill scores for dashboard / spider chart */
  async getUserSkills(
    userId: number,
    username?: string,
  ): Promise<{
    skills: { skillId: number; skillName: string; score: number }[];
  }> {
    let actualUserId = userId;
    if (username) {
      // Find the real UM USER_ID associated with this login
      const umRows = await this.dataSource.query<{ USER_ID: number }[]>(
        `SELECT USER_ID FROM LLTUMUSER WHERE USER_USERNAME = ?`,
        [username],
      );
      if (umRows.length > 0) {
        actualUserId = umRows[0].USER_ID;
      }
    }

    // Get all master skills and left-join with user scores
    const rows = await this.dataSource.query<UserSkillRow[]>(
      `SELECT s.SKILL_ID AS skillId, s.SKILL_NAME AS skillName,
              COALESCE(us.SKILL_SCORE, 0) AS skillScore
       FROM LLTSKILL s
       LEFT JOIN LLTUSER_SKILL us ON us.SKILL_ID = s.SKILL_ID AND us.USER_ID = ?
       ORDER BY s.SKILL_ID`,
      [actualUserId],
    );

    return {
      skills: rows.map((r) => ({
        skillId: r.skillId,
        skillName: r.skillName,
        score: Number(r.skillScore),
      })),
    };
  }

  /** Recalculate user skills after course completion */
  async recalculateUserSkills(userId: number, actor: string): Promise<void> {
    this.logger.log(`Recalculating skills for user ${userId}`);

    // 1. Get all completed courses with their scores for this user
    //    A course is completed when the user has a certificate (LLTCERTIFICATE exists)
    //    or when ENROLL_APPROVEGRADE = 'Y'
    const courseScores = await this.dataSource.query<CourseSkillRow[]>(
      `SELECT
         e.COSE_ID AS courseId,
         cs.SKILL_ID AS skillId,
         sk.SKILL_NAME AS skillName,
         cs.SKILL_WEIGHT AS skillWeight,
         e.LMS_FINALSCORE AS courseScore
       FROM LLTENROLL e
       INNER JOIN LLTCOURSESKILL cs ON cs.COSE_ID = e.COSE_ID
       INNER JOIN LLTSKILL sk ON sk.SKILL_ID = cs.SKILL_ID
       WHERE e.USER_ID = ?
         AND (e.ENROLL_APPROVEGRADE = 'Y' OR e.ENROLL_STATUS = 'C' OR EXISTS (
           SELECT 1 FROM LLTCERTIFICATE cert WHERE cert.ENROLL_ID = e.ENROLL_ID
         ))
         AND cs.SKILL_WEIGHT > 0
       ORDER BY cs.SKILL_ID`,
      [userId],
    );

    // 2. Group by skill and calculate weighted average
    const skillAgg = new Map<number, { totalWeightedScore: number; totalWeight: number }>();

    for (const row of courseScores) {
      const skillId = row.skillId;
      const weight = Number(row.skillWeight) / 100; // Convert percentage to decimal
      const score = row.courseScore != null ? Number(row.courseScore) : 100;
      const weightedScore = score * weight;

      if (!skillAgg.has(skillId)) {
        skillAgg.set(skillId, { totalWeightedScore: 0, totalWeight: 0 });
      }
      const agg = skillAgg.get(skillId)!;
      agg.totalWeightedScore += weightedScore;
      agg.totalWeight += weight;
    }

    // 3. Calculate accumulated score (scale to 0-5)
    // Accumulate all weighted scores. A course with 100 score and 20% weight gives 20 points out of 100.
    // 100 accumulated points equal a 5.0 score.

    const skillsArray = Array.from(skillAgg.entries());
    const BATCH_SIZE = 500;

    for (let i = 0; i < skillsArray.length; i += BATCH_SIZE) {
      const chunk = skillsArray.slice(i, i + BATCH_SIZE);
      const upsertValues: (number | string)[] = [];
      const placeholders: string[] = [];

      for (const [skillId, agg] of chunk) {
        // Accumulate weighted score across all completed courses contributing to this skill
        const totalAccumulatedScore = agg.totalWeightedScore;

        // Normalize to 0-5 scale (from 0-100 scale)
        const normalizedScore = Math.min(5, Math.max(0, (totalAccumulatedScore / 100) * 5));
        const roundedScore = Math.round(normalizedScore * 100) / 100; // 2 decimal places

        placeholders.push('(?, ?, ?, ?, NOW(), ?, NOW())');
        upsertValues.push(userId, skillId, roundedScore, actor, actor);
      }

      // 4. Bulk Upsert into LLTUSER_SKILL for this chunk
      if (placeholders.length > 0) {
        await this.dataSource.query(
          `INSERT INTO LLTUSER_SKILL (USER_ID, SKILL_ID, SKILL_SCORE, CREATEUSER, CREATEDATE, UPDATEUSER, UPDATEDATE)
           VALUES ${placeholders.join(', ')}
           ON DUPLICATE KEY UPDATE SKILL_SCORE = VALUES(SKILL_SCORE), UPDATEUSER = VALUES(UPDATEUSER), UPDATEDATE = NOW()`,
          upsertValues,
        );
      }
    }

    this.logger.log(`Recalculated ${skillAgg.size} skills for user ${userId}`);
  }
}
