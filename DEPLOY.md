# Déploiement — Cloudflare Pages + Firebase

FasoLink est servi par **Cloudflare Pages** (`@cloudflare/next-on-pages`) avec
**Firebase** (Firestore · Auth · Storage). Le webhook Mobile Money est Edge et
utilise Firestore REST avec un JWT signé côté serveur.

## 1. Firebase

1. Créez un projet sur
   [console.firebase.google.com](https://console.firebase.google.com).
2. **Build → Firestore Database → Create database** (mode production, région
   `eur3` / `europe-west` conseillée).
3. **Build → Authentication → Get started → Sign-in method** : activez
   **Email/Password** pour les comptes et **Anonymous** pour l'onboarding vendeur.
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
   | `PAYMENT_WEBHOOK_SECRET` | secret partagé avec l'agrégateur |
   | `FIREBASE_SERVICE_ACCOUNT` | JSON du compte de service Firebase, secret |
   | `CRON_SECRET` | secret du job quotidien d'expiration |
   | `NEXT_PUBLIC_SITE_URL` | URL publique FasoLink |
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
| `/api/webhooks/payment` | webhook Mobile Money Edge (JWT Firestore + HMAC) |
| `/api/cron/expire` | expiration quotidienne protégée par `CRON_SECRET` |

Les autres pages sont **statiques** (`/inscription`, `/vendeur/inscription`,
`/vendeur/verification`, `/profil`, `/offline`, `manifest`, `sw.js`).

`next/image` est en `unoptimized` (pas d'optimiseur Node sur CF Pages).

> `src/lib/firebase.ts` initialise `db` (Firestore lite), `auth` et `storage`
> dans un seul fichier. Firestore lite est prévu pour l'Edge ; `auth` / `storage`
> ne sont utilisés que côté client. Si, après déploiement, les pages `/boutiques/*`
> renvoient une erreur d'init Firebase, isolez `auth` + `storage` dans un module
> importé uniquement par les composants clients (`firebase-client.ts`).

## 4. Webhook de paiement

La route utilise `FIREBASE_SERVICE_ACCOUNT` uniquement côté serveur Edge pour
signer un JWT Google et appeler l'API Firestore REST. Configurez ce JSON comme
secret Cloudflare Pages, ainsi que `PAYMENT_WEBHOOK_SECRET`.

Configurez chez l'agrégateur (CinetPay / PayDunya) :

```
URL      : https://<votre-domaine>/api/webhooks/payment
Méthode  : POST
Header   : x-payment-signature: <hex HMAC-SHA256(body, PAYMENT_WEBHOOK_SECRET)>
```

Sur `status: "ACCEPTED"`, la route cherche le document `subscriptions` par
`reference`, passe son `status` à `active` et publie la boutique
(`shops/<id>.status = active`).

Le handler vérifie la signature, la référence, le montant et l'état `pending`,
puis active l'abonnement et publie la boutique via Firestore REST. Le client ne
peut plus publier une boutique payante par lui-même.

## 5. Expiration automatique

Appelez chaque jour :

```text
POST https://<domaine>/api/cron/expire
Authorization: Bearer <CRON_SECRET>
```

Le job passe les abonnements échus à `expired` et suspend la boutique si aucun
autre abonnement valide ne subsiste. Un planificateur Cloudflare Worker,
GitHub Actions ou un cron de serveur peut effectuer cet appel.

Le dépôt contient déjà `workers/expire-cron.js` et
`workers/wrangler.toml` pour le planificateur Cloudflare quotidien (03:00 UTC,
soit 03:00 au Burkina Faso). Déploiement :

```bash
npx wrangler deploy --config workers/wrangler.toml
npx wrangler secret put CRON_SECRET --config workers/wrangler.toml
```

## 6. Rôle super administrateur

Le super administrateur gère les accès aux boutiques depuis **/admin → Licences
& accès boutiques**. Il peut offrir ou valider une licence, définir sa durée,
prolonger l'accès en accordant une nouvelle période et révoquer un abonnement.
Toutes les décisions effectuées depuis l'interface sont consignées dans la
collection Firestore `admin_audit_logs`, dont la lecture est réservée au rôle
super administrateur et dont les documents ne sont pas modifiables depuis
l'application.

Après création du compte du propriétaire, attribuez les claims à l'adresse exacte
du client depuis un poste de confiance :

```bash
npm run superadmin:set -- proprietaire@domaine.bf
```

La commande nécessite `FIREBASE_SERVICE_ACCOUNT` dans `.env.local` ou le fichier
local ignoré `firebase-service-account.json`, préserve les claims existants et
ajoute `admin: true` et `superAdmin: true`. Le client doit se déconnecter puis se
reconnecter. Déployez ensuite les règles mises à jour :

```bash
npx firebase-tools deploy --only firestore:rules --project fasolink-d6e77
```

Ne mettez jamais la clé de service dans Git ou dans un PDF. La création du rôle
nécessite l'adresse e-mail exacte du compte Firebase du propriétaire.
