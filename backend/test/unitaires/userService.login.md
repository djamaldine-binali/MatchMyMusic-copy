### Test unitaire – userService.login (spécification)

- Objectif: Vérifier l’authentification d’un utilisateur via la fonction `userService.login({ email, password })`.
- Principe: tests unitaires avec mocks des dépendances (Prisma, bcrypt, jsonwebtoken) et pattern AAA (Arrange / Act / Assert).
- Dépendances à mocker:
  - Prisma: `prisma.user.findUnique`
  - bcrypt: `bcrypt.compare`
  - jsonwebtoken (optionnel): `jwt.sign` (peut juste vérifier que `token` est une string non vide)

---

#### Cas 1 — Succès (email connu, compte actif, mot de passe correct)
- Arrange:
  - `findUnique → { id, email, password: 'hashed', isDeleted: false }`
  - `compare → true`
  - `sign → 'fake_token'` (optionnel)
- Act:
  - `result = await userService.login({ email, password })`
- Assert:
  - `findUnique` appelé avec `{ where: { email } }`
  - `compare` appelé avec `(password, 'hashed')`
  - `result` contient `{ token }` (string non vide ou 'fake_token')

#### Cas 2 — Email inconnu
- Arrange:
  - `findUnique → null`
- Act/Assert:
  - `await expect(userService.login({ email, password }))` rejette avec `{ status: 404 }`
  - `compare` non appelé

#### Cas 3 — Compte supprimé
- Arrange:
  - `findUnique → { id, email, password: 'hashed', isDeleted: true }`
- Act/Assert:
  - Rejet avec `{ status: 403 }`
  - `compare` non appelé

#### Cas 4 — Mot de passe incorrect
- Arrange:
  - `findUnique → { id, email, password: 'hashed', isDeleted: false }`
  - `compare → false`
- Act/Assert:
  - Rejet avec `{ status: 401 }`

---

#### Evidences attendues (logs de test)
- Appels des mocks (toHaveBeenCalledWith) et statuts d’erreur vérifiés.
- Aucune requête réseau/DB réelle (tout est mocké).

#### Statut/Observations
- Passé / Échoué / Bloqué
- Notes: messages d’erreur, cohérence des statuts, couverture des chemins.
