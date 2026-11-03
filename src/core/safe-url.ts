/**
 * Link safety rules. Pure functions, no IO.
 *
 * A link is accepted only when it is http(s), mailto or tel, has no embedded
 * credentials, no private/loopback host and stays under a sane length.
 * Everything else (javascript:, data:, file:, vbscript:, blob: ...) is refused.
 */
import { fail, ok, type Result } from "./result";

const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

const BLOCKED_HOST_SUFFIXES = [".local", ".internal", ".localhost", ".lan", ".home.arpa"];

function isPrivateIPv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  );
}

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host === "") return true;
  if (BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s))) return true;
  if (isPrivateIPv4(host)) return true;
  if (host.includes(":")) {
    // IPv6 literal: block loopback, link-local and unique-local ranges.
    if (host === "::1" || host.startsWith("fe80") || host.startsWith("fc") || host.startsWith("fd")) return true;
  }
  return !host.includes(".") && !host.includes(":");
}

/** Adds https:// when the user typed a bare domain like "instagram.com/ana". */
function withDefaultScheme(raw: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
  if (/^[+\d][\d\s().-]{6,}$/.test(raw)) return `tel:${raw.replace(/[^\d+]/g, "")}`;
  if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(raw)) return `mailto:${raw}`;
  return `https://${raw.replace(/^\/+/, "")}`;
}

/** Validates and normalises a user supplied link. */
export function normaliseSafeUrl(input: string): Result<string> {
  const raw = input.trim();
  if (!raw) return fail("Informe o endereço do link.", "url");
  if (raw.length > MAX_URL_LENGTH) return fail("Link longo demais.", "url");
  // Control chars and whitespace inside a URL are a classic obfuscation trick.
  if (/[\u0000-\u001f\u007f\s]/.test(raw)) return fail("O link não pode ter espaços.", "url");

  let url: URL;
  try {
    url = new URL(withDefaultScheme(raw));
  } catch {
    return fail("Esse link não parece válido.", "url");
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    return fail("Só aceitamos links http, https, e-mail ou telefone.", "url");
  }

  if (url.protocol === "http:" || url.protocol === "https:") {
    if (url.username || url.password) return fail("Links com usuário e senha embutidos não são permitidos.", "url");
    if (isBlockedHost(url.hostname)) return fail("Esse endereço aponta para uma rede privada.", "url");
  }

  if (url.protocol === "mailto:" && !/^[^\s@]+@[^\s@]+\.[^\s@]+/.test(decodeURIComponent(url.pathname))) {
    return fail("E-mail inválido.", "url");
  }
  if (url.protocol === "tel:" && !/^\+?\d{6,15}$/.test(url.pathname)) {
    return fail("Telefone inválido.", "url");
  }

  return ok(url.toString());
}

/** Readable host for the "you are leaving" screen. */
export function displayHost(href: string): string {
  try {
    const url = new URL(href);
    if (url.protocol === "mailto:") return url.pathname;
    if (url.protocol === "tel:") return url.pathname;
    return url.hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}
