# ✅ CORRECCIÓN COMPLETA DEL FLUJO DE CREACIÓN DE ESPECIALISTAS

## 🔴 PROBLEMAS IDENTIFICADOS

### 1. Backend usando campos incorrectos
- ❌ **ANTES**: Backend esperaba `userData.name` (que no existe)
- ✅ **AHORA**: Backend usa `userData.firstName` y `userData.lastName` correctamente

### 2. Sucursales no se asignaban
- ❌ **ANTES**: No se creaban registros en `user_branches`
- ✅ **AHORA**: Se asigna sucursal principal y sucursales adicionales en `UserBranch`

### 3. Datos profesionales no se guardaban correctamente
- ❌ **ANTES**: Comisión siempre quedaba en 50% (hardcoded)
- ✅ **AHORA**: Se guarda la comisión ingresada en el formulario

### 4. Certificaciones no se manejaban como array
- ❌ **ANTES**: Frontend enviaba string, backend esperaba array
- ✅ **AHORA**: Frontend convierte string a array antes de enviar

### 5. No se mostraban las sucursales asignadas
- ❌ **ANTES**: Solo mostraba ID de sucursal principal
- ✅ **AHORA**: Muestra todas las sucursales con marca de "Principal"

---

## 🔧 CAMBIOS REALIZADOS

### Backend: `src/services/BusinessConfigService.js`

#### ✅ Imports agregados:
```javascript
const { sequelize } = require('../config/database');
const Branch = require('../models/Branch');
const UserBranch = require('../models/UserBranch');
```

#### ✅ `createSpecialist()` - Cambios completos:

**ANTES:**
```javascript
// Dividir el nombre completo en firstName y lastName
const nameParts = (userData.name || '').trim().split(' ');
const firstName = nameParts[0] || 'Sin';
const lastName = nameParts.slice(1).join(' ') || 'Apellido';

// Crear el usuario
const user = await User.create({
  firstName: firstName,
  lastName: lastName,
  // ...
});

// Crear perfil con comisión hardcoded
const profile = await SpecialistProfile.create({
  commissionRate: profileData.commissionPercentage || 50.00,
  commissionType: 'PERCENTAGE'
});

// Sucursales solo comentadas
console.log('Sucursales adicionales pendientes...');
```

**AHORA:**
```javascript
const transaction = await sequelize.transaction();

// Usar firstName y lastName directamente del userData
const user = await User.create({
  firstName: userData.firstName?.trim() || 'Sin',
  lastName: userData.lastName?.trim() || 'Apellido',
  email: userData.email,
  password: userData.password,
  phone: userData.phone || null,
  role: userData.role || 'SPECIALIST',
  businessId: businessId,
  status: 'ACTIVE'
}, { transaction });

// Crear perfil con comisión real o tarifa por hora
const profile = await SpecialistProfile.create({
  userId: user.id,
  businessId: businessId,
  specialization: profileData.specialization || null,
  biography: profileData.bio || null,
  experience: profileData.yearsOfExperience ? parseInt(profileData.yearsOfExperience) : null,
  certifications: Array.isArray(profileData.certifications) 
    ? profileData.certifications 
    : (profileData.certifications ? [profileData.certifications] : []),
  isActive: profileData.isActive !== undefined ? profileData.isActive : true,
  commissionRate: profileData.commissionPercentage 
    ? parseFloat(profileData.commissionPercentage) 
    : (profileData.hourlyRate ? null : 50.00),
  commissionType: profileData.hourlyRate ? 'FIXED_AMOUNT' : 'PERCENTAGE',
  fixedCommissionAmount: profileData.hourlyRate ? parseFloat(profileData.hourlyRate) : null,
  status: 'ACTIVE'
}, { transaction });

// Asignar sucursal principal
await UserBranch.create({
  userId: user.id,
  branchId: profileData.branchId,
  isDefault: true,
  canManageSchedule: true,
  canCreateAppointments: true
}, { transaction });

// Asignar sucursales adicionales
if (profileData.additionalBranches && Array.isArray(profileData.additionalBranches) && profileData.additionalBranches.length > 0) {
  const additionalBranchAssignments = profileData.additionalBranches.map(branchId => ({
    userId: user.id,
    branchId: branchId,
    isDefault: false,
    canManageSchedule: true,
    canCreateAppointments: true
  }));
  
  await UserBranch.bulkCreate(additionalBranchAssignments, { transaction });
}

await transaction.commit();

// Retornar con sucursales incluidas
await profile.reload({ 
  include: [
    { 
      model: User, 
      as: 'user',
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role'],
      include: [{
        model: Branch,
        as: 'branches',
        through: { attributes: ['isDefault'] }
      }]
    }
  ] 
});

return {
  // ... datos del especialista
  branchId: profileData.branchId,
  branches: profile.user?.branches || [],
  // ...
};
```

