# Sistema de No Show (No Asistencia)

## Descripción
Sistema automático que marca como cancelados los turnos confirmados del día anterior que no fueron atendidos, con motivo "No asistió - Cancelación automática".

## ✅ Características

- **Procesamiento Automático**: Se ejecuta diariamente mediante CRON
- **Motivo Claro**: "No asistió - Cancelación automática"
- **Registro de Cancelaciones**: Se contabiliza en el historial del cliente
- **Estadísticas**: Permite ver tasas de No Show por negocio
- **Ejecución Manual**: Endpoint para ejecutar el proceso manualmente desde admin

## 🔧 Configuración

### 1. Configurar CRON Job (Producción)

Editar crontab:
```bash
crontab -e
```

Agregar la siguiente línea (ejecuta todos los días a las 00:00):
```cron
0 0 * * * cd /path/to/BC/packages/backend && node src/scripts/process-no-shows.js >> /var/log/beauty-control/no-shows.log 2>&1
```

### 2. Configurar CRON Job con PM2 (Recomendado)

Instalar PM2 si no lo tienes:
```bash
npm install -g pm2
```

Crear el archivo de configuración `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'no-show-processor',
      script: './src/scripts/process-no-shows.js',
      cron_restart: '0 0 * * *', // Todos los días a las 00:00
      autorestart: false,
      watch: false,
      instances: 1
    }
  ]
};
```

Iniciar con PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Configurar con Node-Cron (Alternativa)

Si prefieres manejarlo dentro de la aplicación Node.js:

Instalar node-cron:
```bash
npm install node-cron
```

Agregar en `app.js` o `server.js`:
```javascript
const cron = require('node-cron');
const NoShowService = require('./services/NoShowService');

// Ejecutar todos los días a las 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('🕐 Ejecutando proceso de No Shows...');
  try {
    const result = await NoShowService.markNoShowAppointments();
    console.log('✅ Proceso completado:', result);
  } catch (error) {
    console.error('❌ Error en proceso de No Shows:', error);
  }
});
```

## 📡 Endpoints Disponibles

### Ejecutar Proceso Manualmente (Admin Only)
```
POST /api/appointments/process-no-shows
Headers: Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Proceso completado: 3 turnos marcados como No Show, 0 errores",
  "processedCount": 3,
  "errorCount": 0,
  "totalFound": 3,
  "results": [
    {
      "appointmentId": "uuid",
      "appointmentNumber": "CITA-123",
      "clientName": "Juan Pérez",
      "serviceName": "Corte de Cabello",
      "businessName": "Beauty Salon",
      "originalStartTime": "2026-01-10T14:00:00.000Z",
      "success": true
    }
  ]
}
```

### Obtener Estadísticas de No Shows
```
GET /api/appointments/no-show-stats/:businessId?days=30
Headers: Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "noShowCount": 5,
    "totalAppointments": 100,
    "noShowRate": "5.00",
    "period": "30 días"
  }
}
```

## 🔍 Funcionamiento

1. **Búsqueda**: El sistema busca turnos del día anterior con status `CONFIRMED` o `IN_PROGRESS`
2. **Validación**: Verifica que efectivamente no fueron completados ni cancelados
3. **Actualización**: Marca como `CANCELED` con:
   - `cancelReason`: "No asistió - Cancelación automática"
   - `canceledAt`: Fecha actual
   - `canceledBy`: `null` (indica cancelación automática)
4. **Registro**: Se contabiliza en el historial de cancelaciones del cliente

## 📊 Impacto en Estadísticas

Los No Shows aparecerán en:
- ✅ Historial de Cancelaciones del Cliente
- ✅ Estadísticas del Cliente (tasa de cancelación)
- ✅ Resumen de actividad
- ✅ Sistema de bloqueo (si aplican las reglas de negocio)

## 🧪 Testing

### Test Manual
```bash
cd packages/backend
node src/scripts/process-no-shows.js
```

### Test con Fecha Específica
Modificar temporalmente el script para probar con una fecha específica.

## 📝 Logs

Los logs se guardan en:
- **Producción con CRON**: `/var/log/beauty-control/no-shows.log`
- **PM2**: `pm2 logs no-show-processor`
- **Node-Cron**: Consola de la aplicación

## ⚠️ Consideraciones

1. **Zona Horaria**: Asegúrate de que el servidor tenga la zona horaria correcta configurada
2. **Performance**: El proceso es eficiente pero puede tomar tiempo si hay muchos turnos
3. **Notificaciones**: Considera agregar notificaciones a clientes sobre el No Show
4. **Bloqueos**: Los No Shows cuentan para el sistema de bloqueo automático si está habilitado

## 🚀 Próximas Mejoras

- [ ] Notificar al cliente por email sobre el No Show
- [ ] Permitir configurar el tiempo de gracia (ej: 15 minutos después de la hora)
- [ ] Dashboard de estadísticas de No Shows
- [ ] Reportes mensuales de No Shows por negocio
- [ ] Integración con sistema de penalizaciones

---

**Última actualización**: 11 de enero de 2026
