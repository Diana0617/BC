-- Add missing columns to suppliers table
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS certifications JSON DEFAULT '[]'::json,
ADD COLUMN IF NOT EXISTS stats JSON DEFAULT '{"totalOrders":0,"totalSpent":0,"pendingInvoices":0,"averageRating":0}'::json;
