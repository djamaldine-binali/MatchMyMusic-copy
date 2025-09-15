require('dotenv').config();
const express = require('express');
const { authMiddleware } = require('../middleware/auth.js');
const {
  registerUser,
  loginUser,
  checkEmailExists,
  getProfile,
  updateProfile,
} = require('../controllers/userController');

const router = express.Router();

// Route d'inscription
router.post('/register', registerUser);

// Route de login
router.post('/login', loginUser);

// Check if email exists
router.post('/check-email', checkEmailExists);

// Route protégée : récupérer profil utilisateur
router.get('/profile', authMiddleware, getProfile);

// Route protégée : modifier profil utilisateur
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
