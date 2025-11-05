# Solución Multi-Sucursal para Sistema de Turnos

## 🏢 ESCENARIO CORRECTO

### Realidad del negocio:
- ✅ Un **SPECIALIST** puede trabajar en **múltiples sucursales**
- ✅ Un **RECEPTIONIST_SPECIALIST** puede trabajar en **múltiples sucursales**
- ✅ Un **RECEPTIONIST** puede gestionar **múltiples sucursales** (o solo una)

### Relación existente:
```
SpecialistProfile ↔ Branch (many-to-many)
    a través de: SpecialistBranchSchedule
```

---

## 🔧 SOLUCIÓN REVISADA

### OPCIÓN 1: Usar SpecialistBranchSchedule para todos los roles

En lugar de agregar `assignedBranchId` a User, **reutilizar** la tabla existente `SpecialistBranchSchedule` para:
- SPECIALIST
- RECEPTIONIST_SPECIALIST  
- RECEPTIONIST (nueva funcionalidad)

**Ventajas:**
- ✅ Ya existe la infraestructura
- ✅ Soporte multi-sucursal nativo
- ✅ Horarios por sucursal
- ✅ No duplicar lógica

**Desventajas:**
- ⚠️ Requiere cambiar el nombre de la tabla (es confuso para RECEPTIONIST)
- ⚠️ Requiere ajustar referencias

---

### OPCIÓN 2: Crear tabla UserBranch (RECOMENDADO)

Crear una tabla intermedia más genérica que funcione para todos los roles:

```javascript
// packages/backend/src/models/UserBranch.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserBranch = sequelize.define('UserBranch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'branches',
      key: 'id'
    }
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si esta es la sucursal principal del usuario'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica si el usuario está activo en esta sucursal'
  },
  role: {
    type: DataTypes.ENUM('SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'),
    allowNull: false,
    comment: 'Rol del usuario en esta sucursal específica'
  },
  permissions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Permisos específicos en esta sucursal'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'user_branches',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'branchId'],
      name: 'unique_user_branch'
    },
    {
      fields: ['userId', 'isPrimary']
    },
    {
      fields: ['branchId', 'role']
    }
  ]
});

module.exports = UserBranch;
```

**Ventajas:**
- ✅ Nombre claro y genérico
- ✅ Funciona para todos los roles
- ✅ Permite marcar sucursal principal
- ✅ Permite permisos granulares por sucursal
- ✅ No afecta SpecialistBranchSchedule (que sigue siendo para horarios)

---

### OPCIÓN 3: Usar SpecialistBranchSchedule + ajustar lógica de queries (MÁS SIMPLE)

Mantener todo como está y simplemente hacer que las queries obtengan las sucursales del usuario dinámicamente:

**No agregar campo a User**  
**No crear nueva tabla**  
**Solo ajustar las queries**

```javascript
// Obtener sucursales donde trabaja el usuario
async function getUserBranches(userId) {
  const specialistProfile = await SpecialistProfile.findOne({
    where: { userId },
    include: [{
      model: Branch,
      as: 'branches',
      through: { 
        where: { isActive: true },
        attributes: []
      }
    }]
  });
  
  return specialistProfile?.branches.map(b => b.id) || [];
}
```

**Ventajas:**
- ✅ Cero cambios en base de datos
- ✅ Usa infraestructura existente
- ✅ Implementación inmediata

**Desventajas:**
- ⚠️ No funciona para RECEPTIONIST puro (sin SpecialistProfile)
- ⚠️ Queries más complejas
- ⚠️ Difícil distinguir en qué sucursal actúa como receptionist vs specialist

---

## 🎯 RECOMENDACIÓN: OPCIÓN 2 (UserBranch)

### Razones:
1. **Separación de conceptos**: 
   - `SpecialistBranchSchedule` = horarios de trabajo
   - `UserBranch` = asignación de usuarios a sucursales

