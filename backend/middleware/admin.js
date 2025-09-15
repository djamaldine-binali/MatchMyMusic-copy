const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const adminMiddleware = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token d\'authentification requis' 
      });
    }
    
    // Vérifier si l'utilisateur est admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true }
    });
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès administrateur requis' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur de vérification admin' 
    });
  }
};

module.exports = { adminMiddleware }; 