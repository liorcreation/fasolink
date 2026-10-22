import { readFile } from "node:fs/promises";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { getBytes, ref, uploadString } from "firebase/storage";

const projectId = "demo-fasolink-rules";
const passwordClaims = { firebase: { sign_in_provider: "password" } };
const superAdminClaims = { ...passwordClaims, superAdmin: true };
const oldAdminClaims = { ...passwordClaims, admin: true };
const shopFixture = (ownerId, overrides = {}) => ({
  owner_id: ownerId,
  name: "Boutique test FasoLink",
  slug: "boutique-test",
  category: "electronique",
  subcategory: "telephonie",
  description: "Une boutique locale de matériel électronique.",
  city: "Ouagadougou",
  neighborhood: null,
  latitude: null,
  longitude: null,
  opening_hours: {},
  whatsapp: "+22670000000",
  logo_url: null,
  cover_url: null,
  gallery: [],
  status: "active",
  verification_status: "unverified",
  is_featured: false,
  rating: 0,
  rating_count: 0,
  whatsapp_clicks: 0,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const env = await initializeTestEnvironment({
  projectId,
  firestore: {
    rules: await readFile(new URL("../firestore.rules", import.meta.url), "utf8"),
  },
  storage: {
    rules: await readFile(new URL("../storage.rules", import.meta.url), "utf8"),
  },
});

async function seed() {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "shops/shop-1"), shopFixture("owner-1"));
    await setDoc(doc(db, "shops/shop-suspended"), shopFixture("owner-1", { status: "suspended" }));
    await setDoc(doc(db, "products/product-1"), {
      shop_id: "shop-1", name: "Téléphone", description: "Téléphone de test", price: 100000,
      currency: "FCFA", image_url: null, availability: "in_stock",
      created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z",
    });
    await setDoc(doc(db, "verification_requests/private-1"), {
      shop_id: "shop-1", owner_id: "owner-1", status: "pending",
    });
  });
}

async function run(name, test) {
  await test();
  console.log(`✓ ${name}`);
}