2. **Flexibilidad**: Un RECEPTIONIST puede no tener SpecialistProfile

3. **Claridad**: Fácil de entender y mantener

4. **Escalabilidad**: Permite agregar permisos granulares después

---

## 📝 IMPLEMENTACIÓN COMPLETA - OPCIÓN 2

### PASO 1: Crear modelo UserBranch

```javascript
// packages/backend/src/models/UserBranch.js
// (código arriba)
```

### PASO 2: Agregar asociaciones en index.js

```javascript
// packages/backend/src/models/index.js
const UserBranch = require('./UserBranch');

// User - Branch (many-to-many a través de UserBranch)
User.belongsToMany(Branch, {
  through: UserBranch,
  foreignKey: 'userId',
  otherKey: 'branchId',
  as: 'assignedBranches'
});

Branch.belongsToMany(User, {
  through: UserBranch,
  foreignKey: 'branchId',
  otherKey: 'userId',
  as: 'assignedUsers'
});

// Relaciones directas
UserBranch.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

UserBranch.belongsTo(Branch, {
  foreignKey: 'branchId',
  as: 'branch'
});

User.hasMany(UserBranch, {
  foreignKey: 'userId',
  as: 'branchAssignments'
});

Branch.hasMany(UserBranch, {
  foreignKey: 'branchId',
  as: 'userAssignments'
});
```

### PASO 3: Crear migración

```bash
npx sequelize-cli migration:generate --name create-user-branches-table
```

```javascript
// migrations/XXXXXX-create-user-branches-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_branches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      branchId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      isPrimary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      role: {
        type: Sequelize.ENUM('SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'),
        allowNull: false
      },
      permissions: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Índices
    await queryInterface.addIndex('user_branches', ['userId', 'branchId'], {
      unique: true,
      name: 'unique_user_branch'
    });

    await queryInterface.addIndex('user_branches', ['userId', 'isPrimary']);
    await queryInterface.addIndex('user_branches', ['branchId', 'role']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_branches');
  }
};
```

### PASO 4: Actualizar middleware auth.js

```javascript
// packages/backend/src/middleware/auth.js
const UserBranch = require('../models/UserBranch');

const requireSpecialistOrReceptionist = async (req, res, next) => {
  try {
    // ... validaciones existentes ...

    if (!['SPECIALIST', 'RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Rol SPECIALIST, RECEPTIONIST o RECEPTIONIST_SPECIALIST requerido'
      });
    }

    // ... validación de businessId ...

    // Obtener sucursales asignadas al usuario
    const userBranches = await UserBranch.findAll({
      where: {
        userId: req.user.id,
        isActive: true
      },
      include: [{
        model: require('../models/Branch'),
        as: 'branch',
        attributes: ['id', 'name', 'code']
      }]
    });

    const branchIds = userBranches.map(ub => ub.branchId);

    // Agregar información según el rol
    if (req.user.role === 'SPECIALIST') {
      req.specialist = {
        id: req.user.id,
        businessId: req.user.businessId,
        branchIds // ← MÚLTIPLES SUCURSALES
      };
      // Evitar acceso cruzado
      if (req.body.specialistId || req.params.specialistId) {
        delete req.body.specialistId;
        delete req.params.specialistId;
      }
      
    } else if (req.user.role === 'RECEPTIONIST') {
      req.receptionist = {
        id: req.user.id,
        businessId: req.user.businessId,
        branchIds // ← MÚLTIPLES SUCURSALES
      };
      
    } else if (req.user.role === 'RECEPTIONIST_SPECIALIST') {
      // Rol dual: tiene ambos permisos
      req.specialist = {
        id: req.user.id,
        businessId: req.user.businessId,
        branchIds
      };
      req.receptionist = {
        id: req.user.id,
        businessId: req.user.businessId,
        branchIds
      };
    }

    next();
  } catch (error) {
    console.error('Error en middleware requireSpecialistOrReceptionist:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};
```

