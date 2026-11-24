import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const migrationsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'migrations'
);

const checksumOf = (sql) => crypto.createHash('sha256').update(sql).digest('hex');

async function readMigrations() {
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  return Promise.all(
    files.map(async (file) => {
      const [version, ...rest] = file.replace(/\.sql$/, '').split('_');
      const numeric = Number(version);
      if (!Number.isInteger(numeric)) {
        throw new Error(`Migration filename must start with a number: ${file}`);
      }
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      return { version: numeric, name: rest.join('_'), file, sql, checksum: checksumOf(sql) };
    })
  );
}

async function ensureMigrationsTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`schema_migrations\` (
      \`version\`    INT PRIMARY KEY,
      \`name\`       VARCHAR(160) NOT NULL,
      \`checksum\`   CHAR(64) NOT NULL,
      \`applied_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

/**
 * Applies every pending migration in order.
 *
 * Uses its own connection with multipleStatements so each file can be one
 * sequence of statements — the app pool deliberately keeps that off, since it
 * widens the blast radius of any SQL injection.
 *
 * MySQL DDL is not transactional, so a file is recorded only after it completes.
 */
export async function runMigrations({ log = console.log } = {}) {
  const migrations = await readMigrations();
  const connection = await mysql.createConnection({
    ...env.db,
    multipleStatements: true,
  });

  try {
    await ensureMigrationsTable(connection);
    const [appliedRows] = await connection.query(
      'SELECT version, name, checksum FROM schema_migrations'
    );
    const applied = new Map(appliedRows.map((row) => [row.version, row]));

    let appliedCount = 0;

    for (const migration of migrations) {
      const previous = applied.get(migration.version);

      if (previous) {
        if (previous.checksum !== migration.checksum) {
          throw new Error(
            `Migration ${migration.file} has changed since it was applied ` +
              '(checksum mismatch). Applied migrations are immutable — add a new file instead.'
          );
        }
        continue;
      }

      log(`  → applying ${migration.file}`);
      await connection.query(migration.sql);
      await connection.query(
        'INSERT INTO schema_migrations (version, name, checksum) VALUES (?, ?, ?)',
        [migration.version, migration.name, migration.checksum]
      );
      appliedCount += 1;
    }

    return { applied: appliedCount, total: migrations.length };
  } finally {
    await connection.end();
  }
}
