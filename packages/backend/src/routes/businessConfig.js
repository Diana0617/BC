const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { uploadImageMiddleware } = require('../config/cloudinary');
const BusinessConfigController = require('../controllers/BusinessConfigController');
const BusinessInventoryController = require('../controllers/BusinessInventoryController');
const BusinessSupplierController = require('../controllers/BusinessSupplierController');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ==================== BRANDING Y PERSONALIZACIÓN ====================

/**
 * @swagger
 * /api/business/{businessId}/branding:
 *   get:
 *     summary: Obtener configuración de branding del negocio
 *     tags: [Business Config - Branding]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Configuración de branding obtenida exitosamente
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
 *                     primaryColor:
 *                       type: string
 *                       example: "#FF6B9D"
 *                     secondaryColor:
 *                       type: string
 *                       example: "#4ECDC4"
 *                     accentColor:
 *                       type: string
 *                       example: "#FFE66D"
 *                     logo:
 *                       type: string
 *                       format: uri
 *                     fontFamily:
 *                       type: string
 *                       example: "Poppins"
 *       403:
 *         description: No tienes permisos
 *       404:
 *         description: Negocio no encontrado
 */
router.get('/:businessId/branding', BusinessConfigController.getBranding);

/**
 * @swagger
 * /api/business/{businessId}/branding:
 *   put:
 *     summary: Actualizar colores corporativos del negocio
 *     tags: [Business Config - Branding]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               primaryColor:
 *                 type: string
 *                 pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *                 example: "#E91E63"
 *               secondaryColor:
 *                 type: string
 *                 pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *                 example: "#00BCD4"
 *               accentColor:
 *                 type: string
 *                 pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
 *                 example: "#FFC107"
 *               fontFamily:
 *                 type: string
 *                 example: "Montserrat"
 *     responses:
 *       200:
 *         description: Branding actualizado exitosamente
 *       400:
 *         description: Color inválido
 *       403:
 *         description: No tienes permisos
 */
router.put('/:businessId/branding', BusinessConfigController.updateBranding);

/**
 * @swagger
 * /api/business/{businessId}/upload-logo:
 *   post:
 *     summary: Subir logo del negocio
 *     tags: [Business Config - Branding]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen del logo (JPG, PNG, WEBP)
 *     responses:
 *       200:
 *         description: Logo subido exitosamente
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
 *                     logoUrl:
 *                       type: string
 *                       format: uri
 *                     thumbnails:
 *                       type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: No se proporcionó archivo
 *       403:
 *         description: No tienes permisos
 */
router.post('/:businessId/upload-logo', 
  uploadImageMiddleware.single('logo'), 
  BusinessConfigController.uploadLogo
);

// ==================== REGLAS DEL NEGOCIO ====================

/**
 * @swagger
 * /api/business/{businessId}/config/rules:
 *   get:
 *     summary: Obtener reglas de configuración del negocio
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reglas del negocio obtenidas exitosamente
 *       403:
 *         description: No tienes permisos para acceder
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/rules', BusinessConfigController.getBusinessRules);

/**
 * @swagger
 * /api/business/{businessId}/config/rules:
 *   put:
 *     summary: Actualizar reglas de configuración del negocio
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               allowCloseWithoutPayment:
 *                 type: boolean
 *               enableCancellation:
 *                 type: boolean
 *               cancellationTimeLimit:
 *                 type: integer
 *               workingHours:
 *                 type: object
 *     responses:
 *       200:
 *         description: Reglas actualizadas exitosamente
 *       403:
 *         description: No tienes permisos
 */
router.put('/:businessId/config/rules', BusinessConfigController.updateBusinessRules);

// ==================== ESPECIALISTAS ====================

/**
 * @swagger
 * /api/business/{businessId}/config/specialists:
 *   get:
 *     summary: Obtener lista de especialistas del negocio
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, ON_VACATION, SICK_LEAVE, SUSPENDED]
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de especialistas obtenida exitosamente
 */
router.get('/:businessId/config/specialists', BusinessConfigController.getSpecialists);

/**
 * @swagger
 * /api/business/{businessId}/config/specialists:
 *   post:
 *     summary: Crear nuevo especialista
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userData:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   phone:
 *                     type: string
 *               profileData:
 *                 type: object
 *                 properties:
 *                   specialization:
 *                     type: string
 *                   biography:
 *                     type: string
 *                   experience:
 *                     type: integer
 *                   commissionRate:
 *                     type: number
 *     responses:
 *       201:
 *         description: Especialista creado exitosamente
 */
router.post('/:businessId/config/specialists', BusinessConfigController.createSpecialist);

/**
 * @swagger
 * /api/business/{businessId}/config/specialists/{profileId}:
 *   put:
 *     summary: Actualizar perfil de especialista
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 */
router.put('/:businessId/config/specialists/:profileId', BusinessConfigController.updateSpecialistProfile);

/**
 * @swagger
 * /api/business/{businessId}/config/specialists/{profileId}:
 *   delete:
 *     summary: Eliminar especialista
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Especialista eliminado exitosamente
 */
router.delete('/:businessId/config/specialists/:profileId', BusinessConfigController.deleteSpecialist);

// ==================== HORARIOS ====================

/**
 * @swagger
 * /api/business/{businessId}/config/schedules:
 *   get:
 *     summary: Obtener horarios del negocio
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: specialistId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Horarios obtenidos exitosamente
 */
router.get('/:businessId/config/schedules', BusinessConfigController.getSchedules);

/**
 * @swagger
 * /api/business/{businessId}/config/schedules:
 *   post:
 *     summary: Crear nuevo horario
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               specialistId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [BUSINESS_DEFAULT, SPECIALIST_CUSTOM, TEMPORARY_OVERRIDE]
 *               weeklySchedule:
 *                 type: object
 *               slotDuration:
 *                 type: integer
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Horario creado exitosamente
 */
