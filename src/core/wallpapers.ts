/**
 * Wallpaper catalogue: each pattern is an SVG tile drawn in the theme's own
 * colours, so one pattern works on every theme and in both modes.
 * Output is a CSS `background` value. Colours only ever come from THEMES.
 */
import type { Palette } from "./themes";

export type WallpaperCategory = "fofo" | "masculino" | "neutro" | "foto";

/** `c` is the theme accent; full-colour tiles also read the palette. */
type Tile = { size: number; svg: (c: string, p: Palette) => string };

/** `tile` repeats a small SVG pattern; `image` covers the page with one static picture from /public. */
export type Wallpaper = { id: string; name: string; category: WallpaperCategory; tile?: Tile; image?: string };

const heart = (x: number, y: number, s: number, c: string) =>
  `<path transform="translate(${x} ${y}) scale(${s})" fill="${c}" d="M10 18 C-6 8 2-4 10 4 C18-4 26 8 10 18Z"/>`;
const star = (x: number, y: number, r: number, c: string) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
  return `<polygon fill="${c}" points="${pts}"/>`;
};
const flower = (x: number, y: number, r: number, c: string) =>
  Array.from({ length: 5 }, (_, i) => {
    const a = ((Math.PI * 2) / 5) * i;
    return `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${r * 0.75}" fill="${c}"/>`;
  }).join("");

/** Perceived lightness of a #rrggbb colour, 0 (black) to 1 (white). */
function lightness(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

/** A small bow: two rounded wings and a knot. */
const bow = (x: number, y: number, s: number, fill: string) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}">` +
  `<path d="M0 0 C-4-7-13-8-13 0 C-13 8-4 7 0 0Z"/><path d="M0 0 C4-7 13-8 13 0 C13 8 4 7 0 0Z"/>` +
  `<circle r="3.2"/></g>`;

/**
 * Link.me's own kitten (original drawing): round face, pointed ears,
 * dot eyes, heart nose and a bow tie under the chin.
 * Light grounds get a white kitten; dark grounds a near-black one.
 */
const kitten = (x: number, y: number, s: number, p: Palette) => {
  const dark = lightness(p.bg) < 0.4;
  const face = dark ? "#231a20" : "#ffffff";
  const line = dark ? p.muted : p.ink;
  return (
    `<g transform="translate(${x} ${y}) scale(${s})" stroke="${line}" stroke-width="2.2" stroke-linejoin="round">` +
    `<path fill="${face}" d="M-15-4 L-14-21 L-3-12Z M15-4 L14-21 L3-12Z"/>` +
    `<ellipse fill="${face}" cx="0" cy="0" rx="18" ry="15"/>` +
    `<g stroke="none" fill="${line}"><circle cx="-7" cy="0" r="2.3"/><circle cx="7" cy="0" r="2.3"/></g>` +
    `<path stroke="none" fill="${p.btn}" d="M0 7.5 C-4 4.5-3.5 2 0 3.6 C3.5 2 4 4.5 0 7.5Z"/>` +
    `<g stroke="none" fill="${p.btn}" opacity=".55"><ellipse cx="-12" cy="5" rx="3.2" ry="2"/><ellipse cx="12" cy="5" rx="3.2" ry="2"/></g>` +
    `</g>` +
    bow(x, y + 18 * s, 0.75 * s, p.btn)
  );
};

/** Fixed pink for the cute-goth pattern: it pairs with purple and black on every palette. */
const PINK = "#ff8fc8";

/** Original cute skull: round head, big eyes, little teeth, optional bow. */
const skull = (x: number, y: number, s: number, p: Palette) => {
  const dark = lightness(p.bg) < 0.4;
  const bone = dark ? p.muted : "#ffffff";
  const line = dark ? p.bg : p.ink;
  return (
    `<g transform="translate(${x} ${y}) scale(${s})" stroke="${line}" stroke-width="2" stroke-linejoin="round">` +
    `<path fill="${bone}" d="M-13 2 C-13-12 13-12 13 2 C13 8 9 9 8 12 L-8 12 C-9 9-13 8-13 2Z"/>` +
    `<g stroke="none" fill="${line}"><ellipse cx="-5.5" cy="1" rx="3.6" ry="4.2"/><ellipse cx="5.5" cy="1" rx="3.6" ry="4.2"/>` +
    `<path d="M0 5.5 L-1.8 8.5 L1.8 8.5Z"/></g>` +
    `<path fill="none" d="M-4 12 V9.5 M0 12 V9.5 M4 12 V9.5"/>` +
    `</g>` +
    bow(x + 9 * s, y - 9 * s, 0.6 * s, PINK)
  );
};