#### ✅ `getSpecialists()` - Ahora incluye sucursales:

**ANTES:**
```javascript
include: [{
  model: User,
  as: 'user',
  attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role']
}]
```

**AHORA:**
```javascript
include: [{
  model: User,
  as: 'user',
  attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role'],
  include: [{
    model: Branch,
    as: 'branches',
    through: { 
      attributes: ['isDefault', 'canManageSchedule', 'canCreateAppointments'] 
    },
    attributes: ['id', 'name', 'address', 'color', 'isMainBranch']
  }]
}]

// Transformación incluye sucursales
return specialists.map(specialist => {
  const branches = specialist.user?.branches || [];
  const defaultBranch = branches.find(b => b.UserBranch?.isDefault);
  
  return {
    // ... otros campos
    branchId: defaultBranch?.id || null,
    branches: branches.map(b => ({
      id: b.id,
      name: b.name,
      address: b.address,
      color: b.color,
      isMainBranch: b.isMainBranch,
      isDefault: b.UserBranch?.isDefault || false
    })),
    additionalBranches: branches.filter(b => !b.UserBranch?.isDefault).map(b => b.id)
  };
});
```

---

### Frontend: `web-app/src/pages/business/profile/sections/SpecialistsSection.jsx`

#### ✅ `handleSubmit()` - Conversión de certificaciones:

**ANTES:**
```javascript
const profileData = {
  specialization: formData.specialization,
  yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
  certifications: formData.certifications, // ❌ String directo
  bio: formData.bio,
  hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
  commissionPercentage: formData.commissionPercentage ? parseFloat(formData.commissionPercentage) : null,
  isActive: formData.isActive
};

// ❌ branchId dentro de un objeto anidado separado
profileData: {
  ...profileData,
  branchId: formData.branchId
}
```

**AHORA:**
```javascript
// Convertir certificaciones de string a array
let certifications = [];
if (formData.certifications) {
  if (typeof formData.certifications === 'string') {
    certifications = formData.certifications
      .split(',')
      .map(cert => cert.trim())
      .filter(cert => cert.length > 0);
  } else if (Array.isArray(formData.certifications)) {
    certifications = formData.certifications;
  }
}

const profileData = {
  specialization: formData.specialization,
  yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
  certifications: certifications, // ✅ Array procesado
  bio: formData.bio,
  hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
  commissionPercentage: formData.commissionPercentage ? parseFloat(formData.commissionPercentage) : null,
  branchId: formData.branchId, // ✅ Directo en profileData
  additionalBranches: formData.additionalBranches, // ✅ Incluido
  isActive: formData.isActive
};

// ✅ Enviado directamente
await businessSpecialistsApi.createSpecialist(activeBusiness.id, {
  userData,
  profileData
});
```

#### ✅ `handleEdit()` - Convertir array a string:

**AHORA:**
```javascript
certifications: Array.isArray(specialist.certifications) 
  ? specialist.certifications.join(', ') 
  : (specialist.certifications || ''),
```

#### ✅ Visualización de sucursales en lista:

**ANTES:**
```jsx
{specialist.branchId && branches.find(b => b.id === specialist.branchId) && (
  <div className="flex items-center gap-2">
    <BuildingOfficeIcon className="h-3.5 w-3.5 text-gray-400" />
    <p className="text-gray-600">
      {branches.find(b => b.id === specialist.branchId)?.name}
      {specialist.additionalBranches?.length > 0 && 
        ` +${specialist.additionalBranches.length}`
      }
    </p>
  </div>
)}
```

**AHORA:**
```jsx
{specialist.branches && specialist.branches.length > 0 && (
  <div className="flex items-start gap-2">
    <BuildingOfficeIcon className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
    <div className="flex-1">
      {specialist.branches.length === 1 ? (
        <p className="text-gray-600 text-xs">
          {specialist.branches[0].name}
        </p>
      ) : (
        <div className="space-y-0.5">
          {specialist.branches.map((branch) => (
            <p key={branch.id} className="text-gray-600 text-xs">
              {branch.name}
              {branch.isDefault && <span className="ml-1 text-blue-600">(Principal)</span>}
            </p>
          ))}
        </div>
      )}
    </div>
  </div>
)}
```

---

