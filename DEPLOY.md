# Déploiement — Cloudflare Workers + OpenNext + Firebase

FasoLink utilise Next.js 16 avec l'adaptateur OpenNext pour Cloudflare Workers.
Le dépôt historique était hébergé sur Cloudflare Pages; cette migration change
la cible de déploiement et doit être essayée sur une URL de préproduction avant
la bascule. Le domaine technique `fasolink.pages.dev` ne peut pas être transféré
tel quel à un Worker : choisir `*.workers.dev` ou un domaine personnalisé, puis
mettre à jour Firebase Auth et les URLs CinetPay.

## 1. Préparer Firebase

1. Vérifier Firestore, Authentication (Email/Password et Anonymous si toujours
   utilisé par le parcours) et Storage dans le projet FasoLink.
2. Publier les règles examinées depuis ce dépôt :
   `firebase deploy --only firestore:rules,storage --project fasolink-d6e77`.
3. Ajouter le domaine public retenu à Authentication → Authorized domains.
4. Activer Storage seulement après validation du budget Blaze, des alertes et
   des quotas de stockage/transfert.

## 2. Préparer Cloudflare Workers

1. Dans Cloudflare, choisir le nom de Worker `fasolink` et la cible publique
   (`*.workers.dev` ou un domaine personnalisé maîtrisé par le client).
2. Installer les variables/secrets de production et de préproduction sans les
   exposer au navigateur : `CINETPAY_API_KEY`, `CINETPAY_SITE_ID`,
   `FIREBASE_SERVICE_ACCOUNT`, `CRON_SECRET`, `APP_BASE_URL`,
   `NEXT_PUBLIC_SITE_URL` et les variables publiques `NEXT_PUBLIC_FIREBASE_*`.
3. Vérifier que les URLs utilisent le domaine canonique choisi. Mettre ce
   domaine dans Firebase Auth et dans les URLs CinetPay.
4. Construire et prévisualiser sous Linux/WSL ou dans une CI Linux :
   `npm ci`, `npm run lint`, `npm run build`, `npm run preview`.
   OpenNext signale que Windows natif n'est pas entièrement supporté; le preview
   local exécuté sur Windows dans cette préparation a retourné une erreur
   `loadManifest` pour les routes malgré la génération réussie du bundle.
5. Après recette de la préproduction et accord du client, déployer avec
   `npm run deploy` (ou `npm run upload` pour téléverser une version sans la
   servir immédiatement).

Le fichier `wrangler.jsonc` configure le Worker, les assets, Node.js compatibility,
les journaux et l'auto-référence Workers. Aucun bucket R2 n'est imposé; l'activation
du cache R2 est facultative et dépend d'un bucket créé/autorisé dans le compte
client.

## 3. Paiement CinetPay

Le client doit créer/valider le compte marchand et activer les canaux burkinabè
qu'il est autorisé à utiliser. Configurer la notification sur
`https://<domaine-canonique>/api/webhooks/payment`; vérifier ensuite les paiements
acceptés, refusés, annulés, doublés et les retours navigateur. Le code revérifie
chaque transaction côté serveur et n'accepte pas le simple retour navigateur.
Confirmer frais, plafonds, délais de reversement et remboursements auprès de
CinetPay avant toute vente réelle.

## 4. Expiration et exploitation

Le job quotidien appelle `POST /api/cron/expire` avec
`Authorization: Bearer <CRON_SECRET>`. Le dépôt contient le Worker cron séparé
`workers/expire-cron.js` et `workers/wrangler.toml` (03:00 UTC); le déployer et
tester sa réponse après validation du Worker applicatif.

Ajouter dans Cloudflare une politique de limitation de débit appropriée pour
l'initialisation du paiement, les retours/webhooks et le cron. Tester les
journaux, alertes et procédure de rapprochement/remboursement.

## 5. Rôle Super Admin

Après création du compte Firebase du client, attribuer les claims depuis un poste
de confiance avec `npm run superadmin:set -- <email-client>`. Le compte doit se
déconnecter/reconnecter. Ne jamais committer ni transmettre le compte de service.
Vérifier les règles Firestore/Storage avec un compte vendeur et un compte
non-admin avant ouverture publique.
