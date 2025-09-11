const express = require('express');
const router = express.Router();
const BusinessController = require('../controllers/BusinessController');
const { authenticateToken } = require('../middleware/auth');
const tenancyMiddleware = require('../middleware/tenancy');
const { ownerOnly, businessAndOwner, allStaffRoles } = require('../middleware/roleCheck');

/**
 * Rutas de Negocios - Beauty Control
 * Gestión de negocios, empleados y configuraciones
 */

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// =====================================
// RUTAS PARA CLIENTES (sin tenancy)
// =====================================

// Crear nuevo negocio (solo para CLIENT que pagó)
router.post('/', BusinessController.createBusiness);

// =====================================
// RUTAS PARA STAFF DEL NEGOCIO (con tenancy)
// =====================================

// Aplicar tenancy para las siguientes rutas
router.use(tenancyMiddleware);

// Obtener información del negocio
router.get('/', allStaffRoles, BusinessController.getBusiness);

// Actualizar información del negocio
router.put('/', businessAndOwner, BusinessController.updateBusiness);

// Invitar empleado al negocio
router.post('/invite-employee', businessAndOwner, BusinessController.inviteEmployee);

// Obtener reglas del negocio
router.get('/rules', allStaffRoles, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener reglas del negocio aún no implementada'
  });
});

// Actualizar reglas del negocio
router.put('/rules', businessAndOwner, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de actualizar reglas del negocio aún no implementada'
  });
});

// Obtener estadísticas del negocio
router.get('/stats', allStaffRoles, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de estadísticas del negocio aún no implementada'
  });
});

module.exports = router;