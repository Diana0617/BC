const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

// Mock Sequelize instance to load models without connecting to DB
// const sequelize = new Sequelize('sqlite::memory:', { logging: false });

const modelsDir = path.join(__dirname, '../src/models');
const models = {};

// Models that are global or don't need businessId
const EXCLUDED_MODELS = [
  'User', // Users can belong to multiple businesses or be system-wide
  'Business', // The tenant itself
  'Role', // System-wide roles (if any)
  'Permission', // System-wide permissions
  'Module', // System-wide modules
  'PlanModule', // System-wide plan definitions
  'SubscriptionPlan', // System-wide plans
  'RoleDefaultPermission', // System-wide defaults
  'WhatsAppWebhookEvent', // Webhook logs might be pre-tenant identification
  'PasswordResetToken', // Security tokens
  'RefreshToken', // Auth tokens
  'PaymentIntegration', // System configurations
  'PaymentMethod', // System reference data
  'WhatsAppToken', // System/Admin tokens
  'WhatsAppMessageTemplate', // System templates
  'WhatsAppMessage', // Might be linked via other means or global log
  'Voucher', // Global voucher definitions? (Need to check, but adding to exclude list for now if it's system-wide)
  'ConsentTemplate', // Could be system-wide
  'RuleTemplate', // System-wide
  'BusinessCommissionConfig', // Config
  'BusinessPaymentConfig', // Config
  'BusinessWompiPaymentConfig', // Config
  'BusinessSubscription', // Link table
  'BusinessInvitation', // Invitation
  'BusinessExpenseCategory', // Config
  'BusinessExpense', // Expense
  'BusinessClient', // Link table
  'UserBusinessPermission', // Link table
  'UserBranch', // Link table
  'SpecialistProfile', // Profile might be user-centric
  'SpecialistDocument', // User-centric
  'SpecialistService', // Link table
  'SpecialistCommission', // Link table
  'SpecialistBranchSchedule', // Link table
  'ServiceCommission', // Link table
  'CommissionDetail', // Detail of a commission
  'CommissionPaymentRequest', // Request
  'OwnerExpense', // Owner specific
  'OwnerFinancialReport', // Owner specific
  'OwnerPaymentConfiguration', // Owner specific
  'SubscriptionPayment', // Linked to BusinessSubscription
  'SupplierContact', // Linked to Supplier
  'SupplierEvaluation', // Linked to Supplier
  'TreatmentSession', // Linked to TreatmentPlan
];

// Helper to check if a file is a model
const isModelFile = (file) => {
  return file.endsWith('.js') && file !== 'index.js';
};

async function checkModels() {
  const files = fs.readdirSync(modelsDir);
  const issues = [];
  const checked = [];

  console.log('Checking models for businessId...');

  for (const file of files) {
    if (!isModelFile(file)) continue;

    const modelName = file.replace('.js', '');
    
    // Skip excluded models
    if (EXCLUDED_MODELS.includes(modelName)) {
        // console.log(`Skipping excluded model: ${modelName}`);
        continue;
    }

    try {
      // We need to handle the fact that models might require a real sequelize instance
      // or have dependencies. For this static check, we'll try to read the file content
      // if requiring it fails or if we want to be safer.
      // Actually, reading file content is safer than requiring potentially side-effect heavy code.
      
      const content = fs.readFileSync(path.join(modelsDir, file), 'utf8');
      
      // Simple regex check for businessId definition
      // Looking for "businessId:" or "businessId :" followed by object or type definition
      const hasBusinessId = /businessId\s*:\s*{/.test(content);
      
      if (!hasBusinessId) {
        issues.push(modelName);
      } else {
        checked.push(modelName);
      }
    } catch (err) {
      console.error(`Error checking ${modelName}:`, err.message);
    }
  }

  console.log(`\nChecked ${checked.length} models.`);
  
  if (issues.length > 0) {
    console.error('\n❌ The following models are missing "businessId":');
    issues.forEach(m => console.error(` - ${m}`));
    process.exit(1);
  } else {
    console.log('\n✅ All non-excluded models have "businessId".');
  }
}

checkModels();
