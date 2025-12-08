# 📋 Propuesta: Servicios (Procedimientos) y Especialistas

## 🎯 Problemas Identificados

### 1. **Comisiones en Servicios**
**Problema Actual**: 
- El modelo `Service` tiene un campo `commission` (JSONB) hardcodeado
- Existe una regla de negocio que pregunta "¿En tu negocio se manejan comisiones?"
- Si el negocio dice "NO aplican comisiones", el campo `commission` del servicio se vuelve irrelevante
- Si dice "SÍ aplican", puede ser:
  - **Comisión general** (mismo % para todos los servicios)
  - **Comisión por servicio** (cada servicio tiene su propio %)

**Consecuencia**: El modelo actual NO respeta la regla de negocio.

---

### 2. **Consentimientos (Consent Templates)**
**Problema Actual**:
- El modelo `Service` tiene un campo `consentTemplate` (TEXT)
- Cada servicio almacena su propio template de consentimiento
- No hay reutilización: si 10 servicios usan el mismo consentimiento, se duplica 10 veces
- No hay versionamiento: si cambias el template, no sabes qué clientes firmaron qué versión

**Consecuencia**: Falta de eficiencia, trazabilidad y cumplimiento legal.

---

## ✅ Solución Propuesta

### **PARTE 1: Sistema de Comisiones Respetando Reglas de Negocio**

#### 1.1 Crear Regla de Negocio para Comisiones

```javascript
// En seed-rule-templates.js - Agregar esta regla

{
  key: 'COMISIONES_HABILITADAS',
  type: 'BOOLEAN',
  defaultValue: true,
  description: '¿En tu negocio se manejan comisiones para especialistas?',
  category: 'SERVICE_POLICY',
  allowCustomization: true,
  version: '1.0.0',
  requiredModule: null, // Aplica a todos
  examples: {
    values: [true, false],
    descriptions: ['Negocio con comisiones', 'Negocio sin comisiones (empleados con salario fijo)']
  }
},
{
  key: 'COMISIONES_TIPO_CALCULO',
  type: 'STRING',
  defaultValue: 'POR_SERVICIO',
  description: 'Tipo de cálculo de comisiones',
  category: 'SERVICE_POLICY',
  allowCustomization: true,
  version: '1.0.0',
  requiredModule: null,
  dependsOn: {
    key: 'COMISIONES_HABILITADAS',
    value: true
  },
  validationRules: {
    enum: ['GENERAL', 'POR_SERVICIO', 'MIXTO']
  },
  examples: {
    values: ['GENERAL', 'POR_SERVICIO', 'MIXTO'],
    descriptions: [
      'Mismo % para todos los servicios',
      'Cada servicio tiene su propio %',
      'Algunos servicios usan % general, otros personalizados'
    ]
  }
},
{
  key: 'COMISIONES_PORCENTAJE_GENERAL',
  type: 'NUMBER',
  defaultValue: 50,
  description: 'Porcentaje de comisión general para especialistas',
  category: 'SERVICE_POLICY',
  allowCustomization: true,
  version: '1.0.0',
  requiredModule: null,
  dependsOn: {
    key: 'COMISIONES_TIPO_CALCULO',
    value: ['GENERAL', 'MIXTO']
  },
  validationRules: {
    min: 0,
    max: 100,
    type: 'decimal',
    step: 0.5
  },
  examples: {
    values: [30, 40, 50, 60, 70],
    descriptions: ['30% especialista', '40% especialista', '50/50', '60% especialista', '70% especialista']
  }
}
```

---

#### 1.2 Modificar Modelo `Service` para Respetar Reglas

**Opción A: Mantener campo `commission` pero hacerlo condicional**

```javascript
// En Service.js modelo
commission: {
  type: DataTypes.JSONB,
  allowNull: true,
  defaultValue: null, // ❌ ANTES: defaultValue con valores hardcodeados
  comment: 'Configuración de comisión específica del servicio. NULL = usar comisión general del negocio'
}
```

