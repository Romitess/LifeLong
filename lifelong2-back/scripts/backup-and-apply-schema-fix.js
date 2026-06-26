const fs = require('node:fs');
const path = require('node:path');
const { loadEnv } = require('./load-env');
const mysql = require('mysql2/promise');

loadEnv({ quiet: true });

const rootDir = path.resolve(__dirname, '..');
const backupDir = path.join(rootDir, 'backups');

function requiredEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
  if (!value || value.includes('PLACEHOLDER')) {
    throw new Error(
      `Missing required database config: ${name}${fallbackName ? `/${fallbackName}` : ''}`,
    );
  }
  return value;
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
}

function sqlIdentifier(name) {
  return `\`${String(name).replace(/`/g, '``')}\``;
}

async function backupDatabase(connection, database) {
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `${database}-before-schema-fix-${timestamp()}.sql`);
  const stream = fs.createWriteStream(backupPath, { encoding: 'utf8', mode: 0o600 });

  stream.write(`-- Backup before old ERD schema alignment\n`);
  stream.write(`-- Database: ${database}\n`);
  stream.write(`-- Created: ${new Date().toISOString()}\n\n`);
  stream.write(`SET FOREIGN_KEY_CHECKS=0;\n\n`);

  const [tableRows] = await connection.query(`SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'`);
  const tableNameKey = `Tables_in_${database}`;
  const tables = tableRows.map((row) => row[tableNameKey]).filter(Boolean);

  for (const table of tables) {
    const escapedTable = sqlIdentifier(table);
    const [createRows] = await connection.query(`SHOW CREATE TABLE ${escapedTable}`);
    const createSql = createRows[0]['Create Table'];

    stream.write(`DROP TABLE IF EXISTS ${escapedTable};\n`);
    stream.write(`${createSql};\n\n`);

    const [rows] = await connection.query(`SELECT * FROM ${escapedTable}`);
    if (rows.length === 0) {
      continue;
    }

    const columns = Object.keys(rows[0]).map(sqlIdentifier);
    const chunkSize = 100;
    for (let index = 0; index < rows.length; index += chunkSize) {
      const chunk = rows.slice(index, index + chunkSize);
      const values = chunk
        .map(
          (row) =>
            `(${Object.keys(rows[0])
              .map((column) => connection.escape(row[column]))
              .join(', ')})`,
        )
        .join(',\n');
      stream.write(`INSERT INTO ${escapedTable} (${columns.join(', ')}) VALUES\n${values};\n`);
    }
    stream.write('\n');
  }

  stream.write(`SET FOREIGN_KEY_CHECKS=1;\n`);

  await new Promise((resolve, reject) => {
    stream.end((error) => (error ? reject(error) : resolve()));
  });

  return backupPath;
}

async function columnExists(connection, tableName, columnName) {
  const [rows] = await connection.query(
    `
    SELECT COUNT(*) AS count
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    `,
    [tableName, columnName],
  );
  return Number(rows[0].count) > 0;
}

async function ensureTemplateCertificateAuditColumns(connection) {
  const columns = [
    ['CREATEUSER', 'VARCHAR(100) NULL', 'TEMP_LAYOUT'],
    ['CREATEDATE', 'DATETIME NULL', 'CREATEUSER'],
    ['UPDATEUSER', 'VARCHAR(100) NULL', 'CREATEDATE'],
    ['UPDATEDATE', 'DATETIME NULL', 'UPDATEUSER'],
    ['UPDATEPROG', 'VARCHAR(100) NULL', 'UPDATEDATE'],
  ];

  for (const [name, definition, after] of columns) {
    if (!(await columnExists(connection, 'LLTTEMPLATECERTIFICATE', name))) {
      await connection.query(
        `ALTER TABLE LLTTEMPLATECERTIFICATE ADD COLUMN ${name} ${definition} AFTER ${after}`,
      );
    }
  }
}

async function ensureTemplateCertificatePrimaryKey(connection) {
  const [pkRows] = await connection.query(`
    SELECT COUNT(*) AS count
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'LLTTEMPLATECERTIFICATE'
      AND CONSTRAINT_TYPE = 'PRIMARY KEY'
  `);

  if (Number(pkRows[0].count) > 0) {
    return;
  }

  const [duplicates] = await connection.query(`
    SELECT TEMP_ID
    FROM LLTTEMPLATECERTIFICATE
    GROUP BY TEMP_ID
    HAVING COUNT(*) > 1
    LIMIT 1
  `);
  if (duplicates.length > 0) {
    throw new Error('Duplicate LLTTEMPLATECERTIFICATE.TEMP_ID found; primary key was not added.');
  }

  const [nulls] = await connection.query(`
    SELECT TEMP_ID
    FROM LLTTEMPLATECERTIFICATE
    WHERE TEMP_ID IS NULL
    LIMIT 1
  `);
  if (nulls.length > 0) {
    throw new Error('NULL LLTTEMPLATECERTIFICATE.TEMP_ID found; primary key was not added.');
  }

  await connection.query(`ALTER TABLE LLTTEMPLATECERTIFICATE ADD PRIMARY KEY (TEMP_ID)`);
}

