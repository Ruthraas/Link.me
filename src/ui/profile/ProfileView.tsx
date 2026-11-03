import Link from "next/link";
import type { CSSProperties } from "react";
import { initials, type ProfileData } from "@/core/profile";
import { getFont, getTheme, isButtonId, type Palette } from "@/core/themes";
import { wallpaperBackground } from "@/core/wallpapers";
import "./profile.css";

/**
 * Draws a profile page. Pure: no hooks, no data access, so the same component
 * renders the public page (server), the dashboard preview and the landing showcase.
 */
function paletteVars(prefix: "l" | "d", p: Palette, bg: string): Record<string, string> {
  return {
    [`--${prefix}-bg`]: bg,
    [`--${prefix}-ink`]: p.ink,
    [`--${prefix}-muted`]: p.muted,
    [`--${prefix}-btn`]: p.btn,
    [`--${prefix}-btn-ink`]: p.btnInk,
    [`--${prefix}-ground`]: p.bg,
  };
}

export function profileStyle(profile: Pick<ProfileData, "themeId" | "wallpaperId" | "wallpaperUrl" | "fontId">): CSSProperties {
  const theme = getTheme(profile.themeId);
  return {
    ...paletteVars("l", theme.light, wallpaperBackground(profile.wallpaperId, theme.light, profile.wallpaperUrl)),
    ...paletteVars("d", theme.dark, wallpaperBackground(profile.wallpaperId, theme.dark, profile.wallpaperUrl)),
    "--pv-font": getFont(profile.fontId).cssVar,
  } as CSSProperties;
}

type Props = {
  profile: ProfileData;
  /** Inside the dashboard or landing page: links do not navigate, page does not fill the screen. */
  preview?: boolean;
  /** Overrides the stored mode (the dashboard's preview toggle). */
  forceMode?: "light" | "dark";
  /** h1 on the public page, h2 in the dashboard, plain text (0) inside a landing fragment. */
  headingLevel?: 0 | 1 | 2;
};

export function ProfileView({ profile, preview = false, forceMode, headingLevel = 1 }: Props) {
  const Heading = headingLevel === 1 ? "h1" : headingLevel === 2 ? "h2" : "p";
  const button = isButtonId(profile.buttonStyle) ? profile.buttonStyle : "pill-solid";
  const hasPhotoWallpaper = profile.wallpaperId === "foto" && !!profile.wallpaperUrl;
  return (
    <div
      className={`pv${preview ? " pv-preview" : ""}${hasPhotoWallpaper ? " pv-photo" : ""}`}
      data-mode={forceMode ?? profile.mode}
      style={profileStyle(profile)}
    >
      <div className="pv-column">
        <div className="pv-avatar" aria-hidden={!profile.avatarUrl}>
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- internal /m/ route, already sized WebP
            <img src={profile.avatarUrl} alt={`Foto de ${profile.displayName}`} width={112} height={112} />
          ) : (
            <span>{initials(profile.displayName)}</span>
          )}
        </div>
        <div className="pv-intro">
          <Heading className="pv-name">{profile.displayName}</Heading>
          <p className="pv-handle">@{profile.username}</p>
          {profile.bio ? <p className="pv-bio">{profile.bio}</p> : null}
        </div>

        {profile.links.length ? (
          <ul className="pv-links">
            {profile.links.map((link) => (
              <li key={link.id}>
                <a
                  className={`pv-link btn-${button}`}
                  href={preview ? undefined : link.href}
                  rel="noopener noreferrer nofollow"
                  aria-disabled={preview || undefined}
                  tabIndex={preview ? -1 : undefined}
                >
                  <span className="pv-badge" aria-hidden="true">{link.badge}</span>
                  <span className="pv-title">{link.title}</span>
                  {link.sensitive ? <span className="pv-flag">aviso</span> : <span className="pv-badge-space" aria-hidden="true" />}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pv-empty">Nenhum link por aqui ainda.</p>
        )}

        <p className="pv-footer">
          {preview ? <span>link.me</span> : <Link href="/">Crie a sua no link.me</Link>}
        </p>
      </div>
    </div>
  );
}
