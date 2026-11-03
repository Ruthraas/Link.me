"use client";

import { useMemo, useState, useTransition } from "react";
import {
  createLinkAction,
  deleteLinkAction,
  editLinkAction,
  reorderLinksAction,
  toggleLinkAction,
} from "@/app/actions/dashboard.actions";
import { platformBadge } from "@/core/platforms";
import type { ProfileData } from "@/core/profile";
import { displayHost } from "@/core/safe-url";
import type { LinkDTO } from "@/services/links.service";
import { PhonePreview } from "./PhonePreview";

type Props = { profile: Omit<ProfileData, "links">; initialLinks: LinkDTO[] };

export function LinksEditor({ profile, initialLinks }: Props) {
  const [links, setLinks] = useState(initialLinks);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const preview: ProfileData = useMemo(
    () => ({
      ...profile,
      links: links
        .filter((l) => l.enabled)
        .map((l) => ({ id: l.id, title: l.title, href: l.url, badge: platformBadge(l.url), sensitive: l.sensitive })),
    }),
    [profile, links],
  );

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  function persistOrder(next: LinkDTO[]) {
    const before = links;
    setLinks(next);
    startTransition(async () => {
      const res = await reorderLinksAction(next.map((l) => l.id));
      if (!res.ok) { setLinks(before); setError(res.error); }
    });
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= links.length) return;
    const next = [...links];
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  }

  /* drag and drop (desktop); the arrow buttons cover keyboard and touch */
  const [dragId, setDragId] = useState<string | null>(null);
  function onDrop(overId: string) {
    if (!dragId || dragId === overId) return;
    const next = [...links];
    const from = next.findIndex((l) => l.id === dragId);
    const to = next.findIndex((l) => l.id === overId);
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setDragId(null);
    persistOrder(next);
  }

  return (
    <div className="dash-split">
      <div className="dash-work">
        <header className="dash-title">
          <h1>Links</h1>
          <p>
            {links.length === 0
              ? "Sua página está vazia. Comece pelo link que mais importa."
              : `${links.filter((l) => l.enabled).length} de ${links.length} links aparecem na página · ${totalClicks.toLocaleString("pt-BR")} cliques no total`}
          </p>
        </header>

        <AddLinkForm onAdded={(link) => setLinks((cur) => [link, ...cur])} />

        {error ? <p className="form-error" role="alert">{error}</p> : null}

        {links.length ? (
          <ol className="link-list" aria-label="Seus links, na ordem da página">
            {links.map((link, index) => (
              <LinkRow
                key={link.id}
                link={link}
                first={index === 0}
                last={index === links.length - 1}
                dragging={dragId === link.id}
                onMove={(d) => move(index, d)}
                onDragStart={() => setDragId(link.id)}
                onDrop={() => onDrop(link.id)}
                onChange={(updated) => setLinks((cur) => cur.map((l) => (l.id === updated.id ? updated : l)))}
                onRemove={() => setLinks((cur) => cur.filter((l) => l.id !== link.id))}
              />
            ))}
          </ol>
        ) : (
          <div className="empty-block">
            <span className="empty-disc" aria-hidden="true" />
            <p>Nenhum link ainda. Cole o endereço do seu Instagram, WhatsApp ou loja acima.</p>
          </div>
        )}
      </div>
      <PhonePreview profile={preview} />
    </div>
  );
}

function AddLinkForm({ onAdded }: { onAdded: (link: LinkDTO) => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [sensitive, setSensitive] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createLinkAction({ title, url, sensitive });
      if (!res.ok) return setError({ message: res.error, field: res.field });
      onAdded(res.value);
      setTitle(""); setUrl(""); setSensitive(false);
    });
  }

  return (
    <form className="add-link" onSubmit={submit}>
      <h2 className="visually-hidden">Novo link</h2>
      <div className="field">
        <label htmlFor="new-title">Título</label>
        <input id="new-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Meu Instagram" aria-invalid={error?.field === "title" || undefined} />
      </div>
      <div className="field">
        <label htmlFor="new-url">Endereço</label>
        <input id="new-url" className="input" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={2048} inputMode="url" placeholder="instagram.com/voce" aria-invalid={error?.field === "url" || undefined} />
      </div>
      <label className="check">
        <input type="checkbox" checked={sensitive} onChange={(e) => setSensitive(e.target.checked)} />
        Conteúdo sensível: mostrar um aviso antes de abrir
      </label>
      <div className="add-link-foot">
        <p className="form-error" role="alert">{error?.message ?? ""}</p>
        <button className="btn btn-accent" disabled={pending}>{pending ? "Adicionando…" : "Adicionar link"}</button>
      </div>
    </form>
  );
}

