# 🎨 Rediseño del Specialist Dashboard - Business Control Mobile

## 📅 Fecha: 18 de Octubre 2025

---

## 🎯 Objetivos del Rediseño

### Funcionalidades Requeridas:

1. ✅ **Calendario/Agenda del Especialista**
   - Ver todos los turnos asignados
   - Diferenciar turnos online vs. creados por business
   - Indicador visual de sucursal (cuando hay múltiples)
   - Estados de turnos (pendiente, confirmado, completado, cancelado)

2. ✅ **Capacidad de Agendar**
   - Crear nuevos turnos (si las reglas lo permiten)
   - Validación contra reglas de negocio
   - Seleccionar cliente, servicio, fecha/hora
   - Verificar disponibilidad

3. ✅ **Vista de Sucursales**
   - Icono diferenciador por sucursal
   - Color o badge distintivo
   - Nombre de la sucursal en el turno

4. ✅ **Información Completa del Turno**
   - Cliente
   - Servicio
   - Duración
   - Precio
   - Comisión del especialista
   - Estado de pago
   - Estado de consentimiento (si aplica)

5. ✅ **Acciones sobre Turnos**
   - Ver detalles
   - Iniciar procedimiento
   - Completar (con validaciones)
   - Cancelar (según políticas)

---

## 🎨 Diseño Visual

### Paleta de Colores:
```javascript
const colors = {
  primary: '#3b82f6',      // Azul principal
  secondary: '#8b5cf6',     // Púrpura
  success: '#10b981',       // Verde
  warning: '#f59e0b',       // Naranja
  danger: '#ef4444',        // Rojo
  background: '#f9fafb',    // Gris claro
  card: '#ffffff',          // Blanco
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    light: '#9ca3af'
  }
}
```

### Estructura de Pantalla:
```
┌─────────────────────────────────────┐
│ Header (Gradient Azul)              │
│ - Bienvenida + Fecha                │
│ - Stats Cards (horizontal scroll)   │
├─────────────────────────────────────┤
│ Tab Bar (Agenda | Comisiones)       │
├─────────────────────────────────────┤
│                                      │
│  CONTENIDO SEGÚN TAB ACTIVO         │
│                                      │
│  • Agenda: Lista de turnos del día  │
│  • Comisiones: Resumen y detalle    │
│                                      │
│                                      │
└─────────────────────────────────────┘
```

---

## 📋 Componentes del Dashboard

### 1. Header con Stats
```javascript
// Stats Cards horizontales
- Turnos de Hoy (completados/total)
- Ingresos del Día
- Comisiones Pendientes
- Próximo Turno
```

### 2. Tab de Agenda
```javascript
// Filtros
- Selector de fecha (hoy, mañana, semana)
- Filtro por sucursal (si hay múltiples)
- Filtro por estado

// Lista de Turnos
- Card por cada turno con:
  • Hora
  • Cliente (nombre + teléfono)
  • Servicio
  • Sucursal (badge/icono)
  • Estado (badge coloreado)
  • Origen (online vs. business)
  • Acciones (ver, iniciar, completar)
```

### 3. Tab de Comisiones
```javascript
// Resumen
- Total pendiente de cobro
- Total del mes
- Promedio por servicio

// Historial
- Lista de comisiones generadas
- Estado (pendiente, pagada)
- Botón "Solicitar Pago"
```

---

## 🔧 Estructura de Datos

### Turno (Appointment):
```javascript
{
  id: string,
  clientId: string,
  clientName: string,
  clientPhone: string,
  serviceId: string,
  serviceName: string,
  branchId: string,
  branchName: string,
  branchIcon: string, // o color
  date: DateTime,
  startTime: string,
  duration: number, // minutos
  price: number,
  commissionPercentage: number,
  commissionAmount: number,
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
  origin: 'online' | 'business' | 'specialist',
  paymentStatus: 'pending' | 'partial' | 'completed',
  consentStatus: 'not_required' | 'pending' | 'completed',
  evidenceStatus: 'not_required' | 'pending' | 'completed',
  notes: string
}
```

### Reglas de Negocio Relevantes:
```javascript
{
  canSpecialistCreateAppointments: boolean,
  requiresConsentForCompletion: boolean,
  requiresEvidencePhotos: boolean,
  requiresFullPayment: boolean,
  minimumPaymentPercentage: number,
  cancellationHoursNotice: number,
  maxCancellationsAllowed: number
}
```

---

## 📱 Vistas y Funcionalidades

