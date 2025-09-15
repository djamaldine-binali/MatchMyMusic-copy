const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/user.js');
const musicRoutes = require('./routes/music.js');
const matchRoutes = require('./routes/match.js');
const searchRoutes = require('./routes/search.js');
const ratingRoutes = require('./routes/rating.js');
const commentRoutes = require('./routes/comment.js');
const deezerRoutes = require('./routes/deezer.js');
const adminRoutes = require('./routes/admin.js');
const chatRoutes = require('./routes/chat.js');
const blockRoutes = require('./routes/block.js');
const reportRoutes = require('./routes/report.js');
const notificationRoutes = require('./routes/notification.js');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/deezer', deezerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Route de test pour vérifier que le serveur fonctionne
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Serveur backend fonctionnel !',
    timestamp: new Date().toISOString(),
    routes: {
      chat: '/api/chat/*',
      users: '/api/users/*',
      music: '/api/music/*',
      matches: '/api/matches/*'
    }
  });
});

// Temporary mock endpoint for top user ratings
app.get('/api/top-ratings', (req, res) => {
  res.json([]);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
