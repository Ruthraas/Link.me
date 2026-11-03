import "server-only";
import { createClient, type Client, type InValue } from "@libsql/client";

/**
 * Database access point (libSQL / Turso).
 * Local dev: DATABASE_URL=file:local.db. Production: a Turso URL + token.
 * The schema is created idempotently on first use, so there is no separate migrate step.
 */

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  password_changed_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  theme_id TEXT NOT NULL DEFAULT 'ceu',
  mode TEXT NOT NULL DEFAULT 'light',
  wallpaper_id TEXT NOT NULL DEFAULT 'bolinhas',
  button_style TEXT NOT NULL DEFAULT 'pill-solid',
  font_id TEXT NOT NULL DEFAULT 'schibsted',
  avatar_media_id TEXT,
  wallpaper_media_id TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  user_agent TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS links (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  sensitive INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS links_user ON links(user_id, position);
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  mime TEXT NOT NULL,
  bytes BLOB NOT NULL,
  size INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS daily_stats (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
`;

const globalForDb = globalThis as unknown as { __linkmeDb?: Client; __linkmeReady?: Promise<void> };

function client(): Client {
  if (!globalForDb.__linkmeDb) {
    // TURSO_* names are what the Vercel Marketplace integration injects.
    const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:local.db";
    const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
    if (process.env.VERCEL && url.startsWith("file:")) {
      throw new Error("DATABASE_URL não configurada: na Vercel o banco precisa ser Turso (libsql://...).");
    }
    globalForDb.__linkmeDb = createClient({ url, authToken });
  }
  return globalForDb.__linkmeDb;
}

async function ready(): Promise<Client> {
  const db = client();
  globalForDb.__linkmeReady ??= (async () => {
    await db.executeMultiple(SCHEMA);
    await db.execute("PRAGMA foreign_keys = ON");
  })().catch((err) => {
    globalForDb.__linkmeReady = undefined;
    throw err;
  });
  await globalForDb.__linkmeReady;
  return db;
}

export type Row = Record<string, unknown>;

/** Runs one parameterised statement. Never interpolate values into `sql`. */
export async function query<T = Row>(sql: string, args: InValue[] = []): Promise<T[]> {
  const db = await ready();
  const res = await db.execute({ sql, args });
  return res.rows as unknown as T[];
}

export async function queryOne<T = Row>(sql: string, args: InValue[] = []): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

export async function run(sql: string, args: InValue[] = []): Promise<number> {
  const db = await ready();
  const res = await db.execute({ sql, args });
  return res.rowsAffected;
}

/** Runs several statements atomically. */
export async function transaction(statements: { sql: string; args: InValue[] }[]): Promise<void> {
  const db = await ready();
  await db.batch(statements, "write");
}
