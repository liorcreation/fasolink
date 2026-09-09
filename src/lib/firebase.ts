import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore/lite";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

/**
 * Initialisation Firebase pour FasoLink.
 *
 * Variables d'environnement (voir .env.local.example) :
 *   NEXT_PUBLIC_FIREBASE_API_KEY
 *   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 *   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 *   NEXT_PUBLIC_FIREBASE_APP_ID
 *
 * Firestore utilise le SDK **lite** (REST, compatible runtime Edge / Cloudflare
 * Pages) — pas de listeners temps réel, ce dont FasoLink n'a pas besoin.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Vrai si Firebase est configuré (sinon : mode démo avec `mock-data.ts`). */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

if (!isFirebaseConfigured && process.env.NODE_ENV === "development") {
  // eslint-disable-next-line no-console
  console.warn(
    "[FasoLink] Firebase non configuré — mode démo (données de mock-data.ts). " +
      "Copiez .env.local.example vers .env.local et renseignez vos clés Firebase.",
  );
}

// Valeurs de repli pour que l'app se charge même sans configuration (les appels
// réseau échoueront mais l'UI reste navigable grâce aux données de démo).
const resolvedConfig = isFirebaseConfigured
  ? firebaseConfig
  : {
      apiKey: "demo-api-key",
      authDomain: "demo.firebaseapp.com",
      projectId: "demo-fasolink",
      storageBucket: "demo-fasolink.appspot.com",
      messagingSenderId: "0",
      appId: "1:0:web:demo",
    };

export const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(resolvedConfig);

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

/** Noms des collections Firestore. */
export const COLLECTIONS = {
  profiles: "profiles",
  shops: "shops",
  products: "products",
  subscriptions: "subscriptions",
  reviews: "reviews",
  contactEvents: "contact_events",
} as const;
