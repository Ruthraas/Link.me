import { readImage } from "@/services/media.service";

/** Serves re-encoded user images. Ids are immutable, so caching is forever. */
export async function GET(_request: Request, ctx: RouteContext<"/m/[id]">) {
  const { id } = await ctx.params;
  const image = await readImage(id);
  if (!image) return new Response("Não encontrado", { status: 404 });
  return new Response(image.bytes, {
    headers: {
      "Content-Type": image.mime === "image/webp" ? "image/webp" : "application/octet-stream",
      "Content-Length": String(image.bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
