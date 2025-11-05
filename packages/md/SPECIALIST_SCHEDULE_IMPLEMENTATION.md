# Implementación de Gestión de Horarios del Especialista

## Estado Actual
- ✅ Modelo `SpecialistBranchSchedule` ya existe en el backend
- ✅ Soporte multi-sucursal implementado
- ❌ Falta componente mobile para gestionar horarios
- ❌ Falta endpoint para crear/editar horarios

## Plan de Implementación

### 1. Backend - Endpoints de Horarios

#### A. Crear Controller: `SpecialistScheduleController.js`

**Endpoints necesarios:**

```javascript
// GET /api/business/:businessId/specialists/:specialistId/schedules
// Obtener todos los horarios de un especialista (agrupados por sucursal)
getSpecialistSchedules(req, res)

// POST /api/business/:businessId/specialists/:specialistId/schedules
// Crear/actualizar horarios para una sucursal
upsertSchedule(req, res)

// DELETE /api/business/:businessId/specialists/:specialistId/schedules/:scheduleId
// Eliminar un horario específico
deleteSchedule(req, res)

// POST /api/business/:businessId/specialists/:specialistId/schedules/bulk
// Actualizar múltiples horarios a la vez (más eficiente)
bulkUpsertSchedules(req, res)
```

#### B. Permisos
- El especialista puede editar **solo sus propios horarios**
- BUSINESS/OWNER pueden editar horarios de cualquier especialista
- Verificar que el especialista tiene asignada la sucursal en `user_branches`

### 2. Mobile - Componente de Configuración

#### A. Crear `SpecialistScheduleManager.js`

**Ubicación:** `packages/business-control-mobile/src/screens/specialist/SpecialistScheduleManager.js`

**Características:**

1. **Selector de Sucursal** (si tiene múltiples)
   - Dropdown con lista de sucursales asignadas
   - Icono diferenciador por sucursal:
     - 🏢 Principal (isMain: true)
     - 📍 Secundaria (isMain: false)
   - Color badge: Verde para principal, Azul para secundarias

2. **Calendario Semanal**
   - Vista de 7 días (Lunes a Domingo)
   - Cada día puede tener:
     - ✅ Activo/Desactivado (toggle)
     - 🕐 Horario de inicio
     - 🕐 Horario de fin
     - ➕ Agregar turnos múltiples (ej: mañana y tarde)

3. **UI Design**
   ```
   ┌─────────────────────────────┐
   │ Mis Horarios de Atención     │
   ├─────────────────────────────┤
   │ Sucursal: [Dropdown]         │
   │  🏢 mas3d - Principal ✓      │
   ├─────────────────────────────┤
   │ 📅 Lunes          [✓]        │
   │   09:00 - 13:00    [Editar] │
   │   15:00 - 19:00    [Editar] │
   │   [+ Agregar turno]          │
   ├─────────────────────────────┤
   │ 📅 Martes         [✓]        │
   │   09:00 - 18:00    [Editar] │
   ├─────────────────────────────┤
   │ ...                          │
   ├─────────────────────────────┤
   │ [Copiar a todas las sucurs.] │
   │ [Guardar Cambios]            │
   └─────────────────────────────┘
   ```

4. **Funcionalidades Adicionales**
   - **Copiar horarios**: De una sucursal a otra
   - **Plantillas**: Horarios predefinidos (Ej: "Tiempo completo", "Medio tiempo")
   - **Vista previa**: Mostrar resumen antes de guardar
   - **Validaciones**:
     - endTime > startTime
     - No overlap entre turnos del mismo día
     - Mínimo 30 minutos por turno

#### B. Crear `ScheduleTimeSlot.js` (Componente reutilizable)

**Props:**
```javascript
{
  day: 'monday',
  startTime: '09:00',
  endTime: '18:00',
  isActive: true,
  onToggle: () => {},
  onEdit: () => {},
  onDelete: () => {}
}
```

### 3. Integración con Sistema de Citas

#### A. Modificar `checkAvailability` 

**Archivo:** `packages/backend/src/controllers/AppointmentController.js`

```javascript
// Verificar horarios en SpecialistBranchSchedule
const dayOfWeek = moment(date).format('dddd').toLowerCase();
const schedule = await SpecialistBranchSchedule.findOne({
  where: {
    specialistId: specialist.id, // ID del specialist_profile
    branchId: branchId,
    dayOfWeek: dayOfWeek,
    isActive: true
  }
});

if (!schedule) {
  return res.json({
    available: false,
    reason: `El especialista no trabaja los ${dayNames[dayOfWeek]} en esta sucursal`
  });
}

// Verificar que la hora esté dentro del rango
const requestTime = moment(time, 'HH:mm');
const scheduleStart = moment(schedule.startTime, 'HH:mm:ss');
const scheduleEnd = moment(schedule.endTime, 'HH:mm:ss');

if (!requestTime.isBetween(scheduleStart, scheduleEnd, null, '[)')) {
  return res.json({
    available: false,
    reason: `Fuera del horario de atención (${scheduleStart.format('HH:mm')} - ${scheduleEnd.format('HH:mm')})`
  });
}
```

