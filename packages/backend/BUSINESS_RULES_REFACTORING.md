# Business Rules Refactoring - New Simplified Structure

## Overview

This refactoring simplifies the business rules system from a complex 3-model structure to a clean 2-model approach:

**OLD Structure (Deprecated):**
- `BusinessRuleTemplate` - Complex template definitions
- `BusinessRuleAssignment` - Assignment relationships  
- `BusinessRules` - Mixed template + legacy fields

**NEW Structure:**
- `RuleTemplate` - Simple global rule definitions
- `BusinessRule` - Business-specific rule overrides

## New Models

### RuleTemplate

Global rule definitions that can be applied to any business.

```sql
CREATE TABLE rule_templates (
    id UUID PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'BOOLEAN', 'STRING', 'NUMBER', 'JSON'
    defaultValue JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    allowCustomization BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT '1.0.0',
    isActive BOOLEAN DEFAULT TRUE,
    validationRules JSONB,
    examples JSONB,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);
```

### BusinessRule

Links businesses to rule templates with optional custom values.

```sql  
CREATE TABLE business_rules (
    id UUID PRIMARY KEY,
    businessId UUID NOT NULL,
    ruleTemplateId UUID NOT NULL,
    customValue JSONB, -- NULL = use template default
    isActive BOOLEAN DEFAULT TRUE,
    updatedBy UUID,
    notes TEXT,
    appliedAt TIMESTAMP,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP,
    UNIQUE(businessId, ruleTemplateId)
);
```

## Key Query Pattern

Get all effective rules for a business:

```sql
SELECT 
  rt.key,
  COALESCE(br.customValue, rt.defaultValue) AS effective_value,
  CASE WHEN br.customValue IS NOT NULL THEN true ELSE false END AS is_customized
FROM rule_templates rt
LEFT JOIN business_rules br 
  ON br.ruleTemplateId = rt.id 
  AND br.businessId = :businessId
WHERE rt.isActive = true
  AND (br.isActive IS NULL OR br.isActive = true);
```

## Usage Examples

### Service Layer

```javascript
const BusinessRulesService = require('../services/BusinessRulesService');

// Get all effective rules for a business
const rules = await BusinessRulesService.getBusinessEffectiveRules(businessId);

// Get specific rule value
const canCloseWithoutPayment = await BusinessRulesService.getBusinessRuleValue(
  businessId, 
  'allow_close_without_payment'
);

// Set custom value
await BusinessRulesService.setBusinessRuleValue(
  businessId,
  'cancellation_time_limit', 
  48, // 48 hours instead of default 24
  userId
);

// Reset to default
await BusinessRulesService.resetBusinessRuleToDefault(
  businessId, 
  'cancellation_time_limit'
);
```

### Controller Layer

```javascript
const BusinessRulesController = require('../controllers/BusinessRulesController');

// GET /api/business/rules - Get all business rules
// GET /api/business/rules/allow_close_without_payment - Get specific rule
// PUT /api/business/rules/cancellation_time_limit - Set custom value
// DELETE /api/business/rules/cancellation_time_limit - Reset to default
```

## Migration Process

### 1. Create New Tables

Run the migration scripts in order:

```bash
# Create new tables
psql -f migrations/create-rule-templates-table.sql
psql -f migrations/create-business-rules-table.sql
```

### 2. Migrate Existing Data

```bash  
# Migrate data from old structure
psql -f migrations/migrate-legacy-rules-data.sql
```

### 3. Update Application Code

1. Import new models and associations:
```javascript
// Replace old imports
const { RuleTemplate, BusinessRule } = require('./models/newRuleAssociations');
```

2. Use new service:
```javascript
const BusinessRulesService = require('../services/BusinessRulesService');
```

3. Update controllers to use new endpoints

### 4. Remove Legacy Code (Future)

After confirming everything works:
- Remove deprecated model files
- Drop old database tables
- Clean up old service and controller code

## Default Rule Templates

The migration includes these default rules:

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `allow_close_without_payment` | BOOLEAN | `false` | Allow closing appointments without payment |
| `enable_cancellation` | BOOLEAN | `true` | Allow appointment cancellations |
| `auto_refund_on_cancel` | BOOLEAN | `false` | Automatic refund on cancellation |
| `cancellation_time_limit` | NUMBER | `24` | Hours before appointment to allow cancellation |
| `require_deposit_for_booking` | BOOLEAN | `false` | Require deposit for bookings |
| `deposit_percentage` | NUMBER | `50` | Deposit percentage required |
| `max_advance_booking_days` | NUMBER | `30` | Maximum days in advance for bookings |
| `working_hours` | JSON | `{...}` | Business working hours |
| `notification_settings` | JSON | `{...}` | Notification preferences |

## Benefits of New Structure

1. **Simplicity**: Only 2 models instead of 3
2. **Performance**: Single JOIN instead of multiple
3. **Flexibility**: Easy to add new rule types
4. **Maintainability**: Clear separation of concerns
5. **Scalability**: Efficient queries with proper indexes

## Backward Compatibility

The legacy models are marked as `@deprecated` but still functional during the transition period. The migration script preserves all existing data and business logic.

## Testing

Test the new structure:

```javascript
// Test effective value resolution  
const rules = await BusinessRulesService.getBusinessEffectiveRules('business-uuid');
console.log(rules.find(r => r.key === 'allow_close_without_payment').effective_value);

// Test customization
await BusinessRulesService.setBusinessRuleValue(
  'business-uuid', 
  'cancellation_time_limit', 
  48, 
  'user-uuid'
);
```

## File Structure

```
packages/backend/src/
├── models/
│   ├── RuleTemplate.js ✅ New
│   ├── BusinessRule.js ✅ New  
│   ├── newRuleAssociations.js ✅ New
│   ├── BusinessRuleTemplate.js ⚠️ Deprecated
│   ├── BusinessRuleAssignment.js ⚠️ Deprecated
│   └── BusinessRules.js ⚠️ Deprecated
├── services/
│   ├── BusinessRulesService.js ✅ New
│   └── RuleTemplateService.js ⚠️ Legacy
├── controllers/
│   ├── BusinessRulesController.js ✅ New
│   └── RuleTemplateController.js ⚠️ Legacy
└── migrations/
    ├── create-rule-templates-table.sql ✅ New
    ├── create-business-rules-table.sql ✅ New
    └── migrate-legacy-rules-data.sql ✅ New
```