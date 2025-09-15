const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { setRating, getRecent, getAll } = require('../controllers/ratingController');

const router = express.Router();

router.post('/', authMiddleware, setRating);
router.get('/recent', authMiddleware, getRecent);
router.get('/', authMiddleware, getAll);

module.exports = router; 