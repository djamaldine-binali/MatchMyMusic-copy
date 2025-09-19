# Test d'intégration : CRUD des commentaires

## Objectif
Permettre de créer, lire, modifier et supprimer des commentaires avec respect de la propriété et de l'authentification.

## Pré-conditions (succès)
- Utilisateur authentifié avec token JWT valide
- Musique existante pour commenter
- Contenu de commentaire valide
- Utilisateur propriétaire du commentaire pour modification/suppression

## Pré-conditions (erreur)
- Utilisateur non authentifié
- Token JWT invalide ou manquant
- Tentative de modification/suppression par un non-propriétaire
- Commentaire inexistant
- Données de commentaire invalides

## Étapes / Résultats attendus

### Succès : Gestion complète des commentaires
1. **Création** : Créer un commentaire sur une musique
2. **Lecture** : Récupérer un commentaire par son ID
3. **Modification** : Modifier le contenu d'un commentaire (propriétaire)
4. **Suppression** : Supprimer un commentaire (propriétaire)
5. **Vérifications** :
   - Commentaire créé en base de données
   - Lecture retourne les bonnes données
   - Modification mise à jour en base
   - Suppression retire le commentaire

### Erreur : Actions non autorisées
1. **Sans authentification** : Tentative de création sans token
2. **Non-propriétaire** : Tentative de modification par un autre utilisateur
3. **Non-propriétaire** : Tentative de suppression par un autre utilisateur
4. **Commentaire inexistant** : Tentative d'accès à un ID invalide
5. **Vérifications** :
   - Messages d'erreur 401 pour actions non autorisées
   - Messages d'erreur 500 pour violations de propriété
   - Messages d'erreur 404 pour commentaires inexistants
   - Aucune modification non autorisée

## Résultats observés
[À remplir lors de l'exécution]

## Évidences
[À remplir lors de l'exécution]

## Statut
[À remplir lors de l'exécution]

## Observations
[À remplir lors de l'exécution]
