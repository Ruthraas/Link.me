import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { cache } from "react";
import { isBot } from "@/infra/request";
import { getPublicProfile } from "@/services/profile.service";
import { recordView } from "@/services/stats.service";
import { ProfileView } from "@/ui/profile/ProfileView";

const load = cache((username: string) => getPublicProfile(decodeURIComponent(username)));

export async function generateMetadata({ params }: PageProps<"/[username]">): Promise<Metadata> {
  const data = await load((await params).username);
  if (!data) return { title: "Página não encontrada" };
  const { profile } = data;
  return {
    title: `${profile.displayName} (@${profile.username})`,
    description: profile.bio || `Todos os links de ${profile.displayName} no link.me.`,
    openGraph: { images: profile.avatarUrl ? [profile.avatarUrl] : undefined },
  };
}

export default async function PublicProfilePage({ params }: PageProps<"/[username]">) {
  const data = await load((await params).username);
  if (!data) notFound();

  const ua = (await headers()).get("user-agent") ?? "";
  if (!isBot(ua)) after(() => recordView(data.userId));

  return (
    <main>
      <ProfileView profile={data.profile} />
    </main>
  );
}
