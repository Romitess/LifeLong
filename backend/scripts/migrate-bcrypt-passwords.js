#!/usr/bin/env node
'use strict';

/**
 * One-time migration: hash all plaintext passwords in LLT_AUTH_USERS and LLTUMUSER
 * Safe to run multiple times (skips already-hashed rows)
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { loadEnv, requiredEnv, optionalEnv } = require('./load-env');

loadEnv({ quiet: true });

const BCRYPT_ROUNDS = 12;

const DB_CONFIG = {
  host: requiredEnv('DB_HOST'),
  port: Number(optionalEnv('DB_PORT', 3306)),
  user: requiredEnv('DB_USER', 'DB_USERNAME'),
  password: requiredEnv('DB_PASSWORD'),
  database: requiredEnv('DB_NAME', 'DB_DATABASE'),
};

async function migrate() {
  console.log(`Connecting to database: ${DB_CONFIG.database} (host: ${DB_CONFIG.host})`);
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log('Connected to DB');

  try {
    // --- LLT_AUTH_USERS ---
    const [authUsers] = await conn.execute(
      "SELECT USER_ID, USERNAME, PASSWORD FROM LLT_AUTH_USERS WHERE PASSWORD NOT LIKE '$2%'",
    );
    console.log(`\nLLT_AUTH_USERS: ${authUsers.length} plaintext passwords to migrate`);

    for (const row of authUsers) {
      const hashed = await bcrypt.hash(row.PASSWORD, BCRYPT_ROUNDS);
      await conn.execute('UPDATE LLT_AUTH_USERS SET PASSWORD=? WHERE USER_ID=?', [
        hashed,
        row.USER_ID,
      ]);
      console.log(`  ✓ ${row.USERNAME}`);
    }

    // --- LLTUMUSER ---
    const [lltumUsers] = await conn.execute(
      "SELECT USER_ID, USER_USERNAME, USER_PASSWORD FROM LLTUMUSER WHERE USER_PASSWORD IS NOT NULL AND USER_PASSWORD != '' AND USER_PASSWORD NOT LIKE '$2%'",
    );
    console.log(`\nLLTUMUSER: ${lltumUsers.length} plaintext passwords to migrate`);

    for (const row of lltumUsers) {
      const hashed = await bcrypt.hash(row.USER_PASSWORD, BCRYPT_ROUNDS);
      await conn.execute('UPDATE LLTUMUSER SET USER_PASSWORD=? WHERE USER_ID=?', [
        hashed,
        row.USER_ID,
      ]);
      console.log(`  ✓ ${row.USER_USERNAME}`);
    }

    console.log('\nMigration complete.');
  } finally {
    await conn.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
