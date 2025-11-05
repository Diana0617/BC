# Correcciones Necesarias para AppointmentController

## 📋 RESUMEN DE PROBLEMAS

Tu `AppointmentController.js` existe y está bien estructurado, pero necesita correcciones para:

1. ✅ Soportar el rol **RECEPTIONIST_SPECIALIST**
2. ✅ Filtrar por sucursal correctamente
3. ✅ Implementar lógica de permisos completa
4. ✅ Validar acceso según el contexto correcto

---

## 🔧 CORRECCIÓN 1: Agregar campo assignedBranchId a User

### Archivo: `packages/backend/src/models/User.js`

**Agregar después del campo `businessId` (línea 62):**

```javascript
  assignedBranchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'branches',
      key: 'id'
    },
    comment: 'Sucursal asignada para RECEPTIONIST y RECEPTIONIST_SPECIALIST'
  },
```

**Migración necesaria:**

```bash
# Crear migración
npx sequelize-cli migration:generate --name add-assigned-branch-to-users
```

```javascript
// migration file
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'assignedBranchId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'assignedBranchId');
  }
};
```

---

## 🔧 CORRECCIÓN 2: Actualizar middleware requireSpecialistOrReceptionist

### Archivo: `packages/backend/src/middleware/auth.js`

**CAMBIAR línea 267:**

```javascript
// ANTES:
if (!['SPECIALIST', 'RECEPTIONIST'].includes(req.user.role)) {

// DESPUÉS:
if (!['SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'].includes(req.user.role)) {
```

**CAMBIAR línea 286-302 completa:**

```javascript
// ANTES:
if (req.user.role === 'SPECIALIST') {
  req.specialist = {
    id: req.user.id,
    businessId: req.user.businessId
  };
  // Evitar acceso cruzado para especialistas
  if (req.body.specialistId || req.params.specialistId) {
    delete req.body.specialistId;
    delete req.params.specialistId;
  }
} else if (req.user.role === 'RECEPTIONIST') {
  req.receptionist = {
    id: req.user.id,
    businessId: req.user.businessId
  };
}

// DESPUÉS:
if (req.user.role === 'SPECIALIST') {
  req.specialist = {
    id: req.user.id,
    businessId: req.user.businessId
  };
  // Evitar acceso cruzado para especialistas
  if (req.body.specialistId || req.params.specialistId) {
    delete req.body.specialistId;
    delete req.params.specialistId;
  }
} else if (req.user.role === 'RECEPTIONIST') {
  req.receptionist = {
    id: req.user.id,
    businessId: req.user.businessId,
    assignedBranchId: req.user.assignedBranchId
  };
} else if (req.user.role === 'RECEPTIONIST_SPECIALIST') {
  // Este rol tiene ambos permisos
  req.specialist = {
    id: req.user.id,
    businessId: req.user.businessId
  };
  req.receptionist = {
    id: req.user.id,
    businessId: req.user.businessId,
    assignedBranchId: req.user.assignedBranchId
  };
  // NO eliminar specialistId del body para este rol
  // porque puede crear citas para otros o para sí mismo
}
```

---

## 🔧 CORRECCIÓN 3: Actualizar AppointmentController.getAppointments

### Archivo: `packages/backend/src/controllers/AppointmentController.js`

**REEMPLAZAR líneas 44-52:**

```javascript
// ANTES:
// Aplicar filtros de acceso según el rol
if (req.specialist) {
  // SPECIALIST: Solo sus propias citas
  where.specialistId = req.specialist.id;
} else if (req.receptionist) {
  // RECEPTIONIST: Puede especificar especialista o ver todas
  if (specialistId) {
    where.specialistId = specialistId;
  }
}

// DESPUÉS:
// Aplicar filtros de acceso según el rol
if (req.user.role === 'SPECIALIST') {
  // SPECIALIST: Solo sus propias citas
  where.specialistId = req.specialist.id;
  
} else if (req.user.role === 'RECEPTIONIST') {
  // RECEPTIONIST: Solo citas de su sucursal asignada
  if (req.receptionist.assignedBranchId) {
    where.branchId = req.receptionist.assignedBranchId;
  }
  // Puede filtrar por especialista específico
  if (specialistId) {
    where.specialistId = specialistId;
  }
  
} else if (req.user.role === 'RECEPTIONIST_SPECIALIST') {
  // RECEPTIONIST_SPECIALIST: Sus propias citas + todas las de su sucursal
  const conditions = [];
  
  // Condición 1: Sus propias citas
  conditions.push({ specialistId: req.user.id });
  
  // Condición 2: Todas las citas de su sucursal asignada
  if (req.receptionist.assignedBranchId) {
    conditions.push({ branchId: req.receptionist.assignedBranchId });
  }
  
  // Combinar con OR
  if (conditions.length > 0) {
    where[Op.or] = conditions;
  }
  
  // Si especifica un especialista, filtrar por ese
  if (specialistId) {
    where.specialistId = specialistId;
  }
  
} else if (req.user.role === 'BUSINESS') {
  // BUSINESS: Todas las citas del negocio
  // No se aplica filtro adicional más allá del businessId
  if (specialistId) {
    where.specialistId = specialistId;
  }
}
```

