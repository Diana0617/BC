const { Business } = require('../models');

/**
 * Middleware para validar que el subdominio coincida con el businessId del JWT
 * PREPARADO PARA PRODUCCIÓN - Actualmente deshabilitado
 * 
 * Para activar:
 * 1. Descomentar en las rutas que lo necesiten
 * 2. Configurar DNS wildcard (*.beautycontrol.com)
 * 3. Configurar certificados SSL wildcard
 * 4. Actualizar CORS para múltiples subdominios
 */
const validateSubdomain = async (req, res, next) => {
  try {
    // TODO: Remover esta línea cuando se active en producción
    if (process.env.SUBDOMAIN_VALIDATION !== 'true') {
      return next(); // Bypass por ahora
    }

    const host = req.get('host') || '';
    const subdomain = host.split('.')[0];
    const { businessId } = req.user;

    // Si es localhost o no hay subdominio, permitir (desarrollo)
    if (host.includes('localhost') || host.includes('127.0.0.1') || !subdomain) {
      return next();
    }

    // Si es el dominio principal (app.beautycontrol.com), permitir
    if (subdomain === 'app' || subdomain === 'www') {
      return next();
    }

    // Validar que el subdominio pertenece al negocio autenticado
    const business = await Business.findOne({
      where: { 
        id: businessId,
        subdomain: subdomain,
        status: ['ACTIVE', 'TRIAL']
      }
    });

    if (!business) {
      return res.status(403).json({
        success: false,
        error: 'El subdominio no corresponde a tu negocio',
        details: {
          subdomain,
          businessId,
          suggestion: `Accede desde https://${business?.subdomain || 'app'}.beautycontrol.com`
        }
      });
    }

    // Agregar información del subdominio al request
    req.subdomain = {
      name: subdomain,
      validated: true,
      business
    };

    next();
  } catch (error) {
    console.error('Error en validación de subdominio:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para extraer subdominio sin validar (para logging/analytics)
 */
const extractSubdomain = (req, res, next) => {
  const host = req.get('host') || '';
  const subdomain = host.split('.')[0];
  
  req.subdomain = {
    name: subdomain,
    validated: false,
    isLocalhost: host.includes('localhost') || host.includes('127.0.0.1')
  };
  
  next();
};

/**
 * Utilidad para generar subdominio sugerido basado en el nombre del negocio
 */
const generateSubdomain = (businessName) => {
  return businessName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '')    // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-')            // Espacios a guiones
    .replace(/-+/g, '-')             // Múltiples guiones a uno
    .replace(/^-|-$/g, '')           // Remover guiones al inicio/final
    .substring(0, 30);               // Máximo 30 caracteres
};

/**
 * Validar si un subdominio está disponible
 */
const isSubdomainAvailable = async (subdomain) => {
  const reservedSubdomains = [
    'www', 'api', 'admin', 'app', 'mail', 'ftp', 'test', 'dev', 
    'staging', 'prod', 'cdn', 'static', 'assets', 'blog', 'help',
    'support', 'docs', 'status', 'monitoring'
  ];

  // Verificar si está en la lista de reservados
  if (reservedSubdomains.includes(subdomain.toLowerCase())) {
    return false;
  }

  // Verificar si ya existe en la base de datos
  const existingBusiness = await Business.findOne({
    where: { subdomain }
  });

  return !existingBusiness;
};

module.exports = {
  validateSubdomain,
  extractSubdomain,
  generateSubdomain,
  isSubdomainAvailable
};