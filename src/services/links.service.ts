import "server-only";
import { fail, ok, type Result } from "@/core/result";
import { normaliseSafeUrl } from "@/core/safe-url";
import { firstIssue, linkSchema } from "@/core/validation";
import { newId } from "@/infra/crypto";
import * as links from "@/infra/repositories/links.repo";
import { bumpDailyStat } from "@/infra/repositories/misc.repo";
import { consume, RULES } from "./rate-limit.service";
import { checkSafeBrowsing } from "./safe-browsing.service";
import { todayKey } from "./stats.service";

export type LinkDTO = {
  id: string;
  title: string;
  url: string;
  enabled: boolean;
  sensitive: boolean;
  clicks: number;
};

function toDTO(row: links.LinkRow): LinkDTO {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    enabled: Number(row.enabled) === 1,
    sensitive: Number(row.sensitive) === 1,
    clicks: Number(row.clicks),
  };
}

export async function listMyLinks(userId: string): Promise<LinkDTO[]> {
  return (await links.listLinks(userId)).map(toDTO);
}

export async function listPublicLinks(userId: string): Promise<LinkDTO[]> {
  return (await links.listEnabledLinks(userId)).map(toDTO);
}

type LinkInput = { title: string; url: string; sensitive: boolean };

async function validateLink(input: LinkInput): Promise<Result<LinkInput>> {
  const parsed = linkSchema.safeParse(input);
  if (!parsed.success) {
    const issue = firstIssue(parsed.error);
    return fail(issue.message, issue.field);
  }
  const url = normaliseSafeUrl(parsed.data.url);
  if (!url.ok) return url;
  const verdict = await checkSafeBrowsing(url.value);
  if (!verdict.ok) return verdict;
  return ok({ ...parsed.data, url: url.value });
}

export async function createLink(userId: string, input: LinkInput): Promise<Result<LinkDTO>> {
  const limited = await consume(`mutate:${userId}`, RULES.mutatePerUser);
  if (!limited.ok) return limited;
  if ((await links.countLinks(userId)) >= links.MAX_LINKS) {
    return fail(`Limite de ${links.MAX_LINKS} links atingido.`);
  }
  const valid = await validateLink(input);
  if (!valid.ok) return valid;
  const id = newId();
  await links.insertLink({ id, userId, ...valid.value, now: Date.now() });
  return ok({ id, ...valid.value, enabled: true, clicks: 0 });
}

export async function editLink(userId: string, id: string, input: LinkInput): Promise<Result<LinkDTO>> {
  const limited = await consume(`mutate:${userId}`, RULES.mutatePerUser);
  if (!limited.ok) return limited;
  const existing = await links.findOwnedLink(userId, id);
  if (!existing) return fail("Link não encontrado.");
  const valid = await validateLink(input);
  if (!valid.ok) return valid;
  await links.updateLink(userId, id, valid.value);
  return ok({ ...toDTO(existing), ...valid.value });
}

export async function toggleLink(userId: string, id: string, enabled: boolean): Promise<Result> {
  const changed = await links.setLinkEnabled(userId, id, enabled);
  return changed ? ok() : fail("Link não encontrado.");
}

export async function removeLink(userId: string, id: string): Promise<Result> {
  const changed = await links.deleteLink(userId, id);
  return changed ? ok() : fail("Link não encontrado.");
}

export async function reorder(userId: string, orderedIds: string[]): Promise<Result> {
  if (orderedIds.length > links.MAX_LINKS || orderedIds.some((id) => !/^[A-Za-z0-9_-]{8,32}$/.test(id))) {
    return fail("Ordem inválida.");
  }
  await links.reorderLinks(userId, orderedIds);
  return ok();
}

/**
 * Resolves a click: counts it and returns the destination.
 * The redirect target is always the stored, validated URL; it is re-validated
 * here so a rule tightened later also covers old links.
 */
export async function resolveClick(id: string, countIt: boolean): Promise<{ url: string; sensitive: boolean } | null> {
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(id)) return null;
  const link = await links.findLink(id);
  if (!link || Number(link.enabled) !== 1) return null;
  const url = normaliseSafeUrl(link.url);
  if (!url.ok) return null;
  if (countIt) {
    await Promise.all([links.incrementLinkClicks(id), bumpDailyStat(link.user_id, todayKey(), "clicks")]);
  }
  return { url: url.value, sensitive: Number(link.sensitive) === 1 };
}

export async function peekLink(id: string) {
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(id)) return null;
  const link = await links.findLink(id);
  if (!link || Number(link.enabled) !== 1) return null;
  return toDTO(link);
}
