# 🔄 Sistema de Auto-Renovación - Guía Completa

## 📋 Descripción General

El sistema de auto-renovación automatiza completamente el proceso de renovación de suscripciones, incluyendo:

- ✅ **Procesamiento automático** de renovaciones próximas a vencer
- ✅ **Integración con Wompi** para pagos automáticos
- ✅ **Sistema de reintentos** para pagos fallidos
- ✅ **Notificaciones por email** automáticas
- ✅ **Cron jobs** programados para ejecución diaria
- ✅ **API de testing** completa para desarrollo

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **AutoRenewalService** - Servicio principal de procesamiento
2. **CronJobManager** - Gestor de tareas programadas
3. **WompiPaymentService** - Integración de pagos
4. **EmailService** - Sistema de notificaciones
5. **AutoRenewalTestController** - API de testing

### Flujo de Trabajo Automático

```mermaid
graph TD
    A[Cron Job 6:00 AM] --> B[AutoRenewalService.processAutoRenewals]
    B --> C{¿Suscripciones próximas a vencer?}
    C -->|Sí| D[Procesar Pago con Wompi]
    C -->|No| E[Finalizar]
    D --> F{¿Pago exitoso?}
    F -->|Sí| G[Renovar Suscripción]
    F -->|No| H[Programar Reintento]
    G --> I[Enviar Email de Confirmación]
    H --> J[Cron Job Reintentos 10:00 AM / 3:00 PM]
    I --> E
    J --> D
```

## 🕒 Programación de Cron Jobs

| Hora | Tarea | Descripción |
|------|-------|-------------|
| **06:00 AM** | Auto-Renovación Principal | Procesa todas las suscripciones que vencen hoy |
| **09:00 AM** | Notificaciones | Envía emails de recordatorio y confirmación |
| **10:00 AM** | Primer Reintento | Reintenta pagos fallidos del día |
| **03:00 PM** | Segundo Reintento | Último intento de pagos fallidos |

## 📡 API de Testing

### Base URL
```
http://localhost:3001/api/test/auto-renewal
```

### Endpoints Disponibles

#### 1. 📊 Estadísticas del Sistema
```http
GET /stats
```
**Respuesta:**
```json
{
  "success": true,
  "message": "Estadísticas de auto-renovación obtenidas",
  "data": {
    "total": 5,
    "active": 3,
    "trial": 1,
    "suspended": 0,
    "cancelled": 1,
    "overdue": 0,
    "expiringNextWeek": 2,
    "savedPaymentMethods": 0,
    "autoRenewed": 3
  }
}
```

#### 2. ➕ Crear Suscripción de Prueba
```http
POST /create-subscription
Content-Type: application/json

{
  "daysUntilExpiry": 1,
  "businessId": null,
  "planId": null
}
```

#### 3. ⏰ Forzar Expiración Pronta
```http
POST /force-expire-soon
Content-Type: application/json

{
  "subscriptionId": null
}
```

#### 4. 📅 Ver Suscripciones Próximas a Vencer
```http
GET /expiring
```

#### 5. 🚀 Procesar Renovaciones Manualmente
```http
POST /run
```

#### 6. 🔄 Procesar Reintentos de Pago
```http
POST /retries
```

#### 7. 📧 Enviar Notificaciones
```http
POST /notifications
```

#### 8. 💳 Crear Método de Pago de Prueba
```http
POST /payment-method
Content-Type: application/json

{
  "businessId": 1,
  "cardLastFour": "1234",
  "cardBrand": "VISA"
}
```

## 🧪 Flujo de Testing Recomendado

### Paso 1: Verificar Estado Inicial
```bash
GET /stats
```
Confirma que el sistema está limpio y funcionando.

### Paso 2: Crear Datos de Prueba
```bash
POST /create-subscription
{
  "daysUntilExpiry": 1
}
```
Crea una suscripción que expire mañana.

### Paso 3: Verificar Estadísticas Actualizadas
```bash
GET /stats
```
Confirma que se creó la suscripción.

### Paso 4: Forzar Expiración Inmediata
```bash
POST /force-expire-soon
```
Configura la suscripción para que expire mañana.

### Paso 5: Ver Suscripciones por Vencer
```bash
GET /expiring
```
Verifica que aparece en la lista de próximas a vencer.

### Paso 6: Procesar Renovación Manual
```bash
POST /run
```
Ejecuta el proceso de auto-renovación manualmente.

### Paso 7: Verificar Resultado
```bash
GET /stats
```
Confirma que se procesó correctamente.

## 💳 Integración con Wompi

