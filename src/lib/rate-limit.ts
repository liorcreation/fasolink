/**
 * Module de Rate Limiting In-Memory Pro-Grade — FasoLink
 *
 * Compatible Edge Runtime, Cloudflare Workers et Node.js.
 * Utilise un algorithme Sliding Window pour bloquer les attaques DDoS,
 * les tentatives de brute-force sur l'authentification et le spam de transactions.
 */

export interface RateLimitConfig {
  /** Nombre maximal de requêtes autorisées dans la fenêtre de temps */
  limit: number;
  /** Fenêtre de temps en millisecondes (ex: 60_000 pour 1 minute) */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfterSeconds: number;
}

interface WindowRecord {
  count: number;
  resetTime: number;
}

class InMemoryRateLimiter {
  private storage = new Map<string, WindowRecord>();
  private lastCleanup = Date.now();
  private readonly cleanupIntervalMs = 60_000; // Nettoyage chaque minute

  /**
   * Vérifie et incrémente le compteur pour une clé donnée.
   */
  public check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    this.maybeCleanup(now);

    const record = this.storage.get(key);

    if (!record || now >= record.resetTime) {
      // Nouvelle fenêtre
      const resetTime = now + config.windowMs;
      this.storage.set(key, { count: 1, resetTime });
      return {
        success: true,
        limit: config.limit,
        remaining: config.limit - 1,
        resetTime,
        retryAfterSeconds: Math.ceil(config.windowMs / 1000),
      };
    }

    // Fenêtre existante
    record.count += 1;
    const remaining = Math.max(0, config.limit - record.count);
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    const success = record.count <= config.limit;

    return {
      success,
      limit: config.limit,
      remaining,
      resetTime: record.resetTime,
      retryAfterSeconds,
    };
  }

  /**
   * Nettoie les clés expirées pour éviter toute fuite de mémoire.
   */
  private maybeCleanup(now: number): void {
    if (now - this.lastCleanup < this.cleanupIntervalMs) return;
    this.lastCleanup = now;

    for (const [key, record] of this.storage.entries()) {
      if (now >= record.resetTime) {
        this.storage.delete(key);
      }
    }
  }
}

// Instance singleton
export const rateLimiter = new InMemoryRateLimiter();

/**
 * Profils de Rate Limiting prédéfinis pour FasoLink
 */
export const RATE_LIMIT_PROFILES = {
  /** Protection contre le brute-force de connexion et d'inscription */
  AUTH: { limit: 10, windowMs: 60_000 }, // 10 req / min
  /** Protection contre le spam d'initialisation de paiement */
  PAYMENT_INIT: { limit: 6, windowMs: 60_000 }, // 6 req / min
  /** Protection des webhooks de paiement */
  WEBHOOK: { limit: 30, windowMs: 60_000 }, // 30 req / min
  /** Protection API standard (recherche, images, etc.) */
  API_DEFAULT: { limit: 60, windowMs: 60_000 }, // 60 req / min
} as const;

/**
 * Extrait l'adresse IP client de façon fiable à travers les proxys
 * (Cloudflare, Vercel, Nginx, etc.).
 */
export function getClientIp(request: Request): string {
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  return "127.0.0.1";
}
