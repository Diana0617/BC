-- Agregar columna paymentProofUrl a commission_payment_requests
-- Para subir comprobantes de pago desde Cloudinary

ALTER TABLE commission_payment_requests 
ADD COLUMN IF NOT EXISTS "paymentProofUrl" VARCHAR(500);

COMMENT ON COLUMN commission_payment_requests."paymentProofUrl" IS 'URL del comprobante de pago subido a Cloudinary';

-- Verificar que se agregó la columna
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'commission_payment_requests'
  AND column_name = 'paymentProofUrl';