router.post('/:businessId/config/schedules', BusinessConfigController.createSchedule);

/**
 * @swagger
 * /api/business/{businessId}/config/schedules/{scheduleId}:
 *   put:
 *     summary: Actualizar horario
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Horario actualizado exitosamente
 */
router.put('/:businessId/config/schedules/:scheduleId', BusinessConfigController.updateSchedule);

/**
 * @swagger
 * /api/business/{businessId}/config/schedules/{scheduleId}:
 *   delete:
 *     summary: Eliminar horario
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Horario eliminado exitosamente
 */
router.delete('/:businessId/config/schedules/:scheduleId', BusinessConfigController.deleteSchedule);

// ==================== SLOTS DE TIEMPO ====================

/**
 * @swagger
 * /api/business/{businessId}/config/slots/available:
 *   get:
 *     summary: Obtener slots de tiempo disponibles
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: specialistId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Slots disponibles obtenidos exitosamente
 */
router.get('/:businessId/config/slots/available', BusinessConfigController.getAvailableSlots);

/**
 * @swagger
 * /api/business/{businessId}/config/slots/{slotId}/block:
 *   post:
 *     summary: Bloquear slot de tiempo
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Slot bloqueado exitosamente
 */
router.post('/:businessId/config/slots/:slotId/block', BusinessConfigController.blockSlot);

/**
 * @swagger
 * /api/business/{businessId}/config/slots/{slotId}/unblock:
 *   post:
 *     summary: Desbloquear slot de tiempo
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Slot desbloqueado exitosamente
 */
router.post('/:businessId/config/slots/:slotId/unblock', BusinessConfigController.unblockSlot);

// ==================== CONFIGURACIÓN DE PAGOS ====================

/**
 * @swagger
 * /api/business/{businessId}/config/payments:
 *   get:
 *     summary: Obtener configuración de pagos del negocio
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Configuración de pagos obtenida exitosamente
 */
router.get('/:businessId/config/payments', BusinessConfigController.getPaymentConfig);

/**
 * @swagger
 * /api/business/{businessId}/config/payments:
 *   put:
 *     summary: Actualizar configuración de pagos
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [WOMPI, STRIPE, PAYPAL, PAYULATAM, MERCADOPAGO]
 *               testMode:
 *                 type: boolean
 *               wompiConfig:
 *                 type: object
 *               enabledMethods:
 *                 type: object
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 */
router.put('/:businessId/config/payments', BusinessConfigController.updatePaymentConfig);

/**
 * @swagger
 * /api/business/{businessId}/config/payments/test:
 *   post:
 *     summary: Probar configuración de pagos
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Prueba de configuración completada
 */
router.post('/:businessId/config/payments/test', BusinessConfigController.testPaymentConfig);

// ==================== RESUMEN DE CONFIGURACIÓN ====================

/**
 * @swagger
 * /api/business/{businessId}/config/summary:
 *   get:
 *     summary: Obtener resumen completo de configuración del negocio
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resumen de configuración obtenido exitosamente
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
 *                     rules:
 *                       type: object
 *                     specialists:
 *                       type: integer
 *                     activeSpecialists:
 *                       type: integer
 *                     schedules:
 *                       type: integer
 *                     paymentConfigured:
 *                       type: boolean
 *                     completionPercentage:
 *                       type: integer
 */
router.get('/:businessId/config/summary', BusinessConfigController.getConfigSummary);

// ==================== SERVICIOS ====================

