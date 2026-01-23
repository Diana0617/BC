-- Insertar las migraciones que ya están aplicadas en Azure
INSERT INTO "SequelizeMeta" (name) 
VALUES 
  ('20260122000000-add-payment-proof-url-to-appointments.js'),
  ('20260122000002-fix-clients-unique-constraint.js')
ON CONFLICT (name) DO NOTHING;

-- Verificar las migraciones registradas
SELECT * FROM "SequelizeMeta" ORDER BY name;