### PASO 5: Actualizar AppointmentController.getAppointments

```javascript
// packages/backend/src/controllers/AppointmentController.js

static async getAppointments(req, res) {
  try {
    const { businessId } = req.query;
    
    const {
      page = 1,
      limit = 10,
      status,
      specialistId,
      date,
      startDate,
      endDate,
      branchId
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { businessId };

    // ========== LÓGICA CORREGIDA PARA MULTI-SUCURSAL ==========
    
    if (req.user.role === 'SPECIALIST') {
      // SPECIALIST: Solo sus propias citas (en todas sus sucursales)
      where.specialistId = req.specialist.id;
      
      // Opcional: filtrar por sucursales donde trabaja
      if (req.specialist.branchIds && req.specialist.branchIds.length > 0) {
        where.branchId = {
          [Op.in]: req.specialist.branchIds
        };
      }
      
    } else if (req.user.role === 'RECEPTIONIST') {
      // RECEPTIONIST: Todas las citas de sus sucursales asignadas
      if (req.receptionist.branchIds && req.receptionist.branchIds.length > 0) {
        where.branchId = {
          [Op.in]: req.receptionist.branchIds
        };
      } else {
        // Si no tiene sucursales asignadas, no ve nada
        where.id = null;
      }
      
      // Puede filtrar por especialista específico dentro de sus sucursales
      if (specialistId) {
        where.specialistId = specialistId;
      }
      
    } else if (req.user.role === 'RECEPTIONIST_SPECIALIST') {
      // RECEPTIONIST_SPECIALIST: Sus propias citas + todas las de sus sucursales
      const conditions = [];
      
      // Condición 1: Sus propias citas
      conditions.push({ specialistId: req.user.id });
      
      // Condición 2: Todas las citas de sus sucursales asignadas
      if (req.receptionist.branchIds && req.receptionist.branchIds.length > 0) {
        conditions.push({
          branchId: {
            [Op.in]: req.receptionist.branchIds
          }
        });
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
      if (specialistId) {
        where.specialistId = specialistId;
      }
      if (branchId) {
        where.branchId = branchId;
      }
    }

    // Filtro adicional por sucursal específica (si lo solicita)
    // Este filtro se aplica DESPUÉS de los filtros de rol
    if (branchId && !where.branchId) {
      // Validar que el usuario tenga acceso a esa sucursal
      if (req.specialist?.branchIds?.includes(branchId) || 
          req.receptionist?.branchIds?.includes(branchId) ||
          req.user.role === 'BUSINESS') {
        where.branchId = branchId;
      } else {
        return res.status(403).json({
          success: false,
          error: 'No tienes acceso a esta sucursal'
        });
      }
    }

    // Filtros de fecha
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      where.startTime = {
        [Op.gte]: targetDate,
        [Op.lt]: nextDay
      };
    } else if (startDate && endDate) {
      where.startTime = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate)
      };
    }

    // Filtro de estado
    if (status) {
      where.status = status;
    }

    // Query principal
    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: Service,
          attributes: ['id', 'name', 'duration', 'price', 'category']
        },
        {
          model: Client,
          attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
        },
        {
          model: User,
          as: 'specialist',
          attributes: ['id', 'firstName', 'lastName'],
          include: [{
            model: SpecialistProfile,
            attributes: ['specialization']
          }]
        },
        {
          model: require('../models/Branch'),
          as: 'branch',
          attributes: ['id', 'name', 'code', 'color'],
          required: false
        }
      ],
      order: [['startTime', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo citas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
}
```

### PASO 6: Actualizar createAppointment

