/**
 * seed-privilege.js
 *
 * Seeds LLTPRIVILEGE with sample rows so ManualUniversityDirectoryProvider
 * has data to resolve against. Safe to run multiple times (idempotent via
 * ON DUPLICATE KEY UPDATE).
 *
 * Usage:
 *   npm run seed:privilege
 *   # or directly: node scripts/seed-privilege.js
 *
 * Requires: .env with DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 *
 * ⚠ DEV/TEST DATA ONLY — do NOT run on production.
 */

const mysql = require('mysql2/promise');
const { loadEnv } = require('./load-env');

loadEnv();

/**
 * Generate a mathematically valid 13-digit Thai Citizen ID.
 * Algorithm: sum = Σ(digit[i] × (13 - i)) for i = 0..11
 *            check_digit = (11 - (sum % 11)) % 10
 * Leading digit must not be 0.
 */
function genThaiCitizenId() {
  const digits = [];
  // First digit: 1–8 (0 and 9 are not used in practice)
  digits.push(1 + Math.floor(Math.random() * 8));
  for (let i = 1; i < 12; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }

  const sum = digits.reduce((acc, d, i) => acc + d * (13 - i), 0);
  const checkDigit = (11 - (sum % 11)) % 10;
  digits.push(checkDigit);

  return digits.join('');
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? process.env.DB_DATABASE ?? 'lifelong2',
  });

  try {
    // Fetch up to 10 real LLTUMUSER rows to seed
    const [users] = await connection.execute(
      `SELECT USER_ID FROM LLTUMUSER WHERE USER_STATUS = 'A' ORDER BY USER_ID ASC LIMIT 10`,
    );

    if (!users.length) {
      console.log('No active users in LLTUMUSER — nothing to seed.');
      return;
    }

    // Fetch available student types
    const [stutypes] = await connection.execute(
      `SELECT STUTYPE_ID, STUTYPE_NAME FROM LLTTYPESTUDENT WHERE STUTYPE_STATUS = 'Y' ORDER BY STUTYPE_ID ASC`,
    );

    if (!stutypes.length) {
      console.log('No active LLTTYPESTUDENT rows — run seed-typestudent first.');
      return;
    }

    console.log(`Seeding LLTPRIVILEGE for ${users.length} users with ${stutypes.length} student types...`);

    let inserted = 0;
    let skipped = 0;

    // Assign stutypes round-robin, leaving ~30% without privilege (= general public).
    // Rows that already have a USER_CITIZEN are left untouched so repeated runs
    // don't invalidate citizen IDs that testers have already noted down.
    for (let i = 0; i < users.length; i++) {
      const userId = users[i].USER_ID;

      // Skip ~30% to simulate general-public users (no row in LLTPRIVILEGE)
      if (i % 3 === 2) {
        console.log(`  USER_ID=${userId} → general public (no row seeded)`);
        skipped++;
        continue;
      }

      const stutype = stutypes[i % stutypes.length];

      // Check if a citizen ID already exists for this (USER_ID, STUTYPE_ID) pair
      const [existing] = await connection.execute(
        `SELECT USER_CITIZEN FROM LLTPRIVILEGE WHERE USER_ID = ? AND STUTYPE_ID = ? AND USER_CITIZEN IS NOT NULL LIMIT 1`,
        [userId, stutype.STUTYPE_ID],
      );

      if (existing.length > 0) {
        console.log(
          `  USER_ID=${userId} → STUTYPE_ID=${stutype.STUTYPE_ID} (${stutype.STUTYPE_NAME}) citizenId=${existing[0].USER_CITIZEN} [skipped — already set]`,
        );
        inserted++;
        continue;
      }

      const citizenId = genThaiCitizenId();

      await connection.execute(
        `INSERT INTO LLTPRIVILEGE
           (USER_ID, STUTYPE_ID, USER_CITIZEN, CREATEUSER, CREATEDATE, UPDATEUSER, UPDATEDATE, UPDATEPROG)
         VALUES (?, ?, ?, 'seed', NOW(), 'seed', NOW(), 'seed-privilege.js')
         ON DUPLICATE KEY UPDATE
           USER_CITIZEN = IF(USER_CITIZEN IS NULL, VALUES(USER_CITIZEN), USER_CITIZEN),
           UPDATEUSER   = VALUES(UPDATEUSER),
           UPDATEDATE   = NOW(),
           UPDATEPROG   = VALUES(UPDATEPROG)`,
        [userId, stutype.STUTYPE_ID, citizenId],
      );

      console.log(
        `  USER_ID=${userId} → STUTYPE_ID=${stutype.STUTYPE_ID} (${stutype.STUTYPE_NAME}) citizenId=${citizenId} [inserted]`,
      );
      inserted++;
    }

    console.log(`\nDone. ${inserted} rows upserted, ${skipped} users left as general public.`);
    console.log('Use these citizenId values to test POST /privilege/check.');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
