# Test d'intégration : CRUD des favoris musicaux

## Objectif
Permettre d'ajouter, lister (paginé) et retirer des favoris d'un utilisateur authentifié.

## Pré-conditions (succès)
- Utilisateur authentifié avec token JWT valide
- Données de musique valides (musicId, title, artist)
- Utilisateur autorisé à gérer ses favoris

## Pré-conditions (erreur)
- Utilisateur non authentifié
- Token JWT invalide ou manquant
- Données de musique manquantes ou invalides
- Tentative d'accès aux favoris d'un autre utilisateur

## Étapes / Résultats attendus

### Succès : CRUD complet des favoris
1. **Ajout** : Ajouter une musique aux favoris
2. **Liste** : Récupérer la liste paginée des favoris
3. **Suppression** : Retirer un favori de la liste
4. **Vérifications** :
   - Favori créé en base de données
   - Liste retourne le bon nombre d'éléments/total
   - Suppression retire effectivement le favori
   - Pagination fonctionne correctement

### Erreur : Actions non autorisées
1. **Ajout sans auth** : Tentative d'ajout sans authentification
2. **Liste sans auth** : Tentative de consultation sans authentification
3. **Suppression sans auth** : Tentative de suppression sans authentification
4. **Données invalides** : Ajout avec données manquantes
5. **Vérifications** :
   - Messages d'erreur 401 pour actions non autorisées
   - Messages d'erreur 400 pour données invalides
   - Aucune modification en base de données

## Résultats observés
[À remplir lors de l'exécution]

## Évidences
[À remplir lors de l'exécution]

## Statut
[À remplir lors de l'exécution]

## Observations
[À remplir lors de l'exécution]