```javascript
static async createAppointment(req, res) {
  try {
    // Validar roles permitidos
    if (!['RECEPTIONIST', 'RECEPTIONIST_SPECIALIST', 'BUSINESS'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para crear citas'
      });
    }

    const { businessId, branchId, clientId, specialistId, serviceId, startTime, endTime, notes, clientNotes } = req.body;

    // ========== VALIDACIÓN DE SUCURSAL ==========
    
    // RECEPTIONIST y RECEPTIONIST_SPECIALIST solo pueden crear en sus sucursales asignadas
    if (['RECEPTIONIST', 'RECEPTIONIST_SPECIALIST'].includes(req.user.role)) {
      if (!branchId) {
        return res.status(400).json({
          success: false,
          error: 'Debes especificar una sucursal'
        });
      }

      // Verificar que la sucursal esté en la lista de sucursales asignadas
      if (!req.receptionist?.branchIds?.includes(branchId)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para crear citas en esta sucursal'
        });
      }
    }

    // Validar que el especialista pertenezca al negocio
    const specialist = await User.findOne({
      where: {
        id: specialistId,
        businessId,
        role: { [Op.in]: ['SPECIALIST', 'RECEPTIONIST_SPECIALIST'] },
        status: 'ACTIVE'
      }
    });

    if (!specialist) {
      return res.status(400).json({
        success: false,
        error: 'Especialista no válido para este negocio'
      });
    }

    // Validar sucursal
    const Branch = require('../models/Branch');
    const branch = await Branch.findOne({
      where: {
        id: branchId,
        businessId,
        isActive: true
      }
    });

    if (!branch) {
      return res.status(400).json({
        success: false,
        error: 'Sucursal no válida'
      });
    }

    // ========== VERIFICAR QUE EL ESPECIALISTA TRABAJE EN ESA SUCURSAL ==========
    
    const UserBranch = require('../models/UserBranch');
    const specialistBranch = await UserBranch.findOne({
      where: {
        userId: specialistId,
        branchId: branchId,
        isActive: true
      }
    });

    if (!specialistBranch) {
      return res.status(400).json({
        success: false,
        error: 'El especialista no trabaja en esta sucursal'
      });
    }

    // Validar servicio
    const service = await Service.findOne({
      where: {
        id: serviceId,
        businessId,
        isActive: true
      }
    });

    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Servicio no válido'
      });
    }

    // Validar cliente
    const client = await Client.findOne({
      where: { id: clientId }
    });

    if (!client) {
      return res.status(400).json({
        success: false,
        error: 'Cliente no encontrado'
      });
    }

    // Verificar disponibilidad del especialista
    const conflictingAppointment = await Appointment.findOne({
      where: {
        specialistId,
        businessId,
        branchId, // ← IMPORTANTE: verificar en la misma sucursal
        status: {
          [Op.notIn]: ['CANCELED', 'COMPLETED']
        },
        [Op.or]: [
          {
            startTime: {
              [Op.between]: [new Date(startTime), new Date(endTime)]
            }
          },
          {
            endTime: {
              [Op.between]: [new Date(startTime), new Date(endTime)]
            }
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: new Date(startTime) } },
              { endTime: { [Op.gte]: new Date(endTime) } }
            ]
          }
        ]
      }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        error: 'El especialista no está disponible en ese horario en esta sucursal'
      });
    }

    // Generar número de cita
    const appointmentNumber = `CITA-${Date.now()}`;

    // Crear la cita
    const appointment = await Appointment.create({
      businessId,
      clientId,
      specialistId,
      serviceId,
      branchId,
      appointmentNumber,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      totalAmount: service.price,
      status: 'PENDING',
      notes,
      clientNotes
    });

    // Obtener cita con relaciones
    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        {
          model: Service,
          attributes: ['id', 'name', 'duration', 'price']
        },
        {
          model: Client,
          attributes: ['id', 'firstName', 'lastName', 'phone']
        },
        {
          model: User,
          as: 'specialist',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Branch,
          as: 'branch',
          attributes: ['id', 'name', 'code', 'color']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: createdAppointment
    });

  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
}
```

---

## 📊 CASOS DE USO

### Caso 1: Especialista trabaja en 2 sucursales

