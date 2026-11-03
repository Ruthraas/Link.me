import "server-only";
import { platformBadge } from "@/core/platforms";
import type { ProfileData } from "@/core/profile";
import { fail, ok, type Result } from "@/core/result";
import { getTheme, isMode, type ProfileMode } from "@/core/themes";
import { normaliseUsername } from "@/core/username";
import { appearanceSchema, firstIssue, profileSchema, type AppearanceInput } from "@/core/validation";
import * as users from "@/infra/repositories/users.repo";
import { listPublicLinks } from "./links.service";
import { consume, RULES } from "./rate-limit.service";

export function mediaUrl(id: string | null): string | null {
  return id ? `/m/${id}` : null;
}

function rowToProfile(row: users.ProfileRow): Omit<ProfileData, "links"> {
  const theme = getTheme(row.theme_id);
  return {
    username: row.username,
    displayName: row.display_name || row.username,
    bio: row.bio,
    avatarUrl: mediaUrl(row.avatar_media_id),
    themeId: theme.id,
    mode: (isMode(row.mode) ? row.mode : "light") as ProfileMode,
    wallpaperId: row.wallpaper_id,
    wallpaperUrl: mediaUrl(row.wallpaper_media_id),
    buttonStyle: row.button_style,
    fontId: row.font_id,
  };
}

/** Public page data. Links point at /go/<id> so clicks are counted and URLs re-checked. */
export async function getPublicProfile(username: string): Promise<{ userId: string; profile: ProfileData } | null> {
  const name = normaliseUsername(username);
  if (!name.ok) return null;
  const row = await users.findProfileByUsername(name.value);
  if (!row) return null;
  const links = await listPublicLinks(row.user_id);
  return {
    userId: row.user_id,
    profile: {
      ...rowToProfile(row),
      links: links.map((l) => ({ id: l.id, title: l.title, href: `/go/${l.id}`, badge: platformBadge(l.url), sensitive: l.sensitive })),
    },
  };
}

/** Dashboard data: same profile, links point at their real URL for the preview. */
export async function getMyProfile(userId: string) {
  const row = await users.findProfileByUserId(userId);
  if (!row) return null;
  return { ...rowToProfile(row), viewCount: Number(row.view_count) };
}

export async function updateProfile(userId: string, input: { displayName: string; bio: string; username: string }): Promise<Result<{ username: string }>> {
  const limited = await consume(`mutate:${userId}`, RULES.mutatePerUser);
  if (!limited.ok) return limited;
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    const issue = firstIssue(parsed.error);
    return fail(issue.message, issue.field);
  }
  const username = normaliseUsername(parsed.data.username);
  if (!username.ok) return username;
  const owner = await users.usernameOwner(username.value);
  if (owner && owner.user_id !== userId) return fail("Esse endereço já tem dono. Escolha outro.", "username");
  // Strip control characters; React escapes the rest at render time.
  const clean = (s: string) => s.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "");
  await users.updateProfileText(userId, clean(parsed.data.displayName), clean(parsed.data.bio), username.value, Date.now());
  return ok({ username: username.value });
}

export async function updateAppearance(userId: string, input: AppearanceInput): Promise<Result> {
  const limited = await consume(`mutate:${userId}`, RULES.mutatePerUser);
  if (!limited.ok) return limited;
  const parsed = appearanceSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error).message);
  await users.updateAppearance(userId, parsed.data, Date.now());
  return ok();
}
