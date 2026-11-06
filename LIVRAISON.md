# FasoLink — état de finalisation et préparation de livraison

Dernière vérification : 6 novembre 2026 (après la passe Mes boutiques).

## État exécutif

La version de démonstration répond sur le Worker
<https://fasolink.jurisia-api.workers.dev> et sur Pages
<https://fasolink.pages.dev>, mais les deux publications diffèrent. Le Worker
renvoie l'image de la hero récente; Pages ne la renvoie pas. Les contrôles HTTP
du 31 octobre ont renvoyé 200 sur les pages principales des deux domaines.

État Git : commit `0185c21` poussé sur `origin/main`. Le Worker Cloudflare a été
redéployé après cette publication (version `94827b7a-51a0-4e20-a747-18ea4eb4cae1`);
les routes `/`, `/vendeur/boutiques`, `/vendeur/dashboard` et `/connexion`
répondent HTTP 200.
Cloudflare Pages demeure une
publication distincte et ancienne; son dernier build `main` vérifié est marqué
**Failure**. Les deux adresses ne servent donc toujours pas nécessairement la
même version.

La livraison commerciale n'est pas prête : le workflow des règles Firebase a
échoué dans son étape de tests, les secrets du Worker applicatif sont absents,
le endpoint cron renvoie 401 sans le secret attendu, les pages légales portent
encore des champs à compléter et le paiement réel n'a pas été testé.

## Ce qui est vérifié ou préparé dans le dépôt

- `npm run lint`, `npx tsc --noEmit` et `npm run build` ont réussi localement le
  6 novembre. Le build affiche encore l'avertissement de dépréciation de la
  convention `middleware` dans cette version de Next.js.
- Une passe de fondation UI a centralisé les échelles rouge/or, les neutres
  chauds, les couleurs d'état, les rayons, ombres et durées. Geist est utilisé
  pour le texte et Sora pour les titres. Les boutons ont un état de chargement
  et une variante destructive; les badges ont des tons sémantiques; les
  valeurs de tableau de bord utilisent des chiffres tabulaires. Le titre hero
  desktop a été recalibré et un filet de marque a été ajouté à la navbar.
- Le catalogue Produits a ensuite été poli : filtres famille et actions de
  comparaison/commande disposent de zones tactiles d'au moins 44 px, le nombre
  de résultats est annoncé sans relire toute la grille, l'état vide distingue
  une recherche infructueuse d'un catalogue encore vide, et les animations des
  cartes respectent `prefers-reduced-motion`.
- Connexion/Inscription ont ensuite reçu des critères de mot de passe annoncés
  aux aides techniques, un bouton d’envoi qui expose son état occupé, des
  contrôles tactiles renforcés et des couleurs reliées aux tokens du thème. Le
  fonctionnement Firebase n’a pas été changé. ESLint, TypeScript et le build
  Next.js ont réussi pour cette étape le 6 novembre.
- Le tableau de bord vendeur présente maintenant des squelettes pendant le
  chargement des statistiques, une description accessible du graphique, des
  commandes tactiles d’au moins 44 px et des entrées animées réduites selon la
  préférence système. ESLint, TypeScript et le build de production ont réussi;
  `/vendeur/dashboard` répond HTTP 200. La recette réelle avec un compte vendeur
  et les données Firebase n’a pas été exécutée.
- Le Profil utilisateur utilise des placeholders de chargement pour les
  coordonnées et favoris, des boutons tactiles d’au moins 44 px et des états
  occupés accessibles pendant l’enregistrement et la déconnexion. Les
  animations des favoris respectent la réduction du mouvement. ESLint,
  TypeScript et le build ont réussi; `/profil` répond HTTP 200. La vérification
  avec un compte authentifié reste à faire.
- La vitrine boutique améliore l’accès tactile et clavier aux avis et à la
  galerie : note plus facile à sélectionner, formulaire libellé avec limite et
  compteur de caractères, état de publication annoncé, fermeture de la photo
  agrandie avec Échap et retour du focus au bouton d’ouverture. Les animations
  tiennent compte de `prefers-reduced-motion`. ESLint, TypeScript et le build
  Worker ont réussi; `/`, `/boutiques` et `/connexion` répondent HTTP 200.
  La recette visuelle sur appareils réels et la publication d’un avis avec un
  compte visiteur restent à faire.