**Lógica en el Backend**:
```javascript
// En ServiceController.js - Al crear/editar servicio

static async createService(req, res) {
  const { businessId } = req.params;
  const serviceData = req.body;
  
  // 1. Obtener reglas del negocio
  const businessRules = await BusinessRulesService.getBusinessEffectiveRules(businessId);
  
  const comisionesHabilitadas = businessRules.find(r => r.template.key === 'COMISIONES_HABILITADAS');
  const tipoCalculo = businessRules.find(r => r.template.key === 'COMISIONES_TIPO_CALCULO');
  const porcentajeGeneral = businessRules.find(r => r.template.key === 'COMISIONES_PORCENTAJE_GENERAL');
  
  // 2. Validar según reglas
  if (!comisionesHabilitadas?.customValue && !comisionesHabilitadas?.template?.defaultValue) {
    // El negocio NO maneja comisiones -> forzar commission = null
    serviceData.commission = null;
  } else {
    // El negocio SÍ maneja comisiones
    const tipoCalculoValue = tipoCalculo?.customValue || tipoCalculo?.template?.defaultValue;
    
    if (tipoCalculoValue === 'GENERAL') {
      // Comisión general -> usar valor de la regla, ignorar input del usuario
      const porcentaje = porcentajeGeneral?.customValue || porcentajeGeneral?.template?.defaultValue || 50;
      serviceData.commission = {
        type: 'PERCENTAGE',
        value: 0,
        specialistPercentage: porcentaje,
        businessPercentage: 100 - porcentaje,
        source: 'GENERAL_RULE' // Identificador de que viene de regla
      };
    } else if (tipoCalculoValue === 'POR_SERVICIO') {
      // Comisión por servicio -> permitir personalización
      if (!serviceData.commission) {
        return res.status(400).json({
          error: 'Debes especificar la comisión para este servicio',
          message: 'Tu negocio usa comisiones por servicio'
        });
      }
      // Validar que tenga estructura correcta
      if (!serviceData.commission.specialistPercentage || 
          serviceData.commission.specialistPercentage < 0 || 
          serviceData.commission.specialistPercentage > 100) {
        return res.status(400).json({
          error: 'Porcentaje de comisión inválido'
        });
      }
      serviceData.commission.source = 'SERVICE_SPECIFIC';
    } else if (tipoCalculoValue === 'MIXTO') {
      // Mixto -> si no especifica, usar general
      if (!serviceData.commission) {
        const porcentaje = porcentajeGeneral?.customValue || porcentajeGeneral?.template?.defaultValue || 50;
        serviceData.commission = {
          type: 'PERCENTAGE',
          value: 0,
          specialistPercentage: porcentaje,
          businessPercentage: 100 - porcentaje,
          source: 'GENERAL_RULE'
        };
      } else {
        serviceData.commission.source = 'SERVICE_SPECIFIC';
      }
    }
  }
  
  // 3. Crear servicio con commission ya procesado
  const service = await Service.create(serviceData);
  return res.status(201).json(service);
}
```

---

**Opción B: Modelo más limpio con tabla separada (RECOMENDADO)**

```sql
-- Nueva tabla: business_commission_config
CREATE TABLE business_commission_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  businessId UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Configuración general
  commissionsEnabled BOOLEAN NOT NULL DEFAULT true,
  calculationType VARCHAR(20) NOT NULL DEFAULT 'POR_SERVICIO' 
    CHECK (calculationType IN ('GENERAL', 'POR_SERVICIO', 'MIXTO')),
  generalPercentage DECIMAL(5,2) DEFAULT 50.00,
  
  -- Metadatos
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(businessId)
);

-- Tabla de comisiones por servicio (solo si aplica)
CREATE TABLE service_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serviceId UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  
  type VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE' 
    CHECK (type IN ('PERCENTAGE', 'FIXED')),
  specialistPercentage DECIMAL(5,2) DEFAULT 50.00,
  businessPercentage DECIMAL(5,2) DEFAULT 50.00,
  fixedAmount DECIMAL(10,2) DEFAULT 0,
  
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(serviceId)
);
```

**Ventajas de esta opción**:
- ✅ Separación de responsabilidades
- ✅ Más fácil de mantener
- ✅ Más fácil de consultar comisiones globales
- ✅ Historial de cambios más claro
- ✅ `Service` ya no necesita campo `commission`

