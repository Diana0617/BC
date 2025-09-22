# 📅 SISTEMA COMPLETO DE CITAS Y AGENDA - BEAUTY CONTROL

## 📋 RESUMEN EJECUTIVO

Sistema integral de gestión de citas y agenda para negocios de belleza, con funcionalidades completas de:
- **Gestión de Citas**: CRUD completo con estados y seguimiento
- **Sistema de Agenda**: Horarios flexibles y generación automática de slots
- **Pagos Adelantados**: Integración con Wompi para reservas
- **Gestión de Media**: Fotos antes/después con Cloudinary
- **Control de Inventario**: Seguimiento de productos utilizados
- **Multi-tenancy**: Arquitectura segura con aislamiento por negocio

## 🏗️ ARQUITECTURA DEL SISTEMA

### Stack Tecnológico
- **Backend**: Node.js + Express.js
- **Base de Datos**: PostgreSQL con Sequelize ORM
- **Autenticación**: JWT con middleware de roles
- **Pagos**: Wompi (PSE, Tarjetas, 3D Secure)
- **Storage**: Cloudinary para imágenes
- **Documentación**: Swagger/OpenAPI 3.0

### Componentes Implementados

#### ✅ **SISTEMA DE CITAS** (Completamente Implementado)
- `AppointmentController` - Gestión completa de citas
- `AppointmentMediaController` - Manejo de fotos antes/después
- `AppointmentPaymentController` - Gestión de pagos de citas
- `AppointmentProductController` - Productos utilizados en servicios
- `AppointmentAdvancePaymentController` - Pagos adelantados con Wompi

#### ✅ **SISTEMA DE AGENDA** (En Desarrollo)
- `ScheduleService` - Lógica de negocio para horarios ✅
- `ScheduleController` - API REST para horarios (pendiente)
- `TimeSlotService` - Gestión de slots de tiempo (pendiente)
- `TimeSlotController` - API para disponibilidad (pendiente)

#### ✅ **MODELOS DE DATOS**
- `Appointment` - Cita principal con todos los campos
- `Schedule` - Horarios flexibles con configuración semanal
- `TimeSlot` - Slots de tiempo con estados y disponibilidad
- Relaciones completas entre todos los modelos

## 🔐 SISTEMA DE ROLES Y PERMISOS

### Roles Implementados
- **OWNER**: Acceso completo al sistema
- **BUSINESS**: Gestión de su negocio
- **RECEPTIONIST**: Gestión de citas y agenda del negocio
- **SPECIALIST**: Sus propias citas y disponibilidad

### Middleware de Seguridad
- `authenticateToken` - Validación JWT
- `tenancyMiddleware` - Aislamiento por negocio
- `roleCheck` - Verificación de permisos específicos

## 📊 MODELOS DE DATOS DETALLADOS

### 📅 Appointment (Cita Principal)
```javascript
{
  id: UUID,
  businessId: UUID,           // Multi-tenancy
  clientId: UUID,             // Cliente asociado
  specialistId: UUID,         // Especialista asignado
  serviceId: UUID,            // Servicio contratado
  date: DATEONLY,             // Fecha de la cita
  startTime: TIME,            // Hora de inicio
  endTime: TIME,              // Hora de fin
  status: ENUM([              // Estados del flujo
    'SCHEDULED',              // Agendada
    'CONFIRMED',              // Confirmada por cliente
    'IN_PROGRESS',            // En progreso
    'COMPLETED',              // Completada
    'CANCELLED',              // Cancelada
    'NO_SHOW'                 // No asistió
  ]),
  totalAmount: DECIMAL(10,2), // Valor total del servicio
  paidAmount: DECIMAL(10,2),  // Monto pagado (adelantos)
  notes: TEXT,                // Notas del especialista
  clientNotes: TEXT,          // Notas del cliente
  metadata: JSONB,            // Datos adicionales
  cancelReason: STRING,       // Motivo de cancelación
  createdBy: UUID,            // Usuario que creó la cita
  updatedBy: UUID             // Último usuario que modificó
}
```

### 📋 Schedule (Horarios)
```javascript
{
  id: UUID,
  businessId: UUID,
  specialistId: UUID,         // null = horario general
  type: ENUM([
    'BUSINESS_DEFAULT',       // Horario base del negocio
    'SPECIALIST_CUSTOM',      // Horario personalizado
    'TEMPORARY_OVERRIDE'      // Horario temporal/excepcional
  ]),
  name: STRING,               // "Horario de Verano", "Horario de María"
  description: TEXT,
  weeklySchedule: JSONB({     // Configuración semanal
    monday: {
      enabled: true,
      shifts: [{
        start: "09:00",
        end: "18:00",
        breakStart: "12:00",
        breakEnd: "13:00"
      }]
    },
    // ... otros días
  }),
  slotDuration: INTEGER,      // Duración de slots (minutos)
  bufferTime: INTEGER,        // Tiempo entre citas (minutos)
  timezone: STRING,           // Zona horaria
  effectiveFrom: DATE,        // Vigencia desde
  effectiveTo: DATE,          // Vigencia hasta
  isDefault: BOOLEAN,         // Es el horario por defecto
  isActive: BOOLEAN,          // Está activo
  exceptions: JSONB([]),      // Excepciones por fecha
  priority: INTEGER           // Prioridad de aplicación
}
```

