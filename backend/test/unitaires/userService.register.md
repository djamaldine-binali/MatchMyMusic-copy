### Test manuel – userService.register

- Objectif: Vérifier la création d’un utilisateur avec un email unique et le hachage du mot de passe, ainsi que le refus en cas d’email déjà utilisé ou données invalides.

#### Pré‑conditions (succès)
- Aucun utilisateur n’existe avec l’email choisi (ex: `new.user@test.com`).
- Le service d’accès à la base (Prisma) est fonctionnel.
- Le `JWT_SECRET` n’est pas requis pour ce test unitaire (non lié à la génération de token).

#### Étapes (succès)
1) Appeler la fonction `userService.register` avec un payload valide: `{ email: 'new.user@test.com', username: 'newuser', password: 'Passw0rd!' }`.
2) Vérifier la valeur de retour (objet utilisateur créé).
3) Vérifier en base de données que l’utilisateur a été inséré.
4) Vérifier que le mot de passe stocké n’est pas en clair (hash présent).

#### Résultats attendus (succès)
- La fonction retourne un utilisateur avec un identifiant généré et les champs saisis (hors mot de passe en clair).
- En base, un enregistrement `User` existe avec l’email fourni.
- Le champ `password` est haché (différent du mot de passe en clair, longueur/hash bcrypt attendus).

---

#### Pré‑conditions (erreur – doublon)
- Un utilisateur existe déjà en base avec l’email `existing.user@test.com`.

#### Étapes (erreur – doublon)
1) Appeler `userService.register` avec `{ email: 'existing.user@test.com', username: 'dup', password: 'Passw0rd!' }`.

#### Résultats attendus (erreur – doublon)
- La fonction lève une erreur avec un message de type “User already exists” et un statut applicatif `status=400`.
- Aucun nouvel enregistrement n’est créé pour cet email.

---

#### Pré‑conditions (erreur – données invalides)
- Aucune contrainte préalable particulière (l’email et/ou le mot de passe seront invalides volontairement).

#### Étapes (erreur – données invalides)
1) Appeler `userService.register` avec un payload invalide (ex: email manquant ou mal formé, mot de passe vide).
   - Exemple: `{ email: '', username: 'baduser', password: '' }`.

#### Résultats attendus (erreur – données invalides)
- La fonction refuse la création et remonte une erreur (validation côté contrôleur recommandée; côté service, l’erreur peut provenir de la base si contrainte violée).
- Aucun enregistrement utilisateur n’est créé.

---

#### Evidences à collecter
- Capture/trace des appels (payloads, messages d’erreur).
- Vérification en base de la présence/absence d’enregistrement.
- Extrait (masqué) du champ `password` pour confirmer le hachage (sans révéler le hash complet).

#### Statut et Observations
- Statut: Passé / Échoué / Bloqué
- Observations: écarts constatés, tickets créés, hypothèses et actions de suivi.
