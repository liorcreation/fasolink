import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getClientIp,
  RATE_LIMIT_PROFILES,
  rateLimiter,
  type RateLimitConfig,
} from "@/lib/rate-limit";

// Chemins exemptés de filtrage (assets statiques, manifest, images publiques)
const PUBLIC_FILE_EXTENSIONS = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les fichiers statiques internes Next.js et assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/icon") ||
    PUBLIC_FILE_EXTENSIONS.test(pathname)
  ) {
    return NextResponse.next();
  }

  const clientIp = getClientIp(request);

  // ─── 1. Rate Limiting sur les routes critiques ─────────────────────────────
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

  let rateLimitResult = null;
  if (rateLimitConfig) {
    const key = `${rateLimitCategory}:${clientIp}`;
    rateLimitResult = rateLimiter.check(key, rateLimitConfig);

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
  }

  // ─── 2. Application des En-têtes de Sécurité (Hardening Pro-Grade) ─────────
  const response = NextResponse.next();

  // En-têtes Rate Limit
  if (rateLimitResult) {
    response.headers.set("X-RateLimit-Limit", String(rateLimitResult.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimitResult.resetTime));
  }

  // Protection contre le détournement de clic (Clickjacking)
  response.headers.set("X-Frame-Options", "DENY");

  // Protection contre le reniflage de type MIME (MIME-Sniffing)
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Politique de référent stricte
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Protection XSS pour les navigateurs historiques
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Isolation des fonctionnalités navigateur non désirées
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=*",
  );

  // HSTS (Strict Transport Security) — Forcer HTTPS pendant 2 ans
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Intercepte toutes les requêtes sauf les fichiers statiques
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
