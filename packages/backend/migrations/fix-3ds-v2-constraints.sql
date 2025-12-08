-- Corrección de migración 3DS v2 - Arreglar índices y constraints

-- Crear índice para transactionId (si no existe ya)
-- Ya existe: "subscription_payments_transaction_id" btree ("transactionId")

-- Arreglar el constraint de authenticationStatus
DO $$ 
BEGIN
    -- Verificar si el constraint ya existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'chk_auth_status_format' 
        AND table_name = 'subscription_payments'
    ) THEN
        ALTER TABLE "public"."subscription_payments" 
            ADD CONSTRAINT chk_auth_status_format 
            CHECK ("authenticationStatus" IS NULL OR "authenticationStatus" ~ '^[AYCNUR]$');
    END IF;
END
$$;

-- Verificar que todos los campos están creados correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subscription_payments' 
    AND column_name IN (
        'browserInfo', 'threeDsAuthType', 'threeDsMethodData', 'threeDsMethodUrl',
        'challengeRequest', 'challengeUrl', 'currentStep', 'currentStepStatus',
        'threeDsServerTransId', 'acsTransId', 'dsTransId', 'eci', 'cavv', 'xid',
        'authenticationStatus', 'liabilityShift'
    )
ORDER BY ordinal_position;

SELECT 'Corrección de migración 3DS v2 completada' as resultado;