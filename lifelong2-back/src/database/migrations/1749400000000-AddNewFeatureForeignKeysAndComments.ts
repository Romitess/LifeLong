import { MigrationInterface, QueryRunner } from 'typeorm';

interface CountRow {
  count: string | number;
}

interface ColumnRow {
  COLUMN_NAME: string;
  COLUMN_TYPE: string;
  IS_NULLABLE: 'YES' | 'NO';
  COLUMN_DEFAULT: string | null;
  EXTRA: string;
  CHARACTER_SET_NAME: string | null;
  COLLATION_NAME: string | null;
}

interface ForeignKeySpec {
  name: string;
  table: string;
  column: string;
  referencedTable: string;
  referencedColumn: string;
  indexName: string;
}

interface ColumnCommentSpec {
  table: string;
  column: string;
  comment: string;
}

export class AddNewFeatureForeignKeysAndComments1749400000000 implements MigrationInterface {
  private readonly foreignKeys: ForeignKeySpec[] = [
    {
      name: 'FK_LLTANNOUNCEMENT_COURSE',
      table: 'LLTANNOUNCEMENT',
      column: 'COSE_ID',
      referencedTable: 'LLTCOURSE',
      referencedColumn: 'COSE_ID',
      indexName: 'idx_annc_cose',
    },
    {
      name: 'FK_LLTNOTIFICATION_USER',
      table: 'LLTNOTIFICATION',
      column: 'USER_ID',
      referencedTable: 'LLTUMUSER',
      referencedColumn: 'USER_ID',
      indexName: 'idx_notif_user',
    },
    {
      name: 'FK_LLTPROGRESS_ENROLL',
      table: 'LLTPROGRESS',
      column: 'ENROLL_ID',
      referencedTable: 'LLTENROLL',
      referencedColumn: 'ENROLL_ID',
      indexName: 'IDX_PROGRESS_ENROLL',
    },
    {
      name: 'FK_LLTPROGRESS_SUBCHAPTER',
      table: 'LLTPROGRESS',
      column: 'COSESUBCHAP_ID',
      referencedTable: 'LLTCOURSESUBCHAPTER',
      referencedColumn: 'COSESUBCHAP_ID',
      indexName: 'IDX_PROGRESS_SUBCHAP',
    },
    {
      name: 'FK_LLTSLIDESHOW_CONFIG',
      table: 'LLTSLIDESHOW',
      column: 'SLIDE_GROUP',
      referencedTable: 'LLTSLIDESHOWCONFIG',
      referencedColumn: 'CONFIG_KEY',
      indexName: 'IDX_LLTSLIDESHOW_GROUP',
    },
  ];

  private readonly tableComments: Array<{ table: string; comment: string }> = [
    { table: 'LLTANNOUNCEMENT', comment: 'ประกาศรายวิชา' },
    { table: 'LLTNOTIFICATION', comment: 'การแจ้งเตือนผู้ใช้' },
    { table: 'LLTPROGRESS', comment: 'ความก้าวหน้าการเรียน' },
    { table: 'LLTSLIDESHOWCONFIG', comment: 'ตั้งค่า slideshow' },
    { table: 'LLT_AUTH_USERS', comment: 'ผู้ใช้ระบบ admin' },
    { table: 'MIGRATIONS', comment: 'ประวัติ migration' },
  ];