**Lógica simplificada**:
```javascript
// Al crear servicio
static async createService(req, res) {
  const { businessId } = req.params;
  const { commission, ...serviceData } = req.body;
  
  // 1. Crear servicio SIN commission
  const service = await Service.create(serviceData);
  
  // 2. Obtener config de comisiones del negocio
  const config = await BusinessCommissionConfig.findOne({ where: { businessId } });
  
  // 3. Si el negocio maneja comisiones Y es por servicio, guardar
  if (config?.commissionsEnabled && 
      (config.calculationType === 'POR_SERVICIO' || config.calculationType === 'MIXTO')) {
    if (commission) {
      await ServiceCommission.create({
        serviceId: service.id,
        ...commission
      });
    }
  }
  
  return res.status(201).json(service);
}

// Al calcular comisión para una cita
static async calculateCommission(serviceId, amount) {
  const service = await Service.findByPk(serviceId, {
    include: [{ model: Business, include: [BusinessCommissionConfig] }]
  });
  
  const config = service.Business.BusinessCommissionConfig;
  
  if (!config?.commissionsEnabled) {
    return {
      specialistAmount: 0,
      businessAmount: amount,
      type: 'NO_COMMISSION'
    };
  }
  
  let commissionData;
  
  if (config.calculationType === 'GENERAL') {
    // Usar comisión general
    commissionData = {
      specialistPercentage: config.generalPercentage,
      businessPercentage: 100 - config.generalPercentage
    };
  } else {
    // Buscar comisión específica del servicio
    const serviceCommission = await ServiceCommission.findOne({
      where: { serviceId }
    });
    
    if (serviceCommission) {
      commissionData = serviceCommission;
    } else {
      // Fallback a comisión general
      commissionData = {
        specialistPercentage: config.generalPercentage,
        businessPercentage: 100 - config.generalPercentage
      };
    }
  }
  
  const specialistAmount = (amount * commissionData.specialistPercentage) / 100;
  const businessAmount = amount - specialistAmount;
  
  return {
    specialistAmount,
    businessAmount,
    specialistPercentage: commissionData.specialistPercentage,
    businessPercentage: commissionData.businessPercentage
  };
}
```

---

### **PARTE 2: Sistema de Templates de Consentimiento**

#### 2.1 Crear Modelo `ConsentTemplate`

```javascript
// En src/models/ConsentTemplate.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConsentTemplate = sequelize.define('ConsentTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100]
    },
    comment: 'Nombre del template (ej: "Consentimiento Botox")'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Código único del template (ej: "CONSENT_BOTOX_V1")'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'HTML o texto del consentimiento'
  },
  version: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '1.0.0',
    comment: 'Versión del template para control de cambios'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Categoría del consentimiento (ej: ESTETICO, MEDICO, DEPILACION)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  requiredFields: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    comment: 'Campos adicionales requeridos (ej: ["edad", "alergias"])'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Metadatos adicionales (ej: idioma, autor, etc.)'
  }
}, {
  tableName: 'consent_templates',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'code'],
      unique: true
    },
    {
      fields: ['businessId', 'isActive']
    },
    {
      fields: ['businessId', 'category']
    }
  ]
});

module.exports = ConsentTemplate;
```

---

#### 2.2 Crear Modelo `ConsentSignature` (Firmas de Clientes)

```javascript
// En src/models/ConsentSignature.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConsentSignature = sequelize.define('ConsentSignature', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'businesses',
      key: 'id'
    }
  },
  consentTemplateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'consent_templates',
      key: 'id'
    },
    comment: 'Template que fue firmado'
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    },
    comment: 'Cita asociada (si aplica)'
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'services',
      key: 'id'
    },
    comment: 'Servicio asociado'
  },
  
  // Snapshot del template al momento de firmar
  templateVersion: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'Versión del template cuando fue firmado'
  },
  templateContent: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Copia del contenido exacto que firmó el cliente'
  },
  
  // Datos de la firma
  signatureData: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Firma digital en base64 o path a imagen'
  },
  signatureType: {
    type: DataTypes.ENUM('DIGITAL', 'UPLOADED', 'TYPED'),
    allowNull: false,
    defaultValue: 'DIGITAL'
  },
  signedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  signedBy: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre completo de quien firmó'
  },
  
  // Datos adicionales del cliente
  additionalData: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Respuestas a campos requeridos (edad, alergias, etc.)'
  },
  
  // Metadatos de trazabilidad
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Coordenadas GPS si está disponible'
  },
  
  // Estado
  status: {
    type: DataTypes.ENUM('ACTIVE', 'REVOKED', 'EXPIRED'),
    allowNull: false,
    defaultValue: 'ACTIVE'
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  revokedReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'consent_signatures',
  timestamps: true,
  indexes: [
    {
      fields: ['businessId', 'customerId']
    },
    {
      fields: ['consentTemplateId']
    },
    {
      fields: ['appointmentId']
    },
    {
      fields: ['serviceId']
    },
    {
      fields: ['signedAt']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = ConsentSignature;
```

---

#### 2.3 Modificar Modelo `Service`

