/**
 * Rutas específicas para el rol OWNER
 * 
 * Estas rutas contienen todas las funcionalidades administrativas
 * que solo puede usar el administrador de la plataforma.
 */

const express = require('express');
const router = express.Router();
const OwnerController = require('../controllers/OwnerController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Middleware para autenticación y verificación de rol OWNER
router.use(authenticateToken);
router.use(ownerOnly);

// === ESTADÍSTICAS DE LA PLATAFORMA ===

/**
 * @route GET /api/owner/stats/platform
 * @desc Obtener estadísticas globales de la plataforma
 * @access Private (solo OWNER)
 * @returns {object} Estadísticas de usuarios, negocios, suscripciones e ingresos
 */
router.get('/stats/platform', OwnerController.getPlatformStats);

// === GESTIÓN DE NEGOCIOS ===

/**
 * @route GET /api/owner/businesses
 * @desc Listar todos los negocios de la plataforma
 * @access Private (solo OWNER)
 * @query {number} page - Número de página (default: 1)
 * @query {number} limit - Elementos por página (default: 10)
 * @query {string} status - Filtrar por estado
 * @query {string} search - Búsqueda por nombre o email
 */
router.get('/businesses', OwnerController.getAllBusinesses);

/**
 * @route POST /api/owner/businesses
 * @desc Crear un negocio manualmente (registro administrativo)
 * @access Private (solo OWNER)
 * @body {object} businessData - Datos del negocio y propietario
 * @body {string} businessData.businessName - Nombre del negocio
 * @body {string} businessData.businessEmail - Email del negocio
 * @body {string} businessData.businessPhone - Teléfono del negocio
 * @body {string} businessData.address - Dirección
 * @body {string} businessData.city - Ciudad
 * @body {string} businessData.country - País
 * @body {string} businessData.ownerEmail - Email del propietario
 * @body {string} businessData.ownerFirstName - Nombre del propietario
 * @body {string} businessData.ownerLastName - Apellido del propietario
 * @body {string} businessData.ownerPhone - Teléfono del propietario
 * @body {string} businessData.subscriptionPlanId - ID del plan inicial
 */
router.post('/businesses', OwnerController.createBusinessManually);

/**
 * @route PATCH /api/owner/businesses/:businessId/status
 * @desc Activar/Desactivar un negocio
 * @access Private (solo OWNER)
 * @param {string} businessId - ID del negocio
 * @body {string} status - Nuevo estado (ACTIVE, INACTIVE, SUSPENDED)
 * @body {string} reason - Razón del cambio de estado
 */
router.patch('/businesses/:businessId/status', OwnerController.toggleBusinessStatus);

// === GESTIÓN DE SUSCRIPCIONES ===

/**
 * @route POST /api/owner/subscriptions
 * @desc Crear una suscripción para un negocio
 * @access Private (solo OWNER)
 * @body {string} businessId - ID del negocio
 * @body {string} subscriptionPlanId - ID del plan de suscripción
 * @body {number} duration - Duración en meses (default: 1)
 */
router.post('/subscriptions', OwnerController.createSubscription);

/**
 * @route PATCH /api/owner/subscriptions/:subscriptionId/cancel
 * @desc Cancelar una suscripción
 * @access Private (solo OWNER)
 * @param {string} subscriptionId - ID de la suscripción
 * @body {string} reason - Razón de la cancelación
 */
router.patch('/subscriptions/:subscriptionId/cancel', OwnerController.cancelSubscription);

module.exports = router;