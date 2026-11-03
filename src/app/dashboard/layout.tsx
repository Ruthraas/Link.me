import { redirect } from "next/navigation";
import { getMyProfile } from "@/services/profile.service";
import { getSessionUser } from "@/services/session.service";
import { DashboardShell } from "@/ui/dashboard/DashboardShell";
import "@/ui/dashboard/dashboard.css";

export const metadata = { title: "Painel", robots: { index: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getSessionUser();
  if (!me) redirect("/entrar");
  const profile = await getMyProfile(me.id);
  if (!profile) redirect("/entrar");
  return (
    <DashboardShell username={profile.username} displayName={profile.displayName} avatarUrl={profile.avatarUrl}>
      {children}
    </DashboardShell>
  );
}