```javascript
// En Service.js - REMOVER campos viejos

// ❌ ANTES:
consentTemplate: {
  type: DataTypes.TEXT,
  allowNull: true
},

// ✅ AHORA: Solo referencia
consentTemplateId: {
  type: DataTypes.UUID,
  allowNull: true,
  references: {
    model: 'consent_templates',
    key: 'id'
  },
  comment: 'Template de consentimiento por defecto para este servicio'
},
requiresConsent: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false
}
```

---

#### 2.4 Relaciones en Modelos

```javascript
// En index.js de modelos

// ConsentTemplate
ConsentTemplate.hasMany(Service, {
  foreignKey: 'consentTemplateId',
  as: 'services'
});

ConsentTemplate.hasMany(ConsentSignature, {
  foreignKey: 'consentTemplateId',
  as: 'signatures'
});

// Service
Service.belongsTo(ConsentTemplate, {
  foreignKey: 'consentTemplateId',
  as: 'consentTemplate'
});

// ConsentSignature
ConsentSignature.belongsTo(ConsentTemplate, {
  foreignKey: 'consentTemplateId',
  as: 'template'
});

ConsentSignature.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer'
});

ConsentSignature.belongsTo(Service, {
  foreignKey: 'serviceId',
  as: 'service'
});

ConsentSignature.belongsTo(Appointment, {
  foreignKey: 'appointmentId',
  as: 'appointment'
});
```

---

#### 2.5 API Endpoints para Consentimientos

```javascript
// En src/routes/consents.js

const router = require('express').Router();
const ConsentController = require('../controllers/ConsentController');
const { auth, businessAndOwner } = require('../middleware/auth');

// Templates de consentimiento
router.get('/business/:businessId/consent-templates', 
  auth, businessAndOwner, ConsentController.getTemplates);

router.post('/business/:businessId/consent-templates', 
  auth, businessAndOwner, ConsentController.createTemplate);

router.put('/business/:businessId/consent-templates/:templateId', 
  auth, businessAndOwner, ConsentController.updateTemplate);

router.delete('/business/:businessId/consent-templates/:templateId', 
  auth, businessAndOwner, ConsentController.deleteTemplate);

// Firmas de consentimiento
router.post('/business/:businessId/consent-signatures', 
  auth, ConsentController.signConsent);

router.get('/business/:businessId/consent-signatures/customer/:customerId', 
  auth, businessAndOwner, ConsentController.getCustomerSignatures);

router.get('/business/:businessId/consent-signatures/:signatureId', 
  auth, businessAndOwner, ConsentController.getSignatureDetails);

router.post('/business/:businessId/consent-signatures/:signatureId/revoke', 
  auth, businessAndOwner, ConsentController.revokeSignature);

module.exports = router;
```

---

#### 2.6 Controller de Ejemplo

