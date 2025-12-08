# 🔄 Actualización de RuleTemplates - Sistema de Validaciones

## 📋 Resumen de Cambios

Se actualizaron los archivos existentes para integrar las **nuevas reglas de validación** implementadas en el `BusinessRuleService`.

---

## 📦 Archivos Modificados

### 1. **seed-rule-templates.js** ✅

**Ubicación:** `packages/backend/scripts/seed-rule-templates.js`

**Cambios realizados:**
- ✅ Agregadas **10 nuevas reglas** para validaciones de completar citas
- ✅ Organizadas en nueva sección: "VALIDACIONES DE COMPLETAR CITAS (BusinessRuleService)"

**Nuevas reglas agregadas:**

| Key | Type | Default | Descripción |
|-----|------|---------|-------------|
| `REQUIRE_CONSENT_FOR_COMPLETION` | BOOLEAN | false | Consentimiento obligatorio para completar |
| `REQUIRE_BEFORE_PHOTO` | BOOLEAN | false | Foto "antes" obligatoria |
| `REQUIRE_AFTER_PHOTO` | BOOLEAN | false | Foto "después" obligatoria |
| `REQUIRE_BOTH_PHOTOS` | BOOLEAN | false | Ambas fotos obligatorias |
| `REQUIRE_FULL_PAYMENT` | BOOLEAN | false | Pago completo obligatorio |
| `REQUIRE_MINIMUM_PAYMENT` | NUMBER | 50 | % mínimo de pago (0-100) |
| `MINIMUM_DURATION` | NUMBER | 30 | Duración mínima en minutos |
| `MAXIMUM_DURATION` | NUMBER | 240 | Duración máxima en minutos |
| `REQUIRE_CLIENT_SIGNATURE` | BOOLEAN | false | Firma adicional del cliente |
| `REQUIRE_CLIENT_FEEDBACK` | BOOLEAN | false | Feedback obligatorio |

---

### 2. **RuleTemplate.js** ✅

**Ubicación:** `packages/backend/src/models/RuleTemplate.js`

**Cambios realizados:**
- ✅ Agregadas 3 nuevas categorías al ENUM de `category`:
  - `APPOINTMENT` - Validaciones de completar citas
  - `PAYMENT` - Validaciones de pago
  - `TIME` - Validaciones de duración

**Antes:**
```javascript
category: {
  type: DataTypes.ENUM(
    'PAYMENT_POLICY',
    'CANCELLATION_POLICY', 
    'BOOKING_POLICY',
    'WORKING_HOURS',
    'NOTIFICATION_POLICY',
    'REFUND_POLICY',
    'SERVICE_POLICY',
    'GENERAL'
  ),
```

**Después:**
```javascript
category: {
  type: DataTypes.ENUM(
    'PAYMENT_POLICY',
    'CANCELLATION_POLICY', 
    'BOOKING_POLICY',
    'WORKING_HOURS',
    'NOTIFICATION_POLICY',
    'REFUND_POLICY',
    'SERVICE_POLICY',
    'APPOINTMENT',        // 👈 Nueva
    'PAYMENT',            // 👈 Nueva
    'TIME',               // 👈 Nueva
    'GENERAL'
  ),
```

---

### 3. **BusinessRuleService.js** ✅

**Ubicación:** `packages/backend/src/services/BusinessRuleService.js`

**Cambios realizados:**
- ✅ Actualizado método `getActiveRules()` para usar campos correctos del modelo `RuleTemplate`

**Mapeo de campos corregido:**

| Antes | Después | Motivo |
|-------|---------|--------|
| `code` | `key` | El modelo usa `key` como identificador |
| `name` | `description` | El modelo usa `description` para el nombre |
| `valueType` | `type` | El modelo usa `type` para el tipo de dato |

**Código actualizado:**
```javascript
return rules.map(rule => ({
  id: rule.id,
  ruleCode: rule.ruleTemplate?.key,           // ✅ Corregido
  ruleName: rule.ruleTemplate?.description,    // ✅ Corregido
  category: rule.ruleTemplate?.category,
  value: rule.customValue || rule.ruleTemplate?.defaultValue,
  valueType: rule.ruleTemplate?.type,          // ✅ Corregido
  isActive: rule.isActive
}));
```

---

## 🚀 Pasos de Implementación

### 1. Ejecutar el Seed

```bash
cd packages/backend
node scripts/seed-rule-templates.js
```

**Resultado esperado:**
```
🌱 Iniciando seeding de plantillas de reglas...
✅ Conexión a la base de datos establecida
✅ Tabla rule_templates sincronizada
✅ Creada: REQUIRE_CONSENT_FOR_COMPLETION
✅ Creada: REQUIRE_BEFORE_PHOTO
✅ Creada: REQUIRE_AFTER_PHOTO
✅ Creada: REQUIRE_BOTH_PHOTOS
✅ Creada: REQUIRE_FULL_PAYMENT
✅ Creada: REQUIRE_MINIMUM_PAYMENT
✅ Creada: MINIMUM_DURATION
✅ Creada: MAXIMUM_DURATION
✅ Creada: REQUIRE_CLIENT_SIGNATURE
✅ Creada: REQUIRE_CLIENT_FEEDBACK

📊 Resumen del seeding:
✅ Creadas: 10
🔄 Actualizadas: 0
⚠️  Omitidas: 0
📈 Total procesadas: 10
🗄️  Total en base de datos: 35
🎉 Seeding completado exitosamente
```

