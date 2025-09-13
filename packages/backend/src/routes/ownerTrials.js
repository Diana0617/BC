const express = require('express');
const router = express.Router();
const OwnerTrialController = require('../controllers/OwnerTrialController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

/**
 * @swagger
 * tags:
 *   name: Owner Trials
 *   description: Gestión de trials por parte del Owner
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TrialBusiness:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del negocio
 *         name:
 *           type: string
 *           description: Nombre del negocio
 *         status:
 *           type: string
 *           enum: [TRIAL, ACTIVE, INACTIVE]
 *           description: Estado del negocio
 *         trialEndDate:
 *           type: string
 *           format: date-time
 *           description: Fecha de finalización del trial
 *         daysLeft:
 *           type: integer
 *           description: Días restantes del trial
 *         isExpired:
 *           type: boolean
 *           description: Si el trial ha expirado
 *         isExpiringSoon:
 *           type: boolean
 *           description: Si el trial expira pronto (≤3 días)
 *         owner:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 *         subscription:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             status:
 *               type: string
 *             plan:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 trialDays:
 *                   type: integer
 * 
 *     TrialStats:
 *       type: object
 *       properties:
 *         period:
 *           type: string
 *           description: Período de las estadísticas
 *         activeTrials:
 *           type: integer
 *           description: Trials activos actualmente
 *         totalTrials:
 *           type: integer
 *           description: Total de trials en el período
 *         convertedTrials:
 *           type: integer
 *           description: Trials convertidos a suscripciones
 *         canceledTrials:
 *           type: integer
 *           description: Trials cancelados
 *         expiringSoon:
 *           type: integer
 *           description: Trials que expiran pronto
 *         rates:
 *           type: object
 *           properties:
 *             conversion:
 *               type: number
 *               description: Tasa de conversión (%)
 *             cancellation:
 *               type: number
 *               description: Tasa de cancelación (%)
 *         health:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [good, warning, needs_attention]
 *             message:
 *               type: string
 */

/**
 * @swagger
 * /api/owner/trials:
 *   get:
 *     summary: Obtener lista de trials activos y próximos a expirar
 *     tags: [Owner Trials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TRIAL, ACTIVE, all]
 *           default: TRIAL
 *         description: Filtrar por estado
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Filtrar trials que expiran en X días (all para todos)
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
 *         description: Elementos por página
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: trialEndDate
 *         description: Campo para ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de trials obtenida exitosamente
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
 *                     trials:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TrialBusiness'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         expiringSoon:
 *                           type: integer
 *                         expired:
 *                           type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', authenticateToken, ownerOnly, OwnerTrialController.getActiveTrials);

/**
 * @swagger
 * /api/owner/trials/stats:
 *   get:
 *     summary: Obtener estadísticas detalladas de trials
 *     tags: [Owner Trials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [last7days, last30days, last90days, all]
 *           default: last30days
 *         description: Período para las estadísticas
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
 *                   $ref: '#/components/schemas/TrialStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/stats', authenticateToken, ownerOnly, OwnerTrialController.getTrialStats);

/**
 * @swagger
 * /api/owner/trials/create:
 *   post:
 *     summary: Crear trial manual para un negocio específico
 *     tags: [Owner Trials]
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
 *               - trialDays
 *             properties:
 *               businessId:
 *                 type: integer
 *                 description: ID del negocio
 *               trialDays:
 *                 type: integer
 *                 default: 30
 *                 description: Duración del trial en días
 *               reason:
 *                 type: string
 *                 description: Razón para crear el trial manual
 *     responses:
 *       200:
 *         description: Trial creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     business:
 *                       $ref: '#/components/schemas/TrialBusiness'
 *                     trialInfo:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                         durationDays:
 *                           type: integer
 *                         reason:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.post('/create', authenticateToken, ownerOnly, OwnerTrialController.createManualTrial);

/**
 * @swagger
 * /api/owner/trials/{businessId}/extend:
 *   put:
 *     summary: Extender duración de un trial existente
 *     tags: [Owner Trials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - additionalDays
 *             properties:
 *               additionalDays:
 *                 type: integer
 *                 minimum: 1
 *                 description: Días adicionales para extender el trial
 *               reason:
 *                 type: string
 *                 description: Razón para extender el trial
 *     responses:
 *       200:
 *         description: Trial extendido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     businessId:
 *                       type: integer
 *                     previousEndDate:
 *                       type: string
 *                       format: date-time
 *                     newEndDate:
 *                       type: string
 *                       format: date-time
 *                     additionalDays:
 *                       type: integer
 *                     reason:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:businessId/extend', authenticateToken, ownerOnly, OwnerTrialController.extendTrial);

/**
 * @swagger
 * /api/owner/trials/{businessId}/convert:
 *   put:
 *     summary: Convertir trial a suscripción activa manualmente
 *     tags: [Owner Trials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: integer
 *                 description: ID del plan al cual convertir (opcional)
 *               reason:
 *                 type: string
 *                 description: Razón para la conversión manual
 *     responses:
 *       200:
 *         description: Trial convertido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     business:
 *                       $ref: '#/components/schemas/TrialBusiness'
 *                     conversionInfo:
 *                       type: object
 *                       properties:
 *                         convertedAt:
 *                           type: string
 *                           format: date-time
 *                         newPlan:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                         reason:
 *                           type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:businessId/convert', authenticateToken, ownerOnly, OwnerTrialController.convertTrialToActive);

/**
 * @swagger
 * /api/owner/trials/{businessId}/cancel:
 *   put:
 *     summary: Cancelar trial antes de tiempo
 *     tags: [Owner Trials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del negocio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Razón obligatoria para cancelar el trial
 *     responses:
 *       200:
 *         description: Trial cancelado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     businessId:
 *                       type: integer
 *                     canceledAt:
 *                       type: string
 *                       format: date-time
 *                     reason:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:businessId/cancel', authenticateToken, ownerOnly, OwnerTrialController.cancelTrial);

module.exports = router;