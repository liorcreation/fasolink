import { signInAnonymously } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore/lite";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  COLLECTIONS,
  auth,
  db,
  isFirebaseConfigured,
  storage,
} from "@/lib/firebase";
import type {
  PaymentProvider,
  ShopCategory,
  SubscriptionPlan,
} from "@/lib/database.types";
import { PAYMENT_GATEWAY, TRIAL_DAYS } from "@/lib/constants";
import { STANDARD_HOURS } from "@/lib/hours";
import { slugify } from "@/lib/utils";

/**
 * Couche « écriture vendeur » : création de boutique + activation d'abonnement.
 * Utilisée par les composants clients de /vendeur/inscription et /vendeur/paiement.
 *
 * Auth : l'app n'a pas de tunnel de connexion classique. On ouvre une session
 * Firebase **anonyme** (à activer dans Firebase Console → Authentication →
 * Sign-in method → Anonymous) pour identifier le propriétaire (`owner_id`) et
 * satisfaire les règles de sécurité Firestore / Storage.
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

/** Renvoie l'uid courant, en ouvrant une session anonyme au besoin. */
export async function ensureSession(): Promise<string> {
  if (auth.currentUser) return auth.currentUser.uid;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user.uid;
  } catch {
    throw new VendorError(
      "auth",
      "Impossible d'ouvrir une session. Activez la connexion anonyme dans " +
        "Firebase Console → Authentication → Sign-in method → Anonymous.",
    );
  }
}

async function uploadPublicAsset(
  shopId: string,
  key: string,
  file: File,
): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const objectRef = ref(storage, `shops/${shopId}/${key}.${ext}`);
  try {
    await uploadBytes(objectRef, file, {
      contentType: file.type || undefined,
      cacheControl: "public,max-age=3600",
    });
    return await getDownloadURL(objectRef);
  } catch (error) {
    console.warn("[FasoLink] upload:", error);
    return null;
  }
}

export interface CreatedShop {
  id: string;
  slug: string;
}

/**
 * 1) crée la boutique dans la collection `shops` (statut `pending`)
 * 2) téléverse logo + photos produits dans Firebase Storage (`shops/<id>/…`)
 * 3) met à jour la boutique avec les URL de téléchargement
 */
export async function createShopWithAssets(
  draft: ShopDraft,
  logo: File | null,
  gallery: File[],
): Promise<CreatedShop> {
  if (!isFirebaseConfigured) {
    throw new VendorError("config", "Firebase n'est pas configuré.");
  }

  const ownerId = await ensureSession();
  const now = new Date().toISOString();
  const slug = `${slugify(draft.name)}-${Date.now().toString(36)}`;
  const id = slug; // id du document = slug (URL lisible)

  try {
    await setDoc(doc(db, COLLECTIONS.shops, id), {
      owner_id: ownerId,
      name: draft.name.trim(),
      slug,
      category: draft.category,
      description: draft.description.trim(),
      city: draft.city,
      neighborhood: draft.neighborhood?.trim() || null,
      latitude: null,
      longitude: null,
      opening_hours: STANDARD_HOURS,
      whatsapp: draft.whatsapp.trim(),
      logo_url: null,
      cover_url: null,
      gallery: [],
      status: "pending",
      verification_status: "unverified",
      is_featured: false,
      rating: 0,
      rating_count: 0,
      whatsapp_clicks: 0,
      created_at: now,
      updated_at: now,
    });
  } catch (error) {
    throw new VendorError(
      "insert",
      error instanceof Error
        ? error.message
        : "L'enregistrement de la boutique a échoué.",
    );
  }

  // Marque le profil comme vendeur (best-effort).
  void setDoc(
    doc(db, COLLECTIONS.profiles, ownerId),
    { role: "seller", updated_at: now },
    { merge: true },
  );

  // Téléversements + URL
  const patch: {
    logo_url?: string;
    cover_url?: string;
    gallery?: string[];
    updated_at: string;
  } = { updated_at: new Date().toISOString() };

  if (logo) {
    const url = await uploadPublicAsset(id, "logo", logo);
    if (url) patch.logo_url = url;
  }

  if (gallery.length) {
    const urls = await Promise.all(
      gallery.map((file, i) => uploadPublicAsset(id, `produit-${i + 1}`, file)),
    );
    const clean = urls.filter((u): u is string => Boolean(u));
    if (clean.length) {
      patch.gallery = clean;
      patch.cover_url = clean[0];
      if (!patch.logo_url) patch.logo_url = clean[0];
    }
  }

  if (Object.keys(patch).length > 1) {
    await updateDoc(doc(db, COLLECTIONS.shops, id), patch);
  }

  return { id, slug };
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
 * 1) crée un document dans `subscriptions` (started_at, expires_at, statut `active`)
 * 2) passe la boutique en statut `active` (= « publiée »)
 */
export async function activateSubscription(
  input: ActivationInput,
): Promise<ActivationResult> {
  if (!isFirebaseConfigured) {
    throw new VendorError("config", "Firebase n'est pas configuré.");
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

  try {
    await addDoc(collection(db, COLLECTIONS.subscriptions), {
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
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    });

    await updateDoc(doc(db, COLLECTIONS.shops, input.shopId), {
      status: "active",
      updated_at: now.toISOString(),
    });
  } catch (error) {
    throw new VendorError(
      "insert",
      error instanceof Error ? error.message : "L'activation a échoué.",
    );
  }

  return {
    reference,
    startedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    trial: Boolean(input.trial),
  };
}
