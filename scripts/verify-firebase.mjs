/**
 * Vérifie l'intégration Firebase de bout en bout, en rejouant ce que fait
 * l'application (connexion anonyme + écriture/lecture Firestore + règles).
 *
 *   node --env-file=.env.local scripts/verify-firebase.mjs
 */
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore/lite";

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const ok = (m) => console.log("  \x1b[32m✓\x1b[0m " + m);
const ko = (m) => console.log("  \x1b[31m✗\x1b[0m " + m);

let failed = false;

console.log(`\nProjet : ${cfg.projectId}\n`);

if (!cfg.apiKey || !cfg.projectId) {
  ko("Config manquante — lance avec: node --env-file=.env.local scripts/verify-firebase.mjs");
  process.exit(1);
}
ok("Config Firebase chargée");

const app = initializeApp(cfg);
const auth = getAuth(app);
const db = (await import("firebase/firestore/lite")).getFirestore(app);

// 1. Connexion anonyme
let uid;
try {
  const cred = await signInAnonymously(auth);
  uid = cred.user.uid;
  ok(`Connexion anonyme — uid ${uid.slice(0, 8)}…`);
} catch (e) {
  ko(`Connexion anonyme ÉCHOUÉE : ${e.code || e.message}`);
  if (String(e.code).includes("operation-not-allowed") || String(e.code).includes("admin-restricted")) {
    console.log(
      "\n  → Active « Anonymous » dans :\n" +
        `    https://console.firebase.google.com/project/${cfg.projectId}/authentication/providers\n`,
    );
  }
  process.exit(1);
}

const testId = `__verify-${Date.now().toString(36)}`;
const now = new Date().toISOString();

// 2. Création d'une boutique (comme createShopWithAssets)
try {
  await setDoc(doc(db, "shops", testId), {
    owner_id: uid,
    name: "Boutique Test Vérif",
    slug: testId,
    category: "alimentation",
    description: "Document de vérification automatique — sera supprimé.",
    city: "Ouagadougou",
    neighborhood: null,
    latitude: null,
    longitude: null,
    opening_hours: null,
    whatsapp: "+22600000000",
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
  ok("Écriture Firestore : création boutique (règles OK)");
} catch (e) {
  ko(`Création boutique ÉCHOUÉE : ${e.code || e.message}`);
  console.log(
    "\n  → Les règles Firestore ne sont pas déployées ? Lance:\n" +
      "    firebase deploy --only firestore:rules\n",
  );
  process.exit(1);
}

// 3. Abonnement + publication (comme activateSubscription)
try {
  await setDoc(doc(db, "subscriptions", testId), {
    shop_id: testId,
    plan: "mensuel",
    status: "active",
    provider: "orange_money",
    gateway: "verify",
    amount: 5000,
    phone: null,
    reference: `VERIFY-${testId}`,
    trial_ends_at: null,
    started_at: now,
    expires_at: now,
    created_at: now,
    updated_at: now,
  });
  await updateDoc(doc(db, "shops", testId), { status: "active" });
  ok("Abonnement créé + boutique publiée (status → active)");
} catch (e) {
  ko(`Activation abonnement ÉCHOUÉE : ${e.code || e.message}`);
  failed = true;
}

// 4. Lecture (comme fetchShops / fetchShopById)
try {
  const snap = await getDoc(doc(db, "shops", testId));
  if (snap.exists() && snap.data().status === "active") {
    ok("Lecture fiche boutique : status = active");
  } else {
    ko("Lecture fiche boutique : données inattendues");
    failed = true;
  }

  const list = await getDocs(
    query(collection(db, "shops"), where("status", "==", "active")),
  );
  ok(`Requête « boutiques actives » : ${list.size} résultat(s)`);
} catch (e) {
  ko(`Lecture ÉCHOUÉE : ${e.code || e.message}`);
  failed = true;
}

// 5. contact_events (comme trackContact)
let contactRef;
try {
  const { addDoc } = await import("firebase/firestore/lite");
  contactRef = await addDoc(collection(db, "contact_events"), {
    shop_id: testId,
    product_id: null,
    channel: "whatsapp",
    created_at: now,
  });
  ok("Journalisation contact WhatsApp (contact_events)");
} catch (e) {
  ko(`contact_events ÉCHOUÉ : ${e.code || e.message}`);
  failed = true;
}

// 6. Nettoyage (dans l'ordre : la boutique doit exister pour valider ownsShop)
try {
  if (contactRef) await deleteDoc(contactRef);
  await deleteDoc(doc(db, "subscriptions", testId));
  await deleteDoc(doc(db, "shops", testId));
  ok("Nettoyage des documents de test");
} catch (e) {
  ko(`Nettoyage partiel (à supprimer à la main) : ${e.code || e.message}`);
  failed = true;
}

console.log(
  failed
    ? "\n\x1b[31m✗ Des vérifications ont échoué (voir ci-dessus).\x1b[0m\n"
    : "\n\x1b[32m✓ Firebase est opérationnel : auth anonyme + Firestore + règles OK.\x1b[0m\n",
);
process.exit(failed ? 1 : 0);