/**
 * @swagger
 * /api/business/{businessId}/config/services:
 *   get:
 *     summary: Obtener lista de servicios del negocio
 *     tags: [Business Config - Services]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o descripción
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados por página
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, duration, category, createdAt]
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de servicios obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Service'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       403:
 *         description: No tienes permisos para acceder
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/services', BusinessConfigController.getServices);

/**
 * @swagger
 * /api/business/{businessId}/config/services:
 *   post:
 *     summary: Crear nuevo servicio
 *     tags: [Business Config - Services]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - duration
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre del servicio
 *               description:
 *                 type: string
 *                 description: Descripción del servicio
 *               category:
 *                 type: string
 *                 description: Categoría del servicio
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Precio del servicio
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 description: Duración en minutos
 *               requiresConsent:
 *                 type: boolean
 *                 default: false
 *                 description: Si requiere consentimiento
 *               consentTemplate:
 *                 type: string
 *                 description: Plantilla de consentimiento
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-F]{6}$'
 *                 description: Color hexadecimal para identificación
 *               preparationTime:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 description: Tiempo de preparación en minutos
 *               cleanupTime:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 description: Tiempo de limpieza en minutos
 *               maxConcurrent:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Máximo de servicios concurrentes
 *               requiresEquipment:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Equipamiento requerido
 *               skillsRequired:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Habilidades requeridas
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Etiquetas del servicio
 *               commission:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [PERCENTAGE, FIXED]
 *                   value:
 *                     type: number
 *                   specialistPercentage:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 100
 *                   businessPercentage:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 100
 *               bookingSettings:
 *                 type: object
 *                 properties:
 *                   onlineBookingEnabled:
 *                     type: boolean
 *                     default: true
 *                   advanceBookingDays:
 *                     type: integer
 *                     default: 30
 *                   requiresApproval:
 *                     type: boolean
 *                     default: false
 *                   allowWaitlist:
 *                     type: boolean
 *                     default: true
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *                 message:
 *                   type: string
 *       403:
 *         description: No tienes permisos para crear servicios
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:businessId/config/services', BusinessConfigController.createService);

/**
 * @swagger
 * /api/business/{businessId}/config/services/{serviceId}:
 *   get:
 *     summary: Obtener servicio específico
 *     tags: [Business Config - Services]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Servicio obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *       403:
 *         description: No tienes permisos para acceder
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/services/:serviceId', BusinessConfigController.getService);

/**
 * @swagger
 * /api/business/{businessId}/config/services/{serviceId}:
 *   put:
 *     summary: Actualizar servicio existente
 *     tags: [Business Config - Services]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *               requiresConsent:
 *                 type: boolean
 *               consentTemplate:
 *                 type: string
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-F]{6}$'
 *               preparationTime:
 *                 type: integer
 *                 minimum: 0
 *               cleanupTime:
 *                 type: integer
 *                 minimum: 0
 *               maxConcurrent:
 *                 type: integer
 *                 minimum: 1
 *               requiresEquipment:
 *                 type: array
 *                 items:
 *                   type: string
 *               skillsRequired:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               commission:
 *                 type: object
 *               bookingSettings:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Servicio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *                 message:
 *                   type: string
 *       403:
 *         description: No tienes permisos para actualizar servicios
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:businessId/config/services/:serviceId', BusinessConfigController.updateService);

/**
 * @swagger
 * /api/business/{businessId}/config/services/{serviceId}:
 *   delete:
 *     summary: Eliminar servicio
 *     tags: [Business Config - Services]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Servicio eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: No tienes permisos para eliminar servicios
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:businessId/config/services/:serviceId', BusinessConfigController.deleteService);

/**
 * @swagger
 * /api/business/{businessId}/config/services/{serviceId}/status:
 *   patch:
 *     summary: Activar/Desactivar servicio
 *     tags: [Business Config - Services]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo del servicio
 *     responses:
 *       200:
 *         description: Estado del servicio cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *                 message:
 *                   type: string
 *       403:
 *         description: No tienes permisos para cambiar el estado
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:businessId/config/services/:serviceId/status', BusinessConfigController.toggleServiceStatus);

/**
 * @swagger
 * /api/business/{businessId}/config/services/categories:
 *   get:
 *     summary: Obtener categorías de servicios del negocio
 *     tags: [Business Config - Services]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Categorías obtenidas exitosamente
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
 *                       name:
 *                         type: string
 *                       count:
 *                         type: integer
 *                       activeCount:
 *                         type: integer
 *                       avgPrice:
 *                         type: number
 *       403:
 *         description: No tienes permisos para acceder
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/services/categories', BusinessConfigController.getServiceCategories);

/**
 * @swagger
 * /api/business/{businessId}/config/services/{serviceId}/images:
 *   post:
 *     summary: Actualizar imágenes del servicio
 *     tags: [Business Config - Services]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                     description:
 *                       type: string
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Imágenes actualizadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Service'
 *                 message:
 *                   type: string
 *       403:
 *         description: No tienes permisos para actualizar imágenes
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:businessId/config/services/:serviceId/images', BusinessConfigController.updateServiceImages);

/**
 * @swagger
 * /api/business/{businessId}/config/services/stats:
 *   get:
 *     summary: Obtener estadísticas de servicios
 *     tags: [Business Config - Services]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: Período predefinido para las estadísticas
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio personalizada
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin personalizada
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalServices:
 *                           type: integer
 *                         activeServices:
 *                           type: integer
 *                         avgPrice:
 *                           type: number
 *                         minPrice:
 *                           type: number
 *                         maxPrice:
 *                           type: number
 *                         avgDuration:
 *                           type: number
 *                     byCategory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           avgPrice:
 *                             type: number
 *       403:
 *         description: No tienes permisos para acceder
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/services/stats', BusinessConfigController.getServicesStats);

// ==================== INVENTARIO - PRODUCTOS ====================

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/products:
 *   get:
 *     summary: Obtener lista de productos del inventario
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: trackInventory
 *         schema:
 *           type: boolean
 *         description: Filtrar productos con seguimiento de inventario
 *       - in: query
 *         name: stockStatus
 *         schema:
 *           type: string
 *           enum: [IN_STOCK, LOW_STOCK, OUT_OF_STOCK, OVERSTOCK]
 *         description: Filtrar por estado de stock
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre, SKU o código de barras
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados por página
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Orden ascendente o descendente
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: No tienes permisos para acceder
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/products', BusinessInventoryController.getProducts);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/products/{id}:
 *   get:
 *     summary: Obtener producto específico por ID
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Producto obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/products/:id', BusinessInventoryController.getProduct);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/products:
 *   post:
 *     summary: Crear nuevo producto
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: Nombre del producto
 *               description:
 *                 type: string
 *                 description: Descripción del producto
 *               sku:
 *                 type: string
 *                 description: Código SKU (se genera automáticamente si no se proporciona)
 *               barcode:
 *                 type: string
 *                 description: Código de barras
 *               category:
 *                 type: string
 *                 description: Categoría del producto
 *               brand:
 *                 type: string
 *                 description: Marca del producto
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Precio de venta
 *               cost:
 *                 type: number
 *                 minimum: 0
 *                 description: Costo de compra
 *               trackInventory:
 *                 type: boolean
 *                 default: true
 *                 description: Si se rastrea inventario
 *               currentStock:
 *                 type: number
 *                 minimum: 0
 *                 description: Stock actual
 *               minStock:
 *                 type: number
 *                 minimum: 0
 *                 description: Stock mínimo
 *               maxStock:
 *                 type: number
 *                 minimum: 0
 *                 description: Stock máximo
 *               unit:
 *                 type: string
 *                 enum: [unidad, ml, litro, gramo, kilogramo, onza, paquete]
 *                 default: unidad
 *                 description: Unidad de medida
 *               initialStock:
 *                 type: number
 *                 minimum: 0
 *                 description: Stock inicial (para crear movimiento automático)
 *               taxable:
 *                 type: boolean
 *                 default: true
 *                 description: Si aplican impuestos
 *               taxRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Tasa de impuesto en porcentaje
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Etiquetas del producto
 *               expirationTracking:
 *                 type: boolean
 *                 default: false
 *                 description: Seguimiento de vencimiento
 *               batchTracking:
 *                 type: boolean
 *                 default: false
 *                 description: Seguimiento de lotes
 *               serialTracking:
 *                 type: boolean
 *                 default: false
 *                 description: Seguimiento de números de serie
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permisos para crear productos
 *       409:
 *         description: SKU ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:businessId/config/inventory/products', BusinessInventoryController.createProduct);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/products/{id}:
 *   put:
 *     summary: Actualizar producto existente
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               description:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *               cost:
 *                 type: number
 *                 minimum: 0
 *               category:
 *                 type: string
 *               brand:
 *                 type: string
 *               minStock:
 *                 type: number
 *                 minimum: 0
 *               maxStock:
 *                 type: number
 *                 minimum: 0
 *               unit:
 *                 type: string
 *               taxable:
 *                 type: boolean
 *               taxRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permisos para actualizar productos
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: SKU ya existe
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:businessId/config/inventory/products/:id', BusinessInventoryController.updateProduct);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/products/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       403:
 *         description: No tienes permisos para eliminar productos
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: No se puede eliminar (tiene stock o movimientos recientes)
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:businessId/config/inventory/products/:id', BusinessInventoryController.deleteProduct);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/products/{id}/status:
 *   patch:
 *     summary: Activar/Desactivar producto
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Estado activo del producto
 *     responses:
 *       200:
 *         description: Estado del producto actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permisos para cambiar el estado
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:businessId/config/inventory/products/:id/status', BusinessInventoryController.toggleProductStatus);

// ==================== INVENTARIO - GESTIÓN DE STOCK ====================

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/stock-levels:
 *   get:
 *     summary: Obtener niveles de stock
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: stockStatus
 *         schema:
 *           type: string
 *           enum: [IN_STOCK, LOW_STOCK, OUT_OF_STOCK, OVERSTOCK]
 *         description: Filtrar por estado de stock
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Solo productos con stock bajo
 *     responses:
 *       200:
 *         description: Niveles de stock obtenidos exitosamente
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
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       sku:
 *                         type: string
 *                       currentStock:
 *                         type: number
 *                       minStock:
 *                         type: number
 *                       maxStock:
 *                         type: number
 *                       stockStatus:
 *                         type: string
 *                       totalValue:
 *                         type: number
 *                       retailValue:
 *                         type: number
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/stock-levels', BusinessInventoryController.getStockLevels);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/products/{id}/adjust-stock:
 *   post:
 *     summary: Ajustar stock de un producto
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - reason
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: Cantidad a ajustar (positiva o negativa)
 *               reason:
 *                 type: string
 *                 minLength: 5
 *                 description: Razón del ajuste
 *               notes:
 *                 type: string
 *                 description: Notas adicionales
 *               unitCost:
 *                 type: number
 *                 minimum: 0
 *                 description: Costo unitario
 *     responses:
 *       200:
 *         description: Stock ajustado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/InventoryMovement'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permisos para ajustar stock
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: Producto sin seguimiento de inventario o stock insuficiente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:businessId/config/inventory/products/:id/adjust-stock', BusinessInventoryController.adjustStock);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/products/{id}/initial-stock:
 *   post:
 *     summary: Establecer stock inicial de un producto
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 0
 *                 description: Cantidad inicial
 *               unitCost:
 *                 type: number
 *                 minimum: 0
 *                 description: Costo unitario
 *               notes:
 *                 type: string
 *                 description: Notas
 *     responses:
 *       200:
 *         description: Stock inicial establecido exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permisos para establecer stock inicial
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: Producto ya tiene movimientos de inventario
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:businessId/config/inventory/products/:id/initial-stock', BusinessInventoryController.setInitialStock);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/transfer-stock:
 *   post:
 *     summary: Transferir stock entre productos
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromProductId
 *               - quantity
 *               - reason
 *             properties:
 *               fromProductId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del producto origen
 *               toProductId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del producto destino (opcional)
 *               quantity:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Cantidad a transferir
 *               reason:
 *                 type: string
 *                 minLength: 5
 *                 description: Razón de la transferencia
 *               notes:
 *                 type: string
 *                 description: Notas adicionales
 *     responses:
 *       200:
 *         description: Transferencia realizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permisos para transferir stock
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: Stock insuficiente o producto sin seguimiento
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:businessId/config/inventory/transfer-stock', BusinessInventoryController.transferStock);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/low-stock:
 *   get:
 *     summary: Obtener productos con stock bajo
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Productos con stock bajo obtenidos exitosamente
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
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       sku:
 *                         type: string
 *                       currentStock:
 *                         type: number
 *                       minStock:
 *                         type: number
 *                       urgency:
 *                         type: string
 *                         enum: [CRITICAL, WARNING]
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/low-stock', BusinessInventoryController.getLowStockProducts);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/expiring:
 *   get:
 *     summary: Obtener productos próximos a vencer
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *         description: Días de anticipación
 *     responses:
 *       200:
 *         description: Productos próximos a vencer obtenidos exitosamente
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
 *                       productId:
 *                         type: string
 *                       productName:
 *                         type: string
 *                       sku:
 *                         type: string
 *                       batchNumber:
 *                         type: string
 *                       expirationDate:
 *                         type: string
 *                         format: date
 *                       daysUntilExpiry:
 *                         type: integer
 *                       quantity:
 *                         type: number
 *                       urgency:
 *                         type: string
 *                         enum: [CRITICAL, HIGH, MEDIUM]
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/expiring', BusinessInventoryController.getExpiringProducts);

// ==================== INVENTARIO - MOVIMIENTOS ====================

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/movements:
 *   get:
 *     summary: Obtener historial de movimientos de inventario
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por producto específico
 *       - in: query
 *         name: movementType
 *         schema:
 *           type: string
 *           enum: [PURCHASE, SALE, ADJUSTMENT, TRANSFER, RETURN, DAMAGE, EXPIRED, INITIAL_STOCK]
 *         description: Filtrar por tipo de movimiento
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Movimientos obtenidos exitosamente
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
 *                     movements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/InventoryMovement'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/movements', BusinessInventoryController.getInventoryMovements);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/movements/{id}:
 *   get:
 *     summary: Obtener movimiento específico
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Movimiento obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/InventoryMovement'
 *       404:
 *         description: Movimiento no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/movements/:id', BusinessInventoryController.getInventoryMovement);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/movements:
 *   post:
 *     summary: Crear movimiento de inventario manual
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - movementType
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del producto
 *               movementType:
 *                 type: string
 *                 enum: [PURCHASE, SALE, ADJUSTMENT, TRANSFER, RETURN, DAMAGE, EXPIRED, INITIAL_STOCK]
 *                 description: Tipo de movimiento
 *               quantity:
 *                 type: number
 *                 description: Cantidad del movimiento
 *               reason:
 *                 type: string
 *                 description: Razón del movimiento
 *               notes:
 *                 type: string
 *                 description: Notas adicionales
 *               unitCost:
 *                 type: number
 *                 minimum: 0
 *                 description: Costo unitario
 *               batchNumber:
 *                 type: string
 *                 description: Número de lote
 *               expirationDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento
 *               supplierInfo:
 *                 type: object
 *                 description: Información del proveedor
 *     responses:
 *       201:
 *         description: Movimiento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/InventoryMovement'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tienes permisos para crear movimientos
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: Producto sin seguimiento o stock insuficiente
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:businessId/config/inventory/movements', BusinessInventoryController.createInventoryMovement);

// ==================== INVENTARIO - CATEGORÍAS Y REPORTES ====================

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/categories:
 *   get:
 *     summary: Obtener categorías de productos
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Categorías obtenidas exitosamente
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
 *                       name:
 *                         type: string
 *                       productCount:
 *                         type: integer
 *                       totalStock:
 *                         type: number
 *                       totalValue:
 *                         type: number
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/categories', BusinessInventoryController.getProductCategories);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/summary:
 *   get:
 *     summary: Obtener resumen de inventario
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resumen obtenido exitosamente
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
 *                     products:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         tracked:
 *                           type: integer
 *                         lowStock:
 *                           type: integer
 *                         outOfStock:
 *                           type: integer
 *                     value:
 *                       type: object
 *                       properties:
 *                         stockValue:
 *                           type: number
 *                         retailValue:
 *                           type: number
 *                         potentialProfit:
 *                           type: number
 *                     activity:
 *                       type: object
 *                       properties:
 *                         recentMovements:
 *                           type: integer
 *                         lastUpdated:
 *                           type: string
 *                           format: date-time
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/summary', BusinessInventoryController.getInventorySummary);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/valuation:
 *   get:
 *     summary: Obtener valorización de inventario
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [FIFO, LIFO, AVERAGE]
 *           default: AVERAGE
 *         description: Método de valorización
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de valorización
 *     responses:
 *       200:
 *         description: Valorización obtenida exitosamente
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
 *                     method:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     totalCost:
 *                       type: number
 *                     totalRetail:
 *                       type: number
 *                     potentialProfit:
 *                       type: number
 *                     products:
 *                       type: integer
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/valuation', BusinessInventoryController.getInventoryValuation);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/movement-stats:
 *   get:
 *     summary: Obtener estadísticas de movimientos
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: Período de análisis
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio personalizada
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin personalizada
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                     byType:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           totalQuantity:
 *                             type: number
 *                           totalCost:
 *                             type: number
 *                     daily:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           count:
 *                             type: integer
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/movement-stats', BusinessInventoryController.getMovementStats);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/abc-analysis:
 *   get:
 *     summary: Obtener análisis ABC de productos
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Análisis ABC obtenido exitosamente
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
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           sku:
 *                             type: string
 *                           category:
 *                             type: string
 *                           currentStock:
 *                             type: number
 *                           cost:
 *                             type: number
 *                           price:
 *                             type: number
 *                           inventoryValue:
 *                             type: number
 *                           cumulativePercentage:
 *                             type: number
 *                           abcCategory:
 *                             type: string
 *                             enum: [A, B, C]
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalProducts:
 *                           type: integer
 *                         totalValue:
 *                           type: number
 *                         categoryA:
 *                           type: integer
 *                         categoryB:
 *                           type: integer
 *                         categoryC:
 *                           type: integer
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/abc-analysis', BusinessInventoryController.getABCAnalysis);

// ==================== INVENTARIO - IMÁGENES ====================

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/products/{id}/images:
 *   post:
 *     summary: Subir imagen del producto
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen
 *               description:
 *                 type: string
 *                 description: Descripción de la imagen
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente
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
 *                     imageUrl:
 *                       type: string
 *                     product:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: No se proporcionó imagen
 *       403:
 *         description: No tienes permisos para subir imágenes
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/:businessId/config/inventory/products/:id/images', BusinessInventoryController.uploadProductImage);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/products/{id}/images/{imageId}:
 *   delete:
 *     summary: Eliminar imagen del producto
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID o identificador de la imagen
 *     responses:
 *       200:
 *         description: Imagen eliminada exitosamente
 *       403:
 *         description: No tienes permisos para eliminar imágenes
 *       404:
 *         description: Producto o imagen no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:businessId/config/inventory/products/:id/images/:imageId', BusinessInventoryController.deleteProductImage);

// ==================== INVENTARIO - ALERTAS ====================

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/alerts:
 *   put:
 *     summary: Configurar alertas de inventario
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lowStockEnabled:
 *                 type: boolean
 *                 default: true
 *                 description: Habilitar alertas de stock bajo
 *               expirationEnabled:
 *                 type: boolean
 *                 default: true
 *                 description: Habilitar alertas de vencimiento
 *               expirationDays:
 *                 type: integer
 *                 default: 30
 *                 minimum: 1
 *                 description: Días de anticipación para vencimientos
 *               emailRecipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 description: Destinatarios de email
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 *       403:
 *         description: No tienes permisos para configurar alertas
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:businessId/config/inventory/alerts', BusinessInventoryController.configureInventoryAlerts);

/**
 * @swagger
 * /api/business/{businessId}/config/inventory/alerts:
 *   get:
 *     summary: Obtener configuración de alertas
 *     tags: [Business Inventory]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
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
 *                     lowStockEnabled:
 *                       type: boolean
 *                     expirationEnabled:
 *                       type: boolean
 *                     expirationDays:
 *                       type: integer
 *                     emailRecipients:
 *                       type: array
 *                       items:
 *                         type: string
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/inventory/alerts', BusinessInventoryController.getInventoryAlertsConfig);

// ==================== GESTIÓN DE PROVEEDORES ====================

/**
 * @swagger
 * /business/{businessId}/config/suppliers:
 *   get:
 *     summary: Obtener lista de proveedores
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [DISTRIBUTOR, MANUFACTURER, WHOLESALER, RETAILER, SERVICE_PROVIDER, FREELANCER]
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, PENDING, BLOCKED, UNDER_REVIEW]
 *           default: ACTIVE
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: country
 *         in: query
 *         schema:
 *           type: string
 *       - name: city
 *         in: query
 *         schema:
 *           type: string
 *       - name: hasActiveOrders
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           default: name
 *       - name: sortOrder
 *         in: query
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: Lista de proveedores obtenida exitosamente
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
 *                     suppliers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Supplier'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/:businessId/config/suppliers', BusinessSupplierController.getSuppliers);

/**
 * @swagger
 * /business/{businessId}/config/suppliers:
 *   post:
 *     summary: Crear nuevo proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *               type:
 *                 type: string
 *                 enum: [DISTRIBUTOR, MANUFACTURER, WHOLESALER, RETAILER, SERVICE_PROVIDER, FREELANCER]
 *               code:
 *                 type: string
 *               taxId:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *               contactPerson:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   position:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               paymentTerms:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [IMMEDIATE, NET_15, NET_30, NET_45, NET_60, NET_90, COD]
 *                   creditLimit:
 *                     type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proveedor creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Supplier'
 */
