const jwt = require('jsonwebtoken');
const { User, Business } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Token de acceso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({
      where: { 
        id: decoded.userId,
        status: 'ACTIVE'
      },
      include: [{
        model: Business,
        as: 'business',
        attributes: ['id', 'name', 'status']
      }]
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Token inválido o usuario no encontrado' 
      });
    }

    // Verificar que el negocio esté activo (excepto para OWNER)
    if (user.role !== 'OWNER' && user.business && !['ACTIVE', 'TRIAL'].includes(user.business.status)) {
      return res.status(403).json({ 
        success: false,
        error: 'Negocio inactivo o suspendido' 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.businessId,
      business: user.business
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token inválido' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expirado' 
      });
    }

    console.error('Error en autenticación:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = authMiddleware;