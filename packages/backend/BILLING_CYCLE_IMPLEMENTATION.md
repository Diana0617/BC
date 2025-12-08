# Billing Cycle Implementation (Monthly vs Annual Pricing)

## Overview
Implementation of Netflix-style pricing where customers can choose between monthly or annual billing with discounts for annual subscriptions.

## Database Changes

### Migration: `add-billing-cycle-fields.sql`

**Subscription Plans Table:**
- `monthlyPrice` (DECIMAL 10,2) - Monthly recurring price
- `annualPrice` (DECIMAL 10,2) - Annual recurring price (usually with discount)
- `billingCycle` (ENUM 'MONTHLY', 'ANNUAL') - Default billing cycle for the plan
- `annualDiscountPercent` (INTEGER 0-100) - Percentage discount for annual subscriptions

**Business Subscriptions Table:**
- `billingCycle` (ENUM 'MONTHLY', 'ANNUAL') - Customer's chosen billing cycle

**Migration automatically:**
- Adds all new fields with proper constraints
- Updates existing plans with 20% annual discount default
- Sets `monthlyPrice` = `price` for existing plans
- Calculates `annualPrice` = `price` * 12 * 0.8 (20% discount)

## Model Updates

### SubscriptionPlan.js
```javascript
monthlyPrice: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
  validate: { min: 0 }
},
annualPrice: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
  validate: { min: 0 }
},
billingCycle: {
  type: DataTypes.ENUM('MONTHLY', 'ANNUAL'),
  allowNull: false,
  defaultValue: 'MONTHLY'
},
annualDiscountPercent: {
  type: DataTypes.INTEGER,
  allowNull: true,
  defaultValue: 0,
  validate: { min: 0, max: 100 }
}
```

### BusinessSubscription.js
```javascript
billingCycle: {
  type: DataTypes.ENUM('MONTHLY', 'ANNUAL'),
  allowNull: false,
  defaultValue: 'MONTHLY',
  comment: 'Billing cycle chosen by customer'
}
```

## Controller Updates

### SubscriptionController.js

**API Endpoint:** `POST /api/subscriptions/create`

**New Request Parameter:**
```json
{
  "planId": 1,
  "billingCycle": "MONTHLY", // or "ANNUAL"
  "businessData": { ... },
  "userData": { ... },
  "paymentData": { ... }
}
```

**Price Calculation Logic:**
```javascript
if (billingCycle === 'ANNUAL') {
  finalPrice = plan.annualPrice || (plan.monthlyPrice || plan.price);
  finalDuration = 1;
  finalDurationType = 'YEARS';
} else {
  // MONTHLY
  finalPrice = plan.monthlyPrice || plan.price;
  finalDuration = plan.duration;
  finalDurationType = plan.durationType;
}
```

**Duration Calculation:**
- **MONTHLY**: Uses plan's configured duration (e.g., 1 MONTH, 30 DAYS)
- **ANNUAL**: Always sets to 1 YEAR regardless of plan's default duration

**Stored in Subscription:**
- `amount`: finalPrice (based on billing cycle)
- `endDate`: calculated from finalDuration + finalDurationType
- `billingCycle`: customer's choice (MONTHLY/ANNUAL)

**Stored in Payment:**
- `amount`: finalPrice
- `metadata.billingCycle`: for reference and reporting

### OwnerController.js

**API Endpoint:** `POST /api/owner/businesses/create-manually`

**New Request Parameter:**
```json
{
  "subscriptionPlanId": 1,
  "billingCycle": "MONTHLY", // or "ANNUAL" - defaults to MONTHLY
  "businessName": "...",
  "ownerEmail": "...",
  // ... other business/owner data
}
```

**Same price calculation and duration logic as SubscriptionController**

## Pricing Examples

### Example Plan Configuration:
```javascript
{
  name: "Premium Plan",
  price: 50000, // Legacy field (fallback)
  monthlyPrice: 50000, // $50,000 COP/month
  annualPrice: 480000, // $480,000 COP/year (20% discount)
  annualDiscountPercent: 20,
  duration: 1,
  durationType: 'MONTHS',
  trialDays: 7
}
```

### Customer Chooses MONTHLY:
- **Price charged**: $50,000 COP
- **Subscription duration**: 1 MONTH
- **Renewal frequency**: Every month
- **Trial period**: 7 days (then auto-charge $50,000)

### Customer Chooses ANNUAL:
- **Price charged**: $480,000 COP (save $120,000 = 20%)
- **Subscription duration**: 1 YEAR
- **Renewal frequency**: Every year
- **Trial period**: 7 days (then auto-charge $480,000)

