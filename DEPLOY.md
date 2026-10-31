# Déploiement — FasoLink sur Cloudflare Workers et Firebase

Dernière mise à jour : 31 octobre 2026.

## Adresses actuellement publiées

- Worker avec les dernières améliorations :
  `https://fasolink.jurisia-api.workers.dev`.
- Ancien site Pages : `https://fasolink.pages.dev` (répond encore mais n'a pas
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
   l'exécution locale a donc échoué avant le démarrage des tests. Le workflow
   `.github/workflows/firebase-rules.yml` lance la même suite sur GitHub Actions
   avec Java 21. Consulter son premier résultat avant d'affirmer que les règles
   sont validées.

## Secrets Cloudflare Workers

Le dernier contrôle de `wrangler secret list` pour le Worker `fasolink` a renvoyé
une liste vide. Ajouter les secrets seulement dans le compte Cloudflare autorisé,
jamais dans Git :

- `CINETPAY_API_KEY` et `CINETPAY_SITE_ID` : requis pour le checkout;
- `FIREBASE_SERVICE_ACCOUNT` : requis pour les opérations serveur Firestore;
- `CRON_SECRET` : requis pour le endpoint d'expiration;
- `APP_BASE_URL` : URL HTTPS canonique;
- `PAYMENT_WEBHOOK_SECRET` ou `CINETPAY_SECRET_KEY` : selon la signature mise à
  disposition par le compte CinetPay;
- `PEXELS_API_KEY` : seulement si la recherche d'images de substitution doit
  fonctionner avec ce fournisseur.

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

Le cron séparé se trouve dans `workers/`. Son URL par défaut vise maintenant le
Worker actuel dans `workers/wrangler.toml`; elle devra suivre le domaine que le
client choisira. Le cron **n'est pas confirmé comme déployé**. Avant activation,
ajouter `CRON_SECRET` à ce Worker et déployer sa configuration avec `wrangler
deploy --config workers/wrangler.toml`. Puis provoquer une exécution contrôlée
et vérifier la réponse de `/api/cron/expire`.

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

La dernière compilation de production réussie date du 31 octobre 2026. Le test
Firebase local a échoué sur cette machine parce que Java 21 manque; le workflow
GitHub doit confirmer les tests. Après validation des secrets et de la recette,
le Worker applicatif se déploie avec `npm run deploy`.
