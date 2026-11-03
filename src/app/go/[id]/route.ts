import { NextResponse, type NextRequest } from "next/server";
import { isBot } from "@/infra/request";
import { resolveClick } from "@/services/links.service";

/**
 * Click redirect. Only ids are accepted, never a target URL, so this cannot be
 * used as an open redirect. Sensitive links go to a warning page first.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/go/[id]">) {
  const { id } = await ctx.params;
  const ua = request.headers.get("user-agent") ?? "";
  const prefetch = request.headers.get("purpose") === "prefetch" || request.headers.has("next-router-prefetch");
  const link = await resolveClick(id, !isBot(ua) && !prefetch);
  if (!link) return NextResponse.redirect(new URL("/?link=indisponivel", request.url), 302);

  const target = link.sensitive ? new URL(`/aviso/${id}`, request.url) : new URL(link.url);
  const response = NextResponse.redirect(target, 302);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "strict-origin");
  return response;
}
