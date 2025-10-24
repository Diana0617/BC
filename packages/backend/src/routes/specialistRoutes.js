const express = require('express');
const { authenticateToken, validateBusinessId, requireSpecialist, requireSpecialistOrReceptionist } = require('../middleware/auth');
const SpecialistController = require('../controllers/SpecialistController');
const AppointmentController = require('../controllers/AppointmentController');
const AppointmentMediaController = require('../controllers/AppointmentMediaController');
const AppointmentPaymentController = require('../controllers/AppointmentPaymentController');
const AppointmentProductController = require('../controllers/AppointmentProductController');
const SpecialistSalesController = require('../controllers/SpecialistSalesController');
const AppointmentAdvancePaymentController = require('../controllers/AppointmentAdvancePaymentController');

const router = express.Router();

// Configurar multer para diferentes tipos de uploads
const evidenceUpload = AppointmentMediaController.getMulterConfig(['image', 'video']);
const consentUpload = AppointmentMediaController.getMulterConfig(['pdf']);
const paymentProofUpload = AppointmentPaymentController.getPaymentProofMulter();

/**
 * @swagger
 * tags:
 *   - name: Specialists
 *     description: Endpoints para especialistas - Agenda personal y gestión
 *   - name: Appointments
 *     description: Gestión de citas para especialistas y recepcionistas
 *   - name: Appointment Media
 *     description: Gestión de evidencias y consentimientos
 *   - name: Appointment Payments
 *     description: Gestión de pagos de citas
 *   - name: Appointment Products
 *     description: Gestión de productos utilizados en procedimientos
 *   - name: Specialist Sales
 *     description: Ventas directas realizadas por especialistas
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     AppointmentStatus:
 *       type: string
 *       enum: [PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELED, NO_SHOW, RESCHEDULED]
 *     PaymentMethod:
 *       type: string
 *       enum: [CASH, CARD, TRANSFER, QR, OTHER]
 *     PaymentStatus:
 *       type: string
 *       enum: [PENDING, PARTIAL, PAID, REFUNDED]
 */

// ==================== RUTAS DE ESPECIALISTAS ====================

/**
 * @swagger
 * /api/specialists/me/appointments:
 *   get:
 *     tags: [Specialists]
 *     summary: Obtener agenda personal del especialista
 *     description: Lista las citas del especialista autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del negocio
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/AppointmentStatus'
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de citas del especialista
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/me/appointments', authenticateToken, validateBusinessId, requireSpecialist, SpecialistController.getMyAppointments);

/**
 * @swagger
 * /api/specialists/me/dashboard/appointments:
 *   get:
 *     tags: [Specialists]
 *     summary: Obtener agenda del especialista para dashboard móvil
 *     description: Endpoint optimizado para la app móvil con toda la información necesaria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha específica (default: hoy)
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         description: Filtrar por sucursal
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Agenda del especialista con estadísticas
 *       401:
 *         description: No autorizado
 */
router.get('/me/dashboard/appointments', authenticateToken, requireSpecialist, AppointmentController.getSpecialistDashboardAppointments);

/**
 * @swagger
 * /api/specialists/me/appointments/{appointmentId}/status:
 *   patch:
 *     tags: [Specialists]
 *     summary: Actualizar estado de cita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, IN_PROGRESS, COMPLETED, NO_SHOW]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 */
router.patch('/me/appointments/:appointmentId/status', authenticateToken, requireSpecialist, SpecialistController.updateAppointmentStatus);

/**
 * @swagger
 * /api/specialists/me/history:
 *   get:
 *     tags: [Specialists]
 *     summary: Obtener historial de procedimientos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de procedimientos completados
 */
router.get('/me/history', authenticateToken, requireSpecialist, SpecialistController.getMyHistory);

/**
 * @swagger
 * /api/specialists/me/commissions:
 *   get:
 *     tags: [Specialists]
 *     summary: Obtener reporte de comisiones
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Reporte de comisiones del especialista
 */
