# Sistema de Precios: Base vs Personalizado por Especialista

## 🎯 OBJETIVO

Permitir que:
1. **BUSINESS** crea servicios con **precio base**
2. **ESPECIALISTAS** pueden tener **precio personalizado** para cada servicio
3. Si el especialista NO define precio personalizado, se usa el **precio base**
4. Cada especialista puede elegir qué servicios ofrece

---

## 📊 MODELO DE DATOS

### Service (precio base del negocio)
```javascript
{
  id: 'service-123',
  businessId: 'biz-456',
  name: 'Corte de cabello',
  price: 50.00,  // ← PRECIO BASE
  duration: 60,
  ...
}
```

### SpecialistService (precio personalizado opcional)
```javascript
{
  id: 'spec-serv-789',
  specialistId: 'juan-id',
  serviceId: 'service-123',
  customPrice: 75.00,  // ← PRECIO PERSONALIZADO (opcional)
  customDuration: 45,  // ← DURACIÓN PERSONALIZADA (opcional)
  isActive: true,
  ...
}
```

### Lógica de precio final:
```javascript
precioFinal = specialistService.customPrice || service.price
```

---

## 🔧 IMPLEMENTACIÓN

### PASO 1: Crear modelo SpecialistService

```javascript
// packages/backend/src/models/SpecialistService.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SpecialistService = sequelize.define('SpecialistService', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  specialistId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'ID del especialista (User con role SPECIALIST o RECEPTIONIST_SPECIALIST)'
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'services',
      key: 'id'
    },
    comment: 'ID del servicio base del negocio'
  },
  customPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    },
    comment: 'Precio personalizado del especialista. Si es NULL, usa el precio base del servicio'
  },
  customDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    },
    comment: 'Duración personalizada en minutos. Si es NULL, usa la duración base del servicio'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Si el especialista ofrece actualmente este servicio'
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Orden de visualización en el perfil del especialista (0 = primero)'
  },
  specialNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas especiales sobre cómo este especialista realiza este servicio'
  },
  skillLevel: {
    type: DataTypes.ENUM('JUNIOR', 'INTERMEDIATE', 'SENIOR', 'MASTER'),
    allowNull: true,
    comment: 'Nivel de habilidad del especialista en este servicio'
  },
  minimumNotice: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Horas mínimas de anticipación requeridas para este especialista en este servicio'
  }
}, {
  tableName: 'specialist_services',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['specialistId', 'serviceId'],
      name: 'unique_specialist_service'
    },
    {
      fields: ['specialistId', 'isActive']
    },
    {
      fields: ['serviceId', 'isActive']
    },
    {
      fields: ['displayOrder']
    }
  ]
});

module.exports = SpecialistService;
```

---

### PASO 2: Agregar asociaciones en models/index.js

```javascript
// packages/backend/src/models/index.js

// Importar el nuevo modelo
const SpecialistService = require('./SpecialistService');

// ... otros imports ...

// ========== ASOCIACIONES SPECIALIST - SERVICE ==========

// User (Specialist) - Service (muchos a muchos a través de SpecialistService)
User.belongsToMany(Service, {
  through: SpecialistService,
  foreignKey: 'specialistId',
  otherKey: 'serviceId',
  as: 'offeredServices' // Servicios que ofrece el especialista
});

Service.belongsToMany(User, {
  through: SpecialistService,
  foreignKey: 'serviceId',
  otherKey: 'specialistId',
  as: 'specialists' // Especialistas que ofrecen este servicio
});

// Relaciones directas con SpecialistService
SpecialistService.belongsTo(User, {
  foreignKey: 'specialistId',
  as: 'specialist'
});

SpecialistService.belongsTo(Service, {
  foreignKey: 'serviceId',
  as: 'service'
});

User.hasMany(SpecialistService, {
  foreignKey: 'specialistId',
  as: 'serviceConfigurations'
});

Service.hasMany(SpecialistService, {
  foreignKey: 'serviceId',
  as: 'specialistConfigurations'
});

// ... resto de asociaciones ...

// Exportar
module.exports = {
  // ... otros modelos ...
  SpecialistService,
  // ...
};
```

