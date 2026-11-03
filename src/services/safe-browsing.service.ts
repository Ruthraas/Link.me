import "server-only";
import { fail, ok, type Result } from "@/core/result";

/**
 * Optional Google Safe Browsing lookup (v4 threatMatches:find).
 * Enabled only when GOOGLE_SAFE_BROWSING_KEY is set; fails open on network errors
 * so an outage at Google never blocks saving a link.
 */
export async function checkSafeBrowsing(url: string): Promise<Result> {
  const key = process.env.GOOGLE_SAFE_BROWSING_KEY;
  if (!key || !/^https?:/.test(url)) return ok();
  try {
    const res = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
      body: JSON.stringify({
        client: { clientId: "link.me", clientVersion: "1.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      }),
    });
    if (!res.ok) return ok();
    const data = (await res.json()) as { matches?: unknown[] };
    return data.matches?.length ? fail("Esse link foi marcado como perigoso (phishing ou malware).", "url") : ok();
  } catch {
    return ok();
  }
}
