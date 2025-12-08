const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../middleware/auth');
const { requireBasicAccess } = require('../middleware/subscription');
const CloudinaryController = require('../controllers/CloudinaryController');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Asegurar que exista la carpeta de uploads temporales
const ensureUploadDir = async () => {
  const uploadDir = path.join(__dirname, '../../uploads/temp');
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

ensureUploadDir().catch(console.error);

// Configuración de multer para almacenamiento temporal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para PDFs e imágenes
const invoiceFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF o imágenes (JPG, PNG, WEBP)'), false);
  }
};

// Filtro solo para imágenes
const imageFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'), false);
  }
};

const uploadInvoiceMiddleware = multer({
  storage: storage,
  fileFilter: invoiceFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

const uploadProductImageMiddleware = multer({
  storage: multer.memoryStorage(), // Para product images usamos memoria
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Todas las rutas requieren autenticación y acceso básico
router.use(authenticateToken);
router.use(requireBasicAccess);

/**
 * POST /api/business/:businessId/upload/invoice
 * Subir archivo de factura (PDF o imagen)
 */
router.post(
  '/invoice',
  uploadInvoiceMiddleware.single('file'),
  CloudinaryController.uploadInvoiceFile
);

/**
 * POST /api/business/:businessId/upload/product-image
 * Subir imagen de producto (para facturas de proveedor)
 */
router.post(
  '/product-image',
  uploadProductImageMiddleware.single('file'),
  CloudinaryController.uploadProductImage
);

/**
 * DELETE /api/business/:businessId/upload/file
 * Eliminar archivo de Cloudinary
 */
router.delete(
  '/file',
  CloudinaryController.deleteFile
);

module.exports = router;
