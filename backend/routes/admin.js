const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.js');
const { adminMiddleware } = require('../middleware/admin.js');
const {
  getSiteStats,
  getAllUsers,
  deleteUser,
  restoreUser,
  getAllComments,
  deleteComment,
  getAllMusic,
  deleteMusic,
  setUserAdminRole,
  restoreMusic
} = require('../controllers/adminController.js');

// Toutes les routes admin sont protégées par authMiddleware PUIS adminMiddleware
router.use(authMiddleware); // D'abord vérifier l'authentification
router.use(adminMiddleware); // Ensuite vérifier les droits admin

// Statistiques du site
router.get('/stats', getSiteStats);

// Gestion des utilisateurs
router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);
router.patch('/users/:userId/restore', restoreUser);
router.patch('/users/:userId/role', setUserAdminRole);

// Gestion des commentaires
router.get('/comments', getAllComments);
router.delete('/comments/:commentId', deleteComment);

// Gestion des musiques
router.get('/music', getAllMusic);
router.delete('/music/:musicId', deleteMusic);
router.patch('/music/:musicId/restore', restoreMusic);

module.exports = router; 