---

### PASO 3: Crear migración

```bash
npx sequelize-cli migration:generate --name create-specialist-services-table
```

```javascript
// migrations/XXXXXX-create-specialist-services-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('specialist_services', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      specialistId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      serviceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      customPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      customDuration: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      specialNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      skillLevel: {
        type: Sequelize.ENUM('JUNIOR', 'INTERMEDIATE', 'SENIOR', 'MASTER'),
        allowNull: true
      },
      minimumNotice: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('specialist_services', ['specialistId', 'serviceId'], {
      unique: true,
      name: 'unique_specialist_service'
    });

    await queryInterface.addIndex('specialist_services', ['specialistId', 'isActive']);
    await queryInterface.addIndex('specialist_services', ['serviceId', 'isActive']);
    await queryInterface.addIndex('specialist_services', ['displayOrder']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('specialist_services');
  }
};
```

---

### PASO 4: Crear SpecialistServiceController

```javascript
// packages/backend/src/controllers/SpecialistServiceController.js
const { SpecialistService, Service, User, SpecialistProfile } = require('../models');
const { Op } = require('sequelize');

class SpecialistServiceController {

  /**
   * Obtener servicios de un especialista con sus precios personalizados
   * GET /api/specialists/:specialistId/services
   */
  static async getSpecialistServices(req, res) {
    try {
      const { specialistId } = req.params;
      const { businessId } = req.query;
      const { includeInactive = false } = req.query;

      // Validar que el especialista pertenezca al negocio
      const specialist = await User.findOne({
        where: {
          id: specialistId,
          businessId,
          role: { [Op.in]: ['SPECIALIST', 'RECEPTIONIST_SPECIALIST'] }
        }
      });

      if (!specialist) {
        return res.status(404).json({
          success: false,
          error: 'Especialista no encontrado'
        });
      }

      // Obtener configuraciones de servicios del especialista
      const specialistServices = await SpecialistService.findAll({
        where: {
          specialistId,
          ...(includeInactive === 'true' ? {} : { isActive: true })
        },
        include: [{
          model: Service,
          as: 'service',
          where: {
            businessId,
            isActive: true
          },
          attributes: [
            'id', 
            'name', 
            'description', 
            'category',
            'price',      // precio base
            'duration',   // duración base
            'requiresConsent',
            'color'
          ]
        }],
        order: [['displayOrder', 'ASC'], ['createdAt', 'ASC']]
      });

      // Formatear respuesta con precio final
      const formattedServices = specialistServices.map(ss => ({
        id: ss.id,
        serviceId: ss.serviceId,
        serviceName: ss.service.name,
        serviceDescription: ss.service.description,
        category: ss.service.category,
        
        // Precio
        basePrice: parseFloat(ss.service.price),
        customPrice: ss.customPrice ? parseFloat(ss.customPrice) : null,
        finalPrice: ss.customPrice ? parseFloat(ss.customPrice) : parseFloat(ss.service.price),
        hasCustomPrice: ss.customPrice !== null,
        
        // Duración
        baseDuration: ss.service.duration,
        customDuration: ss.customDuration,
        finalDuration: ss.customDuration || ss.service.duration,
        hasCustomDuration: ss.customDuration !== null,
        
        // Otros
        isActive: ss.isActive,
        requiresConsent: ss.service.requiresConsent,
        color: ss.service.color,
        displayOrder: ss.displayOrder,
        specialNotes: ss.specialNotes,
        skillLevel: ss.skillLevel,
        minimumNotice: ss.minimumNotice
      }));

      res.json({
        success: true,
        data: {
          specialist: {
            id: specialist.id,
            name: `${specialist.firstName} ${specialist.lastName}`,
            role: specialist.role
          },
          services: formattedServices,
          total: formattedServices.length
        }
      });

    } catch (error) {
      console.error('Error obteniendo servicios del especialista:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Asignar servicio a especialista (con precio personalizado opcional)
   * POST /api/specialists/:specialistId/services
   */
  static async assignServiceToSpecialist(req, res) {
    try {
      const { specialistId } = req.params;
      const { businessId } = req.query;
      const {
        serviceId,
        customPrice,
        customDuration,
        specialNotes,
        skillLevel,
        minimumNotice,
        displayOrder
      } = req.body;

      // Validar permisos (solo BUSINESS puede asignar)
      if (req.user.role !== 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para asignar servicios'
        });
      }

      // Validar especialista
      const specialist = await User.findOne({
        where: {
          id: specialistId,
          businessId,
          role: { [Op.in]: ['SPECIALIST', 'RECEPTIONIST_SPECIALIST'] }
        }
      });

      if (!specialist) {
        return res.status(404).json({
          success: false,
          error: 'Especialista no encontrado'
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
        return res.status(404).json({
          success: false,
          error: 'Servicio no encontrado'
        });
      }

      // Verificar si ya existe
      const existing = await SpecialistService.findOne({
        where: {
          specialistId,
          serviceId
        }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'El especialista ya tiene este servicio asignado'
        });
      }

      // Crear asignación
      const specialistService = await SpecialistService.create({
        specialistId,
        serviceId,
        customPrice: customPrice || null,
        customDuration: customDuration || null,
        specialNotes: specialNotes || null,
        skillLevel: skillLevel || null,
        minimumNotice: minimumNotice || null,
        displayOrder: displayOrder || 0,
        isActive: true
      });

      // Obtener con relaciones
      const created = await SpecialistService.findByPk(specialistService.id, {
        include: [{
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'price', 'duration']
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Servicio asignado al especialista exitosamente',
        data: {
          id: created.id,
          serviceId: created.serviceId,
          serviceName: created.service.name,
          basePrice: parseFloat(created.service.price),
          customPrice: created.customPrice ? parseFloat(created.customPrice) : null,
          finalPrice: created.customPrice ? parseFloat(created.customPrice) : parseFloat(created.service.price),
          baseDuration: created.service.duration,
          customDuration: created.customDuration,
          finalDuration: created.customDuration || created.service.duration
        }
      });

    } catch (error) {
      console.error('Error asignando servicio:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar configuración de servicio del especialista
   * PUT /api/specialists/:specialistId/services/:configId
   */
  static async updateSpecialistService(req, res) {
    try {
      const { specialistId, configId } = req.params;
      const { businessId } = req.query;
      const {
        customPrice,
        customDuration,
        specialNotes,
        skillLevel,
        minimumNotice,
        displayOrder,
        isActive
      } = req.body;

      // Validar permisos
      if (req.user.role !== 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para modificar esta configuración'
        });
      }

      // Buscar configuración
      const config = await SpecialistService.findOne({
        where: {
          id: configId,
          specialistId
        },
        include: [{
          model: Service,
          as: 'service',
          where: { businessId }
        }]
      });

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Configuración no encontrada'
        });
      }

      // Actualizar
      await config.update({
        ...(customPrice !== undefined && { customPrice: customPrice || null }),
        ...(customDuration !== undefined && { customDuration: customDuration || null }),
        ...(specialNotes !== undefined && { specialNotes }),
        ...(skillLevel !== undefined && { skillLevel }),
        ...(minimumNotice !== undefined && { minimumNotice }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(isActive !== undefined && { isActive })
      });

      // Recargar con relaciones
      await config.reload({
        include: [{
          model: Service,
          as: 'service',
          attributes: ['id', 'name', 'price', 'duration']
        }]
      });

      res.json({
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: {
          id: config.id,
          serviceId: config.serviceId,
          serviceName: config.service.name,
          basePrice: parseFloat(config.service.price),
          customPrice: config.customPrice ? parseFloat(config.customPrice) : null,
          finalPrice: config.customPrice ? parseFloat(config.customPrice) : parseFloat(config.service.price),
          hasCustomPrice: config.customPrice !== null,
          baseDuration: config.service.duration,
          customDuration: config.customDuration,
          finalDuration: config.customDuration || config.service.duration,
          isActive: config.isActive,
          skillLevel: config.skillLevel
        }
      });

    } catch (error) {
      console.error('Error actualizando configuración:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar servicio de especialista
   * DELETE /api/specialists/:specialistId/services/:configId
   */
  static async removeServiceFromSpecialist(req, res) {
    try {
      const { specialistId, configId } = req.params;
      const { businessId } = req.query;

      // Validar permisos
      if (req.user.role !== 'BUSINESS' && req.user.businessId !== businessId) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para eliminar esta configuración'
        });
      }

      const config = await SpecialistService.findOne({
        where: {
          id: configId,
          specialistId
        },
        include: [{
          model: Service,
          as: 'service',
          where: { businessId }
        }]
      });

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Configuración no encontrada'
        });
      }

      // Soft delete: marcar como inactivo
      await config.update({ isActive: false });

      res.json({
        success: true,
        message: 'Servicio removido del especialista exitosamente'
      });

    } catch (error) {
      console.error('Error removiendo servicio:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener precio final de un servicio para un especialista específico
   * GET /api/specialists/:specialistId/services/:serviceId/price
   */
  static async getServicePrice(req, res) {
    try {
      const { specialistId, serviceId } = req.params;
      const { businessId } = req.query;

      // Buscar configuración del especialista
      const specialistService = await SpecialistService.findOne({
        where: {
          specialistId,
          serviceId,
          isActive: true
        },
        include: [{
          model: Service,
          as: 'service',
          where: {
            id: serviceId,
            businessId,
            isActive: true
          }
        }]
      });

      if (!specialistService) {
        // Si no tiene configuración, retornar precio base
        const service = await Service.findOne({
          where: {
            id: serviceId,
            businessId,
            isActive: true
          }
        });

        if (!service) {
          return res.status(404).json({
            success: false,
            error: 'Servicio no encontrado'
          });
        }

        return res.json({
          success: true,
          data: {
            serviceId: service.id,
            serviceName: service.name,
            basePrice: parseFloat(service.price),
            customPrice: null,
            finalPrice: parseFloat(service.price),
            hasCustomPrice: false,
            baseDuration: service.duration,
            customDuration: null,
            finalDuration: service.duration
          }
        });
      }

      res.json({
        success: true,
        data: {
          serviceId: specialistService.serviceId,
          serviceName: specialistService.service.name,
          basePrice: parseFloat(specialistService.service.price),
          customPrice: specialistService.customPrice ? parseFloat(specialistService.customPrice) : null,
          finalPrice: specialistService.customPrice ? 
            parseFloat(specialistService.customPrice) : 
            parseFloat(specialistService.service.price),
          hasCustomPrice: specialistService.customPrice !== null,
          baseDuration: specialistService.service.duration,
          customDuration: specialistService.customDuration,
          finalDuration: specialistService.customDuration || specialistService.service.duration
        }
      });

    } catch (error) {
      console.error('Error obteniendo precio:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = SpecialistServiceController;
```

