// Applies the slideshow/hero-config schema (migration 1749300000000) directly,
// because this repo's MIGRATIONS bookkeeping is out of sync with TypeORM's runner
// (prior schema was applied via standalone script). All statements are idempotent.
const fs = require('node:fs');
const path = require('node:path');
const { loadEnv, requiredEnv, optionalEnv } = require('./load-env');
const mysql = require('mysql2/promise');

loadEnv({ quiet: true });

const rootDir = path.resolve(__dirname, '..');
const backupDir = path.join(rootDir, 'backups');

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
}

async function backupSlideTable(connection) {
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `slideshow-before-${timestamp()}.sql`);
  const [createRows] = await connection.query('SHOW CREATE TABLE `LLTSLIDESHOW`');
  const [dataRows] = await connection.query('SELECT * FROM `LLTSLIDESHOW`');
  let out = `-- LLTSLIDESHOW backup before slideshow schema apply\n`;
  out += `DROP TABLE IF EXISTS \`LLTSLIDESHOW\`;\n${createRows[0]['Create Table']};\n`;
  out += `-- rows: ${dataRows.length}\n`;
  fs.writeFileSync(backupPath, out, { mode: 0o600 });
  return { backupPath, rowCount: dataRows.length };
}

async function main() {
  const connection = await mysql.createConnection({
    host: requiredEnv('DB_HOST'),
    port: Number(optionalEnv('DB_PORT', 3306)),
    user: requiredEnv('DB_USER'),
    password: requiredEnv('DB_PASSWORD'),
    database: requiredEnv('DB_NAME'),
    multipleStatements: true,
  });

  try {
    const backup = await backupSlideTable(connection);
    console.log(`Backup written: ${path.basename(backup.backupPath)} (LLTSLIDESHOW rows: ${backup.rowCount})`);

    await connection.query(`
      ALTER TABLE LLTSLIDESHOW
        ADD COLUMN IF NOT EXISTS SLIDE_GROUP varchar(100) NOT NULL DEFAULT 'main' AFTER SLIDE_URL,
        ADD COLUMN IF NOT EXISTS SLIDE_ORDER int(11) NOT NULL DEFAULT 0 AFTER SLIDE_GROUP,
        ADD COLUMN IF NOT EXISTS SLIDE_LAYOUT JSON NULL AFTER SLIDE_ORDER
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS LLTSLIDESHOWCONFIG (
        CONFIG_ID int(11) NOT NULL AUTO_INCREMENT,
        CONFIG_KEY varchar(100) NOT NULL,
        SLIDE_DURATION_MS int(11) NULL,
        INITIAL_DELAY_MS int(11) NULL,
        CREATEUSER varchar(100) NULL,
        CREATEDATE datetime NULL,
        UPDATEUSER varchar(100) NULL,
        UPDATEDATE datetime NULL,
        UPDATEPROG varchar(100) NULL,
        PRIMARY KEY (CONFIG_ID),
        UNIQUE KEY UQ_LLTSLIDESHOWCONFIG_KEY (CONFIG_KEY)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8
    `);

    // Record bookkeeping so a future migration:run won't double-apply.
    const migrationName = 'AddSlideshowHeroConfig1749300000000';
    const [existing] = await connection.query('SELECT id FROM MIGRATIONS WHERE name = ?', [
      migrationName,
    ]);
    if (existing.length === 0) {
      await connection.query('INSERT INTO MIGRATIONS (timestamp, name) VALUES (?, ?)', [
        1749300000000,
        migrationName,
      ]);
      console.log(`MIGRATIONS bookkeeping inserted: ${migrationName}`);
    } else {
      console.log(`MIGRATIONS bookkeeping already present: ${migrationName}`);
    }

    const [slideCols] = await connection.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LLTSLIDESHOW'
         AND COLUMN_NAME IN ('SLIDE_GROUP','SLIDE_ORDER','SLIDE_LAYOUT')
       ORDER BY ORDINAL_POSITION`,
    );
    const [configCols] = await connection.query(
      `SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LLTSLIDESHOWCONFIG'
       ORDER BY ORDINAL_POSITION`,
    );
    console.log('\nLLTSLIDESHOW new columns:');
    console.table(slideCols);
    console.log('LLTSLIDESHOWCONFIG columns:');
    console.table(configCols);
    console.log('\n✅ Slideshow schema applied.');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('Apply failed:', error.message);
  process.exit(1);
});
