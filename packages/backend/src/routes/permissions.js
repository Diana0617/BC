const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/PermissionController');
const { authenticateToken } = require('../middleware/auth');
const { businessAndOwner } = require('../middleware/roleCheck');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los permisos disponibles (cualquier usuario autenticado puede ver el catálogo)
router.get('/', PermissionController.getAllPermissions);

// Obtener permisos por defecto de un rol (solo BUSINESS y OWNER)
router.get('/role/:role/defaults', businessAndOwner, PermissionController.getRoleDefaults);

// Obtener permisos efectivos de un usuario en un negocio
router.get('/user/:userId/business/:businessId', PermissionController.getUserPermissions);

// Conceder permiso (solo BUSINESS y OWNER)
router.post('/grant', businessAndOwner, PermissionController.grantPermission);

// Revocar permiso (solo BUSINESS y OWNER)
router.post('/revoke', businessAndOwner, PermissionController.revokePermission);

// Conceder múltiples permisos (solo BUSINESS y OWNER)
router.post('/grant-bulk', businessAndOwner, PermissionController.grantBulkPermissions);

// Revocar múltiples permisos (solo BUSINESS y OWNER)
router.post('/revoke-bulk', businessAndOwner, PermissionController.revokeBulkPermissions);

// Resetear permisos a valores por defecto (solo BUSINESS y OWNER)
router.post('/reset', businessAndOwner, PermissionController.resetToDefaults);

module.exports = router;
