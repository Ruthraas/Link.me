import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/services/session.service";
import { SignInForm } from "@/ui/auth/AuthForms";
import "../simple.css";
import "../auth.css";

export const metadata: Metadata = { title: "Entrar" };

export default async function SignInPage({ searchParams }: PageProps<"/entrar">) {
  if (await getSessionUser()) redirect("/dashboard");
  const voltar = (await searchParams).voltar;
  const next = typeof voltar === "string" ? voltar : "/dashboard";
  return (
    <main className="simple">
      <Link href="/" className="simple-mark">link.me</Link>
      <div className="simple-disc" aria-hidden="true" />
      <section className="simple-card">
        <h1>Entrar</h1>
        <SignInForm next={next} />
      </section>
    </main>
  );
}
