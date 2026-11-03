import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { displayHost, normaliseSafeUrl } from "@/core/safe-url";
import { peekLink } from "@/services/links.service";
import "../../simple.css";

export const metadata: Metadata = { title: "Antes de sair", robots: { index: false } };

export default async function WarningPage({ params }: PageProps<"/aviso/[id]">) {
  const { id } = await params;
  const link = await peekLink(id);
  const url = link ? normaliseSafeUrl(link.url) : null;
  if (!link || !url?.ok) notFound();

  return (
    <main className="simple">
      <div className="simple-disc" aria-hidden="true" />
      <section className="simple-card">
        <h1>Antes de abrir</h1>
        <p className="simple-lead">
          Quem criou esta página marcou este link como sensível. Ele pode ter conteúdo adulto, spoilers ou temas pesados.
        </p>
        <p className="simple-target">
          <span className="dot" /> {link.title}: <strong>{displayHost(url.value)}</strong>
        </p>
        <div className="simple-actions">
          <a className="btn btn-accent" href={url.value} rel="noopener noreferrer nofollow">
            Continuar para {displayHost(url.value)}
          </a>
          <Link className="btn btn-quiet" href="/">Voltar</Link>
        </div>
      </section>
    </main>
  );
}
