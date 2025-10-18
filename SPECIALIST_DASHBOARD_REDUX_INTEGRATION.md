# ✅ Integración Redux - Specialist Dashboard Mobile

**Fecha:** 17 de octubre de 2025  
**Estado:** ✅ Completado - Paso 1: Conectar con API Real

---

## 📋 Resumen

Se completó exitosamente la integración de Redux para el dashboard del especialista en la aplicación móvil, migrando de datos mock a datos reales desde el backend.

---

## 🏗️ Arquitectura Implementada

### 1. **Carpeta Shared - Redux Slice**

Se creó un nuevo slice en la carpeta compartida para gestionar el estado del dashboard del especialista:

```
packages/shared/src/store/slices/specialistDashboardSlice.js
```

#### Async Thunks Implementados:

- ✅ `fetchSpecialistAppointments` - Obtener citas del especialista
- ✅ `confirmAppointment` - Confirmar una cita
- ✅ `startAppointment` - Iniciar procedimiento
- ✅ `completeAppointment` - Completar turno
- ✅ `cancelAppointment` - Cancelar cita con motivo
- ✅ `updateAppointmentStatus` - Actualizar estado genérico

#### State Schema:

```javascript
{
  appointments: [],        // Array de citas
  stats: {
    total: 0,             // Total de turnos
    completed: 0,         // Turnos completados
    inProgress: 0,        // Turnos en progreso
    cancelled: 0,         // Turnos cancelados
    totalEarnings: 0,     // Total ingresos
    totalCommissions: 0,  // Total comisiones
    pendingCommissions: 0 // Comisiones pendientes
  },
  filters: {
    date: '2025-10-17',   // Fecha actual por defecto
    branchId: null,       // Filtro por sucursal
    status: null          // Filtro por estado
  },
  selectedAppointment: null,
  loading: false,
  error: null,
  actionLoading: false,
  actionError: null
}
```

#### Actions (Reducers):

- `setFilters` - Actualizar filtros
- `setSelectedAppointment` - Seleccionar cita
- `clearSelectedAppointment` - Limpiar selección
- `clearError` - Limpiar errores
- `resetDashboard` - Reset completo del estado

---

### 2. **Backend - Endpoint Specialist Dashboard**

#### Nueva Ruta:

```
GET /api/specialists/me/dashboard/appointments
```

**Query Params:**
- `date` (opcional) - Fecha específica (default: hoy)
- `branchId` (opcional) - Filtrar por sucursal
- `status` (opcional) - Filtrar por estado

**Respuesta:**

```json
{
  "appointments": [
    {
      "id": "uuid",
      "clientName": "María García",
      "clientPhone": "+57 300 123 4567",
      "serviceName": "Tratamiento Facial",
      "branchName": "Centro",
      "branchColor": "#3b82f6",
      "date": "2025-10-17T09:00:00Z",
      "startTime": "09:00",
      "endTime": "10:30",
      "duration": 90,
      "price": 150000,
      "commissionPercentage": 40,
      "commissionAmount": 60000,
      "status": "CONFIRMED",
      "origin": "business",
      "paymentStatus": "PENDING",
      "consentStatus": "PENDING"
    }
  ],
  "stats": {
    "total": 8,
    "completed": 3,
    "inProgress": 2,
    "cancelled": 1,
    "totalEarnings": 450000,
    "totalCommissions": 180000,
    "pendingCommissions": 120000
  }
}
```

**Controlador:**

```javascript
// packages/backend/src/controllers/AppointmentController.js
async getSpecialistDashboardAppointments(req, res) {
  // Incluye:
  // - Lookup de SpecialistProfile
  // - Filtro por fecha (default hoy)
  // - Filtro por branch y status
  // - Cálculo de comisiones via SpecialistService
  // - Agregación de stats
  // - Detección de origen (business/online/specialist)
}
```

**Middleware:**
- `authenticateToken` - Validar JWT
- `requireSpecialist` - Solo especialistas

---

### 3. **React Native Store**

Se agregó el reducer al store de React Native:

```javascript
// packages/shared/src/store/reactNativeStore.js

import specialistDashboardReducer from './slices/specialistDashboardSlice.js';

export const createReactNativeStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
      // ... otros reducers
      specialistDashboard: specialistDashboardReducer  // ✅ NUEVO
    }
  });
};
```

#### Selectores Exportados:

