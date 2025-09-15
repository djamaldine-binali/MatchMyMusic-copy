MatchMyMusic – Récapitulatif du Projet
1. Mise en place de l’environnement
Création d’un monorepo avec un dossier backend (Node.js/Express/Prisma) et un dossier frontend (React/Vite).
Configuration des dépendances, scripts de démarrage, ESLint, Vite proxy, etc.
Gestion des variables d’environnement et du .gitignore.
2. Base de données & Modélisation
Utilisation de Prisma avec une base SQLite.
Modèles principaux :
User : utilisateurs (email, username, mot de passe hashé, etc.)
Album : albums musicaux (titre, cover, mbid)
Music : morceaux (titre, mbid, albumId)
Favorite (anciennement UserMusic) : table de favoris (relation many-to-many User/Music)
Rating : notes données par les utilisateurs aux musiques (userId, musicId, value, timestamps)
Match : compatibilité entre utilisateurs selon leurs goûts musicaux
3. Backend – API REST
Authentification JWT (inscription, connexion, middleware de protection).
Favoris :
POST /api/music/favorites : ajouter un morceau aux favoris (idempotent)
GET /api/music/favorites : lister les favoris paginés
DELETE /api/music/favorites/:id : supprimer un favori (avec vérification d’appartenance)
Notes :
POST /api/ratings : noter un morceau (ou mettre à jour la note)
GET /api/ratings/recent : récupérer les dernières notes de l’utilisateur
GET /api/ratings : lister toutes les notes paginées
Découverte musicale :
Intégration de l’API Deezer pour albums/songs tendances et nouveautés
Matchmaking :
Calcul de compatibilité musicale entre utilisateurs via /api/match
Séparation claire :
Architecture controllers/services pour la logique métier et l’accès aux données
4. Frontend – React
Pages principales :
Accueil (Home)
Connexion / Inscription
Page principale (MainPage) avec albums/songs tendances et nouveautés
Profil utilisateur (Profile)
Page “Toutes mes notes” (RatedMusics)
Composants :
Header avec menu burger, navigation, gestion du profil
Cartes de musique/album avec actions (ajouter aux favoris, noter, etc.)
Modals de confirmation custom (ex : suppression de favori)
Fonctionnalités dynamiques :
Ajout/suppression de favoris (avec feedback visuel)
Notation réelle des musiques (persistée en base)
Affichage des dernières notes et de tous les morceaux notés (pagination, “voir plus”)
Affichage paginé des favoris (“voir plus”)
UI/UX :
Sections compactes, titres sobres, modals stylés, feedback utilisateur (toasts, loaders)
Responsive et cohérence visuelle (couleurs, arrondis, etc.)
5. Bonnes pratiques & Propreté
Séparation claire des responsabilités (routes, controllers, services)
Utilisation d’un client Prisma partagé
Gestion des erreurs et des statuts HTTP
Code commenté, structuré, et prêt pour l’extension (ex : ajout de tags, de playlists, etc.)
6. À faire / Suggestions
Ajouter la possibilité de modifier le profil (email, username, mot de passe)
Ajouter la gestion des playlists
Ajouter des tests unitaires et d’intégration
Améliorer la documentation utilisateur (README, guides d’utilisation)
7. Compétences démontrées
Mise en place d’un environnement de travail complet (front + back)
Modélisation et gestion d’une base de données relationnelle
Développement d’API REST sécurisées
Intégration d’API tierces (Deezer)
Réalisation d’interfaces utilisateur dynamiques et interactives
Gestion de l’état, des appels API, et de la pagination côté front
Séparation des couches métier, accès aux données, et présentation
N’hésite pas à copier/coller ce markdown dans ton dossier professionnel ou à le compléter selon tes besoins !
Si tu veux un format plus détaillé ou un focus sur une compétence précise, demande-moi !