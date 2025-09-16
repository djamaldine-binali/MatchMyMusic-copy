### Cahier de Recettes Tests – MatchMyMusic

Ce document décrit les recettes de tests: scénarios, pré‑conditions, étapes et résultats attendus pour 15 cas (5 unitaires, 5 intégration, 5 end‑to‑end).

### Tests unitaires (5)

1) userService.register
- Pré‑conditions (succès): aucun utilisateur n’existe avec l’email fourni.
- Pré‑conditions (erreur): un utilisateur existe déjà avec l’email fourni (doublon) OU données manquantes/invalides.
- Étapes:
  - `register({ email: 'test@ex.com', ... })` -> erreur.
  - `register({ email: 'new@ex.com', password, username })` -> succès.
- Résultats attendus:
  - Erreur `status=400` “User already exists”.
  - Retour user avec mot de passe hashé.

2) userService.login
- Pré‑conditions (succès): utilisateur existant non supprimé avec email/mot de passe valides.
- Pré‑conditions (erreur): email inconnu OU compte supprimé (`isDeleted=true`) OU mot de passe invalide.
- Étapes:
  - Email inconnu -> 404; supprimé -> 403; mauvais MDP -> 401; succès -> JWT.
- Résultats attendus: codes/erreurs corrects, token non vide.

3) musicService.addFavoriteForUser
- Pré‑conditions (succès): utilisateur authentifié; musique absente des favoris; données musique cohérentes.
- Pré‑conditions (erreur): données incohérentes/incomplètes OU règle d’accès non respectée.
- Étapes: appel avec `{ mbid, title, albumTitle, coverUrl }`.
- Résultats: album créé si applicable, musique upsertée, favori créé/mis à jour; pas d’échec si `checkForNewMatches` échoue (mock).

4) ratingService.setRatingForUser
- Pré‑conditions (succès): utilisateur authentifié; musique cible existante (ou créable); valeur entre 1 et 5.
- Pré‑conditions (erreur): valeur hors bornes (≤0 ou >5) OU ressource invalide.
- Étapes: `value=3` puis `value=5` même musique.
- Résultats: création puis mise à jour du rating; liens musique/album cohérents.

5) blockService.blockUser
- Pré‑conditions (succès): deux utilisateurs valides (non supprimés); non‑admin bloque un non‑admin; pas d’auto‑blocage.
- Pré‑conditions (erreur): auto‑blocage OU blocage d’un admin par non‑admin OU utilisateur supprimé.
- Étapes: self‑block -> erreur; bloque admin -> erreur; bloque deleted -> erreur; bloque user normal -> succès.
- Résultats: erreurs attendues ou enregistrement `UserBlock` valide.

### Tests d’intégration (5)

1) Auth et admin middleware
- Pré‑conditions (succès): token JWT valide (pour user); token JWT valide avec rôle admin (pour routes admin).
- Pré‑conditions (erreur): absence de token OU token invalide OU rôle insuffisant.
- Étapes:
  - GET `/api/users/profile` sans/mauvais token -> 401; avec token user -> 200.
  - GET `/api/admin/users` token user -> 403; token admin -> 200.
- Résultats: statuts et payloads conformes.

2) Favorites CRUD/pagination
- Pré‑conditions (succès): user authentifié; au moins 2 musiques disponibles.
- Pré‑conditions (erreur): action sans authentification OU ressource inexistante/non autorisée.
- Étapes: POST favori -> 201; GET paginé -> items/total ok; DELETE favori -> 204.
- Résultats: `{ items, total, page, pageSize }` corrects; effets DB vérifiés.

3) Ratings
- Pré‑conditions (succès): user authentifié; valeurs 1..5.
- Pré‑conditions (erreur): valeur hors bornes OU absence d’auth.
- Étapes: POST valeur 0 -> 400; POST 3 -> 201; POST 5 même musique -> 201; GET recent?take=1 -> item récent.
- Résultats: validations et upsert respectés.

4) Comments
- Pré‑conditions (succès): user A authentifié; musique existante; user B authentifié pour test d’ownership.
- Pré‑conditions (erreur): modification/suppression par non‑propriétaire OU absence d’auth.
- Étapes: A crée -> 200; GET par id -> 200; B delete -> 403; A update -> 200; A delete -> 200; GET par musique à jour.
- Résultats: ownership et réponses correctes.

5) Reports (admin)
- Pré‑conditions (succès): reporter authentifié; admin authentifié pour consultation/gestion.
- Pré‑conditions (erreur): accès admin sans rôle admin OU données invalides.
- Étapes: reporter POST -> 200; admin GET all -> 200; admin GET stats -> 200; admin PATCH status -> 200; admin DELETE -> 200.
- Résultats: flux complet OK avec contrôle admin.

### Tests end‑to‑end (5)

1) Inscription → login → profil
- Pré‑conditions (succès): email inexistant; format de données valide.
- Pré‑conditions (erreur): email déjà utilisé OU login avec mauvais identifiants.
- Étapes: POST register -> 201; POST login -> token; GET profile -> 200.
- Résultats: token valide; profil contient `id,email,username,isAdmin`.

2) Favoris → match auto → notifications
- Pré‑conditions (succès): U1 et U2 authentifiés; conditions pour atteindre `score ≥ 10`.
- Pré‑conditions (erreur): score insuffisant OU utilisateurs bloqués entre eux.
- Étapes: U1/U2 ajoutent suffisamment d’éléments; GET `/api/matches` (U1) -> match; GET `/api/notifications` -> `new_match`.
- Résultats: un seul match, deux notifications.

3) Conversation de match → messages
- Pré‑conditions (succès): match U1↔U2 existant; deux utilisateurs non bloqués.
- Pré‑conditions (erreur): utilisateur hors match OU blocage actif.
- Étapes: créer/récupérer conversation; U1 envoie; U2 lit et répond; U1 relit.
- Résultats: ordre, pagination par défaut, accès restreint.

4) Blocage coupe chat
- Pré‑conditions (succès): blocage actif entre U1 et U2.
- Pré‑conditions (erreur): absence de blocage.
- Étapes: U1 bloque U2; U2 GET/POST messages -> 403.
- Résultats: accès refusé tant que blocage.

5) Modération admin
- Pré‑conditions (succès): admin authentifié; user et musique existants non supprimés.
- Pré‑conditions (erreur): action admin sans droits OU entités inexistantes.
- Étapes: admin soft delete user -> login user 403; admin soft delete music; admin restore user/music.
- Résultats: soft delete/restauration opérationnels.