```javascript
// Usuario: Juan Pérez
// Rol: SPECIALIST
// Sucursales: [Sucursal A, Sucursal B]

// En UserBranch:
[
  { userId: 'juan-id', branchId: 'sucursal-a-id', role: 'SPECIALIST', isPrimary: true },
  { userId: 'juan-id', branchId: 'sucursal-b-id', role: 'SPECIALIST', isPrimary: false }
]

// Query de citas:
where: {
  businessId: 'biz-123',
  specialistId: 'juan-id',
  branchId: { [Op.in]: ['sucursal-a-id', 'sucursal-b-id'] }
}
// Ve todas sus citas de ambas sucursales
```

### Caso 2: Recepcionista-Especialista en 3 sucursales

```javascript
// Usuario: María González
// Rol: RECEPTIONIST_SPECIALIST
// Sucursales: [Sucursal A, Sucursal B, Sucursal C]

// En UserBranch:
[
  { userId: 'maria-id', branchId: 'sucursal-a-id', role: 'RECEPTIONIST_SPECIALIST', isPrimary: true },
  { userId: 'maria-id', branchId: 'sucursal-b-id', role: 'RECEPTIONIST_SPECIALIST', isPrimary: false },
  { userId: 'maria-id', branchId: 'sucursal-c-id', role: 'RECEPTIONIST_SPECIALIST', isPrimary: false }
]

// Query de citas:
where: {
  businessId: 'biz-123',
  [Op.or]: [
    { specialistId: 'maria-id' }, // Sus propias citas
    { branchId: { [Op.in]: ['sucursal-a-id', 'sucursal-b-id', 'sucursal-c-id'] } } // Todas las citas de sus sucursales
  ]
}
// Ve SUS citas + TODAS las citas de las 3 sucursales
```

### Caso 3: Recepcionista puro en 1 sucursal

```javascript
// Usuario: Ana López
// Rol: RECEPTIONIST
// Sucursales: [Sucursal A]

// En UserBranch:
[
  { userId: 'ana-id', branchId: 'sucursal-a-id', role: 'RECEPTIONIST', isPrimary: true }
]

// Query de citas:
where: {
  businessId: 'biz-123',
  branchId: { [Op.in]: ['sucursal-a-id'] }
}
// Ve todas las citas de Sucursal A
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] 1. Crear modelo `UserBranch.js`
- [ ] 2. Agregar asociaciones en `models/index.js`
- [ ] 3. Crear migración para tabla `user_branches`
- [ ] 4. Ejecutar migración: `npx sequelize-cli db:migrate`
- [ ] 5. Actualizar middleware `requireSpecialistOrReceptionist`
- [ ] 6. Actualizar `AppointmentController.getAppointments`
- [ ] 7. Actualizar `AppointmentController.getAppointmentDetail`
- [ ] 8. Actualizar `AppointmentController.createAppointment`
- [ ] 9. Actualizar `AppointmentController.updateAppointmentStatus`
- [ ] 10. Actualizar `AppointmentController.cancelAppointment`
- [ ] 11. Crear seeds para asignar usuarios existentes a sucursales
- [ ] 12. Actualizar BusinessController para asignar sucursales al crear empleados

---

## 🎯 VENTAJAS DE ESTA SOLUCIÓN

1. ✅ **Multi-sucursal nativo**: Un usuario puede estar en N sucursales
2. ✅ **Sucursal principal**: Campo `isPrimary` para UI
3. ✅ **Separación de conceptos**: UserBranch (asignación) vs SpecialistBranchSchedule (horarios)
4. ✅ **Permisos granulares**: Campo `permissions` JSONB para futuro
5. ✅ **Escalable**: Fácil agregar nuevas funcionalidades
6. ✅ **Queries eficientes**: Usa `Op.in` para múltiples sucursales
7. ✅ **Validaciones robustas**: Verifica permisos antes de crear/modificar

---

¿Quieres que implemente esta solución en tu código?
