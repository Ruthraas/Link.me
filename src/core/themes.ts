/**
 * Theme catalogue. Pure data + lookup functions.
 * User input never reaches CSS directly: the DB stores only catalogue ids,
 * and every id is resolved here (unknown ids fall back to the default).
 */

export type Palette = {
  bg: string; // page ground
  ink: string; // text
  muted: string; // secondary text
  btn: string; // link button fill
  btnInk: string; // link button text
  accent: string; // wallpaper pattern colour
};

export type ThemeCategory = "fofo" | "masculino" | "neutro";

export type Theme = {
  id: string;
  name: string;
  category: ThemeCategory;
  light: Palette;
  dark: Palette;
  wallpaper: string;
  font: string;
  button: string;
};

export const CATEGORY_LABEL: Record<ThemeCategory, string> = {
  fofo: "Fofos",
  masculino: "Masculinos",
  neutro: "Neutros",
};

const p = (bg: string, ink: string, muted: string, btn: string, btnInk: string, accent: string): Palette => ({
  bg, ink, muted, btn, btnInk, accent,
});

export const THEMES: Theme[] = [
  // Fofos
  { id: "morango", name: "Morango", category: "fofo", wallpaper: "coracoes", font: "fredoka", button: "pill-solid",
    light: p("#ffe4ec", "#4f1327", "#7d3a52", "#ff4f84", "#ffffff", "#ffc2d4"),
    dark: p("#2a0f19", "#ffe4ec", "#f0a9bf", "#ff5c8a", "#2a0f19", "#4d1d30") },
  { id: "algodao", name: "Algodão-doce", category: "fofo", wallpaper: "bolhas", font: "fredoka", button: "pill-soft",
    light: p("#e8f3ff", "#33264f", "#5d4f80", "#ffb3d9", "#33264f", "#cfe3ff"),
    dark: p("#1d1a33", "#f2eaff", "#c6b9e6", "#ffb3d9", "#1d1a33", "#2f2a52") },
  { id: "lavanda", name: "Lavanda", category: "fofo", wallpaper: "estrelas", font: "fredoka", button: "pill-solid",
    light: p("#efe7ff", "#2f1c57", "#5b4785", "#8a66ff", "#ffffff", "#dacbff"),
    dark: p("#1b1430", "#efe7ff", "#bfaee8", "#b39bff", "#1b1430", "#30244f") },
  { id: "cerejeira", name: "Cerejeira", category: "fofo", wallpaper: "flores", font: "caveat", button: "rounded-solid",
    light: p("#fff1f3", "#4a2330", "#7a4a58", "#f28aa0", "#ffffff", "#fbd3dc"),
    dark: p("#24151a", "#ffe9ee", "#e3b3c0", "#f7a8b8", "#24151a", "#43262f") },
  { id: "pessego", name: "Pêssego", category: "fofo", wallpaper: "bolinhas", font: "fredoka", button: "pill-solid",
    light: p("#fff0e3", "#552a10", "#80502f", "#ff8a52", "#ffffff", "#ffd6bb"),
    dark: p("#2a1810", "#ffe8d6", "#e8b999", "#ff9e6d", "#2a1810", "#4a2e20") },
  { id: "menta", name: "Menta", category: "fofo", wallpaper: "xadrez", font: "fredoka", button: "pill-soft",
    light: p("#e6fbf3", "#123d32", "#3d6a5d", "#3ec79f", "#0b2a21", "#c3f0df"),
    dark: p("#0f2620", "#dcfbee", "#9fd6c1", "#5fd3b0", "#0f2620", "#1d4639") },
  { id: "gatinha", name: "Gatinha", category: "fofo", wallpaper: "xadrez-gatinhas", font: "fredoka", button: "pill-solid",
    light: p("#fff4f8", "#5a1430", "#8a4561", "#ff4f8b", "#ffffff", "#ffd3e2"),
    dark: p("#170d13", "#ffe3ee", "#e8a9c3", "#ff5c93", "#170d13", "#3f1a2d") },
  { id: "gatinha-noturna", name: "Gatinha noturna", category: "fofo", wallpaper: "gatinhas", font: "fredoka", button: "pill-solid",
    light: p("#ffdcea", "#1a0b13", "#5c2c44", "#1a0b13", "#ffc2da", "#ffb6d1"),
    dark: p("#0c090b", "#ffd6e7", "#d99bb7", "#ff7aa8", "#0c090b", "#2b1a24") },
  { id: "laco-vermelho", name: "Laço vermelho", category: "fofo", wallpaper: "lacos-bolinhas", font: "fredoka", button: "pill-solid",
    light: p("#ffffff", "#3a0a10", "#7a3a44", "#e0182d", "#ffffff", "#ffd2d7"),
    dark: p("#140707", "#ffe5e8", "#e3a2aa", "#ff3347", "#140707", "#3a1418") },
  { id: "gotica-fofa", name: "Gótica fofa", category: "fofo", wallpaper: "noite-fofa", font: "fredoka", button: "rounded-solid",
    light: p("#f3e9ff", "#24123a", "#5a4678", "#2a1840", "#ffd1ec", "#dcc6f5"),
    dark: p("#0f0a17", "#f3e3ff", "#b9a3d6", "#b36bff", "#0f0a17", "#2a1d3d") },
  // Masculinos
  { id: "grafite", name: "Grafite", category: "masculino", wallpaper: "carbono", font: "oswald", button: "square-solid",
    light: p("#e4e6e9", "#121418", "#454a53", "#1d2026", "#f2f3f5", "#d3d6db"),
    dark: p("#101215", "#e9eaec", "#a3a8b1", "#2b3038", "#f2f3f5", "#1b1e23") },
  { id: "floresta", name: "Floresta", category: "masculino", wallpaper: "camuflado", font: "oswald", button: "rounded-solid",
    light: p("#e3ece2", "#14281a", "#3f5844", "#2f5d3a", "#eef5ec", "#c8d9c4"),
    dark: p("#0e1a11", "#dfeadc", "#9bb59f", "#3d7449", "#eef5ec", "#1b3021") },
  { id: "oceano", name: "Oceano", category: "masculino", wallpaper: "ondas", font: "schibsted", button: "rounded-solid",
    light: p("#e1edf7", "#0b2135", "#3a5670", "#14507e", "#ffffff", "#c4dbee"),
    dark: p("#081625", "#dcebf7", "#97b5cf", "#1d6aa5", "#ffffff", "#132b44") },
  { id: "garagem", name: "Garagem", category: "masculino", wallpaper: "listras", font: "oswald", button: "hard-shadow",
    light: p("#f1f1ec", "#121212", "#45453f", "#ffcc00", "#121212", "#e0e0d8"),
    dark: p("#121212", "#f1f1ec", "#b5b5ad", "#ffcc00", "#121212", "#232323") },
  { id: "couro", name: "Couro", category: "masculino", wallpaper: "losangos", font: "playfair", button: "square-outline",
    light: p("#efe4d6", "#2c1b10", "#5e4633", "#6b4226", "#f7ecdf", "#e0cdb6"),
    dark: p("#1d130c", "#efe4d6", "#bfa68c", "#8a5a36", "#f7ecdf", "#33231a") },
  { id: "arcade", name: "Arcade", category: "masculino", wallpaper: "grade", font: "schibsted", button: "square-solid",
    light: p("#e6f0f0", "#0a1919", "#365454", "#00a396", "#ffffff", "#c9dede"),
    dark: p("#06090f", "#d9fffb", "#86b8b3", "#00e5d1", "#06090f", "#122230") },
  // Neutros
  { id: "papel", name: "Papel", category: "neutro", wallpaper: "liso", font: "playfair", button: "square-outline",
    light: p("#f6f4ef", "#1c1b19", "#55524c", "#1c1b19", "#f6f4ef", "#e6e2d8"),
    dark: p("#171614", "#f2efe8", "#b3aea4", "#f2efe8", "#171614", "#25231f") },
  { id: "ceu", name: "Céu e areia", category: "neutro", wallpaper: "bolinhas", font: "schibsted", button: "pill-solid",
    light: p("#cbe4f2", "#0a0a0a", "#3c5866", "#0a0a0a", "#ffffff", "#b4d7ea"),
    dark: p("#0b1720", "#cbe4f2", "#8fb2c4", "#cbe4f2", "#0b1720", "#16303f") },
  { id: "sol", name: "Sol", category: "neutro", wallpaper: "triangulos", font: "schibsted", button: "pill-solid",
    light: p("#fff4cc", "#2a2200", "#5f5426", "#ffc013", "#2a2200", "#f8e49c"),
    dark: p("#1f1a05", "#fff2c2", "#d8c98a", "#ffc013", "#1f1a05", "#3a3110") },
];

