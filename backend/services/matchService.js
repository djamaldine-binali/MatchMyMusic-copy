const { PrismaClient } = require('@prisma/client');
const notificationService = require('./notificationService.js');

const prisma = new PrismaClient();

// Fonction helper pour obtenir le nom d'utilisateur
async function getUserUsername(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true }
    });
    return user ? user.username : 'Utilisateur';
  } catch (error) {
    console.error('Error getting username:', error);
    return 'Utilisateur';
  }
}

async function findMatchesForUser(userId, minCommonItems = 10) {
  try {
    // Récupérer tous les utilisateurs sauf l'utilisateur actuel et ceux supprimés
    const allUsers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        isDeleted: false // Do not include deleted users
      },
      select: { id: true, username: true, email: true, isAdmin: true }
    });

    const matches = [];

    // Pour chaque utilisateur, vérifier s'il y a des correspondances
    for (const user of allUsers) {
      // Vérifier s'il y a un blocage entre les utilisateurs
      const [block1, block2] = await Promise.all([
        prisma.userBlock.findUnique({
          where: {
            blockerId_blockedId: {
              blockerId: userId,
              blockedId: user.id
            }
          }
        }),
        prisma.userBlock.findUnique({
          where: {
            blockerId_blockedId: {
              blockerId: user.id,
              blockedId: userId
            }
          }
        })
      ]);

      // Si un des utilisateurs a bloqué l'autre, passer au suivant
      if (block1 || block2) {
        continue;
      }

      let commonFavorites = 0;
      let commonRatings = 0;

      // Vérifier les favoris en commun
      const userFavorites = await prisma.favorite.findMany({
        where: { userId },
        select: { musicId: true }
      });

      if (userFavorites.length > 0) {
        const userFavoriteIds = userFavorites.map(f => f.musicId);
        const matchedFavorites = await prisma.favorite.findMany({
          where: {
            userId: user.id,
            musicId: { in: userFavoriteIds }
          }
        });
        commonFavorites = matchedFavorites.length;
      }

      // Vérifier les notes en commun
      const userRatings = await prisma.rating.findMany({
        where: { userId },
        select: { musicId: true, value: true }
      });

      if (userRatings.length > 0) {
        const userRatingIds = userRatings.map(r => r.musicId);
        const matchedRatings = await prisma.rating.findMany({
          where: {
            userId: user.id,
            musicId: { in: userRatingIds }
          },
          select: { musicId: true, value: true }
        });

        // Compter seulement les notes identiques
        for (const matchedRating of matchedRatings) {
          const userRating = userRatings.find(r => r.musicId === matchedRating.musicId);
          if (userRating && userRating.value === matchedRating.value) {
            commonRatings++;
          }
        }
      }

      const totalScore = commonFavorites + commonRatings;
      if (totalScore >= minCommonItems) {
        // Vérifier si un match existe déjà dans la base de données
        let existingMatch = await prisma.match.findFirst({
          where: {
            OR: [
              { userAId: userId, userBId: user.id },
              { userAId: user.id, userBId: userId }
            ]
          }
        });

        // Si le match n'existe pas, le créer
        if (!existingMatch) {
          existingMatch = await prisma.match.create({
            data: {
              userAId: Math.min(userId, user.id),
              userBId: Math.max(userId, user.id),
              score: totalScore
            }
          });

          // Créer des notifications pour les deux utilisateurs
          try {
            const matchData = {
              matchId: existingMatch.id,
              userId: user.id,
              username: user.username,
              matchScore: totalScore
            };

            // Notification pour l'utilisateur principal
            await notificationService.createNewMatchNotification(userId, matchData);
            
            // Notification pour l'autre utilisateur
            const otherUserMatchData = {
              matchId: existingMatch.id,
              userId: userId,
              username: await getUserUsername(userId),
              matchScore: totalScore
            };
            await notificationService.createNewMatchNotification(user.id, otherUserMatchData);
          } catch (error) {
            console.error('Error creating match notifications:', error);
            // Ne pas faire échouer le matching si les notifications échouent
          }
        }

        matches.push({
          matchId: existingMatch.id,
          userId: user.id,
          username: user.username,
          email: user.email,
          commonFavorites,
          commonRatings,
          matchScore: totalScore
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error finding matches:', error);
    return [];
  }
}

async function getMatchDetails(userId, matchedUserId) {
  try {
    // Récupérer les favoris en commun
    const userFavorites = await prisma.favorite.findMany({
      where: { userId },
      select: { musicId: true }
    });

    const matchedFavorites = await prisma.favorite.findMany({
      where: { userId: matchedUserId },
      select: { musicId: true }
    });

    const commonFavoriteIds = userFavorites
      .map(f => f.musicId)
      .filter(id => matchedFavorites.some(mf => mf.musicId === id));

    const commonFavorites = await prisma.favorite.findMany({
      where: {
        musicId: { in: commonFavoriteIds },
        userId: { in: [userId, matchedUserId] }
      },
      include: { music: { include: { album: true } } }
    });

    // Récupérer les notes en commun
    const userRatings = await prisma.rating.findMany({
      where: { userId },
      select: { musicId: true, value: true }
    });

    const matchedRatings = await prisma.rating.findMany({
      where: { userId: matchedUserId },
      select: { musicId: true, value: true }
    });

    const commonRatingIds = userRatings
      .filter(r => matchedRatings.some(mr => mr.musicId === r.musicId && mr.value === r.value))
      .map(r => r.musicId);

    const commonRatings = await prisma.rating.findMany({
      where: {
        musicId: { in: commonRatingIds },
        userId: { in: [userId, matchedUserId] }
      },
      include: { music: { include: { album: true } } }
    });

    return {
      commonFavorites,
      commonRatings
    };
  } catch (error) {
    console.error('Error getting match details:', error);
    return { commonFavorites: [], commonRatings: [] };
  }
}

module.exports = {
  findMatchesForUser,
  getMatchDetails
}; 