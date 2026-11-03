"use server";

/**
 * Thin controllers: read FormData, call one service, translate the Result.
 * Next.js checks the Origin header of every Server Action (CSRF protection).
 */
import { redirect } from "next/navigation";
import type { ActionState } from "@/core/result";
import * as auth from "@/services/auth.service";
import { getSessionUser, endOtherSessions } from "@/services/session.service";

const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

export async function signUpAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const result = await auth.signUp({
    email: str(fd, "email"),
    username: str(fd, "username"),
    password: str(fd, "password"),
    style: str(fd, "style"),
  });
  if (!result.ok) return { ok: false, error: result.error, field: result.field };
  redirect("/dashboard");
}

export async function signInAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const result = await auth.signIn({ email: str(fd, "email"), password: str(fd, "password") });
  if (!result.ok) return { ok: false, error: result.error, field: result.field };
  // Only internal dashboard paths: never redirect to a URL taken from the request.
  const next = str(fd, "next");
  redirect(/^\/dashboard(\/[a-z-]+)?$/.test(next) ? next : "/dashboard");
}

export async function signOutAction(): Promise<void> {
  await auth.signOut();
  redirect("/entrar");
}

export async function changePasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const result = await auth.changePassword({ current: str(fd, "current"), next: str(fd, "next") });
  return result.ok ? { ok: true, message: "Senha trocada. Outras sessões foram encerradas." } : { ok: false, error: result.error, field: result.field };
}

export async function signOutOthersAction(): Promise<ActionState> {
  const me = await getSessionUser();
  if (!me) return { ok: false, error: "Sessão expirada." };
  await endOtherSessions(me.id, me.tokenHash);
  return { ok: true, message: "Pronto: só este aparelho continua conectado." };
}

export async function deleteAccountAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (str(fd, "confirm") !== "EXCLUIR") return { ok: false, error: "Digite EXCLUIR para confirmar.", field: "confirm" };
  const result = await auth.deleteAccount(str(fd, "password"));
  if (!result.ok) return { ok: false, error: result.error, field: result.field };
  redirect("/?conta=excluida");
}