---

### PASO 5: Crear rutas

```javascript
// packages/backend/src/routes/specialistServices.js
const express = require('express');
const router = express.Router();
const SpecialistServiceController = require('../controllers/SpecialistServiceController');
const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener servicios de un especialista
router.get(
  '/:specialistId/services',
  SpecialistServiceController.getSpecialistServices
);

// Asignar servicio a especialista
router.post(
  '/:specialistId/services',
  SpecialistServiceController.assignServiceToSpecialist
);

// Actualizar configuración de servicio
router.put(
  '/:specialistId/services/:configId',
  SpecialistServiceController.updateSpecialistService
);

// Remover servicio de especialista
router.delete(
  '/:specialistId/services/:configId',
  SpecialistServiceController.removeServiceFromSpecialist
);

// Obtener precio específico
router.get(
  '/:specialistId/services/:serviceId/price',
  SpecialistServiceController.getServicePrice
);

module.exports = router;
```

Agregar en `server.js` o `app.js`:
```javascript
const specialistServicesRoutes = require('./routes/specialistServices');
app.use('/api/specialists', specialistServicesRoutes);
```

---

## 📊 CASOS DE USO

### Caso 1: Servicio con precio base (sin personalización)

```javascript
// Service creado por BUSINESS
{
  id: 'service-123',
  name: 'Corte de cabello',
  price: 50.00,  // precio base
  duration: 60
}

// Especialista Juan NO tiene configuración personalizada
// SpecialistService NO existe para Juan + Corte de cabello

// Cliente agenda con Juan:
precioFinal = 50.00  // usa precio base
```

