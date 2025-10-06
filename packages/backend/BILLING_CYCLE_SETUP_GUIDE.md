# Quick Guide: Updating Plans with Monthly/Annual Pricing

## Step 1: Run the Migration

Execute the migration to add the new fields:

```bash
# Connect to your PostgreSQL database
psql -U your_username -d beauty_control

# Run the migration
\i packages/backend/migrations/add-billing-cycle-fields.sql
```

Or if using a migration tool:
```bash
cd packages/backend
node src/scripts/run-migration.js add-billing-cycle-fields.sql
```

## Step 2: Verify Migration Success

Check that the fields were added:

```sql
-- Check subscription_plans table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'subscription_plans' 
  AND column_name IN ('monthly_price', 'annual_price', 'billing_cycle', 'annual_discount_percent');

-- Check business_subscriptions table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'business_subscriptions' 
  AND column_name = 'billing_cycle';

-- View current plans with new pricing
SELECT 
  id,
  name,
  price as legacy_price,
  monthly_price,
  annual_price,
  annual_discount_percent,
  billing_cycle
FROM subscription_plans;
```

## Step 3: Update Plan Prices (if needed)

The migration automatically sets:
- `monthlyPrice` = original `price`
- `annualPrice` = `price * 12 * 0.8` (20% discount)
- `annualDiscountPercent` = 20

If you want different pricing, update manually:

```sql
-- Update a specific plan with custom pricing
UPDATE subscription_plans
SET 
  monthly_price = 50000,           -- $50,000 COP/month
  annual_price = 480000,            -- $480,000 COP/year
  annual_discount_percent = 20      -- 20% discount
WHERE id = 1;

-- Update multiple plans at once
UPDATE subscription_plans
SET 
  monthly_price = CASE
    WHEN name = 'Basic' THEN 30000
    WHEN name = 'Premium' THEN 50000
    WHEN name = 'Enterprise' THEN 100000
  END,
  annual_price = CASE
    WHEN name = 'Basic' THEN 288000    -- 30k * 12 * 0.8
    WHEN name = 'Premium' THEN 480000   -- 50k * 12 * 0.8
    WHEN name = 'Enterprise' THEN 960000 -- 100k * 12 * 0.8
  END,
  annual_discount_percent = 20
WHERE name IN ('Basic', 'Premium', 'Enterprise');
```

## Step 4: Verify Pricing Logic

Test the pricing calculation:

```sql
-- See monthly vs annual comparison for all plans
SELECT 
  id,
  name,
  monthly_price,
  annual_price,
  (monthly_price * 12) as monthly_total_year,
  ((monthly_price * 12) - annual_price) as annual_savings,
  ROUND(
    ((monthly_price * 12 - annual_price) / (monthly_price * 12.0)) * 100, 
    2
  ) as actual_discount_percent,
  annual_discount_percent as advertised_discount_percent
FROM subscription_plans
WHERE is_active = true
ORDER BY monthly_price;
```

## Step 5: Test API Endpoints

### Test Monthly Subscription:
```bash
curl -X POST http://localhost:3000/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{
    "planId": 1,
    "billingCycle": "MONTHLY",
    "businessData": {
      "name": "Test Business Monthly",
      "businessCode": "testmonthly",
      "email": "monthly@test.com",
      "phone": "1234567890"
    },
    "userData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@test.com",
      "phone": "1234567890",
      "password": "Test123!"
    },
    "paymentData": {
      "paymentSourceToken": "tok_test_12345"
    }
  }'
```

### Test Annual Subscription:
```bash
curl -X POST http://localhost:3000/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{
    "planId": 1,
    "billingCycle": "ANNUAL",
    "businessData": {
      "name": "Test Business Annual",
      "businessCode": "testannual",
      "email": "annual@test.com",
      "phone": "1234567890"
    },
    "userData": {
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@test.com",
      "phone": "1234567890",
      "password": "Test123!"
    },
    "paymentData": {
      "paymentSourceToken": "tok_test_67890"
    }
  }'
```

