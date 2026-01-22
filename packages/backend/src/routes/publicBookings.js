/**
 * 🏨 RUTAS PÚBLICAS PARA BOOKINGS ONLINE
 * Rutas públicas para reservas online (sin autenticación requerida)
 * Permite a clientes consultar servicios, especialistas y disponibilidad, y crear reservas
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const PublicBookingsController = require('../controllers/PublicBookingsController');
const AppointmentPaymentController = require('../controllers/AppointmentPaymentController');
const cloudinary = require('../config/cloudinary').cloudinary;
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Configurar multer para uploads públicos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

const uploadPaymentProof = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

/**
 * @swagger
 * tags:
 *   - name: Public Bookings
 *     description: Rutas públicas para reservas online (sin autenticación)
 */

/**
 * @swagger
 * /api/public/bookings/business/{businessCode}/services:
 *   get:
 *     tags:
 *       - Public Bookings
 *     summary: Consultar servicios disponibles de un negocio
 *     description: Obtiene la lista de servicios activos disponibles para reservas online de un negocio específico
 *     parameters:
 *       - in: path
 *         name: businessCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código único del negocio
 *         example: "BEAUTY001"
 *     responses:
 *       200:
 *         description: Servicios obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Corte de cabello"
 *                       description:
 *                         type: string
 *                         example: "Corte moderno con estilo personalizado"
 *                       duration:
 *                         type: integer
 *                         example: 60
 *                       price:
 *                         type: number
 *                         example: 25000
 *                       category:
 *                         type: string
 *                         example: "CABELLO"
 *       404:
 *         description: Negocio no encontrado o no tiene servicios disponibles
 */
router.get('/business/:businessCode/services', [
  param('businessCode').isString().notEmpty()
], PublicBookingsController.getServices);

/**
 * @swagger
 * /api/public/bookings/business/{businessCode}/specialists:
 *   get:
 *     tags:
 *       - Public Bookings
 *     summary: Consultar especialistas disponibles
 *     description: Obtiene la lista de especialistas activos de un negocio con sus servicios
 *     parameters:
 *       - in: path
 *         name: businessCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código único del negocio
 *         example: "BEAUTY001"
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: integer
 *         description: ID del servicio para filtrar especialistas que lo ofrecen
 *         example: 1
 *     responses:
 *       200:
 *         description: Especialistas obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "María González"
 *                       specialties:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Corte", "Color"]
 *                       services:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             price:
 *                               type: number
 *       404:
 *         description: Negocio no encontrado
 */
router.get('/business/:businessCode/specialists', [
  param('businessCode').isString().notEmpty(),
  query('serviceId').optional().isInt()
], PublicBookingsController.getSpecialists);

/**
 * @swagger
 * /api/public/bookings/business/{businessCode}/availability:
 *   get:
 *     tags:
 *       - Public Bookings
 *     summary: Consultar disponibilidad de slots
 *     description: Obtiene los slots disponibles para un rango de fechas, servicio y especialista opcional
 *     parameters:
 *       - in: path
 *         name: businessCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código único del negocio
 *         example: "BEAUTY001"
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *         example: "2024-01-15"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *         example: "2024-01-20"
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del servicio
 *         example: 1
 *       - in: query
 *         name: specialistId
 *         schema:
 *           type: integer
 *         description: ID del especialista (opcional)
 *         example: 1
 *     responses:
 *       200:
 *         description: Disponibilidad obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-15"
 *                       slots:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             time:
 *                               type: string
 *                               example: "09:00"
 *                             available:
 *                               type: boolean
 *                               example: true
 *                             specialistId:
 *                               type: integer
 *                               example: 1
 *                             specialistName:
 *                               type: string
 *                               example: "María González"
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: Negocio, servicio o especialista no encontrado
 */
router.get('/business/:businessCode/availability', [
  param('businessCode').isString().notEmpty(),
  query('startDate').isDate(),
  query('endDate').isDate(),
  query('serviceId').isInt(),
  query('specialistId').optional().isInt()
], PublicBookingsController.getAvailability);

/**
 * @swagger
 * /api/public/bookings/business/{businessCode}/payment-methods:
 *   get:
 *     tags:
 *       - Public Bookings
 *     summary: Obtener métodos de pago del negocio
 *     description: Obtiene los métodos de pago activos configurados por el negocio
 *     parameters:
 *       - in: path
 *         name: businessCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código único del negocio
 *         example: "lauravargas"
 *     responses:
 *       200:
 *         description: Métodos de pago obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     businessInfo:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         whatsappNumber:
 *                           type: string
 *                     paymentMethods:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Negocio no encontrado
 */
router.get('/business/:businessCode/payment-methods', [
  param('businessCode').isString().notEmpty()
], PublicBookingsController.getPaymentMethods);

/**
 * @swagger
 * /api/public/bookings/business/{businessCode}/payment-info:
 *   get:
 *     tags:
 *       - Public Bookings
 *     summary: [DEPRECATED] Alias para payment-methods
 *     description: Endpoint legacy para compatibilidad con versiones antiguas del frontend
 *     deprecated: true
 */
router.get('/business/:businessCode/payment-info', [
  param('businessCode').isString().notEmpty()
], PublicBookingsController.getPaymentMethods);

