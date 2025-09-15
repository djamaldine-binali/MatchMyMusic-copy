const adminService = require('../services/adminService.js');

// Récupérer les statistiques du site
const getSiteStats = async (req, res) => {
  try {
    const stats = await adminService.getSiteStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting site stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// Récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '20');
    
    const result = await adminService.getAllUsers(page, pageSize);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

// Supprimer un utilisateur
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID utilisateur requis'
      });
    }
    
    await adminService.deleteUser(parseInt(userId));
    
    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'utilisateur'
    });
  }
};

// Récupérer tous les commentaires
const getAllComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '20');
    
    const result = await adminService.getAllComments(page, pageSize);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error getting all comments:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des commentaires'
    });
  }
};

// Supprimer un commentaire
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    if (!commentId) {
      return res.status(400).json({
        success: false,
        error: 'ID commentaire requis'
      });
    }
    
    await adminService.deleteComment(parseInt(commentId));
    
    res.json({
      success: true,
      message: 'Commentaire supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du commentaire'
    });
  }
};

// Récupérer toutes les musiques
const getAllMusic = async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '20');
    const search = req.query.search || '';
    const result = await adminService.getAllMusicAdmin(page, pageSize, search);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error getting all music:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Supprimer une musique
const deleteMusic = async (req, res) => {
  try {
    const { musicId } = req.params;
    
    if (!musicId) {
      return res.status(400).json({
        success: false,
        error: 'ID musique requis'
      });
    }
    
    await adminService.deleteMusic(parseInt(musicId));
    
    res.json({
      success: true,
      message: 'Musique supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting music:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de la musique'
    });
  }
};

// Changer le rôle admin d'un utilisateur (promouvoir/dépromouvoir)
const setUserAdminRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ success: false, error: 'Paramètre isAdmin invalide' });
    }

    const updated = await adminService.setUserAdminRole(parseInt(userId), isAdmin);
    res.json({ success: true, user: updated });
  } catch (error) {
    console.error('Error updating admin role:', error);
    res.status(error.status || 500).json({ success: false, error: error.message || 'Erreur lors de la mise à jour du rôle' });
  }
};

const restoreMusic = async (req, res) => {
  try {
    const { musicId } = req.params;
    const result = await adminService.restoreMusic(parseInt(musicId));
    res.json({ success: true, music: result });
  } catch (error) {
    console.error('Error restoring music:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Restaurer un utilisateur supprimé
const restoreUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminService.restoreUser(parseInt(userId));
    res.json({ success: true, user: result });
  } catch (error) {
    console.error('Error restoring user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
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
}; 