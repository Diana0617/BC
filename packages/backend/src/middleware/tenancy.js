const { Business } = require('../models');

const tenancyMiddleware = async (req, res, next) => {
  try {
    const { businessId, role } = req.user;
    
    // Para el rol OWNER, no aplicar filtrado de tenancy
    if (role === 'OWNER') {
      req.tenancy = {
        businessId: null,
        business: null,
        isOwner: true,
        addFilter: (where = {}) => where // No agregar filtro
      };
      return next();
    }

    // Para otros roles, verificar acceso al negocio
    if (!businessId) {
      return res.status(403).json({ 
        success: false,
        error: 'No tienes acceso a ningún negocio' 
      });
    }

    // Validar que el negocio existe (permitir acceso incluso con trial expirado)
    const business = await Business.findOne({
      where: { 
        id: businessId
      }
    });

    if (!business) {
      return res.status(403).json({ 
        success: false,
        error: 'Negocio no encontrado' 
      });
    }

    // Advertir si el negocio está inactivo (pero permitir acceso de solo lectura)
    if (business.status === 'INACTIVE' || business.status === 'SUSPENDED') {
      console.warn(`⚠️ Acceso a negocio ${businessId} con status: ${business.status}`);
    }

    // Agregar filtro de tenancy a todas las queries
    req.tenancy = {
      businessId,
      business,
      isOwner: false,
      addFilter: (where = {}) => ({ ...where, businessId })
    };

    next();
  } catch (error) {
    console.error('Error en tenancy middleware:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error de validación de tenancy' 
    });
  }
};

module.exports = tenancyMiddleware;