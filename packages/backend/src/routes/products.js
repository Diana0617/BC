const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireBasicAccess, requireFullAccess } = require('../middleware/subscription');
const { businessAndOwner } = require('../middleware/roleCheck');
const productController = require('../controllers/productController');
const { uploadImageMiddleware } = require('../config/cloudinary');

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

// Rutas de imágenes de productos
router.post('/:id/images', 
  requireFullAccess, 
  businessAndOwner, 
  uploadImageMiddleware.single('image'), 
  productController.uploadProductImage
);

router.delete('/:id/images/:imageIndex', 
  requireFullAccess, 
  businessAndOwner, 
  productController.deleteProductImage
);

// Movimientos de inventario
router.get('/:id/movements', requireBasicAccess, productController.getProductMovements);

module.exports = router;