const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Rutas de Autenticación - Beauty Control
 * Todas las rutas relacionadas con auth (login, register, etc.)
 */

// Registro de nuevos usuarios
router.post('/register', AuthController.register);

// Login de usuarios
router.post('/login', AuthController.login);

// Logout de usuarios
router.post('/logout', AuthController.logout);

// Refrescar token
router.post('/refresh-token', AuthController.refreshToken);

// Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, AuthController.getProfile);

// =====================================
// RUTAS DE RECUPERACIÓN DE CONTRASEÑA
// =====================================

// Solicitar recuperación de contraseña (envía email)
router.post('/forgot-password', AuthController.requestPasswordReset);

// Verificar token de recuperación
router.get('/reset-password/:token', AuthController.verifyResetToken);

// Restablecer contraseña con token
router.post('/reset-password', AuthController.resetPassword);

// Cambiar contraseña (usuario autenticado)
router.post('/change-password', authenticateToken, AuthController.changePassword);

// TODO: Implementar verificación de email
router.get('/verify-email/:token', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de verify-email aún no implementada'
  });
});

// =====================================
// RUTAS DE SUBDOMINIO (PREPARADAS PARA PRODUCCIÓN)
// =====================================

// Sugerir subdominio basado en nombre del negocio
router.post('/suggest-subdomain', AuthController.suggestSubdomain);

// Verificar disponibilidad de subdominio
router.get('/check-subdomain/:subdomain', AuthController.checkSubdomainAvailability);

module.exports = router;