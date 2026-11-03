"use client";

import { useState } from "react";
import type { ProfileData } from "@/core/profile";
import { ProfileView } from "@/ui/profile/ProfileView";

/** Live preview of the public page, with a light/dark switch to check both modes. */
export function PhonePreview({ profile }: { profile: ProfileData }) {
  const [mode, setMode] = useState<"stored" | "light" | "dark">("stored");
  return (
    <section className="preview" aria-label="Prévia da sua página">
      <div className="preview-head">
        <h2>Prévia</h2>
        <div className="seg seg-small" role="radiogroup" aria-label="Modo da prévia">
          {(["stored", "light", "dark"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>
              {m === "stored" ? "Como salvo" : m === "light" ? "Claro" : "Escuro"}
            </button>
          ))}
        </div>
      </div>
      <div className="preview-screen" data-ui-fragment>
        <ProfileView profile={profile} preview headingLevel={2} forceMode={mode === "stored" ? undefined : mode} />
      </div>
    </section>
  );
}
