/**
 * The shape a profile page is drawn from. Shared by the public page,
 * the dashboard's live preview and the landing page's theme showcase.
 */
import type { ProfileMode } from "./themes";

export type ProfileLink = { id: string; title: string; href: string; badge: string; sensitive: boolean };

export type ProfileData = {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  themeId: string;
  mode: ProfileMode;
  wallpaperId: string;
  wallpaperUrl: string | null;
  buttonStyle: string;
  fontId: string;
  links: ProfileLink[];
};

export function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\p{N} ]/gu, " ").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
