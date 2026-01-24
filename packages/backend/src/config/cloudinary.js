const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
require('dotenv').config();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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

// Filtros para diferentes tipos de archivos
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de video'), false);
  }
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

// Filtro general para múltiples tipos de archivos (para evidencias de citas)
const multiFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'video/mp4', 'video/mov', 'video/avi', 'video/quicktime',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes, videos y PDFs'), false);
  }
};

// Middleware de multer
const uploadImageMiddleware = multer({ 
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  }
});

const uploadVideoMiddleware = multer({ 
  storage: storage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  }
});

const uploadPDFMiddleware = multer({ 
  storage: storage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  }
});

// Middleware para múltiples tipos de archivos (evidencias de citas)
const uploadEvidenceMiddleware = multer({ 
  storage: storage,
  fileFilter: multiFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  }
});

// Función para comprimir imágenes grandes antes de subir a Cloudinary
const compressImageIfNeeded = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    // Si el archivo es menor a 8MB, no necesita compresión
    if (fileSizeInMB <= 8) {
      console.log(`📁 Archivo ${fileSizeInMB.toFixed(2)}MB - No requiere compresión`);
      return filePath;
    }
    
    console.log(`📁 Archivo ${fileSizeInMB.toFixed(2)}MB - Comprimiendo...`);
    
    // Crear nombre para archivo comprimido usando rutas seguras
    const dir = path.dirname(filePath);
    const basename = path.basename(filePath, path.extname(filePath));
    const ext = path.extname(filePath);
    const compressedPath = path.join(dir, `${basename}_compressed${ext}`);
    
    // Comprimir imagen manteniendo calidad visual
    await sharp(filePath)
      .resize(2400, 1800, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 80,
        progressive: true
      })
      .toFile(compressedPath);
    
    // Verificar que la compresión funcionó
    const compressedStats = await fs.stat(compressedPath);
    const compressedSizeInMB = compressedStats.size / (1024 * 1024);
    
    console.log(`✅ Compresión exitosa: ${fileSizeInMB.toFixed(2)}MB → ${compressedSizeInMB.toFixed(2)}MB`);
    
    // Eliminar archivo original y retornar el comprimido
    await fs.unlink(filePath);
    return compressedPath;
    
  } catch (error) {
    console.error('❌ Error comprimiendo imagen:', error);
    return filePath;
  }
};

// Función principal para subir imágenes responsivas (optimizada para Beauty Control)
const uploadResponsiveImage = async (filePath, folder = 'beauty-control', subfolder = 'general') => {
  try {
    const optimizedFilePath = await compressImageIfNeeded(filePath);
    
    const fullFolder = `${folder}/${subfolder}`;
    
    // Imagen principal - optimizada para web
    const mainUpload = await cloudinary.uploader.upload(optimizedFilePath, {
      folder: `${fullFolder}/main`,
      transformation: [
        { 
          width: 1920, 
          height: 1080, 
          crop: 'limit',
          quality: 'auto:good', 
          format: 'webp',
          fetch_format: 'auto'
        }
      ],
      public_id_suffix: '_main'
    });

    // Thumbnail para listados y previews
    const thumbnailUpload = await cloudinary.uploader.upload(optimizedFilePath, {
      folder: `${fullFolder}/thumbs`,
      transformation: [
        { 
          width: 400, 
          height: 300, 
          crop: 'fill',
          quality: 'auto:good', 
          format: 'webp',
          gravity: 'center'
        }
      ],
      public_id_suffix: '_thumb'
    });

    // Eliminar archivo temporal
    await fs.unlink(optimizedFilePath);

    return {
      main: {
        url: mainUpload.secure_url,
        public_id: mainUpload.public_id,
        width: mainUpload.width,
        height: mainUpload.height,
      },
      thumbnail: {
        url: thumbnailUpload.secure_url,
        public_id: thumbnailUpload.public_id,
        width: thumbnailUpload.width,
        height: thumbnailUpload.height,
      }
    };
  } catch (error) {
    // Limpiar archivos temporales en caso de error
    try {
      if (optimizedFilePath !== filePath) {
        await fs.unlink(optimizedFilePath);
      }
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error eliminando archivos temporales:', unlinkError);
    }
    throw new Error(`Error uploading responsive images: ${error.message}`);
  }
};

// Función para subir video optimizado
const uploadOptimizedVideo = async (filePath, folder = 'beauty-control', subfolder = 'evidence') => {
  try {
    const fullFolder = `${folder}/${subfolder}/videos`;
    
    const videoUpload = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: fullFolder,
      transformation: [
        {
          quality: 'auto',
          fetch_format: 'auto',
          width: 1920,
          height: 1080,
          crop: 'limit'
        }
      ]
    });

    // Eliminar archivo temporal
    await fs.unlink(filePath);

    return {
      url: videoUpload.secure_url,
      public_id: videoUpload.public_id,
      duration: videoUpload.duration,
      width: videoUpload.width,
      height: videoUpload.height,
      format: videoUpload.format,
      bytes: videoUpload.bytes,
    };
  } catch (error) {
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error eliminando archivo temporal:', unlinkError);
    }
    throw new Error(`Error uploading video: ${error.message}`);
  }
};

