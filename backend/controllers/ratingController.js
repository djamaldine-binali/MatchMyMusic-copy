const ratingService = require('../services/ratingService');

async function setRating(req, res) {
  try {
    const { mbid, title, albumMbid, albumTitle, coverUrl, value } = req.body;
    if (typeof value !== 'number' || value < 1 || value > 5) {
      return res.status(400).json({ error: 'Valeur de note invalide' });
    }
    const rating = await ratingService.setRatingForUser(req.userId, { mbid, title, albumMbid, albumTitle, coverUrl, value });
    res.status(201).json({ rating });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getRecent(req, res) {
  try {
    const take = parseInt(req.query.take || '6', 10);
    const ratings = await ratingService.getRecentRatings(req.userId, { take });
    const items = ratings.map(r => ({
      id: r.id,
      value: r.value,
      title: r.music?.title,
      mbid: r.music?.mbid || null,
      coverUrl: r.music?.album?.coverUrl || null,
      albumTitle: r.music?.album?.title || null,
      updatedAt: r.updatedAt,
    }));
    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
}

async function getAll(req, res) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const pageSize = parseInt(req.query.pageSize || '12', 10);
    const skip = (page - 1) * pageSize;
    const { ratings, total } = await ratingService.getAllRatings(req.userId, { skip, take: pageSize });
    const items = ratings.map(r => ({
      id: r.id,
      value: r.value,
      title: r.music?.title,
      mbid: r.music?.mbid || null,
      coverUrl: r.music?.album?.coverUrl || null,
      albumTitle: r.music?.album?.title || null,
      updatedAt: r.updatedAt,
    }));
    res.json({ items, total, page, pageSize });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  setRating,
  getRecent,
  getAll,
}; 