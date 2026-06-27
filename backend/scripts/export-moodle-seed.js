/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const mysqlPromise = require('mysql2/promise');
const { loadEnv, optionalEnv } = require('./load-env');

loadEnv();

const database = optionalEnv('MOODLE_DB_NAME', 'LLLv.2');
const outputPath = path.resolve(__dirname, '..', 'moodle_seed.sql');
const utf8OutputPath = path.resolve(__dirname, '..', 'moodle_seed_utf8.sql');

function quoteIdentifier(identifier) {
  return `\`${String(identifier).replaceAll('`', '``')}\``;
}

function serialize(value) {
  return mysql.escape(value);
}

async function exportMoodleSeed() {
  const connection = await mysqlPromise.createConnection({
    host: optionalEnv('MOODLE_DB_HOST', '127.0.0.1'),
    port: Number(optionalEnv('MOODLE_DB_PORT', 3307)),
    user: optionalEnv('MOODLE_DB_USER', 'bn_moodle'),
    password: optionalEnv('MOODLE_DB_PASSWORD', 'moodle_password'),
    database,
    charset: 'utf8mb4',
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
  });

  const chunks = [
    `-- LLL Moodle seed exported from ${database}\n`,
    '/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;\n',
    '/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;\n',
    '/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;\n',
    '/*!40101 SET NAMES utf8mb4 */;\n',
    '/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;\n',
    '/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;\n\n',
  ];

  try {
    const [tableRows] = await connection.query('SHOW FULL TABLES');
    const tables = tableRows
      .map((row) => ({ name: Object.values(row)[0], type: Object.values(row)[1] }))
      .filter((table) => table.type === 'BASE TABLE')
      .sort((left, right) => left.name.localeCompare(right.name));
    const views = tableRows
      .map((row) => ({ name: Object.values(row)[0], type: Object.values(row)[1] }))
      .filter((table) => table.type === 'VIEW')
      .sort((left, right) => left.name.localeCompare(right.name));

    for (const table of tables) {
      const quotedTable = quoteIdentifier(table.name);
      const [createRows] = await connection.query(`SHOW CREATE TABLE ${quotedTable}`);
      const createSql = createRows[0]['Create Table'];
      const [fieldRows] = await connection.query(`SHOW COLUMNS FROM ${quotedTable}`);
      const columns = fieldRows.map((field) => quoteIdentifier(field.Field));
      const [rows] = await connection.query({
        sql: `SELECT * FROM ${quotedTable}`,
        rowsAsArray: true,
      });

      chunks.push(`-- Table ${quotedTable}\nDROP TABLE IF EXISTS ${quotedTable};\n${createSql};\n`);
      for (let index = 0; index < rows.length; index += 200) {
        const values = rows
          .slice(index, index + 200)
          .map((row) => `(${row.map(serialize).join(',')})`)
          .join(',\n');
        chunks.push(`INSERT INTO ${quotedTable} (${columns.join(',')}) VALUES\n${values};\n`);
      }
      chunks.push('\n');
    }

    for (const view of views) {
      const quotedView = quoteIdentifier(view.name);
      const [createRows] = await connection.query(`SHOW CREATE VIEW ${quotedView}`);
      chunks.push(`DROP VIEW IF EXISTS ${quotedView};\n${createRows[0]['Create View']};\n\n`);
    }

    chunks.push(
      '/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;\n',
      '/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;\n',
      '/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;\n',
      '/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;\n',
      '/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;\n',
      '-- Dump completed\n',
    );

    const temporaryPath = `${outputPath}.tmp`;
    fs.writeFileSync(temporaryPath, chunks.join(''), 'utf8');
    fs.renameSync(temporaryPath, outputPath);
    fs.copyFileSync(outputPath, utf8OutputPath);
    console.log(
      JSON.stringify({ database, tables: tables.length, views: views.length, outputPath }, null, 2),
    );
  } finally {
    await connection.end();
  }
}

module.exports = { exportMoodleSeed };

if (require.main === module) {
  exportMoodleSeed().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
