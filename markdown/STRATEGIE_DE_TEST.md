### Stratégie de Test – MatchMyMusic

Objectif: définir l’approche globale de test (niveaux, environnement, outils, isolation, mocks) pour assurer une couverture fiable du backend.

### Niveaux de tests

- Unitaires: logique métier isolée des services (`userService`, `musicService`, `ratingService`, `blockService`, `matchService`, `commentService`, `chatService`, `reportService`, `notificationService`, `adminService`).
- Intégration: endpoints Express + Prisma, base réelle de test, sans mock de la couche DB.
- End‑to‑end: scénarios complets via HTTP, enchaînant authentification, autorisations et règles métier (match, chat, notifications).

### Environnement

- Base: SQLite dédiée aux tests (fichier séparé ou en‑mémoire), migrations Prisma appliquées avant la suite.
- Auth: `JWT_SECRET` de test; utilitaires pour générer des tokens `{ userId }` valides/invalides.
- Réseau: mock strict des appels à `api.deezer.com` (ex: `nock` ou stub `fetch`) pour éliminer la variabilité réseau.
- Isolation: reset DB entre tests (transactions par test, ou recréation du fichier et ré‑migrations par suite). Données seed minimales par suite.

### Données seed minimales

- Utilisateurs: `alice` (user), `bob` (user), `admin` (isAdmin=true), `deleted` (isDeleted=true).
- Musiques/Albums: quelques entrées cohérentes (titres/mbid/covers plausibles).
- Favoris/Notes: quantités suffisantes pour atteindre ou éviter le seuil de match (≥10) suivant les scénarios.
- Optionnel selon cas: un commentaire initial, une conversation vide ou avec 1 message.

### Critères de qualité

- Déterminisme: contrôle du temps si nécessaire (fixer `Date`) et interdiction de dépendances réseau en tests.
- Observabilité: assertions sur statuts HTTP, corps JSON (champs essentiels), et effets persistants en base.
- Sécurité/accès: couvrir tokens manquants/invalides, comptes supprimés, rôles admin, ownership (commentaires, chat), blocages.

### Outils (suggestion)

- Runner: Jest ou Vitest.
- HTTP: supertest pour tester les routes Express.
- Mocks réseau: `nock` ou stub de `node-fetch`.
- Scripts: npm scripts distincts pour unit / intégration / E2E, plus un script de reset DB de test.
