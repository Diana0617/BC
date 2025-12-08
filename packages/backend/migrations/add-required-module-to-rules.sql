-- Agregar columna requiredModule a rule_templates para filtrar reglas según módulos del plan

ALTER TABLE rule_templates 
ADD COLUMN IF NOT EXISTS required_module VARCHAR(100);

COMMENT ON COLUMN rule_templates.required_module IS 'Nombre del módulo requerido para usar esta regla (ej: facturacion_electronica, gestion_de_turnos)';

-- Actualizar reglas existentes con el módulo requerido

-- Reglas de facturación requieren módulo facturacion_electronica
UPDATE rule_templates 
SET required_module = 'facturacion_electronica'
WHERE key IN (
  'FACTURA_GENERACION_AUTOMATICA',
  'FACTURA_PLAZO_PAGO_DIAS',
  'FACTURA_INCLUIR_IVA',
  'FACTURA_PORCENTAJE_IVA',
  'FACTURA_RECARGO_MORA',
  'FACTURA_ENVIAR_EMAIL',
  'FACTURA_REQUIERE_FIRMA',
  'FACTURA_FORMATO_NUMERACION'
);

-- Reglas de citas requieren módulo gestion_de_turnos
UPDATE rule_templates 
SET required_module = 'gestion_de_turnos'
WHERE key IN (
  'CITAS_DIAS_ANTICIPACION_MAXIMA',
  'CITAS_HORAS_ANTICIPACION_MINIMA',
  'CITAS_HORAS_CANCELACION',
  'CITAS_MAXIMAS_POR_DIA',
  'CITAS_RECORDATORIOS_ACTIVADOS',
  'CITAS_HORAS_RECORDATORIO',
  'CITAS_PERMITIR_SIMULTANEAS',
  'CITAS_TIEMPO_LIBRE_ENTRE_CITAS'
);

-- Las reglas generales no requieren módulo específico (NULL o vacío)
-- ESPECIALISTA_USAR_COMISIONES, ESPECIALISTA_PORCENTAJE_COMISION, etc.

-- Verificar los cambios
SELECT 
  key,
  description,
  required_module,
  category
FROM rule_templates
ORDER BY category, required_module, key;
