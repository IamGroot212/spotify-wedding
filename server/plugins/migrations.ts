export default defineNitroPlugin(async () => {
  const sqlite = useSqlite();

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS song_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      spotify_track_id TEXT NOT NULL,
      spotify_uri TEXT NOT NULL,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      cover_url TEXT,
      requested_by TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      CHECK (status IN ('pending', 'approved', 'rejected', 'queued', 'played'))
    );

    CREATE TABLE IF NOT EXISTS spotify_tokens (
      id INTEGER PRIMARY KEY DEFAULT 1,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      explicit_filter_enabled INTEGER NOT NULL DEFAULT 0,
      duplicate_window_minutes INTEGER NOT NULL DEFAULT 60,
      cooldown_seconds INTEGER NOT NULL DEFAULT 30,
      max_requests_per_guest INTEGER NOT NULL DEFAULT 10,
      require_approval INTEGER NOT NULL DEFAULT 1
    );

    INSERT OR IGNORE INTO app_settings (id) VALUES (1);
  `);

  // Migrations: add columns if missing
  const migrations = [
    `ALTER TABLE song_requests ADD COLUMN guest_session_id TEXT`,
    `ALTER TABLE app_settings ADD COLUMN no_repeats_all_night INTEGER NOT NULL DEFAULT 1`,
  ];
  for (const migration of migrations) {
    try {
      sqlite.exec(migration);
    }
    catch {
      // column already exists
    }
  }

  // eslint-disable-next-line no-console
  console.log('[spotify-wedding] Database initialized');
});