---

## 🔧 CORRECCIÓN 4: Actualizar AppointmentController.getAppointmentDetail

### Archivo: `packages/backend/src/controllers/AppointmentController.js`

**REEMPLAZAR líneas 149-152:**

```javascript
// ANTES:
// Aplicar filtros de acceso según el rol
if (req.specialist) {
  where.specialistId = req.specialist.id;
}

// DESPUÉS:
// Aplicar filtros de acceso según el rol
if (req.user.role === 'SPECIALIST') {
  // SPECIALIST: Solo sus propias citas
  where.specialistId = req.specialist.id;
  
} else if (req.user.role === 'RECEPTIONIST') {
  // RECEPTIONIST: Solo citas de su sucursal
  if (req.receptionist.assignedBranchId) {
    where.branchId = req.receptionist.assignedBranchId;
  }
  
} else if (req.user.role === 'RECEPTIONIST_SPECIALIST') {
  // RECEPTIONIST_SPECIALIST: Sus citas o las de su sucursal
  const conditions = [];
  conditions.push({ specialistId: req.user.id });
  if (req.receptionist.assignedBranchId) {
    conditions.push({ branchId: req.receptionist.assignedBranchId });
  }
  if (conditions.length > 0) {
    where[Op.or] = conditions;
  }
}
// BUSINESS no necesita filtro adicional
```

---

## 🔧 CORRECCIÓN 5: Actualizar AppointmentController.createAppointment

### Archivo: `packages/backend/src/controllers/AppointmentController.js`

**REEMPLAZAR líneas 210-216:**

```javascript
// ANTES:
// Solo recepcionistas pueden crear citas
if (!req.receptionist) {
  return res.status(403).json({
    success: false,
    error: 'Solo recepcionistas pueden crear citas'
  });
}

// DESPUÉS:
// Solo RECEPTIONIST, RECEPTIONIST_SPECIALIST y BUSINESS pueden crear citas
if (!['RECEPTIONIST', 'RECEPTIONIST_SPECIALIST', 'BUSINESS'].includes(req.user.role)) {
  return res.status(403).json({
    success: false,
    error: 'No tienes permisos para crear citas'
  });
}

// RECEPTIONIST solo puede crear citas en su sucursal asignada
if (req.user.role === 'RECEPTIONIST' && req.receptionist.assignedBranchId) {
  if (!branchId || branchId !== req.receptionist.assignedBranchId) {
    return res.status(403).json({
      success: false,
      error: 'Solo puedes crear citas en tu sucursal asignada'
    });
  }
}

// RECEPTIONIST_SPECIALIST solo puede crear citas en su sucursal asignada
if (req.user.role === 'RECEPTIONIST_SPECIALIST' && req.receptionist.assignedBranchId) {
  if (!branchId || branchId !== req.receptionist.assignedBranchId) {
    return res.status(403).json({
      success: false,
      error: 'Solo puedes crear citas en tu sucursal asignada'
    });
  }
}
```

---

## 🔧 CORRECCIÓN 6: Actualizar AppointmentController.updateAppointmentStatus

### Archivo: `packages/backend/src/controllers/AppointmentController.js`

**REEMPLAZAR líneas 423-433:**

```javascript
// ANTES:
// Aplicar filtros de acceso según el rol
if (req.specialist) {
  where.specialistId = req.specialist.id;
  
  // Validar estados permitidos para especialista
  const allowedStatuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Estado no válido para especialista'
    });
  }
}

// DESPUÉS:
// Aplicar filtros de acceso según el rol
if (req.user.role === 'SPECIALIST') {
  where.specialistId = req.specialist.id;
  
  // Validar estados permitidos para especialista
  const allowedStatuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Estado no válido para especialista'
    });
  }
  
} else if (req.user.role === 'RECEPTIONIST') {
  // RECEPTIONIST: Solo citas de su sucursal
  if (req.receptionist.assignedBranchId) {
    where.branchId = req.receptionist.assignedBranchId;
  }
  
} else if (req.user.role === 'RECEPTIONIST_SPECIALIST') {
  // RECEPTIONIST_SPECIALIST: Sus citas o las de su sucursal
  const conditions = [];
  conditions.push({ specialistId: req.user.id });
  if (req.receptionist.assignedBranchId) {
    conditions.push({ branchId: req.receptionist.assignedBranchId });
  }
  if (conditions.length > 0) {
    where[Op.or] = conditions;
  }
  
  // Si está actualizando su propia cita, puede usar estados de specialist
  const appointment = await Appointment.findOne({ where: { id: appointmentId, businessId } });
  if (appointment && appointment.specialistId === req.user.id) {
    const allowedStatuses = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado no válido para tu propia cita'
      });
    }
  }
}
```