```javascript
// En src/controllers/ConsentController.js

const { ConsentTemplate, ConsentSignature, Customer, Service } = require('../models');

class ConsentController {
  /**
   * Obtener templates de consentimiento del negocio
   */
  static async getTemplates(req, res) {
    try {
      const { businessId } = req.params;
      const { category, activeOnly = true } = req.query;
      
      const where = { businessId };
      if (activeOnly === 'true') where.isActive = true;
      if (category) where.category = category;
      
      const templates = await ConsentTemplate.findAll({
        where,
        order: [['category', 'ASC'], ['name', 'ASC']]
      });
      
      return res.json(templates);
    } catch (error) {
      console.error('Error al obtener templates:', error);
      return res.status(500).json({ message: 'Error al obtener templates de consentimiento' });
    }
  }
  
  /**
   * Crear template de consentimiento
   */
  static async createTemplate(req, res) {
    try {
      const { businessId } = req.params;
      const { name, code, content, category, requiredFields } = req.body;
      
      // Validar que el código sea único
      const existing = await ConsentTemplate.findOne({
        where: { businessId, code }
      });
      
      if (existing) {
        return res.status(400).json({
          message: 'Ya existe un template con ese código'
        });
      }
      
      const template = await ConsentTemplate.create({
        businessId,
        name,
        code,
        content,
        category,
        requiredFields,
        version: '1.0.0'
      });
      
      return res.status(201).json(template);
    } catch (error) {
      console.error('Error al crear template:', error);
      return res.status(500).json({ message: 'Error al crear template de consentimiento' });
    }
  }
  
  /**
   * Firmar consentimiento
   */
  static async signConsent(req, res) {
    try {
      const { businessId } = req.params;
      const {
        consentTemplateId,
        customerId,
        appointmentId,
        serviceId,
        signatureData,
        signatureType,
        signedBy,
        additionalData,
        ipAddress,
        userAgent
      } = req.body;
      
      // Obtener template actual
      const template = await ConsentTemplate.findByPk(consentTemplateId);
      
      if (!template) {
        return res.status(404).json({ message: 'Template no encontrado' });
      }
      
      if (!template.isActive) {
        return res.status(400).json({ message: 'Template inactivo' });
      }
      
      // Crear firma con snapshot del template
      const signature = await ConsentSignature.create({
        businessId,
        consentTemplateId,
        customerId,
        appointmentId,
        serviceId,
        templateVersion: template.version,
        templateContent: template.content, // Snapshot
        signatureData,
        signatureType: signatureType || 'DIGITAL',
        signedAt: new Date(),
        signedBy,
        additionalData,
        ipAddress,
        userAgent,
        status: 'ACTIVE'
      });
      
      return res.status(201).json(signature);
    } catch (error) {
      console.error('Error al firmar consentimiento:', error);
      return res.status(500).json({ message: 'Error al firmar consentimiento' });
    }
  }
  
  /**
   * Obtener firmas de un cliente
   */
  static async getCustomerSignatures(req, res) {
    try {
      const { businessId, customerId } = req.params;
      const { status = 'ACTIVE' } = req.query;
      
      const where = { businessId, customerId };
      if (status) where.status = status;
      
      const signatures = await ConsentSignature.findAll({
        where,
        include: [
          {
            model: ConsentTemplate,
            as: 'template',
            attributes: ['id', 'name', 'category', 'version']
          },
          {
            model: Service,
            as: 'service',
            attributes: ['id', 'name']
          }
        ],
        order: [['signedAt', 'DESC']]
      });
      
      return res.json(signatures);
    } catch (error) {
      console.error('Error al obtener firmas:', error);
      return res.status(500).json({ message: 'Error al obtener firmas' });
    }
  }
  
  /**
   * Revocar firma
   */
  static async revokeSignature(req, res) {
    try {
      const { signatureId } = req.params;
      const { reason } = req.body;
      
      const signature = await ConsentSignature.findByPk(signatureId);
      
      if (!signature) {
        return res.status(404).json({ message: 'Firma no encontrada' });
      }
      
      await signature.update({
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedReason: reason
      });
      
      return res.json({ message: 'Firma revocada exitosamente', signature });
    } catch (error) {
      console.error('Error al revocar firma:', error);
      return res.status(500).json({ message: 'Error al revocar firma' });
    }
  }
}

module.exports = ConsentController;
```

---

## 🎯 Flujo Completo de Uso

### **Flujo 1: Crear Servicio con Comisión**

```javascript
// 1. Negocio configura reglas (una sola vez)
POST /api/business/rules/assign
{
  "templateKey": "COMISIONES_HABILITADAS",
  "customValue": true
}

POST /api/business/rules/assign
{
  "templateKey": "COMISIONES_TIPO_CALCULO",
  "customValue": "POR_SERVICIO"
}

// 2. Owner crea servicio
POST /api/business/123/services
{
  "name": "Botox Frontal",
  "price": 200000,
  "duration": 60,
  "requiresConsent": true,
  "consentTemplateId": "template-uuid-123", // Referencia al template
  "commission": {
    "specialistPercentage": 60,
    "businessPercentage": 40
  }
}

// Backend valida según reglas:
// - Si COMISIONES_HABILITADAS = false -> commission = null
// - Si COMISIONES_TIPO_CALCULO = "GENERAL" -> usa % de regla, ignora input
// - Si COMISIONES_TIPO_CALCULO = "POR_SERVICIO" -> valida y guarda input
```

---

### **Flujo 2: Cliente Firma Consentimiento**

```javascript
// 1. Cliente agenda cita para "Botox Frontal"
POST /api/business/123/appointments
{
  "customerId": "client-uuid",
  "serviceId": "service-botox-uuid",
  "specialistId": "specialist-uuid",
  "date": "2025-10-20",
  "time": "10:00"
}

// 2. Al llegar a la cita, se muestra el consentimiento
GET /api/business/123/services/service-botox-uuid
// Response incluye: consentTemplateId

GET /api/business/123/consent-templates/template-uuid-123
// Response: { name, content, version, requiredFields }

// 3. Cliente lee y firma
POST /api/business/123/consent-signatures
{
  "consentTemplateId": "template-uuid-123",
  "customerId": "client-uuid",
  "appointmentId": "appointment-uuid",
  "serviceId": "service-botox-uuid",
  "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "signatureType": "DIGITAL",
  "signedBy": "María García",
  "additionalData": {
    "edad": 35,
    "alergias": "Ninguna",
    "medicamentos": "Ibuprofeno"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}

// Backend guarda:
// - Referencia al template
// - Snapshot del contenido (templateContent)
// - Versión actual (templateVersion)
// - Firma digital
// - Metadata de trazabilidad
```

