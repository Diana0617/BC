# 🎉 Implementación Completa: Sistema Multi-Sucursal y Precios Personalizados

## 📦 Paquete: @beautycontrol/shared

### ✅ Nuevos Redux Slices Implementados

#### 1. **specialistServiceSlice.js**
Sistema de gestión de servicios de especialistas con precios personalizados.

**Estado:**
```javascript
{
  specialistServices: [],        // Lista de servicios del especialista
  selectedSpecialistService: null,
  loading: false,
  error: null,
  success: false,
  message: null
}
```

**Thunks (Acciones Asíncronas):**
- ✅ `getSpecialistServices({ specialistId, isActive })` - Obtener servicios de un especialista
- ✅ `assignServiceToSpecialist({ specialistId, serviceData })` - Asignar servicio con precio personalizado
- ✅ `updateSpecialistService({ specialistId, serviceId, updateData })` - Actualizar configuración
- ✅ `removeServiceFromSpecialist({ specialistId, serviceId })` - Eliminar servicio

**Reducers (Acciones Síncronas):**
- `clearSpecialistServiceError()` - Limpiar errores
- `clearSpecialistServiceSuccess()` - Limpiar mensajes de éxito
- `resetSpecialistServiceState()` - Resetear todo el estado
- `setSelectedSpecialistService(service)` - Seleccionar servicio

---

#### 2. **userBranchSlice.js**
Sistema de gestión de asignación de usuarios a múltiples sucursales.

**Estado:**
```javascript
{
  userBranches: [],      // Sucursales del usuario
  branchUsers: [],       // Usuarios de una sucursal
  defaultBranch: null,   // Sucursal por defecto
  loading: false,
  error: null,
  success: false,
  message: null
}
```

**Thunks (Acciones Asíncronas):**
- ✅ `getUserBranches({ userId })` - Obtener sucursales de un usuario
- ✅ `assignBranchToUser({ userId, branchData })` - Asignar sucursal a usuario
- ✅ `updateUserBranch({ userId, branchId, updateData })` - Actualizar configuración
- ✅ `setDefaultBranch({ userId, branchId })` - Establecer sucursal por defecto
- ✅ `removeBranchFromUser({ userId, branchId })` - Remover sucursal
- ✅ `getBranchUsers({ branchId })` - Obtener usuarios de una sucursal

**Reducers (Acciones Síncronas):**
- `clearUserBranchError()` - Limpiar errores
- `clearUserBranchSuccess()` - Limpiar mensajes de éxito
- `resetUserBranchState()` - Resetear todo el estado

---

### 🎯 Selectores Implementados

#### **specialistServiceSelectors.js**

**Selectores Básicos:**
- `selectSpecialistServices(state)` - Lista completa de servicios
- `selectSelectedSpecialistService(state)` - Servicio seleccionado
- `selectSpecialistServiceLoading(state)` - Estado de carga
- `selectSpecialistServiceError(state)` - Errores
- `selectSpecialistServiceSuccess(state)` - Estado de éxito
- `selectSpecialistServiceMessage(state)` - Mensajes

**Selectores Avanzados:**
- `selectActiveSpecialistServices(state)` - Solo servicios activos
- `selectInactiveSpecialistServices(state)` - Solo servicios inactivos
- `selectSpecialistServiceById(state, serviceId)` - Buscar por ID
- `selectHasCustomPrice(state, serviceId)` - ¿Tiene precio personalizado?
- `selectCustomPriceForService(state, serviceId)` - Obtener precio personalizado
- `selectSpecialistServicesBySkillLevel(state, skillLevel)` - Filtrar por nivel
- `selectBookableSpecialistServices(state)` - Solo servicios reservables
- `selectSpecialistServicesCount(state)` - Contar servicios
- `selectActiveServicesCount(state)` - Contar activos

---

#### **userBranchSelectors.js**

**Selectores Básicos:**
- `selectUserBranches(state)` - Lista de sucursales del usuario
- `selectBranchUsers(state)` - Lista de usuarios de una sucursal
- `selectDefaultBranch(state)` - Sucursal por defecto
- `selectUserBranchLoading(state)` - Estado de carga
- `selectUserBranchError(state)` - Errores
- `selectUserBranchSuccess(state)` - Estado de éxito
- `selectUserBranchMessage(state)` - Mensajes