## ✅ FLUJO COMPLETO CORREGIDO

### 1️⃣ **Paso 1 - Datos Básicos**
```
Usuario completa:
- ✅ Nombre (firstName)
- ✅ Apellido (lastName)
- ✅ Email
- ✅ Teléfono
- ✅ Contraseña
```

### 2️⃣ **Paso 2 - Rol y Ubicación**
```
Usuario selecciona:
- ✅ Rol: SPECIALIST o RECEPTIONIST_SPECIALIST
- ✅ Sucursal principal (requerida)
- ✅ Sucursales adicionales (opcional, multi-select)
```

### 3️⃣ **Paso 3 - Datos Profesionales**
```
Usuario completa (todo opcional):
- ✅ Especialización
- ✅ Años de experiencia
- ✅ Certificaciones (separadas por comas)
- ✅ Biografía
- ✅ Tarifa por hora (si usa monto fijo)
- ✅ Comisión % (si usa porcentaje)
```

### 4️⃣ **Backend procesa:**
```
1. ✅ Valida datos
2. ✅ Crea User con firstName/lastName correctos
3. ✅ Crea SpecialistProfile con todos los campos
4. ✅ Asigna sucursal principal en UserBranch (isDefault: true)
5. ✅ Asigna sucursales adicionales en UserBranch (isDefault: false)
6. ✅ Retorna especialista con todas las sucursales incluidas
```

### 5️⃣ **Frontend muestra:**
```
- ✅ Nombre completo
- ✅ Email y teléfono
- ✅ Rol (Especialista / Recep.-Especialista)
- ✅ Especialización
- ✅ Años de experiencia
- ✅ Todas las sucursales asignadas (con marca de "Principal")
- ✅ Comisión % o Tarifa fija correcta
- ✅ Estado activo/inactivo
```

---

## 🎯 CAMBIOS EN LA BASE DE DATOS

### Tablas involucradas:

#### `users`
```sql
INSERT INTO users (
  id, firstName, lastName, email, password, 
  phone, role, businessId, status
) VALUES (
  uuid, 'Juan', 'Pérez', 'juan@example.com', 'hashed_password',
  '+57 300 123 4567', 'SPECIALIST', business_uuid, 'ACTIVE'
);
```

#### `specialist_profiles`
```sql
INSERT INTO specialist_profiles (
  id, userId, businessId, 
  specialization, biography, experience, certifications,
  commissionRate, commissionType, fixedCommissionAmount,
  isActive, status
) VALUES (
  uuid, user_uuid, business_uuid,
  'Colorimetría', 'Bio del especialista...', 10, '["Cert1", "Cert2"]',
  30.00, 'PERCENTAGE', NULL,
  true, 'ACTIVE'
);
```

#### `user_branches` (NUEVA - antes no se usaba)
```sql
-- Sucursal principal
INSERT INTO user_branches (
  id, userId, branchId, isDefault,
  canManageSchedule, canCreateAppointments
) VALUES (
  uuid, user_uuid, branch1_uuid, true,
  true, true
);

-- Sucursal adicional
INSERT INTO user_branches (
  id, userId, branchId, isDefault,
  canManageSchedule, canCreateAppointments
) VALUES (
  uuid, user_uuid, branch2_uuid, false,
  true, true
);
```

---

## 📊 ANTES vs AHORA - Ejemplo Real

### ANTES (con errores):
```json
// Frontend enviaba:
{
  "userData": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "password": "pass123",
    "phone": "300123456",
    "role": "SPECIALIST"
  },
  "profileData": {
    "specialization": "Colorimetría",
    "yearsOfExperience": 10,
    "certifications": "Cert1, Cert2, Cert3", // ❌ String
    "bio": "Especialista en color",
    "commissionPercentage": 30,
    "branchId": "branch-uuid-1",
    "additionalBranches": ["branch-uuid-2", "branch-uuid-3"]
  }
}

// Backend guardaba:
users: {
  firstName: 'Sin',           // ❌ Incorrecto
  lastName: 'Apellido',       // ❌ Incorrecto
  // ...
}

specialist_profiles: {
  certifications: 'Cert1, Cert2, Cert3', // ❌ String (debía ser array)
  commissionRate: 50.00,      // ❌ Siempre 50% (ignora el 30%)
  // ...
}

user_branches: {
  // ❌ No se creaba ningún registro
}
```