router.get('/me/commissions', authenticateToken, requireSpecialist, SpecialistController.getMyCommissions);

/**
 * @swagger
 * /api/specialists/me/profile:
 *   get:
 *     tags: [Specialists]
 *     summary: Obtener perfil personal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil del especialista
 *   put:
 *     tags: [Specialists]
 *     summary: Actualizar perfil personal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessId:
 *                 type: string
 *               biography:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               phoneExtension:
 *                 type: string
 *               emergencyContact:
 *                 type: object
 *               socialMedia:
 *                 type: object
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 */
router.get('/me/profile', authenticateToken, requireSpecialist, SpecialistController.getMyProfile);
router.put('/me/profile', authenticateToken, requireSpecialist, SpecialistController.updateMyProfile);

// ==================== RUTAS DE CITAS ====================

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Obtener lista de citas
 *     description: Lista citas según el rol (especialista solo las propias, recepcionista todas)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: specialistId
 *         schema:
 *           type: string
 *         description: Solo para recepcionistas - filtrar por especialista específico
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/AppointmentStatus'
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de citas
 *   post:
 *     tags: [Appointments]
 *     summary: Crear nueva cita
 *     description: Solo para recepcionistas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - clientId
 *               - specialistId
 *               - serviceId
 *               - startTime
 *               - endTime
 *             properties:
 *               businessId:
 *                 type: string
 *               clientId:
 *                 type: string
 *               specialistId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *               clientNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 */
router.get('/appointments', authenticateToken, requireSpecialistOrReceptionist, AppointmentController.getAppointments);
router.post('/appointments', authenticateToken, requireSpecialistOrReceptionist, AppointmentController.createAppointment);

/**
 * @swagger
 * /api/appointments/{appointmentId}:
 *   get:
 *     tags: [Appointments]
 *     summary: Obtener detalle de cita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle de la cita
 *   delete:
 *     tags: [Appointments]
 *     summary: Cancelar cita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancelReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cita cancelada exitosamente
 */
router.get('/appointments/:appointmentId', authenticateToken, requireSpecialistOrReceptionist, AppointmentController.getAppointmentDetail);
router.delete('/appointments/:appointmentId', authenticateToken, requireSpecialistOrReceptionist, AppointmentController.cancelAppointment);

/**
 * @swagger
 * /api/appointments/{appointmentId}/status:
 *   patch:
 *     tags: [Appointments]
 *     summary: Actualizar estado de cita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/AppointmentStatus'
 *               notes:
 *                 type: string
 *               cancelReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 */
router.patch('/appointments/:appointmentId/status', authenticateToken, requireSpecialistOrReceptionist, AppointmentController.updateAppointmentStatus);

// ==================== RUTAS DE MEDIOS Y CONSENTIMIENTOS ====================

/**
 * @swagger
 * /api/appointments/{appointmentId}/media:
 *   post:
 *     tags: [Appointment Media]
 *     summary: Subir evidencia del procedimiento
 *     description: Subir imágenes o videos del antes/después del procedimiento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - files
 *             properties:
 *               businessId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [before, after]
 *                 default: after
 *               notes:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Evidencia subida exitosamente
 *   get:
 *     tags: [Appointment Media]
 *     summary: Obtener medios de una cita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medios de la cita
 */
router.post('/appointments/:appointmentId/media', authenticateToken, requireSpecialist, evidenceUpload.array('files', 10), AppointmentMediaController.uploadEvidence);
router.get('/appointments/:appointmentId/media', authenticateToken, requireSpecialistOrReceptionist, AppointmentMediaController.getAppointmentMedia);

/**
 * @swagger
 * /api/appointments/{appointmentId}/media/{mediaId}:
 *   delete:
 *     tags: [Appointment Media]
 *     summary: Eliminar evidencia específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evidencia eliminada exitosamente
 */
router.delete('/appointments/:appointmentId/media/:mediaId', authenticateToken, requireSpecialist, AppointmentMediaController.deleteEvidence);

