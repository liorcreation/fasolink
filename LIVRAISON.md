# FasoLink — dossier de finalisation et préparation commerciale

Dernière mise à jour : 15 octobre 2026.

## État exécutif

FasoLink est une marketplace web responsive pour les vendeurs de produits
électroniques au Burkina Faso. Les changements sont publiés dans un Worker
Cloudflare de préproduction : `https://fasolink.jurisia-api.workers.dev`.
L'ancien site `https://fasolink.pages.dev` n'a pas été remplacé. Les secrets
CinetPay/Firebase ne sont pas configurés; le paiement réel n'est donc pas prêt.

## Avancement technique de cette étape

### Paiement CinetPay — intégration préparée

- La page d'abonnement redirige vers le checkout hébergé CinetPay; FasoLink ne
  demande ni ne stocke le code PIN Mobile Money.
- Le serveur vérifie le jeton Firebase et la propriété de la boutique, puis
  calcule le tarif depuis les formules connues côté serveur.
- La notification et le retour CinetPay ne sont pas crus sur parole : le serveur
  interroge l'API CinetPay de vérification avant toute activation.
- Après confirmation, la licence et le statut de la boutique sont mis à jour
  ensemble dans une écriture Firestore atomique.
- Les retours CinetPay non payés ou non vérifiables ne publient pas la boutique.

### Essai gratuit

- Attribution côté serveur, durée fixée à 14 jours et limitée à un essai par
  boutique.
- L'activation de l'essai et la publication de la boutique sont atomiques.
- Le navigateur ne peut plus créer un abonnement payant en écrivant directement
  dans Firestore.

### Sécurité des données

- Lecture publique limitée aux boutiques actives et à leurs produits.
- Lecture privée conservée pour le propriétaire et le Super Admin.
- La création d'une boutique impose le statut initial `pending`, une
  vérification initiale `unverified` et `is_featured: false`.
- Les pièces privées de vérification ne reconnaissent plus l'ancien claim
  Firebase `admin`; l'accès privilégié utilise uniquement `superAdmin`.
- Les lectures de produits sont maintenant limitées à la boutique visée.
- Le champ `shop_id` d'un produit ne peut plus être déplacé par un vendeur.

### Dépendances et tests

- Migration préparée vers Next.js 16.3.8 (compatible avec OpenNext Cloudflare), React 19, Firebase 13, Firebase Admin
  13 et OpenNext Cloudflare 1.20.10; retrait des anciens runtimes Edge de
  l'application et adaptation des paramètres de routes dynamiques à Next 16.
- `npm run lint` : réussi sans erreur.
- `npm run build` : réussi sous Next.js 16.3.8; le bundle OpenNext Cloudflare
  est généré avec succès.
- Smoke test du serveur Next.js local : les pages principales répondent HTTP 200,
  une adresse inconnue HTTP 404; API d'initialisation/essai sans session HTTP
  400; webhook sans secrets HTTP 503. Ce test n'est pas un test de paiement.
- `npm audit --omit=dev` : 0 vulnérabilité de production après mise à niveau et
  verrouillage de `@grpc/grpc-js`. L'audit complet conserve des alertes dans les
  outils de développement/build; ne pas les confondre avec l'audit production.
- Avec Next.js 16.4, le preview Workers renvoyait HTTP 500 car OpenNext 1.20.10
  ne prenait pas encore en charge le manifeste `preview-props.json`. Le projet
  a été aligné sur Next.js 16.3.8, version déclarée compatible par OpenNext.
- Le preview Wrangler a ensuite répondu HTTP 200 sur l'accueil, connexion,
  inscription, boutiques, produits, paiement, admin et profil; une route
  inconnue répond HTTP 404. L'endpoint d'initialisation appelé en GET répond
  HTTP 405, comme attendu. Le test a été fait sous Windows; OpenNext recommande
  toujours Linux/WSL pour une validation de production.
- Worker Cloudflare `fasolink` déployé avec le commit `ef05c63`; les routes
  publiques principales ont ensuite répondu HTTP 200 et une route inconnue 404.
- Les règles Firestore ont été publiées sur `fasolink-d6e77` avec succès.
- Les règles Storage n'ont pas été publiées : Firebase Storage n'est pas encore
  activé sur le projet. `wrangler secret list` est vide; les secrets applicatifs
  restent à configurer.
- Aucun paiement réel ni test marchand n'a été exécuté; les identifiants
  CinetPay ne sont pas configurés dans ce checkout.

## À faire avant activation commerciale

### 1. Actions du propriétaire / prestataires

