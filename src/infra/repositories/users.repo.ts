import "server-only";
import { query, queryOne, run, transaction } from "../db";

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: number;
  password_changed_at: number;
};

export type ProfileRow = {
  user_id: string;
  username: string;
  display_name: string;
  bio: string;
  theme_id: string;
  mode: string;
  wallpaper_id: string;
  button_style: string;
  font_id: string;
  avatar_media_id: string | null;
  wallpaper_media_id: string | null;
  view_count: number;
  updated_at: number;
};

export function findUserByEmail(email: string) {
  return queryOne<UserRow>("SELECT * FROM users WHERE email = ?", [email]);
}

export function findUserById(id: string) {
  return queryOne<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
}

export async function emailOrUsernameTaken(email: string, username: string) {
  const row = await queryOne<{ e: number; u: number }>(
    `SELECT (SELECT COUNT(*) FROM users WHERE email = ?) AS e,
            (SELECT COUNT(*) FROM profiles WHERE username = ?) AS u`,
    [email, username],
  );
  return { email: Number(row?.e) > 0, username: Number(row?.u) > 0 };
}

export async function insertUserWithProfile(input: {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  displayName: string;
  themeId: string;
  wallpaperId: string;
  fontId: string;
  buttonStyle: string;
  now: number;
}) {
  await transaction([
    {
      sql: "INSERT INTO users (id, email, password_hash, created_at, password_changed_at) VALUES (?, ?, ?, ?, ?)",
      args: [input.id, input.email, input.passwordHash, input.now, input.now],
    },
    {
      sql: `INSERT INTO profiles (user_id, username, display_name, theme_id, wallpaper_id, font_id, button_style, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [input.id, input.username, input.displayName, input.themeId, input.wallpaperId, input.fontId, input.buttonStyle, input.now],
    },
  ]);
}

export function updatePasswordHash(userId: string, hash: string, now: number) {
  return run("UPDATE users SET password_hash = ?, password_changed_at = ? WHERE id = ?", [hash, now, userId]);
}

export async function deleteUser(userId: string) {
  // Explicit deletes: libSQL connections may not enforce ON DELETE CASCADE.
  const tables = ["sessions", "links", "media", "daily_stats", "profiles"] as const;
  await transaction([
    ...tables.map((table) => ({ sql: `DELETE FROM ${table} WHERE user_id = ?`, args: [userId] })),
    { sql: "DELETE FROM users WHERE id = ?", args: [userId] },
  ]);
}

export function findProfileByUserId(userId: string) {
  return queryOne<ProfileRow>("SELECT * FROM profiles WHERE user_id = ?", [userId]);
}

export function findProfileByUsername(username: string) {
  return queryOne<ProfileRow>("SELECT * FROM profiles WHERE username = ?", [username]);
}

export function usernameOwner(username: string) {
  return queryOne<{ user_id: string }>("SELECT user_id FROM profiles WHERE username = ?", [username]);
}

export function updateProfileText(userId: string, displayName: string, bio: string, username: string, now: number) {
  return run("UPDATE profiles SET display_name = ?, bio = ?, username = ?, updated_at = ? WHERE user_id = ?", [
    displayName, bio, username, now, userId,
  ]);
}

export function updateAppearance(
  userId: string,
  a: { themeId: string; mode: string; wallpaperId: string; buttonStyle: string; fontId: string },
  now: number,
) {
  return run(
    `UPDATE profiles SET theme_id = ?, mode = ?, wallpaper_id = ?, button_style = ?, font_id = ?, updated_at = ?
     WHERE user_id = ?`,
    [a.themeId, a.mode, a.wallpaperId, a.buttonStyle, a.fontId, now, userId],
  );
}

export function setProfileMedia(userId: string, column: "avatar_media_id" | "wallpaper_media_id", mediaId: string | null, now: number) {
  // `column` is a closed union, never user input.
  return run(`UPDATE profiles SET ${column} = ?, updated_at = ? WHERE user_id = ?`, [mediaId, now, userId]);
}

export function incrementProfileViews(userId: string) {
  return run("UPDATE profiles SET view_count = view_count + 1 WHERE user_id = ?", [userId]);
}

export function listProfilesForSitemap() {
  return query<{ username: string; updated_at: number }>("SELECT username, updated_at FROM profiles LIMIT 5000");
}
