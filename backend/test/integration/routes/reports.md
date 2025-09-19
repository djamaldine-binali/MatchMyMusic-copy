# Test d'intégration : Gestion des signalements

## Objectif
Permettre le signalement d'utilisateurs et la gestion admin (regroupement, statistiques, changement de statut, suppression).

## Pré-conditions (succès)
- Utilisateur authentifié pour créer un signalement
- Utilisateur admin pour gérer les signalements
- Données de signalement valides (utilisateur signalé, raison)
- Signalement existant pour les opérations de gestion

## Pré-conditions (erreur)
- Utilisateur non authentifié
- Utilisateur non-admin tentant d'accéder aux fonctions admin
- Données de signalement invalides ou manquantes
- Signalement inexistant pour les opérations de gestion

## Étapes / Résultats attendus

### Succès : Gestion complète des signalements
1. **Création** : Créer un signalement d'utilisateur
2. **Regroupement** : Récupérer les signalements groupés (admin)
3. **Statistiques** : Consulter les statistiques des signalements
4. **Mise à jour** : Changer le statut d'un signalement (admin)
5. **Suppression** : Supprimer un signalement (admin)
6. **Vérifications** :
   - Signalement créé en base de données
   - Regroupement fonctionne correctement
   - Statistiques reflètent l'état actuel
   - Changement de statut effectif
   - Suppression retire le signalement

### Erreur : Actions interdites
1. **Sans authentification** : Tentative de création sans token
2. **Non-admin** : Tentative d'accès aux fonctions admin
3. **Données invalides** : Création avec données manquantes
4. **Signalement inexistant** : Opérations sur un ID invalide
5. **Vérifications** :
   - Messages d'erreur 401 pour actions non autorisées
   - Messages d'erreur 403 pour accès admin refusé
   - Messages d'erreur 400 pour données invalides
   - Messages d'erreur 404 pour signalements inexistants

## Résultats observés
[À remplir lors de l'exécution]

## Évidences
[À remplir lors de l'exécution]

## Statut
[À remplir lors de l'exécution]

## Observations
[À remplir lors de l'exécution]