```javascript
// Selectores de especialista
export const selectSpecialistAppointments = (state) => state.specialistDashboard.appointments;
export const selectSpecialistStats = (state) => state.specialistDashboard.stats;
export const selectSpecialistFilters = (state) => state.specialistDashboard.filters;
export const selectSpecialistSelectedAppointment = (state) => state.specialistDashboard.selectedAppointment;
export const selectSpecialistDashboardLoading = (state) => state.specialistDashboard.loading;
export const selectSpecialistDashboardError = (state) => state.specialistDashboard.error;
export const selectSpecialistActionLoading = (state) => state.specialistDashboard.actionLoading;
export const selectSpecialistActionError = (state) => state.specialistDashboard.actionError;
```

---

### 4. **Mobile Component - SpecialistDashboardNew.js**

#### Cambios Implementados:

**Antes (Mock Data):**

```javascript
const [appointments, setAppointments] = useState([]);
const [stats, setStats] = useState({...});
const [loading, setLoading] = useState(true);

const loadDashboardData = async () => {
  setLoading(true);
  // ... mock data hardcoded
  setAppointments(mockAppointments);
  setStats(calculatedStats);
  setLoading(false);
};
```

**Después (Redux):**

```javascript
// Redux state
const appointments = useSelector(selectSpecialistAppointments);
const stats = useSelector(selectSpecialistStats);
const loading = useSelector(selectSpecialistDashboardLoading);

const loadDashboardData = async () => {
  try {
    await dispatch(fetchSpecialistAppointments({
      date: filters.date,
      branchId: filters.branchId,
      status: filters.status
    })).unwrap();
  } catch (error) {
    Alert.alert('Error', 'No se pudieron cargar los datos');
  }
};
```

#### Actions Conectadas:

```javascript
// Confirmar turno
await dispatch(confirmAppointment(appointmentId)).unwrap();

// Iniciar procedimiento
await dispatch(startAppointment(appointmentId)).unwrap();

// Completar turno
await dispatch(completeAppointment(appointmentId)).unwrap();

// Cancelar con motivo
await dispatch(cancelAppointment({ 
  appointmentId, 
  reason 
})).unwrap();
```

#### Stats Cards Actualizadas:

```javascript
<StatsCard
  title="Turnos Hoy"
  value={`${stats.completed}/${stats.total}`}
  subtitle={`${stats.inProgress} en progreso`}
  icon="calendar"
  color="#10b981"
/>
<StatsCard
  title="Ingresos Hoy"
  value={`$${(stats.totalEarnings / 1000).toFixed(0)}K`}
  subtitle="Total facturado"
  icon="cash"
  color="#8b5cf6"
/>
<StatsCard
  title="Comisiones"
  value={`$${(stats.totalCommissions / 1000).toFixed(0)}K`}
  subtitle={`$${(stats.pendingCommissions / 1000).toFixed(0)}K pendientes`}
  icon="wallet"
  color="#f59e0b"
/>
```

---

## 🗂️ Archivos Modificados

### Nuevos:
- ✅ `packages/shared/src/store/slices/specialistDashboardSlice.js`
- ✅ `packages/backend/src/controllers/AppointmentController.js` (método getSpecialistDashboardAppointments)

### Modificados:
- ✅ `packages/shared/src/store/slices/index.js` - Export del nuevo slice
- ✅ `packages/shared/src/store/reactNativeStore.js` - Reducer + selectores
- ✅ `packages/backend/src/routes/specialistRoutes.js` - Nueva ruta
- ✅ `packages/business-control-mobile/src/screens/dashboards/SpecialistDashboardNew.js` - Migración a Redux

---

## 🔄 Flujo de Datos

```
[Mobile Component]
       ↓
   useSelector (appointments, stats)
       ↓
   [Redux Store - specialistDashboard]
       ↓
   fetchSpecialistAppointments thunk
       ↓
   axios.get('/api/specialists/me/dashboard/appointments')
       ↓
   [Backend - AppointmentController.getSpecialistDashboardAppointments]
       ↓
   - Obtener SpecialistProfile
   - Filtrar citas por fecha/branch/status
   - JOIN con Service, Client, Branch, SpecialistService
   - Calcular comisiones
   - Agregar estadísticas
       ↓
   Response JSON
       ↓
   Redux reducer actualiza state
       ↓
   Component re-renderiza con datos reales
```

---

## 🎯 Funcionalidades Completadas

### ✅ Paso 1: Conectar con API Real (COMPLETADO)

- [x] Crear specialistDashboardSlice con thunks
- [x] Crear endpoint backend `/specialists/me/dashboard/appointments`
- [x] Incluir cálculo de comisiones desde SpecialistService
- [x] Agregar stats (total, completed, inProgress, earnings, commissions)
- [x] Integrar reducer en React Native store
- [x] Exportar selectores
- [x] Migrar SpecialistDashboardNew de mock a Redux
- [x] Conectar actions (confirm, start, complete, cancel)
- [x] Actualizar stats cards con valores reales

