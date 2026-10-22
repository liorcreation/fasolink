/**
 * Service d'intégration CinetPay — FasoLink
 *
 * Ce module centralise toutes les interactions avec l'API CinetPay v2.
 * Il est conçu pour tourner côté serveur uniquement (Next.js API Routes /
 * Cloudflare Workers) et n'expose jamais les secrets au navigateur.
 *
 * Flux complet :
 *   1. `initializePayment()` — Crée la session CinetPay + abonnement Firestore
 *   2. Redirection du client vers `payment_url` (CinetPay checkout)
 *   3. `verifyTransaction()`  — Appelé par le webhook OU le retour navigateur
 *   4. `processWebhookNotification()` — Extrait les données POST/JSON du webhook
 *
 * Sécurité :
 *   - Le webhook ne fait JAMAIS confiance aux données reçues : il re-vérifie
 *     systématiquement via `verifyTransaction()`.
 *   - Le montant, la devise et le site_id sont contrôlés côté serveur.
 *   - Les secrets (CINETPAY_API_KEY, CINETPAY_SITE_ID) ne sont jamais exposés.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CinetPayConfig {
  apiKey: string;
  siteId: string;
  /** URL publique de l'application (ex: https://fasolink.bf) */
  appBaseUrl: string;
}

export interface PaymentInitInput {
  transactionId: string;
  amount: number;
  currency?: string;
  description: string;
  notifyUrl: string;
  returnUrl: string;
  channels?: string;
  customer: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  metadata?: Record<string, string>;
}

export interface CinetPayInitResponse {
  code: string;
  message: string;
  data?: {
    payment_url?: string;
    payment_token?: string;
  };
}

export interface CinetPayCheckResponse {
  code?: string;
  message?: string;
  data?: {
    status?: string;
    amount?: number | string;
    currency?: string;
    transaction_id?: string;
    site_id?: string;
    payment_method?: string;
    payment_date?: string;
    operator_id?: string;
  };
}

export interface WebhookNotificationData {
  transactionId: string;
  siteId: string;
}

export type TransactionStatus =
  | "ACCEPTED"
  | "REFUSED"
  | "CANCELLED"
  | "PENDING"
  | "UNKNOWN";

export interface VerificationResult {
  status: TransactionStatus;
  isAccepted: boolean;
  amount: number;
  currency: string;
  transactionId: string;
  siteId: string;
  paymentMethod?: string;
  paymentDate?: string;
  operatorId?: string;
  raw: CinetPayCheckResponse;
}

// ─── Configuration ────────────────────────────────────────────────────────────

const CINETPAY_API_BASE = "https://api-checkout.cinetpay.com/v2";

/**
 * Récupère la configuration CinetPay depuis les variables d'environnement.
 * Lève une erreur si des variables critiques sont absentes.
 */
export function getCinetPayConfig(): CinetPayConfig {
  const apiKey = process.env.CINETPAY_API_KEY;
  const siteId = process.env.CINETPAY_SITE_ID;
  const appBaseUrl = process.env.APP_BASE_URL?.replace(/\/$/, "");

  if (!apiKey) throw new CinetPayError("CINETPAY_API_KEY manquante", "CONFIG");
  if (!siteId) throw new CinetPayError("CINETPAY_SITE_ID manquant", "CONFIG");
  if (!appBaseUrl || !appBaseUrl.startsWith("https://")) {
    throw new CinetPayError("APP_BASE_URL invalide ou manquante", "CONFIG");
  }

  return { apiKey, siteId, appBaseUrl };
}

// ─── Erreur spécialisée ───────────────────────────────────────────────────────

export class CinetPayError extends Error {
  public readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "CinetPayError";
    this.code = code;
  }
}

// ─── Génération d'identifiant de transaction ──────────────────────────────────

/**
 * Génère un identifiant de transaction unique FasoLink.
 * Format : FL<timestamp><random_hex> — compatible regex webhook verify.
 */
export function generateTransactionId(): string {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `FL${Date.now()}${random}`;
}

/**
 * Vérifie que l'identifiant est bien au format FasoLink.
 */
export function isValidTransactionId(reference: string): boolean {
  return /^FL[0-9]{13,}[A-Fa-f0-9]{8,16}$/.test(reference);
}

// ─── Initialisation du paiement ───────────────────────────────────────────────

/**
 * Initialise une session de paiement auprès de CinetPay.
 *
 * Retourne l'URL de redirection vers le checkout CinetPay.
 *
 * @throws {CinetPayError} Si CinetPay rejette l'initialisation
 */
export async function initializePayment(
  config: CinetPayConfig,
  input: PaymentInitInput,
): Promise<{ paymentUrl: string; paymentToken?: string }> {
  const response = await fetch(`${CINETPAY_API_BASE}/payment`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      apikey: config.apiKey,
      site_id: config.siteId,
      transaction_id: input.transactionId,
      amount: input.amount,
      currency: input.currency ?? "XOF",
      description: input.description,
      notify_url: input.notifyUrl,
      return_url: input.returnUrl,
      channels: input.channels ?? "MOBILE_MONEY",
      customer_id: input.customer.id,
      customer_name: input.customer.name,
      customer_surname: input.customer.surname,
      customer_email: input.customer.email,
      customer_phone_number: input.customer.phone ?? "",
      customer_address: input.customer.address ?? "Ouagadougou",
      customer_city: input.customer.city ?? "Ouagadougou",
      customer_country: input.customer.country ?? "BF",
      customer_state: "BF",
      customer_zip_code: "00000",
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
    }),
  });

  const body = (await response.json()) as CinetPayInitResponse;

  if (!response.ok || String(body.code) !== "201" || !body.data?.payment_url) {
    throw new CinetPayError(
      body.message || "CinetPay a refusé l'initialisation du paiement",
      "INIT_REJECTED",
    );
  }

  return {
    paymentUrl: body.data.payment_url,
    paymentToken: body.data.payment_token,
  };
}

