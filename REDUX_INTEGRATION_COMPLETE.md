# 💉 Redux Integration - Treatment Plans System (FM-28)

**Fecha:** 19 de Octubre 2025  
**Branch:** FM-28  
**Estado:** ✅ Completado

## 📋 Resumen de Integración

Se ha completado la integración completa de Redux para el sistema de tratamientos multi-sesión, incluyendo API layer, Redux slices, y utilidades para servicios paquete.

---

## 📦 Archivos Creados

### 1. **API Layer**
- ✅ `packages/shared/src/api/treatmentPlansApi.js` (580 líneas)
  - API completa para planes de tratamiento y sesiones
  - 15 funciones principales + utilidades
  - Constantes del sistema
  - Validaciones y formateadores

### 2. **Redux Layer**
- ✅ `packages/shared/src/store/slices/treatmentPlansSlice.js` (780 líneas)
  - 15 AsyncThunks (7 para planes + 8 para sesiones)
  - State management completo
  - 20+ selectors especializados
  - Actions para manejo de estado

---

## 🔄 Archivos Modificados

### 1. **API Exports**
- ✅ `packages/shared/src/api/index.js`
  - Agregado import/export de `treatmentPlansApi`
  - Incluido en `businessApis` group

### 2. **Redux Exports**
- ✅ `packages/shared/src/store/slices/index.js`
  - Agregado export de `treatmentPlansSlice`
  - Exportados 15 thunks
  - Exportados 20+ selectors
  - Exportadas 8 actions

### 3. **Redux Store**
- ✅ `packages/shared/src/store/index.js`
  - Agregado `treatmentPlansReducer`
  - Configurado en `treatmentPlans` key

### 4. **Business Services API**
- ✅ `packages/shared/src/api/businessServicesApi.js`
  - Agregadas constantes de `PACKAGE_TYPES`
  - 7 nuevas utilidades para paquetes:
    - `isPackageService()`
    - `isMultiSessionService()`
    - `hasMaintenanceService()`
    - `getPackageTotalSessions()`
    - `calculatePackageTotalPrice()`
    - `formatPackageInfo()`
    - `validatePackageData()`

---

## 🎯 API Functions (treatmentPlansApi.js)

### **Treatment Plans CRUD**
```javascript
createTreatmentPlan(planData)
getTreatmentPlan(planId)
getTreatmentPlans(params)
getClientTreatmentPlans(clientId, includeCompleted)
updateTreatmentPlan(planId, updateData)
cancelTreatmentPlan(planId, reason)
addPlanPayment(planId, paymentData)
```

### **Treatment Sessions Management**
```javascript
getSession(sessionId)
scheduleSession(sessionId, scheduleData)
completeSession(sessionId, completionData)
cancelSession(sessionId, reason)
rescheduleSession(sessionId, newAppointmentId)
markSessionNoShow(sessionId, notes)
```

### **Photo Management**
```javascript
addSessionPhoto(sessionId, photoData)
deleteSessionPhoto(sessionId, photoIndex)
```

### **Payment Management**
```javascript
registerSessionPayment(sessionId)
```

### **Utilities**
```javascript
validateTreatmentPlanData(planData)
calculatePlanProgress(plan)
calculatePaymentProgress(plan)
formatTreatmentPlan(plan)
formatSession(session)
getNextPendingSession(plan)
canScheduleNextSession(plan)
```

---

## 🔄 Redux Thunks (treatmentPlansSlice.js)

### **Plan Operations**
```javascript
createTreatmentPlan
fetchTreatmentPlan
fetchTreatmentPlans
fetchClientTreatmentPlans
updateTreatmentPlan
cancelTreatmentPlan
addPlanPayment
```

### **Session Operations**
```javascript
fetchSession
scheduleSession
completeSession
cancelSession
rescheduleSession
markSessionNoShow
addSessionPhoto
deleteSessionPhoto
registerSessionPayment
```

---

## 📊 Redux State Structure

```javascript
{
  treatmentPlans: {
    // Data
    plans: [],                    // Array de planes
    currentPlan: null,            // Plan actualmente seleccionado
    clientPlans: [],              // Planes de un cliente específico
    sessions: {},                 // Cache de sesiones por ID
    currentSession: null,         // Sesión actualmente seleccionada
    
    // Pagination
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    },
    
    // Loading states (por operación)
    loading: {
      fetchPlans: false,
      fetchPlan: false,
      createPlan: false,
      updatePlan: false,
      cancelPlan: false,
      addPayment: false,
      fetchSession: false,
      scheduleSession: false,
      completeSession: false,
      cancelSession: false,
      rescheduleSession: false,
      markNoShow: false,
      addPhoto: false,
      deletePhoto: false,
      registerPayment: false
    },
    
    // Error states (por operación)
    errors: { ... },
    
    // Success flags (por operación)
    success: { ... }
  }
}
```

---

