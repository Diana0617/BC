const express = require('express');
const router = express.Router();
const SpecialistServiceController = require('../controllers/SpecialistServiceController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * Rutas para gestión de servicios de especialistas
 * Todas las rutas requieren autenticación
 */

// Obtener servicios de un especialista
router.get(
  '/:specialistId/services',
  authenticateToken,
  SpecialistServiceController.getSpecialistServices
);

// Asignar un servicio a un especialista
router.post(
  '/:specialistId/services',
  authenticateToken,
  authorizeRole(['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER']),
  SpecialistServiceController.assignServiceToSpecialist
);

// Actualizar configuración de un servicio del especialista
router.put(
  '/:specialistId/services/:serviceId',
  authenticateToken,
  authorizeRole(['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER']),
  SpecialistServiceController.updateSpecialistService
);

// Eliminar un servicio del especialista
router.delete(
  '/:specialistId/services/:serviceId',
  authenticateToken,
  authorizeRole(['BUSINESS', 'BUSINESS_SPECIALIST', 'OWNER']),
  SpecialistServiceController.removeServiceFromSpecialist
);

module.exports = router;
