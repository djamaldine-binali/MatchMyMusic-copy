require('dotenv').config();

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, isDeleted: true, isAdmin: true }
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }
      
      if (user.isDeleted) {
        return res.status(403).json({ error: 'Compte supprimé' });
      }
      
      req.userId = payload.userId;
      req.isAdmin = user.isAdmin; // Ajouter isAdmin à req
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token invalide' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

module.exports = { authMiddleware };