/**
 * @swagger
 * /api/appointments/{appointmentId}/consent:
 *   post:
 *     tags: [Appointment Media]
 *     summary: Subir consentimiento informado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - file
 *             properties:
 *               businessId:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo PDF del consentimiento
 *     responses:
 *       200:
 *         description: Consentimiento subido exitosamente
 */
router.post('/appointments/:appointmentId/consent', authenticateToken, requireSpecialist, consentUpload.single('file'), AppointmentMediaController.uploadConsent);

/**
 * @swagger
 * /api/appointments/{appointmentId}/validate-completion:
 *   get:
 *     tags: [Appointment Media]
 *     summary: Validar si una cita puede ser completada
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.get('/appointments/:appointmentId/validate-completion', authenticateToken, requireSpecialist, AppointmentMediaController.validateAppointmentCompletion);

// ==================== RUTAS DE PAGOS ====================

/**
 * @swagger
 * /api/appointments/{appointmentId}/payment:
 *   post:
 *     tags: [Appointment Payments]
 *     summary: Registrar pago de cita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - paymentMethod
 *               - amount
 *             properties:
 *               businessId:
 *                 type: string
 *               paymentMethod:
 *                 $ref: '#/components/schemas/PaymentMethod'
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: COP
 *               transactionId:
 *                 type: string
 *               notes:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Comprobante de pago (opcional)
 *     responses:
 *       200:
 *         description: Pago registrado exitosamente
 */
router.post('/appointments/:appointmentId/payment', authenticateToken, requireSpecialist, paymentProofUpload.single('file'), AppointmentPaymentController.recordPayment);

/**
 * @swagger
 * /api/appointments/{appointmentId}/payments:
 *   get:
 *     tags: [Appointment Payments]
 *     summary: Obtener historial de pagos de una cita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de pagos
 */
router.get('/appointments/:appointmentId/payments', authenticateToken, requireSpecialistOrReceptionist, AppointmentPaymentController.getPaymentHistory);

/**
 * @swagger
 * /api/appointments/{appointmentId}/payments/{paymentIndex}:
 *   put:
 *     tags: [Appointment Payments]
 *     summary: Actualizar pago existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: paymentIndex
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessId:
 *                 type: string
 *               notes:
 *                 type: string
 *               transactionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pago actualizado exitosamente
 *   delete:
 *     tags: [Appointment Payments]
 *     summary: Eliminar pago
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: paymentIndex
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pago eliminado exitosamente
 */
router.put('/appointments/:appointmentId/payments/:paymentIndex', authenticateToken, requireSpecialist, AppointmentPaymentController.updatePayment);
router.delete('/appointments/:appointmentId/payments/:paymentIndex', authenticateToken, requireSpecialist, AppointmentPaymentController.deletePayment);

/**
 * @swagger
 * /api/specialists/me/payments:
 *   get:
 *     tags: [Appointment Payments]
 *     summary: Obtener reporte de pagos del especialista
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Reporte de pagos del especialista
 */
router.get('/me/payments', authenticateToken, requireSpecialist, AppointmentPaymentController.getMyPaymentReport);

// ==================== RUTAS DE PRODUCTOS UTILIZADOS ====================

/**
 * @swagger
 * /api/appointments/{appointmentId}/used-products:
 *   post:
 *     tags: [Appointment Products]
 *     summary: Registrar productos utilizados en procedimiento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - products
 *             properties:
 *               businessId:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unit:
 *                       type: string
 *                       default: unidades
 *                     notes:
 *                       type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Productos utilizados registrados exitosamente
 *   get:
 *     tags: [Appointment Products]
 *     summary: Obtener productos utilizados en una cita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de productos utilizados
 */
router.post('/appointments/:appointmentId/used-products', authenticateToken, requireSpecialist, AppointmentProductController.recordUsedProducts);
router.get('/appointments/:appointmentId/used-products', authenticateToken, requireSpecialistOrReceptionist, AppointmentProductController.getUsedProducts);

