import "server-only";
import { headers } from "next/headers";

/** Client IP as seen by Vercel's edge (first hop of x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "0.0.0.0";
}

export async function userAgent(): Promise<string> {
  return (await headers()).get("user-agent") ?? "";
}

const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|preview|headless|lighthouse/i;
export function isBot(ua: string): boolean {
  return !ua || BOT_UA.test(ua);
}
