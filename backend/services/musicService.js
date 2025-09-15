const prisma = require('../prisma/client.js');
const fetch = require('node-fetch');

async function addFavoriteForUser(userId, { mbid, title, albumMbid, albumTitle, coverUrl }) {
  console.log('Service received:', { mbid, title, albumMbid, albumTitle, coverUrl });
  
  let album = null;
  
  // Créer un album si on a coverUrl ou albumTitle, même sans albumMbid
  if (coverUrl || albumTitle) {
    // Générer un ID unique pour l'album si pas d'albumMbid
    const albumId = albumMbid || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Creating album with ID:', albumId, 'title:', albumTitle, 'coverUrl:', coverUrl);
    
    album = await prisma.album.upsert({
      where: { mbid: albumId },
      update: {},
      create: { 
        mbid: albumId, 
        title: albumTitle || 'Album inconnu', 
        coverUrl: coverUrl || null 
      },
    });
    
    console.log('Album created/updated:', album);
  } else {
    console.log('No album created - missing coverUrl and albumTitle');
  }
  
  const music = await prisma.music.upsert({
    where: { mbid },
    update: { albumId: album ? album.id : null },
    create: { mbid, title, albumId: album ? album.id : null },
  });
  
  console.log('Music created/updated:', music);
  
  const favorite = await prisma.favorite.upsert({
    where: { userId_musicId: { userId, musicId: music.id } },
    update: { likedAt: new Date() },
    create: { userId, musicId: music.id },
  });
  
  console.log('Favorite created/updated:', favorite);
  
  // Vérifier automatiquement les nouveaux matches après l'ajout du favori
  try {
    await checkForNewMatches(userId);
    console.log('New matches check completed for user:', userId);
  } catch (error) {
    console.error('Error checking for new matches:', error);
    // Ne pas faire échouer l'ajout du favori si la vérification des matches échoue
  }
  
  return favorite;
}

async function deleteFavorite(userId, favoriteId) {
  const fav = await prisma.favorite.findUnique({ where: { id: favoriteId } });
  if (!fav || fav.userId !== userId) {
    const err = new Error('Favorite not found');
    err.status = 404;
    throw err;
  }
  await prisma.favorite.delete({ where: { id: favoriteId } });
  return { deleted: true };
}

async function getFavoritesForUser(userId, { skip = 0, take = 12 } = {}) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      music: {
        include: { album: true }
      }
    },
    orderBy: { id: 'desc' },
    skip,
    take,
  });
  const total = await prisma.favorite.count({ where: { userId } });
  return { favorites, total };
}

async function fetchTrendingAlbums() {
  const response = await fetch('https://api.deezer.com/chart/0/albums');
  const data = await response.json();
  return (data.data || []).map(album => ({
    id: album.id,
    title: album.title,
    artist: album.artist.name,
    coverUrl: album.cover_medium,
    link: album.link
  }));
}

async function fetchTrendingSongs() {
  const response = await fetch('https://api.deezer.com/chart/0/tracks');
  const data = await response.json();
  return (data.data || []).map(track => ({
    id: track.id,
    title: track.title,
    artist: track.artist.name,
    cover: track.album.cover_medium,
    link: track.link
  }));
}

async function fetchNewAlbums() {
  const response = await fetch('https://api.deezer.com/editorial/0/releases');
  const data = await response.json();
  return (data.data || []).map(album => ({
    id: album.id,
    title: album.title,
    artist: album.artist.name,
    cover: album.cover_medium,
    link: album.link
  }));
}

async function fetchNewSongsProxy() {
  const response = await fetch('https://api.deezer.com/chart/0/tracks');
  const data = await response.json();
  return (data.data || []).map(track => ({
    id: track.id,
    title: track.title,
    artist: track.artist.name,
    cover: track.album.cover_medium,
    link: track.link
  }));
}

async function fetchNewAlbumsFull() {
  const [response1, response2] = await Promise.all([
    fetch('https://api.deezer.com/editorial/0/releases'),
    fetch('https://api.deezer.com/editorial/132/releases')
  ]);
  const data1 = await response1.json();
  const data2 = await response2.json();
  const allAlbums = [ ...(data1.data || []), ...(data2.data || []) ];
  const uniqueAlbums = allAlbums.filter((album, index, self) =>
    index === self.findIndex(a => a.id === album.id)
  );
  return uniqueAlbums.map(album => ({
    id: album.id,
    title: album.title,
    artist: album.artist.name,
    cover: album.cover_medium,
    link: album.link
  })).slice(0, 40);
}

async function fetchNewSongsFull() {
  const [response1, response2] = await Promise.all([
    fetch('https://api.deezer.com/chart/132/tracks'),
    fetch('https://api.deezer.com/chart/116/tracks')
  ]);
  const data1 = await response1.json();
  const data2 = await response2.json();
  const allSongs = [ ...(data1.data || []), ...(data2.data || []) ];
  const uniqueSongs = allSongs.filter((song, index, self) =>
    index === self.findIndex(s => s.id === song.id)
  );
  return uniqueSongs.map(track => ({
    id: track.id,
    title: track.title,
    artist: track.artist.name,
    cover: track.album.cover_medium,
    link: track.link
  })).slice(0, 50);
}

