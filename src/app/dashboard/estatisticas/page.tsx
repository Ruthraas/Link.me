import { redirect } from "next/navigation";
import { displayHost } from "@/core/safe-url";
import { listMyLinks } from "@/services/links.service";
import { getMyProfile } from "@/services/profile.service";
import { getSessionUser } from "@/services/session.service";
import { lastDays } from "@/services/stats.service";

export const metadata = { title: "Estatísticas" };

const nf = new Intl.NumberFormat("pt-BR");
const pct = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });
const dayLabel = (day: string) => {
  const [, m, d] = day.split("-");
  return `${d}/${m}`;
};

export default async function StatsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/entrar");
  const [profile, links, days] = await Promise.all([getMyProfile(me.id), listMyLinks(me.id), lastDays(me.id, 14)]);
  if (!profile) redirect("/entrar");

  const views14 = days.reduce((s, d) => s + d.views, 0);
  const clicks14 = days.reduce((s, d) => s + d.clicks, 0);
  const allClicks = links.reduce((s, l) => s + l.clicks, 0);
  const rate = views14 ? clicks14 / views14 : null;
  const max = Math.max(1, ...days.map((d) => Math.max(d.views, d.clicks)));
  const ranked = [...links].sort((a, b) => b.clicks - a.clicks);
  const best = ranked[0];

  const W = 700, H = 220, PAD = 28;
  const slot = (W - PAD) / days.length;
  const bar = Math.min(18, slot / 2 - 3);

  return (
    <div className="dash-single">
      <header className="dash-title">
        <h1>Estatísticas</h1>
        <p>
          {views14 === 0
            ? "Ninguém abriu sua página nos últimos 14 dias. Coloque link.me/" + profile.username + " na bio do Instagram."
            : best && best.clicks > 0
              ? `"${best.title}" é o link mais clicado, com ${nf.format(best.clicks)} ${best.clicks === 1 ? "clique" : "cliques"} desde que foi criado.`
              : "Sua página teve visitas, mas nenhum clique ainda."}
        </p>
      </header>

      <section className="panel" aria-labelledby="kpi-h">
        <h2 id="kpi-h" className="visually-hidden">Resumo dos últimos 14 dias</h2>
        <dl className="kpis">
          <div><dt>Visitas, 14 dias</dt><dd>{nf.format(views14)}</dd></div>
          <div><dt>Cliques, 14 dias</dt><dd>{nf.format(clicks14)}</dd></div>
          <div><dt>Cliques por visita</dt><dd>{rate === null ? "–" : pct.format(rate)}</dd></div>
          <div><dt>Visitas desde o início</dt><dd>{nf.format(profile.viewCount)}</dd></div>
        </dl>
      </section>

      <section className="panel" aria-labelledby="chart-h">
        <div className="panel-head">
          <h2 id="chart-h">Por dia</h2>
          <p className="legend">
            <span><i className="lg-views" /> Visitas</span>
            <span><i className="lg-clicks" /> Cliques</span>
          </p>
        </div>
        <svg className="chart" viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label={`Visitas e cliques por dia, de ${dayLabel(days[0].day)} a ${dayLabel(days[days.length - 1].day)}`}>
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={PAD} x2={W} y1={H - t * (H - 10)} y2={H - t * (H - 10)} className="chart-grid" />
              <text x={0} y={H - t * (H - 10) + 4} className="chart-axis">{Math.round(max * t)}</text>
            </g>
          ))}
          {days.map((d, i) => {
            const x = PAD + i * slot + slot / 2;
            const hv = (d.views / max) * (H - 10);
            const hc = (d.clicks / max) * (H - 10);
            return (
              <g key={d.day}>
                <title>{`${dayLabel(d.day)}: ${d.views} visitas, ${d.clicks} cliques`}</title>
                <rect x={x - bar - 1} y={H - hv} width={bar} height={Math.max(hv, d.views ? 2 : 0)} rx={bar / 2} className="bar-views" />
                <rect x={x + 1} y={H - hc} width={bar} height={Math.max(hc, d.clicks ? 2 : 0)} rx={bar / 2} className="bar-clicks" />
                {i % 2 === (days.length - 1) % 2 ? <text x={x} y={H + 18} textAnchor="middle" className="chart-axis">{dayLabel(d.day)}</text> : null}
              </g>
            );
          })}
        </svg>
      </section>

      <section className="panel" aria-labelledby="links-h">
        <h2 id="links-h">Cliques por link</h2>
        {ranked.length ? (
          <table className="table">
            <thead>
              <tr><th scope="col">Link</th><th scope="col">Destino</th><th scope="col" className="num">Cliques</th><th scope="col" className="num">Parte do total</th></tr>
            </thead>
            <tbody>
              {ranked.map((l) => (
                <tr key={l.id} className={l.enabled ? "" : "is-off"}>
                  <td>{l.title}{l.enabled ? "" : " (escondido)"}</td>
                  <td className="muted">{displayHost(l.url)}</td>
                  <td className="num">{nf.format(l.clicks)}</td>
                  <td className="num">{allClicks ? pct.format(l.clicks / allClicks) : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="panel-sub">Adicione links para ver quais recebem mais cliques.</p>
        )}
      </section>
    </div>
  );
}