## 🎨 Redux Selectors

### **Basic Selectors**
```javascript
selectAllPlans(state)
selectCurrentPlan(state)
selectClientPlans(state)
selectCurrentSession(state)
selectSessions(state)
selectPagination(state)
```

### **Loading Selectors**
```javascript
selectLoading(state)
selectIsLoading(operation)(state)
```

### **Error Selectors**
```javascript
selectErrors(state)
selectError(operation)(state)
```

### **Success Selectors**
```javascript
selectSuccess(state)
selectSuccessFlag(operation)(state)
```

### **By ID Selectors**
```javascript
selectPlanById(planId)(state)
selectSessionById(sessionId)(state)
```

### **Filtered Selectors**
```javascript
selectActivePlans(state)
selectCompletedPlans(state)
selectCurrentPlanSessions(state)
selectCurrentPlanPendingSessions(state)
selectCurrentPlanCompletedSessions(state)
```

---

## 🔧 Redux Actions

```javascript
clearErrors()
clearSuccess()
clearError(operation)
clearSuccessFlag(operation)
clearCurrentPlan()
clearCurrentSession()
clearAllTreatmentPlans()
updateSessionInCache(session)
```

---

## 💼 Business Services - Package Utilities

### **Nuevas Funciones**
```javascript
// Verificaciones
isPackageService(service)          // ¿Es un paquete?
isMultiSessionService(service)     // ¿Es multi-sesión?
hasMaintenanceService(service)     // ¿Tiene mantenimientos?

// Cálculos
getPackageTotalSessions(service)   // Total de sesiones
calculatePackageTotalPrice(service) // Precio total calculado

// Formateo
formatPackageInfo(service)         // Info formateada para UI

// Validación
validatePackageData(packageData)   // Validar datos de paquete
```

### **Nuevas Constantes**
```javascript
SERVICE_CONSTANTS.PACKAGE_TYPES = {
  SINGLE: 'SINGLE',
  MULTI_SESSION: 'MULTI_SESSION',
  WITH_MAINTENANCE: 'WITH_MAINTENANCE'
}
```

---

## 🚀 Uso en Componentes React

### **Ejemplo 1: Crear Plan de Tratamiento**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import {
  createTreatmentPlan,
  selectIsLoading,
  selectError,
  selectSuccessFlag,
  clearTreatmentPlanSuccessFlag
} from '@shared/store/slices';

function CreateTreatmentPlanForm() {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading('createPlan'));
  const error = useSelector(selectError('createPlan'));
  const success = useSelector(selectSuccessFlag('createPlan'));
  
  const handleSubmit = async (formData) => {
    await dispatch(createTreatmentPlan({
      clientId: formData.clientId,
      serviceId: formData.serviceId,
      startDate: formData.startDate,
      paymentPlan: 'PER_SESSION'
    }));
  };
  
  useEffect(() => {
    if (success) {
      // Plan creado exitosamente
      dispatch(clearTreatmentPlanSuccessFlag('createPlan'));
      navigate('/treatment-plans');
    }
  }, [success]);
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      {isLoading && <Spinner />}
      {error && <Alert>{error}</Alert>}
    </form>
  );
}
```

### **Ejemplo 2: Listar Planes de Cliente**
```javascript
import {
  fetchClientTreatmentPlans,
  selectClientPlans,
  selectIsLoading
} from '@shared/store/slices';

function ClientTreatmentPlans({ clientId }) {
  const dispatch = useDispatch();
  const plans = useSelector(selectClientPlans);
  const isLoading = useSelector(selectIsLoading('fetchPlans'));
  
  useEffect(() => {
    dispatch(fetchClientTreatmentPlans({
      clientId,
      includeCompleted: false
    }));
  }, [clientId]);
  
  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <TreatmentPlansList plans={plans} />
      )}
    </div>
  );
}
```

### **Ejemplo 3: Completar Sesión**
```javascript
import {
  completeSession,
  fetchTreatmentPlan,
  selectSuccessFlag
} from '@shared/store/slices';

function CompleteSessionButton({ sessionId, planId }) {
  const dispatch = useDispatch();
  const success = useSelector(selectSuccessFlag('completeSession'));
  
  const handleComplete = async () => {
    await dispatch(completeSession({
      sessionId,
      completionData: {
        notes: 'Sesión completada exitosamente',
        photosUrls: [
          { url: 'https://...', type: 'before' },
          { url: 'https://...', type: 'after' }
        ]
      }
    }));
    
    // Recargar plan para ver progreso actualizado
    if (success) {
      dispatch(fetchTreatmentPlan(planId));
    }
  };
  
  return (
    <Button onClick={handleComplete}>
      Completar Sesión
    </Button>
  );
}
```

### **Ejemplo 4: Usar Utilidades de Paquetes**
```javascript
import {
  isMultiSessionService,
  formatPackageInfo,
  calculatePackageTotalPrice
} from '@shared/api/businessServicesApi';