router.post('/:businessId/config/suppliers', BusinessSupplierController.createSupplier);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}:
 *   get:
 *     summary: Obtener proveedor específico
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Proveedor obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Proveedor no encontrado
 */
router.get('/:businessId/config/suppliers/:id', BusinessSupplierController.getSupplier);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}:
 *   put:
 *     summary: Actualizar proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: object
 *               paymentTerms:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proveedor actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Proveedor no encontrado
 */
router.put('/:businessId/config/suppliers/:id', BusinessSupplierController.updateSupplier);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}:
 *   delete:
 *     summary: Eliminar proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Proveedor eliminado exitosamente
 *       404:
 *         description: Proveedor no encontrado
 *       409:
 *         description: No se puede eliminar (tiene órdenes activas o facturas pendientes)
 */
router.delete('/:businessId/config/suppliers/:id', BusinessSupplierController.deleteSupplier);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/status:
 *   patch:
 *     summary: Cambiar estado del proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 enum: [ACTIVE, INACTIVE, PENDING, BLOCKED, UNDER_REVIEW]
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Supplier'
 */
router.patch('/:businessId/config/suppliers/:id/status', BusinessSupplierController.updateSupplierStatus);

// ==================== GESTIÓN DE CONTACTOS ====================

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/contacts:
 *   get:
 *     summary: Obtener contactos del proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contactos obtenidos exitosamente
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
 *                     $ref: '#/components/schemas/SupplierContact'
 */
