const express = require('express');
const router = express.Router();
const DeveloperController = require('../controllers/DeveloperController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Middleware para verificar rol OWNER
 */
const ownerOnly = (req, res, next) => {
  if (req.user.role !== 'OWNER') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Solo para desarrolladores/administradores del sistema.'
    });
  }
  next();
};

// Todas las rutas requieren autenticación y rol OWNER
router.use(authenticateToken);
router.use(ownerOnly);

/**
 * @swagger
 * /api/developer/maintenance-mode:
 *   get:
 *     summary: Obtener estado del modo mantenimiento
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado actual del modo mantenimiento
 */
router.get('/maintenance-mode', DeveloperController.getMaintenanceMode);

/**
 * @swagger
 * /api/developer/maintenance-mode:
 *   post:
 *     summary: Activar/desactivar modo mantenimiento
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               message:
 *                 type: string
 *               estimatedEndTime:
 *                 type: string
 *                 format: date-time
 */
router.post('/maintenance-mode', DeveloperController.setMaintenanceMode);

/**
 * @swagger
 * /api/developer/data/{table}/{id}:
 *   delete:
 *     summary: Eliminar datos específicos (requiere confirmación)
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/data/:table/:id', DeveloperController.deleteData);

/**
 * @swagger
 * /api/developer/query:
 *   post:
 *     summary: Ejecutar query SQL de solo lectura
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 */
router.post('/query', DeveloperController.executeQuery);

/**
 * @swagger
 * /api/developer/stats:
 *   get:
 *     summary: Obtener estadísticas del sistema
 *     tags: [Developer]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', DeveloperController.getSystemStats);

module.exports = router;
