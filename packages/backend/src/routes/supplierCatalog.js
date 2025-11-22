const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireBasicAccess, requireFullAccess } = require('../middleware/subscription');
const { businessAndOwner } = require('../middleware/roleCheck');
const { uploadImageMiddleware } = require('../config/cloudinary');
const SupplierCatalogController = require('../controllers/SupplierCatalogController');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

/**
 * @swagger
 * /api/business/{businessId}/supplier-catalog:
 *   get:
 *     summary: Obtener catálogo de productos de proveedores
 *     tags: [Supplier Catalog]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: supplierId
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Catálogo obtenido exitosamente
 */
router.get('/:businessId/supplier-catalog', 
  requireBasicAccess, 
  SupplierCatalogController.getCatalog
);

/**
 * @swagger
 * /api/business/{businessId}/supplier-catalog/categories:
 *   get:
 *     summary: Obtener categorías del catálogo
 *     tags: [Supplier Catalog]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categorías obtenidas exitosamente
 */
router.get('/:businessId/supplier-catalog/categories', 
  requireBasicAccess, 
  SupplierCatalogController.getCategories
);

/**
 * @swagger
 * /api/business/{businessId}/supplier-catalog/suppliers:
 *   get:
 *     summary: Obtener lista de proveedores
 *     tags: [Supplier Catalog]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proveedores obtenidos exitosamente
 */
router.get('/:businessId/supplier-catalog/suppliers', 
  requireBasicAccess, 
  SupplierCatalogController.getSuppliers
);

/**
 * @swagger
 * /api/business/{businessId}/supplier-catalog/pdf:
 *   get:
 *     summary: Generar PDF del catálogo
 *     tags: [Supplier Catalog]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: supplierId
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF generado exitosamente
 */
router.get('/:businessId/supplier-catalog/pdf', 
  requireBasicAccess, 
  SupplierCatalogController.generatePDF
);

/**
 * @swagger
 * /api/business/{businessId}/supplier-catalog/{id}/images:
 *   post:
 *     summary: Subir imagen a item del catálogo
 *     tags: [Supplier Catalog]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente
 */
router.post('/:businessId/supplier-catalog/:id/images', 
  requireFullAccess,
  businessAndOwner,
  uploadImageMiddleware.single('image'),
  SupplierCatalogController.uploadImage
);

/**
 * @swagger
 * /api/business/{businessId}/supplier-catalog/{id}/images/{imageIndex}:
 *   delete:
 *     summary: Eliminar imagen de item del catálogo
 *     tags: [Supplier Catalog]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: imageIndex
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Imagen eliminada exitosamente
 */
router.delete('/:businessId/supplier-catalog/:id/images/:imageIndex', 
  requireFullAccess,
  businessAndOwner,
  SupplierCatalogController.deleteImage
);

module.exports = router;
