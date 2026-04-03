import Database from 'better-sqlite3';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.NUXT_DATABASE_PATH || resolve(__dirname, '..', '.data', 'production.sqlite');
const db = new Database(dbPath);

const result = db.prepare(`DELETE FROM song_requests`).run();

// eslint-disable-next-line no-console
console.log(`Cleaned up ${result.changes} entries`);
db.close();
