# Test d'intégration : Parcours utilisateur complet

## Objectif
Valider le parcours complet d'inscription, d'authentification puis d'accès au profil protégé.

## Pré-conditions (succès)
- Aucun utilisateur n'existe avec l'email fourni
- Les données d'inscription sont valides
- Le mot de passe est correct pour la connexion
- Le token JWT est valide pour l'accès au profil

## Pré-conditions (erreur)
- Un utilisateur existe déjà avec l'email fourni
- Les données d'inscription sont invalides
- Le mot de passe est incorrect pour la connexion
- Le token JWT est invalide ou manquant

## Étapes / Résultats attendus

### Succès : Parcours complet réussi
1. **Inscription** : Créer un nouvel utilisateur avec des données valides
2. **Connexion** : Se connecter avec les identifiants créés
3. **Profil** : Accéder au profil protégé avec le token obtenu
4. **Vérifications** : 
   - Utilisateur créé en base avec mot de passe haché
   - Token JWT valide retourné
   - Accès au profil autorisé avec données utilisateur

### Erreur : Interruption du parcours
1. **Inscription échouée** : Tentative avec email existant
2. **Connexion échouée** : Tentative avec mauvais mot de passe
3. **Profil inaccessible** : Tentative sans token valide
4. **Vérifications** :
   - Messages d'erreur appropriés à chaque étape
   - Parcours interrompu dès la première erreur

## Résultats observés
[À remplir lors de l'exécution]

## Évidences
[À remplir lors de l'exécution]

## Statut
[À remplir lors de l'exécution]

## Observations
[À remplir lors de l'exécution]
