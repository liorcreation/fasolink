/**
 * Injecte le jeu de données de démonstration (src/lib/mock-data.ts) dans Supabase.
 *
 *   npm run seed
 *
 * Requis dans .env.local :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (Settings → API → service_role)
 *
 * Le script :
 *   1. crée (ou réutilise) un compte vendeur de démo  → seller@fasolink.demo
 *   2. upsert les 8 boutiques + 24 produits + avis
 *   3. crée un abonnement « active » pour chaque boutique
 *
 * Idempotent : relançable sans créer de doublons (upsert par slug / id).
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { MOCK_SHOPS } from "../src/lib/mock-data";
import type { Database } from "../src/lib/database.types";

// ── chargement minimal de .env.local ─────────────────────────────
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* pas de .env.local — on compte sur l'environnement */
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (.env.local).",
  );
  process.exit(1);
}

const db = createClient<Database>(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEMO_EMAIL = "seller@fasolink.demo";
const DEMO_PASSWORD = "FasoLink-demo-2026";

async function getOrCreateSeller(): Promise<string> {
  const { data: list } = await db.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email === DEMO_EMAIL);
  if (existing) return existing.id;

  const { data, error } = await db.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Boutique Démo FasoLink", role: "seller" },
  });
  if (error || !data.user) throw error ?? new Error("createUser a échoué");
  return data.user.id;
}

async function main() {
  console.log("→ Vendeur de démo…");
  const ownerId = await getOrCreateSeller();
  await db
    .from("profiles")
    .upsert({ id: ownerId, full_name: "Boutique Démo FasoLink", role: "seller" });

  let shopCount = 0;
  let productCount = 0;

  for (const shop of MOCK_SHOPS) {
    const { data: saved, error } = await db
      .from("shops")
      .upsert(
        {
          id: shop.id,
          owner_id: ownerId,
          name: shop.name,
          slug: shop.slug,
          category: shop.category,
          description: shop.description,
          city: shop.city,
          neighborhood: shop.neighborhood,
          latitude: shop.latitude,
          longitude: shop.longitude,
          opening_hours: shop.opening_hours,
          whatsapp: shop.whatsapp,
          logo_url: shop.logo_url,
          cover_url: shop.cover_url,
          gallery: shop.gallery,
          status: "active",
          verification_status: shop.verification_status,
          is_featured: shop.is_featured,
          rating: shop.rating,
          rating_count: shop.rating_count,
        },
        { onConflict: "id" },
      )
      .select("id")
      .single();

    if (error || !saved) {
      console.error(`  ✗ ${shop.name}:`, error?.message);
      continue;
    }
    shopCount++;

    if (shop.products.length) {
      const { error: pErr } = await db.from("products").upsert(
        shop.products.map((p) => ({
          id: p.id,
          shop_id: saved.id,
          name: p.name,
          description: p.description,
          price: p.price,
          currency: p.currency,
          image_url: p.image_url,
          availability: p.availability,
        })),
        { onConflict: "id" },
      );
      if (pErr) console.error(`  ✗ produits ${shop.name}:`, pErr.message);
      else productCount += shop.products.length;
    }

    if (shop.reviews?.length) {
      await db.from("reviews").upsert(
        shop.reviews.map((r) => ({
          id: r.id,
          shop_id: saved.id,
          author_name: r.author_name,
          rating: r.rating,
          comment: r.comment,
          is_verified: true,
        })),
        { onConflict: "id" },
      );
    }

    const end = new Date();
    end.setDate(end.getDate() + 30);
    await db.from("subscriptions").upsert(
      {
        shop_id: saved.id,
        plan: "mensuel",
        status: "active",
        provider: "orange_money",
        gateway: "seed",
        amount: 5000,
        reference: `SEED-${shop.slug}`,
        started_at: new Date().toISOString(),
        expires_at: end.toISOString(),
      },
      { onConflict: "reference" },
    );

    console.log(`  ✓ ${shop.name} (${shop.products.length} produits)`);
  }

  console.log(
    `\n✅ Seed terminé : ${shopCount} boutiques, ${productCount} produits.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