router.get('/:businessId/config/suppliers/:id/contacts', BusinessSupplierController.getSupplierContacts);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/contacts:
 *   post:
 *     summary: Agregar contacto al proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - position
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               department:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Contacto agregado exitosamente
 */
router.post('/:businessId/config/suppliers/:id/contacts', BusinessSupplierController.addSupplierContact);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/contacts/{contactId}:
 *   put:
 *     summary: Actualizar contacto del proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: contactId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               position:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Contacto actualizado exitosamente
 */
router.put('/:businessId/config/suppliers/:id/contacts/:contactId', BusinessSupplierController.updateSupplierContact);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/contacts/{contactId}:
 *   delete:
 *     summary: Eliminar contacto del proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: contactId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contacto eliminado exitosamente
 */
router.delete('/:businessId/config/suppliers/:id/contacts/:contactId', BusinessSupplierController.deleteSupplierContact);

// ==================== ÓRDENES DE COMPRA ====================

/**
 * @swagger
 * /business/{businessId}/config/suppliers/purchase-orders:
 *   get:
 *     summary: Obtener órdenes de compra
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: supplierId
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [DRAFT, SENT, CONFIRMED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED]
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de órdenes obtenida exitosamente
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PurchaseOrder'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/:businessId/config/suppliers/purchase-orders', BusinessSupplierController.getPurchaseOrders);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/purchase-orders:
 *   post:
 *     summary: Crear nueva orden de compra
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierId
 *               - items
 *             properties:
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productName:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *                     unit:
 *                       type: string
 *               notes:
 *                 type: string
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *               deliveryAddress:
 *                 type: object
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 */
router.post('/:businessId/config/suppliers/purchase-orders', BusinessSupplierController.createPurchaseOrder);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/purchase-orders/{id}:
 *   get:
 *     summary: Obtener orden de compra específica
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Orden obtenida exitosamente
 *       404:
 *         description: Orden no encontrada
 */
