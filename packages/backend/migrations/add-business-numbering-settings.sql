-- Migración para agregar configuraciones de numeración en Business.settings
-- Agregar configuraciones por defecto para numeración de recibos, facturas y prefijo fiscal

UPDATE businesses 
SET settings = settings || jsonb_build_object(
  'numbering', jsonb_build_object(
    'receipts', jsonb_build_object(
      'enabled', true,
      'initialNumber', 1,
      'currentNumber', 1,
      'prefix', 'REC',
      'format', 'REC-{YEAR}-{NUMBER}',
      'padLength', 5,
      'resetYearly', true
    ),
    'invoices', jsonb_build_object(
      'enabled', true,
      'initialNumber', 1,
      'currentNumber', 1,
      'prefix', 'INV',
      'format', 'INV-{YEAR}-{NUMBER}',
      'padLength', 5,
      'resetYearly', true
    ),
    'fiscal', jsonb_build_object(
      'enabled', false,
      'taxxa_prefix', '',
      'tax_regime', 'SIMPLIFIED',
      'resolution_number', '',
      'resolution_date', null,
      'valid_from', null,
      'valid_to', null,
      'technical_key', '',
      'software_id', ''
    )
  ),
  'communications', jsonb_build_object(
    'whatsapp', jsonb_build_object(
      'enabled', false,
      'phone_number', '',
      'business_account_id', '',
      'access_token', '',
      'webhook_verify_token', '',
      'send_receipts', true,
      'send_appointments', true,
      'send_reminders', true
    ),
    'email', jsonb_build_object(
      'enabled', true,
      'smtp_host', '',
      'smtp_port', 587,
      'smtp_user', '',
      'smtp_password', '',
      'from_email', '',
      'from_name', ''
    )
  )
)
WHERE settings IS NULL OR NOT settings ? 'numbering';

-- Comentarios para documentación
COMMENT ON COLUMN businesses.settings IS 'Configuraciones JSONB que incluyen numeración (recibos, facturas, fiscal) y comunicaciones (WhatsApp, email)';

-- Ejemplo de estructura settings esperada:
/*
{
  "numbering": {
    "receipts": {
      "enabled": true,
      "initialNumber": 1,
      "currentNumber": 1,
      "prefix": "REC",
      "format": "REC-{YEAR}-{NUMBER}",
      "padLength": 5,
      "resetYearly": true
    },
    "invoices": {
      "enabled": true,
      "initialNumber": 1,
      "currentNumber": 1,
      "prefix": "INV",
      "format": "INV-{YEAR}-{NUMBER}",
      "padLength": 5,
      "resetYearly": true
    },
    "fiscal": {
      "enabled": false,
      "taxxa_prefix": "PREFIX001",
      "tax_regime": "SIMPLIFIED|COMMON",
      "resolution_number": "18760000001",
      "resolution_date": "2024-01-01",
      "valid_from": "2024-01-01", 
      "valid_to": "2025-12-31",
      "technical_key": "abc123...",
      "software_id": "software123"
    }
  },
  "communications": {
    "whatsapp": {
      "enabled": false,
      "phone_number": "+573001234567",
      "business_account_id": "...",
      "access_token": "...",
      "webhook_verify_token": "...",
      "send_receipts": true,
      "send_appointments": true,
      "send_reminders": true
    },
    "email": {
      "enabled": true,
      "smtp_host": "smtp.gmail.com",
      "smtp_port": 587,
      "smtp_user": "business@example.com",
      "smtp_password": "...",
      "from_email": "business@example.com",
      "from_name": "Business Name"
    }
  }
}
*/