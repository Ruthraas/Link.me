"use client";

import { useActionState, useState, useTransition } from "react";
import { changePasswordAction, deleteAccountAction, signOutOthersAction } from "@/app/actions/auth.actions";
import type { ActionState } from "@/core/result";
import { PASSWORD_MIN } from "@/core/validation";

const initial: ActionState = {};

function Status({ state }: { state: ActionState }) {
  if (state.error) return <p className="form-error" role="alert">{state.error}</p>;
  if (state.message) return <p className="form-ok" role="status">{state.message}</p>;
  return null;
}

export function AccountForms({ sessions }: { sessions: number }) {
  const [pwState, pwAction, pwPending] = useActionState(changePasswordAction, initial);
  const [delState, delAction, delPending] = useActionState(deleteAccountAction, initial);
  const [othersState, setOthersState] = useState<ActionState>({});
  const [othersPending, startOthers] = useTransition();

  return (
    <>
      <section className="panel" aria-labelledby="pw-h">
        <h2 id="pw-h">Trocar senha</h2>
        <form action={pwAction} className="form-stack">
          <div className="field">
            <label htmlFor="pw-current">Senha atual</label>
            <input id="pw-current" name="current" type="password" className="input" autoComplete="current-password" required maxLength={128} aria-invalid={pwState.field === "current" || undefined} />
          </div>
          <div className="field">
            <label htmlFor="pw-next">Nova senha</label>
            <input id="pw-next" name="next" type="password" className="input" autoComplete="new-password" required minLength={PASSWORD_MIN} maxLength={128} aria-invalid={pwState.field === "next" || undefined} />
            <p className="hint">{PASSWORD_MIN} caracteres ou mais. Uma frase curta é mais forte que uma palavra com símbolos.</p>
          </div>
          <Status state={pwState} />
          <div><button className="btn" disabled={pwPending}>{pwPending ? "Trocando…" : "Trocar senha"}</button></div>
        </form>
      </section>

      <section className="panel" aria-labelledby="sess-h">
        <h2 id="sess-h">Aparelhos conectados</h2>
        <p className="panel-sub">
          {sessions <= 1 ? "Só este aparelho está conectado." : `${sessions} aparelhos estão conectados, contando este.`}
        </p>
        <Status state={othersState} />
        <div>
          <button
            type="button"
            className="btn btn-quiet"
            disabled={othersPending || sessions <= 1}
            onClick={() => startOthers(async () => setOthersState(await signOutOthersAction()))}
          >
            Sair de todos os outros aparelhos
          </button>
        </div>
      </section>

      <section className="panel panel-danger" aria-labelledby="del-h">
        <h2 id="del-h">Excluir conta</h2>
        <p className="panel-sub">Apaga sua página, links, fotos e estatísticas na hora. Não dá para desfazer.</p>
        <form action={delAction} className="form-stack">
          <div className="field">
            <label htmlFor="del-pw">Sua senha</label>
            <input id="del-pw" name="password" type="password" className="input" autoComplete="current-password" required maxLength={128} aria-invalid={delState.field === "password" || undefined} />
          </div>
          <div className="field">
            <label htmlFor="del-confirm">Digite EXCLUIR</label>
            <input id="del-confirm" name="confirm" className="input" autoComplete="off" required aria-invalid={delState.field === "confirm" || undefined} />
          </div>
          <Status state={delState} />
          <div><button className="btn btn-danger" disabled={delPending}>{delPending ? "Excluindo…" : "Excluir minha conta"}</button></div>
        </form>
      </section>
    </>
  );
}
