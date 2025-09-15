const notificationService = require('../services/notificationService.js');

// Obtenir les notifications de l'utilisateur connecté
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, pageSize = 20, unreadOnly = false } = req.query;
    
    const result = await notificationService.getUserNotifications(
      userId,
      parseInt(page),
      parseInt(pageSize),
      unreadOnly === 'true'
    );
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error in getUserNotifications controller:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des notifications'
    });
  }
};

// Marquer une notification comme lue
const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.params;
    
    const result = await notificationService.markNotificationAsRead(
      parseInt(notificationId),
      userId
    );
    
    res.json({
      success: true,
      message: 'Notification marquée comme lue',
      notification: result
    });
  } catch (error) {
    console.error('Error in markNotificationAsRead controller:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors de la mise à jour de la notification'
    });
  }
};

// Marquer toutes les notifications comme lues
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    
    await notificationService.markAllNotificationsAsRead(userId);
    
    res.json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead controller:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour des notifications'
    });
  }
};

// Supprimer une notification
const deleteNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.params;
    
    await notificationService.deleteNotification(
      parseInt(notificationId),
      userId
    );
    
    res.json({
      success: true,
      message: 'Notification supprimée avec succès'
    });
  } catch (error) {
    console.error('Error in deleteNotification controller:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors de la suppression de la notification'
    });
  }
};

// Supprimer toutes les notifications lues
const deleteReadNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    
    await notificationService.deleteReadNotifications(userId);
    
    res.json({
      success: true,
      message: 'Toutes les notifications lues ont été supprimées'
    });
  } catch (error) {
    console.error('Error in deleteReadNotifications controller:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression des notifications'
    });
  }
};

// Obtenir le nombre de notifications non lues
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;
    
    const count = await notificationService.getUnreadCount(userId);
    
    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Error in getUnreadCount controller:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du nombre de notifications'
    });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
  getUnreadCount
}; 