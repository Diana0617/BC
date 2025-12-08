const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireBasicAccess, requireFullAccess } = require('../middleware/subscription');
const { restrictFreePlan } = require('../middleware/planRestrictions');
const ServiceController = require('../controllers/ServiceController');
const { uploadImage } = require('../middleware/uploadMiddleware');
// const tenancyMiddleware = require('../middleware/tenancy');
// const { allStaffRoles, businessAndOwner } = require('../middleware/roleCheck');

// Todas las rutas de servicios requieren autenticación
router.use(authenticateToken);
// router.use(tenancyMiddleware);
// router.use(allStaffRoles);

// Obtener categorías de servicios (debe ir ANTES de /:id para evitar conflictos)
router.get('/categories', requireBasicAccess, ServiceController.getCategories);

// Obtener lista de servicios (acceso básico)
router.get('/', requireBasicAccess, ServiceController.getServices);

// Crear nuevo servicio (requiere acceso completo)
router.post('/', requireFullAccess, restrictFreePlan('SERVICES_LIMIT'), /* businessAndOwner, */ ServiceController.createService);

// Obtener servicio por ID (acceso básico)
router.get('/:id', requireBasicAccess, ServiceController.getServiceById);

// Obtener template de consentimiento del servicio (sin restricción de suscripción - funcionalidad core)
router.get('/:id/consent-template', ServiceController.getConsentTemplate);

// Actualizar servicio
router.put('/:id', requireFullAccess, /* businessAndOwner, */ (req, res, next) => {
  console.log('🔵 ROUTE: PUT /:id middleware');
  console.log('🔵 req.params:', req.params);
  console.log('🔵 req.body:', req.body);
  console.log('🔵 req.user:', req.user);
  next();
}, ServiceController.updateService);

// Subir imagen del servicio
router.post('/:id/upload-image', 
  requireFullAccess,
  uploadImage.single('image'),
  ServiceController.uploadServiceImage
);

// Eliminar servicio
router.delete('/:id', requireFullAccess, /* businessAndOwner, */ ServiceController.deleteService);

module.exports = router;
