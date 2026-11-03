import Link from "next/link";
import "./simple.css";

export default function NotFound() {
  return (
    <main className="simple">
      <Link href="/" className="simple-mark">link.me</Link>
      <div className="simple-disc" aria-hidden="true" />
      <section className="simple-card">
        <h1>Ninguém aqui</h1>
        <p className="simple-lead">Esse endereço ainda está livre. Pode ser o seu.</p>
        <div className="simple-actions">
          <Link className="btn btn-accent" href="/criar-conta">Criar minha página</Link>
          <Link className="btn btn-quiet" href="/">Início</Link>
        </div>
      </section>
    </main>
  );
}