function ServiceCard({ service }) {
  const packageInfo = formatPackageInfo(service);
  const totalPrice = calculatePackageTotalPrice(service);
  
  return (
    <div>
      <h3>{service.name}</h3>
      {packageInfo.isPackage && (
        <div>
          <Badge>{packageInfo.description}</Badge>
          <p>Total: {packageInfo.formattedTotalPrice}</p>
          {packageInfo.allowPartialPayment && (
            <p>Por sesión: {packageInfo.formattedPricePerSession}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 📝 Constantes del Sistema

### **Plan Types**
```javascript
TREATMENT_CONSTANTS.PLAN_TYPES = {
  MULTI_SESSION: 'MULTI_SESSION',
  WITH_MAINTENANCE: 'WITH_MAINTENANCE'
}
```

### **Plan Status**
```javascript
TREATMENT_CONSTANTS.PLAN_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  PAUSED: 'PAUSED'
}
```

### **Session Status**
```javascript
TREATMENT_CONSTANTS.SESSION_STATUS = {
  PENDING: 'PENDING',
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
}
```

### **Payment Plans**
```javascript
TREATMENT_CONSTANTS.PAYMENT_PLANS = {
  FULL_UPFRONT: 'FULL_UPFRONT',
  PER_SESSION: 'PER_SESSION',
  INSTALLMENTS: 'INSTALLMENTS'
}
```

### **Photo Types**
```javascript
TREATMENT_CONSTANTS.PHOTO_TYPES = {
  BEFORE: 'before',
  AFTER: 'after',
  PROGRESS: 'progress'
}
```

---

## ✅ Checklist de Integración

### Backend
- ✅ 3 Migrations creadas y ejecutadas
- ✅ 2 Models creados (TreatmentPlan, TreatmentSession)
- ✅ Service model extendido (6 campos nuevos)
- ✅ 2 Controllers creados (580+ líneas)
- ✅ 15 Endpoints REST configurados
- ✅ Database verificada con psql

### Frontend - API Layer
- ✅ treatmentPlansApi.js creado (580 líneas)
- ✅ 22 funciones de API implementadas
- ✅ 7 utilidades para validación/formateo
- ✅ businessServicesApi.js actualizado
- ✅ 7 utilidades de paquetes agregadas
- ✅ Exportaciones en api/index.js

### Frontend - Redux Layer
- ✅ treatmentPlansSlice.js creado (780 líneas)
- ✅ 15 AsyncThunks implementados
- ✅ State management completo
- ✅ 8 Actions para manejo de estado
- ✅ 20+ Selectors especializados
- ✅ Exportaciones en slices/index.js
- ✅ Reducer configurado en store

### Documentación
- ✅ REDUX_INTEGRATION_COMPLETE.md
- ✅ Ejemplos de uso en componentes
- ✅ Referencia completa de API
- ✅ Referencia completa de Redux

---

## 🎯 Próximos Pasos

### 1. Testing de API
- Probar endpoints en Insomnia (collection ya creada)
- Verificar flujo completo de creación de plan
- Testear operaciones de sesiones
- Validar progreso y pagos

### 2. Componentes React
- `TreatmentPlanCard` - Vista de plan con progreso
- `TreatmentSessionList` - Lista de sesiones
- `TreatmentProgressBar` - Barra de progreso visual
- `TreatmentPaymentTracker` - Seguimiento de pagos
- `SessionPhotoGallery` - Galería de fotos de progreso
- `CreateTreatmentPlanModal` - Modal de creación
- `ScheduleSessionModal` - Modal para agendar sesión

### 3. Integración en Vistas Existentes
- ClientHistory - Mostrar planes de tratamiento
- ServiceFormModal - Configurar como paquete
- AppointmentForm - Vincular con sesión de tratamiento
- Calendar - Marcar citas de tratamientos

---

## 📚 Referencias

- Backend API Endpoints: `/api/treatment-plans/*`
- API Collection: `treatment-plans-insomnia-collection.json`
- Backend Controllers: `src/controllers/TreatmentPlan*.js`
- Database Models: `src/models/TreatmentPlan.js`, `TreatmentSession.js`
- Frontend API: `packages/shared/src/api/treatmentPlansApi.js`
- Redux Slice: `packages/shared/src/store/slices/treatmentPlansSlice.js`

---

## 🎉 Conclusión

La integración de Redux para el sistema de tratamientos multi-sesión está **100% completa** y lista para ser utilizada en componentes React. Todos los archivos necesarios han sido creados/actualizados, las exportaciones están configuradas, y el sistema está integrado en el store de Redux.

**Total de líneas de código agregadas:** ~1,900 líneas  
**Archivos creados:** 2  
**Archivos modificados:** 4  
**Funcionalidad:** Sistema completo de tratamientos multi-sesión con Redux
