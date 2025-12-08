# Filtrado de Reglas por Módulos del Plan

## 🎯 Objetivo

Implementar un sistema de filtrado inteligente que muestre solo las reglas de negocio disponibles según los módulos incluidos en el plan de suscripción activo del negocio.

## 📋 Resumen de Cambios

### 1. Modelo de Datos

**Archivo**: `packages/backend/src/models/RuleTemplate.js`

**Cambio Agregado**:
```javascript
requiredModule: {
  type: DataTypes.STRING(100),
  allowNull: true,
  comment: 'Nombre del módulo requerido para usar esta regla (ej: facturacion_electronica, gestion_de_turnos)'
}
```

**Tabla en DB**: `rule_templates.required_module`

### 2. Seed de Reglas

**Archivo**: `packages/backend/scripts/seed-rule-templates.js`

**Reglas Actualizadas**:

#### Reglas de Facturación (requieren `facturacion_electronica`)
- `FACTURA_GENERACION_AUTOMATICA`
- `FACTURA_PLAZO_PAGO_DIAS`
- `FACTURA_INCLUIR_IVA`
- `FACTURA_PORCENTAJE_IVA`
- `FACTURA_RECARGO_MORA`
- `FACTURA_ENVIAR_EMAIL`
- `FACTURA_REQUIERE_FIRMA`
- `FACTURA_FORMATO_NUMERACION`

#### Reglas de Citas (requieren `gestion_de_turnos`)
- `CITAS_DIAS_ANTICIPACION_MAXIMA`
- `CITAS_HORAS_ANTICIPACION_MINIMA`
- `CITAS_HORAS_CANCELACION`
- `CITAS_MAXIMAS_POR_DIA`
- `CITAS_RECORDATORIOS_ACTIVADOS`
- `CITAS_HORAS_RECORDATORIO`
- `CITAS_PERMITIR_SIMULTANEAS`
- `CITAS_TIEMPO_LIBRE_ENTRE_CITAS`

#### Reglas Generales (sin módulo requerido - siempre disponibles)
- `NEGOCIO_HORA_APERTURA`
- `NEGOCIO_HORA_CIERRE`
- `PAGO_ACEPTAR_EFECTIVO`
- `PAGO_ACEPTAR_TARJETA`
- `ESPECIALISTA_USAR_COMISIONES`
- `ESPECIALISTA_PORCENTAJE_COMISION`
- `DEVOLUCION_PERMITIR`
- `DEVOLUCION_PLAZO_DIAS`

### 3. Servicio de Reglas

**Archivo**: `packages/backend/src/services/BusinessRulesService.js`

**Método Actualizado**: `getAvailableRuleTemplates()`

**Lógica de Filtrado**:
```javascript
1. Obtener todas las reglas activas
2. Si hay businessId:
   a. Buscar suscripción activa del negocio
   b. Obtener módulos incluidos en el plan
   c. Filtrar reglas:
      - Incluir reglas SIN requiredModule (siempre disponibles)
      - Incluir reglas CON requiredModule SI el módulo está en el plan
3. Devolver reglas filtradas
```

**Imports Agregados**:
```javascript
const Business = require('../models/Business');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const PlanModule = require('../models/PlanModule');
const Module = require('../models/Module');
```

### 4. Controlador

**Archivo**: `packages/backend/src/controllers/BusinessRulesController.js`

**Método Actualizado**: `getRuleTemplates()`

**Cambio**:
```javascript
// ANTES
const templates = await BusinessRulesService.getAvailableRuleTemplates({ category });

// DESPUÉS
const businessId = req.user?.business?.businessId || req.user?.business?.id || req.user?.businessId || req.business?.id;

const templates = await BusinessRulesService.getAvailableRuleTemplates({ 
  category,
  businessId // Para filtrar por módulos del plan
});
```

## 🔄 Flujo de Funcionamiento

### Escenario 1: Negocio con Plan Básico (sin facturacion_electronica)

**Módulos del plan**: 
- ✅ `gestion_de_turnos`

**Reglas visibles en modal**:
- ✅ Todas las reglas de CITAS (8 reglas)
- ✅ Todas las reglas generales (8 reglas)
- ❌ Reglas de FACTURA (0 reglas) - **OCULTAS**

**Total**: 16 reglas disponibles

### Escenario 2: Negocio con Plan Premium (con todos los módulos)

**Módulos del plan**:
- ✅ `gestion_de_turnos`
- ✅ `facturacion_electronica`

**Reglas visibles en modal**:
- ✅ Todas las reglas de CITAS (8 reglas)
- ✅ Todas las reglas de FACTURA (8 reglas)
- ✅ Todas las reglas generales (8 reglas)

**Total**: 24 reglas disponibles

### Escenario 3: Negocio sin suscripción activa

**Reglas visibles en modal**:
- ✅ Solo reglas generales (8 reglas)
- ❌ Reglas de CITAS - **OCULTAS**
- ❌ Reglas de FACTURA - **OCULTAS**

**Total**: 8 reglas disponibles (políticas básicas)

## 📊 Ejemplo de Datos

### Tabla: rule_templates

