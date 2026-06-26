/**
 * seed-openclass-fee.js
 *
 * Seed LLTOPENCLASSSTUTYPEFEE ให้ครบทุก openclass × stutype
 * กลยุทธ์ราคา:
 *   นิสิต       → 0 (ฟรี)
 *   บุคลากร     → 50% ของราคาทั่วไป
 *   ศิษย์เก่า   → 50% ของราคาทั่วไป
 *   บุคคลทั่วไป → เต็มราคา (OPENCLASS_AMOUNT)
 *
 * Usage: npm run seed:openclass-fee
 * ⚠ DEV/TEST ONLY
 */

const mysql = require('mysql2/promise');
const { loadEnv } = require('./load-env');
const { getEnv } = require('./utils/env-validator');
loadEnv();

async function main() {
  const conn = await mysql.createConnection({
    host: getEnv('SEED_DB_HOST', { fallback: 'localhost' }),
    port: Number(getEnv('SEED_DB_PORT', { fallback: 3306 })),
    user: getEnv('SEED_DB_USER', { fallback: 'root' }),
    password: getEnv('SEED_DB_PASSWORD', { sensitive: true }),
    database: getEnv('SEED_DB_NAME', { fallback: 'lifelong2' }),
  });

  try {
    const [stutypes] = await conn.execute(
      "SELECT STUTYPE_ID, STUTYPE_NAME FROM LLTTYPESTUDENT WHERE STUTYPE_STATUS='Y' ORDER BY STUTYPE_ID",
    );
    const [openclasses] = await conn.execute(
      'SELECT OPENCLASS_ID, OPENCLASS_AMOUNT FROM LLTOPENCLASS ORDER BY OPENCLASS_ID',
    );

    console.log(`openclasses: ${openclasses.length} | stutypes: ${stutypes.length}`);
    console.log('stutypes:', stutypes.map(s => `[${s.STUTYPE_ID}]${s.STUTYPE_NAME}`).join(', '));

    let inserted = 0;
    let skipped = 0;

    for (const oc of openclasses) {
      const basePrice = Number(oc.OPENCLASS_AMOUNT ?? 0);

      for (const st of stutypes) {
        const name = st.STUTYPE_NAME ?? '';

        let amount;
        if (name.includes('นิสิต'))       amount = 0;
        else if (name.includes('บุคลากร')) amount = Math.floor(basePrice * 0.5);
        else if (name.includes('ศิษย์เก่า')) amount = Math.floor(basePrice * 0.5);
        else                               amount = basePrice; // ทั่วไป = เต็มราคา

        const [result] = await conn.execute(
          `INSERT INTO LLTOPENCLASSSTUTYPEFEE
             (OPENCLASS_ID, STUTYPE_ID, STUTYPE_AMOUNT, CREATEUSER, CREATEDATE, UPDATEUSER, UPDATEDATE, UPDATEPROG)
           VALUES (?, ?, ?, 'seed', NOW(), 'seed', NOW(), 'seed-openclass-fee.js')
           ON DUPLICATE KEY UPDATE
             STUTYPE_AMOUNT = VALUES(STUTYPE_AMOUNT),
             UPDATEUSER     = 'seed',
             UPDATEDATE     = NOW()`,
          [oc.OPENCLASS_ID, st.STUTYPE_ID, amount],
        );

        if (result.affectedRows === 1) inserted++;
        else skipped++;
      }
    }

    const [[{ n }]] = await conn.execute('SELECT COUNT(*) AS n FROM LLTOPENCLASSSTUTYPEFEE');
    console.log(`\nDone. inserted/updated: ${inserted} | unchanged: ${skipped} | total rows: ${n}`);

    // แสดงตัวอย่าง openclass แรก
    const [sample] = await conn.execute(`
      SELECT f.OPENCLASS_ID, s.STUTYPE_NAME, f.STUTYPE_AMOUNT
      FROM LLTOPENCLASSSTUTYPEFEE f
      JOIN LLTTYPESTUDENT s ON s.STUTYPE_ID = f.STUTYPE_ID
      WHERE f.OPENCLASS_ID = (SELECT MIN(OPENCLASS_ID) FROM LLTOPENCLASS)
      ORDER BY f.STUTYPE_ID
    `);
    console.log('\nตัวอย่าง OC', sample[0]?.OPENCLASS_ID, ':');
    sample.forEach(r => console.log(' ', r.STUTYPE_NAME.padEnd(15), '→', r.STUTYPE_AMOUNT, 'บาท'));

  } finally {
    await conn.end();
  }
}

main().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
