# ✅ ACTUALIZACIÓN DE SERVICIOS DURANTE EL TURNO

## 🎯 Funcionalidad Implementada

Ahora es posible **agregar o quitar servicios de una cita mientras el turno está en curso**.

### Estados que Permiten Edición:
- ✅ `PENDING` - Cita pendiente
- ✅ `CONFIRMED` - Cita confirmada
- ✅ `IN_PROGRESS` - **Turno activo (caso principal)**
- ❌ `COMPLETED` - Bloqueado
- ❌ `CANCELED` - Bloqueado

---

## 📡 Endpoint

```http
PUT /api/appointments/:id?businessId={bizId}
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 📝 Casos de Uso

### **Caso 1: Agregar servicios durante el turno**

Juan Pérez tiene una cita a las 10:00 AM para 2 servicios (Corte + Barba = 60 min).  
Durante el turno decide agregar Coloración (45 min adicionales).

```json
PUT /api/appointments/abc-123?businessId=xyz-789

{
  "serviceIds": [
    "service-corte-uuid",
    "service-barba-uuid", 
    "service-coloracion-uuid"
  ]
}
```

**Resultado:**
```json
{
  "success": true,
  "message": "Cita actualizada exitosamente",
  "data": {
    "id": "abc-123",
    "startTime": "2026-02-12T10:00:00Z",
    "endTime": "2026-02-12T11:45:00Z",  // ✅ Extendido automáticamente
    "duration": 105,                      // ✅ Recalculado (60 + 45)
    "totalAmount": 150000,                // ✅ Recalculado
    "services": [
      {
        "id": "service-corte-uuid",
        "name": "Corte de Cabello",
        "duration": 30,
        "price": 40000,
        "appointmentService": {
          "order": 0,
          "price": 40000,
          "duration": 30
        }
      },
      {
        "id": "service-barba-uuid",
        "name": "Arreglo de Barba",
        "duration": 30,
        "price": 35000,
        "appointmentService": {
          "order": 1,
          "price": 35000,
          "duration": 30
        }
      },
      {
        "id": "service-coloracion-uuid",
        "name": "Coloración",
        "duration": 45,
        "price": 75000,
        "appointmentService": {
          "order": 2,
          "price": 75000,
          "duration": 45
        }
      }
    ],
    "status": "IN_PROGRESS"
  }
}
```

---

### **Caso 2: Quitar un servicio durante el turno**

María tiene cita para Manicure + Pedicure, pero solo quiere hacerse Manicure.

```json
PUT /api/appointments/def-456?businessId=xyz-789

{
  "serviceIds": [
    "service-manicure-uuid"
  ]
}
```

**Resultado:**
- ✅ Duración reducida automáticamente
- ✅ Precio total recalculado
- ✅ `endTime` actualizado

---

### **Caso 3: Reemplazar todos los servicios**

Cliente cambia completamente lo que quiere hacerse:

```json
PUT /api/appointments/ghi-789?businessId=xyz-789

{
  "serviceIds": [
    "service-facial-uuid",
    "service-masaje-uuid"
  ]
}
```

---

## 🔍 Validaciones Automáticas

### 1. **Validación de Conflictos**
Si agregar servicios extiende la duración, el sistema valida que no entre en conflicto con la siguiente cita del especialista:

```json
// ❌ Error si hay conflicto
{
  "success": false,
  "error": "No se pueden agregar estos servicios. El nuevo horario (hasta 11:45) entra en conflicto con otra cita a las 11:30",
  "details": {
    "reason": "SCHEDULE_CONFLICT",
    "originalEndTime": "2026-02-12T11:00:00Z",
    "newEndTime": "2026-02-12T11:45:00Z",
    "conflictingAppointment": {
      "id": "next-appointment-uuid",
      "startTime": "2026-02-12T11:30:00Z"
    }
  }
}
```

### 2. **Validación de Servicios Activos**
Solo permite servicios que:
- ✅ Existen en el catálogo
- ✅ Pertenecen al negocio
- ✅ Están activos (`isActive: true`)

```json
// ❌ Error si hay servicios inválidos
{
  "success": false,
  "error": "Uno o más servicios no válidos o inactivos"
}
```

### 3. **Validación de Estado de Cita**
```json
// ❌ Error si la cita está completada
{
  "success": false,
  "error": "No se puede actualizar la cita",
  "validationErrors": [
    "No se puede modificar una cita completada"
  ]
}
```

---

## 🎨 Recálculos Automáticos

El sistema recalcula automáticamente:

1. **Duración Total**: Suma de duraciones de todos los servicios
2. **Monto Total**: Suma de precios de todos los servicios
3. **EndTime**: `startTime + duración total` (en minutos)
4. **Orden**: Los servicios se ordenan según el array enviado

---

## 🔧 Compatibilidad con Sistema Anterior

- El campo `serviceId` (único) se actualiza con el primer servicio del array por compatibilidad
- La relación muchos-a-muchos se maneja en la tabla `appointment_services`
- Si envías `serviceId` (singular) sigue funcionando como antes

---

## 📊 Ejemplos de Combinaciones

### Actualizar solo servicios (mantiene horario actual):
```json
{
  "serviceIds": ["uuid1", "uuid2"]
}
```

### Actualizar servicios + horario:
```json
{
  "serviceIds": ["uuid1", "uuid2"],
  "startTime": "2026-02-12T14:00:00Z"
}
```

### Actualizar servicios + especialista:
```json
{
  "serviceIds": ["uuid1", "uuid2"],
  "specialistId": "other-specialist-uuid"
}
```

### Actualizar servicios + notas:
```json
{
  "serviceIds": ["uuid1", "uuid2"],
  "notes": "Cliente solicitó estos cambios durante el turno"
}
```

---

## 🎯 Flujo Típico de Uso

1. **Cliente llega a la cita** → Estado cambia a `IN_PROGRESS`
2. **Durante el turno, cliente decide agregar/quitar servicios**
3. **Recepcionista/Especialista hace PUT** con `serviceIds` actualizados
4. **Sistema valida:**
   - ✅ Estado permite edición
   - ✅ Servicios válidos
   - ✅ No hay conflictos de horario
5. **Sistema recalcula:**
   - ✅ Duración total
   - ✅ Precio total  
   - ✅ Hora de finalización
6. **Actualiza tabla `appointment_services`**
7. **Retorna cita actualizada** con todos los servicios

---

## 🐛 Debugging

Logs en consola del servidor:
```
📝 Actualizando servicios de la cita abc-123: [ 'uuid1', 'uuid2', 'uuid3' ]
📊 Nueva duración: 105 min, Nuevo monto: $150000
⏰ EndTime recalculado: 2026-02-12T11:45:00.000Z
✅ 3 servicios actualizados en la cita
```

---

## ✨ Beneficios

1. **Flexibilidad**: Permite cambios en tiempo real durante el turno
2. **Automático**: Recalcula todo sin intervención manual
3. **Seguro**: Valida conflictos antes de aplicar cambios
4. **Preciso**: Mantiene historial de precios al momento de la cita
5. **Ordenado**: Respeta el orden de servicios para ejecución

---

## 🔗 Relacionado

- Ver también: `POST /api/appointments` (crear con múltiples servicios)
- Ver también: `GET /api/appointments/:id` (consultar servicios de una cita)
- Ver también: `PATCH /api/appointments/:id/complete` (completar turno)
