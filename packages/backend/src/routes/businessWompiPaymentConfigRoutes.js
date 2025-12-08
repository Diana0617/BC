/**
 * businessWompiPaymentConfigRoutes.js
 * 
 * Rutas para la configuración de pagos Wompi de cada Business.
 * 
 * IMPORTANTE: Estas rutas están COMPLETAMENTE SEPARADAS del sistema de
 * suscripciones de Beauty Control. Son para que cada negocio configure
 * sus propias credenciales de Wompi para recibir pagos de turnos online.
 */

const express = require('express')
const router = express.Router()
const BusinessWompiPaymentConfigController = require('../controllers/BusinessWompiPaymentConfigController')
const { authenticateToken } = require('../middleware/auth')

/**
 * Todas las rutas requieren autenticación
 * Solo el dueño del negocio o un ADMIN puede acceder
 */

/**
 * GET /api/business/:businessId/wompi-config
 * Obtener la configuración de Wompi del negocio
 */
router.get(
  '/:businessId/wompi-config',
  authenticateToken,
  BusinessWompiPaymentConfigController.getConfig
)

/**
 * POST /api/business/:businessId/wompi-config
 * Guardar o actualizar la configuración de Wompi del negocio
 */
router.post(
  '/:businessId/wompi-config',
  authenticateToken,
  BusinessWompiPaymentConfigController.saveConfig
)

/**
 * POST /api/business/:businessId/wompi-config/verify
 * Verificar las credenciales de Wompi haciendo una llamada real a la API
 */
router.post(
  '/:businessId/wompi-config/verify',
  authenticateToken,
  BusinessWompiPaymentConfigController.verifyCredentials
)

/**
 * PATCH /api/business/:businessId/wompi-config/toggle-mode
 * Cambiar entre modo test y producción
 */
router.patch(
  '/:businessId/wompi-config/toggle-mode',
  authenticateToken,
  BusinessWompiPaymentConfigController.toggleMode
)

/**
 * PATCH /api/business/:businessId/wompi-config/toggle-status
 * Activar o desactivar la configuración de Wompi
 */
router.patch(
  '/:businessId/wompi-config/toggle-status',
  authenticateToken,
  BusinessWompiPaymentConfigController.toggleStatus
)

module.exports = router
