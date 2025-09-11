const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
// const tenancyMiddleware = require('../middleware/tenancy');
// const { allStaffRoles } = require('../middleware/roleCheck');

// Todas las rutas de clientes requieren autenticación
router.use(authenticateToken);
// router.use(tenancyMiddleware);
// router.use(allStaffRoles);

// Obtener lista de clientes
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener clientes aún no implementada'
  });
});

// Crear nuevo cliente
router.post('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de crear cliente aún no implementada'
  });
});

// Obtener cliente por ID
router.get('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener cliente por ID aún no implementada'
  });
});

// Actualizar cliente
router.put('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de actualizar cliente aún no implementada'
  });
});

// Eliminar cliente
router.delete('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de eliminar cliente aún no implementada'
  });
});

// Obtener historial del cliente
router.get('/:id/history', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de historial del cliente aún no implementada'
  });
});

module.exports = router;