const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Configuration de la base de données de test AVANT d'importer l'application
process.env.DATABASE_URL = `file:${path.join(__dirname, '../../../prisma/dev-test.db')}`;
process.env.JWT_SECRET = 'test_secret_123';

const prisma = new PrismaClient();

// Fonction pour nettoyer la base de données
async function cleanupDatabase() {
  // Supprimer dans l'ordre inverse des dépendances
  await prisma.userBlock.deleteMany();
  await prisma.userReport.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.match.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.music.deleteMany();
  await prisma.album.deleteMany();
  await prisma.user.deleteMany();
}

// Nettoyer la base de données avant chaque test
beforeEach(async () => {
  await cleanupDatabase();
});

// Fermer la connexion après tous les tests
afterAll(async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, cleanupDatabase };
