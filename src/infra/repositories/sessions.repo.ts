import "server-only";
import { queryOne, run } from "../db";

export type SessionRow = { token_hash: string; user_id: string; created_at: number; expires_at: number };

export function insertSession(tokenHash: string, userId: string, now: number, expiresAt: number, userAgent: string) {
  return run("INSERT INTO sessions (token_hash, user_id, created_at, expires_at, user_agent) VALUES (?, ?, ?, ?, ?)", [
    tokenHash, userId, now, expiresAt, userAgent.slice(0, 200),
  ]);
}

export function findSession(tokenHash: string) {
  return queryOne<SessionRow>("SELECT * FROM sessions WHERE token_hash = ?", [tokenHash]);
}

export function extendSession(tokenHash: string, expiresAt: number) {
  return run("UPDATE sessions SET expires_at = ? WHERE token_hash = ?", [expiresAt, tokenHash]);
}

export function deleteSession(tokenHash: string) {
  return run("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
}

export function deleteUserSessions(userId: string, exceptTokenHash?: string) {
  return exceptTokenHash
    ? run("DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?", [userId, exceptTokenHash])
    : run("DELETE FROM sessions WHERE user_id = ?", [userId]);
}

export async function countUserSessions(userId: string, now: number) {
  const row = await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM sessions WHERE user_id = ? AND expires_at > ?", [userId, now]);
  return Number(row?.n ?? 0);
}

export function deleteExpiredSessions(now: number) {
  return run("DELETE FROM sessions WHERE expires_at <= ?", [now]);
}