router.get('/:businessId/config/suppliers/purchase-orders/:id', BusinessSupplierController.getPurchaseOrder);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/purchase-orders/{id}:
 *   put:
 *     summary: Actualizar orden de compra
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               notes:
 *                 type: string
 *               deliveryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Orden actualizada exitosamente
 */
router.put('/:businessId/config/suppliers/purchase-orders/:id', BusinessSupplierController.updatePurchaseOrder);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/purchase-orders/{id}/status:
 *   patch:
 *     summary: Cambiar estado de orden de compra
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 enum: [DRAFT, SENT, CONFIRMED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED]
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 */
router.patch('/:businessId/config/suppliers/purchase-orders/:id/status', BusinessSupplierController.updatePurchaseOrderStatus);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/purchase-orders/{id}/receive:
 *   post:
 *     summary: Marcar items como recibidos
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receivedItems
 *             properties:
 *               receivedItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     receivedQuantity:
 *                       type: number
 *               receiptDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Items recibidos exitosamente
 */
router.post('/:businessId/config/suppliers/purchase-orders/:id/receive', BusinessSupplierController.receiveOrderItems);

// ==================== GESTIÓN DE FACTURAS ====================

/**
 * @swagger
 * /business/{businessId}/config/suppliers/invoices:
 *   get:
 *     summary: Obtener facturas de proveedores
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: supplierId
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, PAID, OVERDUE, DISPUTED, CANCELLED]
 *       - name: overdue
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de facturas obtenida exitosamente
 */
