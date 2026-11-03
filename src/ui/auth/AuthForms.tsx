"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signInAction, signUpAction } from "@/app/actions/auth.actions";
import type { ActionState } from "@/core/result";
import { PASSWORD_MIN } from "@/core/validation";

const initial: ActionState = {};

function ErrorLine({ state }: { state: ActionState }) {
  return (
    <p className="form-error" role="alert" aria-live="polite">
      {state.error ?? ""}
    </p>
  );
}

function PasswordField({ invalid, autoComplete }: { invalid: boolean; autoComplete: string }) {
  const [shown, setShown] = useState(false);
  // Controlled so React 19 does not clear it after a failed submit.
  const [value, setValue] = useState("");
  return (
    <div className="field">
      <label htmlFor="password">Senha</label>
      <div className="pw-wrap">
        <input
          id="password"
          name="password"
          type={shown ? "text" : "password"}
          className="input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete={autoComplete}
          required
          minLength={autoComplete === "new-password" ? PASSWORD_MIN : 1}
          maxLength={128}
          aria-invalid={invalid || undefined}
        />
        <button type="button" className="pw-toggle" onClick={() => setShown((v) => !v)} aria-pressed={shown}>
          {shown ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {autoComplete === "new-password" ? (
        <p className="hint">{PASSWORD_MIN} caracteres ou mais. Conferimos se ela já vazou na internet.</p>
      ) : null}
    </div>
  );
}

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signInAction, initial);
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="auth-form" noValidate>
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required maxLength={254} aria-invalid={!!state.error || undefined} />
      </div>
      <PasswordField invalid={!!state.error} autoComplete="current-password" />
      <ErrorLine state={state} />
      <button className="btn btn-accent" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
      <p className="simple-foot">
        Ainda não tem página? <Link href="/criar-conta">Criar conta</Link>
      </p>
    </form>
  );
}

export function SignUpForm({ username, style }: { username: string; style: string }) {
  const [state, action, pending] = useActionState(signUpAction, initial);
  const [handle, setHandle] = useState(username);
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="auth-form" noValidate>
      <input type="hidden" name="style" value={style} />
      <div className="field">
        <label htmlFor="username">Seu endereço</label>
        <div className="handle-wrap">
          <span aria-hidden="true">link.me/</span>
          <input
            id="username"
            name="username"
            className="input"
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
            autoComplete="username"
            required
            minLength={3}
            maxLength={30}
            aria-invalid={state.field === "username" || undefined}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required maxLength={254} aria-invalid={state.field === "email" || undefined} />
      </div>
      <PasswordField invalid={state.field === "password"} autoComplete="new-password" />
      <ErrorLine state={state} />
      <button className="btn btn-accent" disabled={pending}>{pending ? "Criando…" : "Criar minha página"}</button>
      <p className="simple-foot">
        Já tem conta? <Link href="/entrar">Entrar</Link>
      </p>
    </form>
  );
}
