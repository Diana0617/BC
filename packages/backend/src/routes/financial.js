const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
// const tenancyMiddleware = require('../middleware/tenancy');
// const { allStaffRoles, businessAndOwner } = require('../middleware/roleCheck');

// Todas las rutas financieras requieren autenticación
router.use(authenticateToken);
// router.use(tenancyMiddleware);
// router.use(allStaffRoles);

// Obtener resumen financiero
router.get('/summary', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de resumen financiero aún no implementada'
  });
});

// Obtener movimientos financieros
router.get('/movements', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de movimientos financieros aún no implementada'
  });
});

// Registrar movimiento financiero
router.post('/movements', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de registrar movimiento financiero aún no implementada'
  });
});

// Obtener reportes financieros
router.get('/reports', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de reportes financieros aún no implementada'
  });
});

// Obtener balance del negocio
router.get('/balance', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de balance del negocio aún no implementada'
  });
});

// Configurar integraciones de pago
router.get('/payment-integrations', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de integraciones de pago aún no implementada'
  });
});

router.post('/payment-integrations', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de crear integración de pago aún no implementada'
  });
});

module.exports = router;