router.get('/:businessId/config/suppliers/invoices', BusinessSupplierController.getSupplierInvoices);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/invoices:
 *   post:
 *     summary: Crear factura de proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierId
 *               - invoiceNumber
 *               - issueDate
 *               - dueDate
 *               - total
 *             properties:
 *               supplierId:
 *                 type: string
 *                 format: uuid
 *               invoiceNumber:
 *                 type: string
 *               issueDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               subtotal:
 *                 type: number
 *               tax:
 *                 type: number
 *               total:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
 */
router.post('/:businessId/config/suppliers/invoices', BusinessSupplierController.createSupplierInvoice);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/invoices/{id}:
 *   get:
 *     summary: Obtener factura específica
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Factura obtenida exitosamente
 *       404:
 *         description: Factura no encontrada
 */
router.get('/:businessId/config/suppliers/invoices/:id', BusinessSupplierController.getSupplierInvoice);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/invoices/{id}:
 *   put:
 *     summary: Actualizar factura de proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceNumber:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               total:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Factura actualizada exitosamente
 */
router.put('/:businessId/config/suppliers/invoices/:id', BusinessSupplierController.updateSupplierInvoice);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/invoices/{id}/status:
 *   patch:
 *     summary: Cambiar estado de factura
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 enum: [PENDING, APPROVED, PAID, OVERDUE, DISPUTED, CANCELLED]
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 */
router.patch('/:businessId/config/suppliers/invoices/:id/status', BusinessSupplierController.updateInvoiceStatus);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/invoices/{id}/payments:
 *   post:
 *     summary: Registrar pago de factura
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - paymentDate
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *               paymentDate:
 *                 type: string
 *                 format: date
 *               paymentMethod:
 *                 type: string
 *               reference:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pago registrado exitosamente
 */
router.post('/:businessId/config/suppliers/invoices/:id/payments', BusinessSupplierController.recordInvoicePayment);

// ==================== CATÁLOGO DE PRODUCTOS ====================

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/catalog:
 *   get:
 *     summary: Obtener catálogo del proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: category
 *         in: query
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *       - name: available
 *         in: query
 *         schema:
 *           type: boolean
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Catálogo obtenido exitosamente
 */
router.get('/:businessId/config/suppliers/:id/catalog', BusinessSupplierController.getSupplierCatalog);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/catalog:
 *   post:
 *     summary: Agregar producto al catálogo
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplierSku
 *               - name
 *               - price
 *             properties:
 *               supplierSku:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               unit:
 *                 type: string
 *               minimumOrder:
 *                 type: number
 *               leadTime:
 *                 type: integer
 *               available:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Producto agregado exitosamente
 */
router.post('/:businessId/config/suppliers/:id/catalog', BusinessSupplierController.addProductToCatalog);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/catalog/{catalogItemId}:
 *   put:
 *     summary: Actualizar producto del catálogo
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: catalogItemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 */
router.put('/:businessId/config/suppliers/:id/catalog/:catalogItemId', BusinessSupplierController.updateCatalogProduct);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/catalog/{catalogItemId}:
 *   delete:
 *     summary: Eliminar producto del catálogo
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: catalogItemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 */
router.delete('/:businessId/config/suppliers/:id/catalog/:catalogItemId', BusinessSupplierController.removeCatalogProduct);

// ==================== EVALUACIONES ====================

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/evaluations:
 *   get:
 *     summary: Obtener evaluaciones del proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Evaluaciones obtenidas exitosamente
 */
router.get('/:businessId/config/suppliers/:id/evaluations', BusinessSupplierController.getSupplierEvaluations);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/evaluations:
 *   post:
 *     summary: Crear evaluación del proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qualityScore
 *               - deliveryScore
 *               - serviceScore
 *               - priceScore
 *             properties:
 *               qualityScore:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               deliveryScore:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               serviceScore:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               priceScore:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comments:
 *                 type: string
 *               period:
 *                 type: string
 *     responses:
 *       201:
 *         description: Evaluación creada exitosamente
 */
router.post('/:businessId/config/suppliers/:id/evaluations', BusinessSupplierController.createSupplierEvaluation);

// ==================== REPORTES Y ESTADÍSTICAS ====================

/**
 * @swagger
 * /business/{businessId}/config/suppliers/stats:
 *   get:
 *     summary: Obtener estadísticas de proveedores
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                     totalSuppliers:
 *                       type: integer
 *                     activeSuppliers:
 *                       type: integer
 *                     totalSpent:
 *                       type: number
 *                     pendingOrders:
 *                       type: integer
 *                     overdueInvoices:
 *                       type: integer
 */
