"use client";

import { useState } from "react";

/* ---------------- feature bands with real switches ---------------- */

export type Feature = { sentence: string; consequence: string; field: string };

export function FeatureBands({ features }: { features: Feature[] }) {
  const [on, setOn] = useState<boolean[]>(features.map((_, i) => i < 2));
  return (
    <section id="recursos" className="bands" aria-label="Recursos">
      {features.map((f, i) => (
        <div key={f.sentence} data-reveal className="band" data-on={on[i] || undefined} style={{ ["--band" as string]: f.field }}>
          <div className="band-text">
            <h3 id={`band-${i}`}>{f.sentence}</h3>
            <p className="band-more" aria-hidden={!on[i]}>{f.consequence}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={on[i]}
            aria-labelledby={`band-${i}`}
            className="band-switch"
            data-ui
            onClick={() => setOn((cur) => cur.map((v, j) => (j === i ? !v : v)))}
          >
            <span />
          </button>
        </div>
      ))}
    </section>
  );
}

/* ---------------- drag through the stages ---------------- */

const STAGES = [
  { name: "Endereço", clause: "Escolha seu endereço" },
  { name: "Links", clause: "Cole seus links" },
  { name: "Visual", clause: "Vista a sua página" },
  { name: "Compartilhar", clause: "Ponha na sua bio" },
];

export function StageSlider() {
  const [stage, setStage] = useState(0);
  return (
    <section id="como-funciona" className="stages" aria-labelledby="stage-h">
      <div className="stages-clause">
        <h2 id="stage-h" key={stage} className="fade-swap">{STAGES[stage].clause}</h2>
        <ol className="stages-names">
          {STAGES.map((s, i) => (
            <li key={s.name} data-on={i === stage || undefined}>
              <button type="button" onClick={() => setStage(i)}>{s.name}</button>
            </li>
          ))}
        </ol>
      </div>
      <div className="stages-ui">
        <div className="frag fade-swap" key={stage} data-ui>
          {stage === 0 ? <FragAddress /> : stage === 1 ? <FragLinks /> : stage === 2 ? <FragLook /> : <FragShare />}
        </div>
      </div>
      <div className="stages-track">
        <label htmlFor="stage-range" className="visually-hidden">Etapa</label>
        <input
          id="stage-range"
          type="range"
          min={0}
          max={3}
          step={1}
          value={stage}
          onChange={(e) => setStage(Number(e.target.value))}
          style={{ ["--fill" as string]: `${(stage / 3) * 100}%` }}
          aria-valuetext={STAGES[stage].name}
        />
      </div>
    </section>
  );
}

function FragAddress() {
  return (
    <div className="frag-card">
      <p className="frag-title">Seu endereço</p>
      <p className="frag-input"><span>link.me/</span>ana.luz</p>
      <p className="frag-ok"><span className="dot" /> Disponível</p>
      <p className="frag-btn">Criar minha página</p>
    </div>
  );
}
function FragLinks() {
  return (
    <div className="frag-card">
      <p className="frag-title">Links</p>
      {[["IG", "Meu Instagram", "instagram.com"], ["WA", "Pedidos no WhatsApp", "wa.me"], ["", "Cardápio da semana", "anaduz.com.br"]].map(([b, t, h]) => (
        <div className="frag-row" key={t}>
          <span className="frag-badge">{b}</span>
          <span className="frag-row-text"><strong>{t}</strong><span>{h}</span></span>
          <span className="frag-switch" />
        </div>
      ))}
    </div>
  );
}
function FragLook() {
  const tiles = [["#ffe4ec", "#ff4f84", "Morango"], ["#efe7ff", "#8a66ff", "Lavanda"], ["#e4e6e9", "#1d2026", "Grafite"], ["#e1edf7", "#14507e", "Oceano"]];
  return (
    <div className="frag-card">
      <p className="frag-title">Tema</p>
      <div className="frag-tiles">
        {tiles.map(([bg, btn, name], i) => (
          <span key={name} className="frag-tile" data-on={i === 0 || undefined}>
            <span className="frag-tile-sw" style={{ background: bg }}>
              <span style={{ background: btn }} />
            </span>
            {name}
          </span>
        ))}
      </div>
      <p className="frag-seg"><span data-on>Claro</span><span>Escuro</span><span>Igual ao visitante</span></p>
    </div>
  );
}
function FragShare() {
  return (
    <div className="frag-card">
      <p className="frag-title">Pronto para compartilhar</p>
      <p className="frag-input"><span>link.me/</span>ana.luz</p>
      <p className="frag-btn">Link copiado</p>
      <p className="frag-note">Cole na bio do Instagram, do TikTok ou no status do WhatsApp.</p>
    </div>
  );
}

/* ---------------- FAQ as tabbed index cards ---------------- */

export type Faq = { tab: string; q: string; a: string };

export function FaqCards({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq-stack">
      {items.map((item, i) => (
        <div key={item.q} data-reveal className="faq-card" data-open={i === open || undefined} style={{ ["--i" as string]: i }}>
          <span className="faq-tab" aria-hidden="true">{item.tab}</span>
          <h3>
            <button type="button" aria-expanded={i === open} aria-controls={`faq-${i}`} onClick={() => setOpen(i)}>
              {item.q}
            </button>
          </h3>
          <div id={`faq-${i}`} className="faq-answer" hidden={i !== open}>
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- the CTA's open dialog ---------------- */

export function CtaDialog() {
  const [handle, setHandle] = useState("ana.luz");
  const [style, setStyle] = useState<"fofo" | "masculino" | "neutro">("fofo");
  const href = `/criar-conta?u=${encodeURIComponent(handle)}&estilo=${style}`;
  return (
    <form className="cta-dialog" data-ui action="/criar-conta" method="get">
      <p className="cta-dialog-title">Escolha seu endereço</p>
      <label className="cta-field">
        <span>link.me/</span>
        <input
          name="u"
          value={handle}
          onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 30))}
          aria-label="Seu endereço"
          autoComplete="off"
        />
      </label>
      <fieldset className="cta-seg">
        <legend>Estilo inicial</legend>
        {(["fofo", "masculino", "neutro"] as const).map((s) => (
          <label key={s} data-on={style === s || undefined}>
            <input type="radio" name="estilo" value={s} checked={style === s} onChange={() => setStyle(s)} />
            {s === "fofo" ? "Fofo" : s === "masculino" ? "Masculino" : "Neutro"}
          </label>
        ))}
      </fieldset>
      <a className="btn cta-go" href={href}>Criar link.me/{handle || "voce"}</a>
    </form>
  );
}