### Configuración Requerida
```bash
# Variables de entorno necesarias
WOMPI_PUBLIC_KEY=pub_test_xxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxx
WOMPI_BASE_URL=https://sandbox.wompi.co/v1
```

### Flujo de Pagos
1. **Token de Tarjeta:** Se reutiliza el token guardado del método de pago
2. **Crear Transacción:** Se crea la transacción en Wompi
3. **Verificar Estado:** Se confirma el pago exitoso
4. **Actualizar Suscripción:** Se extiende la fecha de vencimiento

## 📧 Sistema de Notificaciones

### Tipos de Emails

#### Email de Renovación Exitosa
- **Asunto:** "✅ Suscripción renovada exitosamente"
- **Contenido:** Confirmación de pago y nueva fecha de vencimiento

#### Email de Fallo en Renovación
- **Asunto:** "⚠️ Problema con la renovación de tu suscripción"
- **Contenido:** Información del error y próximos reintentos

#### Email de Recordatorio
- **Asunto:** "🔔 Tu suscripción vence pronto"
- **Contenido:** Recordatorio 3 días antes del vencimiento

## 🛠️ Configuración y Deployment

### Requisitos
- Node.js 18+
- PostgreSQL 13+
- Redis (para cron jobs)
- Cuenta Wompi (testing o producción)

### Variables de Entorno
```bash
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/beauty_control

# Wompi
WOMPI_PUBLIC_KEY=pub_test_xxxxx
WOMPI_PRIVATE_KEY=prv_test_xxxxx
WOMPI_BASE_URL=https://sandbox.wompi.co/v1

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Desarrollo
NODE_ENV=development
FORCE_SYNC_DB=true
```

### Instalación
```bash
# Instalar dependencias
npm install

# Sincronizar base de datos (desarrollo)
FORCE_SYNC_DB=true npm start

# Ejecutar en producción
NODE_ENV=production npm start
```

## 🚨 Manejo de Errores

### Errores Comunes

#### 1. Error de Pago
```json
{
  "error": "PAYMENT_FAILED",
  "details": "Tarjeta rechazada",
  "nextRetry": "2025-09-13T10:00:00Z"
}
```
**Solución:** Se programa automáticamente un reintento.

#### 2. Método de Pago No Encontrado
```json
{
  "error": "NO_PAYMENT_METHOD",
  "details": "No se encontró método de pago activo"
}
```
**Solución:** Se envía email al usuario para actualizar método de pago.

#### 3. Error de Conexión con Wompi
```json
{
  "error": "PAYMENT_GATEWAY_ERROR",
  "details": "Timeout en la conexión"
}
```
**Solución:** Se reintenta automáticamente más tarde.

## 📊 Monitoreo y Logs

### Logs Importantes
```bash
# Proceso de renovación exitoso
✅ Renovación exitosa para suscripción ID: abc123

# Fallo en renovación
❌ Fallo en renovación para suscripción ID: abc123, Error: Payment failed

# Reintento programado
🔄 Reintento programado para suscripción ID: abc123, Próximo intento: 10:00 AM
```

### Métricas Recomendadas
- Tasa de éxito de renovaciones
- Tiempo promedio de procesamiento
- Cantidad de reintentos necesarios
- Errores por tipo

## 🔐 Seguridad

### Buenas Prácticas Implementadas
- ✅ **Tokens seguros** para métodos de pago
- ✅ **Validación de permisos** en endpoints de testing
- ✅ **Logs de auditoría** para todas las transacciones
- ✅ **Encriptación** de datos sensibles
- ✅ **Rate limiting** en endpoints críticos

### Solo en Desarrollo
Los endpoints de testing están protegidos y solo funcionan cuando:
```bash
NODE_ENV=development
```

## 📞 Soporte y Troubleshooting

### Comandos de Diagnóstico
```bash
# Verificar estado de cron jobs
curl http://localhost:3001/api/test/auto-renewal/stats

# Procesar renovaciones manualmente
curl -X POST http://localhost:3001/api/test/auto-renewal/run

# Ver logs en tiempo real
tail -f logs/auto-renewal.log
```

### Contacto
Para soporte técnico, revisar los logs del servidor y utilizar los endpoints de testing para diagnosticar problemas específicos.

---

## 🎯 Próximas Mejoras

- [ ] Dashboard web para monitoreo
- [ ] Integración con más pasarelas de pago
- [ ] Notificaciones push móviles
- [ ] Métricas avanzadas y reportes
- [ ] Configuración de horarios personalizados
- [ ] Webhooks para eventos de renovación

---

**Sistema desarrollado para Beauty Control v2.0**  
**Última actualización:** Septiembre 2025