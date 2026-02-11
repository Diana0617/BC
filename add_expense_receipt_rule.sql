-- =====================================================
-- REGLA: Comprobante Requerido en Gastos
-- =====================================================
-- Esta regla permite a los negocios configurar si los comprobantes
-- son obligatorios al registrar gastos.

-- Por defecto, los comprobantes serán opcionales (false)
-- pero cada negocio podrá personalizarlo según sus políticas.

INSERT INTO rule_templates (
  id,
  key,
  type,
  "defaultValue",
  description,
  category,
  "allowCustomization",
  version,
  "isActive",
  "validationRules",
  examples,
  required_module,
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'GASTOS_COMPROBANTE_REQUERIDO',
  'BOOLEAN',
  'false'::jsonb,
  'Define si es obligatorio adjuntar un comprobante (imagen o PDF) al registrar un gasto. Si está activo, el sistema no permitirá crear gastos sin comprobante.',
  'GENERAL',
  true,
  '1.0.0',
  true,
  '{
    "type": "boolean",
    "description": "true = comprobante obligatorio, false = comprobante opcional"
  }'::jsonb,
  '{
    "uso_basico": {
      "descripcion": "Hacer comprobantes obligatorios para mejor control contable",
      "configuracion": {
        "customValue": true
      }
    },
    "uso_flexible": {
      "descripcion": "Permitir gastos sin comprobante pero con advertencia",
      "configuracion": {
        "customValue": false
      }
    }
  }'::jsonb,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  "defaultValue" = EXCLUDED."defaultValue",
  "validationRules" = EXCLUDED."validationRules",
  examples = EXCLUDED.examples,
  "updatedAt" = NOW();

-- Verificar que se creó correctamente
SELECT 
  id,
  key,
  type,
  "defaultValue",
  category,
  "allowCustomization",
  "isActive",
  description
FROM rule_templates
WHERE key = 'GASTOS_COMPROBANTE_REQUERIDO';

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================
-- 1. Ejecutar este script en PostgreSQL:
--    - Local: psql -U postgres -d beautycontrol < add_expense_receipt_rule.sql
--    - Azure: Usar Azure Data Studio o pgAdmin
--
-- 2. La regla estará disponible para todos los negocios
--
-- 3. Cada negocio puede personalizarla desde:
--    - Frontend: BusinessRuleModalV2 → Asignar regla → Personalizar
--    - API: PUT /api/business/rules/GASTOS_COMPROBANTE_REQUERIDO
--      Body: { "customValue": true, "isActive": true }
--
-- 4. El frontend leerá esta regla desde Redux:
--    - useSelector(state => state.businessRule.assignedRules)
--    - Buscar por key: 'GASTOS_COMPROBANTE_REQUERIDO'
--    - Usar effective_value o customValue
-- =====================================================
