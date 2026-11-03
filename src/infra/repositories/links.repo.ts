import "server-only";
import { query, queryOne, run, transaction } from "../db";

export type LinkRow = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  position: number;
  enabled: number;
  sensitive: number;
  clicks: number;
  created_at: number;
};

export const MAX_LINKS = 50;

export function listLinks(userId: string) {
  return query<LinkRow>("SELECT * FROM links WHERE user_id = ? ORDER BY position ASC, created_at ASC", [userId]);
}

export function listEnabledLinks(userId: string) {
  return query<LinkRow>("SELECT * FROM links WHERE user_id = ? AND enabled = 1 ORDER BY position ASC, created_at ASC", [userId]);
}

export function findLink(id: string) {
  return queryOne<LinkRow>("SELECT * FROM links WHERE id = ?", [id]);
}

export function findOwnedLink(userId: string, id: string) {
  return queryOne<LinkRow>("SELECT * FROM links WHERE id = ? AND user_id = ?", [id, userId]);
}

export async function countLinks(userId: string) {
  const row = await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM links WHERE user_id = ?", [userId]);
  return Number(row?.n ?? 0);
}

export function insertLink(l: { id: string; userId: string; title: string; url: string; sensitive: boolean; now: number }) {
  // New links go to the top, the way people expect from link pages.
  return transaction([
    { sql: "UPDATE links SET position = position + 1 WHERE user_id = ?", args: [l.userId] },
    {
      sql: "INSERT INTO links (id, user_id, title, url, position, enabled, sensitive, created_at) VALUES (?, ?, ?, ?, 0, 1, ?, ?)",
      args: [l.id, l.userId, l.title, l.url, l.sensitive ? 1 : 0, l.now],
    },
  ]);
}

export function updateLink(userId: string, id: string, l: { title: string; url: string; sensitive: boolean }) {
  return run("UPDATE links SET title = ?, url = ?, sensitive = ? WHERE id = ? AND user_id = ?", [
    l.title, l.url, l.sensitive ? 1 : 0, id, userId,
  ]);
}

export function setLinkEnabled(userId: string, id: string, enabled: boolean) {
  return run("UPDATE links SET enabled = ? WHERE id = ? AND user_id = ?", [enabled ? 1 : 0, id, userId]);
}

export function deleteLink(userId: string, id: string) {
  return run("DELETE FROM links WHERE id = ? AND user_id = ?", [id, userId]);
}

/** Rewrites positions in the given order. Ids not owned by the user are ignored by the WHERE clause. */
export function reorderLinks(userId: string, orderedIds: string[]) {
  return transaction(
    orderedIds.map((id, index) => ({
      sql: "UPDATE links SET position = ? WHERE id = ? AND user_id = ?",
      args: [index, id, userId],
    })),
  );
}

export function incrementLinkClicks(id: string) {
  return run("UPDATE links SET clicks = clicks + 1 WHERE id = ?", [id]);
}