**Selectores Avanzados:**
- `selectUserBranchIds(state)` - Array de IDs de sucursales
- `selectDefaultBranchId(state)` - ID de sucursal por defecto
- `selectUserHasMultipleBranches(state)` - ¿Tiene múltiples sucursales?
- `selectUserBranchCount(state)` - Contar sucursales
- `selectUserBranchById(state, branchId)` - Buscar por ID
- `selectCanManageScheduleInBranch(state, branchId)` - ¿Puede gestionar horarios?
- `selectCanCreateAppointmentsInBranch(state, branchId)` - ¿Puede crear citas?
- `selectBranchesWithPermission(state, permission)` - Filtrar por permiso
- `selectBranchUsersByRole(state, role)` - Filtrar usuarios por rol
- `selectBranchSpecialists(state)` - Solo especialistas
- `selectBranchReceptionists(state)` - Solo recepcionistas
- `selectIsUserInBranch(state, userId, branchId)` - ¿Usuario en sucursal?

---

### 🪝 Custom Hooks Implementados

#### **useSpecialistService()**

Hook personalizado para gestión fácil de servicios de especialistas.

**Uso:**
```javascript
import { useSpecialistService } from '@beautycontrol/shared';

function SpecialistServicesManager() {
  const {
    // Estado
    services,
    selectedService,
    loading,
    error,
    success,
    activeServices,
    bookableServices,
    servicesCount,

    // Acciones
    getServices,
    assignService,
    updateService,
    removeService,
    selectService,
    clearError,
    clearSuccess,
    resetState,

    // Helpers
    getCustomPrice,
    hasCustomPrice,
    getServiceById
  } = useSpecialistService();

  // Cargar servicios del especialista
  useEffect(() => {
    getServices(specialistId, true); // true = solo activos
  }, [specialistId]);

  // Asignar nuevo servicio con precio personalizado
  const handleAssign = async () => {
    await assignService(specialistId, {
      serviceId: 5,
      customPrice: 150000,  // Precio personalizado (opcional)
      skillLevel: 'EXPERT',
      canBeBooked: true,
      commissionPercentage: 30
    });
  };

  return (
    <div>
      {activeServices.map(service => (
        <ServiceCard 
          key={service.id}
          service={service}
          hasCustomPrice={hasCustomPrice(service.serviceId)}
          customPrice={getCustomPrice(service.serviceId)}
        />
      ))}
    </div>
  );
}
```

---

#### **useUserBranch()**

Hook personalizado para gestión de asignación multi-sucursal.

**Uso:**
```javascript
import { useUserBranch } from '@beautycontrol/shared';

function UserBranchManager() {
  const {
    // Estado
    userBranches,
    branchUsers,
    defaultBranch,
    loading,
    error,
    hasMultipleBranches,
    branchCount,
    branchSpecialists,
    branchReceptionists,

    // Acciones
    getBranches,
    assignBranch,
    updateBranch,
    setDefault,
    removeBranch,
    getBranchStaff,
    clearError,
    clearSuccess,

    // Helpers
    canManageSchedule,
    canCreateAppointments,
    getBranchById,
    isDefaultBranch
  } = useUserBranch();

  // Cargar sucursales del usuario
  useEffect(() => {
    getBranches(userId);
  }, [userId]);

  // Asignar usuario a sucursal
  const handleAssignBranch = async () => {
    await assignBranch(userId, {
      branchId: 3,
      isDefault: true,
      canManageSchedule: true,
      canCreateAppointments: true,
      notes: 'Especialista principal de esta sucursal'
    });
  };

  // Verificar permisos
  const canSchedule = canManageSchedule(branchId);
  const canBook = canCreateAppointments(branchId);

  return (
    <div>
      <h2>Sucursales: {branchCount}</h2>
      {userBranches.map(branch => (
        <BranchCard 
          key={branch.id}
          branch={branch}
          isDefault={isDefaultBranch(branch.branchId)}
          canSchedule={canManageSchedule(branch.branchId)}
        />
      ))}
    </div>
  );
}
```

---

### 📡 Endpoints API Soportados

#### **Specialist Services**
```
GET    /api/specialists/:specialistId/services
POST   /api/specialists/:specialistId/services
PUT    /api/specialists/:specialistId/services/:serviceId
DELETE /api/specialists/:specialistId/services/:serviceId
```

#### **User Branches** (Pendiente de implementar en backend)
```
GET    /api/users/:userId/branches
POST   /api/users/:userId/branches
PUT    /api/users/:userId/branches/:branchId
PUT    /api/users/:userId/branches/:branchId/set-default
DELETE /api/users/:userId/branches/:branchId
GET    /api/branches/:branchId/users
```

---

### 🗂️ Archivos Creados

