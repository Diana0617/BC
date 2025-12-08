/**
 * Rutas para gestión del cache del sistema
 * Solo disponible para usuarios OWNER
 */

const express = require('express');
const router = express.Router();
const CacheController = require('../controllers/CacheController');
const { authenticateToken } = require('../middleware/auth');

// Middleware para verificar que el usuario sea OWNER
const requireOwner = (req, res, next) => {
  if (req.user.role !== 'OWNER') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo para administradores.'
    });
  }
  next();
};

// Aplicar autenticación y verificación de OWNER a todas las rutas
router.use(authenticateToken);
router.use(requireOwner);

/**
 * @swagger
 * /api/cache/stats:
 *   get:
 *     tags: [Cache]
 *     summary: Obtener estadísticas del cache
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del cache
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
 *                     size:
 *                       type: number
 *                     keys:
 *                       type: array
 *                     memory:
 *                       type: string
 */
router.get('/stats', CacheController.getStats);

/**
 * @swagger
 * /api/cache/clear:
 *   delete:
 *     tags: [Cache]
 *     summary: Limpiar todo el cache
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache limpiado exitosamente
 */
router.delete('/clear', CacheController.clearAll);

/**
 * @swagger
 * /api/cache/clear/dashboard:
 *   delete:
 *     tags: [Cache]
 *     summary: Limpiar solo cache del dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache del dashboard limpiado
 */
router.delete('/clear/dashboard', CacheController.clearDashboard);

/**
 * @swagger
 * /api/cache/keys:
 *   get:
 *     tags: [Cache]
 *     summary: Obtener todas las claves del cache
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de claves del cache
 */
router.get('/keys', CacheController.getKeys);

/**
 * @swagger
 * /api/cache/key/{key}:
 *   get:
 *     tags: [Cache]
 *     summary: Verificar si existe una clave específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Información sobre la clave
 */
router.get('/key/:key', CacheController.checkKey);

/**
 * @swagger
 * /api/cache/key/{key}:
 *   delete:
 *     tags: [Cache]
 *     summary: Eliminar una clave específica del cache
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Clave eliminada del cache
 */
router.delete('/key/:key', CacheController.clearKey);

module.exports = router;