-- Migración: Agregar campos 3DS v2 a la tabla subscription_payments
-- Fecha: $(date)
-- Descripción: Actualiza el esquema para soportar 3D Secure v2

-- Crear ENUM para tipos de autenticación 3DS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_subscription_payments_threeDsAuthType') THEN
        CREATE TYPE "public"."enum_subscription_payments_threeDsAuthType" AS ENUM(
            'no_challenge_success', 
            'challenge_denied', 
            'challenge_v2', 
            'supported_version_error', 
            'authentication_error'
        );
    END IF;
END
$$;

-- Crear ENUM para estados de steps 3DS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_subscription_payments_currentStepStatus') THEN
        CREATE TYPE "public"."enum_subscription_payments_currentStepStatus" AS ENUM(
            'pending', 
            'success', 
            'failed', 
            'timeout', 
            'cancelled'
        );
    END IF;
END
$$;

-- Agregar columnas para 3DS v2 si no existen
DO $$ 
BEGIN
    -- browserInfo: Información del navegador (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'browserInfo') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "browserInfo" JSONB;
    END IF;

    -- threeDsAuthType: Tipo de autenticación 3DS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'threeDsAuthType') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "threeDsAuthType" "public"."enum_subscription_payments_threeDsAuthType";
    END IF;

    -- threeDsMethodData: Datos del método 3DS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'threeDsMethodData') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "threeDsMethodData" TEXT;
    END IF;

    -- threeDsMethodUrl: URL del método 3DS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'threeDsMethodUrl') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "threeDsMethodUrl" TEXT;
    END IF;

    -- challengeRequest: Datos del challenge request
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'challengeRequest') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "challengeRequest" JSONB;
    END IF;

    -- challengeUrl: URL del iframe de challenge
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'challengeUrl') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "challengeUrl" TEXT;
    END IF;

    -- currentStep: Step actual del proceso 3DS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'currentStep') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "currentStep" VARCHAR(50);
    END IF;

    -- currentStepStatus: Estado del step actual
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'currentStepStatus') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "currentStepStatus" "public"."enum_subscription_payments_currentStepStatus";
    END IF;

    -- threeDsServerTransId: ID de transacción del servidor 3DS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'threeDsServerTransId') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "threeDsServerTransId" VARCHAR(36);
    END IF;

    -- acsTransId: ID de transacción del ACS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'acsTransId') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "acsTransId" VARCHAR(36);
    END IF;

    -- dsTransId: ID de transacción del DS (Directory Server)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'dsTransId') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "dsTransId" VARCHAR(36);
    END IF;

    -- eci: Electronic Commerce Indicator
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'eci') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "eci" VARCHAR(2);
    END IF;

    -- cavv: Cardholder Authentication Verification Value
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'cavv') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "cavv" TEXT;
    END IF;

    -- xid: Transaction Identifier (para 3DS v1)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'xid') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "xid" TEXT;
    END IF;

    -- authenticationStatus: Estado de autenticación final
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'authenticationStatus') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "authenticationStatus" VARCHAR(1);
    END IF;

    -- liabilityShift: Indicador de transferencia de responsabilidad
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_payments' AND column_name = 'liabilityShift') THEN
        ALTER TABLE "public"."subscription_payments" ADD COLUMN "liabilityShift" BOOLEAN DEFAULT false;
    END IF;

END
$$;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_subscription_payments_wompi_transaction_id 
    ON "public"."subscription_payments" ("wompiTransactionId");

CREATE INDEX IF NOT EXISTS idx_subscription_payments_3ds_server_trans_id 
    ON "public"."subscription_payments" ("threeDsServerTransId");

CREATE INDEX IF NOT EXISTS idx_subscription_payments_current_step 
    ON "public"."subscription_payments" ("currentStep", "currentStepStatus");

CREATE INDEX IF NOT EXISTS idx_subscription_payments_auth_type 
    ON "public"."subscription_payments" ("threeDsAuthType");

-- Agregar comentarios a las columnas
COMMENT ON COLUMN "public"."subscription_payments"."browserInfo" IS 'Información del navegador requerida para 3DS v2 (user agent, screen dimensions, etc.)';
COMMENT ON COLUMN "public"."subscription_payments"."threeDsAuthType" IS 'Tipo de flujo de autenticación 3DS';
COMMENT ON COLUMN "public"."subscription_payments"."currentStep" IS 'Step actual del proceso 3DS (method, challenge, complete)';
COMMENT ON COLUMN "public"."subscription_payments"."currentStepStatus" IS 'Estado del step actual (pending, success, failed, etc.)';
COMMENT ON COLUMN "public"."subscription_payments"."liabilityShift" IS 'Indica si hubo transferencia de responsabilidad de fraude';

-- Validaciones y constraints
ALTER TABLE "public"."subscription_payments" 
    ADD CONSTRAINT chk_eci_format CHECK (eci IS NULL OR eci ~ '^[0-9]{2}$');

ALTER TABLE "public"."subscription_payments" 
    ADD CONSTRAINT chk_auth_status_format CHECK (authenticationStatus IS NULL OR authenticationStatus ~ '^[AYCNUR]$');

-- Migración completada
SELECT 'Migración 3DS v2 aplicada correctamente' as resultado;