/**
 * @swagger
 * /api/appointments/{appointmentId}/used-products/{productIndex}:
 *   put:
 *     tags: [Appointment Products]
 *     summary: Actualizar registro de producto utilizado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productIndex
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Producto utilizado actualizado exitosamente
 *   delete:
 *     tags: [Appointment Products]
 *     summary: Eliminar registro de producto utilizado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productIndex
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto utilizado eliminado exitosamente
 */
router.put('/appointments/:appointmentId/used-products/:productIndex', authenticateToken, requireSpecialist, AppointmentProductController.updateUsedProduct);
router.delete('/appointments/:appointmentId/used-products/:productIndex', authenticateToken, requireSpecialist, AppointmentProductController.deleteUsedProduct);

/**
 * @swagger
 * /api/appointments/{appointmentId}/available-products:
 *   get:
 *     tags: [Appointment Products]
 *     summary: Obtener productos disponibles para usar en procedimiento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: onlyInStock
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Lista de productos disponibles
 */
router.get('/appointments/:appointmentId/available-products', authenticateToken, requireSpecialist, AppointmentProductController.getAvailableProducts);

// ==================== RUTAS DE VENTAS DIRECTAS ====================

/**
 * @swagger
 * /api/sales:
 *   post:
 *     tags: [Specialist Sales]
 *     summary: Crear venta directa
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - products
 *             properties:
 *               businessId:
 *                 type: string
 *               clientId:
 *                 type: string
 *                 description: ID del cliente (opcional)
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     customPrice:
 *                       type: number
 *                       description: Precio personalizado (opcional)
 *               paymentMethod:
 *                 $ref: '#/components/schemas/PaymentMethod'
 *               discountAmount:
 *                 type: number
 *                 default: 0
 *               discountReason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Venta registrada exitosamente
 */
router.post('/sales', authenticateToken, requireSpecialist, SpecialistSalesController.createDirectSale);

/**
 * @swagger
 * /api/specialists/me/sales:
 *   get:
 *     tags: [Specialist Sales]
 *     summary: Obtener ventas del especialista
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de ventas del especialista
 */
router.get('/me/sales', authenticateToken, requireSpecialist, SpecialistSalesController.getMySales);

/**
 * @swagger
 * /api/specialists/me/products:
 *   get:
 *     tags: [Specialist Sales]
 *     summary: Obtener productos disponibles para venta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: onlyInStock
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Lista de productos disponibles para venta
 */
router.get('/me/products', authenticateToken, requireSpecialist, SpecialistSalesController.getAvailableProducts);

/**
 * @swagger
 * /api/specialists/me/sales/report:
 *   get:
 *     tags: [Specialist Sales]
 *     summary: Obtener reporte de ventas del especialista
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *     responses:
 *       200:
 *         description: Reporte detallado de ventas
 */
router.get('/me/sales/report', authenticateToken, validateBusinessId, requireSpecialist, SpecialistSalesController.getSalesReport);

// ==================== RUTAS DE PAGOS ADELANTADOS/DEPÓSITOS ====================

/**
 * @swagger
 * /api/appointments/{appointmentId}/advance-payment/check:
 *   get:
 *     tags: [Appointment Payments]
 *     summary: Verificar si se requiere pago adelantado
 *     description: Verifica la configuración del negocio y determina si la cita requiere depósito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Información sobre pago adelantado requerido
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
 *                     required:
 *                       type: boolean
 *                     amount:
 *                       type: number
 *                     percentage:
 *                       type: number
 *                     status:
 *                       type: string
 *                       enum: [NOT_REQUIRED, PENDING, PAID, FAILED, REFUNDED]
 */
router.get('/appointments/:appointmentId/advance-payment/check', authenticateToken, validateBusinessId, requireSpecialistOrReceptionist, AppointmentAdvancePaymentController.checkAdvancePaymentRequired);

