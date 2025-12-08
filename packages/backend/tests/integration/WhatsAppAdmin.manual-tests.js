/**
 * WhatsApp Admin Controller - API Documentation & Manual Testing Guide
 * 
 * Este archivo documenta todos los 22 endpoints del WhatsAppAdminController
 * y proporciona ejemplos de cURL para testing manual.
 * 
 * Para testing automatizado completo, se requiere configurar una base de datos
 * de prueba (actualmente los modelos requieren Sequelize inicializado).
 */

// ============================================================================
// SETUP
// ============================================================================

/*
1. Obtener un token de autenticación:
   POST http://localhost:5000/api/auth/login
   Body: { "email": "admin@example.com", "password": "password" }
   
2. Usar el token en el header Authorization: Bearer <TOKEN>

3. Reemplazar {businessId} con el ID de tu negocio
*/

// ============================================================================
// TOKEN MANAGEMENT ENDPOINTS (7)
// ============================================================================

/**
 * 1. GET /api/business/:businessId/admin/whatsapp/token
 * Obtener información del token actual
 */
const getTokenInfo = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/token" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * 2. POST /api/business/:businessId/admin/whatsapp/token
 * Almacenar nuevo token (manual)
 */
const storeToken = `
curl -X POST "http://localhost:5000/api/business/1/admin/whatsapp/token" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "accessToken": "EAAtest-token-from-meta-12345",
    "phoneNumberId": "123456789012345",
    "wabaId": "098765432109876"
  }'
`;

/**
 * 3. POST /api/business/:businessId/admin/whatsapp/token/rotate
 * Rotar token existente
 */
const rotateToken = `
curl -X POST "http://localhost:5000/api/business/1/admin/whatsapp/token/rotate" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "newAccessToken": "EAAnew-rotated-token-12345"
  }'
`;

/**
 * 4. DELETE /api/business/:businessId/admin/whatsapp/token
 * Eliminar token
 */
const deleteToken = `
curl -X DELETE "http://localhost:5000/api/business/1/admin/whatsapp/token" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * 5. GET /api/business/:businessId/admin/whatsapp/token/test
 * Probar conexión con Meta
 */
const testConnection = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/token/test" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * 6. GET /api/business/:businessId/admin/whatsapp/token/history
 * Obtener historial de cambios de token
 */
const getTokenHistory = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/token/history?page=1&limit=10" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * 7. GET /api/business/:businessId/admin/whatsapp/token/audit
 * Obtener auditoría de operaciones con token
 */
const getTokenAudit = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/token/audit?page=1&limit=20" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

// ============================================================================
// EMBEDDED SIGNUP ENDPOINTS (2)
// ============================================================================

/**
 * 8. GET /api/business/:businessId/admin/whatsapp/embedded-signup/config
 * Obtener configuración para Embedded Signup (OAuth)
 */
const getEmbeddedSignupConfig = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/embedded-signup/config" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * 9. POST /api/business/:businessId/admin/whatsapp/embedded-signup/callback
 * Procesar callback de Embedded Signup
 */
const handleEmbeddedSignupCallback = `
curl -X POST "http://localhost:5000/api/business/1/admin/whatsapp/embedded-signup/callback" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "auth-code-from-meta",
    "state": "whatsapp_signup_1_1234567890"
  }'
`;

// ============================================================================
// TEMPLATE MANAGEMENT ENDPOINTS (6)
// ============================================================================

/**
 * 10. GET /api/business/:businessId/admin/whatsapp/templates
 * Listar plantillas con filtros y paginación
 */
const getTemplates = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/templates?page=1&limit=10&status=APPROVED" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * 11. POST /api/business/:businessId/admin/whatsapp/templates
 * Crear nueva plantilla (draft)
 */
const createTemplate = `
curl -X POST "http://localhost:5000/api/business/1/admin/whatsapp/templates" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "appointment_reminder",
    "language": "es",
    "category": "UTILITY",
    "components": [
      {
        "type": "HEADER",
        "format": "TEXT",
        "text": "Recordatorio de Cita"
      },
      {
        "type": "BODY",
        "text": "Hola {{1}}, tienes una cita el {{2}} a las {{3}}. ¿Confirmas tu asistencia?"
      },
      {
        "type": "FOOTER",
        "text": "Beauty Control"
      },
      {
        "type": "BUTTONS",
        "buttons": [
          { "type": "QUICK_REPLY", "text": "Confirmar" },
          { "type": "QUICK_REPLY", "text": "Cancelar" }
        ]
      }
    ]
  }'
`;

/**
 * 12. PUT /api/business/:businessId/admin/whatsapp/templates/:templateId
 * Actualizar plantilla (solo DRAFT o REJECTED)
 */
const updateTemplate = `
curl -X PUT "http://localhost:5000/api/business/1/admin/whatsapp/templates/123" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "appointment_reminder_v2",
    "components": [
      {
        "type": "BODY",
        "text": "Actualización del mensaje..."
      }
    ]
  }'
`;

/**
 * 13. POST /api/business/:businessId/admin/whatsapp/templates/:templateId/submit
 * Enviar plantilla a Meta para aprobación
 */
const submitTemplate = `
curl -X POST "http://localhost:5000/api/business/1/admin/whatsapp/templates/123/submit" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * 14. DELETE /api/business/:businessId/admin/whatsapp/templates/:templateId
 * Eliminar plantilla (solo DRAFT o REJECTED)
 */
