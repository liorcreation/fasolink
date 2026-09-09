import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Client Supabase typé pour FasoLink.
 *
 * Variables d'environnement requises (voir .env.local.example) :
 *  - NEXT_PUBLIC_SUPABASE_URL
 *  - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Indique si Supabase est configuré (permet un mode démo hors-ligne). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && process.env.NODE_ENV === "development") {
  // eslint-disable-next-line no-console
  console.warn(
    "[FasoLink] Supabase non configuré — l'application tourne en mode démo. " +
      "Copiez .env.local.example vers .env.local et renseignez vos clés.",
  );
}

/**
 * Instance partagée du client navigateur.
 * En mode démo (clés absentes), on fournit des valeurs factices : les appels
 * réseau échoueront mais l'UI reste navigable avec les données de démonstration.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl ?? "https://demo.supabase.co",
  supabaseAnonKey ?? "public-anon-key-demo",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

/**
 * Crée un client serveur avec la clé service-role (API routes / Server Actions).
 * Ne jamais importer ce helper dans un composant client.
 */
export function createServiceClient(): SupabaseClient<Database> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "[FasoLink] SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL manquant.",
    );
  }
  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Nom du bucket Storage pour les logos et galeries boutiques.
export const SHOP_ASSETS_BUCKET = "shop-assets";
