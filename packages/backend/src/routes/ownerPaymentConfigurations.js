const express = require('express');
const router = express.Router();
const OwnerPaymentConfigurationController = require('../controllers/OwnerPaymentConfigurationController');
const { authenticateToken } = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');

// Middleware para todas las rutas - solo OWNER
router.use(authenticateToken);
router.use(ownerOnly);

/**
 * @route GET /api/owner/payment-configurations
 * @desc Obtener todas las configuraciones de pago del OWNER
 * @access Private (OWNER only)
 * @queryParams {string} provider - Filtrar por proveedor
 * @queryParams {boolean} isActive - Filtrar por estado activo
 * @queryParams {string} environment - Filtrar por ambiente (SANDBOX/PRODUCTION)
 * @queryParams {number} page - Página (default: 1)
 * @queryParams {number} limit - Elementos por página (default: 20)
 */
router.get('/', OwnerPaymentConfigurationController.getAllConfigurations);

/**
 * @route GET /api/owner/payment-configurations/active
 * @desc Obtener configuraciones activas (para dropdown)
 * @access Private (OWNER only)
 */
router.get('/active', OwnerPaymentConfigurationController.getActiveConfigurations);

/**
 * @route GET /api/owner/payment-configurations/:id
 * @desc Obtener una configuración específica por ID
 * @access Private (OWNER only)
 * @params {string} id - ID de la configuración
 */
router.get('/:id', OwnerPaymentConfigurationController.getConfigurationById);

/**
 * @route POST /api/owner/payment-configurations
 * @desc Crear nueva configuración de pago
 * @access Private (OWNER only)
 * @bodyParams {string} provider - Proveedor de pago (WOMPI, TAXXA, etc.)
 * @bodyParams {string} name - Nombre de la configuración
 * @bodyParams {string} environment - Ambiente (SANDBOX/PRODUCTION)
 * @bodyParams {object} configuration - Configuración específica del proveedor
 * @bodyParams {object} credentials - Credenciales del proveedor
 * @bodyParams {string} webhookUrl - URL del webhook (opcional)
 * @bodyParams {string} webhookSecret - Secret del webhook (opcional)
 * @bodyParams {array} supportedCurrencies - Monedas soportadas
 * @bodyParams {number} commissionRate - Tasa de comisión
 * @bodyParams {number} fixedFee - Tarifa fija
 * @bodyParams {number} maxAmount - Monto máximo (opcional)
 * @bodyParams {number} minAmount - Monto mínimo (opcional)
 * @bodyParams {boolean} isActive - Estado activo
 * @bodyParams {boolean} isDefault - Es configuración por defecto
 */
router.post('/', OwnerPaymentConfigurationController.createConfiguration);

/**
 * @route PUT /api/owner/payment-configurations/:id
 * @desc Actualizar configuración de pago
 * @access Private (OWNER only)
 * @params {string} id - ID de la configuración
 * @bodyParams {object} - Campos a actualizar
 */
router.put('/:id', OwnerPaymentConfigurationController.updateConfiguration);

/**
 * @route PATCH /api/owner/payment-configurations/:id/toggle
 * @desc Activar/Desactivar configuración de pago
 * @access Private (OWNER only)
 * @params {string} id - ID de la configuración
 */
router.patch('/:id/toggle', OwnerPaymentConfigurationController.toggleStatus);

/**
 * @route PATCH /api/owner/payment-configurations/:id/set-default
 * @desc Establecer como configuración por defecto
 * @access Private (OWNER only)
 * @params {string} id - ID de la configuración
 */
router.patch('/:id/set-default', OwnerPaymentConfigurationController.setAsDefault);

/**
 * @route POST /api/owner/payment-configurations/:id/test
 * @desc Probar configuración de pago
 * @access Private (OWNER only)
 * @params {string} id - ID de la configuración
 */
router.post('/:id/test', OwnerPaymentConfigurationController.testConfiguration);

/**
 * @route DELETE /api/owner/payment-configurations/:id
 * @desc Eliminar configuración de pago
 * @access Private (OWNER only)
 * @params {string} id - ID de la configuración
 */
router.delete('/:id', OwnerPaymentConfigurationController.deleteConfiguration);

module.exports = router;