try {
  await seed();
  const ownerDb = env.authenticatedContext("owner-1", passwordClaims).firestore();
  const buyerDb = env.authenticatedContext("buyer-1", passwordClaims).firestore();
  const anonymousDb = env.authenticatedContext("anonymous-1", {
    firebase: { sign_in_provider: "anonymous" },
  }).firestore();
  const superAdminDb = env.authenticatedContext("superadmin-1", superAdminClaims).firestore();
  const oldAdminDb = env.authenticatedContext("old-admin-1", oldAdminClaims).firestore();

  await run("propriétaire : modification publique autorisée", () => assertSucceeds(
    updateDoc(doc(ownerDb, "shops/shop-1"), { name: "Boutique modifiée", updated_at: new Date().toISOString() }),
  ));
  await run("propriétaire : activation/suspension directe interdite", () => assertFails(
    updateDoc(doc(ownerDb, "shops/shop-1"), { status: "suspended", updated_at: new Date().toISOString() }),
  ));
  await run("visiteur : compteur WhatsApp forgé interdit", () => assertFails(
    updateDoc(doc(buyerDb, "shops/shop-1"), { whatsapp_clicks: 1 }),
  ));
  await run("vendeur : création de produit dans sa boutique autorisée", () => assertSucceeds(
    setDoc(doc(ownerDb, "products/owner-product"), {
      shop_id: "shop-1", name: "Ordinateur test", description: "Annonce autorisée", price: 200000,
      currency: "FCFA", image_url: null, availability: "in_stock",
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }),
  ));
  await run("autre vendeur : ajout dans une boutique étrangère interdit", () => assertFails(
    setDoc(doc(buyerDb, "products/forged-product"), {
      shop_id: "shop-1", name: "Annonce pirate", description: "Écriture non autorisée", price: 1,
      currency: "FCFA", image_url: null, availability: "in_stock",
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }),
  ));
  await run("visiteur : événement WhatsApp borné et autorisé", () => assertSucceeds(
    setDoc(doc(buyerDb, "contact_events/buyer-1_shop-1"), {
      shop_id: "shop-1", product_id: "product-1", actor_uid: "buyer-1",
      channel: "whatsapp", created_at: new Date().toISOString(),
    }),
  ));
  await run("visiteur : événement en double immuable interdit", () => assertFails(
    setDoc(doc(buyerDb, "contact_events/buyer-1_shop-1"), {
      shop_id: "shop-1", product_id: "product-1", actor_uid: "buyer-1",
      channel: "whatsapp", created_at: new Date().toISOString(),
    }),
  ));
  await run("vendeur : ne peut pas s’auto-noter", () => assertFails(
    setDoc(doc(ownerDb, "reviews/owner-review"), {
      shop_id: "shop-1", author_id: "owner-1", author_name: "Vendeur", is_verified: false,
      rating: 5, comment: "Avis de test de mon commerce", created_at: new Date().toISOString(),
    }),
  ));
  await run("vendeur : avis valide autorisé à un visiteur", () => assertSucceeds(
    setDoc(doc(buyerDb, "reviews/buyer-review"), {
      shop_id: "shop-1", author_id: "buyer-1", author_name: "Visiteur", is_verified: false,
      rating: 5, comment: "Très bon produit et vendeur sérieux", created_at: new Date().toISOString(),
    }),
  ));
  await run("ancien claim admin : accès privé refusé", () => assertFails(
    getDoc(doc(oldAdminDb, "verification_requests/private-1")),
  ));
  await run("Super Admin : accès au dossier privé autorisé", () => assertSucceeds(
    getDoc(doc(superAdminDb, "verification_requests/private-1")),
  ));
  await run("création de boutique avec statut initial pending autorisée", () => assertSucceeds(
    setDoc(doc(ownerDb, "shops/owner-new-shop"), shopFixture("owner-1", { status: "pending" })),
  ));
  await run("création de boutique avec statut initial actif refusée", () => assertFails(
    setDoc(doc(ownerDb, "shops/shop-forged"), shopFixture("owner-1")),
  ));

  const requestId = "valid-request-1";
  const requestData = {
    shop_id: "shop-1", owner_id: "owner-1", document_type: "cnib", document_number: "AB12345",
    full_name: "Vendeur Faso", recto_path: `verification_requests/owner-1/${requestId}/recto.jpg`,
    verso_path: null, latitude: 12.37, longitude: -1.52, status: "pending", rejection_reason: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  await run("demande de vérification + statut pending atomiques autorisés", async () => {
    const batch = writeBatch(ownerDb);
    batch.set(doc(ownerDb, `verification_requests/${requestId}`), requestData);
    batch.update(doc(ownerDb, "shops/shop-1"), {
      verification_status: "pending", verification_request_id: requestId,
      latitude: 12.37, longitude: -1.52, updated_at: new Date().toISOString(),
    });
    await assertSucceeds(batch.commit());
  });
  await run("changement de statut vérifié sans dossier atomique refusé", () => assertFails(
    updateDoc(doc(ownerDb, "shops/shop-suspended"), { verification_status: "pending", updated_at: new Date().toISOString() }),
  ));
  await run("session anonyme : création de boutique refusée", () => assertFails(
    setDoc(doc(anonymousDb, "shops/anonymous-shop"), shopFixture("anonymous-1", { status: "pending" })),
  ));
  await run("Super Admin : accès au journal et aux licences autorisé", async () => {
    await assertSucceeds(getDoc(doc(superAdminDb, "admin_audit_logs/audit-1")));
    await assertFails(getDoc(doc(oldAdminDb, "admin_audit_logs/audit-1")));
  });

  const ownerStorage = env.authenticatedContext("owner-1", passwordClaims).storage();
  const buyerStorage = env.authenticatedContext("buyer-1", passwordClaims).storage();
  const anonymousStorage = env.authenticatedContext("anonymous-1", { firebase: { sign_in_provider: "anonymous" } }).storage();
  const oldAdminStorage = env.authenticatedContext("old-admin-1", oldAdminClaims).storage();
  const superAdminStorage = env.authenticatedContext("superadmin-1", superAdminClaims).storage();
  const image = "aGVsbG8=";
  const imageOptions = { contentType: "image/png" };
  await run("propriétaire : téléversement logo d’une boutique autorisé", () => assertSucceeds(
    uploadString(ref(ownerStorage, "shops/shop-1/logo.png"), image, "base64", imageOptions),
  ));
  await run("autre utilisateur : écriture dans boutique interdite", () => assertFails(
    uploadString(ref(buyerStorage, "shops/shop-1/rogue.png"), image, "base64", imageOptions),
  ));
  await run("boutique suspendue : nouvel upload interdit", () => assertFails(
    uploadString(ref(ownerStorage, "shops/shop-suspended/logo.png"), image, "base64", imageOptions),
  ));
  await run("session anonyme : upload de pièce de vérification interdit", () => assertFails(
    uploadString(ref(anonymousStorage, "verification_requests/anonymous-1/request-1/recto.jpg"), image, "base64", imageOptions),
  ));
  await run("visiteur : lecture de pièce privée interdite", () => assertFails(
    getBytes(ref(buyerStorage, "verification_requests/owner-1/private-1/recto.jpg")),
  ));
  await run("ancien claim admin : lecture de pièce privée interdite", () => assertFails(
    getBytes(ref(oldAdminStorage, "verification_requests/owner-1/private-1/recto.jpg")),
  ));
  await run("Super Admin : lecture de pièce privée permise", async () => {
    const path = ref(ownerStorage, "verification_requests/owner-1/private-1/recto.jpg");
    await uploadString(path, image, "base64", imageOptions);
    await assertSucceeds(getBytes(ref(superAdminStorage, "verification_requests/owner-1/private-1/recto.jpg")));
  });

  console.log("\nTous les tests de règles Firestore et Storage ont réussi.");
} finally {
  await env.cleanup();
}