  private readonly columnComments: ColumnCommentSpec[] = [
    { table: 'LLTANNOUNCEMENT', column: 'ANNC_ID', comment: 'รหัสประกาศ' },
    { table: 'LLTANNOUNCEMENT', column: 'COSE_ID', comment: 'รหัสรายวิชาที่ประกาศ' },
    { table: 'LLTANNOUNCEMENT', column: 'ANNC_TITLE', comment: 'หัวข้อประกาศ' },
    { table: 'LLTANNOUNCEMENT', column: 'ANNC_CONTENT', comment: 'เนื้อหาประกาศ' },
    { table: 'LLTANNOUNCEMENT', column: 'CREATEUSER', comment: 'ผู้สร้างข้อมูล' },
    { table: 'LLTANNOUNCEMENT', column: 'CREATEDATE', comment: 'วันที่สร้างข้อมูล' },
    { table: 'LLTANNOUNCEMENT', column: 'UPDATEUSER', comment: 'ผู้แก้ไขล่าสุด' },
    { table: 'LLTANNOUNCEMENT', column: 'UPDATEDATE', comment: 'วันที่แก้ไขล่าสุด' },

    { table: 'LLTNOTIFICATION', column: 'NOTIF_ID', comment: 'รหัสการแจ้งเตือน' },
    { table: 'LLTNOTIFICATION', column: 'USER_ID', comment: 'รหัสผู้รับแจ้งเตือน' },
    { table: 'LLTNOTIFICATION', column: 'NOTIF_TYPE', comment: 'ประเภทการแจ้งเตือน' },
    { table: 'LLTNOTIFICATION', column: 'NOTIF_TITLE', comment: 'หัวข้อแจ้งเตือน' },
    { table: 'LLTNOTIFICATION', column: 'NOTIF_MESSAGE', comment: 'ข้อความแจ้งเตือน' },
    { table: 'LLTNOTIFICATION', column: 'REF_ID', comment: 'รหัสข้อมูลที่เกี่ยวข้อง' },
    { table: 'LLTNOTIFICATION', column: 'REF_TYPE', comment: 'ประเภทข้อมูลที่เกี่ยวข้อง' },
    { table: 'LLTNOTIFICATION', column: 'IS_READ', comment: 'สถานะอ่านแล้ว' },
    { table: 'LLTNOTIFICATION', column: 'CREATEDATE', comment: 'วันที่สร้างแจ้งเตือน' },

    { table: 'LLTPROGRESS', column: 'PROGRESS_ID', comment: 'รหัสความก้าวหน้า' },
    { table: 'LLTPROGRESS', column: 'ENROLL_ID', comment: 'รหัสการลงทะเบียนเรียน' },
    { table: 'LLTPROGRESS', column: 'COSESUBCHAP_ID', comment: 'รหัสบทเรียนย่อย' },
    { table: 'LLTPROGRESS', column: 'PROGRESS_STATUS', comment: 'สถานะความก้าวหน้า' },
    { table: 'LLTPROGRESS', column: 'PROGRESS_SCORE', comment: 'คะแนนจาก Moodle' },
    { table: 'LLTPROGRESS', column: 'PROGRESS_TIME_SPENT', comment: 'เวลาเรียนสะสม (นาที)' },
    { table: 'LLTPROGRESS', column: 'PROGRESS_SYNCED_AT', comment: 'เวลา sync ล่าสุดจาก Moodle' },
    { table: 'LLTPROGRESS', column: 'CREATEUSER', comment: 'ผู้สร้างข้อมูล' },
    { table: 'LLTPROGRESS', column: 'CREATEDATE', comment: 'วันที่สร้างข้อมูล' },
    { table: 'LLTPROGRESS', column: 'UPDATEUSER', comment: 'ผู้แก้ไขล่าสุด' },
    { table: 'LLTPROGRESS', column: 'UPDATEDATE', comment: 'วันที่แก้ไขล่าสุด' },
    { table: 'LLTPROGRESS', column: 'UPDATEPROG', comment: 'โปรแกรมที่แก้ไขล่าสุด' },
    { table: 'LLTPROGRESS', column: 'PROGRESS_DATE', comment: 'วันที่ทำรายการความก้าวหน้า' },

    { table: 'LLTSLIDESHOWCONFIG', column: 'CONFIG_ID', comment: 'รหัสตั้งค่า slideshow' },
    { table: 'LLTSLIDESHOWCONFIG', column: 'CONFIG_KEY', comment: 'ชื่อกลุ่ม slideshow' },
    {
      table: 'LLTSLIDESHOWCONFIG',
      column: 'SLIDE_DURATION_MS',
      comment: 'เวลาแสดงแต่ละสไลด์ (ms)',
    },
    { table: 'LLTSLIDESHOWCONFIG', column: 'INITIAL_DELAY_MS', comment: 'เวลาหน่วงก่อนเริ่ม (ms)' },
    { table: 'LLTSLIDESHOWCONFIG', column: 'CREATEUSER', comment: 'ผู้สร้างข้อมูล' },
    { table: 'LLTSLIDESHOWCONFIG', column: 'CREATEDATE', comment: 'วันที่สร้างข้อมูล' },
    { table: 'LLTSLIDESHOWCONFIG', column: 'UPDATEUSER', comment: 'ผู้แก้ไขล่าสุด' },
    { table: 'LLTSLIDESHOWCONFIG', column: 'UPDATEDATE', comment: 'วันที่แก้ไขล่าสุด' },
    { table: 'LLTSLIDESHOWCONFIG', column: 'UPDATEPROG', comment: 'โปรแกรมที่แก้ไขล่าสุด' },

    { table: 'LLT_AUTH_USERS', column: 'USER_ID', comment: 'รหัสผู้ใช้ระบบ admin' },
    { table: 'LLT_AUTH_USERS', column: 'USERNAME', comment: 'ชื่อผู้ใช้เข้าสู่ระบบ' },
    { table: 'LLT_AUTH_USERS', column: 'EMAIL', comment: 'อีเมลผู้ใช้' },
    { table: 'LLT_AUTH_USERS', column: 'PASSWORD', comment: 'รหัสผ่านแบบ hash' },
    { table: 'LLT_AUTH_USERS', column: 'ROLE', comment: 'บทบาทผู้ใช้' },
    { table: 'LLT_AUTH_USERS', column: 'FAC_ID', comment: 'รหัสคณะ/ส่วนงาน' },
    { table: 'LLT_AUTH_USERS', column: 'CREATEUSER', comment: 'ผู้สร้างข้อมูล' },
    { table: 'LLT_AUTH_USERS', column: 'CREATEDATE', comment: 'วันที่สร้างข้อมูล' },
    { table: 'LLT_AUTH_USERS', column: 'UPDATEUSER', comment: 'ผู้แก้ไขล่าสุด' },
    { table: 'LLT_AUTH_USERS', column: 'UPDATEDATE', comment: 'วันที่แก้ไขล่าสุด' },

    { table: 'MIGRATIONS', column: 'id', comment: 'รหัส migration' },
    { table: 'MIGRATIONS', column: 'timestamp', comment: 'เวลาของ migration' },
    { table: 'MIGRATIONS', column: 'name', comment: 'ชื่อ migration' },

    { table: 'LLTCATEGORY', column: 'CATEGORY_ICON', comment: 'ชื่อไอคอนหมวดหมู่' },
    { table: 'LLTCATEGORY', column: 'CATEGORY_COLOR', comment: 'สีหมวดหมู่' },
    { table: 'LLTCOURSE', column: 'COSE_DESCRIPTION', comment: 'รายละเอียดรายวิชา' },
    { table: 'LLTCOURSE', column: 'COSE_IMAGE_URL', comment: 'URL รูปรายวิชา' },
    { table: 'LLTCOURSE', column: 'COSE_IMAGE_CROP', comment: 'ตำแหน่ง crop รูป' },
    {
      table: 'LLTCOURSESUBCHAPTER',
      column: 'MOODLE_CMID',
      comment: 'รหัส activity ใน Moodle เช่น quiz/assignment/forum',
    },
    { table: 'LLTSLIDESHOW', column: 'SLIDE_GROUP', comment: 'ชื่อกลุ่ม slideshow' },
    { table: 'LLTSLIDESHOW', column: 'SLIDE_ORDER', comment: 'ลำดับสไลด์' },
    { table: 'LLTSLIDESHOW', column: 'SLIDE_LAYOUT', comment: 'ค่าจัดวางสไลด์' },
    { table: 'LLTTEMPLATECERTIFICATE', column: 'TEMP_TYPE', comment: 'ประเภทเทมเพลต' },
    { table: 'LLTTEMPLATECERTIFICATE', column: 'TEMP_KEY', comment: 'รหัสอ้างอิงเทมเพลต' },
    { table: 'LLTTEMPLATECERTIFICATE', column: 'TEMP_LAYOUT', comment: 'ค่าจัดวางเทมเพลต' },
    { table: 'LLTUMUSER', column: 'USER_CITIZEN_ID', comment: 'เลขบัตรประชาชนผู้เรียน' },
  ];