export const DEFAULT_THEME_ID = "ceu";

export function getTheme(id: string | null | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
}

export function isThemeId(id: string): boolean {
  return THEMES.some((t) => t.id === id);
}

export type ProfileMode = "light" | "dark" | "auto";
export const MODES: { id: ProfileMode; name: string }[] = [
  { id: "light", name: "Claro" },
  { id: "dark", name: "Escuro" },
  { id: "auto", name: "Igual ao visitante" },
];
export function isMode(id: string): id is ProfileMode {
  return id === "light" || id === "dark" || id === "auto";
}

/** Link button shapes. Rendered by CSS classes `btn-<id>`. */
export const BUTTONS: { id: string; name: string }[] = [
  { id: "pill-solid", name: "Pílula" },
  { id: "pill-soft", name: "Pílula suave" },
  { id: "pill-outline", name: "Pílula contorno" },
  { id: "rounded-solid", name: "Arredondado" },
  { id: "rounded-outline", name: "Arredondado contorno" },
  { id: "square-solid", name: "Reto" },
  { id: "square-outline", name: "Reto contorno" },
  { id: "hard-shadow", name: "Sombra dura" },
];
export function isButtonId(id: string): boolean {
  return BUTTONS.some((b) => b.id === id);
}

/** Profile typefaces. CSS variables are set by next/font in the root layout. */
export const FONTS: { id: string; name: string; cssVar: string }[] = [
  { id: "schibsted", name: "Grotesca", cssVar: "var(--font-schibsted)" },
  { id: "fredoka", name: "Redondinha", cssVar: "var(--font-fredoka)" },
  { id: "caveat", name: "Escrita à mão", cssVar: "var(--font-caveat)" },
  { id: "playfair", name: "Elegante", cssVar: "var(--font-playfair)" },
  { id: "oswald", name: "Condensada", cssVar: "var(--font-oswald)" },
];
export function getFont(id: string | null | undefined) {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}
export function isFontId(id: string): boolean {
  return FONTS.some((f) => f.id === id);
}