---

### **Flujo 3: Cálculo de Comisión al Finalizar Cita**

```javascript
// Al marcar cita como completada
PATCH /api/business/123/appointments/appointment-uuid/complete

// Backend:
1. Obtiene servicio y su precio
2. Consulta config de comisiones del negocio
3. Calcula según reglas:
   - Si COMISIONES_HABILITADAS = false -> 100% para negocio
   - Si tipo = "GENERAL" -> usa % de regla global
   - Si tipo = "POR_SERVICIO" -> busca commission del servicio
4. Guarda en CommissionDetail
5. Notifica al especialista
```

---

## 📊 Comparación: Antes vs Después

### **Comisiones**

| Aspecto | ❌ ANTES | ✅ DESPUÉS |
|---------|---------|-----------|
| Respeta reglas | No | Sí |
| Flexibilidad | Baja (hardcoded) | Alta (basado en reglas) |
| Consistencia | Manual | Automática |
| Facilidad de cambio | Difícil (editar cada servicio) | Fácil (cambiar regla) |
| Validación | No | Sí (backend valida) |

### **Consentimientos**

| Aspecto | ❌ ANTES | ✅ DESPUÉS |
|---------|---------|-----------|
| Reutilización | No (duplicado) | Sí (templates) |
| Versionamiento | No | Sí |
| Trazabilidad | No | Sí (snapshot + metadata) |
| Cumplimiento legal | Débil | Fuerte |
| Tamaño DB | Grande (duplicado) | Pequeño (referencia) |
| Búsqueda | Difícil | Fácil (tabla dedicada) |

---

## 🚀 Plan de Implementación

### **Fase 1: Reglas de Comisiones** (2-3 días)
1. ✅ Agregar reglas a `seed-rule-templates.js`
2. ✅ Ejecutar seed de reglas
3. ✅ Modificar `ServiceController` para validar según reglas
4. ✅ Actualizar frontend para mostrar/ocultar campos según reglas
5. ✅ Testing

### **Fase 2: Templates de Consentimiento** (3-4 días)
1. ✅ Crear modelos `ConsentTemplate` y `ConsentSignature`
2. ✅ Crear migration tables
3. ✅ Agregar relaciones en modelos
4. ✅ Implementar `ConsentController`
5. ✅ Crear rutas `/consent-templates` y `/consent-signatures`
6. ✅ Frontend para gestionar templates
7. ✅ Frontend para firmar consentimientos
8. ✅ Testing

### **Fase 3: Migración de Datos** (1-2 días)
1. ✅ Script para migrar `service.commission` existentes
2. ✅ Script para extraer `service.consentTemplate` a templates
3. ✅ Verificación de integridad
4. ✅ Backup pre-migración

---

## 🎓 Preguntas para Decidir

1. **¿Prefieres Opción A (mantener campo commission) u Opción B (tabla separada)?**
   - Recomiendo: **Opción B** por limpieza y escalabilidad

2. **¿Quieres migrar datos existentes o empezar de cero?**
   - Si ya tienes servicios en producción: migración
   - Si es nuevo: empezar limpio

3. **¿Necesitas que los consentimientos sean multilevel (business owner + owner platform)?**
   - Si sí: agregar campo `ownerId` en `ConsentTemplate` para templates globales

4. **¿Los especialistas también necesitan firmar algo (contrato, comisiones)?**
   - Si sí: reutilizar el mismo sistema de `ConsentTemplate`

---

## 📝 Notas Finales

- **Comisiones**: La solución con reglas de negocio hace que el sistema sea **auto-consistente**
- **Consentimientos**: El sistema de templates + firmas es **legal-proof** y escalable
- **Ambos** siguen el patrón de **separación de responsabilidades**
- **Testing** es crítico para validar todas las combinaciones de reglas

---

¿Quieres que implementemos esto? ¿Tienes alguna duda o preferencia sobre las opciones propuestas?
