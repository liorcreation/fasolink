# FasoLink — état de livraison

Dernière mise à jour : 16 septembre 2026.

## Ce qui est livré

- Site public responsive mobile, tablette et desktop.
- Déploiement Cloudflare Pages : https://fasolink.pages.dev
- Comptes Email/Password et profils synchronisés.
- Favoris persistants par utilisateur.
- Onboarding vendeur et vitrine publique.
- Catalogue vendeur : création, modification et suppression de produits.
- Tableau de bord : contacts WhatsApp, abonnement, QR Code et vérification.
- Dossier CNIB/NIF privé avec consultation admin et suppression après validation.
- Back-office `/admin` protégé par le custom claim Firebase `admin`.
- Paiement préparé pour webhook signé, sans collecte de PIN côté navigateur.
- Expiration automatique des abonnements via `/api/cron/expire`.
- Worker Cloudflare quotidien `fasolink-expiry-cron`.
- Pages confidentialité, conditions d’utilisation et mentions légales.
- Règles Firestore publiées sur le projet Firebase `fasolink-d6e77`.
- Compte administrateur initial habilité.
- Secret `FIREBASE_SERVICE_ACCOUNT` enregistré côté Cloudflare Pages.

## Contrôles effectués

```text
npm run lint          OK
npx tsc --noEmit     OK
npm run build        OK
npm run verify       OK — Auth anonyme, Firestore et règles
Routes publiques     OK (HTTP 200)
Webhook non signé    Rejeté (HTTP 401)
Cron non authentifié  Rejeté (HTTP 401)
```

Le build Cloudflare Pages est déjà disponible dans l’historique de livraison.
Une nouvelle compilation `pages:build` depuis Windows nécessite Bash/WSL ;
cela ne remet pas en cause le déploiement actuellement en ligne.

## Éléments à fournir par le client

1. Les identifiants CinetPay ou PayDunya et les paramètres Orange Money, Moov
   Money et Wave.
2. Le domaine définitif, le logo final et les coordonnées officielles.
3. L’identité juridique à placer dans les mentions légales.
4. Les données initiales réelles des boutiques, produits et tarifs.

## Action Firebase restante

Le projet Firebase n’a pas encore initialisé Storage. Firebase demande
actuellement le passage au forfait **Blaze** avant d’afficher le bouton de
démarrage. Dans Firebase Console, ouvrez **Storage → Changer le forfait du
projet**, puis activez Storage uniquement après validation du propriétaire.
Après activation, déployez :

```bash
npx firebase-tools deploy --only storage --project fasolink-d6e77
```

Cette action est nécessaire pour les logos, photos et justificatifs CNIB/NIF.

Tant que Storage n’est pas activé, les uploads d’images et de justificatifs
restent bloqués. Tant que les identifiants de passerelle ne sont pas fournis,
les paiements réels restent volontairement bloqués.

## Coûts externes à prévoir

- **Gratuit ou déjà inclus :** code, corrections, tests, déploiement Pages
  standard, Firebase Authentication et Firestore dans leurs quotas, règles de
  sécurité, back-office et documentation.
- **Potentiellement payant :** forfait Firebase Blaze pour Storage et éventuels
  dépassements de quotas ; frais de transaction CinetPay/PayDunya et des
  opérateurs Mobile Money ; nom de domaine personnalisé ; éventuels services
  e-mail/SMS ou maintenance récurrente.
- Aucun abonnement payant n’a été souscrit par le projet pendant cette étape.
