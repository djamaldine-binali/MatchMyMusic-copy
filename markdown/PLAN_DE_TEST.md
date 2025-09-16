### Plan de Test – MatchMyMusic

Ce plan décline les suites de tests, cas, pré‑conditions, étapes et résultats attendus, en cohérence avec la stratégie et le code backend.

### Suites et cas

- Unitaires (5):
  1) userService.register — doublon email, hash, création OK.
  2) userService.login — not found / deleted / invalid password / succès JWT.
  3) musicService.addFavoriteForUser — upserts album/music/favorite; robustesse si checkForNewMatches échoue.
  4) ratingService.setRatingForUser — création puis mise à jour du rating.
  5) blockService.blockUser — self‑block/admin/deleted interdits; blocage standard OK.

- Intégration (5):
  1) Auth/admin middleware — `/api/users/profile`, `/api/admin/users` (401/403/200).
  2) Favorites CRUD/pagination — POST/GET/DELETE `/api/music/favorites`.
  3) Ratings — validation 1..5, upsert, `/api/ratings/recent`.
  4) Comments — create/get/update/delete ownership, listing par musique.
  5) Reports admin — create, grouped, stats, update status, delete.

- End‑to‑end (5):
  1) Register → Login → Profile.
  2) Favoris → Match automatique → Notifications.
  3) Conversation de match → messages bilatéraux.
  4) Blocage → accès chat refusé.
  5) Modération admin: soft delete/restauration user/music.

### Pré‑conditions communes

- DB test initialisée avec migrations.
- Données seed minimales: users (alice, bob, admin, deleted), 2–3 musiques/albums.
- `JWT_SECRET` de test configuré; génération de tokens utilitaire.
- Mocks Deezer actifs pour endpoints externes.

### Étapes et résultats (exemples synthétiques)

- Intégration Auth:
  - GET `/api/users/profile` sans/avec mauvais token -> 401; avec token user -> 200 JSON `{ user: { id, email, username, isAdmin } }`.
  - GET `/api/admin/users` avec token user -> 403; avec token admin -> 200.

- E2E Favoris→Match→Notif:
  - U1/U2 ajoutent suffisamment d’éléments communs (favoris/notes) pour atteindre `score ≥ 10`.
  - GET `/api/matches` (U1) contient le match; GET `/api/notifications` (U1&U2) contient `type='new_match'`.

- Comments ownership:
  - A crée commentaire, B ne peut pas le supprimer (403), A peut update/delete (200).

### Sortie attendue et traçabilité

- Chaque cas: statuts HTTP, schémas JSON clés, effets DB (présence/absence d’enregistrements), règles d’accès (auth/admin/ownership) validées.
- Lien exigence→test: les intitulés référencent modules (`userService.*`) et endpoints (`/api/...`) pour faciliter la traçabilité.
