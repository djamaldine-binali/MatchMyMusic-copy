const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.js');
const {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  getOrCreateConversation,
  testChat
} = require('../controllers/chatController.js');

// Toutes les routes de chat nécessitent une authentification
router.use(authMiddleware);

// Route de test (sans authentification pour tester)
router.get('/test', testChat);

// Récupérer toutes les conversations de l'utilisateur connecté
router.get('/conversations', getUserConversations);

// Créer ou récupérer une conversation pour un match
router.get('/match/:matchId/conversation', getOrCreateConversation);

// Récupérer les messages d'une conversation
router.get('/conversations/:conversationId/messages', getConversationMessages);

// Envoyer un message dans une conversation
router.post('/conversations/:conversationId/messages', sendMessage);

module.exports = router; 