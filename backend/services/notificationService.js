const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Créer une notification
async function createNotification(userId, type, title, message, data = null) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null
      }
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Créer une notification de nouveau match
async function createNewMatchNotification(userId, matchData) {
  try {
    const title = 'Nouveau match ! 🎉';
    const message = `Vous avez un nouveau match avec ${matchData.username} ! Découvrez vos goûts musicaux en commun.`;
    
    return await createNotification(userId, 'new_match', title, message, {
      matchId: matchData.matchId,
      matchedUserId: matchData.userId,
      username: matchData.username,
      score: matchData.matchScore
    });
  } catch (error) {
    console.error('Error creating new match notification:', error);
    throw error;
  }
}

// Créer une notification de nouveau message
async function createNewMessageNotification(userId, messageData) {
  try {
    const title = 'Nouveau message 💬';
    const message = `${messageData.senderUsername} vous a envoyé un message.`;
    
    return await createNotification(userId, 'new_message', title, message, {
      conversationId: messageData.conversationId,
      senderId: messageData.senderId,
      senderUsername: messageData.senderUsername
    });
  } catch (error) {
    console.error('Error creating new message notification:', error);
    throw error;
  }
}

// Créer une notification de signalement d'utilisateur
async function createUserReportNotification(userId, reportData) {
  try {
    const title = reportData.isFirstReport 
      ? 'Nouveau signalement d\'utilisateur ⚠️'
      : `Nouveau signalement pour ${reportData.reportedUsername} ⚠️`;
    
    const message = reportData.isFirstReport
      ? `L'utilisateur ${reportData.reportedUsername} a été signalé pour la première fois. Raison: ${reportData.reason}`
      : `L'utilisateur ${reportData.reportedUsername} a reçu un nouveau signalement (${reportData.totalReports} au total). Raison: ${reportData.reason}`;
    
    return await createNotification(userId, 'user_report', title, message, {
      reportedUserId: reportData.reportedUserId,
      reportedUsername: reportData.reportedUsername,
      reason: reportData.reason,
      description: reportData.description,
      totalReports: reportData.totalReports,
      isFirstReport: reportData.isFirstReport,
      actionType: 'navigate_to_reports',
      targetPage: '/admin',
      targetTab: 'reports'
    });
  } catch (error) {
    console.error('Error creating user report notification:', error);
    throw error;
  }
}

// Obtenir les notifications d'un utilisateur
async function getUserNotifications(userId, page = 1, pageSize = 20, unreadOnly = false) {
  try {
    const skip = (page - 1) * pageSize;
    
    const where = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.notification.count({ where })
    ]);

    return { notifications, total, page, pageSize };
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
}

// Marquer une notification comme lue
async function markNotificationAsRead(notificationId, userId) {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: userId // Sécurité : vérifier que l'utilisateur possède la notification
      },
      data: { isRead: true }
    });

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Marquer toutes les notifications d'un utilisateur comme lues
async function markAllNotificationsAsRead(userId) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

// Supprimer une notification
async function deleteNotification(notificationId, userId) {
  try {
    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: userId // Sécurité : vérifier que l'utilisateur possède la notification
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

// Supprimer toutes les notifications lues d'un utilisateur
async function deleteReadNotifications(userId) {
  try {
    await prisma.notification.deleteMany({
      where: { userId, isRead: true }
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    throw error;
  }
}

// Obtenir le nombre de notifications non lues
async function getUnreadCount(userId) {
  try {
    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
}

module.exports = {
  createNotification,
  createNewMatchNotification,
  createNewMessageNotification,
  createUserReportNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
  getUnreadCount
}; 