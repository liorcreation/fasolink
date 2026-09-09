import {
  SHOP_ASSETS_BUCKET,
  isSupabaseConfigured,
  supabase,
} from "@/lib/supabase";
import type {
  PaymentProvider,
  ShopCategory,
  SubscriptionPlan,
} from "@/lib/database.types";
import { PAYMENT_GATEWAY, TRIAL_DAYS } from "@/lib/constants";
import { slugify } from "@/lib/utils";

/**
 * Couche « écriture vendeur » : création de boutique + activation d'abonnement.
 * Utilisée par les composants clients de /vendeur/inscription et /vendeur/paiement.
 *
 * Auth : l'app n'a pas de tunnel de connexion classique. On ouvre une session
 * Supabase **anonyme** (à activer dans Auth → Providers → Anonymous) pour que
 * `auth.uid()` alimente les policies RLS (owner_id, storage, subscriptions).
 */

export interface ShopDraft {
  name: string;
  category: ShopCategory;
  city: string;
  neighborhood: string | null;
  whatsapp: string;
  description: string;
}

export class VendorError extends Error {
  code: "auth" | "insert" | "config";
  constructor(code: VendorError["code"], message: string) {
    super(message);
    this.code = code;
    this.name = "VendorError";
  }
}

/** Renvoie l'uid de la session courante, en créant une session anonyme au besoin. */
export async function ensureSession(): Promise<string> {
  const { data: current } = await supabase.auth.getUser();
  if (current.user) return current.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    throw new VendorError(
      "auth",
      "Impossible d'ouvrir une session. Activez la connexion anonyme dans votre projet Supabase (Auth → Providers → Anonymous).",
    );
  }
  return data.user.id;
}

async function uploadPublicAsset(
  shopId: string,
  key: string,
  file: File,
): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${shopId}/${key}.${ext}`;

  const { error } = await supabase.storage
    .from(SHOP_ASSETS_BUCKET)
    .upload(path, file, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type || undefined,
    });

  if (error) {
    console.warn("[FasoLink] upload:", error.message);
    return null;
  }
  return supabase.storage.from(SHOP_ASSETS_BUCKET).getPublicUrl(path).data
    .publicUrl;
}

export interface CreatedShop {
  id: string;
  slug: string;
}

/**
 * 1) insère la boutique dans `shops` (statut `pending`)
 * 2) téléverse logo + photos produits dans le bucket `shop-assets`
 * 3) met à jour la boutique avec les URL publiques
 */
export async function createShopWithAssets(
  draft: ShopDraft,
  logo: File | null,
  gallery: File[],
): Promise<CreatedShop> {
  if (!isSupabaseConfigured) {
    throw new VendorError("config", "Supabase n'est pas configuré.");
  }

  const ownerId = await ensureSession();
  const slug = `${slugify(draft.name)}-${Date.now().toString(36)}`;

  const { data: shop, error } = await supabase
    .from("shops")
    .insert({
      owner_id: ownerId,
      name: draft.name.trim(),
      slug,
      category: draft.category,
      description: draft.description.trim(),
      city: draft.city,
      neighborhood: draft.neighborhood?.trim() || null,
      whatsapp: draft.whatsapp.trim(),
      status: "pending",
      verification_status: "unverified",
    })
    .select("id, slug")
    .single();

  if (error || !shop) {
    throw new VendorError(
      "insert",
      error?.message ??
        "L'enregistrement de la boutique a échoué. Vérifiez que le schéma SQL est appliqué.",
    );
  }

  // Marque le profil comme vendeur (best-effort).
  void supabase.from("profiles").update({ role: "seller" }).eq("id", ownerId);

  // Téléversements + URL publiques
  const patch: {
    logo_url?: string;
    cover_url?: string;
    gallery?: string[];
  } = {};

  if (logo) {
    const url = await uploadPublicAsset(shop.id, "logo", logo);
    if (url) patch.logo_url = url;
  }

  if (gallery.length) {
    const urls = await Promise.all(
      gallery.map((file, i) =>
        uploadPublicAsset(shop.id, `produit-${i + 1}`, file),
      ),
    );
    const clean = urls.filter((u): u is string => Boolean(u));
    if (clean.length) {
      patch.gallery = clean;
      patch.cover_url = clean[0];
      if (!patch.logo_url) patch.logo_url = clean[0];
    }
  }

  if (Object.keys(patch).length) {
    await supabase.from("shops").update(patch).eq("id", shop.id);
  }

  return shop;
}

export interface ActivationInput {
  shopId: string;
  plan: SubscriptionPlan;
  months: number;
  amount: number;
  provider: PaymentProvider;
  phone?: string;
  reference?: string;
  trial?: boolean;
}

export interface ActivationResult {
  reference: string;
  startedAt: string;
  expiresAt: string;
  trial: boolean;
}

/**
 * Après validation du paiement Mobile Money :
 * 1) crée l'entrée `subscriptions` (started_at, expires_at, statut `active`)
 * 2) passe la boutique en statut `active` (= « publiée »)
 */
export async function activateSubscription(
  input: ActivationInput,
): Promise<ActivationResult> {
  if (!isSupabaseConfigured) {
    throw new VendorError("config", "Supabase n'est pas configuré.");
  }
  await ensureSession();

  const now = new Date();
  const expires = new Date(now);
  if (input.trial) {
    expires.setDate(expires.getDate() + TRIAL_DAYS);
  } else {
    // Fin d'abonnement : +30 jours par mois de formule (mensuel = +30 j).
    expires.setDate(expires.getDate() + input.months * 30);
  }

  const reference =
    input.reference ??
    "FL-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  const { error: subError } = await supabase.from("subscriptions").insert({
    shop_id: input.shopId,
    plan: input.plan,
    status: input.trial ? "trialing" : "active",
    provider: input.provider,
    gateway: PAYMENT_GATEWAY.name,
    amount: input.trial ? 0 : input.amount,
    phone: input.phone ?? null,
    reference,
    trial_ends_at: input.trial ? expires.toISOString() : null,
    started_at: now.toISOString(),
    expires_at: expires.toISOString(),
  });

  if (subError) {
    throw new VendorError("insert", subError.message);
  }

  const { error: shopError } = await supabase
    .from("shops")
    .update({ status: "active" })
    .eq("id", input.shopId);

  if (shopError) {
    throw new VendorError("insert", shopError.message);
  }

  return {
    reference,
    startedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    trial: Boolean(input.trial),
  };
}
