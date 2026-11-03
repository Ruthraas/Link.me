import { redirect } from "next/navigation";
import { listMyLinks } from "@/services/links.service";
import { getMyProfile } from "@/services/profile.service";
import { getSessionUser } from "@/services/session.service";
import { LinksEditor } from "@/ui/dashboard/LinksEditor";

export const metadata = { title: "Links" };

export default async function LinksPage() {
  const me = await getSessionUser();
  if (!me) redirect("/entrar");
  const [profile, links] = await Promise.all([getMyProfile(me.id), listMyLinks(me.id)]);
  if (!profile) redirect("/entrar");
  return <LinksEditor profile={profile} initialLinks={links} />;
}
