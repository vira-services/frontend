import type { NextRequest } from "next/server";

/**
 * Resolve the public origin of the app.
 *
 * Uses APP_URL / NEXT_PUBLIC_APP_URL when configured, otherwise reconstructs it
 * from the (proxy) request headers so the same build works on localhost and in
 * production behind Traefik without a hardcoded domain.
 */
export function getAppOrigin(req: NextRequest): string {
  const configured = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL)?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.headers.get("host") || req.nextUrl.host;

  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto = forwardedProto || req.nextUrl.protocol.replace(/:$/, "") || "https";

  return `${proto}://${host}`;
}

export function getDiscordRedirectUri(req: NextRequest): string {
  return `${getAppOrigin(req)}/api/auth/discord/callback`;
}
