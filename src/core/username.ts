import { fail, ok, type Result } from "./result";

/** Routes and words a user can never take as their public address. */
const RESERVED = new Set([
  "admin", "api", "app", "auth", "aviso", "conta", "criar-conta", "dashboard", "entrar", "go", "help",
  "login", "logout", "m", "me", "privacidade", "root", "sair", "settings", "signup", "suporte",
  "support", "termos", "www", "linkme", "link", "_next", "static", "favicon.ico", "robots.txt",
  "sitemap.xml", "status", "seguranca",
]);

export const USERNAME_RULE = "3 a 30 caracteres: letras minúsculas, números, ponto ou _.";

export function normaliseUsername(input: string): Result<string> {
  const value = input.trim().toLowerCase().replace(/^@/, "");
  if (!/^[a-z0-9_.]{3,30}$/.test(value)) return fail(`Endereço inválido. Use ${USERNAME_RULE}`, "username");
  if (value.startsWith(".") || value.endsWith(".") || value.includes("..")) {
    return fail("O endereço não pode começar, terminar ou repetir ponto.", "username");
  }
  if (RESERVED.has(value)) return fail("Esse endereço é reservado. Escolha outro.", "username");
  return ok(value);
}
