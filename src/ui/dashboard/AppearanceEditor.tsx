"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { removeImageAction, updateAppearanceAction, updateProfileAction, uploadImageAction } from "@/app/actions/dashboard.actions";
import { initials, type ProfileData } from "@/core/profile";
import { BUTTONS, CATEGORY_LABEL, FONTS, getTheme, MODES, THEMES, type ProfileMode, type ThemeCategory } from "@/core/themes";
import { CUSTOM_WALLPAPER_ID, WALLPAPERS, wallpaperBackground } from "@/core/wallpapers";
import { profileStyle } from "@/ui/profile/ProfileView";
import { PhonePreview } from "./PhonePreview";
import { resizeImage } from "./resize-image";

type SaveState = "idle" | "saving" | "saved" | "error";

export function AppearanceEditor({ initial }: { initial: ProfileData }) {
  const [profile, setProfile] = useState(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const firstRender = useRef(true);

  const appearanceKey = [profile.themeId, profile.mode, profile.wallpaperId, profile.buttonStyle, profile.fontId].join("|");

  // Autosave appearance 500ms after the last change.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setSaveState("saving");
    const timer = setTimeout(async () => {
      const res = await updateAppearanceAction({
        themeId: profile.themeId,
        mode: profile.mode,
        wallpaperId: profile.wallpaperId,
        buttonStyle: profile.buttonStyle,
        fontId: profile.fontId,
      });
      setSaveState(res.ok ? "saved" : "error");
      setSaveError(res.ok ? null : res.error);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the key captures every saved field
  }, [appearanceKey]);

  const set = (patch: Partial<ProfileData>) => setProfile((p) => ({ ...p, ...patch }));

  function pickTheme(id: string) {
    const theme = getTheme(id);
    // A theme brings its own wallpaper, font and button; a photo wallpaper is kept.
    set({
      themeId: theme.id,
      wallpaperId: profile.wallpaperId === CUSTOM_WALLPAPER_ID && profile.wallpaperUrl ? CUSTOM_WALLPAPER_ID : theme.wallpaper,
      fontId: theme.font,
      buttonStyle: theme.button,
    });
  }

  return (
    <div className="dash-split">
      <div className="dash-work">
        <header className="dash-title dash-title-row">
          <div>
            <h1>Aparência</h1>
            <p>Escolha um tema e mude o que quiser. Tudo salva sozinho.</p>
          </div>
          <p className={`save-state save-${saveState}`} role="status">
            {saveState === "saving" ? "Salvando…" : saveState === "saved" ? "Salvo" : saveState === "error" ? saveError : ""}
          </p>
        </header>

        <ProfileSection profile={profile} onChange={set} />
        <ThemeSection profile={profile} onPick={pickTheme} />

        <section className="panel" aria-labelledby="mode-h">
          <h2 id="mode-h">Claro ou escuro</h2>
          <p className="panel-sub">Todo tema tem as duas versões. &quot;Igual ao visitante&quot; segue o celular de quem abre.</p>
          <div className="seg" role="radiogroup" aria-labelledby="mode-h">
            {MODES.map((m) => (
              <button key={m.id} type="button" role="radio" aria-checked={profile.mode === m.id} onClick={() => set({ mode: m.id as ProfileMode })}>
                {m.name}
              </button>
            ))}
          </div>
        </section>

        <WallpaperSection profile={profile} onChange={set} />

        <section className="panel" aria-labelledby="btn-h">
          <h2 id="btn-h">Botões</h2>
          <p className="panel-sub">Cada exemplo já usa as cores e o fundo do seu tema.</p>
          <div className="btn-grid" role="radiogroup" aria-labelledby="btn-h">
            {BUTTONS.map((b) => (
              <button
                key={b.id}
                type="button"
                role="radio"
                aria-checked={profile.buttonStyle === b.id}
                className="btn-choice"
                onClick={() => set({ buttonStyle: b.id })}
              >
                <span className="pv pv-mini" data-mode={profile.mode} style={profileStyle(profile)} aria-hidden="true">
                  <span className={`pv-link btn-${b.id}`}>
                    <span className="pv-badge">IG</span>
                    <span className="pv-title">Meu link</span>
                    <span className="pv-badge-space" />
                  </span>
                </span>
                <span className="btn-choice-name">{b.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="panel" aria-labelledby="font-h">
          <h2 id="font-h">Fonte</h2>
          <div className="choice-grid" role="radiogroup" aria-labelledby="font-h">
            {FONTS.map((f) => (
              <button key={f.id} type="button" role="radio" aria-checked={profile.fontId === f.id} className="choice" onClick={() => set({ fontId: f.id })}>
                <span className="font-sample" style={{ fontFamily: f.cssVar }} aria-hidden="true">Aa</span>
                {f.name}
              </button>
            ))}
          </div>
        </section>
      </div>
      <PhonePreview profile={profile} />
    </div>
  );
}

/* ---------------- profile: photo, name, bio, address ---------------- */

function ProfileSection({ profile, onChange }: { profile: ProfileData; onChange: (p: Partial<ProfileData>) => void }) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [username, setUsername] = useState(profile.username);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; field?: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateProfileAction({ displayName, bio, username });
      if (!res.ok) return setMsg({ ok: false, text: res.error, field: res.field });
      setMsg({ ok: true, text: "Perfil salvo." });
      onChange({ displayName: displayName || res.value.username, bio, username: res.value.username });
    });
  }

  return (
    <section className="panel" aria-labelledby="profile-h">
      <h2 id="profile-h">Perfil</h2>
      <div className="profile-grid">
        <ImagePicker
          kind="avatar"
          label="Foto do perfil"
          url={profile.avatarUrl}
          fallback={initials(profile.displayName)}
          onDone={(url) => onChange({ avatarUrl: url })}
        />
        <form className="profile-fields" onSubmit={save}>
          <div className="field">
            <label htmlFor="pf-name">Nome</label>
            <input id="pf-name" className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
          </div>
          <div className="field">
            <label htmlFor="pf-bio">Bio <span className="hint">{bio.length}/160</span></label>
            <textarea id="pf-bio" className="input" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={3} />
          </div>
          <div className="field">
            <label htmlFor="pf-user">Endereço</label>
            <div className="handle-wrap">
              <span aria-hidden="true">link.me/</span>
              <input
                id="pf-user"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                maxLength={30}
                aria-invalid={msg?.field === "username" || undefined}
              />
            </div>
          </div>
          <div className="row-end">
            <p className={msg?.ok ? "form-ok" : "form-error"} role="status">{msg?.text ?? ""}</p>
            <button className="btn" disabled={pending}>{pending ? "Salvando…" : "Salvar perfil"}</button>
          </div>
        </form>
      </div>
    </section>
  );
}

function ImagePicker({
  kind, label, url, fallback, onDone,
}: { kind: "avatar" | "wallpaper"; label: string; url: string | null; fallback?: string; onDone: (url: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function pick(file: File | undefined) {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      try {
        const blob = await resizeImage(file, kind === "avatar" ? 900 : 2000);
        const fd = new FormData();
        fd.set("kind", kind);
        fd.set("file", blob, "image.webp");
        const res = await uploadImageAction(fd);
        if (!res.ok) return setError(res.error);
        onDone(res.value.url);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Falha no envio.");
      } finally {
        if (input.current) input.current.value = "";
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await removeImageAction(kind);
      if (res.ok) onDone(null);
      else setError(res.error);
    });
  }

  return (
    <div className={`picker picker-${kind}`}>
      <div className="picker-frame" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- internal media route */}
        {url ? <img src={url} alt="" /> : <span>{fallback ?? "+"}</span>}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="visually-hidden" id={`file-${kind}`} onChange={(e) => pick(e.target.files?.[0])} />
      <div className="picker-actions">
        <label htmlFor={`file-${kind}`} className="btn btn-small" aria-disabled={pending}>
          {pending ? "Enviando…" : url ? `Trocar ${label.toLowerCase()}` : `Enviar ${label.toLowerCase()}`}
        </label>
        {url ? <button type="button" className="text-btn" onClick={remove} disabled={pending}>Remover</button> : null}
      </div>
      <p className="hint">JPG, PNG ou WebP até 6 MB. Removemos a localização e os dados da câmera.</p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}

/* ---------------- themes ---------------- */

function ThemeSection({ profile, onPick }: { profile: ProfileData; onPick: (id: string) => void }) {
  const [filter, setFilter] = useState<ThemeCategory | "todos">("todos");
  const shown = THEMES.filter((t) => filter === "todos" || t.category === filter);
  return (
    <section className="panel" aria-labelledby="theme-h">
      <div className="panel-head">
        <h2 id="theme-h">Tema</h2>
        <div className="seg seg-small" role="radiogroup" aria-label="Filtrar temas">
          {(["todos", "fofo", "masculino", "neutro"] as const).map((c) => (
            <button key={c} type="button" role="radio" aria-checked={filter === c} onClick={() => setFilter(c)}>
              {c === "todos" ? "Todos" : CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>
      <div className="theme-grid" role="radiogroup" aria-labelledby="theme-h">
        {shown.map((t) => {
          const pal = profile.mode === "dark" ? t.dark : t.light;
          return (
            <button key={t.id} type="button" role="radio" aria-checked={profile.themeId === t.id} className="theme-tile" onClick={() => onPick(t.id)}>
              <span className="theme-swatch" style={{ background: wallpaperBackground(t.wallpaper, pal) }} aria-hidden="true">
                <span className="theme-disc" style={{ background: pal.btn }} />
                <span className="theme-bar" style={{ background: pal.btn }} />
                <span className="theme-bar short" style={{ background: pal.btn }} />
              </span>
              <span className="theme-name">{t.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- wallpapers ---------------- */

function WallpaperSection({ profile, onChange }: { profile: ProfileData; onChange: (p: Partial<ProfileData>) => void }) {
  const theme = getTheme(profile.themeId);
  const pal = profile.mode === "dark" ? theme.dark : theme.light;
  const patterns = WALLPAPERS.filter((w) => w.id !== CUSTOM_WALLPAPER_ID);
  return (
    <section className="panel" aria-labelledby="wp-h">
      <h2 id="wp-h">Wallpaper</h2>
      <div className="wp-own">
        <ImagePicker
          kind="wallpaper"
          label="Meu wallpaper"
          url={profile.wallpaperUrl}
          onDone={(url) => onChange({ wallpaperUrl: url, wallpaperId: url ? CUSTOM_WALLPAPER_ID : theme.wallpaper })}
        />
        <p className="panel-sub">Envie qualquer imagem sua: ela cobre o fundo da página inteira. Ou escolha um dos fundos abaixo.</p>
      </div>
      <div className="wp-grid" role="radiogroup" aria-labelledby="wp-h">
        {patterns.map((w) => (
          <button key={w.id} type="button" role="radio" aria-checked={profile.wallpaperId === w.id} className="wp-tile" onClick={() => onChange({ wallpaperId: w.id })}>
            <span className="wp-swatch" style={{ background: wallpaperBackground(w.id, pal) }} aria-hidden="true" />
            <span>{w.name}</span>
          </button>
        ))}
        <button
          type="button"
          role="radio"
          aria-checked={profile.wallpaperId === CUSTOM_WALLPAPER_ID}
          className="wp-tile"
          disabled={!profile.wallpaperUrl}
          onClick={() => onChange({ wallpaperId: CUSTOM_WALLPAPER_ID })}
        >
          <span className="wp-swatch" style={{ background: profile.wallpaperUrl ? wallpaperBackground("foto", pal, profile.wallpaperUrl) : pal.bg }} aria-hidden="true" />
          <span>Meu wallpaper</span>
        </button>
      </div>
    </section>
  );
}