---

### 2. Activar Reglas para un Negocio

**Ejemplo: Negocio con validaciones estrictas**

```sql
-- 1. Consentimiento obligatorio para completar citas
INSERT INTO business_rules (business_id, rule_template_id, is_active, notes)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000', -- UUID del negocio
  id,
  true,
  'Todos los procedimientos requieren consentimiento firmado'
FROM rule_templates WHERE key = 'REQUIRE_CONSENT_FOR_COMPLETION';

-- 2. Evidencia fotográfica obligatoria (antes y después)
INSERT INTO business_rules (business_id, rule_template_id, is_active, notes)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  id,
  true,
  'Control de calidad y respaldo legal'
FROM rule_templates WHERE key = 'REQUIRE_BOTH_PHOTOS';

-- 3. Pago mínimo del 30% (sobrescribir default de 50%)
INSERT INTO business_rules (business_id, rule_template_id, custom_value, is_active, notes)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  id,
  '30'::jsonb,  -- 👈 Valor personalizado (default es 50)
  true,
  'Permitir completar con 30% de anticipo'
FROM rule_templates WHERE key = 'REQUIRE_MINIMUM_PAYMENT';

-- 4. Duración mínima de 45 minutos (sobrescribir default de 30)
INSERT INTO business_rules (business_id, rule_template_id, custom_value, is_active, notes)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000',
  id,
  '45'::jsonb,  -- 👈 45 minutos
  true,
  'Procedimientos no deben ser apresurados'
FROM rule_templates WHERE key = 'MINIMUM_DURATION';
```

---

### 3. Verificar las Reglas Activas

```sql
-- Ver reglas activas de un negocio
SELECT 
  br.id,
  rt.key AS rule_key,
  rt.description,
  rt.category,
  rt.default_value AS template_default,
  br.custom_value AS business_custom,
  COALESCE(br.custom_value, rt.default_value) AS effective_value,
  br.is_active,
  br.notes
FROM business_rules br
INNER JOIN rule_templates rt ON br.rule_template_id = rt.id
WHERE br.business_id = '550e8400-e29b-41d4-a716-446655440000'
  AND br.is_active = true
ORDER BY rt.category, rt.key;
```

**Resultado esperado:**
```
| rule_key                      | description                    | effective_value |
|-------------------------------|--------------------------------|-----------------|
| REQUIRE_CONSENT_FOR_COMPLETION| Consentimiento obligatorio     | true            |
| REQUIRE_BOTH_PHOTOS           | Fotos antes y después          | true            |
| REQUIRE_MINIMUM_PAYMENT       | Pago mínimo obligatorio        | 30              |
| MINIMUM_DURATION              | Duración mínima                | 45              |
```

---

## 🧪 Testing

### Test 1: Completar Cita con Validaciones Activas

**Escenario:**
- Negocio tiene activadas las reglas:
  - `REQUIRE_CONSENT_FOR_COMPLETION = true`
  - `REQUIRE_BOTH_PHOTOS = true`
  - `REQUIRE_MINIMUM_PAYMENT = 30`

**Request:**
```bash
PATCH /api/appointments/uuid-cita/complete?businessId=uuid-negocio
Authorization: Bearer SPECIALIST_TOKEN
```

**Caso 1: Validaciones NO cumplidas**

Estado de la cita:
- `hasConsent = false` ❌
- `evidence.before.length = 0` ❌
- `evidence.after.length = 0` ❌
- `totalAmount = 100000`, `paidAmount = 20000` (20%) ❌

**Response: 400 Bad Request**
```json
{
  "success": false,
  "error": "No se puede completar la cita",
  "validationErrors": [
    "Esta cita requiere consentimiento informado firmado",
    "Se requiere foto \"antes\" del procedimiento",
    "Se requiere foto \"después\" del procedimiento",
    "Se requiere pago mínimo del 30% ($30,000). Pagado: $20,000"
  ]
}
```

**Caso 2: Validaciones CUMPLIDAS**