### ⏰ TimeSlot (Slots de Tiempo)
```javascript
{
  id: UUID,
  businessId: UUID,
  specialistId: UUID,
  scheduleId: UUID,           // Horario origen
  date: DATEONLY,             // Fecha del slot
  startTime: TIME,            // Hora inicio
  endTime: TIME,              // Hora fin
  startDateTime: TIMESTAMP,   // Para consultas
  endDateTime: TIMESTAMP,     // Para consultas
  status: ENUM([
    'AVAILABLE',              // Disponible
    'BOOKED',                 // Reservado
    'BLOCKED',                // Bloqueado manualmente
    'BREAK',                  // Tiempo de descanso
    'UNAVAILABLE'             // No disponible
  ]),
  type: ENUM([
    'REGULAR',                // Slot normal
    'BREAK',                  // Descanso
    'LUNCH',                  // Almuerzo
    'BUFFER',                 // Buffer entre citas
    'MAINTENANCE',            // Mantenimiento
    'EMERGENCY'               // Emergencia
  ]),
  appointmentId: UUID,        // Cita asociada si está reservado
  serviceId: UUID,            // Servicio sugerido
  duration: INTEGER,          // Duración en minutos
  blockReason: STRING,        // Motivo del bloqueo
  notes: TEXT,                // Notas adicionales
  maxCapacity: INTEGER,       // Capacidad máxima (servicios grupales)
  currentCapacity: INTEGER,   // Capacidad actual
  allowWalkIn: BOOLEAN,       // Permite walk-ins
  allowOnlineBooking: BOOLEAN, // Permite reserva online
  tags: JSONB([]),            // Etiquetas para filtros
  metadata: JSONB             // Metadatos adicionales
}
```

## 🛠️ API ENDPOINTS IMPLEMENTADOS

### 📅 **CITAS** (`/api/appointments`)

#### ✅ Operaciones Básicas Implementadas
- `GET /api/appointments` - Listar citas con filtros avanzados
- `POST /api/appointments` - Crear nueva cita
- `GET /api/appointments/:id` - Obtener cita específica
- `PUT /api/appointments/:id` - Actualizar cita completa
- `DELETE /api/appointments/:id` - Eliminar cita

#### ✅ Gestión de Estados
- `PATCH /api/appointments/:id/confirm` - Confirmar cita
- `PATCH /api/appointments/:id/start` - Iniciar servicio
- `PATCH /api/appointments/:id/complete` - Completar servicio
- `PATCH /api/appointments/:id/cancel` - Cancelar cita
- `PATCH /api/appointments/:id/no-show` - Marcar no asistencia

#### ✅ Media Management (Cloudinary)
- `POST /api/appointments/:id/media` - Subir fotos/videos
- `GET /api/appointments/:id/media` - Listar media de la cita
- `DELETE /api/appointments/:id/media/:mediaId` - Eliminar media específico

#### ✅ Gestión de Productos
- `POST /api/appointments/:id/products` - Añadir productos utilizados
- `GET /api/appointments/:id/products` - Ver productos de la cita
- `PUT /api/appointments/:id/products/:productId` - Actualizar cantidad
- `DELETE /api/appointments/:id/products/:productId` - Quitar producto

#### ✅ Pagos y Adelantos (Wompi Integration)
- `POST /api/appointments/:id/payment` - Registrar pago
- `GET /api/appointments/:id/payments` - Listar pagos de la cita
- `POST /api/appointments/:id/advance-payment` - Iniciar pago adelantado
- `GET /api/appointments/:id/advance-payment/status` - Estado del pago
- `POST /api/appointments/:id/advance-payment/webhook` - Webhook Wompi

### 📋 **HORARIOS** (`/api/schedules`) - En Desarrollo

#### ⏳ Gestión de Horarios (Pendiente de Implementar)
- `GET /api/schedules` - Obtener horarios
- `POST /api/schedules` - Crear horario
- `GET /api/schedules/:id` - Detalle de horario
- `PUT /api/schedules/:id` - Actualizar horario
- `DELETE /api/schedules/:id` - Desactivar horario

#### ⏳ Operaciones Avanzadas
- `POST /api/schedules/:id/generate-slots` - Generar slots automáticamente
- `POST /api/schedules/:id/clone` - Clonar horario existente

