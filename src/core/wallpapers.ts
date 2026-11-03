/**
 * Wallpaper catalogue: each pattern is an SVG tile drawn in the theme's own
 * accent colour, so one pattern works on every theme and in both modes.
 * Output is a CSS `background` value. Colours only ever come from THEMES.
 */
import type { Palette } from "./themes";

export type WallpaperCategory = "fofo" | "masculino" | "neutro" | "foto";

type Tile = { size: number; svg: (c: string) => string };

export type Wallpaper = { id: string; name: string; category: WallpaperCategory; tile?: Tile };

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

export const WALLPAPERS: Wallpaper[] = [
  { id: "liso", name: "Liso", category: "neutro" },
  { id: "bolinhas", name: "Bolinhas", category: "neutro", tile: { size: 28, svg: (c) => `<circle cx="7" cy="7" r="3" fill="${c}"/><circle cx="21" cy="21" r="3" fill="${c}"/>` } },
  { id: "coracoes", name: "Corações", category: "fofo", tile: { size: 64, svg: (c) => heart(6, 8, 1, c) + heart(38, 40, 0.8, c) } },
  { id: "estrelas", name: "Estrelas", category: "fofo", tile: { size: 70, svg: (c) => star(16, 18, 9, c) + star(52, 50, 6, c) + `<circle cx="54" cy="14" r="2" fill="${c}"/><circle cx="14" cy="56" r="2" fill="${c}"/>` } },
  { id: "flores", name: "Flores", category: "fofo", tile: { size: 80, svg: (c) => flower(20, 20, 6, c) + flower(60, 60, 4.5, c) } },
  { id: "bolhas", name: "Bolhas", category: "fofo", tile: { size: 120, svg: (c) => `<circle cx="24" cy="26" r="16" fill="${c}"/><circle cx="86" cy="40" r="9" fill="${c}"/><circle cx="60" cy="94" r="22" fill="${c}"/><circle cx="108" cy="104" r="6" fill="${c}"/>` } },
  { id: "xadrez", name: "Xadrez", category: "fofo", tile: { size: 48, svg: (c) => `<rect width="24" height="24" fill="${c}"/><rect x="24" y="24" width="24" height="24" fill="${c}"/>` } },
  { id: "carbono", name: "Fibra de carbono", category: "masculino", tile: { size: 16, svg: (c) => `<rect width="8" height="8" fill="${c}"/><rect x="8" y="8" width="8" height="8" fill="${c}"/><rect x="8" width="8" height="4" fill="${c}" opacity=".5"/><rect y="8" width="8" height="4" fill="${c}" opacity=".5"/>` } },
  { id: "camuflado", name: "Camuflado", category: "masculino", tile: { size: 160, svg: (c) => `<path fill="${c}" d="M10 20c20-14 46 2 40 22s-30 18-44 6S-4 30 10 20Z"/><path fill="${c}" d="M92 70c22-8 52 8 44 30s-40 22-52 6-14-28 8-36Z"/><path fill="${c}" d="M30 112c14-6 34 4 30 18s-24 16-34 8-10-20 4-26Z"/><path fill="${c}" d="M112 10c10-4 26 2 24 12s-16 12-24 6-8-14 0-18Z"/>` } },
  { id: "ondas", name: "Ondas", category: "masculino", tile: { size: 60, svg: (c) => `<path d="M0 20q15-12 30 0t30 0M0 50q15-12 30 0t30 0" fill="none" stroke="${c}" stroke-width="5"/>` } },
  { id: "listras", name: "Listras", category: "masculino", tile: { size: 40, svg: (c) => `<path d="M-10 10 10-10M0 40 40 0M30 50 50 30" stroke="${c}" stroke-width="12"/>` } },
  { id: "losangos", name: "Losangos", category: "masculino", tile: { size: 44, svg: (c) => `<path fill="${c}" d="M22 2 42 22 22 42 2 22Z" opacity=".7"/>` } },
  { id: "grade", name: "Grade", category: "masculino", tile: { size: 32, svg: (c) => `<path d="M32 0H0v32" fill="none" stroke="${c}" stroke-width="2"/>` } },
  { id: "triangulos", name: "Triângulos", category: "neutro", tile: { size: 56, svg: (c) => `<path fill="${c}" d="M0 56 28 0l28 56Z" opacity=".55"/>` } },
  { id: "foto", name: "Sua foto", category: "foto" },
];

export const CUSTOM_WALLPAPER_ID = "foto";

export function isWallpaperId(id: string): boolean {
  return WALLPAPERS.some((w) => w.id === id);
}

function tileUri(tile: Tile, colour: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tile.size}" height="${tile.size}" viewBox="0 0 ${tile.size} ${tile.size}">${tile.svg(colour)}</svg>`;
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
  if (!wp?.tile) return palette.bg;
  return `${tileUri(wp.tile, palette.accent)} 0 0 / ${wp.tile.size}px ${wp.tile.size}px repeat, ${palette.bg}`;
}
