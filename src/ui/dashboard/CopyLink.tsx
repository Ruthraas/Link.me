"use client";

import { useState } from "react";

export function CopyLink({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    const url = `${window.location.origin}/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copie seu link:", url);
    }
  }
  return (
    <button type="button" className="btn btn-accent btn-small dash-copy" onClick={copy} aria-live="polite">
      {copied ? "Link copiado" : "Copiar meu link"}
    </button>
  );
}