#### ⏳ Vistas de Agenda
- `GET /api/schedules/specialist/:id/agenda` - Agenda del especialista
- `GET /api/schedules/business/agenda` - Agenda del negocio

### ⏰ **SLOTS DE TIEMPO** (`/api/time-slots`) - En Desarrollo

#### ⏳ Consulta de Disponibilidad
- `GET /api/time-slots/availability` - Consultar disponibilidad
- `GET /api/time-slots/next-available` - Próximo slot disponible
- `GET /api/time-slots/business/availability` - Disponibilidad del negocio

#### ⏳ Gestión de Bloqueos
- `POST /api/time-slots/:id/block` - Bloquear slot específico
- `POST /api/time-slots/:id/unblock` - Desbloquear slot
- `POST /api/time-slots/bulk/block` - Bloqueo masivo
- `POST /api/time-slots/range/block` - Bloquear rango de tiempo

#### ⏳ Estadísticas y Reportes
- `GET /api/time-slots/statistics` - Estadísticas de utilización
- `GET /api/time-slots/utilization` - Reporte de utilización

## 🎯 FLUJOS DE USO PRINCIPALES

### 1. ✅ Flujo de Cita Completo (Implementado)

```javascript
// 1. Crear cita
POST /api/appointments
{
  "businessId": "uuid",
  "clientId": "uuid",
  "specialistId": "uuid", 
  "serviceId": "uuid",
  "date": "2024-01-15",
  "startTime": "10:00",
  "endTime": "11:30",
  "notes": "Primera visita, cabello muy dañado"
}

// 2. Confirmar cita
PATCH /api/appointments/{id}/confirm

// 3. Iniciar servicio
PATCH /api/appointments/{id}/start

// 4. Subir foto "antes"
POST /api/appointments/{id}/media
FormData: { 
  file: image, 
  type: "before", 
  description: "Estado inicial del cabello" 
}

// 5. Registrar productos utilizados
POST /api/appointments/{id}/products
{
  "products": [
    {
      "productId": "shampoo-uuid",
      "quantity": 1,
      "notes": "Shampoo reparador"
    },
    {
      "productId": "treatment-uuid", 
      "quantity": 2,
      "notes": "Tratamiento intensivo"
    }
  ]
}

// 6. Subir foto "después"
POST /api/appointments/{id}/media
FormData: { 
  file: image, 
  type: "after", 
  description: "Resultado final" 
}

// 7. Completar servicio
PATCH /api/appointments/{id}/complete
{
  "notes": "Excelente resultado, cliente muy satisfecha",
  "nextAppointmentRecommended": "2024-02-15",
  "serviceRating": 5
}
```

### 2. ✅ Pagos Adelantados (Implementado)

```javascript
// 1. Iniciar pago adelantado del 40%
POST /api/appointments/{id}/advance-payment
{
  "percentage": 40,
  "paymentMethod": "PSE",
  "userEmail": "cliente@email.com"
}

// 2. Cliente completa pago en Wompi (webhook automático)

// 3. Verificar estado
GET /api/appointments/{id}/advance-payment/status
// Response: { status: "APPROVED", amount: 50000, reference: "ref_123" }

// 4. Completar pago restante en la cita
POST /api/appointments/{id}/payment
{
  "amount": 75000,
  "method": "CASH",
  "notes": "Pago del saldo restante"
}
```

### 3. ⏳ Configuración de Horarios (En Desarrollo)

```javascript
// 1. Crear horario personalizado para especialista
POST /api/schedules
{
  "businessId": "uuid",
  "specialistId": "uuid",
  "type": "SPECIALIST_CUSTOM",
  "name": "Horario Especial Diciembre",
  "weeklySchedule": {
    "monday": {
      "enabled": true,
      "shifts": [
        {
          "start": "08:00",
          "end": "17:00",
          "breakStart": "12:00",
          "breakEnd": "13:00"
        }
      ]
    },
    "tuesday": {
      "enabled": true,
      "shifts": [
        {
          "start": "09:00",
          "end": "19:00",
          "breakStart": "13:00", 
          "breakEnd": "14:00"
        }
      ]
    },
    // ... otros días
  },
  "slotDuration": 45,
  "bufferTime": 15,
  "effectiveFrom": "2024-12-01",
  "effectiveTo": "2024-12-31"
}

// 2. Generar slots para el mes
POST /api/schedules/{id}/generate-slots
{
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "forceRegenerate": false
}

// 3. Ver agenda generada
GET /api/schedules/specialist/{specialistId}/agenda?date=2024-12-15&view=week
```

## 📈 ESTADO DE IMPLEMENTACIÓN

### ✅ **COMPLETAMENTE IMPLEMENTADO**

