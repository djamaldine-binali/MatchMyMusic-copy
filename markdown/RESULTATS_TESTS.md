## Cahier de Recettes – Tableau récapitulatif

<table border="1" cellspacing="0" cellpadding="6">
  <thead>
    <tr>
      <th>ID</th>
      <th>Type</th>
      <th>Fonctionnalité / Cas</th>
      <th>Objet / Finalité</th>
      <th>Résultat attendu</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>CR-01</td><td>Unitaire</td><td>userService.register</td><td>Créer un nouvel utilisateur (email unique, mdp haché)</td><td>Succès: utilisateur créé; Échec: email existant/données invalides</td></tr>
    <tr><td>CR-02</td><td>Unitaire</td><td>userService.login</td><td>Authentifier et délivrer un jeton</td><td>Succès: jeton; Échec: user inconnu/mdp invalide/compte supprimé</td></tr>
    <tr><td>CR-03</td><td>Unitaire</td><td>musicService.addFavoriteForUser</td><td>Ajouter une musique aux favoris (création album/music si besoin)</td><td>Succès: favori et entités créés; Échec: données incohérentes</td></tr>
    <tr><td>CR-04</td><td>Unitaire</td><td>ratingService.setRatingForUser</td><td>Créer/mettre à jour une note valide</td><td>Succès: note enregistrée/maj; Échec: valeur hors bornes</td></tr>
    <tr><td>CR-05</td><td>Unitaire</td><td>blockService.blockUser</td><td>Appliquer les règles d’éligibilité au blocage</td><td>Succès: blocage; Échec: auto‑blocage/admin/user supprimé</td></tr>
    <tr><td>CR-06</td><td>Intégration</td><td>musicController add/get/deleteFavorite</td><td>API favoris (ajout, pagination, suppression)</td><td>Succès: flux OK; Échec: non autorisé</td></tr>
    <tr><td>CR-07</td><td>Intégration</td><td>ratingController setRating/getRecent</td><td>API notes récentes</td><td>Succès: set + liste récente correcte</td></tr>
    <tr><td>CR-08</td><td>Intégration</td><td>commentController CRUD</td><td>Création/lecture/maj/suppression avec propriété</td><td>Succès: auteur gère; Échec: non‑propriétaire</td></tr>
    <tr><td>CR-09</td><td>Intégration</td><td>reportController (signalements)</td><td>Signalement + gestion admin</td><td>Succès: admin gère; Échec: droits insuffisants</td></tr>
    <tr><td>CR-10</td><td>E2E API</td><td>register → login → profile</td><td>Parcours complet</td><td>Succès: jeton + profil</td></tr>
    <tr><td>CR-11</td><td>E2E API</td><td>chat conversation/messages</td><td>Conversation après match</td><td>Succès: messages visibles</td></tr>
    <tr><td>CR-12</td><td>E2E API</td><td>block désactive chat</td><td>Blocage actif</td><td>Succès: 403 côté API</td></tr>
    <tr><td>CR-13</td><td>E2E API</td><td>match + notifications</td><td>Match sur goûts communs</td><td>Succès: match + notifications</td></tr>
    <tr><td>CR-14</td><td>E2E API</td><td>admin moderation</td><td>Soft delete/restore</td><td>Succès: opérations OK</td></tr>
    <tr><td>CR-15</td><td>E2E UI</td><td>Register/Login/Profile (Cypress)</td><td>Parcours UI</td><td>Succès: /main + profil</td></tr>
    <tr><td>CR-16</td><td>E2E UI</td><td>Chat conversation/messages (Cypress)</td><td>Widget chat</td><td>Succès: message visible</td></tr>
    <tr><td>CR-17</td><td>E2E UI</td><td>Block désactive chat (Cypress)</td><td>UI interdite si blocage</td><td>Succès: UI désactivée</td></tr>
    <tr><td>CR-18</td><td>E2E UI</td><td>Match + notifications (Cypress)</td><td>Notification visible</td><td>Succès: badge/notification</td></tr>
    <tr><td>CR-19</td><td>E2E UI</td><td>Admin moderation (Cypress)</td><td>Workflow admin</td><td>Succès: actions visibles</td></tr>
  </tbody>
  </table>


