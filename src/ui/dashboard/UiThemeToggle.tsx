"use client";

import { useSyncExternalStore } from "react";

type Ui = "light" | "dark" | "system";
const OPTIONS: { id: Ui; label: string }[] = [
  { id: "light", label: "Claro" },
  { id: "dark", label: "Escuro" },
  { id: "system", label: "Sistema" },
];

/* The <html data-theme> attribute is the single source of truth; the server sets it from the cookie. */
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function read(): Ui {
  const v = document.documentElement.dataset.theme;
  return v === "light" || v === "dark" ? v : "system";
}
function applyUi(next: Ui) {
  document.documentElement.dataset.theme = next;
  document.cookie = `lm_ui=${next}; path=/; max-age=31536000; samesite=lax${location.protocol === "https:" ? "; secure" : ""}`;
  listeners.forEach((cb) => cb());
}

/** Light / dark for the app itself. Stored in a plain cookie so the server renders the right theme with no flash. */
export function UiThemeToggle({ className = "" }: { className?: string }) {
  const ui = useSyncExternalStore(subscribe, read, () => "system" as Ui);
  return (
    <div className={`seg ${className}`} role="radiogroup" aria-label="Tema do site">
      {OPTIONS.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={ui === o.id} onClick={() => applyUi(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
