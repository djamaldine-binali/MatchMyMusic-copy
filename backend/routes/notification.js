const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.js');
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
  getUnreadCount
} = require('../controllers/notificationController.js');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Obtenir les notifications de l'utilisateur
router.get('/', getUserNotifications);

// Obtenir le nombre de notifications non lues
router.get('/unread-count', getUnreadCount);

// Marquer une notification comme lue
router.patch('/:notificationId/read', markNotificationAsRead);

// Marquer toutes les notifications comme lues
router.patch('/mark-all-read', markAllNotificationsAsRead);

// Supprimer une notification
router.delete('/:notificationId', deleteNotification);

// Supprimer toutes les notifications lues
router.delete('/read', deleteReadNotifications);

module.exports = router; 