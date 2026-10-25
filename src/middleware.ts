import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getClientIp,
  RATE_LIMIT_PROFILES,
  rateLimiter,
  type RateLimitConfig,
} from "@/lib/rate-limit";

/**
 * Middleware de sécurité et Rate Limiting — FasoLink
 *
 * Optimisé pour Cloudflare Workers : s'exécute uniquement sur les routes sensibles
 * nécessitant une protection active contre les attaques par force brute (connexion,
 * inscription) et le spam de transactions ou requêtes API.
 * Les en-têtes de sécurité généraux sont désormais appliqués nativement via next.config.mjs.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let rateLimitConfig: RateLimitConfig | null = null;
  let rateLimitCategory = "general";

  if (pathname === "/connexion" || pathname === "/inscription") {
    rateLimitConfig = RATE_LIMIT_PROFILES.AUTH;
    rateLimitCategory = "auth";
  } else if (
    pathname === "/api/payments/cinetpay/initialize" ||
    pathname === "/api/payments/trial"
  ) {
    rateLimitConfig = RATE_LIMIT_PROFILES.PAYMENT_INIT;
    rateLimitCategory = "payment";
  } else if (pathname === "/api/webhooks/payment") {
    rateLimitConfig = RATE_LIMIT_PROFILES.WEBHOOK;
    rateLimitCategory = "webhook";
  } else if (pathname.startsWith("/api/")) {
    rateLimitConfig = RATE_LIMIT_PROFILES.API_DEFAULT;
    rateLimitCategory = "api";
  }

  if (rateLimitConfig) {
    const clientIp = getClientIp(request);
    const key = `${rateLimitCategory}:${clientIp}`;
    const rateLimitResult = rateLimiter.check(key, rateLimitConfig);

    if (!rateLimitResult.success) {
      console.warn(
        `[FasoLink Security] Rate limit dépassé pour ${key} sur ${pathname}. Bloqué pendant ${rateLimitResult.retryAfterSeconds}s.`,
      );

      return new NextResponse(
        JSON.stringify({
          error: "Trop de requêtes. Veuillez patienter avant de réessayer.",
          retryAfter: rateLimitResult.retryAfterSeconds,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rateLimitResult.retryAfterSeconds),
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.resetTime),
          },
        },
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimitResult.resetTime));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/connexion",
    "/inscription",
    "/api/:path*",
  ],
};
