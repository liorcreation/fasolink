# 📋 DOC DE RECETTE — FasoLink Marketplace

> **Version :** 1.0 — Pré-livraison  
> **Date :** 22 octobre 2026  
> **Plateforme :** FasoLink — Marketplace B2B/B2C Burkina Faso  
> **Environnement de test :** Production (Cloudflare Workers + Firebase)

---

## 📑 Table des matières

1. [Prérequis](#1-prérequis)
2. [Rôle 1 — Client / Visiteur](#2-rôle-1--client--visiteur)
3. [Rôle 2 — Vendeur / Boutique](#3-rôle-2--vendeur--boutique)
4. [Rôle 3 — Super Admin](#4-rôle-3--super-admin)
5. [Tests transversaux](#5-tests-transversaux)
6. [Paiement CinetPay (E2E)](#6-paiement-cinetpay-e2e)
7. [Grille de résultats](#7-grille-de-résultats)

---

## 1. Prérequis

| Élément | Détail |
|---------|--------|
| **Navigateur** | Chrome ou Firefox, dernière version, mode mobile + desktop |
| **Compte Client** | Créer un compte via `/inscription` avec email valide |
| **Compte Vendeur** | Créer un second compte avec email différent |
| **Compte Super Admin** | Attribué via `npm run superadmin:set -- email@domaine.bf` |
| **CinetPay Sandbox** | Clés de test CinetPay configurées dans les variables serveur |
| **Firebase** | Règles Firestore et Storage déployées, Authentication activée |

---

## 2. Rôle 1 — Client / Visiteur

### 2.1 Navigation générale

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| C-01 | **Accueil** | Ouvrir `/` | Hero, carrousel boutiques vedettes, barre de recherche, catégories affichées | |
| C-02 | **Navigation mobile** | Ouvrir sur mobile (ou DevTools responsive) | Bottom nav visible, menu hamburger fonctionnel | |
| C-03 | **Mode offline** | Activer mode avion après premier chargement | Page `/offline` affichée avec bouton « Réessayer » | |
| C-04 | **PWA** | Vérifier le fichier `/manifest.webmanifest` | Manifest valide, icons présentes, nom « FasoLink » | |

### 2.2 Recherche et filtres

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| C-05 | **Recherche textuelle** | Taper un mot-clé dans la barre de recherche | Résultats filtrés instantanément (recherche prédictive) | |
| C-06 | **Filtre par catégorie** | Cliquer sur une catégorie (ex: Électronique) | Seules les boutiques de cette catégorie sont affichées | |
| C-07 | **Filtre par ville** | Sélectionner « Bobo-Dioulasso » dans le filtre ville | Boutiques filtrées par ville | |
| C-08 | **Catalogue produits** | Naviguer vers `/produits` | Liste des produits avec prix en FCFA, badge disponibilité | |

### 2.3 Fiche boutique

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| C-09 | **Page boutique** | Cliquer sur une boutique active | Nom, description, catégorie, galerie, produits, horaires affichés | |
| C-10 | **Statut ouvert/fermé** | Vérifier l'indicateur horaire | Badge « Ouvert » ou « Fermé » selon l'heure actuelle | |
| C-11 | **Bouton WhatsApp** | Cliquer sur le bouton WhatsApp | Redirection vers `wa.me/<numéro>` — contact_event créé | |
| C-12 | **Boutique suspendue** | Accéder à une boutique `suspended` (URL directe) | Accès refusé ou message « Boutique indisponible » | |

### 2.4 Avis clients

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| C-13 | **Dépôt d'avis** | Se connecter, aller sur une boutique tierce, poster un avis (note + commentaire ≥ 10 car.) | Avis créé avec succès, affiché dans la section avis | |
| C-14 | **Auto-avis bloqué** | Se connecter avec le compte propriétaire de la boutique, tenter de poster un avis | Rejeté par les règles Firestore (propriétaire ≠ auteur) | |
| C-15 | **Avis anonyme bloqué** | Sans connexion, tenter de poster un avis | Bouton « Laisser un avis » non disponible ou erreur | |
| C-16 | **Note invalide** | Tenter une note < 1 ou > 5 | Rejeté côté client et/ou Firestore rules | |

### 2.5 Favoris

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| C-17 | **Ajout favori** | Se connecter, cliquer ♥ sur une boutique | Favori ajouté, cœur rempli | |
| C-18 | **Suppression favori** | Re-cliquer ♥ | Favori supprimé, cœur vide | |
| C-19 | **Liste favoris** | Aller sur `/profil` | Panel favoris affiché avec les boutiques sauvegardées | |

---

## 3. Rôle 2 — Vendeur / Boutique

### 3.1 Inscription vendeur

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| V-01 | **Inscription email** | Naviguer vers `/inscription`, remplir le formulaire | Compte créé, redirection vers la page d'accueil ou dashboard | |
| V-02 | **Connexion vendeur** | Naviguer vers `/connexion`, saisir les identifiants | Connexion réussie, accès au profil | |

### 3.2 Création de boutique

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| V-03 | **Formulaire boutique** | Aller sur `/vendeur/inscription`, remplir tous les champs | Formulaire validé (nom ≤ 100 car., description ≤ 3000 car., ville, whatsapp, catégorie « electronique », sous-catégorie) | |
| V-04 | **Création Firestore** | Soumettre le formulaire | Boutique créée en statut `pending`, `verification_status: unverified`, `is_featured: false`, `rating: 0` | |
| V-05 | **Champs protégés** | Vérifier en base que `owner_id === uid`, `status === 'pending'` | Les champs privilégiés ne sont pas manipulables côté client | |
| V-06 | **Validation sous-catégorie** | Catégorie « electronique » + sous-catégorie « telephonie » | Accepté par les rules Firestore (`validElectronicsSubcategory`) | |
| V-07 | **Catégorie invalide** | Tenter de créer avec une catégorie inexistante | Rejeté par Firestore rules (`validShopCategory`) | |

### 3.3 Gestion des produits

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| V-08 | **Ajout produit** | Depuis le dashboard vendeur, ajouter un produit (nom, prix, disponibilité, image) | Produit créé avec `shop_id` correct, `currency: FCFA`, `price >= 0` | |
| V-09 | **Modification produit** | Changer le prix ou la disponibilité | Mise à jour réussie, `shop_id` et `created_at` immuables | |
| V-10 | **Suppression produit** | Supprimer un produit | Produit supprimé (uniquement par le propriétaire ou super admin) | |
| V-11 | **Produit autre boutique** | Tenter de créer un produit avec le `shop_id` d'une boutique tierce | Rejeté par rules (`ownsShop`) | |
| V-12 | **Spécifications tech** | Ajouter un produit avec specs (brand, model, condition, ram, storage, warranty) | Champs validés par `validProductSpecifications` | |
| V-13 | **Prix invalide** | Tenter un prix > 1 000 000 000 ou < 0 | Rejeté par les rules | |

### 3.4 Paramètres de boutique

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| V-14 | **Modification boutique** | Aller sur `/boutiques/[id]/parametres`, modifier nom, description, horaires | Mise à jour réussie, champs protégés (`status`, `owner_id`, `rating`, `is_featured`) inchangés | |
| V-15 | **Upload logo** | Uploader un logo (< 5 Mo, image/*) | Logo stocké dans Firebase Storage `shops/<shopId>/`, URL mise à jour | |
| V-16 | **Upload galerie** | Ajouter jusqu'à 6 photos | `gallery.size() <= 6` respecté | |
| V-17 | **Boutique suspendue : upload** | Si la boutique est `suspended`, tenter un upload | Bloqué par Storage rules (`status != 'suspended'`) | |

### 3.5 Vérification vendeur

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| V-18 | **Demande de vérification** | Aller sur `/vendeur/verification`, soumettre CNIB (recto + verso) | `verification_request` créée, boutique passe en `verification_status: pending` | |
| V-19 | **Document invalide** | Numéro de document < 3 caractères | Rejeté par Firestore rules | |
| V-20 | **Path Storage strict** | Vérifier que `recto_path` match `^verification_requests/<uid>/<requestId>/recto\.[a-z0-9]{2,5}$` | Chemin conforme au regex de sécurité | |
| V-21 | **Boutique déjà vérifiée** | Tenter une nouvelle vérification quand `verification_status === 'verified'` | Rejeté : la boutique doit être `unverified` | |

### 3.6 Tableau de bord vendeur

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| V-22 | **Dashboard** | Naviguer vers `/vendeur/dashboard` | Liste des boutiques du vendeur, indicateurs de contacts, statut d'abonnement | |
| V-23 | **QR Code** | Vérifier la génération du QR code | QR code pointant vers la vitrine publique de la boutique | |
| V-24 | **Commandes reçues** | Consulter les contacts WhatsApp | Liste des `contact_events` avec date, produit concerné | |

---

## 4. Rôle 3 — Super Admin

### 4.1 Accès et authentification

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| A-01 | **Connexion Super Admin** | Se connecter avec le compte marqué `superAdmin: true` | Accès au dashboard admin sur `/admin` | |
| A-02 | **Accès refusé (vendeur)** | Se connecter avec un compte vendeur normal, accéder à `/admin` | Message « Espace réservé au Super Admin » | |
| A-03 | **Accès refusé (anonyme)** | Accéder à `/admin` sans connexion | Message « Accès administrateur » + lien connexion | |
| A-04 | **Forcer le claim** | Vérifier que le custom claim `superAdmin === true` est requis | `getIdTokenResult` avec `forceRefresh: true` vérifié | |

### 4.2 Tableau de bord d'administration

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| A-05 | **Vue d'ensemble** | Ouvrir `/admin` | Métriques : total boutiques, boutiques suspendues, vérifications en attente, profils vérifiés | |
| A-06 | **Indicateurs financiers** | Section « Transactions & licences » | Encaissé tout temps, 30 jours, paiements en attente, licences en cours | |
| A-07 | **Graphique 7 jours** | Section histogramme | Barres d'encaissements CinetPay confirmés sur 7 jours | |
| A-08 | **Derniers mouvements** | Section « Derniers mouvements » | 7 dernières transactions avec statut, montant, référence | |

### 4.3 Gestion des boutiques

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| A-09 | **Liste des boutiques** | Section « Modération des boutiques » | Toutes les boutiques listées avec nom, ville, statut, vérification | |
| A-10 | **Suspendre une boutique** | Cliquer « Suspendre » sur une boutique active | Statut passe à `suspended` (mise à jour optimiste + Firestore) | |
| A-11 | **Réactiver une boutique** | Cliquer « Réactiver » sur une boutique suspendue | Statut passe à `active` | |
| A-12 | **Rollback en cas d'erreur** | Simuler une erreur réseau pendant la suspension | Le statut revient à sa valeur précédente (rollback optimiste) | |

### 4.4 Vérification des vendeurs

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| A-13 | **Dossiers en attente** | Section « Vérification des vendeurs » | Liste des dossiers `pending` avec nom, type de document, date | |
| A-14 | **Consulter documents** | Cliquer « Documents » | Modal avec recto/verso de la pièce d'identité (URL signée Storage) | |
| A-15 | **Valider une vérification** | Cliquer « Valider » | `verification_request.status → approved`, `shop.verification_status → verified`, documents supprimés de Storage | |
| A-16 | **Rejeter une vérification** | Cliquer « Rejeter » + saisir motif | `status → rejected`, `rejection_reason` renseigné, `shop.verification_status → unverified` | |

### 4.5 Gestion des licences (Super Admin)

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| A-17 | **Accorder une licence** | Remplir le formulaire : boutique, formule, durée, montant, motif (≥ 8 car.) | `subscription` créée (`gateway: manual_superadmin`), `shop.status → active`, log d'audit créé | |
| A-18 | **Licence gratuite** | Choisir « Offerte » (montant = 0) | `license_type: complimentary`, audit_log avec motif | |
| A-19 | **Licence payée** | Choisir « Payée/validée » + montant | `license_type: manual_paid`, montant correct en base | |
| A-20 | **Révoquer une licence** | Cliquer « Révoquer » + motif ≥ 8 car. | `subscription.status → cancelled`, boutique suspendue si pas d'autre licence active | |
| A-21 | **Historique d'audit** | Section « Journal de contrôle » | Liste des 25 dernières actions (accordée/révoquée) avec date, boutique, motif | |
| A-22 | **Recherche licences** | Utiliser la barre de recherche et le filtre de statut | Filtrage fonctionnel par nom de boutique, référence, statut | |

### 4.6 Modération des avis

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| A-23 | **Supprimer un avis** | En tant que Super Admin, supprimer un avis inapproprié | Avis supprimé de Firestore (rules: `isAdmin()` pour update/delete) | |

---

## 5. Tests transversaux

### 5.1 Sécurité Firestore

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| S-01 | **Modifier boutique tierce** | Avec un SDK Firebase, tenter `updateDoc` sur une boutique dont on n'est pas `owner_id` | Permission denied | |
| S-02 | **Changer le statut (vendeur)** | Tenter de modifier `status: active` depuis un compte vendeur | Bloqué : `request.resource.data.status == resource.data.status` dans `validOwnerShopUpdate` | |
| S-03 | **Changer le rating** | Tenter de modifier `rating` ou `rating_count` | Bloqué : `request.resource.data.rating == resource.data.rating` | |
| S-04 | **Créer abonnement (vendeur)** | Tenter un `createDoc` direct dans `subscriptions` | Bloqué : `isSuperAdmin()` requis pour `create` ou passe par l'API serveur | |
| S-05 | **Supprimer abonnement** | Tenter `deleteDoc` sur `subscriptions` | Bloqué : `allow delete: if false` | |
| S-06 | **Modifier audit log** | Tenter `updateDoc` ou `deleteDoc` sur `admin_audit_logs` | Bloqué : `allow update, delete: if false` | |
| S-07 | **Lire profil tierce** | Tenter de lire `/profiles/<autre-uid>` | Bloqué : `request.auth.uid == uid` ou `isAdmin()` | |
| S-08 | **Contact event : auto-contact** | Tenter de créer un `contact_event` pour sa propre boutique | Bloqué : `owner_id != request.auth.uid` | |
| S-09 | **Favoris : lire ceux d'autrui** | Tenter de lire les favoris d'un autre utilisateur | Bloqué : `resource.data.owner_id == request.auth.uid` | |

### 5.2 Sécurité Storage

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| S-10 | **Upload fichier > 5 Mo** | Tenter d'uploader un fichier de 6 Mo | Bloqué : `request.resource.size < 5 * 1024 * 1024` | |
| S-11 | **Upload non-image** | Tenter d'uploader un PDF | Bloqué : `request.resource.contentType.matches('image/.*')` | |
| S-12 | **Upload sur boutique tierce** | Tenter d'uploader dans `shops/<autre-shopId>/` | Bloqué : `owner_id == request.auth.uid` | |
| S-13 | **Lire document vérification** | Tenter de lire `verification_requests/<autre-uid>/` | Bloqué : `request.auth.uid == ownerId` ou `isSuperAdmin()` | |
| S-14 | **Connexion anonyme : upload** | En session anonyme, tenter un upload | Bloqué : `sign_in_provider != 'anonymous'` | |

### 5.3 API Routes serveur

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| S-15 | **Cron sans secret** | `POST /api/cron/expire` sans header Authorization | `401 unauthorized` | |
| S-16 | **Cron avec secret** | `POST /api/cron/expire` avec `Authorization: Bearer <CRON_SECRET>` | `200 OK` avec `{ ok: true, expired, suspended }` | |
| S-17 | **Initialize sans auth** | `POST /api/payments/cinetpay/initialize` sans `idToken` | `400 Connexion invalide` | |
| S-18 | **Initialize boutique tierce** | Envoyer un `idToken` valide mais un `shopId` appartenant à un autre | `403 Cette boutique ne vous appartient pas` | |
| S-19 | **Trial déjà utilisé** | Tenter d'activer l'essai 2 fois | `409 Cette boutique a déjà utilisé son essai gratuit` | |
| S-20 | **Webhook site_id invalide** | Envoyer une notification avec un `site_id` incorrect | `400 Notification CinetPay invalide` | |

---

## 6. Paiement CinetPay (E2E)

### 6.1 Flux essai gratuit

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| P-01 | **Sélection essai** | `/vendeur/paiement?shop=<id>` → « Démarrer avec 14 jours gratuits » | Affichage du résumé essai : 0 FCFA, date de fin, plan sélectionné | |
| P-02 | **Activation essai** | Cliquer « Publier ma boutique maintenant » | API `/api/payments/trial` appelée, subscription `trialing` créée, boutique `active` | |
| P-03 | **Écran succès** | Après activation | « Essai activé » + référence TRIAL-<shopId> + lien dashboard | |
| P-04 | **Essai dupliqué** | Retenter l'essai pour la même boutique | `409 Cette boutique a déjà utilisé son essai gratuit` | |

### 6.2 Flux paiement CinetPay

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| P-05 | **Choix de formule** | Sélectionner « Trimestriel » | Prix 13 500 FCFA affiché, inclusions listées | |
| P-06 | **Méthode de paiement** | Continuer → écran « Réglez avec CinetPay » | Orange Money / Moov Money mentionnés, mention sécurité | |
| P-07 | **Récapitulatif** | Continuer → écran confirmation | Formule, passerelle, boutique, total affichés correctement | |
| P-08 | **Redirection CinetPay** | Cliquer « Payer X FCFA avec CinetPay » | `POST /api/payments/cinetpay/initialize` → redirection vers `payment_url` CinetPay | |
| P-09 | **Paiement accepté** | Compléter le paiement sur CinetPay (sandbox) | Webhook reçu → `POST /api/webhooks/payment` → vérification → subscription `active` + boutique `active` | |
| P-10 | **Retour navigateur** | Après paiement, retour vers FasoLink | Vérification via `/api/payments/cinetpay/verify` → écran « Paiement confirmé » | |
| P-11 | **Paiement refusé** | Annuler sur CinetPay | Retour vers FasoLink avec message « Paiement en cours de confirmation » | |
| P-12 | **Idempotence webhook** | Rejouer le même webhook | Réponse `{ activated: true, idempotent: true }` (pas de double activation) | |
| P-13 | **Montant incorrect** | Simuler un webhook avec un montant différent | `400 Montant/devise invalides` | |

### 6.3 Expiration automatique

| # | Scénario | Étapes | Résultat attendu | ✅/❌ |
|---|----------|--------|-------------------|------|
| P-14 | **CRON expire** | Créer une subscription avec `expires_at` dans le passé, exécuter le cron | Subscription → `expired`, boutique → `suspended` si pas d'autre licence | |
| P-15 | **Multi-licence** | Boutique avec 2 licences, une expire | Boutique reste `active` car une licence valide subsiste | |

---

## 7. Grille de résultats

| Section | Tests réussis | Tests échoués | À corriger |
|---------|:------------:|:-------------:|:----------:|
| Client / Visiteur (C-01 à C-19) | /19 | /19 | |
| Vendeur / Boutique (V-01 à V-24) | /24 | /24 | |
| Super Admin (A-01 à A-23) | /23 | /23 | |
| Sécurité Firestore (S-01 à S-09) | /9 | /9 | |
| Sécurité Storage (S-10 à S-14) | /5 | /5 | |
| API Routes (S-15 à S-20) | /6 | /6 | |
| Paiement CinetPay (P-01 à P-15) | /15 | /15 | |
| **TOTAL** | **/101** | **/101** | |

---

## Signatures de validation

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| Testeur QA | | | |
| Lead Dev | | | |
| Client / PO | | | |

---

> **Note :** Ce document doit être complété manuellement pour chaque test. Cocher ✅ si le test passe, ❌ s'il échoue, et noter les remarques dans la colonne « À corriger ».
