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

// Inicializar la carpeta de uploads
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

// Filtro para comprobantes de gastos (imágenes y PDFs)
const expenseReceiptFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP) y archivos PDF'), false);
  }
};

// Filtro para imágenes generales
const imageFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP)'), false);
  }
};

// Middleware específico para imágenes generales (logos, servicios, etc.)
const uploadImage = multer({ 
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo para imágenes
    files: 1
  }
});

// Middleware específico para comprobantes de gastos
const uploadExpenseReceipt = multer({ 
  storage: storage,
  fileFilter: expenseReceiptFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo para comprobantes
    files: 1 // Solo un archivo por vez
  }
}).single('receipt'); // El campo se llama 'receipt'

// Middleware con manejo de errores
const uploadExpenseReceiptWithErrorHandling = (req, res, next) => {
  uploadExpenseReceipt(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'El archivo es demasiado grande. Tamaño máximo permitido: 10MB'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Solo se permite subir un archivo por vez'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Campo de archivo inesperado. Use el campo "receipt"'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Error en la subida de archivo: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

// Middleware para validar archivos opcionales
const validateOptionalReceipt = (req, res, next) => {
  // Si no hay archivo, continuar normalmente
  if (!req.file) {
    return next();
  }

  // Validaciones adicionales si hay archivo
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({
      success: false,
      message: 'Extensión de archivo no válida. Permitidas: JPG, JPEG, PNG, WebP, PDF'
    });
  }

  // Validar tamaño de contenido
  if (req.file.size === 0) {
    return res.status(400).json({
      success: false,
      message: 'El archivo está vacío'
    });
  }

  next();
};

module.exports = {
  uploadImage, // Middleware genérico para imágenes (sin .single())
  uploadExpenseReceipt: uploadExpenseReceiptWithErrorHandling,
  validateOptionalReceipt
};