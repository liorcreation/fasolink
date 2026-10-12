# FasoLink — Consommer Burkinabè 🇧🇫

Annuaire et **marketplace** dynamique pour la promotion des commerçants,
artisans et producteurs locaux du Burkina Faso. Vitrine premium,
mobile-first, contact WhatsApp direct.

## Stack

| Couche      | Technologie                                             |
| ----------- | ------------------------------------------------------- |
| Framework   | Next.js 16 (App Router) + TypeScript                    |
| Hébergement | OpenNext sur Cloudflare Workers                         |
| Style / UI  | Tailwind CSS · Lucide React · Framer Motion             |
| Backend     | Firebase (Firestore · Auth · Storage)                   |
| Utilitaires | clsx · tailwind-merge · qrcode                          |
| PWA         | Web App Manifest + service worker maison (offline-first)|

## Démarrage

```bash
npm install
cp .env.local.example .env.local   # renseignez vos clés Firebase
npm run dev
```

> Sans clés Firebase, l'application tourne en **mode démo** avec le jeu de
> données `src/lib/mock-data.ts` (9 boutiques, 27 produits) — toutes les pages
> restent navigables. Avec Firebase : `npm run seed` injecte ce même jeu.

## Configuration Firebase

1. Créez un projet sur [console.firebase.google.com](https://console.firebase.google.com).
2. **Firestore Database** → *Create database* (mode production).
3. **Authentication → Sign-in method** : activez **Email/Password** pour les
   comptes et **Anonymous** pour l'onboarding vendeur sans compte préalable
   (`owner_id`, écriture Firestore/Storage).
4. **Storage → Get started** (bucket par défaut `…​.appspot.com`).
5. **Project settings → General → Your apps → Web app** : copiez la config
   (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`,
   `appId`) dans `.env.local` (préfixe `NEXT_PUBLIC_FIREBASE_*`).
6. Déployez les règles :
   `firebase deploy --only firestore:rules,storage`
   (ou copier/coller `firestore.rules` / `storage.rules` dans la console).

Firestore est utilisé via le SDK **lite** (REST). Le rendu serveur fonctionne
sur le runtime Node.js de Cloudflare Workers via OpenNext.

### Flux vendeur connecté (`src/lib/vendor.ts`)

| Étape | Action Firebase |
| ----- | --------------- |
| `/vendeur/inscription` — soumission | Compte FasoLink authentifie obligatoire → `setDoc` `shops/<slug>` (statut `pending`) → medias Storage → redirection `/vendeur/paiement?shop=<id>` |
| `/vendeur/paiement` — paiement reel | `/api/payments/cinetpay/initialize` authentifie le compte, verifie la propriete, cree le paiement cote serveur puis redirige vers CinetPay |
| Essai 14 j | `/api/payments/trial` attribue un essai cote serveur, une seule fois, et active boutique/licence atomiquement |

> Le webhook `/api/webhooks/payment` utilise Firestore REST avec le compte de
> service cote serveur. Il re-verifie chaque transaction aupres de CinetPay et
> compare la reference, le montant et la devise avant toute activation.

## Structure

```
src/
├── app/
│   ├── page.tsx                    # Accueil : hero, carrousel vedettes, explorateur
│   ├── inscription/                # Choix profil Acheteur / Vendeur
│   ├── profil/                     # Espace compte (cible « Mon Profil »)
│   ├── vendeur/
│   │   ├── inscription/            # Formulaire boutique (+ upload logo/photos)
│   │   ├── paiement/               # Essai 14 j + demande Mobile Money sécurisée
│   │   ├── dashboard/              # Boutique du compte, catalogue, stats, QR Code
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
│   │                               #   VendorDashboard, ProductManager, VerificationForm,
│   │                               #   loaders authentifiés, QRCodeCard
│   ├── admin/                      # Back-office de modération
│   ├── pwa/                        # ServiceWorkerRegister, InstallPrompt
│   └── ui/                         # Button, Badge, Reveal, Skeletons, BottomSheet
├── lib/
│   ├── firebase.ts                 # App + Firestore lite (db) + Auth + Storage + isFirebaseConfigured
│   ├── database.types.ts           # Types de données (collections Firestore)
│   ├── shops.ts                    # Lecture Firestore → fallback mock-data + estimateLocalImpact
│   ├── vendor.ts                   # Boutiques, catalogue, vérification, abonnements
│   ├── vendor-data.ts              # Boutiques/abonnements du propriétaire connecté
│   ├── admin-data.ts               # Contrôle custom claim admin + modération
│   ├── geo.ts                      # haversine, géolocalisation, distance
│   ├── hours.ts                    # getOpenState() — « Ouvert actuellement »
│   ├── tracking.ts                 # trackContact() (contact_events + increment) + stats locales
│   ├── constants.ts                # Catégories, villes, quartiers géo, formules, opérateurs
│   ├── mock-data.ts                # Seed : 9 boutiques + 27 produits + avis
│   └── utils.ts                    # cn(), formatCFA(), buildWhatsAppLink(), formatPhoneBF()…
├── firestore.rules · storage.rules · firestore.indexes.json · firebase.json
└── scripts/seed.ts                 # `npm run seed` (firebase-admin) → injecte mock-data
```

## Routes

| Route                  | Description                                                                    |
| ---------------------- | ---------------------------------------------------------------------------- |
| `/`                    | Hero + recherche prédictive (Ctrl K), explorateur géolocalisé, compteur d'impact |
| `/inscription`         | Acheteur (gratuit) vs Vendeur (essai 14 j puis 5 000 F/mois)                 |
| `/connexion`           | Création de compte et connexion Email/Password                              |
| `/admin`               | Back-office protégé par le custom claim Firebase `admin`                    |
| `/vendeur/inscription` | Formulaire complet de boutique + téléversement médias                        |
| `/vendeur/paiement`    | Formules + essai 14 j + demande de paiement, publication via webhook signé   |
| `/vendeur/dashboard`   | Boutique du propriétaire, catalogue CRUD, contacts, abonnement et QR Code    |
| `/vendeur/verification`| Dossier CNIB / NIF + géoloc privé → décision admin                           |
| `/boutiques/[id]`      | Vitrine, dispo produits, horaires, avis vérifiés, CTA WhatsApp collant        |
| `/boutiques/[id]/produits/[produit]` | Fiche produit dédiée + barre WhatsApp collante (mobile)         |
| `/profil`             | Espace compte (favoris, vendeur, vérification) — cible « Mon Profil »        |
| `/offline`             | Page de secours PWA (service worker)                                         |
| `/api/webhooks/payment`| Webhook agrégateur Mobile Money → activation auto de l'abonnement            |
| `/api/cron/expire`     | Expire les abonnements échus et suspend les boutiques concernées            |

### Améliorations « classe mondiale »

- **Recherche** : filtrage **temps réel** de la grille (mot-clé + puces catégories
  + ville + quartier + « ouvert »), correspondance sur les noms de produits,
  compteur « N boutiques · M produits », état **« Aucun résultat trouvé »** avec
  bouton *Réinitialiser la recherche*. Autocomplétion instantanée (`Ctrl K`),
  filtre « Proche de moi » (géolocalisation + distance haversine),
  tags de disponibilité et « Ouvert actuellement » calculés en direct.
- **Conversion WhatsApp** : lien pré-rempli au niveau du produit (nom + prix + réf.),
  tracking des clics (`shops.whatsapp_clicks` / `contact_events`) affiché au vendeur.
- **Onboarding vendeur** : essai gratuit 14 jours sans carte, checkout Mobile
  Money CinetPay (Orange Money et Moov Money selon l'activation marchande) + webhook, générateur
  de QR Code boutique téléchargeable (affiche PNG brandée).
- **Trust Engine** : badge doré « Vendeur Vérifié » (CNIB/NIF + géoloc), dossiers
  privés Storage, décision admin et avis rattachés à une session.
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
npm run seed         # injecte mock-data dans Firestore (firebase-admin)
npm run admin:set -- admin@client.bf  # ajoute le custom claim admin
npm run preview      # build OpenNext + preview local Wrangler (Linux/WSL conseillé)
npm run deploy       # build + déploiement Cloudflare Workers
npm run upload       # téléverse une version sans la servir immédiatement
```

## Administrateur et production

Le back-office `/admin` vérifie le custom claim Firebase `admin` dans le token.
Après création du compte administrateur, exécutez `npm run admin:set --
admin@client.bf` avec `FIREBASE_SERVICE_ACCOUNT` configuré, puis reconnectez-vous
pour renouveler le token.

### Super administrateur et licences

Le rôle super administrateur est distinct du rôle administrateur de modération.
Il donne accès au panneau **Licences & accès boutiques** de `/admin` pour
accorder une durée d'accès, enregistrer une validation manuelle, offrir ou
révoquer une licence. Chaque décision crée une entrée immuable dans
`admin_audit_logs`. Les règles Firestore exigent le claim `superAdmin` pour ces
écritures.

Après création du compte du propriétaire, attribuez le rôle avec la clé Firebase
Admin uniquement sur un poste de confiance :

```bash
npm run superadmin:set -- proprietaire@domaine.bf
```

La commande conserve les claims existants et active `admin` + `superAdmin`.
Elle lit `FIREBASE_SERVICE_ACCOUNT` dans `.env.local` ou le fichier local ignoré
`firebase-service-account.json`. Le propriétaire doit ensuite se déconnecter et
se reconnecter. Ne publiez pas la clé de service dans le dépôt ou dans un
document client. Toute modification des règles Firestore doit être déployée avec
`firebase deploy --only firestore:rules`.

Le paiement passe par le checkout heberge CinetPay. Ajoutez `CINETPAY_API_KEY`,
`CINETPAY_SITE_ID`, `APP_BASE_URL` et `FIREBASE_SERVICE_ACCOUNT` comme secrets/
variables Cloudflare Workers cote serveur. La notification est reverifiee aupres
de CinetPay avant activation. Ajoutez egalement `CRON_SECRET` et appelez
`/api/cron/expire` une fois par jour depuis un planificateur securise. Voir
`LIVRAISON.md` pour les actions de production qui restent a effectuer.

## Déploiement

Voir **[DEPLOY.md](./DEPLOY.md)** — Cloudflare Workers via OpenNext + Firebase,
avec les variables et secrets de production, la migration d'URL et les tests
requis avant la bascule depuis Cloudflare Pages.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