router.get('/:businessId/config/suppliers/stats', BusinessSupplierController.getSuppliersStats);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/purchase-report:
 *   get:
 *     summary: Obtener reporte de compras
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: period
 *         in: query
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *       - name: supplierId
 *         in: query
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 */
router.get('/:businessId/config/suppliers/purchase-report', BusinessSupplierController.getPurchaseReport);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/performance-analysis:
 *   get:
 *     summary: Obtener análisis de rendimiento de proveedores
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: period
 *         in: query
 *         schema:
 *           type: string
 *       - name: minOrders
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Análisis generado exitosamente
 */
router.get('/:businessId/config/suppliers/performance-analysis', BusinessSupplierController.getSupplierPerformanceAnalysis);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/overdue-invoices:
 *   get:
 *     summary: Obtener facturas vencidas
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: days
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Facturas vencidas obtenidas exitosamente
 */
router.get('/:businessId/config/suppliers/overdue-invoices', BusinessSupplierController.getOverdueInvoices);

// ==================== GESTIÓN DE DOCUMENTOS ====================

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/documents:
 *   get:
 *     summary: Obtener documentos del proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: documentType
 *         in: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Documentos obtenidos exitosamente
 */
router.get('/:businessId/config/suppliers/:id/documents', BusinessSupplierController.getSupplierDocuments);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/documents:
 *   post:
 *     summary: Subir documento del proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *               - documentType
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               documentType:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Documento subido exitosamente
 */
router.post('/:businessId/config/suppliers/:id/documents', BusinessSupplierController.uploadSupplierDocument);

/**
 * @swagger
 * /business/{businessId}/config/suppliers/{id}/documents/{documentId}:
 *   delete:
 *     summary: Eliminar documento del proveedor
 *     tags: [Business Suppliers]
 *     parameters:
 *       - name: businessId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: documentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Documento eliminado exitosamente
 */
router.delete('/:businessId/config/suppliers/:id/documents/:documentId', BusinessSupplierController.deleteSupplierDocument);

// ==================== CONFIGURACIONES DE NUMERACIÓN ====================

/**
 * @swagger
 * /api/business/{businessId}/config/numbering:
 *   get:
 *     summary: Obtener configuraciones de numeración del negocio
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Configuraciones de numeración obtenidas exitosamente
 *       403:
 *         description: No tienes permisos para acceder
 *       404:
 *         description: Negocio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/numbering', BusinessConfigController.getNumberingSettings);

/**
 * @swagger
 * /api/business/{businessId}/config/numbering:
 *   put:
 *     summary: Actualizar configuraciones de numeración del negocio
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receipts:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   initialNumber:
 *                     type: integer
 *                     minimum: 1
 *                   prefix:
 *                     type: string
 *                   format:
 *                     type: string
 *                   padLength:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 10
 *                   resetYearly:
 *                     type: boolean
 *               invoices:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   initialNumber:
 *                     type: integer
 *                     minimum: 1
 *                   prefix:
 *                     type: string
 *                   format:
 *                     type: string
 *                   padLength:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 10
 *                   resetYearly:
 *                     type: boolean
 *               fiscal:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   taxxa_prefix:
 *                     type: string
 *                   tax_regime:
 *                     type: string
 *                     enum: [SIMPLIFIED, COMMON]
 *                   resolution_number:
 *                     type: string
 *                   resolution_date:
 *                     type: string
 *                     format: date
 *                   valid_from:
 *                     type: string
 *                     format: date
 *                   valid_to:
 *                     type: string
 *                     format: date
 *                   technical_key:
 *                     type: string
 *                   software_id:
 *                     type: string
 *     responses:
 *       200:
 *         description: Configuraciones actualizadas exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       403:
 *         description: No tienes permisos para modificar
 *       404:
 *         description: Negocio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:businessId/config/numbering', BusinessConfigController.updateNumberingSettings);

/**
 * @swagger
 * /api/business/{businessId}/config/numbering/preview:
 *   get:
 *     summary: Previsualizar formato de numeración
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *         example: "REC-{YEAR}-{NUMBER}"
 *       - in: query
 *         name: prefix
 *         schema:
 *           type: string
 *         example: "REC"
 *       - in: query
 *         name: padLength
 *         schema:
 *           type: integer
 *         example: 5
 *       - in: query
 *         name: number
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Vista previa generada exitosamente
 *       400:
 *         description: Formato requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/numbering/preview', BusinessConfigController.previewNumberFormat);

// ==================== CONFIGURACIONES DE COMUNICACIÓN ====================

/**
 * @swagger
 * /api/business/{businessId}/config/communications:
 *   get:
 *     summary: Obtener configuraciones de comunicación del negocio
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Configuraciones de comunicación obtenidas exitosamente
 *       403:
 *         description: No tienes permisos para acceder
 *       404:
 *         description: Negocio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:businessId/config/communications', BusinessConfigController.getCommunicationSettings);

/**
 * @swagger
 * /api/business/{businessId}/config/communications:
 *   put:
 *     summary: Actualizar configuraciones de comunicación del negocio
 *     tags: [Business Config]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               whatsapp:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   phone_number:
 *                     type: string
 *                     pattern: '^\+?[1-9]\d{1,14}$'
 *                   business_account_id:
 *                     type: string
 *                   access_token:
 *                     type: string
 *                   webhook_verify_token:
 *                     type: string
 *                   send_receipts:
 *                     type: boolean
 *                   send_appointments:
 *                     type: boolean
 *                   send_reminders:
 *                     type: boolean
 *               email:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   smtp_host:
 *                     type: string
 *                   smtp_port:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 65535
 *                   smtp_user:
 *                     type: string
 *                   smtp_password:
 *                     type: string
 *                   from_email:
 *                     type: string
 *                     format: email
 *                   from_name:
 *                     type: string
 *     responses:
 *       200:
 *         description: Configuraciones actualizadas exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       403:
 *         description: No tienes permisos para modificar
 *       404:
 *         description: Negocio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:businessId/config/communications', BusinessConfigController.updateCommunicationSettings);

module.exports = router;