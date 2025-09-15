const matchService = require('../services/matchService.js');

const getMatches = async (req, res) => {
  try {
    const userId = req.userId;
    const matches = await matchService.findMatchesForUser(userId, 10);
    
    res.json({
      success: true,
      matches: matches
    });
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des matches'
    });
  }
};

const getMatchDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { matchedUserId } = req.params;
    
    if (!matchedUserId) {
      return res.status(400).json({
        success: false,
        error: 'ID de l\'utilisateur matché requis'
      });
    }

    const details = await matchService.getMatchDetails(userId, parseInt(matchedUserId));
    
    res.json({
      success: true,
      details: details
    });
  } catch (error) {
    console.error('Error getting match details:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des détails du match'
    });
  }
};

module.exports = {
  getMatches,
  getMatchDetails
}; 