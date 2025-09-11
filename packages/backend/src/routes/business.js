const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const tenancyMiddleware = require('../middleware/tenancy');
const { ownerOnly, businessAndOwner } = require('../middleware/roleCheck');

// Todas las rutas de business requieren autenticación
router.use(authMiddleware);
router.use(tenancyMiddleware);

// Obtener información del negocio
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener negocio aún no implementada'
  });
});

// Actualizar información del negocio
router.put('/', businessAndOwner, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de actualizar negocio aún no implementada'
  });
});

// Obtener reglas del negocio
router.get('/rules', (req, res) => {
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
router.get('/stats', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de estadísticas del negocio aún no implementada'
  });
});

module.exports = router;