const request = require('supertest');
const app = require('../../../index'); // L'application Express
const { prisma } = require('./db.setup'); // Le client Prisma de test
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Fonction utilitaire pour créer un utilisateur de test
async function createTestUser(email, password, username, isAdmin = false, isDeleted = false) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      username,
      isAdmin,
      isDeleted,
    },
  });
  return user;
}

// Fonction utilitaire pour créer un utilisateur et obtenir un token
async function createUserWithToken(email, password, username, isAdmin = false, isDeleted = false) {
  const user = await createTestUser(email, password, username, isAdmin, isDeleted);
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  return { user, token, headers: { 'Authorization': `Bearer ${token}` } };
}

// Fonction utilitaire pour créer un admin et obtenir un token
async function createAdminWithToken(email, password, username) {
  return createUserWithToken(email, password, username, true);
}

module.exports = {
  createTestUser,
  createUserWithToken,
  createAdminWithToken,
};
