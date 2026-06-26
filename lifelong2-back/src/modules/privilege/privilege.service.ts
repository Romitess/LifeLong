import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  UNIVERSITY_DIRECTORY,
  UniversityDirectory,
} from './interfaces/university-directory.interface';
import { CheckPrivilegeDto } from './dto/check-privilege.dto';
import { PrivilegeResponseDto } from './dto/privilege-response.dto';
import { mapStutypeNameToSource } from './utils/stutype.util';
import { maskCitizenId } from 'src/common/utils/mask.utils';

@Injectable()
export class PrivilegeService {
  private readonly logger = new Logger(PrivilegeService.name);

  constructor(
    @Inject(UNIVERSITY_DIRECTORY)
    private readonly universityDirectory: UniversityDirectory,
    private readonly dataSource: DataSource,
  ) {}

  async checkAndUpsert(
    lltumUserId: number | null,
    email: string,
    dto: CheckPrivilegeDto,
  ): Promise<PrivilegeResponseDto> {
    if (!lltumUserId) {
      throw new BadRequestException('User profile not linked — please contact support');
    }

    // Resolve citizen ID: body → stored in DB (USER_CITIZEN_ID)
    let citizenId = dto.citizenId ?? null;
    if (!citizenId) {
      const rows = await this.dataSource.query<{ userCitizenId: string | null }[]>(
        `SELECT USER_CITIZEN_ID AS userCitizenId FROM LLTUMUSER WHERE USER_ID = ? LIMIT 1`,
        [lltumUserId],
      );
      citizenId = rows[0]?.userCitizenId ?? null;
    }

    // If a new citizenId was provided via body, save it to profile
    if (dto.citizenId) {
      await this.dataSource.query(
        `UPDATE LLTUMUSER SET USER_CITIZEN_ID = ?, UPDATEUSER = 'privilege-check', UPDATEDATE = NOW()
         WHERE USER_ID = ? AND (USER_CITIZEN_ID IS NULL OR USER_CITIZEN_ID = ?)`,
        [dto.citizenId, lltumUserId, dto.citizenId],
      );
    }

    const resolved = await this.universityDirectory.resolveStudentType({ citizenId, email });

    if (!resolved) {
      return {
        hasPrivilege: false,
        stutypeId: null,
        stutypeName: null,
        source: null,
        checkedAt: new Date().toISOString(),
      };
    }

    // Idempotent upsert — PK is composite (USER_ID, STUTYPE_ID)
    await this.dataSource.query(
      `INSERT INTO LLTPRIVILEGE
         (USER_ID, STUTYPE_ID, USER_CITIZEN, CREATEUSER, CREATEDATE, UPDATEUSER, UPDATEDATE, UPDATEPROG)
       VALUES (?, ?, ?, 'privilege-check', NOW(), 'privilege-check', NOW(), 'privilege.service')
       ON DUPLICATE KEY UPDATE
         USER_CITIZEN = COALESCE(VALUES(USER_CITIZEN), USER_CITIZEN),
         UPDATEUSER   = VALUES(UPDATEUSER),
         UPDATEDATE   = NOW(),
         UPDATEPROG   = VALUES(UPDATEPROG)`,
      [lltumUserId, resolved.stutypeId, citizenId],
    );

    this.logger.log(
      `Privilege upserted: userId=${lltumUserId} citizenId=${maskCitizenId(citizenId ?? '')} stutypeId=${resolved.stutypeId} source=${resolved.source}`,
    );

    return {
      hasPrivilege: true,
      stutypeId: resolved.stutypeId,
      stutypeName: resolved.stutypeName,
      source: resolved.source,
      checkedAt: new Date().toISOString(),
    };
  }

  async getMyPrivilege(lltumUserId: number | null): Promise<PrivilegeResponseDto> {
    if (!lltumUserId) {
      return {
        hasPrivilege: false,
        stutypeId: null,
        stutypeName: null,
        source: null,
        checkedAt: new Date().toISOString(),
      };
    }

    const rows = await this.dataSource.query<{ stutypeId: number; stutypeName: string | null }[]>(
      `SELECT p.STUTYPE_ID AS stutypeId, s.STUTYPE_NAME AS stutypeName
       FROM LLTPRIVILEGE p
       LEFT JOIN LLTTYPESTUDENT s ON s.STUTYPE_ID = p.STUTYPE_ID
       WHERE p.USER_ID = ?
       LIMIT 1`,
      [lltumUserId],
    );

    const row = rows[0] ?? null;
    if (!row) {
      return {
        hasPrivilege: false,
        stutypeId: null,
        stutypeName: null,
        source: null,
        checkedAt: new Date().toISOString(),
      };
    }

    return {
      hasPrivilege: true,
      stutypeId: row.stutypeId,
      stutypeName: row.stutypeName ?? null,
      source: mapStutypeNameToSource(row.stutypeName),
      checkedAt: new Date().toISOString(),
    };
  }

  async hasCitizenId(lltumUserId: number | null): Promise<boolean> {
    if (!lltumUserId) return false;
    const rows = await this.dataSource.query<{ has: number }[]>(
      `SELECT COUNT(*) AS \`has\` FROM LLTUMUSER
       WHERE USER_ID = ? AND USER_CITIZEN_ID IS NOT NULL`,
      [lltumUserId],
    );
    return (rows[0]?.has ?? 0) > 0;
  }
}
