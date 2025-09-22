const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireBasicAccess, requireFullAccess } = require('../middleware/subscription');
const ServiceController = require('../controllers/ServiceController');
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
router.post('/', requireFullAccess, /* businessAndOwner, */ ServiceController.createService);

// Obtener servicio por ID (acceso básico)
router.get('/:id', requireBasicAccess, ServiceController.getServiceById);

// Actualizar servicio
router.put('/:id', requireFullAccess, /* businessAndOwner, */ ServiceController.updateService);

// Eliminar servicio
router.delete('/:id', requireFullAccess, /* businessAndOwner, */ ServiceController.deleteService);

module.exports = router;
