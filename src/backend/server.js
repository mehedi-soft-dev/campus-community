import { app } from './app.js';
import { env } from './config/env.js';
import { closePool, pool } from './db/pool.js';

const start = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`✓ MySQL  → ${env.db.host}:${env.db.port}/${env.db.database}`);
  } catch (err) {
    console.error(
      `✗ Cannot reach MySQL at ${env.db.host}:${env.db.port}\n` +
        `  ${err.message}\n` +
        '  Start the container (docker compose up -d mysql in E:\\my_workspace\\dbms)\n' +
        '  or fix the DB_* values in src/backend/.env.'
    );
    process.exit(1);
  }

  if (env.dbAutoMigrate) {
    try {
      const { runMigrations } = await import('./db/migrator.js');
      const result = await runMigrations({ log: (line) => console.log(line) });
      console.log(
        result.applied
          ? `✓ Migrations → ${result.applied} applied`
          : `✓ Migrations → up to date (${result.total})`
      );
    } catch (err) {
      console.error(`✗ Migration failed: ${err.message}`);
      process.exit(1);
    }
  }

  const server = app.listen(env.port, () => {
    console.log(`✓ API    → http://localhost:${env.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down.`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

start();