type RowProps = {
  link: LinkDTO;
  first: boolean;
  last: boolean;
  dragging: boolean;
  onMove: (delta: number) => void;
  onDragStart: () => void;
  onDrop: () => void;
  onChange: (link: LinkDTO) => void;
  onRemove: () => void;
};

function LinkRow({ link, first, last, dragging, onMove, onDragStart, onDrop, onChange, onRemove }: RowProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [sensitive, setSensitive] = useState(link.sensitive);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const badge = platformBadge(link.url);

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await editLinkAction(link.id, { title, url, sensitive });
      if (!res.ok) return setError(res.error);
      setError(null);
      setEditing(false);
      onChange(res.value);
    });
  }

  function toggle() {
    const next = { ...link, enabled: !link.enabled };
    onChange(next);
    startTransition(async () => {
      const res = await toggleLinkAction(link.id, next.enabled);
      if (!res.ok) { onChange(link); setError(res.error); }
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteLinkAction(link.id);
      if (res.ok) onRemove();
      else setError(res.error);
    });
  }

  return (
    <li
      className={`link-row${link.enabled ? "" : " is-off"}${dragging ? " is-dragging" : ""}`}
      draggable={!editing}
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="link-order">
        <button type="button" onClick={() => onMove(-1)} disabled={first} aria-label={`Subir ${link.title}`}>↑</button>
        <button type="button" onClick={() => onMove(1)} disabled={last} aria-label={`Descer ${link.title}`}>↓</button>
      </div>

      {editing ? (
        <form className="link-edit" onSubmit={save}>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} aria-label="Título" />
          <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} maxLength={2048} aria-label="Endereço" inputMode="url" />
          <label className="check">
            <input type="checkbox" checked={sensitive} onChange={(e) => setSensitive(e.target.checked)} /> Aviso de conteúdo sensível
          </label>
          <div className="link-edit-actions">
            <button className="btn btn-small" disabled={pending}>Salvar</button>
            <button type="button" className="btn btn-quiet btn-small" onClick={() => { setEditing(false); setTitle(link.title); setUrl(link.url); setSensitive(link.sensitive); setError(null); }}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="link-body">
          <span className="link-badge" aria-hidden="true">{badge}</span>
          <div className="link-text">
            <strong>{link.title}</strong>
            <span>{displayHost(link.url)}{link.sensitive ? " · com aviso" : ""}</span>
          </div>
          <span className="link-clicks" title="Cliques">
            <strong>{link.clicks.toLocaleString("pt-BR")}</strong> {link.clicks === 1 ? "clique" : "cliques"}
          </span>
        </div>
      )}

      <div className="link-actions">
        <button type="button" role="switch" aria-checked={link.enabled} className="switch" onClick={toggle} aria-label={link.enabled ? `Esconder ${link.title}` : `Mostrar ${link.title}`}>
          <span />
        </button>
        {!editing ? <button type="button" className="text-btn" onClick={() => setEditing(true)}>Editar</button> : null}
        {confirming ? (
          <span className="confirm">
            <button type="button" className="text-btn danger" onClick={remove} disabled={pending}>Apagar mesmo</button>
            <button type="button" className="text-btn" onClick={() => setConfirming(false)}>Não</button>
          </span>
        ) : (
          <button type="button" className="text-btn" onClick={() => setConfirming(true)}>Apagar</button>
        )}
      </div>
      {error ? <p className="form-error link-error" role="alert">{error}</p> : null}
    </li>
  );
}