## Frontend Integration (Pending)

### Pricing Display UI
```jsx
<div className="pricing-selector">
  <button 
    onClick={() => setBillingCycle('MONTHLY')}
    className={billingCycle === 'MONTHLY' ? 'active' : ''}
  >
    <h3>Monthly</h3>
    <p>${plan.monthlyPrice.toLocaleString()}/month</p>
  </button>
  
  <button 
    onClick={() => setBillingCycle('ANNUAL')}
    className={billingCycle === 'ANNUAL' ? 'active' : ''}
  >
    <h3>Annual</h3>
    <p>${plan.annualPrice.toLocaleString()}/year</p>
    <span className="badge">Save {plan.annualDiscountPercent}%</span>
  </button>
</div>
```

### API Call
```javascript
const response = await axios.post('/api/subscriptions/create', {
  planId: selectedPlan.id,
  billingCycle: billingCycle, // 'MONTHLY' or 'ANNUAL'
  businessData: { ... },
  userData: { ... },
  paymentData: { ... }
});
```

## Auto-Renewal Behavior

### Monthly Subscriptions:
- **Trial ends**: Day 7 → charge $50,000 for 1 month
- **Renewal 1**: Day 37 → charge $50,000 for 1 month
- **Renewal 2**: Day 67 → charge $50,000 for 1 month
- **Pattern**: Every ~30 days

### Annual Subscriptions:
- **Trial ends**: Day 7 → charge $480,000 for 1 year
- **Renewal 1**: Day 372 → charge $480,000 for 1 year
- **Renewal 2**: Day 737 → charge $480,000 for 1 year
- **Pattern**: Every ~365 days

## Testing Checklist

### Backend Testing:
- [ ] Run migration `add-billing-cycle-fields.sql`
- [ ] Verify existing plans have monthlyPrice and annualPrice set
- [ ] Create subscription with `billingCycle: 'MONTHLY'`
- [ ] Create subscription with `billingCycle: 'ANNUAL'`
- [ ] Verify monthly subscription charges correct amount
- [ ] Verify annual subscription charges discounted amount
- [ ] Verify subscription endDate calculated correctly (1 month vs 1 year)
- [ ] Test OwnerController manual creation with both cycles
- [ ] Verify billingCycle stored in BusinessSubscription
- [ ] Verify billingCycle stored in SubscriptionPayment metadata

### AutoRenewal Service:
- [ ] Mock trial expiration for monthly subscription
- [ ] Verify correct monthly price charged
- [ ] Mock trial expiration for annual subscription
- [ ] Verify correct annual price charged
- [ ] Verify renewal dates calculated correctly for both cycles

### Frontend Testing (Pending Implementation):
- [ ] Display monthly vs annual pricing options
- [ ] Show savings calculation for annual plan
- [ ] Toggle between pricing options
- [ ] Send billingCycle to backend API
- [ ] Display chosen billing cycle in confirmation
- [ ] Show billing cycle in subscription details

## API Documentation Updates

### Swagger Schema Updated:
```yaml
planId:
  type: integer
  description: ID del plan seleccionado
billingCycle:
  type: string
  enum: [MONTHLY, ANNUAL]
  default: MONTHLY
  description: Ciclo de facturación (mensual o anual)
```

## Backward Compatibility

### Legacy `price` field:
- Still used as fallback if `monthlyPrice` is not set
- Migration sets `monthlyPrice = price` for existing plans
- New plans should set both `monthlyPrice` and `annualPrice`

### Default behavior:
- If `billingCycle` not provided, defaults to `'MONTHLY'`
- If `monthlyPrice` is null, uses `price` as fallback
- If `annualPrice` is null, uses `monthlyPrice` or `price` as fallback

## Next Steps

1. **Run Migration**: Execute `add-billing-cycle-fields.sql` on production database
2. **Update Plan Data**: Set actual monthly and annual prices for all active plans
3. **Frontend Implementation**: Create billing cycle selector in registration flow
4. **Testing**: Complete testing checklist above
5. **Documentation**: Update API documentation and user guides
6. **Analytics**: Add tracking for billing cycle selection rates

## Notes

- Annual subscriptions provide better cash flow (receive 12 months payment upfront)
- Discount incentivizes annual subscriptions (common industry practice: 15-25% off)
- Customer can choose billing frequency but cannot change after subscription created (future feature)
- Trial period works the same for both billing cycles (7 days free)
- First charge happens after trial regardless of billing cycle chosen
