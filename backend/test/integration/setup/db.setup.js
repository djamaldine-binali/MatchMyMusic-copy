const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Configuration de la base de données de test AVANT d'importer l'application
const testDbPath = path.join(__dirname, '../../../prisma/dev-test.db');
const devDbPath = path.join(__dirname, '../../../prisma/dev.db');

// Ensure test DB file exists and has schema by copying from dev.db if missing
if (!fs.existsSync(testDbPath)) {
  if (fs.existsSync(devDbPath)) {
    fs.copyFileSync(devDbPath, testDbPath);
  }
}

process.env.DATABASE_URL = `file:${testDbPath}`;

// Ensure schema is applied to test DB (idempotent)
try {
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    cwd: path.join(__dirname, '../../..'),
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: `file:${testDbPath}` }
  });
} catch (e) {
  // If db push fails, tests may still proceed if schema already valid
}
process.env.JWT_SECRET = 'test_secret_123';

// Import Prisma client ONLY AFTER DATABASE_URL and JWT_SECRET are set and schema ensured
// Reuse the application Prisma client to avoid multiple engines
const prisma = require('../../../prisma/client.js');

// Fonction pour nettoyer la base de données
async function cleanupDatabase() {
  // Supprimer dans l'ordre inverse des dépendances
  await prisma.userBlock.deleteMany();
  await prisma.userReport.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.match.deleteMany();
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
