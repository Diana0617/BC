const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
// const tenancyMiddleware = require('../middleware/tenancy');
 const { allStaffRoles, businessAndOwner } = require('../middleware/roleCheck');

// Todas las rutas de productos requieren autenticación
router.use(authenticateToken);
// router.use(tenancyMiddleware);
// router.use(allStaffRoles);

// Obtener lista de productos
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener productos aún no implementada'
  });
});

// Crear nuevo producto
router.post('/', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de crear producto aún no implementada'
  });
});

// Obtener producto por ID
router.get('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener producto por ID aún no implementada'
  });
});

// Actualizar producto
router.put('/:id', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de actualizar producto aún no implementada'
  });
});

// Eliminar producto
router.delete('/:id', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de eliminar producto aún no implementada'
  });
});

// Obtener categorías de productos
router.get('/categories', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de categorías de productos aún no implementada'
  });
});

// Obtener movimientos de inventario
router.get('/:id/movements', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de movimientos de inventario aún no implementada'
  });
});

// Crear movimiento de inventario
router.post('/:id/movements', /* businessAndOwner, */ (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de crear movimiento de inventario aún no implementada'
  });
});

module.exports = router;

// Obtener lista de productos
router.get('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener productos aún no implementada'
  });
});

// Crear nuevo producto
router.post('/', businessAndOwner, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de crear producto aún no implementada'
  });
});

// Obtener producto por ID
router.get('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener producto por ID aún no implementada'
  });
});

// Actualizar producto
router.put('/:id', businessAndOwner, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de actualizar producto aún no implementada'
  });
});

// Eliminar producto
router.delete('/:id', businessAndOwner, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de eliminar producto aún no implementada'
  });
});

// Obtener movimientos de inventario
router.get('/:id/movements', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de movimientos de inventario aún no implementada'
  });
});

// Registrar movimiento de inventario
router.post('/:id/movements', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de registrar movimiento de inventario aún no implementada'
  });
});

module.exports = router;