# Déploiement — Cloudflare Pages + Firebase

FasoLink est prêt pour **Cloudflare Pages** (`@cloudflare/next-on-pages`, App
Router sur runtime Edge) avec **Firebase** (Firestore · Auth · Storage).

## 1. Firebase

1. Créez un projet sur
   [console.firebase.google.com](https://console.firebase.google.com).
2. **Build → Firestore Database → Create database** (mode production, région
   `eur3` / `europe-west` conseillée).
3. **Build → Authentication → Get started → Sign-in method → Anonymous →
   Enable**. Le formulaire vendeur ouvre une session anonyme.
4. **Build → Storage → Get started** (bucket par défaut `<projet>.appspot.com`).
5. **⚙️ Project settings → General → Your apps → `</>` (Web)** → enregistrez
   l'app, copiez l'objet `firebaseConfig`.
6. Déployez les règles de sécurité :
   ```bash
   npm i -g firebase-tools && firebase login
   firebase use <project-id>
   firebase deploy --only firestore:rules,storage
   ```
   (ou copiez `firestore.rules` / `storage.rules` dans la console → *Rules*).
7. (Facultatif) `npm run seed` injecte les 9 boutiques de démonstration —
   nécessite une clé de compte de service : **Project settings → Service
   accounts → Generate new private key** → `serviceAccountKey.json` à la racine.

## 2. Cloudflare Pages

### Via le dashboard (recommandé)

1. Poussez le repo sur GitHub.
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Réglages de build :
   | Champ | Valeur |
   | ----- | ------ |
   | Framework preset | `Next.js` |
   | Build command | `npx @cloudflare/next-on-pages@1` |
   | Build output directory | `.vercel/output/static` |
4. **Settings → Runtime (ou Functions) → Compatibility flags** : ajoutez
   `nodejs_compat` (Production **et** Preview). Compatibility date ≥
   `2024-09-23`. Ces valeurs sont aussi dans [`wrangler.toml`](./wrangler.toml).
5. **Settings → Environment variables** (Production + Preview) :
   | Variable | Valeur (depuis `firebaseConfig`) |
   | -------- | ------ |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` |
   | `NODE_VERSION` | `20` |
   | `PAYMENT_WEBHOOK_SECRET` | secret partagé avec l'agrégateur (optionnel) |
6. **Save and Deploy**.
7. **Firebase Console → Authentication → Settings → Authorized domains** :
   ajoutez `fasolink.pages.dev` (et votre domaine custom) pour que la connexion
   anonyme fonctionne depuis le site déployé.

### Via la CLI

```bash
npm i -g wrangler
npm run pages:build          # -> .vercel/output/static  (nécessite Linux/macOS/WSL)
wrangler pages deploy .vercel/output/static
```

> ⚠️ `npm run pages:build` s'appuie sur `vercel build` (via `npx`), **peu fiable
> sous Windows natif** — utilisez WSL, macOS ou le build CI de Cloudflare Pages
> (Linux). Le build Next.js standard (`npm run build`) passe partout.

## 3. Runtime Edge — routes concernées

Ces routes exportent `export const runtime = "edge"` (obligatoire sur CF Pages).
Firestore y est appelé via le SDK **lite** (REST), compatible Edge/Workers.

| Route | Rôle |
| ----- | ---- |
| `/` | accueil, boutiques Firestore fraîches à chaque visite |
| `/boutiques/[id]` | fiche boutique (à la demande — les nouvelles boutiques marchent aussitôt) |
| `/boutiques/[id]/produits/[produit]` | fiche produit |
| `/vendeur/dashboard` | tableau de bord vendeur |
| `/vendeur/paiement` | simulateur (lit `?shop=`) |
| `/api/webhooks/payment` | webhook Mobile Money (HMAC-SHA256 via Web Crypto) |

Les autres pages sont **statiques** (`/inscription`, `/vendeur/inscription`,
`/vendeur/verification`, `/profil`, `/offline`, `manifest`, `sw.js`).

`next/image` est en `unoptimized` (pas d'optimiseur Node sur CF Pages).

> `src/lib/firebase.ts` initialise `db` (Firestore lite), `auth` et `storage`
> dans un seul fichier. Firestore lite est prévu pour l'Edge ; `auth` / `storage`
> ne sont utilisés que côté client. Si, après déploiement, les pages `/boutiques/*`
> renvoient une erreur d'init Firebase, isolez `auth` + `storage` dans un module
> importé uniquement par les composants clients (`firebase-client.ts`).

## 4. Webhook de paiement

Configurez chez l'agrégateur (CinetPay / PayDunya) :

```
URL      : https://<votre-domaine>/api/webhooks/payment
Méthode  : POST
Header   : x-payment-signature: <hex HMAC-SHA256(body, PAYMENT_WEBHOOK_SECRET)>
```

Sur `status: "ACCEPTED"`, la route cherche le document `subscriptions` par
`reference`, passe son `status` à `active` et publie la boutique
(`shops/<id>.status = active`).

> Firebase Admin ne tourne pas sur l'Edge. Pour un webhook réellement
> privilégié en production, déployez cette logique en **Firebase Cloud
> Function** appelée directement par l'agrégateur, ou signez un JWT de compte
> de service (RS256 via Web Crypto). Les règles Firestore livrées autorisent
> l'écriture par le propriétaire de la boutique (flux client `/vendeur/paiement`).