// ─── Vérification de transaction ──────────────────────────────────────────────

/**
 * Vérifie le statut d'une transaction auprès de CinetPay.
 *
 * C'est la seule source de vérité pour confirmer un paiement.
 * Le contenu du webhook ou du retour navigateur n'est JAMAIS suffisant.
 *
 * @throws {CinetPayError} Si l'appel API échoue
 */
export async function verifyTransaction(
  config: CinetPayConfig,
  transactionId: string,
): Promise<VerificationResult> {
  const response = await fetch(`${CINETPAY_API_BASE}/payment/check`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      apikey: config.apiKey,
      site_id: config.siteId,
      transaction_id: transactionId,
    }),
  });

  if (!response.ok) {
    throw new CinetPayError(
      "Échec de la vérification auprès de CinetPay",
      "VERIFY_FAILED",
    );
  }

  const body = (await response.json()) as CinetPayCheckResponse;
  const data = body.data;
  const rawStatus = data?.status ?? "UNKNOWN";

  const status: TransactionStatus =
    rawStatus === "ACCEPTED"
      ? "ACCEPTED"
      : rawStatus === "REFUSED"
        ? "REFUSED"
        : rawStatus === "CANCELLED"
          ? "CANCELLED"
          : rawStatus === "PENDING"
            ? "PENDING"
            : "UNKNOWN";

  return {
    status,
    isAccepted: body.code === "00" && status === "ACCEPTED",
    amount: Number(data?.amount ?? 0),
    currency: String(data?.currency ?? "XOF"),
    transactionId: String(data?.transaction_id ?? transactionId),
    siteId: String(data?.site_id ?? ""),
    paymentMethod: data?.payment_method,
    paymentDate: data?.payment_date,
    operatorId: data?.operator_id,
    raw: body,
  };
}

// ─── Traitement des notifications webhook ─────────────────────────────────────

/**
 * Extrait les données d'identification d'une notification CinetPay.
 *
 * CinetPay peut envoyer les notifications en `application/json` ou
 * `application/x-www-form-urlencoded`. Ce helper gère les deux formats.
 *
 * ⚠️  Les données extraites ne sont PAS une preuve de paiement.
 *     Elles servent uniquement à identifier la transaction pour
 *     appeler ensuite `verifyTransaction()`.
 */
export async function processWebhookNotification(
  request: Request,
): Promise<WebhookNotificationData> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>;
    return {
      transactionId: String(
        body.cpm_trans_id ?? body.transaction_id ?? "",
      ),
      siteId: String(body.cpm_site_id ?? body.site_id ?? ""),
    };
  }

  // FormData (application/x-www-form-urlencoded)
  const form = await request.formData();
  return {
    transactionId: String(
      form.get("cpm_trans_id") ?? form.get("transaction_id") ?? "",
    ),
    siteId: String(form.get("cpm_site_id") ?? form.get("site_id") ?? ""),
  };
}

// ─── Validation croisée ───────────────────────────────────────────────────────

/**
 * Valide que la réponse CinetPay correspond bien aux données attendues.
 * Protège contre les attaques par substitution de transaction.
 */
export function assertTransactionIntegrity(
  verification: VerificationResult,
  expected: {
    transactionId: string;
    siteId: string;
    amount: number;
    currency?: string;
  },
): void {
  if (
    verification.transactionId &&
    verification.transactionId !== expected.transactionId
  ) {
    throw new CinetPayError("Transaction ID mismatch", "INTEGRITY");
  }
  if (verification.siteId && verification.siteId !== expected.siteId) {
    throw new CinetPayError("Site ID mismatch", "INTEGRITY");
  }
  if (verification.amount !== expected.amount) {
    throw new CinetPayError(
      `Montant invalide: reçu ${verification.amount}, attendu ${expected.amount}`,
      "AMOUNT_MISMATCH",
    );
  }
  if (
    verification.currency &&
    verification.currency !== (expected.currency ?? "XOF")
  ) {
    throw new CinetPayError(
      `Devise invalide: reçue ${verification.currency}`,
      "CURRENCY_MISMATCH",
    );
  }
}

// ─── Utilitaires de calcul d'abonnement ───────────────────────────────────────

/**
 * Calcule la date d'expiration d'un abonnement.
 * @param months - Durée en mois (1, 3 ou 12)
 * @param startFrom - Date de début (défaut : maintenant)
 */
export function computeSubscriptionExpiry(
  months: number,
  startFrom?: Date,
): Date {
  const start = startFrom ?? new Date();
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + months * 30);
  return expiry;
}

/**
 * Convertit un plan en nombre de mois.
 */
export function planToMonths(
  plan: string,
): number {
  switch (plan) {
    case "annuel":
      return 12;
    case "trimestriel":
      return 3;
    case "mensuel":
      return 1;
    default:
      return 0;
  }
}