// Función para subir PDF (consentimientos, comprobantes)
const uploadDocument = async (filePath, folder = 'beauty-control', subfolder = 'documents') => {
  try {
    const fullFolder = `${folder}/${subfolder}`;
    
    const pdfUpload = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: fullFolder,
    });

    // Eliminar archivo temporal
    await fs.unlink(filePath);

    return {
      url: pdfUpload.secure_url,
      public_id: pdfUpload.public_id,
      format: pdfUpload.format,
      bytes: pdfUpload.bytes,
      original_filename: pdfUpload.original_filename,
    };
  } catch (error) {
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('Error eliminando archivo temporal:', unlinkError);
    }
    throw new Error(`Error uploading document: ${error.message}`);
  }
};

// Función específica para logos de negocios
const uploadBusinessLogo = async (filePath, businessId) => {
  return uploadResponsiveImage(filePath, 'beauty-control', `businesses/${businessId}/logos`);
};

// Función específica para avatares de usuarios
const uploadUserAvatar = async (filePath, userId) => {
  return uploadResponsiveImage(filePath, 'beauty-control', `users/${userId}/avatars`);
};

// Función específica para evidencias de citas
const uploadAppointmentEvidence = async (filePath, appointmentId, type = 'before') => {
  const fileExt = path.extname(filePath).toLowerCase();
  
  if (['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt)) {
    return uploadResponsiveImage(filePath, 'beauty-control', `appointments/${appointmentId}/evidence/${type}`);
  } else if (['.mp4', '.mov', '.avi'].includes(fileExt)) {
    return uploadOptimizedVideo(filePath, 'beauty-control', `appointments/${appointmentId}/evidence/${type}`);
  } else {
    throw new Error('Formato de archivo no soportado para evidencias');
  }
};

// Función específica para consentimientos
const uploadConsentDocument = async (filePath, businessId, signatureId) => {
  return uploadDocument(filePath, 'beauty-control', `businesses/${businessId}/consents/${signatureId}`);
};

// Función específica para imágenes de servicios
const uploadServiceImage = async (filePath, businessId, serviceId) => {
  return uploadResponsiveImage(filePath, 'beauty-control', `businesses/${businessId}/services/${serviceId}`);
};

// Función específica para imágenes de productos
const uploadProductImage = async (filePath, businessId, productId) => {
  return uploadResponsiveImage(filePath, 'beauty-control', `businesses/${businessId}/products/${productId}`);
};

// Función específica para comprobantes de pago del OWNER
const uploadPaymentReceipt = async (filePath, paymentId) => {
  try {
    const fileExt = path.extname(filePath).toLowerCase();
    
    // Verificar si es imagen o documento
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt)) {
      // Para imágenes, usar upload responsive con optimización especial para documentos
      const optimizedFilePath = await compressImageIfNeeded(filePath);
      
      const result = await cloudinary.uploader.upload(optimizedFilePath, {
        folder: `beauty-control/owner/payment-receipts/${paymentId}`,
        transformation: [
          { 
            width: 1200, 
            height: 1600, 
            crop: 'limit',
            quality: 'auto:good', 
            format: 'auto',
            flags: 'preserve_transparency'
          }
        ],
        public_id_suffix: '_receipt'
      });
      
      // Limpiar archivo temporal comprimido si es diferente al original
      if (optimizedFilePath !== filePath) {
        await fs.unlink(optimizedFilePath);
      }
      
      return {
        success: true,
        data: result
      };
      
    } else if (['.pdf', '.doc', '.docx'].includes(fileExt)) {
      // Para documentos PDF/Word, usar upload de documento
      return uploadDocument(filePath, 'beauty-control', `owner/payment-receipts/${paymentId}`);
    } else {
      throw new Error('Formato de archivo no soportado para comprobantes. Use: JPG, PNG, PDF, DOC, DOCX');
    }
    
  } catch (error) {
    console.error('❌ Error subiendo comprobante de pago:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Funciones para eliminar archivos
const deleteResponsiveImages = async (imageData) => {
  try {
    const deletePromises = [];
    
    if (imageData.main?.public_id) {
      deletePromises.push(cloudinary.uploader.destroy(imageData.main.public_id));
    }
    if (imageData.thumbnail?.public_id) {
      deletePromises.push(cloudinary.uploader.destroy(imageData.thumbnail.public_id));
    }
    
    const results = await Promise.all(deletePromises);
    return results;
  } catch (error) {
    throw new Error(`Error deleting responsive images: ${error.message}`);
  }
};

const deleteVideo = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: 'video' 
    });
    return result;
  } catch (error) {
    throw new Error(`Error deleting video: ${error.message}`);
  }
};

const deleteDocument = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: 'raw' 
    });
    return result;
  } catch (error) {
    throw new Error(`Error deleting document: ${error.message}`);
  }
};

// Función para limpiar archivos temporales antiguos (llamar periódicamente)
const cleanupTempFiles = async () => {
  try {
    const tempDir = path.join(__dirname, '../../uploads/temp');
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000); // 1 hora
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime.getTime() < oneHourAgo) {
        await fs.unlink(filePath);
        console.log(`🗑️ Archivo temporal eliminado: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error limpiando archivos temporales:', error);
  }
};

module.exports = {
  cloudinary,
  uploadImageMiddleware,
  uploadVideoMiddleware,
  uploadPDFMiddleware,
  uploadEvidenceMiddleware,
  uploadResponsiveImage,
  uploadOptimizedVideo,
  uploadDocument,
  uploadBusinessLogo,
  uploadUserAvatar,
  uploadAppointmentEvidence,
  uploadConsentDocument,
  uploadServiceImage,
  uploadProductImage,
  uploadPaymentReceipt,
  deleteResponsiveImages,
  deleteVideo,
  deleteDocument,
  cleanupTempFiles
};