| key | required_module | category |
|-----|-----------------|----------|
| CITAS_DIAS_ANTICIPACION_MAXIMA | gestion_de_turnos | BOOKING_POLICY |
| FACTURA_GENERACION_AUTOMATICA | facturacion_electronica | SERVICE_POLICY |
| ESPECIALISTA_USAR_COMISIONES | NULL | PAYMENT_POLICY |

### Consulta SQL para verificar

```sql
-- Ver distribución de reglas por módulo
SELECT 
  required_module,
  COUNT(*) as total_reglas,
  array_agg(key) as reglas
FROM rule_templates
GROUP BY required_module
ORDER BY required_module NULLS FIRST;

-- Resultado esperado:
-- required_module       | total_reglas | reglas
-- ----------------------|--------------|--------
-- NULL                  | 8            | {NEGOCIO_HORA_APERTURA, ...}
-- facturacion_electronica| 8           | {FACTURA_GENERACION_AUTOMATICA, ...}
-- gestion_de_turnos     | 8            | {CITAS_DIAS_ANTICIPACION_MAXIMA, ...}
```

## 🚀 Pruebas

### Test 1: Plan sin facturacion_electronica

```bash
# 1. Crear negocio con plan básico
POST /api/subscriptions/create
{
  "businessId": "...",
  "planId": "basic-plan-id" // Solo incluye gestion_de_turnos
}

# 2. Obtener reglas disponibles
GET /api/business/rules

# 3. Verificar que NO aparecen reglas de FACTURA
# Resultado esperado: solo reglas de CITAS y GENERAL
```

### Test 2: Upgrade a plan Premium

```bash
# 1. Hacer upgrade del plan
PUT /api/subscriptions/{subscriptionId}/upgrade
{
  "newPlanId": "premium-plan-id" // Incluye facturacion_electronica
}

# 2. Obtener reglas disponibles
GET /api/business/rules

# 3. Verificar que AHORA SÍ aparecen reglas de FACTURA
# Resultado esperado: reglas de CITAS + FACTURA + GENERAL
```

## 📝 Ventajas del Sistema

### 1. **Experiencia de Usuario Mejorada**
- ✅ No muestra opciones que no puede usar
- ✅ Evita confusión con funciones no disponibles
- ✅ UI más limpia y relevante

### 2. **Upselling Natural**
- 💡 Usuario ve que faltan reglas → Incentivo para upgrade
- 💡 Puede agregar mensaje: "Actualiza tu plan para configurar facturación"

### 3. **Mantenimiento Simplificado**
- 🔧 Solo agregar `requiredModule` al crear nueva regla
- 🔧 No requiere cambios en frontend
- 🔧 Filtrado automático en backend

### 4. **Escalabilidad**
- 📈 Fácil agregar nuevos módulos y reglas
- 📈 Lógica centralizada en el servicio
- 📈 Compatible con planes personalizados

## 🔮 Mejoras Futuras

### 1. Mensajes en UI

**Frontend**: `packages/web-app/src/components/BusinessRuleModal.jsx`

Agregar indicador cuando hay reglas ocultas:

```jsx
{hiddenRulesCount > 0 && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <p className="text-sm text-blue-800">
      💡 Tu plan actual incluye {visibleRulesCount} reglas. 
      {hiddenRulesCount} reglas adicionales disponibles en planes superiores.
    </p>
    <button className="mt-2 text-blue-600 font-medium hover:text-blue-700">
      Ver Planes →
    </button>
  </div>
)}
```

### 2. Endpoint de Estadísticas

```javascript
// GET /api/business/rules/stats
{
  "available": 16,
  "hidden": 8,
  "missingModules": [
    {
      "name": "facturacion_electronica",
      "displayName": "Facturación Electrónica",
      "hiddenRulesCount": 8,
      "availableInPlans": ["Premium", "Enterprise"]
    }
  ]
}
```

### 3. Filtrado Avanzado

Agregar más criterios de filtrado:
- Por tipo de negocio (salón de belleza vs barbería)
- Por ubicación geográfica (reglas específicas de Colombia)
- Por antigüedad del negocio (reglas para nuevos vs establecidos)

## 📚 Archivos Modificados

1. ✅ `packages/backend/src/models/RuleTemplate.js`
2. ✅ `packages/backend/src/services/BusinessRulesService.js`
3. ✅ `packages/backend/src/controllers/BusinessRulesController.js`
4. ✅ `packages/backend/scripts/seed-rule-templates.js`
5. ✅ `packages/backend/migrations/add-required-module-to-rules.sql`

## 🎯 Estado Actual

✅ **Modelo actualizado** - Campo `requiredModule` agregado
✅ **Reglas seedeadas** - 24 reglas con módulos asignados
✅ **Lógica de filtrado** - Implementada en servicio
✅ **Controlador actualizado** - Pasa businessId para filtrar
✅ **Base de datos** - Columna agregada y datos actualizados

⏳ **Pendiente de prueba**: Reiniciar backend y probar en UI

---

**Última actualización**: ${new Date().toLocaleDateString('es-ES')}  
**Implementado por**: Beauty Control Team
