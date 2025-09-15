const commentService = require('../services/commentService.js');

// Créer un nouveau commentaire
const createComment = async (req, res) => {
  try {
    const { musicId, content } = req.body;
    const userId = req.userId;

    console.log('🔍 Contrôleur reçoit:', { musicId, content, userId });

    if (!musicId || !content) {
      return res.status(400).json({ 
        success: false, 
        error: 'musicId et content sont requis' 
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le commentaire ne peut pas être vide' 
      });
    }

    console.log('📤 Appel du service avec:', { userId, musicId: parseInt(musicId), content });

    const comment = await commentService.createComment(userId, parseInt(musicId), content);

    console.log('✅ Service retourne:', comment);

    res.json({
      success: true,
      comment,
      message: 'Nouveau commentaire ajouté !'
    });
  } catch (error) {
    console.error('💥 Erreur dans le contrôleur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du commentaire'
    });
  }
};

// Mettre à jour un commentaire existant
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Le contenu du commentaire ne peut pas être vide' 
      });
    }

    const comment = await commentService.updateComment(parseInt(commentId), userId, content);

    res.json({
      success: true,
      comment,
      message: 'Commentaire modifié !'
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification du commentaire'
    });
  }
};

// Récupérer un commentaire spécifique par son ID
const getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await commentService.getCommentById(parseInt(commentId));

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Commentaire non trouvé'
      });
    }

    res.json({
      success: true,
      comment
    });
  } catch (error) {
    console.error('Error getting comment by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du commentaire'
    });
  }
};

// Récupérer tous les commentaires d'un utilisateur sur une musique spécifique
const getUserCommentsOnMusic = async (req, res) => {
  try {
    const { musicId } = req.params;
    const userId = req.userId;

    const comments = await commentService.getUserCommentsOnMusic(userId, parseInt(musicId));

    res.json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Error getting user comments on music:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des commentaires de l\'utilisateur'
    });
  }
};

// Récupérer tous les commentaires d'une musique
const getCommentsForMusic = async (req, res) => {
  try {
    const { musicId } = req.params;
    const userId = req.userId; // Récupérer l'ID de l'utilisateur connecté
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '10');

    const result = await commentService.getCommentsForMusic(parseInt(musicId), page, pageSize, userId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error getting comments for music:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des commentaires'
    });
  }
};

// Supprimer un commentaire par son ID
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    // Vérifier que le commentaire existe et appartient à l'utilisateur
    const comment = await commentService.getCommentById(parseInt(commentId));
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Commentaire non trouvé'
      });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Vous n\'êtes pas autorisé à supprimer ce commentaire'
      });
    }

    await commentService.deleteComment(userId, parseInt(commentId));

    res.json({
      success: true,
      message: 'Commentaire supprimé !'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du commentaire'
    });
  }
};

module.exports = {
  createComment,
  updateComment,
  getCommentById,
  getUserCommentsOnMusic,
  getCommentsForMusic,
  deleteComment
}; 