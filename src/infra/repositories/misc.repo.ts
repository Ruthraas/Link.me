import "server-only";
import { query, queryOne, run } from "../db";

/* ---------- media ---------- */

export type MediaRow = { id: string; user_id: string; kind: string; mime: string; bytes: ArrayBuffer; size: number };

export function insertMedia(m: { id: string; userId: string; kind: string; mime: string; bytes: Uint8Array; now: number }) {
  return run("INSERT INTO media (id, user_id, kind, mime, bytes, size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
    m.id, m.userId, m.kind, m.mime, m.bytes, m.bytes.byteLength, m.now,
  ]);
}

export function findMedia(id: string) {
  return queryOne<MediaRow>("SELECT * FROM media WHERE id = ?", [id]);
}

export function deleteMedia(userId: string, id: string) {
  return run("DELETE FROM media WHERE id = ? AND user_id = ?", [id, userId]);
}

/* ---------- daily stats ---------- */

export function bumpDailyStat(userId: string, day: string, column: "views" | "clicks") {
  // `column` is a closed union, never user input.
  return run(
    `INSERT INTO daily_stats (user_id, day, ${column}) VALUES (?, ?, 1)
     ON CONFLICT(user_id, day) DO UPDATE SET ${column} = ${column} + 1`,
    [userId, day],
  );
}

export function listDailyStats(userId: string, fromDay: string) {
  return query<{ day: string; views: number; clicks: number }>(
    "SELECT day, views, clicks FROM daily_stats WHERE user_id = ? AND day >= ? ORDER BY day ASC",
    [userId, fromDay],
  );
}

/* ---------- rate limits (fixed window) ---------- */

/** Increments the counter for `key` and returns the count inside the current window. */
export async function hitRateLimit(key: string, windowMs: number, now: number): Promise<{ count: number; resetAt: number }> {
  const row = await queryOne<{ count: number; reset_at: number }>(
    `INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN rate_limits.reset_at <= ? THEN 1 ELSE rate_limits.count + 1 END,
       reset_at = CASE WHEN rate_limits.reset_at <= ? THEN excluded.reset_at ELSE rate_limits.reset_at END
     RETURNING count, reset_at`,
    [key, now + windowMs, now, now],
  );
  return { count: Number(row?.count ?? 1), resetAt: Number(row?.reset_at ?? now + windowMs) };
}

export function clearRateLimit(key: string) {
  return run("DELETE FROM rate_limits WHERE key = ?", [key]);
}

export function deleteExpiredRateLimits(now: number) {
  return run("DELETE FROM rate_limits WHERE reset_at <= ?", [now]);
}
