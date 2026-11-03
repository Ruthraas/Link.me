import "server-only";
import { clearRateLimit, hitRateLimit } from "@/infra/repositories/misc.repo";
import { fail, ok, type Result } from "@/core/result";

type Rule = { limit: number; windowMs: number };

export const RULES = {
  loginPerAccount: { limit: 5, windowMs: 15 * 60_000 },
  loginPerIp: { limit: 30, windowMs: 15 * 60_000 },
  signupPerIp: { limit: 5, windowMs: 60 * 60_000 },
  passwordChange: { limit: 5, windowMs: 15 * 60_000 },
  uploadPerUser: { limit: 30, windowMs: 60 * 60_000 },
  mutatePerUser: { limit: 300, windowMs: 10 * 60_000 },
} satisfies Record<string, Rule>;

/** Counts one attempt; fails once the window's limit is passed. */
export async function consume(key: string, rule: Rule): Promise<Result> {
  const now = Date.now();
  const { count, resetAt } = await hitRateLimit(key, rule.windowMs, now);
  if (count > rule.limit) {
    const minutes = Math.max(1, Math.ceil((resetAt - now) / 60_000));
    return fail(`Muitas tentativas. Tente de novo em ${minutes} min.`);
  }
  return ok();
}

export function reset(key: string) {
  return clearRateLimit(key);
}
