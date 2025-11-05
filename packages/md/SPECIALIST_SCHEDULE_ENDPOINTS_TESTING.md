# 📋 Guía de Testing - Endpoints de Horarios del Especialista

**Fecha**: 18 de Octubre 2025
**Backend URL**: `http://192.168.0.213:3001`

---

## 🔐 Autenticación

Todos los endpoints requieren:
- Header: `Authorization: Bearer {JWT_TOKEN}`
- El token debe pertenecer a un usuario con rol `SPECIALIST`

**Token de prueba (Felipe)**:
```
Obtener desde: POST /api/auth/login
Body: {
  "email": "felipeosoriolobeto@gmail.com",
  "password": "{tu_password}"
}
```

---

## 📡 Endpoints Implementados

### 1. **Obtener Mis Horarios**

```http
GET /api/specialists/me/schedules?businessId=d7af77b9-09cf-4d6b-b159-6249be87935e
Authorization: Bearer {TOKEN}
```

**Response esperado**:
```json
{
  "success": true,
  "data": [
    {
      "branchId": "uuid-sucursal-1",
      "branchName": "Sucursal Centro",
      "branchAddress": "Calle 123",
      "weekSchedule": {
        "monday": {
          "enabled": true,
          "startTime": "09:00:00",
          "endTime": "18:00:00",
          "scheduleId": "uuid-schedule-1"
        },
        "tuesday": {
          "enabled": true,
          "startTime": "09:00:00",
          "endTime": "18:00:00",
          "scheduleId": "uuid-schedule-2"
        },
        "wednesday": { "enabled": false, "startTime": null, "endTime": null },
        "thursday": {
          "enabled": true,
          "startTime": "10:00:00",
          "endTime": "16:00:00",
          "scheduleId": "uuid-schedule-4"
        },
        "friday": {
          "enabled": true,
          "startTime": "09:00:00",
          "endTime": "17:00:00",
          "scheduleId": "uuid-schedule-5"
        },
        "saturday": { "enabled": false, "startTime": null, "endTime": null },
        "sunday": { "enabled": false, "startTime": null, "endTime": null }
      }
    }
  ]
}
```

**Casos de prueba**:
- ✅ Sin `businessId` → Error 400
- ✅ Con `businessId` válido → Lista de horarios por sucursal
- ✅ Si no tiene horarios → Array vacío con estructura por defecto

---

### 2. **Obtener Restricciones del Negocio**

```http
GET /api/specialists/me/business-constraints?businessId=d7af77b9-09cf-4d6b-b159-6249be87935e
Authorization: Bearer {TOKEN}
```

**Response esperado**:
```json
{
  "success": true,
  "data": {
    "businessSchedule": {
      "monday": {
        "enabled": true,
        "shifts": [
          {
            "start": "08:00",
            "end": "20:00",
            "breakStart": "12:00",
            "breakEnd": "13:00"
          }
        ]
      },
      "tuesday": {
        "enabled": true,
        "shifts": [
          {
            "start": "08:00",
            "end": "20:00",
            "breakStart": "12:00",
            "breakEnd": "13:00"
          }
        ]
      },
      // ... otros días
    },
    "slotDuration": 30,
    "bufferTime": 5,
    "maxAdvanceBooking": 30,
    "branch": null
  }
}
```

**Con sucursal específica**:
```http
GET /api/specialists/me/business-constraints?businessId=d7af77b9-09cf-4d6b-b159-6249be87935e&branchId={BRANCH_ID}
```

**Uso**: El frontend usa estos datos para validar que el horario del especialista esté dentro del permitido.

---

### 3. **Actualizar Horario de una Sucursal**

```http
PUT /api/specialists/me/schedules/{BRANCH_ID}
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "businessId": "d7af77b9-09cf-4d6b-b159-6249be87935e",
  "weekSchedule": {
    "monday": {
      "enabled": true,
      "startTime": "09:00",
      "endTime": "18:00"
    },
    "tuesday": {
      "enabled": true,
      "startTime": "09:00",
      "endTime": "18:00"
    },
    "wednesday": {
      "enabled": false
    },
    "thursday": {
      "enabled": true,
      "startTime": "10:00",
      "endTime": "16:00"
    },
    "friday": {
      "enabled": true,
      "startTime": "09:00",
      "endTime": "17:00"
    },
    "saturday": {
      "enabled": false
    },
    "sunday": {
      "enabled": false
    }
  }
}
```

**Response esperado**:
```json
{
  "success": true,
  "message": "Horario actualizado exitosamente",
  "data": {
    "branchId": "uuid-sucursal",
    "updatedDays": 4
  }
}
```

**Validaciones implementadas**:
- ✅ Horario del especialista debe estar dentro del horario del negocio
- ✅ No puede habilitar días que el negocio tiene deshabilitados
- ✅ `startTime` debe ser >= hora de inicio del negocio
- ✅ `endTime` debe ser <= hora de fin del negocio

**Casos de error**:

1. **Día no habilitado en el negocio**:
```json
{
  "success": false,
  "error": "El negocio no trabaja los wednesday. No puedes habilitar este día."
}
```

2. **Horario fuera de rango**:
```json
{
  "success": false,
  "error": "Horario de monday debe estar entre 08:00 y 20:00"
}
```

---

## 🧪 Casos de Prueba Recomendados

### **Test 1: Obtener horarios (primera vez)**
```
GET /api/specialists/me/schedules?businessId=d7af77b9-09cf-4d6b-b159-6249be87935e
Expectativa: Array vacío o estructura con enabled=false en todos los días
```