async function validateReceiptRows(connection) {
  const [longCodes] = await connection.query(`
    SELECT ENROLLRECEIPT_ID
    FROM LLTENROLLRECEIPT
    WHERE ENROLL_CODE IS NOT NULL
      AND CHAR_LENGTH(ENROLL_CODE) > 7
    LIMIT 1
  `);
  if (longCodes.length > 0) {
    throw new Error('ENROLL_CODE longer than 7 exists; schema change stopped.');
  }

  const [invalidDates] = await connection.query(`
    SELECT ENROLLRECEIPT_ID
    FROM LLTENROLLRECEIPT
    WHERE PAYDATE IS NOT NULL
      AND PAYDATE <> ''
      AND COALESCE(STR_TO_DATE(PAYDATE, '%Y-%m-%d'), STR_TO_DATE(PAYDATE, '%d/%m/%Y')) IS NULL
    LIMIT 1
  `);
  if (invalidDates.length > 0) {
    throw new Error('Invalid PAYDATE value exists; schema change stopped.');
  }

  const [invalidTimes] = await connection.query(`
    SELECT ENROLLRECEIPT_ID
    FROM LLTENROLLRECEIPT
    WHERE PAYTIME IS NOT NULL
      AND PAYTIME <> ''
      AND PAYTIME NOT REGEXP '^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$'
    LIMIT 1
  `);
  if (invalidTimes.length > 0) {
    throw new Error('Invalid PAYTIME value exists; schema change stopped.');
  }
}

async function getColumnType(connection, tableName, columnName) {
  const [rows] = await connection.query(
    `
    SELECT DATA_TYPE AS dataType, COLUMN_TYPE AS columnType
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND COLUMN_NAME = ?
    `,
    [tableName, columnName],
  );
  return rows[0] || null;
}

async function alignReceiptTypes(connection) {
  await validateReceiptRows(connection);

  const enrollCode = await getColumnType(connection, 'LLTENROLLRECEIPT', 'ENROLL_CODE');
  const payDate = await getColumnType(connection, 'LLTENROLLRECEIPT', 'PAYDATE');
  const payTime = await getColumnType(connection, 'LLTENROLLRECEIPT', 'PAYTIME');

  if (payDate && payDate.dataType !== 'date') {
    await connection.query(`
      UPDATE LLTENROLLRECEIPT
      SET PAYDATE = DATE_FORMAT(
        COALESCE(STR_TO_DATE(PAYDATE, '%Y-%m-%d'), STR_TO_DATE(PAYDATE, '%d/%m/%Y')),
        '%Y-%m-%d'
      )
      WHERE PAYDATE IS NOT NULL AND PAYDATE <> ''
    `);
  }

  if (payTime && payTime.dataType !== 'time') {
    await connection.query(`
      UPDATE LLTENROLLRECEIPT
      SET PAYTIME = CASE
        WHEN PAYTIME REGEXP '^([01][0-9]|2[0-3]):[0-5][0-9]$' THEN CONCAT(PAYTIME, ':00')
        ELSE PAYTIME
      END
      WHERE PAYTIME IS NOT NULL AND PAYTIME <> ''
    `);
  }

  if (
    enrollCode?.columnType?.toLowerCase() !== 'varchar(7)' ||
    payDate?.dataType !== 'date' ||
    payTime?.dataType !== 'time'
  ) {
    await connection.query(`
      ALTER TABLE LLTENROLLRECEIPT
        MODIFY COLUMN ENROLL_CODE VARCHAR(7) NULL,
        MODIFY COLUMN PAYDATE DATE NULL,
        MODIFY COLUMN PAYTIME TIME NULL
    `);
  }
}

async function verifySchema(connection) {
  const checks = [
    ['LLTTEMPLATECERTIFICATE', 'CREATEUSER', 'varchar(100)'],
    ['LLTTEMPLATECERTIFICATE', 'CREATEDATE', 'datetime'],
    ['LLTTEMPLATECERTIFICATE', 'UPDATEUSER', 'varchar(100)'],
    ['LLTTEMPLATECERTIFICATE', 'UPDATEDATE', 'datetime'],
    ['LLTTEMPLATECERTIFICATE', 'UPDATEPROG', 'varchar(100)'],
    ['LLTENROLLRECEIPT', 'ENROLL_CODE', 'varchar(7)'],
    ['LLTENROLLRECEIPT', 'PAYDATE', 'date'],
    ['LLTENROLLRECEIPT', 'PAYTIME', 'time'],
  ];

  for (const [table, column, expected] of checks) {
    const actual = await getColumnType(connection, table, column);
    if (!actual || actual.columnType.toLowerCase() !== expected) {
      throw new Error(
        `${table}.${column} expected ${expected}, got ${actual?.columnType || 'missing'}`,
      );
    }
  }

  const [pkRows] = await connection.query(`
    SELECT COUNT(*) AS count
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'LLTTEMPLATECERTIFICATE'
      AND CONSTRAINT_TYPE = 'PRIMARY KEY'
  `);
  if (Number(pkRows[0].count) === 0) {
    throw new Error('LLTTEMPLATECERTIFICATE primary key is still missing.');
  }
}

async function main() {
  const database = requiredEnv('DB_NAME', 'DB_DATABASE');
  const connection = await mysql.createConnection({
    host: requiredEnv('DB_HOST'),
    port: Number(process.env.DB_PORT || 3306),
    user: requiredEnv('DB_USER', 'DB_USERNAME'),
    password: process.env.DB_PASSWORD || '',
    database,
    multipleStatements: true,
    dateStrings: true,
  });

  try {
    const backupPath = await backupDatabase(connection, database);
    console.log(`Backup created: ${backupPath}`);

    await connection.beginTransaction();
    try {
      await ensureTemplateCertificateAuditColumns(connection);
      await ensureTemplateCertificatePrimaryKey(connection);
      await alignReceiptTypes(connection);
      await verifySchema(connection);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    }

    console.log('Schema alignment completed and verified.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
