import { MigrationInterface, QueryRunner } from 'typeorm';

interface CountRow {
  count: string | number;
}

interface ReceiptValidationRow {
  ENROLLRECEIPT_ID: number;
}

interface TemplateCertificateIdRow {
  TEMP_ID: number | null;
}

export class AlignSchemaWithOldErd1749200000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensureTemplateCertificateAuditColumns(queryRunner);
    await this.ensureTemplateCertificatePrimaryKey(queryRunner);
    await this.validateReceiptData(queryRunner);

    await queryRunner.query(`SET SESSION sql_mode = ''`);

    await queryRunner.query(`
      UPDATE LLTENROLLRECEIPT
      SET PAYDATE = NULLIF(DATE_FORMAT(
        COALESCE(
          STR_TO_DATE(NULLIF(TRIM(PAYDATE), ''), '%Y-%m-%d'),
          STR_TO_DATE(NULLIF(TRIM(PAYDATE), ''), '%d/%m/%Y')
        ),
        '%Y-%m-%d'
      ), '0000-00-00')
      WHERE PAYDATE IS NOT NULL AND TRIM(PAYDATE) <> ''
    `);

    await queryRunner.query(`
      UPDATE LLTENROLLRECEIPT
      SET PAYTIME = CASE
        WHEN TRIM(PAYTIME) REGEXP '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN CONCAT(TRIM(PAYTIME), ':00')
        ELSE PAYTIME
      END
      WHERE PAYTIME IS NOT NULL AND TRIM(PAYTIME) <> ''
    `);

    await queryRunner.query(`
      ALTER TABLE LLTENROLLRECEIPT
        MODIFY COLUMN ENROLL_CODE VARCHAR(7) NULL,
        MODIFY COLUMN PAYDATE DATE NULL,
        MODIFY COLUMN PAYTIME TIME NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE LLTENROLLRECEIPT
        MODIFY COLUMN ENROLL_CODE VARCHAR(20) NULL,
        MODIFY COLUMN PAYDATE VARCHAR(10) NULL,
        MODIFY COLUMN PAYTIME VARCHAR(8) NULL
    `);
  }

  private async ensureTemplateCertificateAuditColumns(queryRunner: QueryRunner): Promise<void> {
    const columns: Array<{ name: string; definition: string; after: string }> = [
      { name: 'CREATEUSER', definition: 'VARCHAR(100) NULL', after: 'TEMP_LAYOUT' },
      { name: 'CREATEDATE', definition: 'DATETIME NULL', after: 'CREATEUSER' },
      { name: 'UPDATEUSER', definition: 'VARCHAR(100) NULL', after: 'CREATEDATE' },
      { name: 'UPDATEDATE', definition: 'DATETIME NULL', after: 'UPDATEUSER' },
      { name: 'UPDATEPROG', definition: 'VARCHAR(100) NULL', after: 'UPDATEDATE' },
    ];

    for (const column of columns) {
      const exists = await this.columnExists(queryRunner, 'LLTTEMPLATECERTIFICATE', column.name);
      if (!exists) {
        await queryRunner.query(`
          ALTER TABLE LLTTEMPLATECERTIFICATE
            ADD COLUMN ${column.name} ${column.definition} AFTER ${column.after}
        `);
      }
    }
  }

  private async ensureTemplateCertificatePrimaryKey(queryRunner: QueryRunner): Promise<void> {
    const rows = await this.queryRows<CountRow>(
      queryRunner,
      `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'LLTTEMPLATECERTIFICATE'
        AND CONSTRAINT_TYPE = 'PRIMARY KEY'
      `,
    );

    if (Number(rows[0]?.count ?? 0) > 0) {
      return;
    }

    const duplicateRows = await this.queryRows<TemplateCertificateIdRow>(
      queryRunner,
      `
      SELECT TEMP_ID
      FROM LLTTEMPLATECERTIFICATE
      GROUP BY TEMP_ID
      HAVING COUNT(*) > 1
      LIMIT 1
      `,
    );

    if (duplicateRows.length > 0) {
      throw new Error(
        'Cannot add primary key on LLTTEMPLATECERTIFICATE.TEMP_ID: duplicate TEMP_ID found.',
      );
    }

    const nullRows = await this.queryRows<TemplateCertificateIdRow>(
      queryRunner,
      `
      SELECT TEMP_ID
      FROM LLTTEMPLATECERTIFICATE
      WHERE TEMP_ID IS NULL
      LIMIT 1
      `,
    );

    if (nullRows.length > 0) {
      throw new Error(
        'Cannot add primary key on LLTTEMPLATECERTIFICATE.TEMP_ID: NULL TEMP_ID found.',
      );
    }

    await queryRunner.query(`ALTER TABLE LLTTEMPLATECERTIFICATE ADD PRIMARY KEY (TEMP_ID)`);
  }

  private async validateReceiptData(queryRunner: QueryRunner): Promise<void> {
    const longEnrollCodeRows = await this.queryRows<ReceiptValidationRow>(
      queryRunner,
      `
      SELECT ENROLLRECEIPT_ID, ENROLL_CODE
      FROM LLTENROLLRECEIPT
      WHERE ENROLL_CODE IS NOT NULL
        AND CHAR_LENGTH(ENROLL_CODE) > 7
      LIMIT 1
      `,
    );

    if (longEnrollCodeRows.length > 0) {
      throw new Error(
        'Cannot shrink LLTENROLLRECEIPT.ENROLL_CODE to VARCHAR(7): value longer than 7 found.',
      );
    }

    const invalidPayDateRows = await this.queryRows<ReceiptValidationRow>(
      queryRunner,
      `
      SELECT ENROLLRECEIPT_ID, PAYDATE
      FROM LLTENROLLRECEIPT
      WHERE PAYDATE IS NOT NULL
        AND PAYDATE <> ''
        AND COALESCE(STR_TO_DATE(PAYDATE, '%Y-%m-%d'), STR_TO_DATE(PAYDATE, '%d/%m/%Y')) IS NULL
      LIMIT 1
      `,
    );

    if (invalidPayDateRows.length > 0) {
      throw new Error('Cannot convert LLTENROLLRECEIPT.PAYDATE to DATE: invalid date value found.');
    }

    const invalidPayTimeRows = await this.queryRows<ReceiptValidationRow>(
      queryRunner,
      `
      SELECT ENROLLRECEIPT_ID, PAYTIME
      FROM LLTENROLLRECEIPT
      WHERE PAYTIME IS NOT NULL
        AND PAYTIME <> ''
        AND PAYTIME NOT REGEXP '^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$'
      LIMIT 1
      `,
    );

    if (invalidPayTimeRows.length > 0) {
      throw new Error('Cannot convert LLTENROLLRECEIPT.PAYTIME to TIME: invalid time value found.');
    }
  }

  private async columnExists(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
  ): Promise<boolean> {
    const rows = await this.queryRows<CountRow>(
      queryRunner,
      `
      SELECT COUNT(*) AS count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      `,
      [tableName, columnName],
    );

    return Number(rows[0]?.count ?? 0) > 0;
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
