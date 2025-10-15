# 🧪 Guía Rápida de Testing - Sistema de Calendario

## 📋 Pre-requisitos

Antes de probar los endpoints del calendario, necesitas tener configurado:

### 1. Base de Datos
- ✅ Tabla `branches` con `businessHours` JSONB
- ✅ Tabla `specialist_branch_schedules` con horarios de especialistas
- ✅ Tabla `appointments` con citas existentes
- ✅ Tabla `services` con duración configurada

### 2. Datos de Prueba Necesarios

#### A. Crear una Sucursal con Horarios
```sql
-- Verificar que tu sucursal tenga businessHours configurado
SELECT id, name, "businessHours" 
FROM branches 
WHERE "businessId" = 'YOUR_BUSINESS_ID';

-- Ejemplo de businessHours (debe estar en JSONB):
{
  "monday": { "open": "09:00", "close": "18:00", "closed": false },
  "tuesday": { "open": "09:00", "close": "18:00", "closed": false },
  "wednesday": { "open": "09:00", "close": "18:00", "closed": false },
  "thursday": { "open": "09:00", "close": "18:00", "closed": false },
  "friday": { "open": "09:00", "close": "18:00", "closed": false },
  "saturday": { "open": "09:00", "close": "14:00", "closed": false },
  "sunday": { "open": null, "close": null, "closed": true }
}
```

#### B. Crear Horario de Especialista
```sql
-- Insertar horario del especialista en la sucursal
INSERT INTO specialist_branch_schedules (
  id, "specialistId", "branchId", "dayOfWeek", 
  "startTime", "endTime", "isActive", priority,
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'YOUR_SPECIALIST_ID',
  'YOUR_BRANCH_ID',
  'monday',
  '09:00',
  '17:00',
  true,
  1,
  NOW(),
  NOW()
);

-- Repetir para cada día de la semana que trabaje
```

#### C. Crear Servicio con Duración
```sql
-- Verificar que tu servicio tenga duración
SELECT id, name, duration, price 
FROM services 
WHERE "businessId" = 'YOUR_BUSINESS_ID';

-- Si no tiene, actualizar:
UPDATE services 
SET duration = 60 -- minutos
WHERE id = 'YOUR_SERVICE_ID';
```

#### D. Crear Citas de Prueba
```sql
-- Crear una cita existente para probar exclusión de slots
INSERT INTO appointments (
  id, "businessId", "branchId", "clientId", 
  "specialistId", "serviceId",
  "startTime", "endTime",
  status, "totalAmount",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'YOUR_BUSINESS_ID',
  'YOUR_BRANCH_ID',
  'YOUR_CLIENT_ID',
  'YOUR_SPECIALIST_ID',
  'YOUR_SERVICE_ID',
  '2025-01-15 10:00:00',
  '2025-01-15 11:00:00',
  'CONFIRMED',
  50000,
  NOW(),
  NOW()
);
```

---

## 🚀 Testing con Insomnia

### Paso 1: Importar Colección
1. Abrir Insomnia
2. `Application` → `Preferences` → `Data` → `Import Data`
3. Seleccionar archivo: `calendar_insomnia_collection.json`

### Paso 2: Configurar Variables de Entorno
En Insomnia, editar el "Base Environment":

```json
{
  "base_url": "http://localhost:5000/api",
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Tu JWT token
  "business_id": "12345678-1234-1234-1234-123456789012",
  "branch_id": "87654321-4321-4321-4321-210987654321",
  "specialist_id": "11111111-2222-3333-4444-555555555555",
  "service_id": "66666666-7777-8888-9999-000000000000"
}
```

**Cómo obtener el auth_token**:
1. Hacer login en Insomnia:
   ```
   POST /api/auth/login
   Body: { "email": "owner@example.com", "password": "your_password" }
   ```
2. Copiar el `token` de la respuesta

---

## 🧪 Casos de Prueba

### Test 1: Obtener Slots Disponibles ✅

**Endpoint**: `GET /api/calendar/available-slots`

**Escenario**: Obtener slots disponibles para un día específico

**Request**:
```
GET /api/calendar/available-slots?businessId={id}&branchId={id}&specialistId={id}&serviceId={id}&date=2025-01-15
```