#### B. Modificar `AppointmentCreateModal.js`

**Agregar campo de sucursal** antes de verificar disponibilidad:
```javascript
const checkAvailability = async () => {
  // ...
  body: JSON.stringify({
    specialistId: formData.specialistId,
    branchId: formData.branchId, // ← IMPORTANTE
    date: dateStr,
    time: timeStr,
    duration: formData.duration
  })
}
```

### 4. Navegación Mobile

#### A. Agregar botón en Dashboard del Especialista

**Archivo:** `packages/business-control-mobile/src/screens/specialist/SpecialistDashboard.js`

```jsx
<TouchableOpacity
  style={styles.scheduleButton}
  onPress={() => navigation.navigate('SpecialistSchedule')}
>
  <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
  <Text>Mis Horarios</Text>
</TouchableOpacity>
```

#### B. Registrar ruta en Navigator

**Archivo:** `packages/business-control-mobile/src/navigation/SpecialistNavigator.js`

```javascript
<Stack.Screen 
  name="SpecialistSchedule" 
  component={SpecialistScheduleManager}
  options={{ title: 'Mis Horarios de Atención' }}
/>
```

### 5. Orden de Implementación

**Fase 1 - Backend** (30 min)
1. Crear `SpecialistScheduleController.js`
2. Agregar rutas en `businessConfig.js` o crear `specialistSchedule.js`
3. Implementar `getSpecialistSchedules()` y `bulkUpsertSchedules()`
4. Modificar `checkAvailability()` para usar `SpecialistBranchSchedule`

**Fase 2 - Mobile UI** (45 min)
1. Crear `SpecialistScheduleManager.js` (pantalla principal)
2. Crear `ScheduleTimeSlot.js` (componente de día)
3. Crear `BranchSelector.js` (dropdown con íconos)
4. Agregar navegación desde Dashboard

**Fase 3 - Integración** (15 min)
1. Conectar UI con endpoints
2. Agregar `branchId` a creación de citas
3. Probar flujo completo

**Fase 4 - Mejoras** (opcional)
1. Plantillas de horarios
2. Copiar entre sucursales
3. Excepciones (vacaciones, días festivos)

## Estructura de Datos

### Request: Bulk Upsert Schedules
```json
{
  "branchId": "uuid-sucursal",
  "schedules": [
    {
      "dayOfWeek": "monday",
      "startTime": "09:00",
      "endTime": "13:00",
      "isActive": true
    },
    {
      "dayOfWeek": "monday",
      "startTime": "15:00",
      "endTime": "19:00",
      "isActive": true
    },
    {
      "dayOfWeek": "tuesday",
      "startTime": "09:00",
      "endTime": "18:00",
      "isActive": true
    }
  ]
}
```

### Response: Get Schedules
```json
{
  "success": true,
  "data": {
    "specialist": {
      "id": "uuid",
      "name": "Maria Maria"
    },
    "schedules": [
      {
        "branchId": "uuid-1",
        "branchName": "mas3d - Principal",
        "isMainBranch": true,
        "weeklySchedule": {
          "monday": [
            { "id": "uuid", "startTime": "09:00", "endTime": "13:00", "isActive": true },
            { "id": "uuid", "startTime": "15:00", "endTime": "19:00", "isActive": true }
          ],
          "tuesday": [
            { "id": "uuid", "startTime": "09:00", "endTime": "18:00", "isActive": true }
          ],
          "wednesday": [],
          "thursday": [],
          "friday": [],
          "saturday": [],
          "sunday": []
        }
      }
    ]
  }
}
```

## Íconos por Tipo de Sucursal

- **Principal** (isMain: true):
  - Icono: `home` o `business`
  - Color: Verde (#10b981)
  - Badge: "PRINCIPAL"

- **Secundaria** (isMain: false):
  - Icono: `location` o `pin`
  - Color: Azul (#3b82f6)
  - Badge: nombre de la sucursal

## Permisos Necesarios

Verificar si el especialista tiene permiso:
```javascript
const canManageSchedule = hasPermission('schedule.manage_own') || 
                          user.role === 'BUSINESS' || 
                          user.role === 'OWNER';
```

Si no tiene permiso, mostrar:
```
⚠️ No tienes permisos para gestionar horarios.
Contacta al administrador del negocio.
```

## Siguiente Paso

¿Empezamos con la **Fase 1 - Backend** creando el controller y los endpoints?
