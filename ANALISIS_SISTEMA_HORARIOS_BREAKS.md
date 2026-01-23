# Análisis y Mejora del Sistema de Horarios con Breaks

## 📋 Estado Actual

### Backend ✅ YA IMPLEMENTADO
El modelo `Schedule` ya tiene soporte completo para breaks:

```javascript
weeklySchedule: {
  monday: {
    enabled: true,
    shifts: [
      {
        start: '09:00',
        end: '18:00',
        breakStart: '12:00',  // ✅ YA EXISTE
        breakEnd: '13:00'      // ✅ YA EXISTE
      }
    ]
  }
}
```

**Características del modelo actual:**
- ✅ Soporte para múltiples turnos por día (`shifts` es un array)
- ✅ Campos `breakStart` y `breakEnd` para pausas
- ✅ Campo `slotDuration` (duración de slots en minutos)
- ✅ Campo `bufferTime` (tiempo entre citas)
- ✅ Campo `exceptions` para días especiales
- ✅ Diferenciación entre horario de negocio (`BUSINESS_DEFAULT`) y especialista (`SPECIALIST_CUSTOM`)

### Frontend ❌ NO IMPLEMENTADO
El componente `CalendarAccessSection.jsx` está usando una estructura simplificada:

```javascript
// ❌ ACTUAL: Sin soporte para breaks
weekSchedule: {
  monday: { 
    isOpen: true, 
    startTime: '09:00', 
    endTime: '18:00' 
  }
}
```

**Problemas actuales:**
1. No permite configurar breaks/descansos
2. Solo soporta un turno corrido por día
3. No usa el modelo completo de `Schedule` del backend
4. Los especialistas usan el mismo sistema simplificado

---

## 🎯 Objetivos de la Mejora

### 1. Para el Negocio
- Configurar horarios con breaks de almuerzo/descanso
- Soportar múltiples turnos por día (ej: mañana y tarde)
- Aplicar horarios diferentes por sucursal

### 2. Para los Especialistas
- Heredar horarios del negocio como base
- Personalizar horarios individuales
- Agregar breaks personalizados (ej: María almuerza 13:00-14:00, Juan 12:00-13:00)
- Bloquear días/horas específicos

### 3. UX Mejorada
- Interfaz visual e intuitiva para configurar horarios
- Vista previa de disponibilidad con breaks visibles
- Validación de conflictos
- Copiar horarios entre días fácilmente

---

## 🏗️ Arquitectura Propuesta

### Flujo de Datos

```
1. HORARIOS DEL NEGOCIO (por sucursal)
   ↓
2. HORARIOS BASE DEL ESPECIALISTA (hereda del negocio)
   ↓
3. PERSONALIZACIONES DEL ESPECIALISTA
   - Breaks personalizados
   - Días bloqueados
   - Turnos específicos
```

### Estructura de Datos Unificada

```typescript
interface DaySchedule {
  enabled: boolean;
  shifts: Shift[];
}

interface Shift {
  start: string;      // "09:00"
  end: string;        // "18:00"
  breakStart?: string; // "12:00" (opcional)
  breakEnd?: string;   // "13:00" (opcional)
}

interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}
```

---

## 🎨 Mejoras de UX Propuestas

### Componente: `ScheduleEditor` (nuevo)

**Características visuales:**
1. **Vista de Timeline por Día**
   ```
   Lunes
   ├─ 09:00 ━━━━━━━━━━━ 12:00  [Turno Mañana]
   ├─ 12:00 ··········· 13:00  [Break Almuerzo]
   └─ 13:00 ━━━━━━━━━━━ 18:00  [Turno Tarde]
   ```

2. **Editor Visual de Turnos**
   - Drag & drop para ajustar horarios
   - Botón "Agregar Break" para insertar pausas
   - Botón "Agregar Turno" para jornadas partidas
   - Vista previa en tiempo real

3. **Plantillas Rápidas**
   - "Horario Corrido" (9:00-18:00 sin breaks)
   - "Con Almuerzo" (9:00-12:00, break, 13:00-18:00)
   - "Jornada Partida" (9:00-13:00 / 15:00-19:00)
   - "Medio Tiempo" (9:00-14:00)

4. **Copiar Horarios**
   - "Copiar a todos los días hábiles"
   - "Copiar a días específicos"
   - "Copiar desde otra sucursal/especialista"

### Componente: `BreakManager` (nuevo)

