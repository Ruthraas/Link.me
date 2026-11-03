"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTheme } from "@/core/themes";
import { ProfileView } from "@/ui/profile/ProfileView";
import { SAMPLES } from "./samples";

type PreviewMode = "own" | "light" | "dark";
const AUTOPLAY_MS = 4500;

/**
 * Theme carousel: swipe, drag-scroll, arrows, dots, keyboard and the clickable
 * list all move the same scroll-snap track. Autoplay stops for good once the
 * visitor touches anything, and never runs with reduced motion.
 */
export function ThemeShowcase() {
  const track = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<PreviewMode>("own");
  const [hovering, setHovering] = useState(false);
  const [touched, setTouched] = useState(false);

  const current = SAMPLES[active];
  const theme = getTheme(current.profile.themeId);
  const shownMode = mode === "own" ? current.profile.mode : mode;
  const palette = shownMode === "dark" ? theme.dark : theme.light;

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const go = useCallback((index: number) => {
    const el = track.current;
    if (!el) return;
    const n = SAMPLES.length;
    const slide = el.children[((index % n) + n) % n] as HTMLElement | undefined;
    if (!slide) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: slide.offsetLeft - (el.clientWidth - slide.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
  }, []);

  // The slide nearest the centre is the active one.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const centre = el.scrollLeft + el.clientWidth / 2;
        let best = 0;
        let distance = Infinity;
        Array.from(el.children).forEach((child, i) => {
          const c = child as HTMLElement;
          const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - centre);
          if (d < distance) { distance = d; best = i; }
        });
        setActive(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, []);

  // Autoplay while nobody is looking closely.
  useEffect(() => {
    if (touched || hovering) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => go(activeRef.current + 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [touched, hovering, go]);

  const userGo = (index: number) => { setTouched(true); go(index); };

  return (
    <section id="temas" className="show" aria-labelledby="show-h">
      <div className="show-head">
        <div>
          <h2 id="show-h">Escolha um tema</h2>
          <p>Deslize, clique num nome ou use as setas. Cada exemplo é uma página de verdade.</p>
        </div>
        <div className="seg show-mode" role="radiogroup" aria-label="Modo dos exemplos">
          {(["own", "light", "dark"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>
              {m === "own" ? "Original" : m === "light" ? "Claro" : "Escuro"}
            </button>
          ))}
        </div>
      </div>

      <div className="show-body">
        <ul className="show-list" aria-label="Temas">
          {SAMPLES.map((s, i) => (
            <li key={s.profile.username}>
              <button type="button" aria-current={i === active || undefined} onClick={() => userGo(i)}>
                <span className="show-swatch" style={{ background: getTheme(s.profile.themeId).light.btn }} aria-hidden="true" />
                {getTheme(s.profile.themeId).name}
                <span className="show-who">{s.profile.displayName}</span>
              </button>
            </li>
          ))}
        </ul>

        <div
          className="show-carousel"
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onFocus={() => setHovering(true)}
          onBlur={() => setHovering(false)}
        >
          <div className="show-disc" style={{ background: palette.btn }} aria-hidden="true" />
          <div
            ref={track}
            className="show-track"
            tabIndex={0}
            role="region"
            aria-roledescription="carrossel"
            aria-label="Páginas de exemplo"
            onPointerDown={() => setTouched(true)}
            onWheel={() => setTouched(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") { e.preventDefault(); userGo(active + 1); }
              if (e.key === "ArrowLeft") { e.preventDefault(); userGo(active - 1); }
            }}
          >
            {SAMPLES.map((s, i) => (
              <div
                key={s.profile.username}
                className="show-slide"
                data-on={i === active || undefined}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${SAMPLES.length}: ${getTheme(s.profile.themeId).name}`}
                onClick={() => i !== active && userGo(i)}
              >
                <div className="show-phone" data-ui>
                  <ProfileView profile={s.profile} preview headingLevel={0} forceMode={mode === "own" ? undefined : mode} />
                </div>
              </div>
            ))}
          </div>

          <div className="show-controls">
            <button type="button" className="show-arrow" onClick={() => userGo(active - 1)} aria-label="Tema anterior">←</button>
            <div className="show-dots">
              {SAMPLES.map((s, i) => (
                <button
                  key={s.profile.username}
                  type="button"
                  aria-label={`Ir para ${getTheme(s.profile.themeId).name}`}
                  aria-current={i === active || undefined}
                  onClick={() => userGo(i)}
                />
              ))}
            </div>
            <button type="button" className="show-arrow" onClick={() => userGo(active + 1)} aria-label="Próximo tema">→</button>
          </div>
          <p className="show-fact" aria-live="polite">{current.fact}</p>
        </div>
      </div>
    </section>
  );
}