### Caso 2: Especialista con precio personalizado

```javascript
// Service (precio base)
{
  id: 'service-123',
  name: 'Corte de cabello',
  price: 50.00  // precio base
}

// SpecialistService de María (especialista senior)
{
  specialistId: 'maria-id',
  serviceId: 'service-123',
  customPrice: 85.00,  // ← precio personalizado
  skillLevel: 'SENIOR'
}

// Cliente agenda con María:
precioFinal = 85.00  // usa precio personalizado
```

### Caso 3: Múltiples especialistas, diferentes precios

```javascript
// Service base
Corte de cabello: $50

// Especialista Junior (Ana)
SpecialistService: customPrice = $35
Precio final: $35

// Especialista Intermedio (Juan)
SpecialistService: customPrice = null
Precio final: $50 (usa base)

// Especialista Senior (María)
SpecialistService: customPrice = $85
Precio final: $85

// Master (Carlos)
SpecialistService: customPrice = $120
Precio final: $120
```

---

## 🔄 FLUJO COMPLETO

### 1. BUSINESS crea servicio
```http
POST /api/services
{
  "businessId": "biz-123",
  "name": "Corte de cabello",
  "price": 50.00,
  "duration": 60
}
```

### 2. BUSINESS asigna servicio a especialista (sin personalización)
```http
POST /api/specialists/juan-id/services?businessId=biz-123
{
  "serviceId": "service-123"
}
```
Juan ofrecerá el servicio a **$50** (precio base)