async function fetchTrendingAlbumsFull() {
  const [response1, response2] = await Promise.all([
    fetch('https://api.deezer.com/chart/0/albums'),
    fetch('https://api.deezer.com/chart/132/albums')
  ]);
  const data1 = await response1.json();
  const data2 = await response2.json();
  const allAlbums = [ ...(data1.data || []), ...(data2.data || []) ];
  const uniqueAlbums = allAlbums.filter((album, index, self) =>
    index === self.findIndex(a => a.id === album.id)
  );
  return uniqueAlbums.map(album => ({
    id: album.id,
    title: album.title,
    artist: album.artist.name,
    coverUrl: album.cover_medium,
    link: album.link
  })).slice(0, 40);
}

async function fetchTrendingSongsFull() {
  const [response1, response2] = await Promise.all([
    fetch('https://api.deezer.com/chart/0/tracks'),
    fetch('https://api.deezer.com/chart/132/tracks')
  ]);
  const data1 = await response1.json();
  const data2 = await response2.json();
  const allSongs = [ ...(data1.data || []), ...(data2.data || []) ];
  const uniqueSongs = allSongs.filter((song, index, self) =>
    index === self.findIndex(s => s.id === song.id)
  );
  return uniqueSongs.map(track => ({
    id: track.id,
    title: track.title,
    artist: track.artist.name,
    cover: track.album.cover_medium,
    link: track.link
  })).slice(0, 50);
}

// Vérifier les nouveaux matches pour un utilisateur
async function checkForNewMatches(userId) {
  try {
    console.log('Checking for new matches for user:', userId);
    
    // Récupérer tous les utilisateurs sauf l'utilisateur actuel
    const allUsers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        isDeleted: false
      },
      select: { id: true, username: true }
    });

    console.log('Found', allUsers.length, 'other users to check');

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

      if (block1 || block2) {
        console.log('Skipping blocked user:', user.username);
        continue; // Passer au suivant si bloqué
      }

      // Vérifier les favoris en commun
      const userFavorites = await prisma.favorite.findMany({
        where: { userId },
        select: { musicId: true }
      });

      const otherUserFavorites = await prisma.favorite.findMany({
        where: { userId: user.id },
        select: { musicId: true }
      });

      const commonFavorites = userFavorites
        .map(f => f.musicId)
        .filter(id => otherUserFavorites.some(mf => mf.musicId === id));

      // Vérifier les notes en commun
      const userRatings = await prisma.rating.findMany({
        where: { userId },
        select: { musicId: true, value: true }
      });

      const otherUserRatings = await prisma.rating.findMany({
        where: { userId: user.id },
        select: { musicId: true, value: true }
      });

      const commonRatings = userRatings
        .filter(r => otherUserRatings.some(mr => mr.musicId === r.musicId && mr.value === r.value))
        .length;

      const totalScore = commonFavorites.length + commonRatings;

      console.log(`User ${userId} vs ${user.username}: ${commonFavorites.length} common favorites, ${commonRatings} common ratings, total: ${totalScore}`);

      // Si on a au moins 10 éléments en commun ET qu'il n'y a pas déjà de match
      if (totalScore >= 10) {
        const existingMatch = await prisma.match.findFirst({
          where: {
            OR: [
              { userAId: userId, userBId: user.id },
              { userAId: user.id, userBId: userId }
            ]
          }
        });

        // Si c'est un nouveau match, le créer et envoyer des notifications
        if (!existingMatch) {
          console.log(`Creating new match between user ${userId} and ${user.username} with score ${totalScore}`);
          
          const newMatch = await prisma.match.create({
            data: {
              userAId: Math.min(userId, user.id),
              userBId: Math.max(userId, user.id),
              score: totalScore
            }
          });

          // Créer des notifications pour les deux utilisateurs
          try {
            const notificationService = require('./notificationService.js');
            
            const matchData = {
              matchId: newMatch.id,
              userId: user.id,
              username: user.username,
              matchScore: totalScore
            };

            // Notification pour l'utilisateur principal
            await notificationService.createNewMatchNotification(userId, matchData);
            console.log(`Notification sent to user ${userId} for match with ${user.username}`);
            
            // Notification pour l'autre utilisateur
            const otherUserMatchData = {
              matchId: newMatch.id,
              userId: userId,
              username: await getUserUsername(userId),
              matchScore: totalScore
            };
            await notificationService.createNewMatchNotification(user.id, otherUserMatchData);
            console.log(`Notification sent to user ${user.id} for match with user ${userId}`);
          } catch (error) {
            console.error('Error creating match notifications:', error);
          }
        } else {
          console.log(`Match already exists between user ${userId} and ${user.username}`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking for new matches:', error);
    throw error;
  }
}

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

module.exports = {
  addFavoriteForUser,
  deleteFavorite,
  getFavoritesForUser,
  fetchTrendingAlbums,
  fetchTrendingSongs,
  fetchNewAlbums,
  fetchNewSongsProxy,
  fetchNewAlbumsFull,
  fetchNewSongsFull,
  fetchTrendingAlbumsFull,
  fetchTrendingSongsFull,
  checkForNewMatches
}; 