import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const songRequests = sqliteTable('song_requests', {
  album: text('album'),
  artist: text('artist').notNull(),
  coverUrl: text('cover_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  guestSessionId: text('guest_session_id'),
  id: integer('id').primaryKey({ autoIncrement: true }),
  requestedBy: text('requested_by'),
  spotifyTrackId: text('spotify_track_id').notNull(),
  spotifyUri: text('spotify_uri').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'queued', 'played'] }).notNull().default('pending'),
  title: text('title').notNull(),
});

export const spotifyTokens = sqliteTable('spotify_tokens', {
  accessToken: text('access_token').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  id: integer('id').primaryKey().default(1),
  refreshToken: text('refresh_token').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const appSettings = sqliteTable('app_settings', {
  cooldownSeconds: integer('cooldown_seconds').notNull().default(30),
  duplicateWindowMinutes: integer('duplicate_window_minutes').notNull().default(60),
  explicitFilterEnabled: integer('explicit_filter_enabled', { mode: 'boolean' }).notNull().default(false),
  id: integer('id').primaryKey().default(1),
  maxRequestsPerGuest: integer('max_requests_per_guest').notNull().default(10),
  requireApproval: integer('require_approval', { mode: 'boolean' }).notNull().default(true),
});