#### Gestión de Citas
- [x] CRUD completo de citas
- [x] Estados y transiciones
- [x] Filtros avanzados (fecha, estado, especialista)
- [x] Paginación y ordenamiento
- [x] Validaciones de negocio

#### Media Management  
- [x] Upload a Cloudinary
- [x] Compresión automática
- [x] Organización por cita
- [x] Tipos: before/after/during/result
- [x] Eliminación segura

#### Gestión de Productos
- [x] Asociación productos-cita
- [x] Control de cantidades
- [x] Descuento automático de inventario
- [x] Notas por producto utilizado

#### Pagos y Adelantos
- [x] Integración completa con Wompi
- [x] PSE, Tarjetas, 3D Secure
- [x] Webhooks automáticos
- [x] Gestión de estados de pago
- [x] Pagos parciales y saldos

#### Seguridad y Multi-tenancy
- [x] Autenticación JWT
- [x] Middleware de roles
- [x] Aislamiento por negocio
- [x] Validaciones de permisos

### ⏳ **EN DESARROLLO**

#### Sistema de Horarios
- [x] Modelos Schedule y TimeSlot
- [x] ScheduleService (lógica de negocio)
- [ ] ScheduleController (API REST)
- [ ] TimeSlotService
- [ ] TimeSlotController
- [ ] Rutas y middleware

#### Funcionalidades Avanzadas
- [ ] Generación automática de slots
- [ ] Consultas de disponibilidad
- [ ] Bloqueos y excepciones
- [ ] Vistas de agenda
- [ ] Estadísticas de utilización

## 🔄 PRÓXIMOS PASOS

### 🎯 **Prioridad Alta** (Esta Semana)
1. **Completar TimeSlotService** con lógica de disponibilidad
2. **Implementar ScheduleController** con todos los endpoints
3. **Crear TimeSlotController** para gestión de slots
4. **Configurar rutas** `/api/schedules` y `/api/time-slots`
5. **Testing completo** del sistema de agenda

### 🎯 **Prioridad Media** (Próxima Semana)
1. **Integración** entre sistema de citas y agenda
2. **Validaciones cruzadas** (disponibilidad al crear citas)
3. **Optimizaciones de performance** con índices
4. **Documentación completa** de APIs
5. **Tests unitarios** y de integración

### 🎯 **Futuras Mejoras**
1. **Sistema de notificaciones** automáticas
2. **Recordatorios** por email/SMS
3. **Lista de espera** automática
4. **Analytics** y reportes avanzados
5. **App móvil** para especialistas

## 🛡️ SEGURIDAD Y COMPLIANCE

### Implementado ✅
- Encriptación de passwords con bcrypt
- Tokens JWT con expiración
- Validación de entrada en todos los endpoints
- Aislamiento completo por negocio (multi-tenancy)
- Logs de auditoría en operaciones críticas

### Por Implementar ⏳
- Rate limiting por IP
- Logs de acceso detallados
- Backup automático de media
- Políticas de retención de datos

## 📚 CONFIGURACIÓN Y DEPLOYMENT

### Variables de Entorno Requeridas
```bash
# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/beauty_control
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary (Media)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Wompi (Pagos)
WOMPI_PUBLIC_KEY=pub_test_your-key
WOMPI_PRIVATE_KEY=prv_test_your-key
WOMPI_EVENTS_SECRET=your-events-secret
WOMPI_BASE_URL=https://production.wompi.co

# Configuración
NODE_ENV=development
PORT=3001
```

### Comandos de Desarrollo
```bash
# Instalar dependencias
npm install

# Ejecutar migraciones
npm run migrate

# Seeders de prueba
npm run seed

# Desarrollo con recarga automática
npm run dev

# Testing
npm test

# Verificar sintaxis
npm run lint
```

---

## 📞 SOPORTE Y CONTACTO

**🔧 Desarrollo**: Equipo Beauty Control  
**📧 Email**: dev@beautycontrol.com  
**📖 Documentación**: `/api-docs` (Swagger)  
**🔄 Última Actualización**: Septiembre 22, 2025

---

### 📋 CHECKLIST DE DESARROLLO

#### Sistema de Citas ✅
- [x] Modelos implementados
- [x] Controladores completos  
- [x] Rutas configuradas
- [x] Middleware de seguridad
- [x] Integración Wompi
- [x] Gestión de media
- [x] Testing funcional

#### Sistema de Agenda ⏳
- [x] Modelos implementados
- [x] ScheduleService creado
- [ ] ScheduleController
- [ ] TimeSlotService  
- [ ] TimeSlotController
- [ ] Rutas configuradas
- [ ] Testing completo

**🚀 El sistema de citas está completamente funcional. El sistema de agenda está en desarrollo activo.**
