### Cahier de Recettes (Tableau synthétique)

| Fonctionnalité à tester | Objet / Finalité | Résultat attendu (succès / échec) |

|---|---|---|
| userService.register | Créer un nouvel utilisateur avec un email unique, un nom d’utilisateur et un mot de passe stocké de manière sécurisée (haché). | Succès: l’utilisateur est créé et stocké en base avec un mot de passe haché. Échec: si l’email existe déjà ou les données sont invalides, la création est refusée avec un message d’erreur approprié. |

| userService.login | Authentifier un utilisateur existant et délivrer un jeton d’accès pour les routes protégées. | Succès: un jeton d’authentification est renvoyé permettant l’accès aux ressources protégées. Échec: si l’email est inconnu, le mot de passe incorrect ou le compte supprimé, l’accès est refusé avec un message d’erreur. |

| musicService.addFavoriteForUser | Enregistrer une musique dans les favoris de l’utilisateur, en créant au besoin les informations d’album/musique associées. | Succès: la musique est présente dans les favoris de l’utilisateur, et les entités musique/album sont correctement enregistrées. Échec: l’ajout est refusé si les données sont incohérentes ou non autorisées, avec retour d’une erreur. |

| ratingService.setRatingForUser | Créer ou mettre à jour la note d’un utilisateur pour une musique, en garantissant des valeurs valides. | Succès: la note est enregistrée ou mise à jour et visible dans l’historique de l’utilisateur. Échec: la note est rejetée si la valeur est hors bornes ou si la ressource est invalide. |

| blockService.blockUser | Empêcher l’interaction entre deux utilisateurs en établissant un blocage selon des règles d’éligibilité (ex: pas d’auto‑blocage, pas de blocage d’un admin par un non‑admin). | Succès: le blocage est enregistré et les interactions (chat, etc.) sont empêchées. Échec: le blocage est refusé si la règle n’est pas respectée (auto‑blocage, blocage d’admin, utilisateur supprimé). |

| authMiddleware / adminMiddleware | Protéger l’accès aux routes en vérifiant la présence et la validité du jeton et, le cas échéant, le rôle administrateur. | Succès: les routes utilisateur renvoient les données quand le jeton est valide; les routes admin sont accessibles uniquement aux administrateurs. Échec: accès refusé pour jeton manquant/invalide ou pour rôle insuffisant. |

| musicController.addFavorite / getFavorites / deleteFavorite | Permettre d’ajouter, lister (paginé) et retirer des favoris d’un utilisateur authentifié. | Succès: l’ajout crée un favori, la liste retourne le bon nombre d’éléments/total, la suppression retire le favori. Échec: toute action non autorisée ou incohérente est refusée avec une erreur. |

| ratingController.setRating / getRecent | Offrir une interface HTTP pour créer/mettre à jour des notes et consulter les plus récentes. | Succès: les notes valides sont enregistrées et la liste récente reflète la dernière mise à jour. Échec: les notes invalides sont rejetées avec un message d’erreur. |

| commentController.createComment / updateComment / getCommentById / deleteComment | Permettre de créer, lire, modifier et supprimer des commentaires avec respect de la propriété et de l’authentification. | Succès: l’auteur peut créer, modifier, supprimer; les autres peuvent consulter. Échec: tentative de modification/suppression par un non‑propriétaire ou requêtes invalides sont refusées. |

| reportController.reportUser / getAllReportsGrouped / updateReportStatus / deleteReport | Permettre le signalement d’utilisateurs et la gestion admin (regroupement, statistiques, changement de statut, suppression). | Succès: un signalement est créé et visible dans les vues admin; les stats et mises à jour de statut sont effectives. Échec: actions interdites sans droits admin ou données invalides. |

| userController.registerUser → loginUser → getProfile | Valider le parcours complet d’inscription, d’authentification puis d’accès au profil protégé. | Succès: l’utilisateur est inscrit, obtient un jeton, et accède à son profil. Échec: une étape invalide (inscription/connexion/profil) interrompt le parcours avec un retour d’erreur cohérent. |

| musicService.checkForNewMatches + matchService.findMatchesForUser + notificationService.createNewMatchNotification | Vérifier que des goûts communs suffisants entre deux utilisateurs déclenchent un match et des notifications associées. | Succès: un match est créé (score requis atteint) et chacun reçoit une notification. Échec: sans seuil atteint ou en cas d’incohérence, pas de match ni de notification. |

| chatService.getOrCreateConversation / sendMessage / getConversationMessages | Assurer qu’un match permet d’ouvrir une conversation et d’échanger des messages entre les deux utilisateurs. | Succès: la conversation existe/est créée et les messages sont visibles dans l’ordre, avec pagination. Échec: accès interdit si l’utilisateur n’appartient pas au match ou si les contraintes ne sont pas respectées. |

| blockService.blockUser → chatService.canAccessConversation | Garantir qu’un blocage actif empêche la lecture/l’envoi de messages entre les utilisateurs concernés. | Succès: l’accès à la conversation est refusé pour l’utilisateur bloqué, empêchant toute interaction. Échec: si le blocage est absent ou invalide, l’accès reste autorisé. |

| adminService.deleteUser / restoreUser / deleteMusic / restoreMusic | Valider la capacité d’un admin à désactiver/réactiver des comptes et à masquer/restaurer des contenus. | Succès: le soft delete empêche l’accès (ex: connexion) et la restauration rétablit l’accès/visibilité. Échec: opérations refusées sans droits admin ou sur entités invalides. |
