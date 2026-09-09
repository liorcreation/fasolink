/**
 * Injecte le jeu de démonstration (src/lib/mock-data.ts) dans Firestore.
 *
 *   npm run seed
 *
 * Authentification (Admin SDK) — l'un des deux :
 *   • un fichier `serviceAccountKey.json` à la racine (git-ignoré), OU
 *   • la variable d'env `FIREBASE_SERVICE_ACCOUNT` = contenu JSON de la clé.
 * Console Firebase → Project settings → Service accounts → Generate new private key.
 *
 * Idempotent : `set()` par identifiant de document, relançable sans doublon.
 */
import { readFileSync } from "node:fs";
import { cert, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { MOCK_SHOPS } from "../src/lib/mock-data";

// ── chargement minimal de .env.local ──────────────────────────────
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  /* pas de .env.local */
}

function loadServiceAccount(): ServiceAccount {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) as ServiceAccount;
  }
  try {
    return JSON.parse(
      readFileSync("serviceAccountKey.json", "utf8"),
    ) as ServiceAccount;
  } catch {
    console.error(
      "❌ Clé de compte de service introuvable.\n" +
        "   Placez serviceAccountKey.json à la racine, ou définissez " +
        "FIREBASE_SERVICE_ACCOUNT dans .env.local.",
    );
    process.exit(1);
  }
}

initializeApp({ credential: cert(loadServiceAccount()) });
const db = getFirestore();
const DEMO_OWNER = "seed-demo-owner";

async function main() {
  const now = new Date().toISOString();
  let shopCount = 0;
  let productCount = 0;

  await db
    .collection("profiles")
    .doc(DEMO_OWNER)
    .set(
      {
        role: "seller",
        full_name: "Boutique Démo FasoLink",
        created_at: now,
        updated_at: now,
      },
      { merge: true },
    );

  for (const shop of MOCK_SHOPS) {
    const { products, reviews, ...shopFields } = shop;

    await db
      .collection("shops")
      .doc(shop.id)
      .set({ ...shopFields, owner_id: DEMO_OWNER, status: "active" });
    shopCount++;

    for (const p of products) {
      await db.collection("products").doc(p.id).set(p);
      productCount++;
    }

    for (const r of reviews ?? []) {
      await db.collection("reviews").doc(r.id).set(r);
    }

    const end = new Date();
    end.setDate(end.getDate() + 30);
    await db
      .collection("subscriptions")
      .doc(`seed-${shop.slug}`)
      .set({
        shop_id: shop.id,
        plan: "mensuel",
        status: "active",
        provider: "orange_money",
        gateway: "seed",
        amount: 5000,
        phone: null,
        reference: `SEED-${shop.slug}`,
        trial_ends_at: null,
        started_at: now,
        expires_at: end.toISOString(),
        created_at: now,
        updated_at: now,
      });

    console.log(`  ✓ ${shop.name} (${products.length} produits)`);
  }

  console.log(
    `\n✅ Seed terminé : ${shopCount} boutiques, ${productCount} produits.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
