import { redirect } from "next/navigation";
import { countSessions, getSessionUser } from "@/services/session.service";
import { AccountForms } from "@/ui/dashboard/AccountForms";
import { UiThemeToggle } from "@/ui/dashboard/UiThemeToggle";

export const metadata = { title: "Conta e segurança" };

export default async function AccountPage() {
  const me = await getSessionUser();
  if (!me) redirect("/entrar");
  const sessions = await countSessions(me.id);
  return (
    <div className="dash-single">
      <header className="dash-title">
        <h1>Conta e segurança</h1>
        <p>Conectado como <strong>{me.email}</strong> · {sessions} {sessions === 1 ? "aparelho conectado" : "aparelhos conectados"}</p>
      </header>
      <section className="panel" aria-labelledby="ui-h">
        <h2 id="ui-h">Tema do painel</h2>
        <p className="panel-sub">Só muda o painel e o site. A sua página pública usa o modo escolhido em Aparência.</p>
        <UiThemeToggle />
      </section>
      <AccountForms sessions={sessions} />
      <section className="panel" aria-labelledby="sec-h">
        <h2 id="sec-h">Como protegemos sua conta</h2>
        <ul className="dot-list">
          <li><span className="dot" /> Senha guardada com scrypt e sal aleatório; nem nós conseguimos lê-la.</li>
          <li><span className="dot" /> Senhas que já vazaram na internet são recusadas (consulta anônima ao Have I Been Pwned).</li>
          <li><span className="dot" /> Cinco tentativas erradas de login bloqueiam a conta por 15 minutos.</li>
          <li><span className="dot" /> Sessão em cookie HttpOnly e Secure; o banco guarda só o hash do token.</li>
          <li><span className="dot" /> Trocar a senha desconecta todos os outros aparelhos.</li>
          <li><span className="dot" /> Links passam por validação: nada de javascript:, redes privadas ou senha embutida na URL.</li>
          <li><span className="dot" /> Fotos são reprocessadas e perdem a localização GPS e os dados da câmera.</li>
        </ul>
      </section>
    </div>
  );
}
