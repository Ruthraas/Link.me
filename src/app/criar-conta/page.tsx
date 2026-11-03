import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/services/session.service";
import { SignUpForm } from "@/ui/auth/AuthForms";
import "../simple.css";
import "../auth.css";

export const metadata: Metadata = { title: "Criar conta" };

export default async function SignUpPage({ searchParams }: PageProps<"/criar-conta">) {
  if (await getSessionUser()) redirect("/dashboard");
  const sp = await searchParams;
  const username = typeof sp.u === "string" ? sp.u.toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 30) : "";
  const style = sp.estilo === "fofo" || sp.estilo === "masculino" ? sp.estilo : "";
  return (
    <main className="simple">
      <Link href="/" className="simple-mark">link.me</Link>
      <div className="simple-disc simple-disc-pink" aria-hidden="true" />
      <section className="simple-card">
        <h1>Criar sua página</h1>
        <SignUpForm username={username} style={style} />
      </section>
    </main>
  );
}