- La fiche produit ramène maintenant le fil d’Ariane vers la liste des
  boutiques. Le CTA mobile ouvre WhatsApp avec le nom et le prix du produit,
  puis demande sa disponibilité ou une prochaine disponibilité selon son état.
  Le Worker a été redéployé; aucune URL de produit publique n'était présente
  dans le catalogue accessible pour tester une fiche réelle. Une recette
  mobile avec un produit et un vendeur existants reste à faire.
- « Mes boutiques » suit en direct les boutiques, les produits de chaque
  boutique et les abonnements Firestore; les changements de statut et de
  catalogue apparaissent sans actualiser la page. Des filtres par statut avec
  compteurs, une recherche effaçable, un état de synchronisation et une action
  de reprise complètent le parcours. Les animations respectent la préférence
  de mouvement réduit. ESLint, TypeScript et le build réussissent; les routes
  `/vendeur/boutiques` et `/vendeur/dashboard` répondent HTTP 200. La recette
  authentifiée avec le compte vendeur et les écritures Firebase réelles reste
  à faire.
- La prévisualisation desktop avait montré un saut de ligne trop tôt dans le
  titre hero, corrigé ensuite. La nouvelle vérification visuelle après rebuild
  a échoué dans le navigateur local; le serveur répondait pourtant HTTP 200.
  Le rendu mobile n'a pas été inspecté visuellement dans cette passe. Les bases
  sont consolidées, mais les pages ne sont pas encore toutes migrées vers ces
  tokens et il n'y a pas encore de thème sombre complet.
- Un contrôle HTTP des principales pages publiques a renvoyé 200 sur Worker et
  Pages; `/route-inconnue-fasolink` renvoie 404. Les endpoints POST-only
  renvoient 405 au GET sur le Worker, mais les routes de paiement
  `/api/payments/cinetpay/initialize` et `/api/payments/trial` renvoient 404 sur
  Pages. Ce contrôle HTTP ne teste pas les actions authentifiées.
- Le Worker actuel contient le visuel récent de la hero; Pages ne contient pas
  ce visuel. Il faut choisir une seule adresse canonique ou synchroniser le
  déploiement Pages avant d'annoncer l'URL officielle.
- Les règles Firestore avaient été signalées publiées le 15 octobre, mais les
  règles actuellement actives doivent être comparées au dépôt.
- Les tests automatisés Firestore/Storage existent dans
  `scripts/test-firebase-rules.mjs`. Leur lancement local le 31 octobre a
  échoué avant les tests : Firebase CLI exige Java 21 ou plus, absent de ce
  poste. Le workflow GitHub `41238891242` a ensuite échoué dans l'étape
  `Run Firestore and Storage rule tests`. La cause détaillée n'a pas pu être
  lue avec les droits disponibles; les règles ne sont donc pas validées par
  cette suite.
- `wrangler secret list` renvoie une liste vide pour le Worker applicatif
  `fasolink`. Le Worker cron possède un secret nommé `CRON_SECRET`, mais son
  dernier déploiement visible date du 14 septembre. Un POST non authentifié à
  l'API d'expiration du Worker applicatif renvoie 401. Il faut renseigner le
  même secret côté application, redéployer le cron avec la cible Worker récente,
  puis effectuer un test authentifié.
- `scripts/seed.ts` injecte le jeu de démonstration complet : 9 boutiques,
  catégories hors électronique incluses, ainsi que des abonnements factices
  actifs `gateway: seed`. Ne pas lancer ce script contre la base de production;
  assainir le seeding et vérifier le contenu réel de Firestore.
- Les fichiers `/conditions`, `/confidentialite` et `/mentions-legales` affichent
  encore explicitement des informations à compléter ou à confirmer (éditeur,
  adresse, email, responsable de publication et relecture légale).
- Un rate limiter en mémoire est présent dans le middleware. Il s'applique par
  instance/isolate, peut repartir à zéro et ne bloque pas les appels
  d'authentification que le navigateur envoie directement à Firebase. Il ne
  remplace donc pas une politique Cloudflare distribuée ni les protections
  propres à Firebase Auth.

## Blocages avant exploitation commerciale

### À faire avec le client ou ses comptes

1. **Choisir l'adresse officielle et rétablir le déploiement attendu.** Le Worker
   et Pages sont différents; le dernier build Pages de `main` est en échec.
   Choisir le Worker ou corriger le pipeline Pages, puis aligner Firebase Auth,
   le paiement et le cron sur ce domaine.
2. **Faire réussir les tests Firebase.** Le workflow GitHub des règles a échoué.
   Obtenir ses logs, corriger la cause, relancer et comparer les règles actives
   de Firestore/Storage aux fichiers du dépôt.
