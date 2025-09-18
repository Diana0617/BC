const express = require('express');
const router = express.Router();
const BusinessController = require('../controllers/BusinessController');
const { authenticateToken } = require('../middleware/auth');
const tenancyMiddleware = require('../middleware/tenancy');
const { ownerOnly, businessAndOwner, allStaffRoles } = require('../middleware/roleCheck');

/**
 * Rutas de Negocios - Beauty Control
 * Gestión de negocios, empleados y configuraciones
 */

// =====================================
// RUTAS PÚBLICAS (sin autenticación)
// =====================================

/**
 * @swagger
 * /api/business:
 *   post:
 *     summary: Crear nuevo negocio (Registro público)
 *     description: Permite a cualquier persona crear un negocio. Si el usuario no existe, se crea automáticamente. El usuario se convierte en BUSINESS.
 *     tags: [🏢 Gestión de Negocios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subscriptionPlanId
 *               - userEmail
 *               - userPassword
 *               - firstName
 *               - lastName
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del negocio
 *                 example: "Salon de Belleza María"
 *               description:
 *                 type: string
 *                 description: Descripción del negocio
 *                 example: "Salon especializado en tratamientos capilares"
 *               email:
 *                 type: string
 *                 description: Email del negocio
 *                 example: "contacto@salonmaria.com"
 *               phone:
 *                 type: string
 *                 description: Teléfono del negocio
 *                 example: "+57 300 123 4567"
 *               address:
 *                 type: string
 *                 description: Dirección del negocio
 *                 example: "Calle 123 #45-67, Bogotá"
 *               city:
 *                 type: string
 *                 description: Ciudad
 *                 example: "Bogotá"
 *               state:
 *                 type: string
 *                 description: Departamento/Estado
 *                 example: "Cundinamarca"
 *               country:
 *                 type: string
 *                 description: País
 *                 example: "Colombia"
 *               zipCode:
 *                 type: string
 *                 description: Código postal
 *                 example: "110111"
 *               website:
 *                 type: string
 *                 description: Sitio web del negocio
 *                 example: "https://salonmaria.com"
 *               subdomain:
 *                 type: string
 *                 description: Subdominio único para el negocio
 *                 example: "salonmaria"
 *               subscriptionPlanId:
 *                 type: integer
 *                 description: ID del plan de suscripción seleccionado
 *                 example: 1
 *               userEmail:
 *                 type: string
 *                 description: Email del usuario administrador
 *                 example: "admin@salonmaria.com"
 *               userPassword:
 *                 type: string
 *                 description: Contraseña del usuario administrador
 *                 example: "password123"
 *               firstName:
 *                 type: string
 *                 description: Nombre del usuario administrador
 *                 example: "María"
 *               lastName:
 *                 type: string
 *                 description: Apellido del usuario administrador
 *                 example: "García"
 *     responses:
 *       201:
 *         description: Negocio creado exitosamente
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
 *                   example: "Negocio creado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     business:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         subdomain:
 *                           type: string
 *                         status:
 *                           type: string
 *                         trialEndDate:
 *                           type: string
 *                           format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         role:
 *                           type: string
 *                           example: "BUSINESS"
 *                         businessId:
 *                           type: integer
 *                     tokens:
 *                       type: object
 *                       properties:
 *                         accessToken:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email ya registrado o subdominio no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Crear nuevo negocio (endpoint público)
router.post('/', BusinessController.createBusiness);

// =====================================
// RUTAS AUTENTICADAS
// =====================================

// Las siguientes rutas requieren autenticación
router.use(authenticateToken);
// RUTAS PARA STAFF DEL NEGOCIO (con tenancy)
// =====================================

// Aplicar tenancy para las siguientes rutas
router.use(tenancyMiddleware);

/**
 * @swagger
 * /api/business:
 *   get:
 *     summary: Obtener información del negocio
 *     description: Obtiene la información completa del negocio actual (requiere tenancy)
 *     tags: [🏢 Gestión de Negocios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-business-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del negocio (tenancy)
 *     responses:
 *       200:
 *         description: Información del negocio obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 business:
 *                   $ref: '#/components/schemas/Business'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos para acceder a este negocio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Obtener información del negocio
router.get('/', allStaffRoles, BusinessController.getBusiness);

/**
 * @swagger
 * /api/business:
 *   put:
 *     summary: Actualizar información del negocio
 *     description: Actualiza la información del negocio (solo BUSINESS owner y OWNER)
 *     tags: [🏢 Gestión de Negocios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-business-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del negocio (tenancy)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del negocio
 *                 example: "Salon de Belleza María Renovado"
 *               businessType:
 *                 type: string
 *                 description: Tipo de negocio
 *                 example: "salon"
 *               phone:
 *                 type: string
 *                 description: Teléfono del negocio
 *                 example: "+57 300 123 4567"
 *               address:
 *                 type: string
 *                 description: Dirección del negocio
 *                 example: "Calle 123 #45-67, Bogotá"
 *               description:
 *                 type: string
 *                 description: Descripción del negocio
 *                 example: "Salon especializado en tratamientos capilares y faciales"
 *     responses:
 *       200:
 *         description: Negocio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 business:
 *                   $ref: '#/components/schemas/Business'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos para modificar este negocio
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Actualizar información del negocio
router.put('/', businessAndOwner, BusinessController.updateBusiness);

/**
 * @swagger
 * /api/business/invite-employee:
 *   post:
 *     summary: Invitar empleado al negocio
 *     description: Envía invitación a un empleado para unirse al negocio (solo BUSINESS owner y OWNER)
 *     tags: [🏢 Gestión de Negocios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-business-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del negocio (tenancy)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del empleado a invitar
 *                 example: "empleado@ejemplo.com"
 *               role:
 *                 type: string
 *                 enum: [SPECIALIST, BUSINESS]
 *                 description: Rol que tendrá el empleado
 *                 example: "SPECIALIST"
 *               firstName:
 *                 type: string
 *                 description: Nombre del empleado
 *                 example: "Juan"
 *               lastName:
 *                 type: string
 *                 description: Apellido del empleado
 *                 example: "Pérez"
 *     responses:
 *       200:
 *         description: Invitación enviada exitosamente
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
 *                   example: "Invitación enviada exitosamente"
 *                 invitationId:
 *                   type: string
 *                   format: uuid
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Sin permisos para invitar empleados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Invitar empleado al negocio
router.post('/invite-employee', businessAndOwner, BusinessController.inviteEmployee);

/**
 * @swagger
 * /api/business/rules:
 *   get:
 *     summary: Obtener reglas del negocio
 *     description: Obtiene las reglas de configuración del negocio (No implementado)
 *     tags: [🏢 Gestión de Negocios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-business-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del negocio (tenancy)
 *     responses:
 *       501:
 *         description: Funcionalidad no implementada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Obtener reglas del negocio
router.get('/rules', allStaffRoles, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de obtener reglas del negocio aún no implementada'
  });
});

/**
 * @swagger
 * /api/business/rules:
 *   put:
 *     summary: Actualizar reglas del negocio
 *     description: Actualiza las reglas de configuración del negocio (No implementado)
 *     tags: [🏢 Gestión de Negocios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-business-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del negocio (tenancy)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rules:
 *                 type: array
 *                 description: Reglas de configuración del negocio
 *                 items:
 *                   type: object
 *     responses:
 *       501:
 *         description: Funcionalidad no implementada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Actualizar reglas del negocio
router.put('/rules', businessAndOwner, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de actualizar reglas del negocio aún no implementada'
  });
});

/**
 * @swagger
 * /api/business/stats:
 *   get:
 *     summary: Obtener estadísticas del negocio
 *     description: Obtiene estadísticas y métricas del negocio (No implementado)
 *     tags: [🏢 Gestión de Negocios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: x-business-id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del negocio (tenancy)
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *         description: Período para las estadísticas
 *     responses:
 *       501:
 *         description: Funcionalidad no implementada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Obtener estadísticas del negocio
router.get('/stats', allStaffRoles, (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de estadísticas del negocio aún no implementada'
  });
});

// =====================================
// RUTAS DE GESTIÓN DE PAGOS DE NEGOCIOS
// =====================================

/**
 * Sub-rutas para gestión de pagos desde el lado del negocio
 * Incluye: consulta de suscripción, subida de comprobantes, historial
 */
router.use('/', require('./businessPayments'));

module.exports = router;