# FasoLink — Consommer Burkinabè 🇧🇫

Annuaire et **marketplace** dynamique pour la promotion des commerçants,
artisans et producteurs locaux du Burkina Faso. Vitrine premium,
mobile-first, contact WhatsApp direct.

## Stack

| Couche      | Technologie                                             |
| ----------- | ------------------------------------------------------- |
| Framework   | Next.js 14 (App Router) + TypeScript                    |
| Style / UI  | Tailwind CSS · Lucide React · Framer Motion             |
| Backend     | Supabase (PostgreSQL · Auth · Storage)                  |
| Utilitaires | clsx · tailwind-merge · qrcode                          |
| PWA         | Web App Manifest + service worker maison (offline-first)|

## Démarrage

```bash
npm install
cp .env.local.example .env.local   # renseignez vos clés Supabase
npm run dev
```

> Sans clés Supabase, l'application tourne en **mode démo** avec le jeu de
> données `src/lib/mock-data.ts` (9 boutiques, 27 produits) — toutes les pages
> restent navigables. Avec Supabase : `npm run seed` injecte ce même jeu.

## Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Éditeur SQL → collez le contenu de [`schema.sql`](./schema.sql) et exécutez.
   Cela crée les tables `profiles`, `shops`, `products`, `subscriptions`,
   `reviews`, `contact_events`, les policies RLS, les triggers et le bucket
   Storage public `shop-assets`.
3. **Auth → Providers → activez « Anonymous sign-ins »**. Le formulaire vendeur
   ouvre une session anonyme pour satisfaire les policies RLS (`owner_id`,
   `subscriptions`, upload Storage) sans imposer une inscription complète.
4. Settings → API → copiez `Project URL` et `anon public key` dans `.env.local`.
5. (Optionnel) Régénérez les types :
   `npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts`

### Flux vendeur connecté (`src/lib/vendor.ts`)

| Étape | Action Supabase |
| ----- | --------------- |
| `/vendeur/inscription` — soumission | `signInAnonymously()` → `insert` dans `shops` (statut `pending`) → upload logo + photos vers `shop-assets` → `update` `shops` avec `logo_url` / `cover_url` / `gallery` (URL publiques) → redirection vers `/vendeur/paiement?shop=<id>` |
| `/vendeur/paiement` — paiement validé | `insert` dans `subscriptions` (`started_at`, `expires_at` = +30 j × durée, `status` `active`, provider Orange/Moov/Wave) → `update` `shops.status` = `active` (publiée) → redirection `/boutiques/<id>?published=1` + toast « Félicitations, votre boutique est en ligne ! » |
| Essai 14 j | même flux, `subscriptions.status` = `trialing`, `trial_ends_at` = +14 j, montant 0 |