/**
 * @swagger
 * /api/public/bookings/business/{businessCode}:
 *   post:
 *     tags:
 *       - Public Bookings
 *     summary: Crear una reserva online
 *     description: Crea una nueva reserva online con validación de disponibilidad y reglas de negocio
 *     parameters:
 *       - in: path
 *         name: businessCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código único del negocio
 *         example: "BEAUTY001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - specialistId
 *               - date
 *               - time
 *               - clientName
 *               - clientEmail
 *               - clientPhone
 *             properties:
 *               serviceId:
 *                 type: integer
 *                 example: 1
 *               specialistId:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               time:
 *                 type: string
 *                 example: "14:30"
 *               clientName:
 *                 type: string
 *                 example: "Juan Pérez"
 *               clientEmail:
 *                 type: string
 *                 format: email
 *                 example: "juan@email.com"
 *               clientPhone:
 *                 type: string
 *                 example: "+573001234567"
 *               notes:
 *                 type: string
 *                 example: "Cliente frecuente, prefiere corte moderno"
 *               paymentMethod:
 *                 type: string
 *                 enum: [WOMPI, BANK_TRANSFER, CASH]
 *                 example: "WOMPI"
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         code:
 *                           type: string
 *                           example: "BK-20240115-001"
 *                         status:
 *                           type: string
 *                           example: "PENDING_PAYMENT"
 *                         totalAmount:
 *                           type: number
 *                           example: 25000
 *                         paymentMethod:
 *                           type: string
 *                           example: "WOMPI"
 *                     paymentUrl:
 *                       type: string
 *                       example: "https://checkout.wompi.co/payment/12345"
 *       400:
 *         description: Datos inválidos o slot no disponible
 *       404:
 *         description: Negocio, servicio o especialista no encontrado
 *       409:
 *         description: Conflicto - slot ya reservado
 */
router.post('/business/:businessCode', [
  param('businessCode').isString().notEmpty(),
  body('serviceId').isUUID(),
  body('specialistId').isUUID(),
  body('branchId').optional().isUUID(),
  body('date').isDate(),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('clientName').isString().notEmpty(),
  body('clientEmail').isEmail(),
  body('clientPhone').isString().notEmpty(),
  body('notes').optional().isString(),
  body('paymentMethod').optional().isUUID()
], PublicBookingsController.createBooking);

/**
 * @swagger
 * /api/public/bookings/business/{businessCode}/upload-proof/{bookingCode}:
 *   post:
 *     tags:
 *       - Public Bookings
 *     summary: Subir comprobante de pago
 *     description: Permite a los clientes subir comprobantes de pago (imágenes o PDF) para reservas con transferencias bancarias
 *     parameters:
 *       - in: path
 *         name: businessCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código único del negocio
 *         example: "BEAUTY001"
 *       - in: path
 *         name: bookingCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código único de la reserva
 *         example: "BK-20240115-001"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               paymentProof:
 *                 type: string
 *                 format: binary
 *                 description: Archivo del comprobante de pago (imagen o PDF)
 *               notes:
 *                 type: string
 *                 description: Notas adicionales sobre el pago
 *     responses:
 *       200:
 *         description: Comprobante subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Comprobante de pago subido exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileUrl:
 *                       type: string
 *                       example: "https://cloudinary.com/..."
 *       400:
 *         description: Datos inválidos o archivo no permitido
 *       404:
 *         description: Reserva no encontrada
 */
router.post('/business/:businessCode/upload-proof/:bookingCode',
  AppointmentPaymentController.getPaymentProofMulter().single('paymentProof'),
  [
    param('businessCode').isString().notEmpty(),
    param('bookingCode').isString().notEmpty()
  ],
  PublicBookingsController.uploadPaymentProof
);

/**
 * @swagger
 * /api/public/bookings/upload-payment-proof:
 *   post:
 *     tags:
 *       - Public Bookings
 *     summary: Subir comprobante de pago antes de crear reserva
 *     description: Permite subir un comprobante de pago a Cloudinary antes de confirmar la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del comprobante de pago
 *               bookingReference:
 *                 type: string
 *                 description: Referencia opcional para nombrar el archivo
 *     responses:
 *       200:
 *         description: Comprobante subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     publicId:
 *                       type: string
 */
router.post('/upload-payment-proof',
  uploadPaymentProof.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      const { bookingReference } = req.body;
      const tempFilePath = req.file.path;

      // Subir a Cloudinary
      const result = await cloudinary.uploader.upload(tempFilePath, {
        folder: 'beauty-control/payment-proofs',
        resource_type: 'image',
        public_id: bookingReference ? `proof_${bookingReference}` : undefined,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'webp' }
        ]
      });

      // Limpiar archivo temporal
      await fs.unlink(tempFilePath);

      return res.status(200).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes
        }
      });

    } catch (error) {
      console.error('❌ Error uploading payment proof:', error);
      
      // Limpiar archivo temporal si existe
      if (req.file?.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting temp file:', unlinkError);
        }
      }

      return res.status(500).json({
        success: false,
        message: 'Error al subir el comprobante',
        error: error.message
      });
    }
  }
);

module.exports = router;