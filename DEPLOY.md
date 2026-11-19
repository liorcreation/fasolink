# Déploiement — FasoLink sur Cloudflare Workers et Firebase

Dernière mise à jour : 19 novembre 2026 (refonte premium de l'interface, publiée).

## Adresses actuellement publiées

- Worker avec les dernières améliorations :
  `https://fasolink.jurisia-api.workers.dev`.
- Worker publié le 18 novembre 2026 depuis le commit `124f9f7` (refonte premium
  de l'interface), version `4f3e0ee7-9c06-42c5-9161-3a7710f5276c`. Cette
  publication inclut aussi les améliorations restées en attente : focus clavier,
  lien « Passer au contenu principal », palette de commandes, recherche
  instantanée et contrastes de marque.
- Version précédente, pour revenir en arrière si besoin :
  `npx wrangler rollback fe8d8a5c-d309-474c-b74f-e67ea4edb682`.
- Contrôle HTTP du 18 novembre après publication : `/`, `/boutiques`,
  `/produits`, une vitrine, une fiche produit, `/vendeur/dashboard`,
  `/connexion`, `/profil`, `/conditions` et `/offline` répondent `200`; une
  adresse inexistante répond `404`.
- Site Pages distinct : `https://fasolink.pages.dev` (répond encore mais n'a pas
  les mêmes fichiers ni la section vidéo récente).

Le client doit confirmer l'adresse canonique avant les paiements. Un domaine
personnalisé est possible si le client le possède et accepte son coût annuel.
Après décision, synchroniser Firebase Authentication, les URL CinetPay, le cron
et les variables de déploiement sur cette adresse.

## Firebase et règles

1. Confirmer Email/Password et les domaines autorisés dans Authentication.
2. Vérifier l'état réel de Firestore et Storage dans le projet `fasolink-d6e77`.
   Storage doit être activé avec l'accord budgétaire avant de dépendre des
   téléversements.
3. Comparer les règles actives avec `firestore.rules` et `storage.rules`.
4. Exécuter `npm run test:firebase-rules`. Ce poste Windows n'a pas Java 21;
   l'exécution locale s'est arrêtée avant les tests. Le workflow
   `.github/workflows/firebase-rules.yml` a exécuté la suite sur GitHub avec
   Java 21, mais le run `41238891242` est en échec dans l'étape de tests. Les
   règles ne sont pas validées tant que la cause n'est pas corrigée et que la
   suite ne réussit pas.

## Secrets Cloudflare Workers

Wrangler est authentifié sur le poste de déploiement depuis le 18 novembre 2026 :
`npm run deploy` construit et publie le Worker `fasolink`. Ne jamais ajouter de
jeton Cloudflare au dépôt ou au PDF.

Secrets configurés le 19 novembre 2026 (contrôlés avec `wrangler secret list`,
qui n'affiche que les noms) :

| Secret | Worker | État |
| --- | --- | --- |
| `APP_BASE_URL` | `fasolink` | Posé : `https://fasolink.jurisia-api.workers.dev` |
| `FIREBASE_SERVICE_ACCOUNT` | `fasolink` | Posé depuis le fichier de compte de service local (ignoré par Git) |
| `CRON_SECRET` | `fasolink` et `fasolink-expiry-cron` | Posé : nouvelle valeur aléatoire, identique sur les deux Workers |
| `CINETPAY_API_KEY`, `CINETPAY_SITE_ID` | `fasolink` | Manquants : requis pour le checkout |
| `PAYMENT_WEBHOOK_SECRET` ou `CINETPAY_SECRET_KEY` | `fasolink` | Manquant : l'un des deux est requis pour démarrer un paiement |
| `PEXELS_API_KEY` | `fasolink` | Manquant, facultatif : recherche d'images de substitution seulement |

Les clés CinetPay sont à saisir par le titulaire du compte, au clavier, sans
passer par un fichier ni par Git :

```powershell
npx wrangler secret put CINETPAY_API_KEY --name fasolink
npx wrangler secret put CINETPAY_SITE_ID --name fasolink
npx wrangler secret put CINETPAY_SECRET_KEY --name fasolink
```

Chaque secret posé est actif immédiatement en production. Ne pas ouvrir les
paiements avant la recette CinetPay ci-dessous.

Si `APP_BASE_URL` change (domaine personnalisé), mettre à jour ce secret, la
variable `API_URL` de `workers/wrangler.toml`, Firebase Authentication et les
URL CinetPay en même temps.

Les variables `NEXT_PUBLIC_FIREBASE_*` et `NEXT_PUBLIC_SITE_URL` sont publiques
et doivent correspondre au projet et au domaine validés. Ne pas transformer un
secret en variable `NEXT_PUBLIC_*`.

## CinetPay

Après validation du marchand et de l'adresse officielle :

1. Configurer la notification sur
   `https://<domaine-canonique>/api/webhooks/payment`.
2. Configurer l'URL de retour vers l'application.
3. Faire une recette avec le marchand : acceptation, refus, annulation,
   notification dupliquée, retour navigateur seul, mauvais montant et boutique
   suspendue.
4. Vérifier la transaction dans CinetPay, Cloudflare et Firestore avant toute
   activation réelle.

Le code interroge CinetPay côté serveur et ne fait pas confiance au retour
navigateur. Cela ne remplace pas une recette avec le véritable compte marchand.

## Expiration automatique

Le cron séparé se trouve dans `workers/`. Il a été redéployé le 19 novembre 2026
avec `wrangler deploy --config workers/wrangler.toml` (version
`5e11e22f-4ba1-449f-a482-2693c52be0ab`) : il s'exécute chaque jour à 3 h UTC et
appelle `https://fasolink.jurisia-api.workers.dev/api/cron/expire` avec le
`CRON_SECRET` partagé.

Contrôle du 19 novembre : `/api/cron/expire` répond 401 sans jeton et avec un
mauvais jeton. Aucune exécution authentifiée n'a été déclenchée manuellement, car
elle fait expirer de vrais abonnements. Vérifier la première exécution planifiée
dans les journaux (`npx wrangler tail fasolink-expiry-cron`) ou dans le tableau
de bord Cloudflare.

## Limitation des requêtes

`src/lib/rate-limit.ts` fournit une limite de rafales en mémoire, par isolate.
Le compteur n'est pas partagé entre toutes les instances Cloudflare et peut être
réinitialisé. Les formulaires connexion/inscription utilisent Firebase Auth
directement depuis le navigateur : ces appels ne traversent pas le middleware
de FasoLink. Il faut configurer et tester des règles de protection côté Cloudflare
pour les endpoints de l'application, et vérifier les protections et quotas
Firebase Auth. La limite en mémoire ne doit pas être présentée comme une défense
globale contre les attaques distribuées.

## Vérifications et publication

Avant une publication :

```powershell
npm ci
npm run lint
npx tsc --noEmit
npm run build
npm run test:firebase-rules
```

Publication du 18 novembre 2026 (commit `124f9f7`, refonte premium) : ESLint,
TypeScript et le build de production ont réussi; `npm run test:firebase-rules`
n'a pas pu s'exécuter faute de Java 21 sur ce poste (la refonte ne modifie pas
les règles). Le Worker est en version `4f3e0ee7-9c06-42c5-9161-3a7710f5276c`.
Toutes les pages ont été contrôlées en capture sur ordinateur (1440 px) et sur
mobile (390 px), avec et sans réduction des animations, sans débordement ni
erreur de console autre que l'avertissement Firestore connu sur les produits
publics. L'espace vendeur, le tableau de bord et l'administration n'ont été vus
que déconnectés : leur recette avec un compte réel reste à faire.

OpenNext signale qu'il n'est pas pleinement compatible avec Windows; la
publication du 18 novembre fonctionne, mais WSL est recommandé pour les
prochaines. Le téléversement des images
nécessite encore la recette Firebase Storage avec un compte vendeur. Le
dernier build Pages vérifié concernait le commit `3328929` et était en échec;
le résultat des pushs plus récents sur Pages n'a pas encore été vérifié. Après
réparation du pipeline choisi et validation des secrets et recettes, le Worker
se déploie avec `npm run deploy`.