Gestiona breaks de forma intuitiva:
```
┌─────────────────────────────────┐
│ 🕐 Horario: 09:00 - 18:00      │
├─────────────────────────────────┤
│ ☕ Breaks configurados:          │
│                                  │
│ • 12:00 - 13:00 (Almuerzo)      │
│   [Editar] [Eliminar]           │
│                                  │
│ [+ Agregar Break]               │
└─────────────────────────────────┘
```

---

## 🔄 Plan de Implementación

### Fase 1: Backend (Ya está listo) ✅
- El modelo `Schedule` ya soporta breaks
- Solo necesitamos asegurar que los endpoints lo usen correctamente

### Fase 2: Frontend - Negocio
**Archivos a modificar:**
1. `CalendarAccessSection.jsx` - Tab de Horarios
   - Reemplazar editor simple por `ScheduleEditor`
   - Usar estructura `weeklySchedule` completa
   - Guardar en modelo `Schedule` del backend

**Nuevo componente:**
```javascript
// packages/web-app/src/components/schedule/ScheduleEditor.jsx
- Vista visual de horarios con breaks
- Soporte para múltiples turnos
- Drag & drop para ajustar horas
- Plantillas predefinidas
```

### Fase 3: Frontend - Especialistas
**Archivos a modificar:**
1. `StaffManagementSection.jsx` - Tab de Calendario
   - Integrar `ScheduleEditor` para especialistas
   - Mostrar horarios heredados del negocio
   - Permitir personalizaciones

2. `SpecialistBranchScheduleEditor` (ya existe)
   - Actualizar para usar nueva estructura
   - Agregar soporte para breaks

---

## 📊 Ejemplo de Uso

### Caso 1: Negocio con Break de Almuerzo
```javascript
{
  monday: {
    enabled: true,
    shifts: [{
      start: '09:00',
      end: '18:00',
      breakStart: '12:00',
      breakEnd: '14:00'
    }]
  }
}
```

**Vista para clientes:**
- ✅ Disponible: 9:00-12:00
- ❌ No disponible: 12:00-14:00 (Almuerzo)
- ✅ Disponible: 14:00-18:00

### Caso 2: Jornada Partida (Mañana y Tarde)
```javascript
{
  monday: {
    enabled: true,
    shifts: [
      { start: '08:00', end: '13:00' },  // Turno mañana
      { start: '15:00', end: '20:00' }   // Turno tarde
    ]
  }
}
```

### Caso 3: Especialista con Break Personalizado
```javascript
// Negocio: 9:00-18:00 con break 12:00-13:00
// María personaliza su break:
{
  monday: {
    enabled: true,
    shifts: [{
      start: '09:00',
      end: '18:00',
      breakStart: '13:30',  // María prefiere almorzar más tarde
      breakEnd: '14:30'
    }]
  }
}
```

---

## ✅ Próximos Pasos

1. **Validar análisis** con el equipo
2. **Diseñar mockups** del nuevo `ScheduleEditor`
3. **Crear componente `ScheduleEditor`** reutilizable
4. **Actualizar `CalendarAccessSection`** para usar el nuevo editor
5. **Actualizar `StaffManagementSection`** para especialistas
6. **Testing** con casos reales
7. **Documentación** para usuarios

---

## 🎯 Beneficios

### Para el Negocio
- ✅ Horarios más realistas y flexibles
- ✅ Mejor gestión de disponibilidad
- ✅ Clientes ven slots disponibles reales

### Para los Especialistas
- ✅ Personalización de breaks
- ✅ Mejor balance trabajo-descanso
- ✅ Horarios adaptados a sus necesidades

### Para los Clientes
- ✅ Solo ven horarios realmente disponibles
- ✅ No hay confusión con "horas de almuerzo"
- ✅ Mejor experiencia de reserva

---

## 🔧 Consideraciones Técnicas

### Validaciones Necesarias
1. Break debe estar dentro del turno
2. No puede haber breaks superpuestos
3. Turnos no pueden superponerse
4. Validar formato de horas (HH:mm)
5. Break mínimo: 15 minutos
6. Break máximo: 3 horas

### Performance
- Usar debounce al editar horarios
- Guardar solo cuando usuario confirma cambios
- Previsualización en tiempo real sin guardar

### Accesibilidad
- Inputs de tiempo nativos del navegador
- Labels claros para screen readers
- Keyboard navigation completa
- Mensajes de error descriptivos
