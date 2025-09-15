const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  addFavorite,
  deleteFavorite,
  getFavorites,
  getTrendingAlbums,
  getTrendingSongs,
  getNewAlbums,
  getNewSongs,
  getNewAlbumsFull,
  getNewSongsFull,
  getTrendingAlbumsFull,
  getTrendingSongsFull,
} = require('../controllers/musicController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

// Add a music to user's favorites
router.post('/favorites', authMiddleware, addFavorite);

// Get user's favorites (paginated)
router.get('/favorites', authMiddleware, getFavorites);

// Delete a favorite by id
router.delete('/favorites/:id', authMiddleware, deleteFavorite);

// Trending albums from Deezer
router.get('/trending', getTrendingAlbums);

// Trending songs from Deezer
router.get('/trending-songs', getTrendingSongs);

// New album releases from Deezer
router.get('/new-albums', getNewAlbums);

// New song releases (proxy using trending)
router.get('/new-songs', getNewSongs);

// New album releases (full list)
router.get('/new-albums-full', getNewAlbumsFull);

// New song releases (full list)
router.get('/new-songs-full', getNewSongsFull);

// Trending albums (full list)
router.get('/trending-albums-full', getTrendingAlbumsFull);

// Trending songs (full list)
router.get('/trending-songs-full', getTrendingSongsFull);

// Récupérer une musique par mbid
router.get('/by-mbid/:mbid', async (req, res) => {
  try {
    const { mbid } = req.params;
    const music = await prisma.music.findUnique({
      where: { mbid: mbid.toString() },
      include: {
        album: true
      }
    });
    
    if (!music) {
      return res.status(404).json({ success: false, error: 'Musique non trouvée' });
    }
    
    res.json({ success: true, music });
  } catch (error) {
    console.error('Error finding music by mbid:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Route pour récupérer les informations d'une musique depuis Deezer
router.get('/deezer/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    console.log('🌐 Récupération depuis Deezer pour trackId:', trackId);
    
    const response = await fetch(`https://api.deezer.com/track/${trackId}`);
    if (!response.ok) {
      return res.status(404).json({ 
        success: false, 
        error: 'Musique non trouvée sur Deezer' 
      });
    }
    
    const data = await response.json();
    console.log('📡 Réponse Deezer reçue pour trackId:', trackId);
    console.log('🔍 Données brutes de Deezer:', JSON.stringify(data, null, 2));
    console.log('🔍 data.title:', data.title);
    console.log('🔍 data.artist:', data.artist);
    console.log('🔍 data.album:', data.album);
    
    const musicInfo = {
      title: data.title || 'Titre inconnu',
      artist: data.artist?.name || 'Artiste inconnu',
      coverUrl: data.album?.cover_medium || data.album?.cover || '',
      album: data.album?.title || 'Album inconnu',
      duration: data.duration || 0
    };
    
    console.log('💾 musicInfo final:', musicInfo);
    
    res.json({ success: true, musicInfo });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération depuis Deezer:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des informations de la musique' 
    });
  }
});

module.exports = router;
