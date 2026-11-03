"use server";

import { revalidatePath } from "next/cache";
import type { Result } from "@/core/result";
import type { AppearanceInput } from "@/core/validation";
import * as linksService from "@/services/links.service";
import * as media from "@/services/media.service";
import * as profiles from "@/services/profile.service";
import { getSessionUser } from "@/services/session.service";

/** Every dashboard action starts here: no session, no work. */
async function requireUser() {
  const me = await getSessionUser();
  if (!me) throw new Error("UNAUTHENTICATED");
  return me;
}

async function refreshPublic(userId: string) {
  const profile = await profiles.getMyProfile(userId);
  if (profile) revalidatePath(`/${profile.username}`);
}

type LinkPayload = { title: string; url: string; sensitive: boolean };

export async function createLinkAction(input: LinkPayload): Promise<Result<linksService.LinkDTO>> {
  const me = await requireUser();
  const result = await linksService.createLink(me.id, input);
  if (result.ok) await refreshPublic(me.id);
  return result;
}

export async function editLinkAction(id: string, input: LinkPayload): Promise<Result<linksService.LinkDTO>> {
  const me = await requireUser();
  const result = await linksService.editLink(me.id, String(id), input);
  if (result.ok) await refreshPublic(me.id);
  return result;
}

export async function toggleLinkAction(id: string, enabled: boolean): Promise<Result> {
  const me = await requireUser();
  const result = await linksService.toggleLink(me.id, String(id), Boolean(enabled));
  if (result.ok) await refreshPublic(me.id);
  return result;
}

export async function deleteLinkAction(id: string): Promise<Result> {
  const me = await requireUser();
  const result = await linksService.removeLink(me.id, String(id));
  if (result.ok) await refreshPublic(me.id);
  return result;
}

export async function reorderLinksAction(ids: string[]): Promise<Result> {
  const me = await requireUser();
  const result = await linksService.reorder(me.id, Array.isArray(ids) ? ids.map(String) : []);
  if (result.ok) await refreshPublic(me.id);
  return result;
}

export async function updateProfileAction(input: { displayName: string; bio: string; username: string }) {
  const me = await requireUser();
  const before = await profiles.getMyProfile(me.id);
  const result = await profiles.updateProfile(me.id, {
    displayName: String(input.displayName ?? ""),
    bio: String(input.bio ?? ""),
    username: String(input.username ?? ""),
  });
  if (result.ok) {
    if (before) revalidatePath(`/${before.username}`);
    revalidatePath(`/${result.value.username}`);
  }
  return result;
}

export async function updateAppearanceAction(input: AppearanceInput): Promise<Result> {
  const me = await requireUser();
  const result = await profiles.updateAppearance(me.id, input);
  if (result.ok) await refreshPublic(me.id);
  return result;
}

export async function uploadImageAction(fd: FormData): Promise<Result<{ url: string }>> {
  const me = await requireUser();
  const kind = fd.get("kind") === "wallpaper" ? "wallpaper" : "avatar";
  const file = fd.get("file");
  const result = await media.uploadImage(me.id, kind, file instanceof File ? file : null);
  if (result.ok) await refreshPublic(me.id);
  return result;
}

export async function removeImageAction(kind: "avatar" | "wallpaper"): Promise<Result> {
  const me = await requireUser();
  const result = await media.removeImage(me.id, kind === "wallpaper" ? "wallpaper" : "avatar");
  if (result.ok) await refreshPublic(me.id);
  return result;
}
