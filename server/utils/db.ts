import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from '../db/schema';

export { schema };

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _sqlite: InstanceType<typeof Database> | null = null;

export function useDb() {
  if (!_db) {
    const config = useRuntimeConfig();
    const dbPath = config.databasePath || '.data/db.sqlite';

    mkdirSync(dirname(dbPath), { recursive: true });

    _sqlite = new Database(dbPath);
    _sqlite.pragma('journal_mode = WAL');
    _sqlite.pragma('synchronous = normal');
    _sqlite.pragma('cache_size = 5000');
    _sqlite.pragma('temp_store = memory');

    _db = drizzle(_sqlite, { schema });
  }
  return _db;
}

export function useSqlite() {
  if (!_sqlite) {
    useDb(); // initialize both
  }
  return _sqlite!;
}

// Keep `db` as a getter for backward compat with auto-import usage
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return (useDb() as Record<string | symbol, unknown>)[prop];
  },
});
