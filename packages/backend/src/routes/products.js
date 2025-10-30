const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireBasicAccess, requireFullAccess } = require('../middleware/subscription');
const { businessAndOwner } = require('../middleware/roleCheck');
const productController = require('../controllers/productController');

// Todas las rutas de productos requieren autenticación
router.use(authenticateToken);

// Rutas especiales primero (antes de rutas con parámetros)
router.get('/categories', requireBasicAccess, productController.getCategories);
router.post('/bulk-initial-stock', requireFullAccess, businessAndOwner, productController.bulkInitialStock);

// CRUD básico de productos
router.get('/', requireBasicAccess, productController.getProducts);
router.post('/', requireFullAccess, businessAndOwner, productController.createProduct);
router.get('/:id', requireBasicAccess, productController.getProductById);
router.put('/:id', requireFullAccess, businessAndOwner, productController.updateProduct);
router.delete('/:id', requireFullAccess, businessAndOwner, productController.deleteProduct);

// Movimientos de inventario (implementaremos después)
router.get('/:id/movements', requireBasicAccess, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de movimientos de inventario pendiente de implementación'
  });
});

router.post('/:id/movements', requireFullAccess, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de crear movimiento de inventario pendiente de implementación'
  });
});

module.exports = router;