### 🔜 Paso 2: Crear Citas (Siguiente)

- [ ] Implementar modal de creación
- [ ] Integrar business rules validation
- [ ] Selector de clientes
- [ ] Selector de servicios
- [ ] Selector de horarios disponibles
- [ ] Validación de reglas de negocio

### 🔜 Paso 3: Flujo de Completado

- [ ] Modal de evidencias
- [ ] Carga de fotos antes/después
- [ ] Firma de consentimiento
- [ ] Confirmación de pago

### 🔜 Paso 4: Tab de Comisiones

- [ ] Lista de comisiones por período
- [ ] Filtros por fecha
- [ ] Total acumulado
- [ ] Estado de pago

---

## 🧪 Testing

### Cómo Probar:

1. **Iniciar Backend:**
   ```bash
   cd packages/backend
   npm start
   ```
   ✅ Backend corriendo en `http://192.168.0.213:3001`

2. **Iniciar Mobile:**
   ```bash
   cd packages/business-control-mobile
   npx expo start --clear
   ```

3. **Login como Especialista:**
   - Email: `felipeosoriolobeto@gmail.com`
   - Password: `Admin*7754`
   - Subdomain: `mas3d`

4. **Verificar Dashboard:**
   - Stats cards deben mostrar datos reales
   - Lista de citas del día
   - Badges de sucursal con colores
   - Badges de origen (online/business/specialist)
   - Botones de acción según estado

### Logs Esperados:

```
📱 Specialist Dashboard - User: { id, email, role: 'SPECIALIST' }
📱 Specialist Dashboard - BusinessId: uuid
📱 Specialist Dashboard - Appointments: 3
📱 Specialist Dashboard - Stats: { total: 3, completed: 1, ... }
```

---

## 📊 Estructura de Datos

### Appointment Object:

```javascript
{
  id: "uuid",
  clientName: "María García",
  clientPhone: "+57 300 123 4567",
  serviceName: "Tratamiento Facial Completo",
  branchName: "Centro",
  branchColor: "#3b82f6",
  date: "2025-10-17T09:00:00.000Z",
  startTime: "09:00",
  endTime: "10:30",
  duration: 90,
  price: 150000,
  commissionPercentage: 40,
  commissionAmount: 60000,
  status: "CONFIRMED",         // PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED
  origin: "business",          // business | online | specialist
  paymentStatus: "PENDING",    // PENDING | PAID | PARTIAL
  consentStatus: "PENDING",    // PENDING | COMPLETED | NOT_REQUIRED
  evidenceStatus: "PENDING"    // PENDING | UPLOADED | NOT_REQUIRED
}
```

---

## 🚀 Próximos Pasos

### Inmediato:
1. ✅ **Probar integración completa** - Login specialist + ver dashboard con datos reales
2. ✅ **Verificar actions** - Confirmar/Iniciar/Completar/Cancelar citas

### Corto Plazo (Paso 2):
3. 🔜 Implementar creación de citas desde móvil
4. 🔜 Validación de business rules antes de agendar
5. 🔜 Selector de horarios con disponibilidad real

### Mediano Plazo (Pasos 3-4):
6. 🔜 Flujo completo de completado con evidencias
7. 🔜 Tab de comisiones con histórico

---

## ✅ Checklist de Validación

- [x] Backend endpoint `/specialists/me/dashboard/appointments` funcional
- [x] Middleware `requireSpecialist` aplicado
- [x] Response incluye appointments array + stats object
- [x] Comisiones calculadas desde SpecialistService
- [x] Redux slice creado con thunks
- [x] Reducer agregado a React Native store
- [x] Selectores exportados
- [x] Component migrado de mock a Redux
- [x] Stats cards usando valores reales del backend
- [x] Actions conectadas (confirm, start, complete, cancel)
- [x] Pull-to-refresh funcional
- [x] Loading states manejados
- [x] Error handling implementado

---

## 📝 Notas Técnicas

### Consideraciones:
- ✅ **Hermes Compatibility**: No se usa `import.meta`, todo con `globalThis`
- ✅ **Axios en Redux**: Se importa desde `axios` directamente
- ✅ **API URL**: Se usa `getApiUrl()` de `@shared/constants/api`
- ✅ **Unwrap**: Se usa `.unwrap()` para manejar errores en components
- ✅ **Stats Calculation**: Backend calcula todo server-side

### Beneficios de Redux:
- ✅ Estado centralizado y predecible
- ✅ Acciones reutilizables en toda la app
- ✅ Cache de datos entre navegaciones
- ✅ DevTools para debugging
- ✅ Middleware para logging/analytics

---

**Autor:** AI Assistant  
**Revisión:** Pendiente  
**Deploy:** Development