**Validaciones esperadas**:
- ✅ Retorna `dayOfWeek` correcto (ej: "monday")
- ✅ Slots generados según `workingHours` (intersección de sucursal + especialista)
- ✅ Duración de cada slot = `Service.duration`
- ✅ Slots ocupados NO aparecen en `slots` array
- ✅ `availableSlots` count es correcto
- ✅ `occupiedSlots` count es correcto

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "date": "2025-01-15",
    "dayOfWeek": "monday",
    "branch": {
      "id": "...",
      "name": "Sucursal Centro",
      "hours": { "open": "09:00", "close": "18:00", "closed": false }
    },
    "specialist": {
      "id": "...",
      "name": "Dr. García",
      "schedule": { "startTime": "09:00", "endTime": "17:00" }
    },
    "service": {
      "id": "...",
      "name": "Corte de Cabello",
      "duration": 60,
      "price": 50000
    },
    "workingHours": {
      "start": "09:00",
      "end": "17:00"
    },
    "totalSlots": 8,
    "availableSlots": 7,
    "occupiedSlots": 1,
    "slots": [
      { "startTime": "09:00", "endTime": "10:00", "available": true },
      { "startTime": "11:00", "endTime": "12:00", "available": true },
      // ... (el slot 10:00-11:00 NO aparece porque está ocupado)
      { "startTime": "16:00", "endTime": "17:00", "available": true }
    ]
  }
}
```

---

### Test 2: Calendario del Negocio ✅

**Endpoint**: `GET /api/calendar/business/:businessId`

**Escenario**: Owner ve todas las citas del mes

**Request**:
```
GET /api/calendar/business/{businessId}?startDate=2025-01-01&endDate=2025-01-31
```

**Validaciones esperadas**:
- ✅ Retorna citas de TODAS las sucursales
- ✅ `events` formateado para calendario (title, start, end, backgroundColor)
- ✅ `stats.total` es correcto
- ✅ `stats.byStatus` agrupa correctamente
- ✅ `stats.byBranch` agrupa por sucursal
- ✅ `stats.totalRevenue` suma solo CONFIRMED y COMPLETED

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "...",
        "title": "Juan Pérez - Corte de Cabello",
        "start": "2025-01-15T10:00:00.000Z",
        "end": "2025-01-15T11:00:00.000Z",
        "status": "CONFIRMED",
        "backgroundColor": "#4CAF50",
        "extendedProps": {
          "appointmentId": "...",
          "branchName": "Sucursal Centro",
          "clientName": "Juan Pérez",
          "clientPhone": "3001234567",
          "specialistName": "Dr. García",
          "serviceName": "Corte de Cabello",
          "servicePrice": 50000,
          "totalAmount": 50000,
          "hasConsent": false,
          "notes": null
        }
      }
    ],
    "stats": {
      "total": 15,
      "byStatus": {
        "PENDING": 3,
        "CONFIRMED": 8,
        "COMPLETED": 2,
        "CANCELED": 2
      },
      "byBranch": {
        "Sucursal Centro": 10,
        "Sucursal Norte": 5
      },
      "totalRevenue": 500000
    },
    "dateRange": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    }
  }
}
```

---

### Test 3: Agenda del Especialista (Multi-sucursal) ✅

**Endpoint**: `GET /api/calendar/specialist/:specialistId`

**Escenario**: Especialista trabaja en 2 sucursales, quiere ver su agenda completa

**Request**:
```
GET /api/calendar/specialist/{specialistId}?startDate=2025-01-01&endDate=2025-01-31
```

