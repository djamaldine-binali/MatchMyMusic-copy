const musicService = require('../services/musicService');

async function addFavorite(req, res) {
  const { musicId, title, artist, coverUrl } = req.body;
  
  console.log('Received favorite data:', { musicId, title, artist, coverUrl });
  
  if (!musicId || !title) {
    return res.status(400).json({ error: 'musicId et title sont requis' });
  }
  
  try {
    // Créer un objet avec les champs attendus par le service
    const musicData = {
      mbid: musicId.toString(),
      title: title,
      albumMbid: null,
      albumTitle: artist || null, // Utiliser artist comme albumTitle si pas d'album
      coverUrl: coverUrl || null
    };
    
    console.log('Sending to service:', musicData);
    
    const userMusic = await musicService.addFavoriteForUser(req.userId, musicData);
    console.log('Service returned:', userMusic);
    
    res.status(201).json({ message: 'Music added to favorites', userMusic });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout aux favoris' });
  }
}

async function deleteFavorite(req, res) {
  try {
    const favoriteId = parseInt(req.params.id, 10);
    await musicService.deleteFavorite(req.userId, favoriteId);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || 'Server error' });
  }
}

async function getFavorites(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const pageSize = parseInt(req.query.pageSize || '12', 10);
    const skip = (page - 1) * pageSize;
    const { favorites, total } = await musicService.getFavoritesForUser(req.userId, { skip, take: pageSize });
    const items = favorites.map(f => ({
      id: f.id,
      musicId: f.musicId,
      mbid: f.music?.mbid, // Ajouter le mbid de Deezer
      title: f.music?.title,
      albumTitle: f.music?.album?.title || null,
      coverUrl: f.music?.album?.coverUrl || null,
    }));
    res.json({ items, total, page, pageSize });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getTrendingAlbums(req, res) {
  try {
    const albums = await musicService.fetchTrendingAlbums();
    res.json({ albums });
  } catch (error) {
    console.error('Deezer trending error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getTrendingSongs(req, res) {
  try {
    const songs = await musicService.fetchTrendingSongs();
    res.json({ songs });
  } catch (error) {
    console.error('Deezer trending songs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getNewAlbums(req, res) {
  try {
    const albums = await musicService.fetchNewAlbums();
    res.json({ albums });
  } catch (error) {
    console.error('Deezer new albums error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getNewSongs(req, res) {
  try {
    const songs = await musicService.fetchNewSongsProxy();
    res.json({ songs });
  } catch (error) {
    console.error('Deezer new songs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getNewAlbumsFull(req, res) {
  try {
    const albums = await musicService.fetchNewAlbumsFull();
    res.json({ albums });
  } catch (error) {
    console.error('Deezer new albums full error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getNewSongsFull(req, res) {
  try {
    const songs = await musicService.fetchNewSongsFull();
    res.json({ songs });
  } catch (error) {
    console.error('Deezer new songs full error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getTrendingAlbumsFull(req, res) {
  try {
    const albums = await musicService.fetchTrendingAlbumsFull();
    res.json({ albums });
  } catch (error) {
    console.error('Deezer trending albums full error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getTrendingSongsFull(req, res) {
  try {
    const songs = await musicService.fetchTrendingSongsFull();
    res.json({ songs });
  } catch (error) {
    console.error('Deezer trending songs full error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
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
}; 