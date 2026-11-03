/** Recognises common platforms so a link gets a short badge inside its circle. */
const PLATFORMS: { match: RegExp; badge: string; name: string }[] = [
  { match: /(^|\.)instagram\.com$/, badge: "IG", name: "Instagram" },
  { match: /(^|\.)tiktok\.com$/, badge: "TT", name: "TikTok" },
  { match: /(^|\.)(youtube\.com|youtu\.be)$/, badge: "YT", name: "YouTube" },
  { match: /(^|\.)(x\.com|twitter\.com)$/, badge: "X", name: "X" },
  { match: /(^|\.)github\.com$/, badge: "GH", name: "GitHub" },
  { match: /(^|\.)linkedin\.com$/, badge: "in", name: "LinkedIn" },
  { match: /(^|\.)(wa\.me|whatsapp\.com)$/, badge: "WA", name: "WhatsApp" },
  { match: /(^|\.)spotify\.com$/, badge: "SP", name: "Spotify" },
  { match: /(^|\.)twitch\.tv$/, badge: "TW", name: "Twitch" },
  { match: /(^|\.)(discord\.gg|discord\.com)$/, badge: "DC", name: "Discord" },
  { match: /(^|\.)(facebook\.com|fb\.com)$/, badge: "FB", name: "Facebook" },
  { match: /(^|\.)pinterest\.com$/, badge: "PI", name: "Pinterest" },
  { match: /(^|\.)threads\.net$/, badge: "TH", name: "Threads" },
];

export function platformBadge(href: string): string {
  try {
    const url = new URL(href);
    if (url.protocol === "mailto:") return "@";
    if (url.protocol === "tel:") return "Tel";
    const host = url.hostname.toLowerCase();
    return PLATFORMS.find((p) => p.match.test(host))?.badge ?? "";
  } catch {
    return "";
  }
}
