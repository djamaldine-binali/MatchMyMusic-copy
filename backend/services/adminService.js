const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer tous les utilisateurs (y compris supprimés) pour l'admin
async function getAllUsers(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isAdmin: true,
        isDeleted: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            ratings: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.user.count()
  ]);
  
  return { users, total, page, pageSize };
}

// Supprimer un utilisateur (soft delete)
async function deleteUser(userId) {
  try {
    // Vérifier que ce n'est pas le dernier admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });
    
    if (user && user.isAdmin) {
      const adminCount = await prisma.user.count({ 
        where: { 
          isAdmin: true,
          isDeleted: false 
        } 
      });
      
      if (adminCount <= 1) {
        throw new Error('Impossible de supprimer le dernier administrateur');
      }
    }
    
    // Marquer l'utilisateur comme supprimé au lieu de le supprimer complètement
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true }
    });

    return deletedUser;
  } catch (error) {
    console.error('Error soft deleting user:', error);
    throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
  }
}

// Restaurer un utilisateur supprimé
async function restoreUser(userId) {
  try {
    const restoredUser = await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: false }
    });

    return restoredUser;
  } catch (error) {
    console.error('Error restoring user:', error);
    throw new Error(`Erreur lors de la restauration de l'utilisateur: ${error.message}`);
  }
}

// Récupérer tous les commentaires
async function getAllComments(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        music: {
          select: {
            id: true,
            title: true,
            mbid: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.comment.count()
  ]);
  
  return { comments, total, page, pageSize };
}

// Supprimer un commentaire
async function deleteComment(commentId) {
  return await prisma.comment.delete({
    where: { id: commentId }
  });
}

// Récupérer toutes les musiques
async function getAllMusic(page = 1, pageSize = 20, search = '') {
  const skip = (page - 1) * pageSize;
  
  // Construire les conditions de recherche
  const whereClause = search ? {
    AND: [
      { isDeleted: false }, // Ne pas afficher les musiques supprimées par défaut
      {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { album: { title: { contains: search, mode: 'insensitive' } } }
        ]
      }
    ]
  } : { isDeleted: false }; // Ne pas afficher les musiques supprimées par défaut
  
  const [music, total] = await Promise.all([
    prisma.music.findMany({
      where: whereClause,
      include: {
        album: {
          select: {
            id: true,
            title: true,
            coverUrl: true
          }
        },
        _count: {
          select: {
            users: true,        // Relation Favorite (UserMusic)
            ratings: true,
            comments: true
          }
        }
      },
      orderBy: { id: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.music.count({ where: whereClause })
  ]);
  
  return { music, total, page, pageSize };
}

// Récupérer toutes les musiques (y compris supprimées) pour l'admin
async function getAllMusicAdmin(page = 1, pageSize = 20, search = '') {
  const skip = (page - 1) * pageSize;
  
  // Construire les conditions de recherche
  const whereClause = search ? {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { album: { title: { contains: search, mode: 'insensitive' } } }
    ]
  } : {};
  
  const [music, total] = await Promise.all([
    prisma.music.findMany({
      where: whereClause,
      include: {
        album: {
          select: {
            id: true,
            title: true,
            coverUrl: true
          }
        },
        _count: {
          select: {
            users: true,        // Relation Favorite (UserMusic)
            ratings: true,
            comments: true
          }
        }
      },
      orderBy: { id: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.music.count({ where: whereClause })
  ]);
  
  return { music, total, page, pageSize };
}

// Supprimer une musique (soft delete)
async function deleteMusic(musicId) {
  try {
    // Marquer la musique comme supprimée au lieu de la supprimer complètement
    const deletedMusic = await prisma.music.update({
      where: { id: musicId },
      data: { isDeleted: true }
    });

    return deletedMusic;
  } catch (error) {
    console.error('Error soft deleting music:', error);
    throw new Error(`Erreur lors de la suppression de la musique: ${error.message}`);
  }
}

// Restaurer une musique supprimée
async function restoreMusic(musicId) {
  try {
    const restoredMusic = await prisma.music.update({
      where: { id: musicId },
      data: { isDeleted: false }
    });

    return restoredMusic;
  } catch (error) {
    console.error('Error restoring music:', error);
    throw new Error(`Erreur lors de la restauration de la musique: ${error.message}`);
  }
}

// Récupérer les statistiques du site
async function getSiteStats() {
  try {
    const [users, music, comments, favorites, ratings, blocks, reports] = await Promise.all([
      prisma.user.count({ where: { isDeleted: false } }), // Only non-deleted users
      prisma.music.count({ where: { isDeleted: false } }), // Only non-deleted music
      prisma.comment.count(),
      prisma.favorite.count(),
      prisma.rating.count(),
      prisma.userBlock.count(),
      prisma.userReport.count()
    ]);

    return {
      users,
      music,
      comments,
      favorites,
      ratings,
      blocks,
      reports
    };
  } catch (error) {
    console.error('Error getting site stats:', error);
    throw error;
  }
}

// Promouvoir/dépromouvoir un utilisateur avec garde-fous
async function setUserAdminRole(userId, makeAdmin) {
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, isAdmin: true } });
  if (!target) {
    const err = new Error('Utilisateur introuvable');
    err.status = 404;
    throw err;
  }

  if (!makeAdmin) {
    // On veut retirer le rôle admin
    if (target.isAdmin) {
      const adminCount = await prisma.user.count({ where: { isAdmin: true } });
      if (adminCount <= 1) {
        const err = new Error('Impossible de retirer le dernier administrateur');
        err.status = 400;
        throw err;
      }
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isAdmin: !!makeAdmin },
    select: { id: true, username: true, email: true, isAdmin: true }
  });
  return updated;
}

module.exports = {
  getAllUsers,
  deleteUser,
  restoreUser,
  getAllComments,
  deleteComment,
  getAllMusic,
  getAllMusicAdmin,
  deleteMusic,
  restoreMusic,
  getSiteStats,
  setUserAdminRole
}; 