-- Permitir NULL en businessSubscriptionId para registros públicos temporales
-- Esta migración permite que los pagos 3DS públicos se guarden sin BusinessSubscription
-- hasta que se complete el registro del negocio

ALTER TABLE subscription_payments 
ALTER COLUMN "businessSubscriptionId" DROP NOT NULL;

-- Agregar comentario para documentar el cambio
COMMENT ON COLUMN subscription_payments."businessSubscriptionId" IS 
'ID de la suscripción de negocio. Puede ser NULL para pagos públicos temporales durante el registro.';