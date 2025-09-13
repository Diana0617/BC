const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const BusinessConfigController = require('../controllers/BusinessConfigController');

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

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

module.exports = router;