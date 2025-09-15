const chatService = require('../services/chatService.js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Récupérer toutes les conversations de l'utilisateur connecté
const getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const conversations = await chatService.getUserConversations(userId);
    
    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error getting user conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des conversations'
    });
  }
};

// Récupérer les messages d'une conversation spécifique
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '50');

    // Vérifier que l'utilisateur peut accéder à cette conversation
    const canAccess = await chatService.canAccessConversation(userId, parseInt(conversationId));
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à cette conversation'
      });
    }

    const result = await chatService.getConversationMessages(parseInt(conversationId), page, pageSize);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des messages'
    });
  }
};

// Envoyer un message dans une conversation
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'content est requis'
      });
    }

    // Vérifier que l'utilisateur peut accéder à cette conversation
    const canAccess = await chatService.canAccessConversation(userId, parseInt(conversationId));
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à cette conversation'
      });
    }

    const message = await chatService.sendMessage(parseInt(conversationId), userId, content);
    
    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi du message'
    });
  }
};

// Créer ou récupérer une conversation pour un match
const getOrCreateConversation = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.userId;

    // Vérifier que l'utilisateur fait partie du match
    const match = await prisma.match.findUnique({
      where: { id: parseInt(matchId) }
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match non trouvé'
      });
    }

    if (match.userAId !== userId && match.userBId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à ce match'
      });
    }

    const conversation = await chatService.getOrCreateConversation(parseInt(matchId));
    
    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération/création de la conversation'
    });
  }
};

// Endpoint de test pour vérifier que les routes fonctionnent
const testChat = async (req, res) => {
  res.json({
    success: true,
    message: 'Routes de chat fonctionnelles !',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  getOrCreateConversation,
  testChat
}; 