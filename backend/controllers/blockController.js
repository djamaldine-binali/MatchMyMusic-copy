const blockService = require('../services/blockService.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Bloquer un utilisateur
const blockUser = async (req, res) => {
  try {
    const { blockedId, reason } = req.body;
    const blockerId = req.userId;

    if (!blockedId) {
      return res.status(400).json({
        success: false,
        error: 'ID de l\'utilisateur à bloquer requis'
      });
    }

    const result = await blockService.blockUser(blockerId, parseInt(blockedId), reason);
    
    res.json({
      success: true,
      message: `Utilisateur ${result.blocked.username} bloqué avec succès`,
      block: result
    });
  } catch (error) {
    console.error('Error in blockUser controller:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Débloquer un utilisateur
const unblockUser = async (req, res) => {
  try {
    const { blockedId } = req.params;
    const blockerId = req.userId;

    const result = await blockService.unblockUser(blockerId, parseInt(blockedId));
    
    res.json({
      success: true,
      message: `Utilisateur ${result.blocked.username} débloqué avec succès`,
      unblock: result
    });
  } catch (error) {
    console.error('Error in unblockUser controller:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Débloquer un utilisateur (admin seulement)
const adminUnblockUser = async (req, res) => {
  try {
    const { blockedId } = req.params;
    
    // Vérifier que l'utilisateur qui fait la requête est admin
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé. Admin requis.'
      });
    }

    // Trouver et supprimer le blocage
    const block = await prisma.userBlock.findFirst({
      where: { blockedId: parseInt(blockedId) },
      include: {
        blocked: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    if (!block) {
      return res.status(404).json({
        success: false,
        error: 'Aucun blocage trouvé pour cet utilisateur'
      });
    }

    // Supprimer le blocage
    await prisma.userBlock.delete({
      where: { id: block.id }
    });

    res.json({
      success: true,
      message: `Utilisateur ${block.blocked.username} débloqué par l'admin`,
      unblock: block
    });
  } catch (error) {
    console.error('Error in adminUnblockUser controller:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du déblocage par l\'admin'
    });
  }
};

// Obtenir la liste des utilisateurs bloqués
const getBlockedUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const blockedUsers = await blockService.getBlockedUsers(userId);
    
    res.json({
      success: true,
      blockedUsers
    });
  } catch (error) {
    console.error('Error in getBlockedUsers controller:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs bloqués'
    });
  }
};

// Vérifier si un utilisateur est bloqué
const checkIfBlocked = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.userId;

    const isBlocked = await blockService.isUserBlocked(userId, parseInt(otherUserId));
    
    res.json({
      success: true,
      isBlocked
    });
  } catch (error) {
    console.error('Error in checkIfBlocked controller:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du statut de blocage'
    });
  }
};

module.exports = {
  blockUser,
  unblockUser,
  adminUnblockUser,
  getBlockedUsers,
  checkIfBlocked
}; 