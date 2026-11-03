"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions/auth.actions";
import { initials } from "@/core/profile";
import { CopyLink } from "./CopyLink";
import { UiThemeToggle } from "./UiThemeToggle";

const NAV = [
  { href: "/dashboard", label: "Links" },
  { href: "/dashboard/aparencia", label: "Aparência" },
  { href: "/dashboard/estatisticas", label: "Estatísticas" },
  { href: "/dashboard/conta", label: "Conta e segurança" },
];

type Props = { username: string; displayName: string; avatarUrl: string | null; children: React.ReactNode };

export function DashboardShell({ username, displayName, avatarUrl, children }: Props) {
  const pathname = usePathname();
  return (
    <div className="dash">
      <aside className="dash-side">
        <Link href="/dashboard" className="dash-mark" aria-label="link.me, início do painel">
          <span className="dash-mark-disc" aria-hidden="true" />
          link.me
        </Link>

        <div className="dash-me">
          <span className="dash-me-avatar" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- internal media route */}
            {avatarUrl ? <img src={avatarUrl} alt="" width={36} height={36} /> : initials(displayName)}
          </span>
          <span className="dash-me-text">
            <strong>{displayName}</strong>
            <span>link.me/{username}</span>
          </span>
        </div>

        <nav aria-label="Painel">
          <ul className="dash-nav">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="dash-side-foot">
          <CopyLink username={username} />
          <a className="dash-view" href={`/${username}`} target="_blank" rel="noopener">Ver minha página</a>
          <UiThemeToggle />
          <form action={signOutAction}>
            <button className="dash-logout">Sair</button>
          </form>
        </div>
      </aside>
      <main className="dash-main">{children}</main>
    </div>
  );
}
