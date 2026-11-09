/**
 * Shrinks a picked image in the browser before upload so the request stays well
 * under Vercel's 4.5 MB body limit. The server re-encodes it anyway; this step is
 * about reaching the server at all from phones (12 MP photos, HEIC, old Safari).
 */

/** Largest body we send; Vercel refuses requests over 4.5 MB. */
export const MAX_UPLOAD_BYTES = 3.8 * 1024 * 1024;

type Drawable = { source: CanvasImageSource; width: number; height: number; close: () => void };

/** Decodes with whatever the browser supports: createImageBitmap first, <img> as fallback. */
async function decode(file: Blob): Promise<Drawable> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
  } catch {
    // Older Safari rejects the options object; some browsers reject the format.
  }
  try {
    const bmp = await createImageBitmap(file);
    return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
  } catch {
    // fall through to <img>
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("unreadable");
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function isHeic(file: File): boolean {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

export async function resizeImage(file: File, maxSide: number): Promise<Blob> {
  if (file.type && !file.type.startsWith("image/") && !isHeic(file)) {
    throw new Error("Escolha um arquivo de imagem.");
  }

  let image: Drawable;
  try {
    image = await decode(file);
  } catch {
    if (isHeic(file)) {
      throw new Error("Foto HEIC do iPhone não abre neste navegador. Envie pelo celular ou salve como JPG.");
    }
    if (file.size <= MAX_UPLOAD_BYTES) return file; // let the server try (it reads more formats)
    throw new Error("Não deu para abrir essa imagem. Tente outra ou tire um print dela.");
  }

  try {
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.fillStyle = "#ffffff"; // JPEG has no transparency: keep transparent PNGs from turning black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image.source, 0, 0, canvas.width, canvas.height);

    // WebP where the browser can encode it; Safari before 16 silently returns PNG, so check the type.
    let blob = await toBlob(canvas, "image/webp", 0.88);
    if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", 0.88);
    for (let q = 0.75; blob && blob.size > MAX_UPLOAD_BYTES && q >= 0.45; q -= 0.15) {
      blob = await toBlob(canvas, "image/jpeg", q);
    }
    if (!blob) throw new Error("encode");
    return blob;
  } catch {
    if (file.size <= MAX_UPLOAD_BYTES) return file;
    throw new Error("Não deu para preparar essa imagem. Tente outra.");
  } finally {
    image.close();
  }
}
