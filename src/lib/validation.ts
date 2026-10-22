/**
 * Module de Validation Stricte des Payloads & Anti-Injection — FasoLink
 *
 * Fournit une validation de schéma typée, sans dépendance tierce,
 * optimisée pour Edge Runtime et Cloudflare Workers.
 */

export class ValidationError extends Error {
  public readonly field: string;
  constructor(field: string, message: string) {
    super(`Validation failed on '${field}': ${message}`);
    this.name = "ValidationError";
    this.field = field;
  }
}

// ─── Protection Anti-Prototype-Pollution ─────────────────────────────────────

const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);

export function assertNoPrototypePollution(obj: unknown): void {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (DANGEROUS_KEYS.has(key)) {
      throw new ValidationError(key, "Tentative d'injection prototype interdite.");
    }
  }
}

// ─── Assainisseurs et Validateurs Primaires ───────────────────────────────────

export function validateRequiredString(
  value: unknown,
  field: string,
  minLength: number,
  maxLength: number,
): string {
  if (typeof value !== "string") {
    throw new ValidationError(field, "Une chaîne de caractères est requise.");
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    throw new ValidationError(field, `Minimum ${minLength} caractère(s) requis.`);
  }
  if (trimmed.length > maxLength) {
    throw new ValidationError(field, `Maximum ${maxLength} caractères autorisés.`);
  }
  return trimmed;
}

export function validateRegex(
  value: unknown,
  field: string,
  regex: RegExp,
  errorMsg: string,
): string {
  const str = validateRequiredString(value, field, 1, 512);
  if (!regex.test(str)) {
    throw new ValidationError(field, errorMsg);
  }
  return str;
}

export function validatePositiveInteger(
  value: unknown,
  field: string,
  min: number,
  max: number,
): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(num) || num < min || num > max) {
    throw new ValidationError(field, `Doit être un entier compris entre ${min} et ${max}.`);
  }
  return num;
}

export function validateEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[],
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new ValidationError(field, `Valeur non autorisée. Choix possibles: ${allowed.join(", ")}`);
  }
  return value as T;
}

// ─── Schémas Spécifiques FasoLink ───────────────────────────────────────────

export interface ValidatedPaymentInit {
  idToken: string;
  shopId: string;
  plan: "mensuel" | "trimestriel" | "annuel";
}

export function validatePaymentInitPayload(body: unknown): ValidatedPaymentInit {
  assertNoPrototypePollution(body);
  if (!body || typeof body !== "object") {
    throw new ValidationError("body", "Payload JSON invalide.");
  }
  const data = body as Record<string, unknown>;

  const idToken = validateRequiredString(data.idToken, "idToken", 50, 4096);
  const shopId = validateRegex(
    data.shopId,
    "shopId",
    /^[a-zA-Z0-9_-]{1,128}$/,
    "L'identifiant de la boutique doit être alphanumérique (1 à 128 caractères).",
  );
  const plan = validateEnum(data.plan, "plan", ["mensuel", "trimestriel", "annuel"] as const);

  return { idToken, shopId, plan };
}

export interface ValidatedTrialPayload {
  idToken: string;
  shopId: string;
  plan: "mensuel" | "trimestriel" | "annuel";
}

export function validateTrialPayload(body: unknown): ValidatedTrialPayload {
  assertNoPrototypePollution(body);
  if (!body || typeof body !== "object") {
    throw new ValidationError("body", "Payload JSON invalide.");
  }
  const data = body as Record<string, unknown>;

  const idToken = validateRequiredString(data.idToken, "idToken", 50, 4096);
  const shopId = validateRegex(
    data.shopId,
    "shopId",
    /^[a-zA-Z0-9_-]{1,128}$/,
    "L'identifiant de la boutique doit être alphanumérique.",
  );
  const plan = validateEnum(data.plan, "plan", ["mensuel", "trimestriel", "annuel"] as const);

  return { idToken, shopId, plan };
}

export interface ValidatedReviewPayload {
  shopId: string;
  rating: number;
  comment: string;
  authorName: string;
}

export function validateReviewPayload(body: unknown): ValidatedReviewPayload {
  assertNoPrototypePollution(body);
  if (!body || typeof body !== "object") {
    throw new ValidationError("body", "Payload JSON invalide.");
  }
  const data = body as Record<string, unknown>;

  const shopId = validateRegex(data.shopId, "shopId", /^[a-zA-Z0-9_-]{1,128}$/, "ShopId invalide.");
  const rating = validatePositiveInteger(data.rating, "rating", 1, 5);
  const comment = validateRequiredString(data.comment, "comment", 10, 1500);
  const authorName = validateRequiredString(data.authorName, "authorName", 2, 80);

  return { shopId, rating, comment, authorName };
}