### 3. BUSINESS asigna servicio a especialista senior (con precio personalizado)
```http
POST /api/specialists/maria-id/services?businessId=biz-123
{
  "serviceId": "service-123",
  "customPrice": 85.00,
  "skillLevel": "SENIOR"
}
```
María ofrecerá el servicio a **$85**

### 4. Cliente agenda con María
```http
POST /api/appointments
{
  "specialistId": "maria-id",
  "serviceId": "service-123",
  ...
}
```
El sistema busca el precio:
```javascript
const specialistService = await SpecialistService.findOne({
  where: { specialistId: 'maria-id', serviceId: 'service-123' }
});

const finalPrice = specialistService.customPrice || service.price;
// finalPrice = 85.00
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] 1. Crear `SpecialistService.js` modelo
- [ ] 2. Agregar asociaciones en `models/index.js`
- [ ] 3. Crear migración
- [ ] 4. Ejecutar migración: `npx sequelize-cli db:migrate`
- [ ] 5. Crear `SpecialistServiceController.js`
- [ ] 6. Crear rutas `routes/specialistServices.js`
- [ ] 7. Registrar rutas en `server.js`
- [ ] 8. Actualizar `AppointmentController.createAppointment` para usar precio final
- [ ] 9. Crear endpoint público para ver especialistas con precios
- [ ] 10. Actualizar frontend para mostrar precio base vs personalizado

---

## 🎯 VENTAJAS DE ESTA SOLUCIÓN

1. ✅ **Precio base del negocio**: BUSINESS define precio estándar
2. ✅ **Precios personalizados**: Especialistas pueden tener su propio precio
3. ✅ **Opcional**: Si no hay customPrice, usa precio base
4. ✅ **Flexible**: También permite duración personalizada
5. ✅ **Escalable**: Campo skillLevel para diferenciar niveles
6. ✅ **Granular**: Cada especialista elige qué servicios ofrecer
7. ✅ **Auditable**: Timestamps automáticos
8. ✅ **UI friendly**: Campo displayOrder para ordenar servicios

---

¿Quieres que implemente esto en tu código ahora?