3. **Configurer les secrets dans le Worker applicatif.** La liste de secrets du
   Worker `fasolink` est vide. Il manque au minimum les clés CinetPay et le
   compte de service Firebase; `CRON_SECRET` doit aussi être présent côté API.
   Saisir toute valeur directement dans Cloudflare, jamais dans Git ou un PDF.
4. **Valider le compte marchand CinetPay.** Le client doit fournir/activer ses
   accès et canaux de paiement burkinabè. Il faut ensuite configurer la
   notification sur `/api/webhooks/payment` et tester les paiements acceptés,
   refusés, annulés, répétés et interrompus. Aucun paiement réel n'a été
   exécuté.
5. **Confirmer Firebase Storage.** Le dernier état documenté disait que le
   bucket n'était pas activé et que ses règles n'étaient pas déployées. Vérifier
   la console, valider le budget, activer Storage si accepté, publier les règles,
   puis tester logos, images produits et pièces privées avec plusieurs rôles.
6. **Valider le Super Admin.** Le client doit créer/valider son compte. Un
   opérateur autorisé attribue ensuite le claim `superAdmin` depuis un poste
   sécurisé avec le compte de service; le client renouvelle sa session. Tester
   accès autorisé et refusé avec des comptes séparés.
7. **Finaliser les pages légales et règles métier.** Confirmer raison sociale,
   coordonnées, support, tarifs, durée d'essai, conditions de remboursement,
   textes légaux, boutiques et produits de démonstration à garder ou supprimer.

### Travail technique restant après réception de ces décisions/accès

1. Consulter le résultat du workflow Firebase Rules et corriger toute erreur.
   Le run `41238891242` est déjà en échec; ses logs doivent être obtenus avant
   de relancer la suite et valider les règles actives.
2. Exécuter une recette de bout en bout : inscription, connexion, rôle vendeur,
   créations/modifications, téléversements, avis, vérification, administration,
   suspension/réactivation, essai et expiration.
3. Après saisie des secrets, tester CinetPay en mode marchand avec accord du
   client : notification valide et invalide, doublon, mauvais montant, retour
   navigateur et boutique suspendue. Vérifier qu'une licence n'est activée
   qu'une fois.
4. Ajouter `CRON_SECRET` au Worker API, redéployer le Worker cron (son dernier
   déploiement visible date du 14 septembre) après confirmation de l'URL, puis
   vérifier qu'un abonnement expiré est traité et que la boutique est suspendue.
5. Configurer dans Cloudflare la limitation adaptée aux endpoints d'API
   exposés, puis vérifier les journaux, alertes et procédure de remboursement.
   Le limiteur en mémoire actuel est seulement une barrière locale par instance.
6. Vérifier que `scripts/seed.ts` ne peut pas injecter des boutiques et licences
   factices en production; contrôler le catalogue réel et retirer toute donnée
   de démonstration avant livraison.
7. Faire la recette visuelle sur téléphones, tablettes et ordinateurs réels,
   puis une recette d'accessibilité, de réseau lent et de restauration après
   incident.
8. Mettre à jour et remettre le procès-verbal de recette, les consignes
   d'exploitation, les contacts d'assistance et les accès par canal sécurisé.

## Coûts externes à confirmer

- **CinetPay :** frais et délais selon le compte marchand et le contrat; aucun
  tarif n'est supposé ici. Les transactions de recette peuvent entraîner des
  frais.
- **Firebase Storage :** le forfait ou la consommation peuvent être facturés;
  valider le budget et les alertes avant activation.
- **Nom de domaine :** dépense annuelle seulement si le client en choisit un.
- **Cloudflare :** vérifier les limites et coûts du compte pour les règles de
  limitation de débit et le trafic prévu.
- **Conseil juridique / maintenance :** à contractualiser selon le besoin; le
  code ne remplace pas une validation juridique ni un service d'exploitation.

Les modifications de code et contrôles locaux effectués ici ne déclenchent pas,
à eux seuls, de souscription payante. Les tarifs exacts dépendent des comptes du
client.

## Décision de livraison

**Démonstration en ligne : oui, sur Worker et Pages avec des versions différentes.
Livraison commerciale complète : non.** Les blocages incluent maintenant un
build Pages en échec, une suite Firebase en échec, l'absence de secrets sur le
Worker applicatif, un cron qui reçoit 401, des textes légaux incomplets, le
seeding de données factices et les recettes réelles du paiement, des rôles et
des appareils. Il n'y a donc pas seulement huit points, et certains points
précédemment notés « en attente » sont désormais confirmés en échec.