### **Test 2: Configurar horario válido**
```
PUT /api/specialists/me/schedules/{BRANCH_ID}
Body: {
  "businessId": "...",
  "weekSchedule": {
    "monday": { "enabled": true, "startTime": "09:00", "endTime": "17:00" },
    "tuesday": { "enabled": true, "startTime": "09:00", "endTime": "17:00" },
    "wednesday": { "enabled": false },
    "thursday": { "enabled": true, "startTime": "09:00", "endTime": "17:00" },
    "friday": { "enabled": true, "startTime": "09:00", "endTime": "17:00" },
    "saturday": { "enabled": false },
    "sunday": { "enabled": false }
  }
}
Expectativa: 200 OK, mensaje de éxito
```

### **Test 3: Obtener horarios después de configurar**
```
GET /api/specialists/me/schedules?businessId=d7af77b9-09cf-4d6b-b159-6249be87935e
Expectativa: Debe mostrar los horarios que acabas de configurar
```

### **Test 4: Intentar horario fuera de rango del negocio**
```
PUT /api/specialists/me/schedules/{BRANCH_ID}
Body: {
  "businessId": "...",
  "weekSchedule": {
    "monday": { "enabled": true, "startTime": "06:00", "endTime": "22:00" }
    // Asumiendo que el negocio trabaja 08:00-20:00
  }
}
Expectativa: 400 Bad Request con mensaje de error
```

### **Test 5: Intentar habilitar día que el negocio tiene cerrado**
```
PUT /api/specialists/me/schedules/{BRANCH_ID}
Body: {
  "businessId": "...",
  "weekSchedule": {
    "sunday": { "enabled": true, "startTime": "10:00", "endTime": "16:00" }
    // Asumiendo que el negocio no trabaja domingos
  }
}
Expectativa: 400 Bad Request con mensaje específico
```

### **Test 6: Ver restricciones del negocio**
```
GET /api/specialists/me/business-constraints?businessId=d7af77b9-09cf-4d6b-b159-6249be87935e
Expectativa: 200 OK con horario del negocio y configuraciones
```

### **Test 7: Actualizar horario existente (cambiar horas)**
```
PUT /api/specialists/me/schedules/{BRANCH_ID}
Body: {
  "businessId": "...",
  "weekSchedule": {
    "monday": { "enabled": true, "startTime": "10:00", "endTime": "16:00" }
    // Cambiar de 09:00-17:00 a 10:00-16:00
  }
}
Expectativa: 200 OK, horario actualizado
```

### **Test 8: Deshabilitar un día que estaba habilitado**
```
PUT /api/specialists/me/schedules/{BRANCH_ID}
Body: {
  "businessId": "...",
  "weekSchedule": {
    "monday": { "enabled": false }
  }
}
Expectativa: 200 OK, día deshabilitado
```

---

## 🔍 Verificación en Base de Datos

Después de ejecutar las pruebas, verifica en la BD:

```sql
-- Ver horarios del especialista
SELECT 
  sbs.id,
  sbs."dayOfWeek",
  sbs."startTime",
  sbs."endTime",
  sbs."isActive",
  b.name as branch_name,
  sp."userId"
FROM specialist_branch_schedules sbs
JOIN specialist_profiles sp ON sp.id = sbs."specialistId"
JOIN branches b ON b.id = sbs."branchId"
WHERE sp."userId" = '{USER_ID_FELIPE}'
ORDER BY sbs."branchId", sbs."dayOfWeek";

-- Ver horario del negocio
SELECT 
  id,
  name,
  type,
  "weeklySchedule",
  "isActive",
  "isDefault"
FROM schedules
WHERE "businessId" = 'd7af77b9-09cf-4d6b-b159-6249be87935e'
  AND "specialistId" IS NULL
  AND "isActive" = true;
```

---

## 📊 Datos de Prueba Necesarios

Para probar estos endpoints necesitas:

1. **businessId**: `d7af77b9-09cf-4d6b-b159-6249be87935e` (mas3d)
2. **branchId**: Obtener desde la BD o desde `/api/business/{businessId}/branches`
3. **userId (Felipe)**: El ID del usuario especialista autenticado
4. **JWT Token**: Token válido de Felipe como especialista

### **Obtener branchId**:
```http
GET /api/business/d7af77b9-09cf-4d6b-b159-6249be87935e/branches
Authorization: Bearer {TOKEN}
```

---

## 🎯 Siguiente Paso

Una vez validados estos 3 endpoints, continuaremos con:

1. ✅ **Fase 1 completada**: Endpoints básicos de horarios
2. ⏳ **Fase 2**: Obtener disponibilidad (slots generados próximos 30 días)
3. ⏳ **Fase 3**: Bloquear/desbloquear slots individuales
4. ⏳ **Fase 4**: Generación automática de TimeSlots desde SpecialistBranchSchedule

---

## 💡 Notas Técnicas

### **Estructura de SpecialistBranchSchedule**:
- Un registro por cada día de la semana que el especialista trabaja
- Relación: `specialistProfile.id` → `specialist_branch_schedules.specialistId`
- No confundir `specialistProfile.id` con `user.id`

### **Transacciones**:
- `updateBranchSchedule` usa transacciones para garantizar consistencia
- Primero elimina todos los horarios de esa sucursal
- Luego crea los nuevos horarios en batch

### **Validaciones**:
- Backend valida contra `Schedule` del negocio (donde `specialistId IS NULL`)
- Solo valida el primer shift del día (simplificado)
- Mejora futura: validar múltiples turnos por día

---

**Estado**: ✅ Endpoints listos para testing
**Próximo paso**: Validar con Insomnia y reportar resultados
