require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const email = process.env.INIT_ADMIN_EMAIL;
    const password = process.env.INIT_ADMIN_PASSWORD;
    const username = process.env.INIT_ADMIN_USERNAME || 'admin';

    if (!email || !password) {
      console.error('INIT_ADMIN_EMAIL et INIT_ADMIN_PASSWORD sont requis');
      process.exit(1);
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const hashed = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashed,
          isAdmin: true
        }
      });
      console.log(`✅ Utilisateur admin créé: ${email}`);
    } else if (!user.isAdmin) {
      await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
      console.log(`✅ Utilisateur promu admin: ${email}`);
    } else {
      console.log('ℹ️ Cet utilisateur est déjà admin.');
    }
  } catch (e) {
    console.error('Erreur seed admin:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 