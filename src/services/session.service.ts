import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { randomToken, sha256 } from "@/infra/crypto";
import * as sessions from "@/infra/repositories/sessions.repo";
import { findUserById } from "@/infra/repositories/users.repo";

/**
 * Opaque server-side sessions.
 * The browser holds a random 256-bit token in an HttpOnly cookie; the DB holds
 * only its SHA-256, so a leaked database cannot be replayed as cookies.
 */

const isProd = process.env.NODE_ENV === "production";
// __Host- prefix: Secure, Path=/, no Domain. Browsers reject it otherwise.
export const SESSION_COOKIE = isProd ? "__Host-lm_session" : "lm_session";

const DAY = 24 * 60 * 60_000;
const SESSION_TTL = 30 * DAY;
const RENEW_WHEN_LEFT = 15 * DAY;

async function writeCookie(token: string, expiresAt: number) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
    priority: "high",
  });
}

export async function startSession(userId: string, userAgent: string) {
  const token = randomToken();
  const now = Date.now();
  const expiresAt = now + SESSION_TTL;
  await sessions.insertSession(sha256(token), userId, now, expiresAt, userAgent);
  await writeCookie(token, expiresAt);
  // Opportunistic cleanup keeps the table small without a cron job.
  if (Math.random() < 0.05) await sessions.deleteExpiredSessions(now);
}

async function currentTokenHash(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  return sha256(token);
}

/** Resolves the signed-in user once per request (React `cache`). */
export const getSessionUser = cache(async () => {
  const tokenHash = await currentTokenHash();
  if (!tokenHash) return null;
  const session = await sessions.findSession(tokenHash);
  const now = Date.now();
  if (!session || Number(session.expires_at) <= now) return null;
  const user = await findUserById(session.user_id);
  // A session older than the last password change is dead.
  if (!user || Number(session.created_at) < Number(user.password_changed_at)) return null;
  if (Number(session.expires_at) - now < RENEW_WHEN_LEFT) {
    const expiresAt = now + SESSION_TTL;
    await sessions.extendSession(tokenHash, expiresAt);
    try {
      const token = (await cookies()).get(SESSION_COOKIE)!.value;
      await writeCookie(token, expiresAt);
    } catch {
      // Cookies are read-only while rendering a Server Component; the DB extension is enough.
    }
  }
  return { id: user.id, email: user.email, tokenHash };
});

export async function endSession() {
  const tokenHash = await currentTokenHash();
  if (tokenHash) await sessions.deleteSession(tokenHash);
  (await cookies()).delete(SESSION_COOKIE);
}

export async function endOtherSessions(userId: string, keepTokenHash: string) {
  await sessions.deleteUserSessions(userId, keepTokenHash);
}

export function countSessions(userId: string) {
  return sessions.countUserSessions(userId, Date.now());
}
