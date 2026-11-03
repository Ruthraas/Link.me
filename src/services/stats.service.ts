import "server-only";
import { listDailyStats, bumpDailyStat } from "@/infra/repositories/misc.repo";
import { incrementProfileViews } from "@/infra/repositories/users.repo";

/** Day key in São Paulo time, so "today" matches the user's calendar. */
export function todayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(date);
}

export async function recordView(userId: string) {
  await Promise.all([incrementProfileViews(userId), bumpDailyStat(userId, todayKey(), "views")]);
}

export type DayStat = { day: string; views: number; clicks: number };

/** Last `days` days, oldest first, with zeros filled in for quiet days. */
export async function lastDays(userId: string, days = 14): Promise<DayStat[]> {
  const keys = Array.from({ length: days }, (_, i) => todayKey(new Date(Date.now() - (days - 1 - i) * 86_400_000)));
  const rows = await listDailyStats(userId, keys[0]);
  const byDay = new Map(rows.map((r) => [r.day, r]));
  return keys.map((day) => ({
    day,
    views: Number(byDay.get(day)?.views ?? 0),
    clicks: Number(byDay.get(day)?.clicks ?? 0),
  }));
}
