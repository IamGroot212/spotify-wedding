import Database from 'better-sqlite3';

const dbPath = process.env.NUXT_DATABASE_PATH || '.data/production.sqlite';
const db = new Database(dbPath);

const result = db.prepare(`DELETE FROM song_requests WHERE spotify_track_id LIKE 'test-%' OR spotify_track_id LIKE 'dup-%'`).run();

// eslint-disable-next-line no-console
console.log(`Cleaned up ${result.changes} test entries`);
db.close();
