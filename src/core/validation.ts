/**
 * Input schemas. Every server action parses FormData through one of these
 * before a service sees it. Messages are user-facing (PT-BR).
 */
import { z } from "zod";
import { isButtonId, isFontId, isMode, isThemeId } from "./themes";
import { isWallpaperId } from "./wallpapers";

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "E-mail longo demais.")
  .pipe(z.email("E-mail inválido."));

const password = z
  .string()
  .min(PASSWORD_MIN, `A senha precisa de ${PASSWORD_MIN} caracteres ou mais.`)
  .max(PASSWORD_MAX, "Senha longa demais.");

export const signUpSchema = z.object({
  email,
  username: z.string().max(40),
  password,
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Informe a senha.").max(PASSWORD_MAX),
});

export const changePasswordSchema = z.object({
  current: z.string().min(1, "Informe a senha atual.").max(PASSWORD_MAX),
  next: password,
});

export const linkSchema = z.object({
  title: z.string().trim().min(1, "Dê um título ao link.").max(80, "Título com no máximo 80 caracteres."),
  url: z.string().max(2048, "Link longo demais."),
  sensitive: z.boolean().default(false),
});

export const profileSchema = z.object({
  displayName: z.string().trim().max(50, "Nome com no máximo 50 caracteres."),
  bio: z.string().trim().max(160, "Bio com no máximo 160 caracteres."),
  username: z.string().max(40),
});

export const appearanceSchema = z.object({
  themeId: z.string().refine(isThemeId, "Tema desconhecido."),
  mode: z.string().refine(isMode, "Modo desconhecido."),
  wallpaperId: z.string().refine(isWallpaperId, "Wallpaper desconhecido."),
  buttonStyle: z.string().refine(isButtonId, "Botão desconhecido."),
  fontId: z.string().refine(isFontId, "Fonte desconhecida."),
});

export type AppearanceInput = z.infer<typeof appearanceSchema>;

/** First issue of a failed parse, as a user-facing message. */
export function firstIssue(error: z.ZodError): { message: string; field?: string } {
  const issue = error.issues[0];
  return { message: issue?.message ?? "Dados inválidos.", field: issue?.path[0]?.toString() };
}
