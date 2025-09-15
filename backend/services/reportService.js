const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Signaler un utilisateur
async function reportUser(reporterId, reportedId, reason, description = null) {
  try {
    // Vérifier si l'utilisateur a déjà signalé cet utilisateur
    const existingReport = await prisma.userReport.findUnique({
      where: {
        reporterId_reportedId: {
          reporterId: reporterId,
          reportedId: reportedId
        }
      }
    });

    if (existingReport) {
      throw new Error('Vous avez déjà signalé cet utilisateur');
    }

    // Générer un groupId unique basé sur l'utilisateur signalé
    const groupId = `report_${reportedId}_${Date.now()}`;

    // Créer le signalement
    const report = await prisma.userReport.create({
      data: {
        reporterId,
        reportedId,
        reason,
        description,
        groupId
      }
    });

    // Créer une notification pour les admins à chaque signalement
    await createAdminNotificationForReport(reportedId, reason, description);

    return report;
  } catch (error) {
    console.error('Error reporting user:', error);
    throw error;
  }
}

// Créer une notification pour les admins lors d'un signalement
async function createAdminNotificationForReport(reportedUserId, reason, description = null) {
  try {
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedUserId },
      select: { username: true }
    });

    if (!reportedUser) return;

    // Récupérer tous les admins
    const admins = await prisma.user.findMany({
      where: { isAdmin: true, isDeleted: false },
      select: { id: true }
    });

    // Compter le nombre total de signalements pour cet utilisateur
    const totalReports = await prisma.userReport.count({
      where: { reportedId: reportedUserId }
    });

    // Créer une notification pour chaque admin
    const notificationService = require('./notificationService.js');
    
    for (const admin of admins) {
      await notificationService.createUserReportNotification(admin.id, {
        reportedUserId: reportedUserId,
        reportedUsername: reportedUser.username,
        reason: reason,
        description: description,
        totalReports: totalReports,
        isFirstReport: totalReports === 1
      });
    }
  } catch (error) {
    console.error('Error creating admin notification for report:', error);
  }
}

// Obtenir tous les signalements groupés par utilisateur signalé
async function getAllReportsGrouped(page = 1, pageSize = 20) {
  try {
    const skip = (page - 1) * pageSize;
    
    // Récupérer tous les utilisateurs signalés uniques
    const reportedUsers = await prisma.userReport.groupBy({
      by: ['reportedId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      skip,
      take: pageSize
    });

    // Récupérer les détails pour chaque utilisateur signalé
    const reportsWithDetails = await Promise.all(
      reportedUsers.map(async (reportedUser) => {
        const reports = await prisma.userReport.findMany({
          where: { reportedId: reportedUser.reportedId },
          include: {
            reporter: { select: { username: true } },
            reported: { select: { username: true, isDeleted: true } }
          },
          orderBy: { createdAt: 'desc' }
        });

        const latestReport = reports[0];
        const totalReports = reportedUser._count.id;

        return {
          reportedUserId: reportedUser.reportedId,
          reportedUsername: latestReport.reported.username,
          isDeleted: latestReport.reported.isDeleted,
          totalReports,
          latestReport: {
            id: latestReport.id,
            reason: latestReport.reason,
            status: latestReport.status,
            createdAt: latestReport.createdAt,
            adminNotes: latestReport.adminNotes
          },
          allReports: reports.map(report => ({
            id: report.id,
            reason: report.reason,
            description: report.description,
            status: report.status,
            createdAt: report.createdAt,
            reporterUsername: report.reporter.username
          }))
        };
      })
    );

    const total = await prisma.userReport.groupBy({
      by: ['reportedId']
    });

    return {
      reports: reportsWithDetails,
      total: total.length,
      page,
      pageSize
    };
  } catch (error) {
    console.error('Error getting grouped reports:', error);
    throw error;
  }
}

// Obtenir les signalements d'un utilisateur spécifique
async function getReportsByUser(reportedUserId) {
  try {
    const reports = await prisma.userReport.findMany({
      where: { reportedId: reportedUserId },
      include: {
        reporter: { select: { username: true } },
        reported: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reports;
  } catch (error) {
    console.error('Error getting reports by user:', error);
    throw error;
  }
}

// Mettre à jour le statut d'un signalement
async function updateReportStatus(reportId, status, adminNotes = null) {
  try {
    const report = await prisma.userReport.update({
      where: { id: reportId },
      data: { status, adminNotes }
    });

    return report;
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
}

// Supprimer un signalement
async function deleteReport(reportId) {
  try {
    await prisma.userReport.delete({
      where: { id: reportId }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
}

// Obtenir les statistiques des signalements
async function getReportStats() {
  try {
    const [totalReports, pendingReports, resolvedReports, dismissedReports] = await Promise.all([
      prisma.userReport.count(),
      prisma.userReport.count({ where: { status: 'pending' } }),
      prisma.userReport.count({ where: { status: 'resolved' } }),
      prisma.userReport.count({ where: { status: 'dismissed' } })
    ]);

    return {
      totalReports,
      pendingReports,
      resolvedReports,
      dismissedReports
    };
  } catch (error) {
    console.error('Error getting report stats:', error);
    throw error;
  }
}

module.exports = {
  reportUser,
  createAdminNotificationForReport,
  getAllReportsGrouped,
  getReportsByUser,
  updateReportStatus,
  deleteReport,
  getReportStats
}; 