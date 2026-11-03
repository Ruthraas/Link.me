import { redirect } from "next/navigation";
import { platformBadge } from "@/core/platforms";
import { listMyLinks } from "@/services/links.service";
import { getMyProfile } from "@/services/profile.service";
import { getSessionUser } from "@/services/session.service";
import { AppearanceEditor } from "@/ui/dashboard/AppearanceEditor";

export const metadata = { title: "Aparência" };

export default async function AppearancePage() {
  const me = await getSessionUser();
  if (!me) redirect("/entrar");
  const [profile, links] = await Promise.all([getMyProfile(me.id), listMyLinks(me.id)]);
  if (!profile) redirect("/entrar");
  const previewLinks = links
    .filter((l) => l.enabled)
    .map((l) => ({ id: l.id, title: l.title, href: l.url, badge: platformBadge(l.url), sensitive: l.sensitive }));
  return <AppearanceEditor initial={{ ...profile, links: previewLinks }} />;
}
