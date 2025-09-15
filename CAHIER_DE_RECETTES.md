# Cahier de Recettes - MatchMyMusic 🎵
*Version Tests - 5 Fonctionnalités Critiques*

## 📖 Description de l'Application

**MatchMyMusic** est une application web de découverte musicale et de matchmaking basée sur les goûts musicaux. Les utilisateurs peuvent découvrir de la musique, créer leurs favoris, noter des morceaux et être mis en relation avec d'autres utilisateurs ayant des goûts similaires.

---

## 🧪 Fonctionnalités Sélectionnées pour Tests

*Ce cahier se concentre sur les 5 fonctionnalités critiques qui feront l'objet de 15 tests :*
- **5 Tests Unitaires** (logique métier des services)
- **5 Tests d'Intégration** (endpoints API)  
- **5 Tests End-to-End** (parcours utilisateur complets)

---

## 🎯 Fonctionnalités à Tester

### 1. 👤 AUTHENTIFICATION UTILISATEUR ⚡
*[Tests : Unitaire + Intégration + E2E]*

#### Inscription
- **Service testé** : `userService.registerUser()`
- **API testée** : `POST /api/user/register`
- **Parcours E2E** : Inscription complète avec validation

**Fonctionnalités** :
- Création de compte avec email unique
- Validation mot de passe sécurisé
- Génération token JWT
- Redirection vers page principale

**Cas de test critiques** :
- ✅ Inscription avec données valides
- ❌ Tentative avec email déjà utilisé
- ❌ Mot de passe faible rejeté

---

### 2. ❤️ GESTION DES FAVORIS ⚡
*[Tests : Unitaire + Intégration + E2E]*

#### Ajouter/Retirer Favoris
- **Service testé** : `musicService.addFavorite()` / `deleteFavorite()`
- **API testée** : `POST/DELETE /api/music/favorites`
- **Parcours E2E** : Ajout favori depuis page tendances

**Fonctionnalités** :
- Ajout musique aux favoris (idempotent)
- Suppression avec vérification propriétaire
- Pagination des favoris (10 par page)
- Persistance des changements

**Cas de test critiques** :
- ✅ Ajout favori réussi
- ❌ Pas de doublons possibles
- ✅ Suppression avec autorisation

---

### 3. ⭐ SYSTÈME DE NOTATION ⚡
*[Tests : Unitaire + Intégration + E2E]*

#### Noter une Musique
- **Service testé** : `ratingService.createOrUpdateRating()`
- **API testée** : `POST /api/ratings`
- **Parcours E2E** : Notation depuis détail musique

**Fonctionnalités** :
- Notation 1-5 étoiles
- Mise à jour note existante
- Calcul moyenne par musique
- Affichage notes utilisateur

**Cas de test critiques** :
- ✅ Création nouvelle note
- ✅ Mise à jour note existante
- ❌ Valeurs invalides rejetées (0, 6, etc.)

---

### 4. 🎯 ALGORITHME DE MATCHMAKING ⚡
*[Tests : Unitaire + Intégration + E2E]*

#### Calcul de Compatibilité
- **Service testé** : `matchService.findMatchesForUser()`
- **API testée** : `GET /api/match`
- **Parcours E2E** : Découverte matches après ajout favoris

**Fonctionnalités** :
- Calcul score basé sur favoris communs
- Seuil minimum 10 musiques communes
- Score en pourcentage (0-100%)
- Exclusion utilisateurs bloqués

**Cas de test critiques** :
- ✅ Match trouvé avec score correct
- ❌ Pas de match si <10 communs
- ✅ Calcul précis du pourcentage

---

### 5. 💬 SYSTÈME DE CHAT ⚡
*[Tests : Unitaire + Intégration + E2E]*

#### Messages entre Matches
- **Service testé** : `chatService.sendMessage()`
- **API testée** : `POST /api/chat/:conversationId/messages`
- **Parcours E2E** : Conversation complète entre 2 matches

**Fonctionnalités** :
- Création conversation automatique
- Envoi messages entre matches uniquement
- Historique complet conservé
- Horodatage précis

**Cas de test critiques** :
- ✅ Message envoyé entre matches
- ❌ Impossible entre non-matches
- ✅ Conversation créée au premier message

## 📋 Plan de Tests - 15 Cas

### 🧪 Tests Unitaires (5)
| # | Service | Fonction | Objectif |
|---|---------|----------|----------|
| 1 | `userService` | `registerUser()` | Création utilisateur avec validation |
| 2 | `musicService` | `addFavorite()` | Ajout favori sans doublon |
| 3 | `ratingService` | `createOrUpdateRating()` | Notation avec validation 1-5 |
| 4 | `matchService` | `findMatchesForUser()` | Calcul compatibilité précis |
| 5 | `chatService` | `sendMessage()` | Envoi message entre matches |

### 🔗 Tests d'Intégration (5)
| # | Endpoint | Méthode | Objectif |
|---|----------|---------|----------|
| 1 | `/api/user/register` | POST | Inscription complète avec JWT |
| 2 | `/api/music/favorites` | POST | Ajout favori authentifié |
| 3 | `/api/ratings` | POST | Notation avec mise à jour BDD |
| 4 | `/api/match` | GET | Récupération matches utilisateur |
| 5 | `/api/chat/:id/messages` | POST | Envoi message avec autorisation |

### 🎭 Tests End-to-End (5)
| # | Parcours | Pages | Objectif |
|---|----------|-------|----------|
| 1 | Inscription utilisateur | `/register` → `/main` | Parcours complet nouveau user |
| 2 | Gestion favoris | `/main` → `/favorites` | Ajout/suppression favoris |
| 3 | Notation musique | `/main` → `/music/:id` | Notation avec persistance |
| 4 | Découverte matches | `/favorites` → `/matches` | Algorithme matchmaking |
| 5 | Conversation chat | `/matches` → Chat | Échange messages complet |

---

## 🎯 Critères de Réussite

### Tests Unitaires
- ✅ **Couverture** : 100% des fonctions testées
- ✅ **Isolation** : Mocks pour dépendances externes
- ✅ **Edge cases** : Validation des cas limites

### Tests d'Intégration  
- ✅ **Authentification** : JWT valide requis
- ✅ **Base de données** : Persistance vérifiée
- ✅ **Codes de retour** : 200, 400, 401, 403 appropriés

### Tests E2E
- ✅ **Parcours complets** : Du clic à la sauvegarde
- ✅ **Interface utilisateur** : Feedback visuel correct
- ✅ **Navigation** : Redirections fonctionnelles

---

## 🗃️ Données de Test

### Utilisateurs Test
```javascript
const testUsers = [
  {
    email: 'user1@test.com',
    username: 'testuser1',
    password: 'Test123!',
    id: 1
  },
  {
    email: 'user2@test.com', 
    username: 'testuser2',
    password: 'Test123!',
    id: 2
  }
]
```

### Musiques Test
```javascript
const testMusic = [
  {
    mbid: 'song-1',
    title: 'Test Song 1',
    album: { title: 'Test Album 1', coverUrl: 'cover1.jpg' }
  },
  {
    mbid: 'song-2', 
    title: 'Test Song 2',
    album: { title: 'Test Album 2', coverUrl: 'cover2.jpg' }
  }
]
```

### Scénarios de Match
```javascript
// User1 favoris: [song-1, song-2, song-3]
// User2 favoris: [song-2, song-3, song-4]  
// Score attendu: 66% (2 communs sur 3)
```

---

*Ce cahier de recettes se concentre sur les 5 fonctionnalités critiques de MatchMyMusic qui feront l'objet de 15 tests complets (unitaires, intégration, E2E).*
