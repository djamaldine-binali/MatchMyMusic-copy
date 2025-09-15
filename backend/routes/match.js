const express = require('express');
const router = express.Router();
const { getMatches, getMatchDetails } = require('../controllers/matchController.js');
const { authMiddleware } = require('../middleware/auth.js');

// Récupérer tous les matches de l'utilisateur
router.get('/', authMiddleware, getMatches);

// Récupérer les détails d'un match spécifique
router.get('/:matchedUserId', authMiddleware, getMatchDetails);

module.exports = router;