---

## 🔧 CORRECCIÓN 7: Actualizar AppointmentController.cancelAppointment

### Archivo: `packages/backend/src/controllers/AppointmentController.js`

**REEMPLAZAR líneas 508-512:**

```javascript
// ANTES:
// Aplicar filtros de acceso según el rol
if (req.specialist) {
  where.specialistId = req.specialist.id;
}

// DESPUÉS:
// Aplicar filtros de acceso según el rol
if (req.user.role === 'SPECIALIST') {
  // SPECIALIST: Solo sus propias citas
  where.specialistId = req.specialist.id;
  
} else if (req.user.role === 'RECEPTIONIST') {
  // RECEPTIONIST: Solo citas de su sucursal
  if (req.receptionist.assignedBranchId) {
    where.branchId = req.receptionist.assignedBranchId;
  }
  
} else if (req.user.role === 'RECEPTIONIST_SPECIALIST') {
  // RECEPTIONIST_SPECIALIST: Sus citas o las de su sucursal
  const conditions = [];
  conditions.push({ specialistId: req.user.id });
  if (req.receptionist.assignedBranchId) {
    conditions.push({ branchId: req.receptionist.assignedBranchId });
  }
  if (conditions.length > 0) {
    where[Op.or] = conditions;
  }
}
// BUSINESS no necesita filtro adicional
```

---

## 📊 TABLA DE PERMISOS POR ROL

| Acción | BUSINESS | RECEPTIONIST | SPECIALIST | RECEPTIONIST_SPECIALIST |
|--------|----------|--------------|------------|------------------------|
| Ver todas las citas del negocio | ✅ | ❌ | ❌ | ❌ |
| Ver citas de su sucursal | ✅ | ✅ | ❌ | ✅ |
| Ver solo sus propias citas | ✅ | ❌ | ✅ | ✅ |
| Crear citas para cualquier especialista | ✅ | ✅ (solo su sucursal) | ❌ | ✅ (solo su sucursal) |
| Crear citas para sí mismo | ✅ | ❌ | ❌ | ✅ |
| Actualizar estado de cita | ✅ | ✅ (solo su sucursal) | ✅ (solo propias) | ✅ (propias + sucursal) |
| Cancelar cita | ✅ | ✅ (solo su sucursal) | ✅ (solo propias) | ✅ (propias + sucursal) |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] **1. Modelo User**: Agregar campo `assignedBranchId`
- [ ] **2. Migración**: Crear y ejecutar migración para `assignedBranchId`
- [ ] **3. Middleware auth.js**: Actualizar `requireSpecialistOrReceptionist`
- [ ] **4. AppointmentController**: Actualizar `getAppointments`
- [ ] **5. AppointmentController**: Actualizar `getAppointmentDetail`
- [ ] **6. AppointmentController**: Actualizar `createAppointment`
- [ ] **7. AppointmentController**: Actualizar `updateAppointmentStatus`
- [ ] **8. AppointmentController**: Actualizar `cancelAppointment`
- [ ] **9. Asociaciones**: Agregar en `models/index.js` relación User → Branch (assignedBranch)
- [ ] **10. Seed/Data**: Actualizar usuarios existentes con `assignedBranchId`

---

## 🚀 PRÓXIMOS PASOS

1. **Aplicar correcciones al modelo User**
2. **Crear y ejecutar migración**
3. **Actualizar middleware de autenticación**
4. **Aplicar correcciones al AppointmentController**
5. **Asignar sucursales a recepcionistas existentes**
6. **Probar cada endpoint con los 4 roles**

---

## 📝 EJEMPLO DE USO

### Crear un RECEPTIONIST_SPECIALIST:

```javascript
// En BusinessController.inviteEmployee
const employee = await User.create({
  firstName: 'María',
  lastName: 'González',
  email: 'maria@example.com',
  password: hashedPassword,
  phone: '1234567890',
  role: 'RECEPTIONIST_SPECIALIST',
  businessId: '123-456',
  assignedBranchId: 'branch-abc-123' // ← NUEVO CAMPO
});
```

### Query de ejemplo para RECEPTIONIST_SPECIALIST:

```javascript
// Obtener citas que puede ver (propias + de su sucursal)
const appointments = await Appointment.findAll({
  where: {
    businessId: 'biz-123',
    [Op.or]: [
      { specialistId: 'user-id-123' },  // Sus propias citas
      { branchId: 'branch-abc-123' }    // Citas de su sucursal
    ]
  }
});
```

---

¿Quieres que aplique estas correcciones ahora o prefieres revisarlas primero?
