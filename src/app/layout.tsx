import type { Metadata, Viewport } from "next";
import { Caveat, Fredoka, Oswald, Playfair_Display, Schibsted_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const schibsted = Schibsted_Grotesk({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--font-schibsted" });
const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-fredoka", preload: false });
const caveat = Caveat({ subsets: ["latin"], weight: ["600"], variable: "--font-caveat", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-playfair", preload: false });
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-oswald", preload: false });

/** Site URL from the environment, tolerant of stray BOM/whitespace; falls back to localhost. */
function siteUrl(): URL {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/^﻿/, "").trim();
  try {
    return new URL(raw || "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: "link.me: todos os seus links numa página redonda", template: "%s · link.me" },
  description: "Crie sua página de links com foto redonda, temas fofos ou masculinos, modo claro ou escuro e wallpaper do seu jeito.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#cbe4f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d0e" },
  ],
};

export type UiTheme = "light" | "dark" | "system";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const stored = (await cookies()).get("lm_ui")?.value;
  const ui: UiTheme = stored === "light" || stored === "dark" ? stored : "system";
  const fonts = [schibsted, fredoka, caveat, playfair, oswald].map((f) => f.variable).join(" ");
  return (
    <html lang="pt-BR" data-theme={ui} className={fonts}>
      <body>{children}</body>
    </html>
  );
}
