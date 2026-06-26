import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ResolveContext, UniversityDirectory } from '../interfaces/university-directory.interface';
import { mapStutypeNameToSource } from '../utils/stutype.util';

@Injectable()
export class ManualUniversityDirectoryProvider implements UniversityDirectory {
  constructor(private readonly dataSource: DataSource) {}

  async resolveStudentType(context: ResolveContext): Promise<{
    stutypeId: number;
    stutypeName: string | null;
    source: 'student' | 'alumni' | 'staff';
  } | null> {
    if (!context.citizenId) return null;

    // 1. PSNTPERSON by PSN_IDCARD → บุคลากร
    const staffRows = await this.dataSource.query<
      { stutypeId: number; stutypeName: string | null }[]
    >(
      `SELECT s.STUTYPE_ID AS stutypeId, s.STUTYPE_NAME AS stutypeName
       FROM PSNTPERSON p
       JOIN LLTTYPESTUDENT s ON s.STUTYPE_NAME LIKE '%บุคลากร%'
       WHERE p.PSN_IDCARD = ?
         AND (p.PSN_RETIRE IS NULL OR p.PSN_RETIRE != 'Y')
       LIMIT 1`,
      [context.citizenId],
    );
    if (staffRows[0]) {
      return {
        stutypeId: staffRows[0].stutypeId,
        stutypeName: staffRows[0].stutypeName,
        source: 'staff',
      };
    }

    // 2. STUDENTGRAD by CITIZENID → ศิษย์เก่า
    const alumniStutype = await this.dataSource.query<
      { stutypeId: number; stutypeName: string | null }[]
    >(
      `SELECT STUTYPE_ID AS stutypeId, STUTYPE_NAME AS stutypeName
       FROM LLTTYPESTUDENT WHERE STUTYPE_NAME LIKE '%ศิษย์เก่า%' AND STUTYPE_STATUS = 'Y' LIMIT 1`,
    );
    if (alumniStutype[0]) {
      const gradRows = await this.dataSource.query<{ citizenId: string }[]>(
        `SELECT CITIZENID AS citizenId FROM STUDENTGRAD
         WHERE CITIZENID = ? AND STUDENTSTATUS = 'จบการศึกษา' LIMIT 1`,
        [context.citizenId],
      );
      if (gradRows[0]) {
        return {
          stutypeId: alumniStutype[0].stutypeId,
          stutypeName: alumniStutype[0].stutypeName,
          source: 'alumni',
        };
      }
    }

    // 3. LLTPRIVILEGE by USER_CITIZEN → นิสิต หรือ admin-assigned
    const privRows = await this.dataSource.query<
      { stutypeId: number; stutypeName: string | null }[]
    >(
      `SELECT p.STUTYPE_ID AS stutypeId, s.STUTYPE_NAME AS stutypeName
       FROM LLTPRIVILEGE p
       LEFT JOIN LLTTYPESTUDENT s ON s.STUTYPE_ID = p.STUTYPE_ID
       WHERE p.USER_CITIZEN = ?
       LIMIT 1`,
      [context.citizenId],
    );
    const row = privRows[0] ?? null;
    if (!row) return null;

    const source = mapStutypeNameToSource(row.stutypeName) ?? 'student';
    return { stutypeId: row.stutypeId, stutypeName: row.stutypeName, source };
  }
}
