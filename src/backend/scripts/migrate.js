import { runMigrations } from '../db/migrator.js';
import { env } from '../config/env.js';

const result = await runMigrations({
  log: (message) => console.log(message),
});

if (result.applied === 0) {
  console.log(`• nothing to do — all ${result.total} migration(s) already applied`);
} else {
  console.log(`✓ applied ${result.applied} of ${result.total} migration(s) to "${env.db.database}"`);
}
