-- Create invoice_status enum type
DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('PENDING', 'APPROVED', 'PAID', 'OVERDUE', 'DISPUTED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create supplier_invoices table
CREATE TABLE IF NOT EXISTS supplier_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  "supplierId" UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  "purchaseOrderId" UUID,
  "invoiceNumber" VARCHAR(100) NOT NULL,
  status invoice_status NOT NULL DEFAULT 'PENDING',
  "issueDate" TIMESTAMP NOT NULL,
  "dueDate" TIMESTAMP NOT NULL,
  items JSON NOT NULL DEFAULT '[]'::json,
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(15, 2) NOT NULL DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'COP',
  notes TEXT,
  payments JSON DEFAULT '[]'::json,
  "paidAmount" DECIMAL(15, 2) NOT NULL DEFAULT 0,
  "remainingAmount" DECIMAL(15, 2) NOT NULL DEFAULT 0,
  attachments JSON DEFAULT '[]'::json,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS supplier_invoices_business_id_idx ON supplier_invoices("businessId");
CREATE INDEX IF NOT EXISTS supplier_invoices_supplier_id_idx ON supplier_invoices("supplierId");
CREATE INDEX IF NOT EXISTS supplier_invoices_purchase_order_id_idx ON supplier_invoices("purchaseOrderId");
CREATE INDEX IF NOT EXISTS supplier_invoices_invoice_number_idx ON supplier_invoices("invoiceNumber");
CREATE INDEX IF NOT EXISTS supplier_invoices_status_idx ON supplier_invoices(status);
CREATE INDEX IF NOT EXISTS supplier_invoices_issue_date_idx ON supplier_invoices("issueDate");
CREATE INDEX IF NOT EXISTS supplier_invoices_due_date_idx ON supplier_invoices("dueDate");

-- Add unique constraint for invoice number per business
CREATE UNIQUE INDEX IF NOT EXISTS supplier_invoices_business_invoice_number_unique_idx 
ON supplier_invoices("businessId", "invoiceNumber");
