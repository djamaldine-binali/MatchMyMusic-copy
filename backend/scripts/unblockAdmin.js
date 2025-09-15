const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function unblockAdmin(adminUsername) {
  try {
    console.log(`🔓 Tentative de déblocage de l'admin: ${adminUsername}`);
    
    // Trouver l'admin par son nom d'utilisateur
    const admin = await prisma.user.findUnique({
      where: { username: adminUsername },
      select: { id: true, username: true, isAdmin: true }
    });

    if (!admin) {
      console.log('❌ Admin non trouvé');
      return;
    }

    if (!admin.isAdmin) {
      console.log('❌ Cet utilisateur n\'est pas admin');
      return;
    }

    console.log(`✅ Admin trouvé: ${admin.username} (ID: ${admin.id})`);

    // Trouver tous les blocages de cet admin
    const blocks = await prisma.userBlock.findMany({
      where: { blockedId: admin.id },
      include: {
        blocker: {
          select: { id: true, username: true }
        }
      }
    });

    if (blocks.length === 0) {
      console.log('✅ Aucun blocage trouvé pour cet admin');
      return;
    }

    console.log(`🔍 ${blocks.length} blocage(s) trouvé(s) pour cet admin`);

    // Supprimer tous les blocages
    for (const block of blocks) {
      console.log(`🗑️  Suppression du blocage de ${block.blocker.username} (ID: ${block.blocker.id})`);
      await prisma.userBlock.delete({
        where: { id: block.id }
      });
    }

    console.log('✅ Tous les blocages ont été supprimés avec succès !');
    console.log(`🎉 L'admin ${admin.username} est maintenant débloqué !`);

  } catch (error) {
    console.error('❌ Erreur lors du déblocage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Utilisation: node scripts/unblockAdmin.js <nom_admin>
const adminUsername = process.argv[2];

if (!adminUsername) {
  console.log('❌ Usage: node scripts/unblockAdmin.js <nom_admin>');
  console.log('💡 Exemple: node scripts/unblockAdmin.js admin');
  process.exit(1);
}

unblockAdmin(adminUsername); 