Estado de la cita:
- `hasConsent = true` ✅
- `evidence.before.length = 2` ✅
- `evidence.after.length = 2` ✅
- `totalAmount = 100000`, `paidAmount = 35000` (35%) ✅

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Cita completada exitosamente",
  "data": {
    "id": "uuid-cita",
    "status": "COMPLETED",
    "completedAt": "2025-10-15T14:30:00Z",
    "hasConsent": true,
    "evidence": {
      "before": ["/uploads/foto1.jpg", "/uploads/foto2.jpg"],
      "after": ["/uploads/foto3.jpg", "/uploads/foto4.jpg"]
    },
    "totalAmount": 100000,
    "paidAmount": 35000,
    "specialistCommission": 50000,
    "businessCommission": 50000
  }
}
```

---

## 📊 Estructura de Datos

### RuleTemplate (Plantilla Global)

```javascript
{
  id: "uuid",
  key: "REQUIRE_BOTH_PHOTOS",           // 👈 Identificador único
  type: "BOOLEAN",                      // 👈 Tipo de dato
  defaultValue: false,                  // 👈 Valor por defecto
  description: "Requiere fotos antes y después",
  category: "APPOINTMENT",              // 👈 Nueva categoría
  allowCustomization: true,
  version: "1.0.0",
  isActive: true,
  validationRules: null,
  examples: {
    values: [true, false],
    descriptions: ["Ambas fotos obligatorias", "Fotos opcionales"]
  }
}
```

### BusinessRule (Configuración por Negocio)

```javascript
{
  id: "uuid",
  businessId: "uuid-negocio",
  ruleTemplateId: "uuid-template",
  customValue: null,                    // 👈 null = usa defaultValue del template
  isActive: true,                       // 👈 Regla activa
  notes: "Control de calidad obligatorio"
}
```

### Valor Efectivo

```javascript
// Lógica del sistema:
const effectiveValue = businessRule.customValue || ruleTemplate.defaultValue;

// Ejemplo 1: Sin customValue
// Template: { key: "REQUIRE_BOTH_PHOTOS", defaultValue: false }
// BusinessRule: { customValue: null }
// → effectiveValue = false

// Ejemplo 2: Con customValue
// Template: { key: "REQUIRE_MINIMUM_PAYMENT", defaultValue: 50 }
// BusinessRule: { customValue: 30 }
// → effectiveValue = 30
```

---

## 🔍 Consultas Útiles

### Ver todas las reglas de validación disponibles

```sql
SELECT 
  key,
  description,
  category,
  type,
  default_value
FROM rule_templates
WHERE category IN ('APPOINTMENT', 'PAYMENT', 'TIME')
ORDER BY category, key;
```

### Ver configuración de un negocio específico

```sql
SELECT 
  rt.key,
  rt.description,
  br.custom_value,
  rt.default_value,
  COALESCE(br.custom_value, rt.default_value) AS effective_value,
  br.is_active,
  br.notes
FROM business_rules br
INNER JOIN rule_templates rt ON br.rule_template_id = rt.id
WHERE br.business_id = :businessId
  AND rt.category IN ('APPOINTMENT', 'PAYMENT', 'TIME')
ORDER BY rt.category, rt.key;
```

### Identificar citas que no cumplirían con las reglas

```sql
-- Citas que requieren consentimiento pero no lo tienen
SELECT 
  a.id,
  s.name AS service_name,
  c.first_name || ' ' || c.last_name AS client_name,
  a.status,
  a.has_consent
FROM appointments a
INNER JOIN services s ON a.service_id = s.id
INNER JOIN clients c ON a.client_id = c.id
WHERE a.business_id = :businessId
  AND a.status IN ('CONFIRMED', 'IN_PROGRESS')
  AND EXISTS (
    SELECT 1 FROM business_rules br
    INNER JOIN rule_templates rt ON br.rule_template_id = rt.id
    WHERE br.business_id = a.business_id
      AND rt.key = 'REQUIRE_CONSENT_FOR_COMPLETION'
      AND br.is_active = true
      AND COALESCE(br.custom_value, rt.default_value)::boolean = true
  )
  AND (a.has_consent = false OR a.has_consent IS NULL);
```

---

## ✅ Checklist de Implementación

- [x] Actualizar `seed-rule-templates.js` con nuevas reglas
- [x] Actualizar modelo `RuleTemplate.js` con nuevas categorías
- [x] Corregir `BusinessRuleService.js` para usar campos correctos
- [ ] Ejecutar seed: `node scripts/seed-rule-templates.js`
- [ ] Verificar que las 10 nuevas reglas se crearon correctamente
- [ ] Activar reglas para negocios de prueba
- [ ] Probar endpoint `PATCH /appointments/:id/complete` con validaciones
- [ ] Verificar mensajes de error específicos
- [ ] Documentar configuración recomendada por tipo de negocio

---

## 🎯 Próximos Pasos

1. **Migración de Producción:**
   - Crear migración para agregar categorías al ENUM
   - Ejecutar seed de templates
   - Documentar configuración por defecto

2. **UI/Frontend:**
   - Crear pantalla de configuración de reglas
   - Mostrar validaciones en tiempo real
   - Agregar tooltips explicativos

3. **Documentación:**
   - Manual de usuario para configuración de reglas
   - Videos tutoriales
   - FAQ de validaciones

---

## 📚 Referencias

- **Guía de Validaciones:** `APPOINTMENT_VALIDATION_GUIDE.md`
- **BusinessRuleService:** `src/services/BusinessRuleService.js`
- **Modelo RuleTemplate:** `src/models/RuleTemplate.js`
- **Modelo BusinessRule:** `src/models/BusinessRule.js`
- **Seed Script:** `scripts/seed-rule-templates.js`

---

**Estado:** ✅ ACTUALIZACIÓN COMPLETA