  async up(queryRunner: QueryRunner): Promise<void> {
    await this.assertForeignKeyDataIsValid(queryRunner);

    for (const foreignKey of this.foreignKeys) {
      await this.addForeignKeyIfMissing(queryRunner, foreignKey);
    }

    for (const tableComment of this.tableComments) {
      await this.setTableComment(queryRunner, tableComment.table, tableComment.comment);
    }

    for (const columnComment of this.columnComments) {
      await this.setColumnComment(
        queryRunner,
        columnComment.table,
        columnComment.column,
        columnComment.comment,
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const foreignKey of [...this.foreignKeys].reverse()) {
      await this.dropForeignKeyIfExists(queryRunner, foreignKey.name, foreignKey.table);
    }
  }

  private async assertForeignKeyDataIsValid(queryRunner: QueryRunner): Promise<void> {
    for (const foreignKey of this.foreignKeys) {
      const rows = await this.queryRows<CountRow>(
        queryRunner,
        `
        SELECT COUNT(*) AS count
        FROM \`${foreignKey.table}\` child
        LEFT JOIN \`${foreignKey.referencedTable}\` parent
          ON parent.\`${foreignKey.referencedColumn}\` = child.\`${foreignKey.column}\`
        WHERE child.\`${foreignKey.column}\` IS NOT NULL
          AND parent.\`${foreignKey.referencedColumn}\` IS NULL
        `,
      );

      if (Number(rows[0]?.count ?? 0) > 0) {
        throw new Error(
          `Cannot add ${foreignKey.name}: orphan rows exist in ${foreignKey.table}.${foreignKey.column}.`,
        );
      }
    }
  }

  private async addForeignKeyIfMissing(
    queryRunner: QueryRunner,
    foreignKey: ForeignKeySpec,
  ): Promise<void> {
    if (await this.foreignKeyExists(queryRunner, foreignKey)) {
      return;
    }

    await this.ensureIndex(queryRunner, foreignKey.table, foreignKey.indexName, foreignKey.column);

    await queryRunner.query(`
      ALTER TABLE \`${foreignKey.table}\`
        ADD CONSTRAINT \`${foreignKey.name}\`
        FOREIGN KEY (\`${foreignKey.column}\`)
        REFERENCES \`${foreignKey.referencedTable}\` (\`${foreignKey.referencedColumn}\`)
    `);
  }

  private async dropForeignKeyIfExists(
    queryRunner: QueryRunner,
    constraintName: string,
    tableName: string,
  ): Promise<void> {
    const exists = await this.queryRows<CountRow>(
      queryRunner,
      `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND CONSTRAINT_NAME = ?
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      `,
      [tableName, constraintName],
    );

    if (Number(exists[0]?.count ?? 0) > 0) {
      await queryRunner.query(
        `ALTER TABLE \`${tableName}\` DROP FOREIGN KEY \`${constraintName}\``,
      );
    }
  }

  private async foreignKeyExists(
    queryRunner: QueryRunner,
    foreignKey: ForeignKeySpec,
  ): Promise<boolean> {
    const rows = await this.queryRows<CountRow>(
      queryRunner,
      `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
        AND REFERENCED_TABLE_NAME = ?
        AND REFERENCED_COLUMN_NAME = ?
      `,
      [
        foreignKey.table,
        foreignKey.column,
        foreignKey.referencedTable,
        foreignKey.referencedColumn,
      ],
    );

    return Number(rows[0]?.count ?? 0) > 0;
  }

  private async ensureIndex(
    queryRunner: QueryRunner,
    tableName: string,
    indexName: string,
    columnName: string,
  ): Promise<void> {
    const rows = await this.queryRows<CountRow>(
      queryRunner,
      `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
      `,
      [tableName, indexName],
    );

    if (Number(rows[0]?.count ?? 0) === 0) {
      await queryRunner.query(
        `ALTER TABLE \`${tableName}\` ADD INDEX \`${indexName}\` (\`${columnName}\`)`,
      );
    }
  }

  private async setTableComment(
    queryRunner: QueryRunner,
    tableName: string,
    comment: string,
  ): Promise<void> {
    if (!(await this.tableExists(queryRunner, tableName))) {
      return;
    }

    await queryRunner.query(`ALTER TABLE \`${tableName}\` COMMENT = ${this.quote(comment)}`);
  }

  private async setColumnComment(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    comment: string,
  ): Promise<void> {
    const column = await this.getColumn(queryRunner, tableName, columnName);
    if (!column) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE \`${tableName}\`
        MODIFY COLUMN ${this.buildColumnDefinition(column, comment)}
    `);
  }

