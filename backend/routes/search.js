const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

router.get('/', async (req, res) => {
  const { query, type = 'album' } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    let url;
    if (type === 'track') {
      url = `https://api.deezer.com/search/track?q=${encodeURIComponent(query)}`;
    } else {
      url = `https://api.deezer.com/search/album?q=${encodeURIComponent(query)}`;
    }
    const response = await fetch(url);
    const data = await response.json();

    let results = [];
    if (type === 'track') {
      results = (data.data || []).map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist.name,
        album: track.album.title,
        cover: track.album.cover_medium,
        link: track.link
      }));
    } else {
      results = (data.data || []).map(album => ({
        id: album.id,
        title: album.title,
        artist: album.artist.name,
        cover: album.cover_medium,
        link: album.link
      }));
    }

    res.json({ results });
  } catch (error) {
    console.error('Deezer search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
