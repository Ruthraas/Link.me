import "server-only";
import { fail, ok, type Result } from "@/core/result";
import { normaliseUsername } from "@/core/username";
import { changePasswordSchema, firstIssue, signInSchema, signUpSchema } from "@/core/validation";
import { getTheme } from "@/core/themes";
import { getDummyHash, hashPassword, newId, sha1Upper, verifyPassword } from "@/infra/crypto";
import * as users from "@/infra/repositories/users.repo";
import { clientIp, userAgent } from "@/infra/request";
import { consume, reset, RULES } from "./rate-limit.service";
import { endSession, getSessionUser, startSession } from "./session.service";

const WRONG_CREDENTIALS = "E-mail ou senha incorretos.";

/**
 * Have I Been Pwned k-anonymity check: only the first 5 hex chars of the
 * password's SHA-1 leave the server. Fails open (network issues never block sign-up).
 */
async function isBreachedPassword(password: string): Promise<boolean> {
  if (process.env.DISABLE_PWNED_CHECK === "1") return false;
  const hash = sha1Upper(password);
  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!res.ok) return false;
    const suffix = hash.slice(5);
    return (await res.text()).split("\n").some((line) => {
      const [s, count] = line.trim().split(":");
      return s === suffix && Number(count) > 0;
    });
  } catch {
    return false;
  }
}

async function checkPasswordStrength(password: string, email: string, username: string): Promise<Result> {
  const lower = password.toLowerCase();
  if (lower.includes(username) || lower.includes(email.split("@")[0])) {
    return fail("A senha não pode conter seu e-mail ou endereço.", "password");
  }
  if (new Set(password).size < 5) return fail("Senha repetitiva demais.", "password");
  if (await isBreachedPassword(password)) {
    return fail("Essa senha já apareceu em vazamentos de dados. Escolha outra.", "password");
  }
  return ok();
}

export type SignUpInput = { email: string; username: string; password: string; style?: string };

export async function signUp(input: SignUpInput): Promise<Result> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    const issue = firstIssue(parsed.error);
    return fail(issue.message, issue.field);
  }
  const username = normaliseUsername(parsed.data.username);
  if (!username.ok) return username;
  const { email, password } = parsed.data;

  const limited = await consume(`signup:${await clientIp()}`, RULES.signupPerIp);
  if (!limited.ok) return limited;

  const strength = await checkPasswordStrength(password, email, username.value);
  if (!strength.ok) return strength;

  const taken = await users.emailOrUsernameTaken(email, username.value);
  if (taken.username) return fail("Esse endereço já tem dono. Escolha outro.", "username");
  // Same wording as a generic failure would leak less, but sign-up must tell the user
  // to sign in instead; the per-IP limit above bounds enumeration.
  if (taken.email) return fail("Já existe uma conta com esse e-mail. Entre nela.", "email");

  // The style picked on the landing page seeds the first theme.
  const starter = input.style === "masculino" ? getTheme("grafite") : input.style === "fofo" ? getTheme("morango") : getTheme("ceu");

  const id = newId();
  try {
    await users.insertUserWithProfile({
      id,
      email,
      passwordHash: await hashPassword(password),
      username: username.value,
      displayName: username.value,
      themeId: starter.id,
      wallpaperId: starter.wallpaper,
      fontId: starter.font,
      buttonStyle: starter.button,
      now: Date.now(),
    });
  } catch {
    // UNIQUE race between the check and the insert.
    return fail("Esse e-mail ou endereço acabou de ser usado. Tente outro.");
  }
  await startSession(id, await userAgent());
  return ok();
}

export async function signIn(input: { email: string; password: string }): Promise<Result> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return fail(WRONG_CREDENTIALS);
  const { email, password } = parsed.data;

  const ipLimit = await consume(`login-ip:${await clientIp()}`, RULES.loginPerIp);
  if (!ipLimit.ok) return ipLimit;
  const accountKey = `login:${email}`;
  const accountLimit = await consume(accountKey, RULES.loginPerAccount);
  if (!accountLimit.ok) return accountLimit;

  const user = await users.findUserByEmail(email);
  // Always run scrypt so response time does not reveal whether the e-mail exists.
  const valid = await verifyPassword(password, user?.password_hash ?? (await getDummyHash()));
  if (!user || !valid) return fail(WRONG_CREDENTIALS);

  await reset(accountKey);
  await startSession(user.id, await userAgent());
  return ok();
}

export async function signOut(): Promise<void> {
  await endSession();
}

export async function changePassword(input: { current: string; next: string }): Promise<Result> {
  const me = await getSessionUser();
  if (!me) return fail("Sessão expirada. Entre de novo.");
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    const issue = firstIssue(parsed.error);
    return fail(issue.message, issue.field === "next" ? "next" : "current");
  }
  const limited = await consume(`pwchange:${me.id}`, RULES.passwordChange);
  if (!limited.ok) return limited;

  const user = await users.findUserById(me.id);
  if (!user || !(await verifyPassword(parsed.data.current, user.password_hash))) {
    return fail("Senha atual incorreta.", "current");
  }
  const profile = await users.findProfileByUserId(me.id);
  const strength = await checkPasswordStrength(parsed.data.next, user.email, profile?.username ?? "");
  if (!strength.ok) return { ...strength, field: "next" };

  // Bumping password_changed_at invalidates every older session, this one included;
  // a fresh session is issued right after (session rotation).
  await users.updatePasswordHash(me.id, await hashPassword(parsed.data.next), Date.now());
  await startSession(me.id, await userAgent());
  return ok();
}

export async function deleteAccount(password: string): Promise<Result> {
  const me = await getSessionUser();
  if (!me) return fail("Sessão expirada. Entre de novo.");
  const limited = await consume(`pwchange:${me.id}`, RULES.passwordChange);
  if (!limited.ok) return limited;
  const user = await users.findUserById(me.id);
  if (!user || !(await verifyPassword(password, user.password_hash))) return fail("Senha incorreta.", "password");
  await users.deleteUser(me.id);
  await endSession();
  return ok();
}
