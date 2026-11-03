"use client";

import { useState } from "react";
import { getTheme } from "@/core/themes";
import { ProfileView } from "@/ui/profile/ProfileView";
import { SAMPLES } from "./samples";

/**
 * The live thing: pick a page from the list and see it, dressed in its theme,
 * standing on a disc of the theme's own colour. Hover previews, click keeps.
 */
export function ThemeShowcase() {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? active;
  const current = SAMPLES[shown];
  const theme = getTheme(current.profile.themeId);
  const palette = current.profile.mode === "dark" ? theme.dark : theme.light;

  return (
    <section id="temas" className="show" aria-labelledby="show-h">
      <div className="show-stage">
        <div className="show-disc" style={{ background: palette.btn }} aria-hidden="true" />
        <div className="show-phone" data-ui>
          {SAMPLES.map((s, i) => (
            <div key={s.profile.username} className="show-layer" data-on={i === shown || undefined} aria-hidden={i !== shown}>
              <ProfileView profile={s.profile} preview headingLevel={0} />
            </div>
          ))}
        </div>
        <p className="show-fact" aria-live="polite">{current.fact}</p>
      </div>

      <div className="show-list">
        <h2 id="show-h">Escolha um tema</h2>
        <ul role="listbox" aria-label="Páginas de exemplo" onMouseLeave={() => setHover(null)}>
          {SAMPLES.map((s, i) => (
            <li key={s.profile.username}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                data-shown={i === shown || undefined}
                onClick={() => setActive(i)}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              >
                {getTheme(s.profile.themeId).name}
                <span className="show-who">{s.profile.displayName}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
