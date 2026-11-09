import "server-only";
import sharp from "sharp";
import { fail, ok, type Result } from "@/core/result";
import { newId } from "@/infra/crypto";
import { deleteMedia, findMedia, insertMedia } from "@/infra/repositories/misc.repo";
import { findProfileByUserId, setProfileMedia } from "@/infra/repositories/users.repo";
import { consume, RULES } from "./rate-limit.service";

/**
 * Image uploads. Every file is decoded and re-encoded by sharp:
 * - only real JPEG/PNG/WebP/GIF/AVIF bitmaps pass (SVG and polyglots are refused),
 * - EXIF/GPS metadata is dropped (privacy),
 * - output is a fixed-size WebP, so stored bytes are always ours.
 */

export type MediaKind = "avatar" | "wallpaper";

const MAX_INPUT_BYTES = 6 * 1024 * 1024;
const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp", "gif", "avif", "heif"]);

const SPEC: Record<MediaKind, { column: "avatar_media_id" | "wallpaper_media_id"; size: number; quality: number }> = {
  avatar: { column: "avatar_media_id", size: 512, quality: 82 },
  wallpaper: { column: "wallpaper_media_id", size: 1600, quality: 78 },
};

async function reencode(input: Buffer, kind: MediaKind): Promise<Result<Buffer>> {
  try {
    const image = sharp(input, { limitInputPixels: 40_000_000, failOn: "error", animated: false });
    const meta = await image.metadata();
    if (!meta.format || !ACCEPTED_FORMATS.has(meta.format)) return fail("Formato não suportado. Use JPG, PNG ou WebP.");
    const spec = SPEC[kind];
    const pipeline = image.rotate(); // apply EXIF orientation before metadata is dropped
    const resized =
      kind === "avatar"
        ? pipeline.resize(spec.size, spec.size, { fit: "cover", position: "attention" })
        : pipeline.resize({ width: spec.size, height: spec.size, fit: "inside", withoutEnlargement: true });
    return ok(await resized.webp({ quality: spec.quality }).toBuffer());
  } catch {
    return fail("Não deu para ler essa imagem. Se for foto HEIC do iPhone, envie pelo próprio celular ou salve como JPG.");
  }
}

export async function uploadImage(userId: string, kind: MediaKind, file: File | null): Promise<Result<{ url: string }>> {
  if (!file || typeof file === "string" || file.size === 0) return fail("Escolha uma imagem.");
  if (file.size > MAX_INPUT_BYTES) return fail("Imagem grande demais (máximo 6 MB).");
  const limited = await consume(`upload:${userId}`, RULES.uploadPerUser);
  if (!limited.ok) return limited;

  const encoded = await reencode(Buffer.from(await file.arrayBuffer()), kind);
  if (!encoded.ok) return encoded;

  const profile = await findProfileByUserId(userId);
  const previous = profile?.[SPEC[kind].column] ?? null;
  const id = newId();
  const now = Date.now();
  await insertMedia({ id, userId, kind, mime: "image/webp", bytes: new Uint8Array(encoded.value), now });
  await setProfileMedia(userId, SPEC[kind].column, id, now);
  if (previous) await deleteMedia(userId, previous);
  return ok({ url: `/m/${id}` });
}

export async function removeImage(userId: string, kind: MediaKind): Promise<Result> {
  const profile = await findProfileByUserId(userId);
  const previous = profile?.[SPEC[kind].column] ?? null;
  await setProfileMedia(userId, SPEC[kind].column, null, Date.now());
  if (previous) await deleteMedia(userId, previous);
  return ok();
}

export async function readImage(id: string) {
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(id)) return null;
  const row = await findMedia(id);
  if (!row) return null;
  return { mime: row.mime, bytes: new Uint8Array(row.bytes as ArrayBuffer) };
}
