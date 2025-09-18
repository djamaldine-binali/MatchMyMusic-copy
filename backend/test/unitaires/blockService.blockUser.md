### Test manuel – blockService.blockUser

- Objectif: Vérifier qu’un utilisateur peut bloquer un autre utilisateur non‑admin et non supprimé, et que les cas interdits (auto‑blocage, blocage d’un admin, blocage d’un utilisateur supprimé) sont refusés.

Contexte API
- Route: protégée par auth, via contrôleur `blockController.blockUser`
- Endpoint: `POST /api/blocks` avec `Authorization: Bearer <TOKEN>`
- Payload: `{ "blockedId": <number>, "reason": "string?" }`

Pré‑requis généraux
- Backend démarré en mode test.
- Comptes existants: `userA` (non‑admin), `userB` (non‑admin), `admin` (isAdmin=true), `deletedUser` (isDeleted=true).
- Tokens: `TOKEN_USER_A` (userA), `TOKEN_ADMIN` (admin).

---

#### Pré‑conditions (succès)
- userA et userB existent, ne sont pas supprimés.
- userB n’est pas déjà bloqué par userA.
- userB n’est pas admin.

#### Étapes (succès)
1) Bloquer userB en tant que userA:
```bash
curl -X POST http://localhost:3001/api/blocks \
  -H "Authorization: Bearer TOKEN_USER_A" \
  -H "Content-Type: application/json" \
  -d '{"blockedId": BLOCKED_ID, "reason": "spam"}'
```
2) Vérifier la réponse JSON (success=true, block.id, block.blocked.username).
3) Vérifier en base (ou via endpoint GET `/api/blocks`): userB apparaît dans la liste des bloqués de userA.

#### Résultats attendus (succès)
- Code 200, `success: true`, un objet `block` retourné (avec `id`, `blockedUser`/`blocked` et `reason`).
- En base, un enregistrement `UserBlocks` existe entre userA (blocker) et userB (blocked).

#### Résultats observés (succès)
- À compléter lors de l’exécution (copier/coller la réponse et timestamp).

---

#### Pré‑conditions (erreur – auto‑blocage)
- userA dispose d’un token valide `TOKEN_USER_A`.

#### Étapes (erreur – auto‑blocage)
1) Tenter de bloquer soi‑même:
```bash
curl -X POST http://localhost:3001/api/blocks \
  -H "Authorization: Bearer TOKEN_USER_A" \
  -H "Content-Type: application/json" \
  -d '{"blockedId": USER_A_ID, "reason": "n/a"}'
```

#### Résultats attendus (erreur – auto‑blocage)
- Code 400 (ou 403 selon implémentation), `success: false`, message: "Vous ne pouvez pas vous bloquer vous‑même".
- Aucun enregistrement créé.

#### Résultats observés (erreur – auto‑blocage)
- À compléter.

---

#### Pré‑conditions (erreur – blocage d’un admin)
- userA est non‑admin; `admin` existe avec `isAdmin=true`.

#### Étapes (erreur – blocage d’un admin)
1) Tenter de bloquer un admin:
```bash
curl -X POST http://localhost:3001/api/blocks \
  -H "Authorization: Bearer TOKEN_USER_A" \
  -H "Content-Type: application/json" \
  -d '{"blockedId": ADMIN_ID, "reason": "n/a"}'
```

#### Résultats attendus (erreur – blocage d’un admin)
- Code 400 (ou 403), `success: false`, message: "Impossible de bloquer un administrateur".
- Aucun enregistrement créé.

#### Résultats observés (erreur – blocage d’un admin)
- À compléter.

---

#### Pré‑conditions (erreur – utilisateur supprimé)
- `deletedUser` existe avec `isDeleted=true`.

#### Étapes (erreur – utilisateur supprimé)
1) Tenter de bloquer `deletedUser`:
```bash
curl -X POST http://localhost:3001/api/blocks \
  -H "Authorization: Bearer TOKEN_USER_A" \
  -H "Content-Type: application/json" \
  -d '{"blockedId": DELETED_USER_ID, "reason": "n/a"}'
```

#### Résultats attendus (erreur – utilisateur supprimé)
- Code 400 (ou 404/403 selon implémentation), `success: false`, message: "Impossible de bloquer un utilisateur supprimé".
- Aucun enregistrement créé.

#### Résultats observés (erreur – utilisateur supprimé)
- À compléter.

---

#### Evidences à collecter
- Réponses JSON des appels (succès/erreurs) avec timestamps.
- Capture de `/api/blocks` (liste des bloqués) après succès.
- Vérification DB (table `UserBlocks`) si possible.

#### Statut et Observations
- Statut: Passé / Échoué / Bloqué
- Observations: écarts, anomalies, tickets.
