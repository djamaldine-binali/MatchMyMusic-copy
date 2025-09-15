const express = require('express');
const router = express.Router();
const { 
  createComment, 
  updateComment,
  getCommentById,
  getUserCommentsOnMusic,
  getCommentsForMusic, 
  deleteComment 
} = require('../controllers/commentController.js');
const { authMiddleware } = require('../middleware/auth.js');

// Créer un nouveau commentaire
router.post('/', authMiddleware, createComment);

// Mettre à jour un commentaire existant
router.put('/:commentId', authMiddleware, updateComment);

// Récupérer un commentaire spécifique par son ID
router.get('/:commentId', getCommentById);

// Récupérer tous les commentaires d'un utilisateur sur une musique spécifique
router.get('/user/:musicId', authMiddleware, getUserCommentsOnMusic);

// Récupérer tous les commentaires d'une musique
router.get('/music/:musicId', getCommentsForMusic);

// Supprimer un commentaire par son ID
router.delete('/:commentId', authMiddleware, deleteComment);

module.exports = router; 