/** Crescent moon. */
const moon = (x: number, y: number, r: number, fill: string) =>
  `<path fill="${fill}" d="M${x} ${y - r} A${r} ${r} 0 1 0 ${x} ${y + r} A${r * 0.78} ${r * 0.78} 0 1 1 ${x} ${y - r}Z"/>`;

export const WALLPAPERS: Wallpaper[] = [
  { id: "liso", name: "Liso", category: "neutro" },
  { id: "bolinhas", name: "Bolinhas", category: "neutro", tile: { size: 28, svg: (c) => `<circle cx="7" cy="7" r="3" fill="${c}"/><circle cx="21" cy="21" r="3" fill="${c}"/>` } },
  { id: "coracoes", name: "Corações", category: "fofo", tile: { size: 64, svg: (c) => heart(6, 8, 1, c) + heart(38, 40, 0.8, c) } },
  { id: "estrelas", name: "Estrelas", category: "fofo", tile: { size: 70, svg: (c) => star(16, 18, 9, c) + star(52, 50, 6, c) + `<circle cx="54" cy="14" r="2" fill="${c}"/><circle cx="14" cy="56" r="2" fill="${c}"/>` } },
  { id: "flores", name: "Flores", category: "fofo", tile: { size: 80, svg: (c) => flower(20, 20, 6, c) + flower(60, 60, 4.5, c) } },
  { id: "bolhas", name: "Bolhas", category: "fofo", tile: { size: 120, svg: (c) => `<circle cx="24" cy="26" r="16" fill="${c}"/><circle cx="86" cy="40" r="9" fill="${c}"/><circle cx="60" cy="94" r="22" fill="${c}"/><circle cx="108" cy="104" r="6" fill="${c}"/>` } },
  { id: "gatinhas", name: "Gatinhas", category: "fofo", tile: { size: 120, svg: (c, p) => kitten(32, 34, 1, p) + kitten(92, 94, 0.8, p) + heart(78, 18, 0.7, c) + heart(14, 84, 0.6, c) + `<circle cx="104" cy="52" r="2.5" fill="${c}"/><circle cx="48" cy="104" r="2.5" fill="${c}"/>` } },
  { id: "xadrez-gatinhas", name: "Xadrez com gatinhas", category: "fofo", tile: { size: 96, svg: (c, p) =>
      `<g fill="${c}" opacity=".55"><rect y="0" width="96" height="12"/><rect y="24" width="96" height="12"/><rect y="48" width="96" height="12"/><rect y="72" width="96" height="12"/></g>` +
      `<g fill="${c}" opacity=".55"><rect x="0" width="12" height="96"/><rect x="24" width="12" height="96"/><rect x="48" width="12" height="96"/><rect x="72" width="12" height="96"/></g>` +
      kitten(30, 34, 0.85, p) + bow(78, 76, 0.8, p.btn) } },
  { id: "lacos-bolinhas", name: "Laços e bolinhas", category: "fofo", tile: { size: 80, svg: (c, p) =>
      bow(22, 22, 1.05, p.btn) + bow(62, 62, 0.8, p.btn) +
      `<g fill="${p.btn}" opacity=".35"><circle cx="62" cy="20" r="4"/><circle cx="20" cy="62" r="4"/><circle cx="42" cy="42" r="2.5"/><circle cx="4" cy="40" r="2.5"/><circle cx="40" cy="4" r="2.5"/></g>` } },
  { id: "noite-fofa", name: "Noite fofa", category: "fofo", tile: { size: 120, svg: (c, p) =>
      skull(32, 36, 1, p) + moon(92, 30, 12, PINK) + kitten(88, 92, 0.75, p) +
      star(26, 96, 6, c) + star(60, 64, 3.5, c) + star(110, 64, 3, c) + `<circle cx="60" cy="12" r="2" fill="${c}"/>` } },
  { id: "lacinhos", name: "Lacinhos", category: "fofo", tile: { size: 72, svg: (c, p) => bow(18, 18, 0.9, p.btn) + bow(54, 54, 0.9, c) + `<circle cx="54" cy="16" r="2.5" fill="${p.btn}"/><circle cx="16" cy="56" r="2.5" fill="${c}"/>` } },
  { id: "xadrez", name: "Xadrez", category: "fofo", tile: { size: 48, svg: (c) => `<rect width="24" height="24" fill="${c}"/><rect x="24" y="24" width="24" height="24" fill="${c}"/>` } },
  { id: "carbono", name: "Fibra de carbono", category: "masculino", tile: { size: 16, svg: (c) => `<rect width="8" height="8" fill="${c}"/><rect x="8" y="8" width="8" height="8" fill="${c}"/><rect x="8" width="8" height="4" fill="${c}" opacity=".5"/><rect y="8" width="8" height="4" fill="${c}" opacity=".5"/>` } },
  { id: "camuflado", name: "Camuflado", category: "masculino", tile: { size: 160, svg: (c) => `<path fill="${c}" d="M10 20c20-14 46 2 40 22s-30 18-44 6S-4 30 10 20Z"/><path fill="${c}" d="M92 70c22-8 52 8 44 30s-40 22-52 6-14-28 8-36Z"/><path fill="${c}" d="M30 112c14-6 34 4 30 18s-24 16-34 8-10-20 4-26Z"/><path fill="${c}" d="M112 10c10-4 26 2 24 12s-16 12-24 6-8-14 0-18Z"/>` } },
  { id: "ondas", name: "Ondas", category: "masculino", tile: { size: 60, svg: (c) => `<path d="M0 20q15-12 30 0t30 0M0 50q15-12 30 0t30 0" fill="none" stroke="${c}" stroke-width="5"/>` } },
  { id: "listras", name: "Listras", category: "masculino", tile: { size: 40, svg: (c) => `<path d="M-10 10 10-10M0 40 40 0M30 50 50 30" stroke="${c}" stroke-width="12"/>` } },
  { id: "losangos", name: "Losangos", category: "masculino", tile: { size: 44, svg: (c) => `<path fill="${c}" d="M22 2 42 22 22 42 2 22Z" opacity=".7"/>` } },
  { id: "grade", name: "Grade", category: "masculino", tile: { size: 32, svg: (c) => `<path d="M32 0H0v32" fill="none" stroke="${c}" stroke-width="2"/>` } },
  { id: "triangulos", name: "Triângulos", category: "neutro", tile: { size: 56, svg: (c) => `<path fill="${c}" d="M0 56 28 0l28 56Z" opacity=".55"/>` } },
  { id: "feminino-1", name: "Kitty grafite", category: "fofo", image: "/wallpapers/feminino-1.webp" },
  { id: "feminino-2", name: "Lua e teias", category: "fofo", image: "/wallpapers/feminino-2.webp" },
  { id: "feminino-3", name: "Kitty punk", category: "fofo", image: "/wallpapers/feminino-3.webp" },
  { id: "feminino-4", name: "Estrelas e cruzes", category: "fofo", image: "/wallpapers/feminino-4.webp" },
  { id: "feminino-5", name: "Gato rabiscado", category: "fofo", image: "/wallpapers/feminino-5.webp" },
  { id: "feminino-6", name: "Laços e xadrez", category: "fofo", image: "/wallpapers/feminino-6.webp" },
  { id: "masculino-1", name: "Pôr do sol", category: "masculino", image: "/wallpapers/masculino-1.webp" },
  { id: "masculino-2", name: "Cerejeiras", category: "masculino", image: "/wallpapers/masculino-2.webp" },
  { id: "masculino-3", name: "Escadaria", category: "masculino", image: "/wallpapers/masculino-3.webp" },
  { id: "foto", name: "Sua foto", category: "foto" },
];

