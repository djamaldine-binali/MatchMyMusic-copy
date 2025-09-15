const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.js');
const { 
  reportUser, 
  getAllReportsGrouped, 
  getReportsByUser, 
  updateReportStatus, 
  deleteReport, 
  getReportStats 
} = require('../controllers/reportController.js');

router.post('/', authMiddleware, reportUser);
router.get('/admin/all', authMiddleware, getAllReportsGrouped);
router.get('/admin/user/:userId', authMiddleware, getReportsByUser);
router.patch('/admin/:reportId/status', authMiddleware, updateReportStatus);
router.delete('/admin/:reportId', authMiddleware, deleteReport);
router.get('/admin/stats', authMiddleware, getReportStats);

module.exports = router; 