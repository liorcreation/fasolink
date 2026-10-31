# FasoLink — état de finalisation et préparation de livraison

Dernière vérification : 31 octobre 2026.

## État exécutif

La version récente de FasoLink est déployée sur Cloudflare Workers :
<https://fasolink.jurisia-api.workers.dev>. L'accueil et le film de présentation
répondent en ligne. L'ancienne adresse <https://fasolink.pages.dev> répond
encore, mais sert une version différente, sans la nouvelle section vidéo.

Le dépôt local est synchronisé avec `origin/main` au commit `1986f08`. Le site
peut être présenté comme démonstration. Il n'est pas prêt à encaisser en
production : la liste des secrets du Worker est vide, le paiement marchand n'a
pas été testé et Firebase Storage doit être confirmé/activé avant de dépendre
des téléversements.

## Ce qui est vérifié ou préparé dans le dépôt

- La nouvelle hero claire, le visuel du téléphone, le comportement mobile et la
  section vidéo sont déployés sur le Worker. La vérification HTTP du Worker et
  de Pages a répondu 200; la version Pages reste ancienne.
- Les derniers contrôles de code de la version publiée (ESLint, TypeScript,
  build de production) ont réussi le 28 octobre 2026.
- Les règles Firestore ont été signalées comme publiées dans la recette du
  15 octobre. Leur état effectif doit être revalidé avant ouverture publique.
- Les tests automatisés Firestore/Storage existent dans
  `scripts/test-firebase-rules.mjs`. Leur lancement local le 31 octobre a
  échoué avant les tests : Firebase CLI exige Java 21 ou plus, absent de ce
  poste. Un workflow GitHub Actions a été ajouté pour les exécuter sous Linux;
  son premier résultat reste à consulter.
- Le fichier de configuration du Worker cron pointe maintenant vers le Worker
  récent. Ce Worker cron séparé n'est pas confirmé comme déployé et nécessite
  `CRON_SECRET` avant activation.
- Un rate limiter en mémoire est présent dans le middleware. Il s'applique par
  instance/isolate, peut repartir à zéro et ne bloque pas les appels
  d'authentification que le navigateur envoie directement à Firebase. Il ne
  remplace donc pas une politique Cloudflare distribuée ni les protections
  propres à Firebase Auth.

## Blocages avant exploitation commerciale

### À faire avec le client ou ses comptes

1. **Confirmer l'adresse officielle.** Choisir le Worker actuel ou un domaine
   contrôlé par le client. `fasolink.pages.dev` et le Worker n'affichent pas la
   même version. Ajouter ensuite le domaine retenu aux domaines autorisés de
   Firebase Authentication et mettre à jour les URL du paiement et du cron.
2. **Ajouter les secrets dans Cloudflare.** La commande de contrôle du Worker
   renvoie une liste vide. Il faut saisir les clés CinetPay, le compte de
   service Firebase Admin, `CRON_SECRET`, `APP_BASE_URL` et, si la signature
   CinetPay utilisée par le compte le demande, le secret de webhook. Ne jamais
   transmettre ces valeurs dans un message ni les committer.
3. **Valider le compte marchand CinetPay.** Le client doit fournir/activer ses
   accès et canaux de paiement burkinabè. Il faut ensuite configurer la
   notification sur `/api/webhooks/payment` et tester les paiements acceptés,
   refusés, annulés, répétés et interrompus. Aucun paiement réel n'a été
   exécuté.
4. **Confirmer Firebase Storage.** Le dernier état documenté disait que le
   bucket n'était pas activé et que ses règles n'étaient pas déployées. Vérifier
   la console, valider le budget, activer Storage si accepté, publier les règles,
   puis tester logos, images produits et pièces privées avec plusieurs rôles.
5. **Valider le Super Admin.** Le client doit créer/valider son compte. Un
   opérateur autorisé attribue ensuite le claim `superAdmin` depuis un poste
   sécurisé avec le compte de service; le client renouvelle sa session. Tester
   accès autorisé et refusé avec des comptes séparés.
6. **Valider le contenu et les règles métier.** Confirmer raison sociale,
   coordonnées, support, tarifs, durée d'essai, conditions de remboursement,
   textes légaux, boutiques et produits de démonstration à garder ou supprimer.

### Travail technique restant après réception de ces décisions/accès

1. Consulter le résultat du workflow Firebase Rules et corriger toute erreur.
   Vérifier que les règles réellement publiées correspondent aux fichiers du
   dépôt.
2. Exécuter une recette de bout en bout : inscription, connexion, rôle vendeur,
   créations/modifications, téléversements, avis, vérification, administration,
   suspension/réactivation, essai et expiration.
3. Après saisie des secrets, tester CinetPay en mode marchand avec accord du
   client : notification valide et invalide, doublon, mauvais montant, retour
   navigateur et boutique suspendue. Vérifier qu'une licence n'est activée
   qu'une fois.
4. Déployer et tester le Worker cron après configuration du secret et de l'URL
   officielle; vérifier l'expiration et la suspension attendues.
5. Configurer dans Cloudflare la limitation adaptée aux endpoints d'API
   exposés, puis vérifier les journaux, alertes et procédure de remboursement.
   Le limiteur en mémoire actuel est seulement une barrière locale par instance.
6. Faire la recette visuelle sur téléphones, tablettes et ordinateurs réels,
   puis une recette d'accessibilité, de réseau lent et de restauration après
   incident.
7. Mettre à jour et remettre le procès-verbal de recette, les consignes
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

**Démonstration en ligne : oui, sur le Worker. Encaissement commercial et
livraison opérationnelle complète : pas encore.** Les principaux blocages qui
dépendent du client sont l'adresse officielle, les secrets, le compte marchand,
Storage et l'approbation des informations métier. La recette de sécurité et des
parcours réels devra être terminée après ces réglages.