/**
 * @swagger
 * /api/appointments/{appointmentId}/advance-payment/initiate:
 *   post:
 *     tags: [Appointment Payments]
 *     summary: Iniciar pago adelantado con Wompi
 *     description: Crea una transacción de pago adelantado en Wompi para la cita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *             properties:
 *               businessId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transacción de pago creada exitosamente
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
 *                     paymentReference:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     paymentUrl:
 *                       type: string
 *                     wompiPublicKey:
 *                       type: string
 */
router.post('/appointments/:appointmentId/advance-payment/initiate', authenticateToken, validateBusinessId, requireSpecialistOrReceptionist, AppointmentAdvancePaymentController.initiateAdvancePayment);

/**
 * @swagger
 * /api/appointments/{appointmentId}/advance-payment/status:
 *   get:
 *     tags: [Appointment Payments]
 *     summary: Verificar estado del pago adelantado
 *     description: Consulta el estado actual del depósito de la cita
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado del pago adelantado
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
 *                     depositStatus:
 *                       type: string
 *                       enum: [NOT_REQUIRED, PENDING, PAID, FAILED, REFUNDED]
 *                     isPaid:
 *                       type: boolean
 *                     canProceedWithAppointment:
 *                       type: boolean
 */
router.get('/appointments/:appointmentId/advance-payment/status', authenticateToken, validateBusinessId, requireSpecialistOrReceptionist, AppointmentAdvancePaymentController.checkAdvancePaymentStatus);

/**
 * @swagger
 * /api/appointments/advance-payment/wompi-webhook:
 *   post:
 *     tags: [Appointment Payments]
 *     summary: Webhook de Wompi para pagos adelantados
 *     description: Endpoint para recibir confirmaciones de pago desde Wompi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *               timestamp:
 *                 type: string
 *               signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 */
router.post('/appointments/advance-payment/wompi-webhook', AppointmentAdvancePaymentController.handleWompiWebhook);

// ==================== GESTIÓN DE HORARIOS Y DISPONIBILIDAD ====================

/**
 * @swagger
 * /api/specialists/me/schedules:
 *   get:
 *     tags: [Specialists]
 *     summary: Obtener horarios del especialista en todas sus sucursales
 *     description: Retorna los horarios semanales configurados por sucursal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del negocio
 *     responses:
 *       200:
 *         description: Horarios obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       branchId:
 *                         type: string
 *                       branchName:
 *                         type: string
 *                       branchAddress:
 *                         type: string
 *                       weekSchedule:
 *                         type: object
 *                         properties:
 *                           monday:
 *                             type: object
 *                             properties:
 *                               enabled:
 *                                 type: boolean
 *                               startTime:
 *                                 type: string
 *                               endTime:
 *                                 type: string
 */
router.get('/me/schedules', authenticateToken, requireSpecialist, SpecialistController.getMySchedules);

/**
 * @swagger
 * /api/specialists/me/business-constraints:
 *   get:
 *     tags: [Specialists]
 *     summary: Obtener restricciones del horario del negocio
 *     description: Retorna el horario general del negocio para validación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restricciones obtenidas exitosamente
 */
router.get('/me/business-constraints', authenticateToken, requireSpecialist, SpecialistController.getBusinessConstraints);

/**
 * @swagger
 * /api/specialists/me/schedules/{branchId}:
 *   put:
 *     tags: [Specialists]
 *     summary: Actualizar horario del especialista para una sucursal
 *     description: Define o actualiza el horario semanal del especialista en una sucursal específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessId
 *               - weekSchedule
 *             properties:
 *               businessId:
 *                 type: string
 *               weekSchedule:
 *                 type: object
 *                 properties:
 *                   monday:
 *                     type: object
 *                     properties:
 *                       enabled:
 *                         type: boolean
 *                       startTime:
 *                         type: string
 *                         example: "09:00"
 *                       endTime:
 *                         type: string
 *                         example: "18:00"
 *     responses:
 *       200:
 *         description: Horario actualizado exitosamente
 */
router.put('/me/schedules/:branchId', authenticateToken, requireSpecialist, SpecialistController.updateBranchSchedule);

module.exports = router;