## Résultats des tests unitaires

- Date d’exécution: 2025-09-22
- Commande: `npm run test:unit` (backend)
- Résumé:
  - Total: 9
  - Réussis: 9
  - Échoués: 0
  - Skippés: 0
- Détails (principaux cas):
  - blockService.blockUser.test.js: PASS
  - ratingService.setRatingForUser.test.js: PASS
  - musicService.addFavoriteForUser.test.js: PASS
  - userService.register.test.js: PASS
  - userService.login.test.js: PASS

```text
Test Suites: 5 passed, 5 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        ~0.5s
```

### Tableau récapitulatif (Unitaires)

| Métrique | Valeur |
|----------|--------|
| Total tests | 9 |
| Réussis | 9 |
| Échoués | 0 |
| Skippés | 0 |
| Durée | ~0.5s |

### Détail par fichier (Unitaires)

| Fichier | Statut |
|---------|--------|
| test/unitaires/blockService.blockUser.test.js | PASS |
| test/unitaires/ratingService.setRatingForUser.test.js | PASS |
| test/unitaires/musicService.addFavoriteForUser.test.js | PASS |
| test/unitaires/userService.register.test.js | PASS |
| test/unitaires/userService.login.test.js | PASS |


## Résultats des tests d’intégration (API)

- Date d’exécution: 2025-09-22
- Commande: `npm run test:int` (backend)
- Résumé:
  - Total: 11
  - Réussis: 11
  - Échoués: 0
  - Skippés: 0
- Détails (routes clés):
  - reports.test.js: PASS
  - user.journey.test.js: PASS (log d’erreurs attendu pour cas négatifs – 400/401)
  - comments.test.js: PASS (création/mise à jour OK, erreurs gérées P2025 sur delete/update inexistants)
  - music.favorites.test.js: PASS (création album/music/favorite OK)
  - ratings.test.js: PASS

```text
Test Suites: 5 passed, 5 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        ~6.7s
```

### Tableau récapitulatif (Intégration)

| Métrique | Valeur |
|----------|--------|
| Total tests | 11 |
| Réussis | 11 |
| Échoués | 0 |
| Skippés | 0 |
| Durée | ~6.7s |

### Détail par fichier (Intégration)

| Fichier | Statut |
|---------|--------|
| test/integration/reports.test.js | PASS |
| test/integration/user.journey.test.js | PASS |
| test/integration/comments.test.js | PASS |
| test/integration/music.favorites.test.js | PASS |
| test/integration/ratings.test.js | PASS |


## Résultats des tests End-to-End (API – Jest/Supertest)

- Date d’exécution:
- Commande: `npm run test:e2e` (backend)
- Résumé:
  - Suites:
  - Tests:
  - Réussis:
  - Échoués:
- Détails (scénarios):
  - Register/Login/Profile:
  - Chat conversation/messages:
  - Block disables chat:
  - Match notifications:
  - Admin moderation:


## Résultats des tests End-to-End (UI – Cypress)

- Date d’exécution:
- Commandes:
  - UI non-headless: `npm run cy:open`
  - UI headless: `npx cypress run --browser chrome`
- Configuration artefacts (screenshots/vidéos):
  - Vidéo: activée
  - Screenshots à l’échec: désactivés
  - Suppression artefacts si échec: activée via `after:spec`
- Résumé:
  - Specs:
  - Pass:
  - Fail:
- Détails (scénarios):
  - Register/Login/Profile:
  - Chat conversation/messages:
  - Block disables chat:
  - Match notifications:
  - Admin moderation:


## Observations / Anomalies

- 

## Actions / Suivi

- 