1. Créer ou valider le compte marchand CinetPay FasoLink et activer les canaux
   de paiement Mobile Money destinés au Burkina Faso (notamment Orange Money et
   Moov Money selon l'éligibilité du compte).
2. Fournir les identifiants API CinetPay et le Site ID. Ne jamais les envoyer
   dans un message, une capture d'écran ou un dépôt Git.
3. Décider si l'URL de préproduction `fasolink.jurisia-api.workers.dev` convient
   ou configurer un domaine personnalisé. `fasolink.pages.dev` reste sur Pages;
   mettre à jour Firebase Authorized Domains et les URLs CinetPay pour l'URL
   finale convenue avec le client.
4. Ajouter dans les variables/secrets Cloudflare Workers :
   `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`, `APP_BASE_URL` et
   `FIREBASE_SERVICE_ACCOUNT`. Conserver aussi `CRON_SECRET` pour le traitement
   des expirations. Appliquer les variables à la production et aux previews
   uniquement si elles sont nécessaires.
5. Confirmer les frais, délais de règlement, conditions de remboursement et
   plafonds auprès de CinetPay. Les frais dépendent du contrat marchand et ne
   sont pas chiffrés dans le code.
6. Activer Firebase Storage. Firebase peut demander le forfait Blaze; vérifier
   les tarifs, alertes de budget et limites avant activation.

### 2. Déploiement et vérifications de production

1. Rebaser/merger les changements préparés sur la branche de livraison choisie;
   contrôler les fichiers locaux non committés avant toute opération Git.
2. Exécuter `npm ci`, lint, build et preview OpenNext depuis Linux/WSL ou CI Linux.
   Le preview local Windows répond maintenant sur les routes principales, mais
   une validation Linux/CI reste recommandée avant bascule du domaine.
3. Reconsulter les avis officiels Next.js après le 14 octobre 2026 et appliquer
   toute mise à jour pertinente avant l'ouverture commerciale.
4. Les règles Firestore sont déjà publiées. Activer Firebase Storage depuis la
   console, vérifier le budget/forfait, puis publier les règles Storage.
5. Le Worker de préproduction est déployé. Recetter l'authentification, le PWA,
   les endpoints et les secrets avant de remplacer Pages; ce Worker n'est pas
   encore l'URL de production commerciale.
6. Ajouter et vérifier les secrets/variables de production Cloudflare avant le
   déploiement final.
7. Configurer l'URL de notification CinetPay exactement sur
   `/api/webhooks/payment` et l'URL de retour sur l'application publiée.
8. Avec le compte marchand et un faible montant autorisé, tester le parcours
   complet : paiement accepté, refusé, annulé, notification répétée, retour
   navigateur avant notification, montant incorrect et boutique suspendue.
   Vérifier les journaux CinetPay, Cloudflare et Firestore; effectuer la
   transaction réelle seulement avec l'accord du propriétaire.
9. Ajouter une règle de limitation de débit Cloudflare pour les endpoints
   d'initialisation/retour paiement et cron; tester avec plusieurs comptes.
   La limitation par IP/compte n'est pas fournie par les changements présents.

### 3. Éléments métier et conformité

- Remplacer les mentions « à compléter / à confirmer » des pages légales par
  la raison sociale, l'adresse, le contact et l'identité du responsable fournis
  par le client; faire relire les textes selon son activité réelle.
- Confirmer les prix, la période d'essai, les limites de produits et la politique
  de remboursement affichées aux vendeurs.
- Valider les coordonnées de support, les données initiales réelles et les
  boutiques à conserver avant le lancement public.
- Prévoir la surveillance des transactions, les rapprochements Mobile Money,
  la gestion des remboursements et le traitement des paiements réussis si une
  boutique a été suspendue entre l'initialisation et la notification.

## Mise à jour produit — 15 octobre 2026

- Le formulaire de création permet maintenant de préciser la spécialité d'une
  boutique électronique : téléphonie, informatique, audio, TV/vidéo, gaming,
  accessoires, électroménager ou photo/vidéo.
- Cette spécialité est enregistrée dans Firestore, apparaît sur les cartes et
  la vitrine de boutique, et est imposée par les règles Firestore pour toute
  nouvelle boutique électronique. Les anciennes boutiques sans spécialité
  restent compatibles.
- Les tests TypeScript et la compilation Workers sont exécutés avant publication.
- Les règles sont mises à jour, mais leur test automatique dépend du démarrage
  réussi de l'émulateur Firestore; vérifier ce point lors de la recette.

## Coûts à prévoir

- **CinetPay :** éventuels frais par transaction et modalités de règlement,
  déterminés par le contrat et le compte marchand; à confirmer directement.
- **Firebase Storage :** facturation potentielle du forfait Blaze et des usages
  au-delà des quotas gratuits; fixer alertes et limites de budget.
- **Domaine :** coût annuel si le client choisit un nom de domaine personnalisé.
- **Cloudflare :** le plan courant peut suffire, mais les fonctionnalités de
  limitation de débit avancée ou les volumes supérieurs peuvent entraîner un
  coût selon le plan choisi.
- **À ce jour :** aucun abonnement ni frais de service n'a été souscrit par
  cette étape. Le coût précis CinetPay doit venir du contrat marchand.

## Décision de mise en production

**Pas encore prêt à encaisser en production.** La migration vers Next 16/OpenNext
et la compilation passent, et l'audit des dépendances de production est nul.
Cependant, le preview Worker reste à valider sous Linux, il faut décider de la
nouvelle URL publique, saisir les clés, publier les règles et effectuer une
recette CinetPay. Rien n'est déployé par cette préparation.
