const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         fullName:
 *           type: string
 *           description: Nombre completo del usuario
 *         role:
 *           type: string
 *           enum: [OWNER, BUSINESS, SPECIALIST, CLIENT]
 *           description: Rol del usuario en el sistema
 *         phone:
 *           type: string
 *           description: Teléfono del usuario
 *         isActive:
 *           type: boolean
 *           description: Estado activo del usuario
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *         message:
 *           type: string
 *           description: Mensaje descriptivo
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 *           description: JWT token para autenticación
 *         refreshToken:
 *           type: string
 *           description: Token para renovar la sesión
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "usuario@ejemplo.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "123456"
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - fullName
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "nuevo@ejemplo.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "123456"
 *         fullName:
 *           type: string
 *           example: "Juan Pérez"
 *         role:
 *           type: string
 *           enum: [BUSINESS, SPECIALIST, CLIENT]
 *           example: "BUSINESS"
 *         phone:
 *           type: string
 *           example: "+57 300 123 4567"
 *     
 *     PasswordResetRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "usuario@ejemplo.com"
 *     
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *           example: "abcd1234efgh5678"
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           example: "nuevaContraseña123"
 *     
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: "contraseñaActual"
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           example: "nuevaContraseña123"
 *     
 *     SubdomainRequest:
 *       type: object
 *       required:
 *         - businessName
 *       properties:
 *         businessName:
 *           type: string
 *           example: "Salón de Belleza María"
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * Rutas de Autenticación - Beauty Control
 * Todas las rutas relacionadas con auth (login, register, etc.)
 */

/**
 * @swagger
 * tags:
 *   - name: 🔐 Autenticación
 *     description: Endpoints para autenticación y gestión de usuarios
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema
 *     tags: [🔐 Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             business:
 *               summary: Registro de negocio
 *               value:
 *                 email: "negocio@ejemplo.com"
 *                 password: "123456"
 *                 fullName: "Salón de Belleza María"
 *                 role: "BUSINESS"
 *                 phone: "+57 300 123 4567"
 *             specialist:
 *               summary: Registro de especialista
 *               value:
 *                 email: "especialista@ejemplo.com"
 *                 password: "123456"
 *                 fullName: "Ana García"
 *                 role: "SPECIALIST"
 *                 phone: "+57 301 234 5678"
 *             client:
 *               summary: Registro de cliente
 *               value:
 *                 email: "cliente@ejemplo.com"
 *                 password: "123456"
 *                 fullName: "Carlos López"
 *                 role: "CLIENT"
 *                 phone: "+57 302 345 6789"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Usuario ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Registro de nuevos usuarios
router.post('/register', AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario con email y contraseña, retorna JWT token
 *     tags: [🔐 Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             business:
 *               summary: Login como negocio
 *               value:
 *                 email: "negocio@ejemplo.com"
 *                 password: "123456"
 *             specialist:
 *               summary: Login como especialista
 *               value:
 *                 email: "especialista@ejemplo.com"
 *                 password: "123456"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciales incorrectas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Login de usuarios
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Invalida el token JWT del usuario
 *     tags: [🔐 Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Logout de usuarios
router.post('/logout', AuthController.logout);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Renovar token JWT
 *     description: Genera un nuevo token JWT usando el refresh token
 *     tags: [🔐 Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de renovación
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Refresh token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Refrescar token
router.post('/refresh-token', AuthController.refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario
 *     description: Retorna la información del perfil del usuario autenticado
 *     tags: [🔐 Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, AuthController.getProfile);

// =====================================
// RUTAS DE RECUPERACIÓN DE CONTRASEÑA
// =====================================

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     description: Envía un email con enlace para recuperar contraseña
 *     tags: [🔐 Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordResetRequest'
 *     responses:
 *       200:
 *         description: Email de recuperación enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Email requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Solicitar recuperación de contraseña (envía email)
router.post('/forgot-password', AuthController.requestPasswordReset);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   get:
 *     summary: Verificar token de recuperación
 *     description: Verifica si el token de recuperación es válido
 *     tags: [🔐 Autenticación]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de recuperación de contraseña
 *         example: "abcd1234efgh5678"
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 email:
 *                   type: string
 *                   description: Email asociado al token
 *       400:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Verificar token de recuperación
router.get('/reset-password/:token', AuthController.verifyResetToken);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     description: Cambia la contraseña usando un token de recuperación
 *     tags: [🔐 Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Datos inválidos o token expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Restablecer contraseña con token
router.post('/reset-password', AuthController.resetPassword);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Cambiar contraseña
 *     description: Cambia la contraseña del usuario autenticado
 *     tags: [🔐 Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Contraseña actual incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Cambiar contraseña (usuario autenticado)
router.post('/change-password', authenticateToken, AuthController.changePassword);

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Verificar email (No implementado)
 *     description: Verificación de email - Funcionalidad pendiente
 *     tags: [🔐 Autenticación]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificación de email
 *     responses:
 *       501:
 *         description: Funcionalidad no implementada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/auth/suggest-subdomain:
 *   post:
 *     summary: Sugerir subdominio
 *     description: Genera sugerencias de subdominio basadas en el nombre del negocio
 *     tags: [🏢 Subdominios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *             properties:
 *               businessName:
 *                 type: string
 *                 description: Nombre del negocio
 *                 example: "Salon de Belleza María"
 *           example:
 *             businessName: "Salon de Belleza María"
 *     responses:
 *       200:
 *         description: Sugerencias generadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["salonmaria", "bellezamaria", "mariasalon"]
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Sugerir subdominio basado en nombre del negocio
router.post('/suggest-subdomain', AuthController.suggestSubdomain);

/**
 * @swagger
 * /api/auth/check-subdomain/{subdomain}:
 *   get:
 *     summary: Verificar disponibilidad de subdominio
 *     description: Verifica si un subdominio específico está disponible
 *     tags: [🏢 Subdominios]
 *     parameters:
 *       - in: path
 *         name: subdomain
 *         required: true
 *         schema:
 *           type: string
 *         description: Subdominio a verificar
 *         example: "miempresa"
 *     responses:
 *       200:
 *         description: Verificación completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 available:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Subdominio disponible"
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Verificar disponibilidad de subdominio
router.get('/check-subdomain/:subdomain', AuthController.checkSubdomainAvailability);

module.exports = router;