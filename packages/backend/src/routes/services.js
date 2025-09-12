const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireBasicAccess, requireFullAccess } = require('../middleware/subscription');
// const tenancyMiddleware = require('../middleware/tenancy');
// const { allStaffRoles, businessAndOwner } = require('../middleware/roleCheck');

// Todas las rutas de servicios requieren autenticación
router.use(authenticateToken);
// router.use(tenancyMiddleware);
// router.use(allStaffRoles);

// Obtener lista de servicios (acceso básico)
router.get('/', requireBasicAccess, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener servicios aún no implementada'
  });
});

// Crear nuevo servicio (requiere acceso completo)
router.post('/', requireFullAccess, /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de crear servicio aún no implementada'
  });
});

// Obtener servicio por ID (acceso básico)
router.get('/:id', requireBasicAccess, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener servicio por ID aún no implementada'
  });
});

// Actualizar servicio
router.put('/:id', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de actualizar servicio aún no implementada'
  });
});

// Eliminar servicio
router.delete('/:id', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de eliminar servicio aún no implementada'
  });
});

// Obtener categorías de servicios
router.get('/categories', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de categorías de servicios aún no implementada'
  });
});

module.exports = router;