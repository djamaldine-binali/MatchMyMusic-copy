const reportService = require('../services/reportService.js');

// Signaler un utilisateur
const reportUser = async (req, res) => {
  try {
    const { reportedId, reason, description } = req.body;
    const reporterId = req.userId;

    if (!reportedId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'reportedId et reason sont requis'
      });
    }

    const report = await reportService.reportUser(reporterId, reportedId, reason, description);
    
    res.json({
      success: true,
      message: 'Utilisateur signalé avec succès',
      report
    });
  } catch (error) {
    console.error('Error in reportUser controller:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors du signalement'
    });
  }
};

// Obtenir tous les signalements groupés par utilisateur signalé (admin seulement)
const getAllReportsGrouped = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé. Admin requis.'
      });
    }

    const { page = 1, pageSize = 20 } = req.query;
    const result = await reportService.getAllReportsGrouped(parseInt(page), parseInt(pageSize));
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error in getAllReportsGrouped controller:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des signalements'
    });
  }
};

// Obtenir les signalements d'un utilisateur spécifique (admin seulement)
const getReportsByUser = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé. Admin requis.'
      });
    }

    const { userId } = req.params;
    const reports = await reportService.getReportsByUser(parseInt(userId));
    
    res.json({
      success: true,
      reports
    });
  } catch (error) {
    console.error('Error in getReportsByUser controller:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des signalements'
    });
  }
};

// Mettre à jour le statut d'un signalement (admin seulement)
const updateReportStatus = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé. Admin requis.'
      });
    }

    const { reportId } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'status est requis'
      });
    }

    const report = await reportService.updateReportStatus(parseInt(reportId), status, adminNotes);
    
    res.json({
      success: true,
      message: 'Statut du signalement mis à jour',
      report
    });
  } catch (error) {
    console.error('Error in updateReportStatus controller:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors de la mise à jour'
    });
  }
};

// Supprimer un signalement (admin seulement)
const deleteReport = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé. Admin requis.'
      });
    }

    const { reportId } = req.params;
    await reportService.deleteReport(parseInt(reportId));
    
    res.json({
      success: true,
      message: 'Signalement supprimé avec succès'
    });
  } catch (error) {
    console.error('Error in deleteReport controller:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Erreur lors de la suppression'
    });
  }
};

// Obtenir les statistiques des signalements (admin seulement)
const getReportStats = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé. Admin requis.'
      });
    }

    const stats = await reportService.getReportStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error in getReportStats controller:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  reportUser,
  getAllReportsGrouped,
  getReportsByUser,
  updateReportStatus,
  deleteReport,
  getReportStats
}; 