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

// TODO: Implementar estas rutas
router.post('/forgot-password', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de forgot-password aún no implementada'
  });
});

router.post('/reset-password', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de reset-password aún no implementada'
  });
});

router.get('/verify-email/:token', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Ruta de verify-email aún no implementada'
  });
});

module.exports = router;