> Le webhook `/api/webhooks/payment` reste la voie d'activation en production
> réelle (confirmation asynchrone de l'agrégateur). La page `/vendeur/paiement`
> écrit directement pour la démo interactive.

## Structure

```
src/
├── app/
│   ├── page.tsx                    # Accueil : hero, carrousel vedettes, explorateur
│   ├── inscription/                # Choix profil Acheteur / Vendeur
│   ├── profil/                     # Espace compte (cible « Mon Profil »)
│   ├── vendeur/
│   │   ├── inscription/            # Formulaire boutique (+ upload logo/photos)
│   │   ├── paiement/               # Essai 14 j + Orange / Moov / Wave (simulation)
│   │   ├── dashboard/              # Stats contacts, essai, vérif, QR Code
│   │   └── verification/           # Dossier CNIB / NIF + géoloc
│   ├── boutiques/[id]/             # Fiche vitrine + galerie + avis + CTA collant
│   │   └── produits/[produit]/     # Fiche produit dédiée
│   ├── offline/                    # Page de secours PWA
│   ├── manifest.ts                 # Web App Manifest
│   └── api/webhooks/payment/       # Webhook d'activation Mobile Money
├── components/
│   ├── site/                       # Navbar, Footer, Logo, BottomNav (mobile)
│   ├── home/                       # Hero, PredictiveSearch, SearchExplorer,
│   │                               #   FeaturedCarousel (snap-scroll), ImpactCounter
│   ├── shops/                      # ShopCard, ProductCard, ShopGallery, WhatsAppButton,
│   │                               #   StickyContactBar, AvailabilityBadge, OpenStatus,
│   │                               #   VerifiedBadge, ReviewsSection
│   ├── vendeur/                    # ShopRegistrationForm, PaymentSimulator,
│   │                               #   VendorDashboard, VerificationForm, QRCodeCard
│   ├── pwa/                        # ServiceWorkerRegister, InstallPrompt
│   └── ui/                         # Button, Badge, Reveal, Skeletons, BottomSheet
├── lib/
│   ├── supabase.ts                 # Client Supabase typé (+ mode démo) & service client
│   ├── database.types.ts           # Typage BDD (reflète schema.sql)
│   ├── shops.ts                    # Lecture données (Supabase → fallback démo) + estimateLocalImpact
│   ├── vendor.ts                   # Écriture vendeur : createShopWithAssets(), activateSubscription()
│   ├── geo.ts                      # haversine, géolocalisation, distance
│   ├── hours.ts                    # getOpenState() — « Ouvert actuellement »
│   ├── tracking.ts                 # trackContact() + stats locales (démo)
│   ├── constants.ts                # Catégories, villes, quartiers géo, formules, opérateurs
│   ├── mock-data.ts                # Seed : 9 boutiques + 27 produits + avis
│   └── utils.ts                    # cn(), formatCFA(), buildWhatsAppLink(), formatPhoneBF()…
└── scripts/seed.ts                 # `npm run seed` → injecte mock-data dans Supabase
```

## Routes

| Route                  | Description                                                                    |
| ---------------------- | ---------------------------------------------------------------------------- |
| `/`                    | Hero + recherche prédictive (Ctrl K), explorateur géolocalisé, compteur d'impact |
| `/inscription`         | Acheteur (gratuit) vs Vendeur (essai 14 j puis 5 000 F/mois)                 |
| `/vendeur/inscription` | Formulaire complet de boutique + téléversement médias                        |
| `/vendeur/paiement`    | Formules + essai 14 j gratuit + paiement Orange/Moov/Wave (simulation)       |
| `/vendeur/dashboard`   | Contacts WhatsApp trackés, période d'essai, vérification, QR Code            |
| `/vendeur/verification`| Dossier CNIB / NIF + localisation → badge « Vendeur Vérifié »                |
| `/boutiques/[id]`      | Vitrine, dispo produits, horaires, avis vérifiés, CTA WhatsApp collant        |
| `/boutiques/[id]/produits/[produit]` | Fiche produit dédiée + barre WhatsApp collante (mobile)         |
| `/profil`             | Espace compte (favoris, vendeur, vérification) — cible « Mon Profil »        |
| `/offline`             | Page de secours PWA (service worker)                                         |
| `/api/webhooks/payment`| Webhook agrégateur Mobile Money → activation auto de l'abonnement            |

### Améliorations « classe mondiale »

- **Recherche** : filtrage **temps réel** de la grille (mot-clé + puces catégories
  + ville + quartier + « ouvert »), correspondance sur les noms de produits,
  compteur « N boutiques · M produits », état **« Aucun résultat trouvé »** avec
  bouton *Réinitialiser la recherche*. Autocomplétion instantanée (`Ctrl K`),
  filtre « Proche de moi » (géolocalisation + distance haversine),
  tags de disponibilité et « Ouvert actuellement » calculés en direct.
- **Conversion WhatsApp** : lien pré-rempli au niveau du produit (nom + prix + réf.),
  tracking des clics (`shops.whatsapp_clicks` / `contact_events`) affiché au vendeur.
- **Onboarding vendeur** : essai gratuit 14 jours sans carte, multi-opérateurs
  (Orange Money / Moov Money / Wave via CinetPay-PayDunya + webhook), générateur
  de QR Code boutique téléchargeable (affiche PNG brandée).
- **Trust Engine** : badge doré « Vendeur Vérifié » (CNIB/NIF + géoloc), avis
  authentifiés (dépôt réservé après contact vérifié — RLS), widget d'impact local animé.
- **Performance / PWA** : installable (`manifest.webmanifest` + `sw.js` offline-first),
  images AVIF/WebP via `next/image`, skeleton loaders (`components/ui/Skeletons`,
  utilisés pendant le chargement de l'explorateur).

### Mobile-first (UX/UI)

- **Bottom Navigation** (`BottomNav`) : barre fixe 4 onglets sur mobile —
  Accueil · Explorer · **Vendre** (bouton accentué en relief) · Mon Profil,
  état actif selon la route, safe-area iOS.
- **CTA WhatsApp collant** (`StickyContactBar`) : sur `/boutiques/[id]` et les
  fiches produit, bouton fixe en bas d'écran (au-dessus de la bottom nav),
  message pré-rédigé « Bonjour {Boutique}, je vous contacte depuis FasoLink à
  propos de {produit/service}. »
- **Tiroir de filtres** (`BottomSheet`) : bouton « Filtres » (badge de compteur)
  ouvrant un panneau coulissant depuis le bas — catégorie, ville, quartier,
  disponibilité ; fermeture par glisser vers le bas.
- **Scroll-snap horizontal** : carrousels catégories et « Boutiques vedettes »
  défilables au doigt avec alignement magnétique (`.snap-row` / `.snap-item`).

## Identité visuelle

Palette inspirée du drapeau burkinabè — rouge `#D62828`, vert `#1F9254`,
étoile d'or `#F4A93C` — rehaussée de tons terre & sable (`clay`).
Typographies : **Sora** (titres) + **Inter** (texte).

## Scripts

```bash
npm run dev          # développement
npm run build        # build production Next.js
npm run start        # serveur production
npm run lint         # ESLint
npm run seed         # injecte mock-data dans Supabase
npm run pages:build  # build Cloudflare Pages (.vercel/output/static)
npm run pages:deploy # build + wrangler pages deploy
```

## Déploiement

Voir **[DEPLOY.md](./DEPLOY.md)** — Cloudflare Pages (`@cloudflare/next-on-pages`,
runtime Edge) + Supabase, avec la liste des variables d'environnement et le
flag de compatibilité `nodejs_compat`.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