```
packages/shared/src/
├── store/
│   ├── slices/
│   │   ├── specialistServiceSlice.js  ✅ NUEVO
│   │   └── userBranchSlice.js         ✅ NUEVO
│   ├── selectors/
│   │   ├── specialistServiceSelectors.js  ✅ NUEVO
│   │   ├── userBranchSelectors.js         ✅ NUEVO
│   │   └── index.js                       ✅ ACTUALIZADO
│   └── index.js                            ✅ ACTUALIZADO
├── hooks/
│   ├── useSpecialistService.js        ✅ NUEVO
│   └── useUserBranch.js               ✅ NUEVO
└── index.js                            ✅ ACTUALIZADO
```

---

### 🎯 Casos de Uso Cubiertos

#### **1. Precios Personalizados por Especialista**
- ✅ Asignar servicios a especialistas con precio diferente
- ✅ Actualizar precios en cualquier momento
- ✅ Desactivar/activar servicios por especialista
- ✅ Configurar nivel de habilidad (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- ✅ Establecer comisiones por servicio
- ✅ Controlar reservabilidad de servicios

#### **2. Multi-Sucursal**
- ✅ Asignar usuarios a múltiples sucursales
- ✅ Establecer sucursal por defecto
- ✅ Permisos granulares por sucursal (gestión de horarios, creación de citas)
- ✅ Listar personal asignado a cada sucursal
- ✅ Filtrar citas por sucursales asignadas

#### **3. Rol Combinado RECEPTIONIST_SPECIALIST**
- ✅ Crear empleados con doble funcionalidad
- ✅ Acceso tanto a operaciones de recepción como de especialista
- ✅ Asignación a múltiples sucursales
- ✅ Precios personalizados para sus servicios

---

### 🚀 Próximos Pasos

1. **Backend:**
   - ⚠️ Implementar endpoints para UserBranch CRUD (actualmente solo se usan en auth middleware)
   - ✅ Endpoints de SpecialistService ya implementados

2. **Frontend (Web App / Mobile):**
   - Crear componentes para gestionar servicios de especialistas
   - Crear componentes para asignación de sucursales
   - Integrar hooks en pantallas existentes
   - Actualizar formularios de creación de citas para usar precios personalizados

3. **Testing:**
   - Probar flujos completos de asignación multi-sucursal
   - Verificar cálculo de precios personalizados en citas
   - Validar permisos por sucursal

---

### 📚 Documentación de Uso

#### **Ejemplo Completo: Crear Cita con Precio Personalizado**

```javascript
import { useSpecialistService } from '@beautycontrol/shared';

function CreateAppointmentForm() {
  const { getCustomPrice, hasCustomPrice } = useSpecialistService();
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);

  // Obtener precio final (personalizado o base)
  const getFinalPrice = (serviceId, basePrice) => {
    if (hasCustomPrice(serviceId)) {
      return getCustomPrice(serviceId);
    }
    return basePrice;
  };

  const handleSubmit = async () => {
    const appointmentData = {
      serviceId: selectedService.id,
      specialistId: selectedSpecialist.id,
      // El backend automáticamente aplicará el precio personalizado
      // totalAmount será calculado en el backend
      startTime: appointmentDate,
      endTime: calculateEndTime(appointmentDate, selectedService.duration)
    };

    await createAppointment(appointmentData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <ServiceSelector onChange={setSelectedService} />
      <SpecialistSelector onChange={setSelectedSpecialist} />
      
      {selectedService && selectedSpecialist && (
        <PriceDisplay 
          basePrice={selectedService.price}
          finalPrice={getFinalPrice(selectedService.id, selectedService.price)}
          hasCustomPrice={hasCustomPrice(selectedService.id)}
        />
      )}
      
      <button type="submit">Crear Cita</button>
    </form>
  );
}
```

---

## ✅ Checklist de Implementación

### Backend ✅
- [x] Modelo UserBranch
- [x] Modelo SpecialistService
- [x] Middleware auth.js actualizado
- [x] BusinessController actualizado
- [x] SpecialistServiceController creado
- [x] Rutas de SpecialistService
- [x] AppointmentController con multi-branch
- [x] AppointmentController con custom pricing
- [ ] Rutas de UserBranch CRUD (pendiente)

### Shared Package ✅
- [x] specialistServiceSlice
- [x] userBranchSlice
- [x] Selectores de SpecialistService
- [x] Selectores de UserBranch
- [x] useSpecialistService hook
- [x] useUserBranch hook
- [x] Exportaciones en index.js
- [x] Documentación

### Frontend (Pendiente)
- [ ] Pantalla de gestión de servicios de especialista
- [ ] Pantalla de asignación multi-sucursal
- [ ] Actualizar formularios de citas
- [ ] Integración en dashboard de Business
- [ ] Integración en app móvil

---

**Fecha de Implementación:** Octubre 10, 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Backend Completo | ✅ Redux Completo | ⚠️ Frontend Pendiente
