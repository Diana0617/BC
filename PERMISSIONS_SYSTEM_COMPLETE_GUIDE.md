# 🔐 Sistema de Permisos Granulares - Guía Completa

**Fecha de Implementación:** Octubre 19, 2025  
**Estado:** ✅ 100% COMPLETADO  
**Versión:** 1.0.0  
**Branch:** FM-28 → develop

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#-resumen-ejecutivo)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Base de Datos](#-base-de-datos)
4. [Backend - API y Servicios](#-backend---api-y-servicios)
5. [Frontend - Redux y Componentes](#-frontend---redux-y-componentes)
6. [Permisos vs Reglas de Negocio](#-permisos-vs-reglas-de-negocio)
7. [Guía de Uso - Backend](#-guía-de-uso---backend)
8. [Guía de Uso - Frontend](#-guía-de-uso---frontend)
9. [Casos de Uso Prácticos](#-casos-de-uso-prácticos)

---

## 🎯 Resumen Ejecutivo

### ¿Qué se implementó?

Un **sistema completo de permisos granulares** que permite a cada negocio personalizar qué puede hacer cada miembro de su equipo, más allá de los permisos por defecto de su rol.

### Problema que resuelve

**❌ ANTES:**
- Todos los SPECIALIST tenían los mismos permisos fijos
- No se podía personalizar acceso por usuario
- Permisos limitados solo por rol

**✅ AHORA:**
- Cada usuario puede tener permisos personalizados
- Control granular de 40 permisos en 9 categorías
- Defaults inteligentes por rol + customización individual
- API REST completa para gestión
- UI visual tipo Trello integrada

---

## 🏗️ Arquitectura del Sistema

### Conceptos Clave

```
┌─────────────────────────────────────────────────────────────┐
│                    PERMISOS EFECTIVOS                        │
│                                                               │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ Defaults por Rol │  +   │ Personalizaciones│  =  ✅      │
│  │  (Baseline)      │      │  (Overrides)     │            │
│  └──────────────────┘      └──────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

**1. Permission (Catálogo)**
- 40 permisos disponibles
- Agrupados en 9 categorías
- Ej: `appointments.create`, `payments.view`

**2. RoleDefaultPermission (Defaults)**
- Permisos base por rol
- BUSINESS: 40 permisos (todos)
- SPECIALIST: 7 permisos (limitado)
- RECEPTIONIST: 14 permisos (intermedio)
- RECEPTIONIST_SPECIALIST: 17 permisos (combinado)

**3. UserBusinessPermission (Customs)**
- Permisos personalizados por usuario
- Pueden conceder o revocar permisos
- Override los defaults del rol

### Flujo de Verificación

```javascript
// Middleware de verificación
checkPermission('appointments.create')
  ↓
¿Es OWNER? → SÍ → ✅ Acceso concedido
  ↓ NO
Obtener defaults del rol
  ↓
Obtener personalizaciones del usuario
  ↓
Merge (customs override defaults)
  ↓
¿Tiene el permiso en efectivos? → SÍ/NO → ✅/❌
```

---

## 💾 Base de Datos

### Tablas Creadas

**1. `permissions`** - Catálogo de permisos
```sql
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**2. `role_default_permissions`** - Defaults por rol
```sql
CREATE TABLE role_default_permissions (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  permission_id INTEGER REFERENCES permissions(id),
  is_granted BOOLEAN DEFAULT true,
  UNIQUE(role, permission_id)
);
```

**3. `user_business_permissions`** - Personalizaciones
```sql
CREATE TABLE user_business_permissions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  business_id UUID REFERENCES businesses(id),
  permission_id INTEGER REFERENCES permissions(id),
  is_granted BOOLEAN DEFAULT true,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  UNIQUE(user_id, business_id, permission_id)
);
```

### 40 Permisos Insertados

**Por Categoría:**
```
📅 appointments (9):  view_own, view_all, view_history, create, edit,
                      cancel, complete, close_with_payment,
                      close_without_payment

👥 clients (6):       view, view_history, create, edit, delete,
                      export

💰 commissions (4):   view_own, view_all, edit, approve

⚙️ config (3):        view, edit, delete

📦 inventory (4):     view, create, edit, delete

💳 payments (4):      view, create, edit, refund

📊 reports (3):       view_own, view_all, export

💼 services (4):      view, create, edit, delete

👤 team (3):          view, invite, manage_permissions
```

### Configuración de Roles (78 defaults)

```
BUSINESS (40):              Todos los permisos ✅
SPECIALIST (7):             Solo lectura y gestión propia
RECEPTIONIST (14):          Gestión operativa (no reportes financieros)
RECEPTIONIST_SPECIALIST (17): Combinación de ambos roles
```

### Migraciones Ejecutadas

```bash
✅ migrations/20251019_create_permissions_tables.sql
✅ migrations/20251019_seed_permissions.sql
```

---

## 🔧 Backend - API y Servicios

### Archivos Creados

```
src/
├── models/
│   ├── Permission.js                    ✅ Modelo Permission
│   ├── RoleDefaultPermission.js         ✅ Modelo RoleDefaultPermission
│   └── UserBusinessPermission.js        ✅ Modelo UserBusinessPermission
├── services/
│   └── PermissionService.js             ✅ Lógica de negocio (7 métodos)
├── middleware/
│   └── permissions.js                   ✅ Middleware de verificación
├── controllers/
│   └── PermissionController.js          ✅ Controller (8 endpoints)
└── routes/
    └── permissions.js                   ✅ Rutas registradas
```

### PermissionService (7 métodos)

```javascript
// 1. Obtener permisos efectivos (defaults + customs)
getUserEffectivePermissions(userId, businessId)

// 2. Verificar un permiso
hasPermission(userId, businessId, permissionKey)

// 3. Conceder permiso individual
grantPermission(userId, businessId, permissionKey, grantedBy, notes)

// 4. Revocar permiso individual
revokePermission(userId, businessId, permissionKey, revokedBy, notes)

// 5. Obtener catálogo por categoría
getPermissionsByCategory(category)

// 6. Ver diferencias vs defaults
getUserPermissionDifferences(userId, businessId)

// 7. Obtener defaults de un rol
getRoleDefaultPermissions(role)
```

### Middleware de Verificación

```javascript
// Requiere UN permiso específico
checkPermission('appointments.create')

// Requiere TODOS los permisos
checkAllPermissions(['appointments.complete', 'payments.create'])

// Requiere AL MENOS UNO
checkAnyPermission(['appointments.view_own', 'appointments.view_all'])

// Inyecta permisos en req.userPermissions
injectUserPermissions
```

### API Endpoints (8)

```
GET    /api/permissions                     - Catálogo completo
GET    /api/permissions/categories/:category - Por categoría
GET    /api/permissions/role/:role           - Defaults de un rol
GET    /api/permissions/user/:userId         - Efectivos de un usuario
POST   /api/permissions/grant                - Conceder permiso
POST   /api/permissions/revoke               - Revocar permiso
POST   /api/permissions/grant-bulk           - Conceder múltiples
POST   /api/permissions/reset/:userId        - Reset a defaults
```

---

## ⚛️ Frontend - Redux y Componentes

### Archivos Creados

```
packages/
├── shared/src/
│   ├── api/
│   │   └── permissions.js                ✅ API Client (403 líneas)
│   └── store/slices/
│       └── permissionsSlice.js           ✅ Redux Slice (507 líneas)
└── web-app/src/components/
    └── permissions/
        └── PermissionsEditorModal.jsx    ✅ Modal de edición (370 líneas)
```

### API Client (permissions.js)

**CRUD (8 funciones):**
```javascript
getAllPermissions(category)
getRoleDefaultPermissions(role)
getUserPermissions(userId, businessId)
grantPermission(data)
revokePermission(data)
grantBulkPermissions(data)
revokeBulkPermissions(data)
resetUserPermissions(userId, businessId)
```

**Utilidades (15 funciones):**
```javascript
groupPermissionsByCategory()      // Agrupar por categoría
hasPermission()                   // Verificar si tiene permiso
getCustomPermissions()            // Extraer customs
calculatePermissionsSummary()     // Calcular resumen
formatPermission()                // Formatear para UI
getCategoryLabel()                // Etiqueta de categoría
getCategoryEmoji()                // Emoji por categoría
getCategoryColor()                // Color por categoría
getRoleColor()                    // Color por rol
validatePermissionData()          // Validar datos
// ... y más
```

### Redux Slice (permissionsSlice.js)

**Async Thunks (9):**
```javascript
fetchAllPermissions              // Cargar catálogo
fetchRoleDefaults                // Defaults de un rol
fetchUserPermissions             // Permisos de un usuario
fetchTeamMembersWithPermissions  // Equipo con resumen
grantUserPermission              // Conceder
revokeUserPermission             // Revocar
grantUserPermissionsBulk         // Conceder múltiples
revokeUserPermissionsBulk        // Revocar múltiples
resetToDefaults                  // Resetear
```

**Estado:**
```javascript
{
  // Data
  allPermissions: [],
  roleDefaults: {},
  userPermissions: {},
  teamMembers: [],
  
  // Current editing
  currentEditingUser: null,
  
  // Loading states
  loadingAll: false,
  loadingUser: false,
  loadingTeam: false,
  saving: false,
  
  // UI state
  isModalOpen: false,
  modalMode: 'view',
  
  // Error/Success
  error: null,
  successMessage: null
}
```

### PermissionsEditorModal (UI)

**Features:**
- ✅ Lista de permisos agrupados por categoría
- ✅ Checkboxes para activar/desactivar
- ✅ Contador de permisos activos
- ✅ Botón para resetear a defaults
- ✅ Optimistic updates
- ✅ 100% Responsive

**Vista:**
```
┌─────────────────────────────────────────┐
│  🛡️ Editar Permisos - Juan Pérez  ✕   │
├─────────────────────────────────────────┤
│  [💼 Especialista]  7 de 40 permisos   │
│  [🔄 Restablecer a Defaults]           │
├─────────────────────────────────────────┤
│  📅 Citas (5/9)                        │
│  ☑ Ver mis citas                       │
│  ☐ Ver todas las citas                 │
│  ☐ Crear citas                         │
│  ...                                    │
├─────────────────────────────────────────┤
│  💳 Pagos (0/4)                        │
│  ☐ Ver pagos                           │
│  ☐ Crear pagos                         │
│  ...                                    │
├─────────────────────────────────────────┤
│  [Cancelar] [💾 Guardar Cambios]      │
└─────────────────────────────────────────┘
```

### Integración en StaffManagementSection

**Modificaciones:**
```jsx
// StaffManagementSection.jsx
<StaffKanbanBoard 
  businessId={activeBusiness?.id}  // ← Agregado
  // ... otros props
/>

// StaffKanbanBoard.jsx
<button onClick={() => openPermissionsModal(staff)}>
  🛡️ Permisos
</button>

<PermissionsEditorModal
  isOpen={showPermissionsModal}
  staff={permissionsStaff}
  businessId={businessId}
  onClose={() => setShowPermissionsModal(false)}
/>
```

---

## 🔐 Permisos vs 📋 Reglas de Negocio

### ¿Cuál es la Diferencia?

#### 🔐 PERMISOS
**"¿QUIÉN puede hacer QUÉ?"**

Control de **acceso a funcionalidades** por usuario.

**Ejemplos:**
- ¿Puede este especialista **ver todas las citas**?
- ¿Puede esta recepcionista **crear clientes**?
- ¿Puede este usuario **cerrar citas cobrando**?

**Características:**
- Se asignan **por usuario**
- Defaults por rol
- Tipo **ON/OFF**

#### 📋 REGLAS DE NEGOCIO
**"¿CÓMO funciona el negocio?"**

Configuración de **políticas** que aplican a **TODO EL NEGOCIO**.

**Ejemplos:**
- ¿Cuántas horas de anticipación para cancelar? → `24 horas`
- ¿Máximo de citas por cliente al día? → `10 citas`
- ¿Porcentaje de comisión? → `50%`

**Características:**
- Configuración **por negocio**
- Valores: **números, booleanos, strings**
- Aplican a **todos los usuarios**

### Ejemplo: Cerrar Cita con Pago

**PERMISO** (quién puede):
```javascript
// Usuario A
permissions: [
  'appointments.close_with_payment'  ✅
  'payments.create'                   ✅
]

// Usuario B
permissions: [
  'appointments.close_with_payment'  ❌
  'payments.create'                   ❌
]
```

**REGLA** (validaciones):
```javascript
// Reglas del negocio (aplican a todos los que tienen permiso)
REQUIRE_FULL_PAYMENT: false
REQUIRE_MINIMUM_PAYMENT: 50  // Al menos 50%
```

---

## 🚀 Guía de Uso - Backend

### Proteger una Ruta

```javascript
// routes/appointments.js
const { checkPermission, checkAnyPermission } = require('../middleware/permissions');

// Ver citas (propias O todas)
router.get('/',
  checkAnyPermission(['appointments.view_own', 'appointments.view_all']),
  AppointmentController.getAppointments
);

// Crear cita
router.post('/',
  checkPermission('appointments.create'),
  AppointmentController.createAppointment
);

// Cerrar cita cobrando (requiere 2 permisos)
router.patch('/:id/close-with-payment',
  checkAllPermissions(['appointments.close_with_payment', 'payments.create']),
  AppointmentController.closeWithPayment
);
```

### Lógica Condicional en Controller

```javascript
// controllers/AppointmentController.js
const { injectUserPermissions } = require('../middleware/permissions');

router.get('/',
  injectUserPermissions,  // Inyecta req.userPermissions
  async (req, res) => {
    const canViewAll = req.userPermissions.includes('appointments.view_all');
    
    let appointments;
    if (canViewAll) {
      // Ver todas las citas del negocio
      appointments = await Appointment.findAll({ where: { businessId } });
    } else {
      // Solo ver mis citas
      appointments = await Appointment.findAll({ 
        where: { businessId, specialistId: req.user.id }
      });
    }
    
    res.json({ success: true, data: appointments });
  }
);
```

### Gestión de Permisos

```javascript
// Conceder permiso
const PermissionService = require('../services/PermissionService');

await PermissionService.grantPermission(
  userId,
  businessId,
  'appointments.view_all',
  grantedByUserId,
  'Necesita ver todas las citas para coordinar'
);

// Verificar permiso
const hasPermission = await PermissionService.hasPermission(
  userId,
  businessId,
  'appointments.create'
);

// Obtener permisos efectivos
const permissions = await PermissionService.getUserEffectivePermissions(
  userId,
  businessId
);
```

---

## ⚛️ Guía de Uso - Frontend

### Imports

```javascript
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserPermissions,
  grantUserPermission,
  revokeUserPermission,
  resetToDefaults
} from '@shared/store/slices/permissionsSlice';
import {
  groupPermissionsByCategory,
  hasPermission,
  getCategoryColor
} from '@shared/api/permissions';
```

### Cargar Permisos

```javascript
const dispatch = useDispatch();
const userId = user.id;
const businessId = currentBusiness.id;

// Cargar permisos del usuario
useEffect(() => {
  dispatch(fetchUserPermissions({ userId, businessId }));
}, [userId, businessId]);

// Acceder a permisos desde el estado
const { userPermissions, loading } = useSelector(state => state.permissions);
const permissions = userPermissions[userId] || {};
```

### Verificar Permisos en UI

```javascript
// Mostrar botón solo si tiene permiso
{hasPermission(permissions.effective, 'appointments.create') && (
  <CreateAppointmentButton />
)}

// Deshabilitar según permiso
<button 
  disabled={!hasPermission(permissions.effective, 'payments.view')}
>
  Ver Pagos
</button>
```

### Editar Permisos

```javascript
// Conceder un permiso
const handleGrantPermission = async (permissionKey) => {
  await dispatch(grantUserPermission({
    userId,
    businessId,
    permissionKey,
    grantedBy: currentUser.id,
    notes: 'Permiso concedido desde UI'
  }));
};

// Revocar un permiso
const handleRevokePermission = async (permissionKey) => {
  await dispatch(revokeUserPermission({
    userId,
    businessId,
    permissionKey,
    revokedBy: currentUser.id,
    notes: 'Permiso revocado desde UI'
  }));
};

// Resetear a defaults
const handleReset = async () => {
  await dispatch(resetToDefaults({ userId, businessId }));
};
```

### Mostrar Resumen

```javascript
import { calculatePermissionsSummary } from '@shared/api/permissions';

const summary = calculatePermissionsSummary(permissions.effective);

return (
  <div>
    <h3>{summary.total} permisos activos</h3>
    {Object.entries(summary.byCategory).map(([cat, count]) => (
      <div key={cat}>
        {cat}: {count.active}/{count.total}
      </div>
    ))}
  </div>
);
```

---

## 💡 Casos de Uso Prácticos

### Caso 1: Especialista que También Cobra

**Escenario:**
- Juan es SPECIALIST (defaults: 7 permisos)
- El negocio quiere que también cobre citas

**Solución:**
```javascript
// Conceder permisos extra
await grantPermission(juanId, businessId, 'payments.create');
await grantPermission(juanId, businessId, 'appointments.close_with_payment');

// Resultado:
// Juan ahora tiene 9 permisos (7 base + 2 custom)
```

### Caso 2: Recepcionista con Acceso Limitado

**Escenario:**
- María es RECEPTIONIST (defaults: 14 permisos)
- No debe ver reportes financieros

**Solución:**
```javascript
// Revocar permisos sensibles
await revokePermission(mariaId, businessId, 'reports.view_all');
await revokePermission(mariaId, businessId, 'commissions.view_all');

// Resultado:
// María tiene 12 permisos (14 - 2 revocados)
```

### Caso 3: Especialista Senior

**Escenario:**
- Pedro es SPECIALIST pero tiene experiencia
- Necesita ver todas las citas y gestionar agenda

**Solución:**
```javascript
// Conceder permisos de gestión
await grantPermission(pedroId, businessId, 'appointments.view_all');
await grantPermission(pedroId, businessId, 'appointments.edit');
await grantPermission(pedroId, businessId, 'appointments.cancel');

// Resultado:
// Pedro tiene 10 permisos (7 + 3 gestión)
```

---

## ✅ Checklist de Implementación

### Backend
- [x] Migraciones ejecutadas
- [x] Modelos creados y asociados
- [x] PermissionService implementado
- [x] Middleware de verificación
- [x] Controller y rutas
- [x] Endpoints probados

### Frontend
- [x] API Client creado
- [x] Redux Slice implementado
- [x] PermissionsEditorModal
- [x] Integración en StaffManagement
- [x] Utilidades de UI

### Limpieza
- [x] Regla `CITAS_REQUIERE_COMPROBANTE_PAGO` eliminada
- [x] Documentación consolidada
- [x] Sistema de permisos separado de reglas

---

## 📚 Referencias Rápidas

### Categorías de Permisos

| Categoría | Emoji | Color | Permisos |
|-----------|-------|-------|----------|
| appointments | 📅 | blue | 9 |
| clients | 👥 | green | 6 |
| commissions | 💰 | yellow | 4 |
| config | ⚙️ | gray | 3 |
| inventory | 📦 | purple | 4 |
| payments | 💳 | pink | 4 |
| reports | 📊 | red | 3 |
| services | 💼 | indigo | 4 |
| team | 👤 | teal | 3 |

### Defaults por Rol

| Rol | Permisos | Descripción |
|-----|----------|-------------|
| BUSINESS | 40 | Acceso completo |
| SPECIALIST | 7 | Solo lectura propia |
| RECEPTIONIST | 14 | Gestión operativa |
| RECEPTIONIST_SPECIALIST | 17 | Combinado |

---

## 🎯 Próximos Pasos Sugeridos

1. **Mobile App:**
   - Implementar verificación de permisos en React Native
   - Adaptar UI según permisos del usuario

2. **Notificaciones:**
   - Email cuando se conceden/revocan permisos
   - Log de auditoría de cambios

3. **Analytics:**
   - Dashboard de permisos más usados
   - Reportes de accesos denegados

4. **UI Enhancements:**
   - Presets de permisos (Junior, Senior, Manager)
   - Copy/paste permisos entre usuarios
   - Comparador de permisos

---

**Fin del documento - Sistema de Permisos v1.0.0**
