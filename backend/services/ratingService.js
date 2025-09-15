const prisma = require('../prisma/client.js');

async function upsertMusicAndAlbum({ mbid, title, albumMbid, albumTitle, coverUrl }) {
  let album = null;
  if (albumMbid) {
    album = await prisma.album.upsert({
      where: { mbid: albumMbid },
      update: {},
      create: { mbid: albumMbid, title: albumTitle || title, coverUrl }
    });
  }
  const music = await prisma.music.upsert({
    where: { mbid },
    update: {},
    create: { mbid, title, albumId: album ? album.id : null },
  });
  return music;
}

async function setRatingForUser(userId, { mbid, title, albumMbid, albumTitle, coverUrl, value }) {
  const music = await upsertMusicAndAlbum({ mbid, title, albumMbid, albumTitle, coverUrl });
  const rating = await prisma.rating.upsert({
    where: { userId_musicId: { userId, musicId: music.id } },
    update: { value },
    create: { userId, musicId: music.id, value },
  });
  return rating;
} 

async function getRecentRatings(userId, { take = 6 } = {}) {
  const ratings = await prisma.rating.findMany({
    where: { userId },
    include: { music: { include: { album: true } } },
    orderBy: { updatedAt: 'desc' },
    take,
  });
  return ratings;
}

async function getAllRatings(userId, { skip = 0, take = 12 } = {}) {
  const ratings = await prisma.rating.findMany({
    where: { userId },
    include: { music: { include: { album: true } } },
    orderBy: { updatedAt: 'desc' },
    skip,
    take,
  });
  const total = await prisma.rating.count({ where: { userId } });
  return { ratings, total };
}

module.exports = {
  setRatingForUser,
  getRecentRatings,
  getAllRatings,
}; 