### AHORA (correcto):
```json
// Frontend envía lo mismo, pero backend lo procesa bien:

users: {
  firstName: 'Juan',          // ✅ Correcto
  lastName: 'Pérez',          // ✅ Correcto
  email: 'juan@example.com',
  password: 'hashed...',
  phone: '300123456',
  role: 'SPECIALIST',
  status: 'ACTIVE'
}

specialist_profiles: {
  userId: 'user-uuid',
  businessId: 'business-uuid',
  specialization: 'Colorimetría',
  biography: 'Especialista en color',
  experience: 10,
  certifications: ['Cert1', 'Cert2', 'Cert3'], // ✅ Array
  commissionRate: 30.00,      // ✅ Usa el 30% enviado
  commissionType: 'PERCENTAGE',
  isActive: true,
  status: 'ACTIVE'
}

user_branches: [
  {
    userId: 'user-uuid',
    branchId: 'branch-uuid-1',
    isDefault: true,          // ✅ Sucursal principal
    canManageSchedule: true,
    canCreateAppointments: true
  },
  {
    userId: 'user-uuid',
    branchId: 'branch-uuid-2',
    isDefault: false,         // ✅ Sucursal adicional
    canManageSchedule: true,
    canCreateAppointments: true
  },
  {
    userId: 'user-uuid',
    branchId: 'branch-uuid-3',
    isDefault: false,         // ✅ Sucursal adicional
    canManageSchedule: true,
    canCreateAppointments: true
  }
]

// Backend retorna:
{
  "success": true,
  "data": {
    "id": "specialist-profile-uuid",
    "userId": "user-uuid",
    "firstName": "Juan",      // ✅ Visible
    "lastName": "Pérez",      // ✅ Visible
    "email": "juan@example.com",
    "phone": "300123456",
    "role": "SPECIALIST",
    "specialization": "Colorimetría",
    "bio": "Especialista en color",
    "yearsOfExperience": 10,
    "certifications": ["Cert1", "Cert2", "Cert3"],
    "commissionPercentage": 30, // ✅ Correcto
    "isActive": true,
    "branchId": "branch-uuid-1",
    "branches": [             // ✅ Todas las sucursales
      {
        "id": "branch-uuid-1",
        "name": "Sede Principal",
        "isDefault": true
      },
      {
        "id": "branch-uuid-2",
        "name": "Sede Norte",
        "isDefault": false
      },
      {
        "id": "branch-uuid-3",
        "name": "Sede Sur",
        "isDefault": false
      }
    ]
  }
}
```

---

## ✅ VERIFICACIÓN POST-IMPLEMENTACIÓN

### Pruebas a realizar:

1. **Crear especialista con sucursal principal solamente**
   - ✅ Debe guardar firstName/lastName correctamente
   - ✅ Debe crear registro en user_branches con isDefault: true
   - ✅ Debe mostrar la sucursal en la tarjeta

2. **Crear especialista con múltiples sucursales**
   - ✅ Debe crear 1 registro principal (isDefault: true)
   - ✅ Debe crear N registros adicionales (isDefault: false)
   - ✅ Debe mostrar todas las sucursales en la tarjeta
   - ✅ Debe marcar la principal como "(Principal)"

3. **Crear especialista con comisión personalizada**
   - ✅ Si ingresa 30%, debe guardar 30.00 (no 50.00)
   - ✅ Debe mostrar "Comisión: 30%" en la tarjeta

4. **Crear especialista con tarifa por hora**
   - ✅ Si ingresa $50000, debe guardar en fixedCommissionAmount
   - ✅ commissionType debe ser 'FIXED_AMOUNT'
   - ✅ Debe mostrar "Tarifa: $50,000" en la tarjeta

5. **Crear especialista con certificaciones**
   - ✅ Si ingresa "Cert1, Cert2, Cert3", debe guardar como array
   - ✅ Al editar, debe mostrar "Cert1, Cert2, Cert3" como string

6. **Editar especialista**
   - ✅ Debe cargar todos los campos correctamente
   - ✅ Certificaciones deben aparecer como string separado por comas
   - ✅ Debe mantener las sucursales asignadas

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

1. **Probar creación completa** de especialista con todos los campos
2. **Verificar en base de datos** que se creen los 3 registros (User, SpecialistProfile, UserBranch)
3. **Probar multi-sucursal** asignando 2-3 sucursales
4. **Verificar visualización** de todas las sucursales en la tarjeta
5. **Probar edición** y verificar que cargue correctamente

---

**Fecha:** Octubre 10, 2025  
**Estado:** ✅ COMPLETADO  
**Archivos modificados:**
- `packages/backend/src/services/BusinessConfigService.js`
- `packages/web-app/src/pages/business/profile/sections/SpecialistsSection.jsx`
