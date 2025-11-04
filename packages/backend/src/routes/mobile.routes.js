const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth.js');

const router = express.Router();

// Almacenamiento temporal en memoria (en producción usar Redis)
const sessionStore = new Map();

// Limpiar sesiones expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [code, data] of sessionStore.entries()) {
    if (now > data.expiresAt) {
      sessionStore.delete(code);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rutas para auto-login desde aplicación móvil
 * Permite crear códigos temporales cortos para evitar URLs largas
 */

/**
 * Crear un código de sesión temporal para auto-login desde móvil
 * POST /api/mobile/create-session
 * Headers: Authorization: Bearer <token>
 * Body: {}
 */
router.post('/create-session', authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }

    // Generar código corto (8 caracteres alfanuméricos)
    const code = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    
    // Almacenar con expiración de 2 minutos
    sessionStore.set(code, {
      token,
      expiresAt: Date.now() + (2 * 60 * 1000),
      createdAt: Date.now()
    });

    console.log(`✅ Sesión creada: ${code} (expira en 2 min)`);
    console.log(`📊 Sesiones activas: ${sessionStore.size}`);

    return res.json({
      success: true,
      data: {
        code,
        expiresIn: 120 // segundos
      }
    });
  } catch (error) {
    console.error('❌ Error creando sesión móvil:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al crear sesión temporal'
    });
  }
});

/**
 * Intercambiar código de sesión por token JWT
 * POST /api/mobile/exchange-session
 * Body: { code: "ABC12345" }
 */
router.post('/exchange-session', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Código no proporcionado'
      });
    }

    const sessionData = sessionStore.get(code);

    if (!sessionData) {
      return res.status(404).json({
        success: false,
        error: 'Código inválido o expirado'
      });
    }

    // Verificar si está expirado
    if (Date.now() > sessionData.expiresAt) {
      sessionStore.delete(code);
      return res.status(410).json({
        success: false,
        error: 'Código expirado'
      });
    }

    // Eliminar código (uso único)
    sessionStore.delete(code);

    console.log(`✅ Código intercambiado: ${code}`);
    console.log(`📊 Sesiones activas: ${sessionStore.size}`);

    return res.json({
      success: true,
      data: {
        token: sessionData.token
      }
    });
  } catch (error) {
    console.error('❌ Error intercambiando sesión:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al intercambiar código'
    });
  }
});

/**
 * Obtener estadísticas de sesiones (para debugging)
 * GET /api/mobile/session-stats
 */
router.get('/session-stats', async (req, res) => {
  const now = Date.now();
  const sessions = Array.from(sessionStore.entries()).map(([code, data]) => ({
    code,
    expiresIn: Math.max(0, Math.round((data.expiresAt - now) / 1000)),
    age: Math.round((now - data.createdAt) / 1000)
  }));

  return res.json({
    success: true,
    data: {
      totalSessions: sessionStore.size,
      sessions
    }
  });
});

module.exports = router;