**Validaciones esperadas**:
- ✅ Retorna citas de TODAS las sucursales donde trabaja
- ✅ `events` incluye `branchName` y `branchAddress`
- ✅ `byBranch` agrupa citas por sucursal

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "...",
        "title": "Juan Pérez - Corte",
        "start": "2025-01-15T10:00:00.000Z",
        "end": "2025-01-15T11:00:00.000Z",
        "status": "CONFIRMED",
        "backgroundColor": "#4CAF50",
        "extendedProps": {
          "branchName": "Sucursal Centro",
          "branchId": "...",
          "branchAddress": "Calle 123 #45-67",
          // ...
        }
      },
      {
        // Cita en otra sucursal
        "extendedProps": {
          "branchName": "Sucursal Norte",
          // ...
        }
      }
    ],
    "total": 12,
    "byBranch": [
      { "branchName": "Sucursal Centro", "count": 8 },
      { "branchName": "Sucursal Norte", "count": 4 }
    ]
  }
}
```

---

### Test 4: Especialistas Disponibles ✅

**Endpoint**: `GET /api/calendar/branch/:branchId/specialists`

**Escenario A**: Ver todos los especialistas de la sucursal

**Request**:
```
GET /api/calendar/branch/{branchId}/specialists
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "specialists": [
      {
        "id": "...",
        "firstName": "Dr. García",
        "lastName": "Pérez",
        "email": "garcia@example.com",
        "specialization": "Barbería",
        "bio": "10 años de experiencia..."
      }
    ],
    "total": 3
  }
}
```

**Escenario B**: Ver especialistas disponibles en horario específico

**Request**:
```
GET /api/calendar/branch/{branchId}/specialists?serviceId={id}&date=2025-01-15&time=10:00
```

**Validaciones esperadas**:
- ✅ Solo retorna especialistas SIN citas en ese horario
- ✅ Valida que el horario esté dentro del `schedule` del especialista
- ✅ Incluye campo `available: true`

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "specialists": [
      {
        "id": "...",
        "firstName": "Dr. López",
        "lastName": "González",
        "email": "lopez@example.com",
        "specialization": "Estilista",
        "bio": "...",
        "schedule": {
          "startTime": "09:00",
          "endTime": "17:00"
        },
        "available": true
      }
    ],
    "total": 2
  }
}
```

---

### Test 5: Rango de Disponibilidad ✅

**Endpoint**: `GET /api/calendar/availability-range`

**Escenario**: Obtener disponibilidad de próximos 7 días

**Request**:
```
GET /api/calendar/availability-range?businessId={id}&branchId={id}&specialistId={id}&serviceId={id}&startDate=2025-01-15&endDate=2025-01-22
```

**Validaciones esperadas**:
- ✅ Solo retorna días con al menos 1 slot disponible
- ✅ Días cerrados (ej: domingo) NO aparecen
- ✅ Días sin disponibilidad del especialista NO aparecen

**Respuesta esperada**:
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-01-15",
      "dayOfWeek": "monday",
      "availableSlots": 7,
      "slots": [...]
    },
    {
      "date": "2025-01-16",
      "dayOfWeek": "tuesday",
      "availableSlots": 8,
      "slots": [...]
    }
    // Nota: 2025-01-19 (domingo) NO aparece porque closed: true
  ]
}
```

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "Sucursal está cerrada este día"
**Causa**: El `dayOfWeek` en `businessHours` tiene `closed: true`

**Solución**:
```sql
UPDATE branches 
SET "businessHours" = jsonb_set(
  "businessHours",
  '{monday,closed}',
  'false'
)
WHERE id = 'YOUR_BRANCH_ID';
```

---

### Problema 2: "El especialista no trabaja este día"
**Causa**: No existe registro en `specialist_branch_schedules` para ese día

**Solución**:
```sql
INSERT INTO specialist_branch_schedules (
  id, "specialistId", "branchId", "dayOfWeek",
  "startTime", "endTime", "isActive", priority,
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'YOUR_SPECIALIST_ID',
  'YOUR_BRANCH_ID',
  'monday', -- Cambiar según necesidad
  '09:00',
  '17:00',
  true,
  1,
  NOW(),
  NOW()
);
```

---

### Problema 3: "No hay intersección de horarios"
**Causa**: El horario del especialista no se solapa con el de la sucursal

**Ejemplo**:
- Sucursal: `09:00 - 18:00`
- Especialista: `19:00 - 22:00` ❌ No hay solapamiento

**Solución**: Ajustar uno de los dos:
```sql
-- Opción A: Cambiar horario del especialista
UPDATE specialist_branch_schedules
SET "startTime" = '09:00', "endTime" = '17:00'
WHERE "specialistId" = 'YOUR_SPECIALIST_ID' 
  AND "branchId" = 'YOUR_BRANCH_ID'
  AND "dayOfWeek" = 'monday';

