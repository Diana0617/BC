ALTER TABLE supplier_invoices ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

UPDATE supplier_invoices
SET metadata = '{"stockDistributed": true, "backfilled": true}'::jsonb
WHERE receipt_status IN ('FULLY_RECEIVED', 'PARTIALLY_RECEIVED')
  AND metadata IS NULL;

INSERT INTO "SequelizeMeta" (name) VALUES ('20260221000001-add-metadata-to-supplier-invoices.js')
ON CONFLICT DO NOTHING;

SELECT 'OK' as result, COUNT(*) as backfilled_rows
FROM supplier_invoices WHERE metadata IS NOT NULL;
