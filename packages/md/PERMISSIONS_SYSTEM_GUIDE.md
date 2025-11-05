# Sistema de Permisos Granulares - Guía Completa

## 📋 Índice
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Instalación](#instalación)
4. [Uso en Backend](#uso-en-backend)
5. [Endpoints API](#endpoints-api)
6. [Diseño Frontend](#diseño-frontend)
7. [Casos de Uso](#casos-de-uso)

---

## 🎯 Visión General

El sistema de permisos granulares permite a los negocios personalizar qué puede hacer cada miembro del equipo (SPECIALIST, RECEPTIONIST, RECEPTIONIST_SPECIALIST) de manera individual, más allá de los permisos por defecto de su rol.

### Problema que Resuelve
- **Negocios pequeños**: Un especialista que también maneja pagos
- **Negocios grandes**: Especialistas que solo ven sus citas, recepcionistas que gestionan todo
- **Flexibilidad total**: Cada negocio configura permisos según sus necesidades

### Conceptos Clave
- **Permission**: Catálogo de permisos disponibles (ej: `appointments.create`)
- **RoleDefaultPermission**: Permisos por defecto para cada rol
- **UserBusinessPermission**: Permisos personalizados para un usuario específico en un negocio específico
- **Permisos Efectivos**: Combinación de defaults + personalizaciones

---

## 🏗️ Arquitectura

### Estructura de Datos

```
Permission (Catálogo)
├── appointments.view_own
├── appointments.view_all
├── appointments.create
├── payments.view
└── ...más permisos

RoleDefaultPermission (Defaults por Rol)
├── SPECIALIST → appointments.view_own ✓
├── RECEPTIONIST → appointments.view_all ✓
└── BUSINESS → * (todos) ✓

UserBusinessPermission (Personalizaciones)
├── User: Juan (SPECIALIST) → appointments.create ✓ (concedido extra)
├── User: María (RECEPTIONIST) → payments.view ✗ (revocado)
└── User: Pedro (SPECIALIST) → appointments.view_all ✓ (concedido extra)
```

### Flujo de Verificación

```javascript
// 1. Usuario hace request
checkPermission('appointments.create')

// 2. ¿Es OWNER?
if (role === 'OWNER') return true; // OWNER siempre tiene todo

// 3. Obtener permisos efectivos
const defaults = getRoleDefaultPermissions(user.role);
const customs = getUserBusinessPermissions(user.id, business.id);

// 4. Merge: customs override defaults
const effective = merge(defaults, customs);

// 5. ¿Tiene el permiso?
return effective.includes('appointments.create');
```

---

## 🚀 Instalación

### 1. Ejecutar Migraciones

```bash
# Desde packages/backend
psql -U tu_usuario -d beauty_control -f migrations/20251019_create_permissions_tables.sql
psql -U tu_usuario -d beauty_control -f migrations/20251019_seed_permissions.sql
```

### 2. Verificar Tablas

```sql
SELECT * FROM permissions LIMIT 5;
SELECT * FROM role_default_permissions WHERE role = 'SPECIALIST';
```

### 3. Verificar Modelos en Node.js

```javascript
const { Permission, RoleDefaultPermission, UserBusinessPermission } = require('./models');

// Deben estar disponibles
console.log(Permission.name); // 'Permission'
```

---

## 💻 Uso en Backend

### Middleware de Permisos

#### 1. Verificar un Permiso Específico

```javascript
const { checkPermission } = require('../middleware/permissions');

// En tus rutas
router.post('/appointments', 
  authenticateToken, 
  checkPermission('appointments.create'),
  AppointmentController.createAppointment
);
```

#### 2. Verificar Múltiples Permisos (TODOS)

```javascript
const { checkAllPermissions } = require('../middleware/permissions');

router.post('/appointments/:id/close-with-payment',
  authenticateToken,
  checkAllPermissions(['appointments.complete', 'payments.create']),
  AppointmentController.closeWithPayment
);
```

#### 3. Verificar Múltiples Permisos (AL MENOS UNO)

```javascript
const { checkAnyPermission } = require('../middleware/permissions');

router.get('/appointments',
  authenticateToken,
  checkAnyPermission(['appointments.view_own', 'appointments.view_all']),
  AppointmentController.getAppointments
);
```

#### 4. Inyectar Permisos en Request (para lógica condicional)

```javascript
const { injectUserPermissions } = require('../middleware/permissions');

router.get('/appointments',
  authenticateToken,
  injectUserPermissions,
  async (req, res) => {
    const { permissions } = req.userPermissions;
    
    // Lógica condicional basada en permisos
    if (permissions.includes('appointments.view_all')) {
      // Mostrar todas las citas
    } else if (permissions.includes('appointments.view_own')) {
      // Mostrar solo citas propias
    }
  }
);
```

### Service Layer

```javascript
const PermissionService = require('../services/PermissionService');

// Verificar permiso programáticamente
const hasPermission = await PermissionService.hasPermission(
  userId,
  businessId,
  'appointments.create'
);

// Obtener todos los permisos efectivos
const permissions = await PermissionService.getUserEffectivePermissions(
  userId,
  businessId
);

// Ver diferencias con defaults
const differences = await PermissionService.getUserPermissionDifferences(
  userId,
  businessId
);
```

---

## 🌐 Endpoints API

### GET /api/permissions
Obtener todos los permisos disponibles

**Query Params:**
- `category` (opcional): Filtrar por categoría

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "key": "appointments.create",
      "name": "Crear citas",
      "description": "Permite crear nuevas citas",
      "category": "appointments",
      "isActive": true
    }
  ]
}
```

---

### GET /api/permissions/role/:role/defaults
Obtener permisos por defecto de un rol

**Params:**
- `role`: BUSINESS | SPECIALIST | RECEPTIONIST | RECEPTIONIST_SPECIALIST

**Response:**
```json
{
  "success": true,
  "data": {
    "role": "SPECIALIST",
    "permissions": [
      {
        "id": "uuid",
        "permissionId": "uuid",
        "permission": {
          "key": "appointments.view_own",
          "name": "Ver mis citas"
        }
      }
    ]
  }
}
```

---

### GET /api/permissions/user/:userId/business/:businessId
Obtener permisos efectivos de un usuario

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "SPECIALIST"
    },
    "permissions": [
      {
        "permission": {
          "key": "appointments.view_own",
          "name": "Ver mis citas"
        },
        "source": "default"
      },
      {
        "permission": {
          "key": "appointments.create",
          "name": "Crear citas"
        },
        "source": "custom",
        "grantedBy": "uuid",
        "grantedAt": "2025-10-19T..."
      }
    ],
    "customizations": {
      "granted": [
        {
          "permission": { "key": "appointments.create" },
          "grantedBy": "uuid",
          "notes": "Necesita crear citas para emergencias"
        }
      ],
      "revoked": []
    }
  }
}
```

---

### POST /api/permissions/grant
Conceder un permiso a un usuario

**Body:**
```json
{
  "userId": "uuid",
  "businessId": "uuid",
  "permissionKey": "appointments.create",
  "notes": "Especialista senior, puede gestionar agenda"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Permiso concedido exitosamente",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "businessId": "uuid",
    "permissionId": "uuid",
    "isGranted": true,
    "grantedBy": "uuid",
    "grantedAt": "2025-10-19T..."
  }
}
```

---

### POST /api/permissions/revoke
Revocar un permiso a un usuario

**Body:**
```json
{
  "userId": "uuid",
  "businessId": "uuid",
  "permissionKey": "payments.view",
  "notes": "Restricción temporal por auditoría"
}
```

---

### POST /api/permissions/grant-bulk
Conceder múltiples permisos

**Body:**
```json
{
  "userId": "uuid",
  "businessId": "uuid",
  "permissionKeys": [
    "appointments.create",
    "appointments.edit",
    "clients.create"
  ],
  "notes": "Promoción a especialista senior"
}
```

---

### POST /api/permissions/revoke-bulk
Revocar múltiples permisos

---

### POST /api/permissions/reset
Resetear permisos de un usuario a defaults de su rol

**Body:**
```json
{
  "userId": "uuid",
  "businessId": "uuid"
}
```

---

## 🎨 Diseño Frontend

Ver archivo: `PERMISSIONS_UI_DESIGN.md` para mockups y componentes React

### Vista Principal: Tablero Estilo Trello

```
┌─────────────────────────────────────────────────────────┐
│  GESTIÓN DE PERMISOS - Spa Belleza Total                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  👥 EQUIPO (8 miembros)                                 │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ María López  │  │ Juan Pérez   │  │ Ana García   │ │
│  │ Recepcionista│  │ Especialista │  │ Especialista │ │
│  │              │  │              │  │              │ │
│  │ ✓ 12 permisos│  │ ⚠ 6 permisos │  │ ✓ 5 permisos│ │
│  │ (defaults)   │  │ (+2 custom)  │  │ (defaults)   │ │
│  │              │  │              │  │              │ │
│  │ [Editar]     │  │ [Editar]     │  │ [Editar]     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Vista de Edición: Panel de Permisos

```
┌─────────────────────────────────────────────────────────┐
│  ← Volver    EDITAR PERMISOS - Juan Pérez               │
│  Rol: Especialista                                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📅 CITAS                                  [Reset]       │
│  ┌────────────────────────────────────────────────────┐│
│  │ □ Ver todas las citas                               ││
│  │ ✓ Ver mis citas (default)                           ││
│  │ ✓ Crear citas                           [EXTRA] 🎁  ││
│  │ □ Editar citas                                       ││
│  │ □ Cancelar citas                                     ││
│  │ ✓ Completar citas                       [EXTRA] 🎁  ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  💰 PAGOS                                                │
│  ┌────────────────────────────────────────────────────┐│
│  │ □ Ver pagos                                         ││
│  │ □ Registrar pagos                                   ││
│  │ □ Realizar devoluciones                             ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  👥 CLIENTES                                             │
│  ┌────────────────────────────────────────────────────┐│
│  │ ✓ Ver clientes (default)                            ││
│  │ □ Crear clientes                                    ││
│  │ ✓ Ver historial (default)                           ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  [Guardar Cambios]  [Cancelar]                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Casos de Uso

### Caso 1: Especialista Senior con Permisos Extra

**Situación:**
- Juan es SPECIALIST
- Por defecto: solo ve sus citas
- El negocio le concede: crear citas, ver todas las citas

**Implementación:**
```javascript
// Conceder permisos extra
await PermissionService.grantPermission(
  juanUserId,
  businessId,
  'appointments.create',
  adminId,
  'Especialista senior, maneja su propia agenda'
);

await PermissionService.grantPermission(
  juanUserId,
  businessId,
  'appointments.view_all',
  adminId,
  'Necesita coordinar con otros especialistas'
);
```

---

### Caso 2: Recepcionista sin Acceso a Pagos

**Situación:**
- María es RECEPTIONIST
- Por defecto: puede ver y registrar pagos
- El negocio le revoca: ver pagos, registrar pagos

**Implementación:**
```javascript
// Revocar permisos
await PermissionService.revokePermission(
  mariaUserId,
  businessId,
  'payments.view',
  adminId,
  'Restricción temporal durante auditoría'
);
```

---

### Caso 3: Especialista que Cobra (Negocio Pequeño)

**Situación:**
- Pedro es SPECIALIST
- Por defecto: no puede cobrar
- El negocio le concede: ver pagos, registrar pagos, cerrar citas con pago

**Implementación:**
```javascript
// Bulk grant
await PermissionService.grantBulkPermissions(
  pedroUserId,
  businessId,
  ['payments.view', 'payments.create', 'appointments.close_with_payment'],
  adminId,
  'Negocio pequeño, especialista maneja todo el flujo'
);
```

---

## 🔒 Seguridad

### Validaciones Automáticas
- ✅ Solo BUSINESS y OWNER pueden conceder/revocar permisos
- ✅ BUSINESS solo puede modificar permisos en su propio negocio
- ✅ OWNER puede todo
- ✅ Los usuarios no pueden ver permisos de otros usuarios (excepto admin)

### Auditoría
- Cada permiso guarda: quién lo concedió, cuándo, notas
- Historial completo de cambios

---

## 🧪 Testing

### Test Manual con Insomnia/Postman

```javascript
// 1. Login como BUSINESS
POST /api/auth/login
{
  "email": "dueño@negocio.com",
  "password": "password"
}
// Guardar token

// 2. Ver permisos de un especialista
GET /api/permissions/user/{userId}/business/{businessId}
Headers: { Authorization: Bearer {token} }

// 3. Conceder permiso
POST /api/permissions/grant
{
  "userId": "{userId}",
  "businessId": "{businessId}",
  "permissionKey": "appointments.create",
  "notes": "Test"
}
```

---

## 📚 Referencia Rápida de Permisos

| Categoría | Key | Descripción |
|-----------|-----|-------------|
| **Citas** | `appointments.view_own` | Ver solo mis citas |
| | `appointments.view_all` | Ver todas las citas |
| | `appointments.create` | Crear citas |
| | `appointments.edit` | Editar citas |
| | `appointments.cancel` | Cancelar citas |
| | `appointments.complete` | Completar citas |
| | `appointments.close_with_payment` | Cerrar cobrando |
| | `appointments.close_without_payment` | Cerrar sin cobrar |
| **Pagos** | `payments.view` | Ver pagos |
| | `payments.create` | Registrar pagos |
| | `payments.refund` | Devoluciones |
| **Clientes** | `clients.view` | Ver clientes |
| | `clients.create` | Crear clientes |
| | `clients.edit` | Editar clientes |
| | `clients.view_history` | Ver historial |
| | `clients.view_personal_data` | Ver datos sensibles |
| **Comisiones** | `commissions.view_own` | Ver mis comisiones |
| | `commissions.view_all` | Ver todas |
| | `commissions.approve` | Aprobar pagos |
| **Inventario** | `inventory.view` | Ver productos |
| | `inventory.sell` | Vender productos |
| | `inventory.manage` | Gestionar inventario |

---

## 🆘 Troubleshooting

### Problema: "Permission not found"
**Solución:** Ejecutar seed de permisos
```bash
psql -d beauty_control -f migrations/20251019_seed_permissions.sql
```

### Problema: Usuario no tiene permisos esperados
**Solución:** Verificar permisos efectivos
```javascript
const perms = await PermissionService.getUserEffectivePermissions(userId, businessId);
console.log(perms);
```

### Problema: BUSINESS no puede conceder permisos
**Solución:** Verificar middleware businessAndOwner en rutas

---

## 🚀 Próximos Pasos

1. ✅ Backend implementado
2. ⏳ **Frontend: Panel de permisos estilo Trello**
3. ⏳ Testing E2E
4. ⏳ Documentación de usuario final
5. ⏳ Video tutorial

---

**Autor:** Sistema de Permisos Beauty Control  
**Fecha:** Octubre 19, 2025  
**Versión:** 1.0.0