export const CUSTOM_WALLPAPER_ID = "foto";

/** Picture wallpapers (catalogue images or the user's photo) get a scrim under the text. */
export function isPictureWallpaper(id: string, imageUrl?: string | null): boolean {
  if (id === CUSTOM_WALLPAPER_ID) return !!imageUrl;
  return !!WALLPAPERS.find((w) => w.id === id)?.image;
}

export function isWallpaperId(id: string): boolean {
  return WALLPAPERS.some((w) => w.id === id);
}

function tileUri(tile: Tile, palette: Palette): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tile.size}" height="${tile.size}" viewBox="0 0 ${tile.size} ${tile.size}">${tile.svg(palette.accent, palette)}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * CSS `background` for one palette.
 * `imageUrl` is only ever an internal `/m/<id>` path produced by the media service.
 */
export function wallpaperBackground(id: string, palette: Palette, imageUrl?: string | null): string {
  if (id === CUSTOM_WALLPAPER_ID && imageUrl && /^\/m\/[A-Za-z0-9_-]+$/.test(imageUrl)) {
    return `center / cover no-repeat url("${imageUrl}"), ${palette.bg}`;
  }
  const wp = WALLPAPERS.find((w) => w.id === id);
  if (wp?.image) return `center / cover no-repeat url("${wp.image}"), ${palette.bg}`;
  if (!wp?.tile) return palette.bg;
  return `${tileUri(wp.tile, palette)} 0 0 / ${wp.tile.size}px ${wp.tile.size}px repeat, ${palette.bg}`;
}
