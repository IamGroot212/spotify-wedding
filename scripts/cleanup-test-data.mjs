import Database from 'better-sqlite3';

const dbPath = process.env.NUXT_DATABASE_PATH || '.data/production.sqlite';
const db = new Database(dbPath);

const result = db.prepare(`DELETE FROM song_requests`).run();

// eslint-disable-next-line no-console
console.log(`Cleaned up ${result.changes} entries`);
db.close();
