# Test d'intégration : CRUD des notes

## Objectif
Offrir une interface HTTP pour créer/mettre à jour des notes et consulter les plus récentes.

## Pré-conditions (succès)
- Utilisateur authentifié avec token JWT valide
- Données de note valides (mbid, title, value entre 1-5)
- Musique et album correctement identifiés

## Pré-conditions (erreur)
- Utilisateur non authentifié
- Token JWT invalide ou manquant
- Valeur de note hors de la plage 1-5
- Données de musique manquantes ou invalides

## Étapes / Résultats attendus

### Succès : Gestion complète des notes
1. **Création** : Créer une nouvelle note pour une musique
2. **Mise à jour** : Modifier la valeur d'une note existante
3. **Consultation** : Récupérer les notes récentes
4. **Vérifications** :
   - Note créée/mise à jour en base de données
   - Album et musique créés si nécessaire
   - Liste récente reflète les dernières modifications
   - Valeurs de note dans la plage valide

### Erreur : Notes invalides
1. **Sans authentification** : Tentative de création/consultation sans token
2. **Valeur invalide** : Note avec valeur hors de 1-5
3. **Données manquantes** : Création avec données incomplètes
4. **Vérifications** :
   - Messages d'erreur 401 pour actions non autorisées
   - Messages d'erreur 400 pour valeurs invalides
   - Aucune modification en base de données

## Résultats observés
[À remplir lors de l'exécution]

## Évidences
[À remplir lors de l'exécution]

## Statut
[À remplir lors de l'exécution]

## Observations
[À remplir lors de l'exécution]