  private buildColumnDefinition(column: ColumnRow, comment: string): string {
    const parts = [`\`${column.COLUMN_NAME}\``, column.COLUMN_TYPE];

    if (column.CHARACTER_SET_NAME) {
      parts.push(`CHARACTER SET ${column.CHARACTER_SET_NAME}`);
    }

    if (column.COLLATION_NAME) {
      parts.push(`COLLATE ${column.COLLATION_NAME}`);
    }

    parts.push(column.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL');

    const defaultValue = this.formatDefault(column.COLUMN_DEFAULT);
    if (defaultValue) {
      parts.push(defaultValue);
    }

    if (column.EXTRA) {
      parts.push(column.EXTRA.toUpperCase());
    }

    parts.push(`COMMENT ${this.quote(comment)}`);

    return parts.join(' ');
  }

  private formatDefault(value: string | null): string | null {
    if (value === null) {
      return null;
    }

    if (value.toUpperCase() === 'NULL') {
      return 'DEFAULT NULL';
    }

    if (/^'.*'$/.test(value)) {
      return `DEFAULT ${value}`;
    }

    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return `DEFAULT ${value}`;
    }

    if (value.toLowerCase().includes('current_timestamp')) {
      return `DEFAULT ${value}`;
    }

    return `DEFAULT ${this.quote(value)}`;
  }

  private async tableExists(queryRunner: QueryRunner, tableName: string): Promise<boolean> {
    const rows = await this.queryRows<CountRow>(
      queryRunner,
      `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      `,
      [tableName],
    );

    return Number(rows[0]?.count ?? 0) > 0;
  }

  private async getColumn(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<ColumnRow | null> {
    const rows = await this.queryRows<ColumnRow>(
      queryRunner,
      `
      SELECT
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        EXTRA,
        CHARACTER_SET_NAME,
        COLLATION_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      `,
      [tableName, columnName],
    );

    return rows[0] ?? null;
  }

  private quote(value: string): string {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
  }

  private async queryRows<T extends object>(
    queryRunner: QueryRunner,
    query: string,
    parameters?: unknown[],
  ): Promise<T[]> {
    const rows: unknown = await queryRunner.query(query, parameters);
    return Array.isArray(rows) ? (rows as T[]) : [];
  }
}
