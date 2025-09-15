const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.js');
const {
  blockUser,
  unblockUser,
  adminUnblockUser,
  getBlockedUsers,
  checkIfBlocked
} = require('../controllers/blockController.js');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Bloquer un utilisateur
router.post('/', blockUser);

// Débloquer un utilisateur
router.delete('/:blockedId', unblockUser);

// Débloquer un utilisateur (admin seulement)
router.delete('/admin/:blockedId', adminUnblockUser);

// Obtenir la liste des utilisateurs bloqués
router.get('/', getBlockedUsers);

// Vérifier si un utilisateur est bloqué
router.get('/check/:otherUserId', checkIfBlocked);

module.exports = router; 