const deleteTemplate = `
curl -X DELETE "http://localhost:5000/api/business/1/admin/whatsapp/templates/123" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * 15. GET /api/business/:businessId/admin/whatsapp/templates/sync
 * Sincronizar plantillas con Meta
 */
const syncTemplates = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/templates/sync" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

// ============================================================================
// MESSAGE HISTORY ENDPOINTS (2)
// ============================================================================

/**
 * 16. GET /api/business/:businessId/admin/whatsapp/messages
 * Listar mensajes enviados con filtros
 */
const getMessages = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/messages?status=SENT&startDate=2025-01-01&endDate=2025-12-31" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * 17. GET /api/business/:businessId/admin/whatsapp/messages/:messageId
 * Obtener detalle de un mensaje
 */
const getMessageDetail = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/messages/msg-uuid-123" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

// ============================================================================
// WEBHOOK EVENTS ENDPOINTS (3)
// ============================================================================

/**
 * 18. GET /api/business/:businessId/admin/whatsapp/webhooks/events
 * Listar eventos de webhook
 */
const getWebhookEvents = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/webhooks/events?eventType=message_status&page=1" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * 19. GET /api/business/:businessId/admin/whatsapp/webhooks/events/:eventId
 * Obtener detalle de un evento
 */
const getWebhookEventDetail = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/webhooks/events/event-uuid-123" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * 20. POST /api/business/:businessId/admin/whatsapp/webhooks/events/:eventId/replay
 * Re-procesar un evento de webhook
 */
const replayWebhookEvent = `
curl -X POST "http://localhost:5000/api/business/1/admin/whatsapp/webhooks/events/event-uuid-123/replay" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

// ============================================================================
// HEALTH & STATS ENDPOINTS (2)
// ============================================================================

/**
 * 21. GET /api/business/:businessId/admin/whatsapp/health
 * Obtener estado de salud de la integración
 */
const getHealth = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/health" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

/**
 * 22. GET /api/business/:businessId/admin/whatsapp/stats
 * Obtener estadísticas generales
 */
const getStats = `
curl -X GET "http://localhost:5000/api/business/1/admin/whatsapp/stats" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/*
✅ FASE 4A: Manual Testing Checklist

TOKEN MANAGEMENT:
[ ] 1. Get token info - debe retornar estado actual
[ ] 2. Store token - debe guardar y encriptar token
[ ] 3. Rotate token - debe actualizar token existente
[ ] 4. Delete token - debe eliminar y auditar
[ ] 5. Test connection - debe validar contra API de Meta
[ ] 6. Get token history - debe mostrar cambios
[ ] 7. Get token audit - debe mostrar operaciones

EMBEDDED SIGNUP:
[ ] 8. Get config - debe retornar datos para OAuth
[ ] 9. Handle callback - debe procesar código de autorización

TEMPLATES:
[ ] 10. List templates - debe filtrar y paginar
[ ] 11. Create template - debe crear DRAFT
[ ] 12. Update template - solo DRAFT/REJECTED
[ ] 13. Submit template - debe enviar a Meta
[ ] 14. Delete template - solo DRAFT/REJECTED
[ ] 15. Sync templates - debe traer desde Meta

MESSAGES:
[ ] 16. List messages - debe filtrar por status/fecha
[ ] 17. Get message detail - debe mostrar info completa

WEBHOOKS:
[ ] 18. List webhook events - debe filtrar por tipo
[ ] 19. Get event detail - debe mostrar payload
[ ] 20. Replay event - debe re-procesar

HEALTH & STATS:
[ ] 21. Health check - debe reportar estado
[ ] 22. Get stats - debe mostrar métricas

SECURITY:
[ ] Authentication - rechaza sin token
[ ] Authorization - rechaza acceso a otro negocio
[ ] Validation - rechaza datos inválidos
[ ] Encryption - tokens encriptados en DB
[ ] Audit - registra operaciones sensibles
*/

// ============================================================================
// EXPECTED RESPONSES
// ============================================================================

/*
SUCCESS RESPONSE:
{
  "success": true,
  "data": { ... },
  "message": "Operación completada"
}

ERROR RESPONSE:
{
  "success": false,
  "message": "Descripción del error",
  "errors": [ ... ] // Para errores de validación
}

PAGINATION RESPONSE:
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
*/

module.exports = {
  // Export all cURL commands for external testing tools
  tokenManagement: {
    getTokenInfo,
    storeToken,
    rotateToken,
    deleteToken,
    testConnection,
    getTokenHistory,
    getTokenAudit
  },
  embeddedSignup: {
    getEmbeddedSignupConfig,
    handleEmbeddedSignupCallback
  },
  templates: {
    getTemplates,
    createTemplate,
    updateTemplate,
    submitTemplate,
    deleteTemplate,
    syncTemplates
  },
  messages: {
    getMessages,
    getMessageDetail
  },
  webhooks: {
    getWebhookEvents,
    getWebhookEventDetail,
    replayWebhookEvent
  },
  health: {
    getHealth,
    getStats
  }
};
