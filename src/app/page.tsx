import Link from "next/link";
import { THEMES } from "@/core/themes";
import { WALLPAPERS } from "@/core/wallpapers";
import { getSessionUser } from "@/services/session.service";
import { UiThemeToggle } from "@/ui/dashboard/UiThemeToggle";
import { CtaDialog, FaqCards, FeatureBands, StageSlider, type Faq, type Feature } from "@/ui/landing/Interactive";
import { CREDITS } from "@/ui/landing/samples";
import { ThemeShowcase } from "@/ui/landing/ThemeShowcase";
import "@/ui/landing/landing.css";

const ROUND_FILES = ["flores", "ruysch", "onda", "floresta", "moto", "livros"];
const patternCount = WALLPAPERS.filter((w) => w.tile).length;
const fofos = THEMES.filter((t) => t.category === "fofo").length;
const masculinos = THEMES.filter((t) => t.category === "masculino").length;

const FEATURES: Feature[] = [
  { sentence: "Sua foto fica redonda no topo.", consequence: "Recortamos em 512 × 512 e apagamos o GPS e os dados da câmera.", field: "#ffc013" },
  { sentence: "Sua página escurece à noite.", consequence: `Os ${THEMES.length} temas têm versão clara e escura, ou seguem o celular de quem visita.`, field: "#cbe4f2" },
  { sentence: "O fundo tem a sua cara.", consequence: `${patternCount} wallpapers desenhados nas cores do tema, ou uma foto sua.`, field: "#f6c7e6" },
  { sentence: "Link suspeito não entra.", consequence: "Bloqueamos javascript:, redes privadas e endereços com senha embutida.", field: "#c9ecd9" },
  { sentence: "Você vê o que foi clicado.", consequence: "Visitas e cliques por dia nos últimos 14 dias, link por link.", field: "#f1e3b5" },
];

const FAQ: Faq[] = [
  { tab: "Preço", q: "Quanto custa?", a: "Nada. Criar a página, usar todos os temas, wallpapers e estatísticas é grátis." },
  { tab: "Senha", q: "Minha senha está segura?", a: "Guardamos só um hash scrypt com sal aleatório. Recusamos senhas que já vazaram e bloqueamos o login por 15 minutos depois de 5 erros." },
  { tab: "Fotos", q: "O que acontece com a minha foto?", a: "Ela é reprocessada no servidor: vira WebP, perde a localização GPS e os dados da câmera, e só então vai para a sua página." },
  { tab: "Avisos", q: "Posso pôr link de conteúdo adulto?", a: "Pode, marcando o link como sensível. Quem clicar vê um aviso com o endereço de destino antes de sair do link.me." },
  { tab: "Endereço", q: "Dá para trocar meu endereço depois?", a: "Dá, na aba Aparência do painel. O endereço antigo fica livre para outra pessoa, então atualize a bio das suas redes." },
  { tab: "Sair", q: "Como apago tudo?", a: "Em Conta e segurança, confirme sua senha e digite EXCLUIR. Página, links, fotos e estatísticas somem na hora." },
];

export default async function LandingPage() {
  const signedIn = !!(await getSessionUser());
  return (
    <>
      <header className="hero">
        <div className="hero-top">
          <UiThemeToggle className="hero-ui" />
          <Link href="/" className="hero-mark">link.me</Link>
          <Link href={signedIn ? "/dashboard" : "/entrar"} className="hero-login">{signedIn ? "Meu painel" : "Entrar"}</Link>
        </div>
        <h1 className="hero-title">link.me</h1>
        <p className="hero-lead">
          Uma página com todos os seus links e a sua foto redonda no topo. {fofos} temas fofos, {masculinos} masculinos, claro ou escuro.
        </p>
        <nav className="folders" aria-label="Seções">
          <a href="#temas" className="folder f1"><span className="tab">Temas</span></a>
          <a href="#recursos" className="folder f2"><span className="tab">Recursos</span></a>
          <a href="#como-funciona" className="folder f3"><span className="tab">Como funciona</span></a>
          <a href="#duvidas" className="folder f4"><span className="tab">Dúvidas</span></a>
          <div className="folder f5">
            <span className="tab">Criar</span>
            <Link href={signedIn ? "/dashboard" : "/criar-conta"} className="btn hero-cta">
              {signedIn ? "Abrir meu painel" : "Criar minha página grátis"}
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <ThemeShowcase />
        <FeatureBands features={FEATURES} />

        <section className="round" aria-labelledby="round-h">
          <div className="round-head" data-reveal>
            <h2 id="round-h">Qualquer foto vira círculo</h2>
            <p>Envie o retrato, o logo ou o quadro que quiser. O link.me centraliza no que importa e recorta redondo.</p>
          </div>
          <ul className="round-row">
            {CREDITS.map((c, i) => (
              <li key={c.page} data-reveal>
                {/* eslint-disable-next-line @next/next/no-img-element -- static, pre-sized WebP */}
                <img src={`/samples/${ROUND_FILES[i]}.webp`} alt={`${c.title}, ${c.creator}, recortado em círculo`} width={480} height={480} loading="lazy" decoding="async" />
                <p><strong>{c.title}</strong>{c.creator}, {c.date}</p>
              </li>
            ))}
          </ul>
        </section>
        <StageSlider />

        <section id="duvidas" className="faq" aria-labelledby="faq-h">
          <h2 id="faq-h" data-reveal>Dúvidas comuns</h2>
          <FaqCards items={FAQ} />
        </section>

        <section className="cta" aria-labelledby="cta-h">
          <div className="cta-copy" data-reveal>
            <h2 id="cta-h">Sua página redonda</h2>
            <p>O botão cria sua conta com esse endereço. Depois é só colar os links e escolher o tema.</p>
          </div>
          <CtaDialog />
        </section>
      </main>

      <footer className="foot">
        <div className="foot-mark" aria-label="link.me">
          {"link.me".split("").map((ch, i) => (
            <span key={i} className={`fm fm-${i}`} aria-hidden="true">{ch}</span>
          ))}
        </div>
        <div className="foot-cols">
          <div>
            <h3>Produto</h3>
            <ul>
              <li><a href="#temas">Temas</a></li>
              <li><a href="#recursos">Recursos</a></li>
              <li><a href="#como-funciona">Como funciona</a></li>
              <li><a href="#duvidas">Dúvidas</a></li>
            </ul>
          </div>
          <div>
            <h3>Conta</h3>
            <ul>
              <li><Link href="/entrar">Entrar</Link></li>
              <li><Link href="/criar-conta">Criar conta</Link></li>
              <li><Link href="/dashboard/conta">Segurança</Link></li>
            </ul>
          </div>
          <div className="foot-credits">
            <h3>Imagens dos exemplos</h3>
            <p>
              Fotos de perfil dos exemplos são obras em domínio público, via Wikimedia Commons:{" "}
              {CREDITS.map((c, i) => (
                <span key={c.page}>
                  <a href={c.page} rel="noopener noreferrer">{c.title}</a>, {c.creator}, {c.date}{i < CREDITS.length - 1 ? "; " : "."}
                </span>
              ))}
            </p>
          </div>
        </div>
        <div className="foot-last">
          <p>© {new Date().getFullYear()} link.me</p>
          <Link href="/criar-conta" className="btn btn-accent btn-small">Criar página</Link>
        </div>
      </footer>
    </>
  );
}