-- Opción B: Cambiar horario de la sucursal
UPDATE branches
SET "businessHours" = jsonb_set(
  "businessHours",
  '{monday}',
  '{"open": "08:00", "close": "20:00", "closed": false}'::jsonb
)
WHERE id = 'YOUR_BRANCH_ID';
```

---

### Problema 4: Todos los slots están ocupados
**Causa**: Hay citas existentes cubriendo todo el rango horario

**Verificación**:
```sql
SELECT "startTime", "endTime", status
FROM appointments
WHERE "specialistId" = 'YOUR_SPECIALIST_ID'
  AND "branchId" = 'YOUR_BRANCH_ID'
  AND DATE("startTime") = '2025-01-15'
  AND status NOT IN ('CANCELED', 'NO_SHOW')
ORDER BY "startTime";
```

**Solución**: Cancelar citas de prueba o elegir otra fecha

---

## 📊 Casos Edge a Validar

### 1. Servicios de Diferente Duración
- Servicio A: 30 min → Genera slots cada 30 min
- Servicio B: 60 min → Genera slots cada 60 min
- Servicio C: 90 min → Genera slots cada 90 min

**Validar**: Que el algoritmo ajuste correctamente

---

### 2. Especialista en Múltiples Sucursales
**Escenario**:
- Lunes 09:00-13:00 en Sucursal Centro
- Lunes 14:00-18:00 en Sucursal Norte

**Validar**:
- `GET /calendar/specialist/{id}` retorna citas de ambas
- `byBranch` agrupa correctamente

---

### 3. Cita que Abarca Múltiples Slots
**Escenario**:
- Servicio de 90 min (09:00 - 10:30)
- Slots de 30 min: 09:00, 09:30, 10:00, 10:30

**Validar**:
- Los 3 slots (09:00, 09:30, 10:00) están marcados como ocupados

---

### 4. Día Festivo o Cierre Excepcional
**Escenario**: La sucursal está cerrada temporalmente

**Solución Temporal**:
```sql
UPDATE branches
SET "businessHours" = jsonb_set(
  "businessHours",
  '{wednesday,closed}',
  'true'
)
WHERE id = 'YOUR_BRANCH_ID';
```

**Validar**: No retorna slots para ese día

---

## 🔐 Testing de Roles

### Owner/Business Admin
**Puede acceder a**:
- ✅ `/calendar/business/:businessId` - Todas las sucursales
- ✅ `/calendar/branch/:branchId` - Cualquier sucursal
- ✅ `/calendar/specialist/:specialistId` - Cualquier especialista

### Receptionist
**Puede acceder a**:
- ✅ `/calendar/branch/:branchId` - Solo sus sucursales asignadas
- ❌ `/calendar/business/:businessId` - Forbidden

**Probar**:
1. Login como Receptionist
2. Intentar acceder a `/calendar/business/{id}` → Debe retornar 403

### Specialist
**Puede acceder a**:
- ✅ `/calendar/specialist/:specialistId` - Solo su propia agenda
- ❌ `/calendar/specialist/:otherSpecialistId` - Forbidden

**Probar**:
1. Login como Specialist
2. Intentar acceder a otro especialista → Debe retornar 403

---

## 📝 Checklist de Testing Completo

- [ ] Test 1: Slots disponibles - día normal ✅
- [ ] Test 2: Slots disponibles - día cerrado ✅
- [ ] Test 3: Slots disponibles - especialista no trabaja ✅
- [ ] Test 4: Slots disponibles - sin intersección de horarios ✅
- [ ] Test 5: Calendario del negocio - sin filtros ✅
- [ ] Test 6: Calendario del negocio - filtrado por sucursal ✅
- [ ] Test 7: Calendario del negocio - filtrado por especialista ✅
- [ ] Test 8: Calendario de sucursal ✅
- [ ] Test 9: Agenda de especialista - multi-sucursal ✅
- [ ] Test 10: Especialistas disponibles - todos ✅
- [ ] Test 11: Especialistas disponibles - horario específico ✅
- [ ] Test 12: Rango de disponibilidad - 7 días ✅
- [ ] Test 13: Servicio con duración 30 min ✅
- [ ] Test 14: Servicio con duración 90 min ✅
- [ ] Test 15: Roles - Owner puede acceder a todo ✅
- [ ] Test 16: Roles - Receptionist solo su sucursal ✅
- [ ] Test 17: Roles - Specialist solo su agenda ✅

---

**Última actualización**: Octubre 15, 2025  
**Versión**: 1.0
