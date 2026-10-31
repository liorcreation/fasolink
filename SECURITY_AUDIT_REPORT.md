# FasoLink — état de sécurité et points à vérifier

**Mise à jour : 31 octobre 2026**\
**Portée :** revue des fichiers du dépôt et des vérifications effectivement lancées.\
**Statut :** revue technique partielle. Ce document n'est ni une certification, ni un audit externe, ni une preuve que les règles actuellement publiées correspondent au code.

## Résumé simple

Le dépôt contient plusieurs protections utiles : règles Firestore, contrôles du rôle `superAdmin`, vérification serveur des transactions CinetPay et validations d'entrées. Leur comportement n'est pas encore entièrement prouvé sur le projet Firebase et les comptes de production.

Le test automatique Firestore/Storage n'a pas démarré sur le poste de développement : Firebase CLI demande Java 21 ou plus et Java n'y est pas installé. Un workflow GitHub Actions a été ajouté pour exécuter ces tests avec Java 21; son premier résultat doit encore être consulté. Tant qu'il n'a pas réussi, les règles ne sont pas déclarées validées par test.

Le limiteur `src/lib/rate-limit.ts` est en mémoire, par instance/isolate Cloudflare. Il peut se réinitialiser et n'est pas partagé entre les instances. Les appels Firebase Authentication envoyés directement par le navigateur ne traversent pas le middleware FasoLink. Ce mécanisme réduit certaines rafales locales, mais ne constitue pas une protection globale contre le brute-force ou les attaques distribuées.

## Protections présentes dans le code

### Comptes et autorisations

- Les règles Firestore utilisent le claim `superAdmin` pour les opérations administratives sensibles; l'ancien claim `admin` ne doit pas accorder l'accès aux dossiers privés.
- Les règles du dépôt limitent les modifications vendeur sur les champs sensibles d'une boutique et vérifient la propriété lors des opérations sur produits.
- Les avis empêchent l'auto-évaluation par le propriétaire selon les règles présentes dans le dépôt.
- Ces constats concernent les fichiers versionnés. Les règles effectives dans Firebase doivent être comparées avant la mise en service.

### Paiements

- L'initialisation et la vérification CinetPay sont préparées côté serveur. Le navigateur seul ne doit pas suffire à activer une licence.
- Le webhook doit obtenir une confirmation auprès de CinetPay et comparer les données de transaction avant activation.
- Le parcours réel n'a pas été testé : les secrets CinetPay et le compte marchand ne sont pas configurés dans l'environnement Cloudflare contrôlé lors de la dernière vérification.
- La validation de signature ne peut s'appliquer que si le marchand fournit et configure le mécanisme/secret attendu. Ne pas considérer cette option comme active sans essai réel.

### Limites et configuration

- Le middleware applique une limite locale aux requêtes HTTP ciblées; il ne contrôle pas les appels directs du SDK Firebase dans le navigateur.
- Le cron d'expiration est un Worker séparé. Sa configuration source pointe vers le Worker FasoLink courant, mais son déploiement et son secret `CRON_SECRET` ne sont pas confirmés.
- La liste consultée des secrets du Worker FasoLink était vide. Les secrets ne doivent jamais être ajoutés au dépôt ou à un PDF.
- Le dernier état documenté indiquait que Firebase Storage n'était pas activé. Il faut vérifier l'état actuel dans la console avant de compter sur l'envoi de logos, photos ou justificatifs.

## Vérifications effectuées et limites

| Vérification | Résultat observé | Ce que cela permet de conclure |
|---|---|---|
| ESLint, TypeScript, compilation | Les derniers contrôles documentés de la version publiée ont réussi fin octobre. | Le code compilait à cette date; cela ne prouve pas le comportement de production. |
| Requête HTTP sur les deux adresses | Worker et Pages répondaient HTTP 200 lors du dernier contrôle, mais n'exposaient pas la même version. | Le Worker est une démo accessible; Pages reste une autre publication. |
| Suite de tests Firestore/Storage | Échec avant démarrage faute de Java 21 sur le poste. | Aucune conclusion positive ou négative sur les règles; attendre le résultat CI. |
| Paiement réel | Pas effectué. | CinetPay n'est pas validé en conditions marchandes. |
| Storage et appareils physiques | Pas de recette complète confirmée dans ce dossier. | Photos, justificatifs, mobile/tablette et appareils du client restent à vérifier. |

## Actions de sécurité avant commercialisation

1. Lire le premier résultat du workflow `.github/workflows/firebase-rules.yml`; corriger toute erreur puis republier les règles validées.
2. Comparer explicitement les règles Firestore et Storage de la console Firebase aux fichiers du dépôt.
3. Faire vérifier les rôles avec au moins trois comptes distincts : visiteur, vendeur et Super Admin; tester les accès autorisés et les refus.
4. Après accord budgétaire, activer Storage, publier les règles et vérifier les limites de taille/type ainsi que l'accès privé aux justificatifs.
5. Saisir les secrets dans Cloudflare par un opérateur autorisé. Ne jamais les communiquer dans le chat, les committer ou les mettre dans un PDF.
6. Choisir avec le client une seule URL officielle et l'inscrire dans Firebase Auth, le retour CinetPay et le cron.
7. Configurer des protections Cloudflare adaptées aux endpoints exposés et à leur trafic. Mesurer les faux positifs avant ouverture.
8. Exécuter les tests marchands acceptés, refusés, annulés, dupliqués et avec montant invalide; vérifier qu'aucun retour navigateur seul n'active la boutique.
9. Déployer et vérifier le cron avec un secret robuste; confirmer qu'une expiration suspend bien la boutique sans rechargement de page.
10. Préparer alertes, journalisation, sauvegarde, procédure de restauration et contact de réponse aux incidents.

## Conclusion

FasoLink possède une base de protections côté code, mais le niveau de sécurité réel n'est pas encore entièrement validé. La suite Firebase doit réussir en CI, les réglages de production doivent être comparés au dépôt, et la recette des rôles, du stockage, du cron et du paiement doit être effectuée avec les accès du client. Ne pas présenter FasoLink comme « certifié », « inviolable » ou prêt à encaisser avant ces contrôles.
