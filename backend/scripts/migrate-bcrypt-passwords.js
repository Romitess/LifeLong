#!/usr/bin/env node
'use strict';

/**
 * One-time migration: hash all plaintext passwords in LLT_AUTH_USERS and LLTUMUSER
 * Safe to run multiple times (skips already-hashed rows)
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;

const DB_CONFIG = {
  host: process.env.DB_HOST || '10.5.1.92',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'lifelong2',
  password: process.env.DB_PASSWORD || 'U2XL0cHum9UP',
  database: process.env.DB_NAME || 'lifelong2',
};

async function migrate() {
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
