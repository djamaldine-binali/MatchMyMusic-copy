const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Créer un nouveau commentaire
async function createComment(userId, musicId, content) {
  console.log('🔧 Service reçoit:', { userId, musicId, content });
  
  try {
    // Créer un nouveau commentaire
    const result = await prisma.comment.create({
      data: {
        userId,
        musicId,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
    
    console.log('✅ Nouveau commentaire créé avec succès:', result);
    return result;
  } catch (error) {
    console.error('💥 Erreur dans le service:', error);
    throw error;
  }
}

// Mettre à jour un commentaire existant
async function updateComment(commentId, userId, content) {
  try {
    const result = await prisma.comment.update({
      where: {
        id: commentId,
        userId // Vérifier que l'utilisateur est bien le propriétaire
      },
      data: {
        content,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
    
    console.log('✅ Commentaire mis à jour avec succès:', result);
    return result;
  } catch (error) {
    console.error('💥 Erreur lors de la mise à jour:', error);
    throw error;
  }
}

// Récupérer un commentaire spécifique par son ID
async function getCommentById(commentId) {
  return await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      user: {
        select: {
          id: true,
          username: true
        }
      }
    }
  });
}

// Récupérer tous les commentaires d'un utilisateur sur une musique spécifique
async function getUserCommentsOnMusic(userId, musicId) {
  return await prisma.comment.findMany({
    where: { 
      userId,
      musicId 
    },
    include: {
      user: {
        select: {
          id: true,
          username: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// Récupérer tous les commentaires d'une musique
async function getCommentsForMusic(musicId, page = 1, pageSize = 10, currentUserId = null) {
  const skip = (page - 1) * pageSize;
  
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { musicId },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.comment.count({ where: { musicId } })
  ]);
  
  // Ajouter l'information "isMine" à chaque commentaire
  const commentsWithOwnership = comments.map(comment => ({
    ...comment,
    isMine: currentUserId ? comment.userId === currentUserId : false
  }));
  
  return { comments: commentsWithOwnership, total, page, pageSize };
}

// Supprimer un commentaire par son ID
async function deleteComment(commentId) {
  return await prisma.comment.delete({
    where: { id: commentId }
  });
}

module.exports = {
  createComment,
  updateComment,
  getCommentById,
  getUserCommentsOnMusic,
  getCommentsForMusic,
  deleteComment
}; 