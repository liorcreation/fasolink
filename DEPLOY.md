# Déploiement — Cloudflare Pages + Supabase

FasoLink est prêt pour **Cloudflare Pages** (`@cloudflare/next-on-pages`, App
Router sur runtime Edge) avec **Supabase** comme base de données.

## 1. Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. **SQL Editor** → collez et exécutez [`schema.sql`](./schema.sql)
   (tables `profiles`, `shops`, `products`, `subscriptions`, `reviews`,
   `contact_events` + enums, triggers, RLS, bucket Storage `shop-assets`).
3. **Authentication → Providers → Anonymous sign-ins → Enable**
   (le formulaire vendeur ouvre une session anonyme pour les policies RLS).
4. **Settings → API** → notez `Project URL`, `anon public`, `service_role`.
5. (Facultatif) `npm run seed` injecte les 9 boutiques de démonstration.

## 2. Cloudflare Pages

### Via le dashboard (recommandé)

1. Poussez le repo sur GitHub / GitLab.
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Réglages de build :
   | Champ | Valeur |
   | ----- | ------ |
   | Framework preset | `Next.js` |
   | Build command | `npm run pages:build` |
   | Build output directory | `.vercel/output/static` |
   | Node version | `20` (variable `NODE_VERSION=20`) |
4. **Settings → Functions → Compatibility flags** : ajoutez `nodejs_compat`
   (Production **et** Preview). Compatibility date ≥ `2024-09-23`.
   Ces valeurs sont aussi dans [`wrangler.toml`](./wrangler.toml).
5. **Settings → Environment variables** (Production + Preview) :
   | Variable | Valeur |
   | -------- | ------ |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ…` (anon public) |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ…` (secret — webhook uniquement) |
   | `PAYMENT_WEBHOOK_SECRET` | secret partagé avec l'agrégateur Mobile Money |
6. **Deploy**.

### Via la CLI

```bash
npm i -g wrangler
npm run pages:build          # -> .vercel/output/static  (nécessite Linux/macOS/WSL)
wrangler pages deploy .vercel/output/static
```

> ⚠️ `npm run pages:build` s'appuie sur `vercel build` (via `npx`), **peu fiable
> sous Windows natif** — utilisez WSL, macOS ou le build CI de Cloudflare Pages
> (qui tourne sous Linux). Le build Next.js standard (`npm run build`) passe
> sur toutes les plateformes.

## 3. Runtime Edge — routes concernées

Ces routes exportent `export const runtime = "edge"` (obligatoire sur CF Pages) :

| Route | Rôle |
| ----- | ---- |
| `/` | accueil, données Supabase fraîches |
| `/boutiques/[id]` | fiche boutique (rendue à la demande — les nouvelles boutiques marchent aussitôt) |
| `/boutiques/[id]/produits/[produit]` | fiche produit |
| `/vendeur/dashboard` | tableau de bord vendeur |
| `/vendeur/paiement` | simulateur (lit `?shop=`) |
| `/api/webhooks/payment` | webhook Mobile Money (HMAC-SHA256 via Web Crypto) |

Les autres pages sont **statiques** (`/inscription`, `/vendeur/inscription`,
`/vendeur/verification`, `/profil`, `/offline`, `manifest`, `sw.js`).

`next/image` est en `unoptimized` (Cloudflare Pages n'a pas d'optimiseur Node) —
les URL Unsplash/Supabase sont déjà dimensionnées.

## 4. Webhook de paiement

Configurez chez l'agrégateur (CinetPay / PayDunya) :

```
URL      : https://<votre-domaine>/api/webhooks/payment
Méthode  : POST
Header   : x-payment-signature: <hex HMAC-SHA256(body, PAYMENT_WEBHOOK_SECRET)>
```

Sur réception d'un paiement `ACCEPTED`, la route active l'abonnement
(`subscriptions.status = active`) et publie la boutique (`shops.status = active`).