### Vista Principal - Agenda
```
┌─────────────────────────────────────┐
│ 📅 Lunes, 18 de Octubre 2025        │
│                                      │
│ [Hoy] [Mañana] [Semana] [Mes]      │
│                                      │
│ 🏢 Todas las Sucursales ▼           │
├─────────────────────────────────────┤
│                                      │
│ 🟢 09:00 - 10:30                    │
│ María García                         │
│ Tratamiento Facial | 📍 Centro      │
│ $150.000 | 💰 40% comisión          │
│ [Ver] [Iniciar]                     │
├─────────────────────────────────────┤
│ 🟡 11:00 - 12:00                    │
│ Ana López                            │
│ Manicure | 📍 Norte (Online)        │
│ $85.000 | 💰 35% comisión           │
│ [Ver] [Confirmar]                   │
├─────────────────────────────────────┤
│ 🔵 14:00 - 16:00                    │
│ Carmen Ruiz                          │
│ Corte + Tintura | 📍 Centro         │
│ $120.000 | 💰 45% comisión          │
│ [Ver]                               │
└─────────────────────────────────────┘

[+] Agendar Nuevo Turno (floating button)
```

### Modal de Detalles del Turno
```
┌─────────────────────────────────────┐
│ Detalles del Turno                  │
├─────────────────────────────────────┤
│ 👤 Cliente: María García            │
│ 📞 Teléfono: +57 300 123 4567       │
│ 📧 Email: maria@example.com         │
│                                      │
│ 💇‍♀️ Servicio: Tratamiento Facial     │
│ ⏱️ Duración: 90 minutos             │
│ 💵 Precio: $150.000                 │
│ 💰 Tu comisión: $60.000 (40%)       │
│                                      │
│ 🏢 Sucursal: Centro                 │
│ 📅 Fecha: 18/10/2025                │
│ 🕐 Hora: 09:00 - 10:30              │
│                                      │
│ 📝 Estado: Confirmado               │
│ 💳 Pago: Pendiente                  │
│ 📋 Consentimiento: Pendiente        │
│                                      │
│ 📄 Notas: Cliente prefiere          │
│    productos orgánicos               │
│                                      │
│ [Iniciar Procedimiento]             │
│ [Cancelar Turno]                    │
│ [Cerrar]                            │
└─────────────────────────────────────┘
```

### Modal de Crear Turno
```
┌─────────────────────────────────────┐
│ Agendar Nuevo Turno                 │
├─────────────────────────────────────┤
│ 👤 Cliente *                        │
│ [Buscar cliente...] 🔍              │
│                                      │
│ 💇‍♀️ Servicio *                       │
│ [Seleccionar servicio...] ▼         │
│                                      │
│ 🏢 Sucursal *                       │
│ [📍 Centro] ▼                       │
│                                      │
│ 📅 Fecha *                          │
│ [18/10/2025] 📅                     │
│                                      │
│ 🕐 Hora *                           │
│ [09:00] ⏰                           │
│                                      │
│ ⏱️ Duración: 90 minutos             │
│ 💵 Precio: $150.000                 │
│ 💰 Tu comisión: $60.000 (40%)       │
│                                      │
│ 📝 Notas (opcional)                 │
│ [Agregar notas...]                  │
│                                      │
│ [Cancelar] [Crear Turno] ✅         │
└─────────────────────────────────────┘
```

---

## 🔄 Flujo de Trabajo

### 1. Ver Agenda
```
Usuario abre app
  ↓
Login como SPECIALIST
  ↓
Dashboard carga
  ↓
Tab "Agenda" activo por defecto
  ↓
Carga turnos del día desde API
  ↓
Muestra lista ordenada por hora
  ↓
Indica origen (online/business/specialist)
  ↓
Muestra sucursal si hay múltiples
```

### 2. Crear Turno (si está permitido)
```
Click en botón [+]
  ↓
Verifica permisos (businessRules.canSpecialistCreateAppointments)
  ↓
Si permitido:
  Abre modal de creación
  ↓
  Selecciona cliente (existente o nuevo)
  ↓
  Selecciona servicio
  ↓
  Selecciona sucursal
  ↓
  Selecciona fecha/hora
  ↓
  Verifica disponibilidad
  ↓
  Calcula comisión automáticamente
  ↓
  Crea turno
  ↓
  Actualiza lista
Si no permitido:
  Muestra mensaje de error
```

### 3. Completar Turno
```
Click en turno "En Progreso"
  ↓
Abre flujo de completado
  ↓
Valida reglas de negocio:
  - Consentimiento (si se requiere)
  - Fotos antes/después (si se requiere)
  - Pago (si se requiere mínimo)
  ↓
Si todo OK:
  Completa turno
  ↓
  Genera comisión
  ↓
  Actualiza estadísticas
```

---

## 🚀 Próximos Pasos de Implementación

### Fase 1: UI Base ✅
- [ ] Rediseñar componente principal
- [ ] Header con stats
- [ ] Tab bar
- [ ] Lista de turnos
- [ ] Cards de turno

### Fase 2: Integración con Backend ⏳
- [ ] API para obtener turnos del especialista
- [ ] API para crear turnos
- [ ] API para actualizar estados
- [ ] API para obtener reglas de negocio

### Fase 3: Funcionalidades Avanzadas 🔜
- [ ] Filtros y búsqueda
- [ ] Notificaciones push
- [ ] Sincronización en tiempo real
- [ ] Vista de calendario (mes completo)
- [ ] Gestión de comisiones completa

---

¿Empezamos con la **Fase 1** del rediseño? 🚀
