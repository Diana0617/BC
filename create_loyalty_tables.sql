-- Script para crear tablas del sistema de loyalty y cancelaciones
-- Ejecutar en Azure PostgreSQL

-- 1. Crear tabla vouchers primero (sin dependencias)
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  "customerId" UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  "originalBookingId" UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'COP',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED')),
  "issuedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "usedAt" TIMESTAMP WITH TIME ZONE,
  "usedInBookingId" UUID REFERENCES appointments(id) ON DELETE SET NULL,
  "cancelReason" TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_business_customer ON vouchers("businessId", "customerId");
CREATE INDEX idx_vouchers_status_expires ON vouchers(status, "expiresAt");
CREATE INDEX idx_vouchers_original_booking ON vouchers("originalBookingId");

-- 2. Crear tabla loyalty_point_transactions
CREATE TABLE loyalty_point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  "clientId" UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  "branchId" UUID REFERENCES branches(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('APPOINTMENT_PAYMENT', 'PRODUCT_PURCHASE', 'REFERRAL', 'REFERRAL_FIRST_VISIT', 'REDEMPTION', 'EXPIRATION', 'MANUAL_ADJUSTMENT', 'BONUS', 'REFUND')),
  status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'REVERSED', 'EXPIRED')),
  "referenceType" VARCHAR(50),
  "referenceId" UUID,
  amount DECIMAL(10, 2),
  multiplier DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  description TEXT,
  "expiresAt" TIMESTAMP WITH TIME ZONE,
  "processedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lpt_business_client_created ON loyalty_point_transactions("businessId", "clientId", "createdAt");
CREATE INDEX idx_lpt_reference ON loyalty_point_transactions("referenceType", "referenceId");
CREATE INDEX idx_lpt_status ON loyalty_point_transactions(status);
CREATE INDEX idx_lpt_type ON loyalty_point_transactions(type);
CREATE INDEX idx_lpt_expires_at ON loyalty_point_transactions("expiresAt");

-- 3. Crear tabla loyalty_rewards
CREATE TABLE loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  "clientId" UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  "pointsUsed" INTEGER NOT NULL,
  "rewardType" VARCHAR(50) NOT NULL CHECK ("rewardType" IN ('DISCOUNT_PERCENTAGE', 'DISCOUNT_FIXED', 'FREE_SERVICE', 'VOUCHER', 'PRODUCT', 'UPGRADE', 'CUSTOM')),
  value DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'COP',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED')),
  "issuedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "usedAt" TIMESTAMP WITH TIME ZONE,
  "usedInReferenceType" VARCHAR(50),
  "usedInReferenceId" UUID,
  description TEXT,
  conditions JSONB DEFAULT '{}',
  "issuedBy" UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_lr_code_unique ON loyalty_rewards(code);
CREATE INDEX idx_lr_business_client ON loyalty_rewards("businessId", "clientId");
CREATE INDEX idx_lr_status_expires ON loyalty_rewards(status, "expiresAt");
CREATE INDEX idx_lr_used_in_reference ON loyalty_rewards("usedInReferenceType", "usedInReferenceId");

-- 4. Crear tabla customer_cancellation_history
CREATE TABLE customer_cancellation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  "customerId" UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  "bookingId" UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  "cancelledAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "bookingDateTime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "hoursBeforeBooking" DECIMAL(10, 2) NOT NULL,
  "voucherGenerated" BOOLEAN NOT NULL DEFAULT false,
  "voucherId" UUID REFERENCES vouchers(id) ON DELETE SET NULL,
  reason TEXT,
  "cancelledBy" VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CHECK ("cancelledBy" IN ('CUSTOMER', 'BUSINESS', 'SYSTEM')),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cch_business_customer ON customer_cancellation_history("businessId", "customerId");
CREATE INDEX idx_cch_customer_cancelled ON customer_cancellation_history("customerId", "cancelledAt");
CREATE INDEX idx_cch_booking ON customer_cancellation_history("bookingId");
CREATE INDEX idx_cch_voucher ON customer_cancellation_history("voucherId");
