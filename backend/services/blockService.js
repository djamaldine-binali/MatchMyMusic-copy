const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Bloquer un utilisateur
async function blockUser(blockerId, blockedId, reason = null) {
  try {
    // Vérifier que l'utilisateur ne se bloque pas lui-même
    if (blockerId === blockedId) {
      throw new Error('Vous ne pouvez pas vous bloquer vous-même');
    }

    // Vérifier que l'utilisateur à bloquer existe
    const blockedUser = await prisma.user.findUnique({
      where: { id: blockedId },
      select: { id: true, username: true, isDeleted: true, isAdmin: true }
    });

    if (!blockedUser) {
      throw new Error('Utilisateur à bloquer non trouvé');
    }

    if (blockedUser.isDeleted) {
      throw new Error('Impossible de bloquer un utilisateur supprimé');
    }

    // Vérifier que l'utilisateur qui bloque n'est pas admin
    const blockerUser = await prisma.user.findUnique({
      where: { id: blockerId },
      select: { id: true, isAdmin: true }
    });

    // Si l'utilisateur qui bloque n'est PAS admin ET que l'utilisateur à bloquer EST admin
    if (!blockerUser.isAdmin && blockedUser.isAdmin) {
      throw new Error('Impossible de bloquer un administrateur');
    }

    // Créer le blocage
    const block = await prisma.userBlock.create({
      data: {
        blockerId,
        blockedId,
        reason
      },
      include: {
        blocked: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    return block;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
}

// Débloquer un utilisateur
async function unblockUser(blockerId, blockedId) {
  try {
    const block = await prisma.userBlock.delete({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId
        }
      },
      include: {
        blocked: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    return block;
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
}

// Vérifier si un utilisateur est bloqué par un autre
async function isUserBlocked(userId, otherUserId) {
  try {
    const block = await prisma.userBlock.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: otherUserId,
          blockedId: userId
        }
      }
    });

    return !!block;
  } catch (error) {
    console.error('Error checking if user is blocked:', error);
    return false;
  }
}

// Vérifier si deux utilisateurs peuvent interagir (pas de blocage mutuel)
async function canUsersInteract(userId1, userId2) {
  try {
    const [block1, block2] = await Promise.all([
      prisma.userBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: userId1,
            blockedId: userId2
          }
        }
      }),
      prisma.userBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: userId2,
            blockedId: userId1
          }
        }
      })
    ]);

    return !block1 && !block2;
  } catch (error) {
    console.error('Error checking if users can interact:', error);
    return false;
  }
}

// Obtenir la liste des utilisateurs bloqués par un utilisateur
async function getBlockedUsers(userId) {
  try {
    const blocks = await prisma.userBlock.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return blocks.map(block => ({
      id: block.id,
      blockedUser: block.blocked,
      reason: block.reason,
      blockedAt: block.createdAt
    }));
  } catch (error) {
    console.error('Error getting blocked users:', error);
    throw error;
  }
}

// Obtenir la liste des utilisateurs qui ont bloqué un utilisateur
async function getUsersWhoBlocked(userId) {
  try {
    const blocks = await prisma.userBlock.findMany({
      where: { blockedId: userId },
      include: {
        blocker: {
          select: {
            id: true,
            username: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return blocks.map(block => ({
      id: block.id,
      blockerUser: block.blocker,
      reason: block.reason,
      blockedAt: block.createdAt
    }));
  } catch (error) {
    console.error('Error getting users who blocked:', error);
    throw error;
  }
}

module.exports = {
  blockUser,
  unblockUser,
  isUserBlocked,
  canUsersInteract,
  getBlockedUsers,
  getUsersWhoBlocked
}; 