### Verify Subscription Created:
```sql
-- Check latest subscriptions with billing cycle
SELECT 
  bs.id,
  b.name as business_name,
  sp.name as plan_name,
  bs.amount,
  bs.billing_cycle,
  bs.start_date,
  bs.end_date,
  bs.trial_end_date,
  bs.status
FROM business_subscriptions bs
JOIN businesses b ON bs.business_id = b.id
JOIN subscription_plans sp ON bs.subscription_plan_id = sp.id
ORDER BY bs.created_at DESC
LIMIT 10;

-- Verify payment amounts match billing cycle
SELECT 
  sp_pay.id,
  bs.billing_cycle,
  sp_pay.amount as charged_amount,
  sp.monthly_price,
  sp.annual_price,
  CASE 
    WHEN bs.billing_cycle = 'MONTHLY' THEN sp.monthly_price
    WHEN bs.billing_cycle = 'ANNUAL' THEN sp.annual_price
  END as expected_amount,
  sp_pay.status
FROM subscription_payments sp_pay
JOIN business_subscriptions bs ON sp_pay.business_subscription_id = bs.id
JOIN subscription_plans sp ON bs.subscription_plan_id = sp.id
ORDER BY sp_pay.created_at DESC
LIMIT 10;
```

## Step 6: Test Owner Manual Creation

```bash
curl -X POST http://localhost:3000/api/owner/businesses/create-manually \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_OWNER_TOKEN" \
  -d '{
    "businessName": "Manual Business Annual",
    "businessCode": "manualannual",
    "businessEmail": "manual@test.com",
    "businessPhone": "1234567890",
    "address": "123 Test St",
    "city": "Bogotá",
    "country": "Colombia",
    "ownerEmail": "owner@test.com",
    "ownerFirstName": "Owner",
    "ownerLastName": "Test",
    "ownerPhone": "0987654321",
    "ownerPassword": "Owner123!",
    "subscriptionPlanId": 1,
    "billingCycle": "ANNUAL"
  }'
```

## Common Pricing Patterns

### Standard SaaS Pricing (20% annual discount):
```sql
UPDATE subscription_plans SET
  monthly_price = 50000,
  annual_price = 480000,  -- 50000 * 12 * 0.8
  annual_discount_percent = 20;
```

### Aggressive Annual Discount (25%):
```sql
UPDATE subscription_plans SET
  monthly_price = 50000,
  annual_price = 450000,  -- 50000 * 12 * 0.75
  annual_discount_percent = 25;
```

### Premium Pricing (15% annual discount):
```sql
UPDATE subscription_plans SET
  monthly_price = 100000,
  annual_price = 1020000,  -- 100000 * 12 * 0.85
  annual_discount_percent = 15;
```

### Two Free Months Strategy:
```sql
UPDATE subscription_plans SET
  monthly_price = 50000,
  annual_price = 500000,  -- Pay for 10 months, get 12
  annual_discount_percent = 17;  -- Actually (2/12) * 100 ≈ 16.67%
```

## Rollback (if needed)

If you need to rollback the migration:

```sql
-- Remove new columns from business_subscriptions
ALTER TABLE business_subscriptions 
  DROP COLUMN IF EXISTS billing_cycle;

-- Remove new columns from subscription_plans
ALTER TABLE subscription_plans 
  DROP COLUMN IF EXISTS monthly_price,
  DROP COLUMN IF EXISTS annual_price,
  DROP COLUMN IF EXISTS billing_cycle,
  DROP COLUMN IF EXISTS annual_discount_percent;

-- Remove ENUM types
DROP TYPE IF EXISTS subscription_plan_billing_cycle;
DROP TYPE IF EXISTS business_subscription_billing_cycle;
```

## Monitoring Queries

### Track billing cycle adoption:
```sql
SELECT 
  billing_cycle,
  COUNT(*) as subscriptions,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM business_subscriptions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY billing_cycle;
```

### Revenue comparison:
```sql
SELECT 
  sp.name as plan_name,
  bs.billing_cycle,
  COUNT(*) as subscriptions,
  SUM(bs.amount) as total_revenue,
  AVG(bs.amount) as avg_amount
FROM business_subscriptions bs
JOIN subscription_plans sp ON bs.subscription_plan_id = sp.id
WHERE bs.status IN ('TRIAL', 'ACTIVE')
GROUP BY sp.name, bs.billing_cycle
ORDER BY sp.name, bs.billing_cycle;
```

### Upcoming renewals by billing cycle:
```sql
SELECT 
  billing_cycle,
  COUNT(*) as renewals_due,
  SUM(amount) as revenue_expected
FROM business_subscriptions
WHERE 
  status = 'ACTIVE'
  AND end_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
GROUP BY billing_cycle;
```
