const BusinessRuleTemplate = require('./BusinessRuleTemplate');
const BusinessRuleAssignment = require('./BusinessRuleAssignment');
const BusinessRules = require('./BusinessRules');
const Business = require('./Business');
const User = require('./User');

// ================================
// RULE TEMPLATE ASSOCIATIONS
// ================================

// BusinessRuleTemplate belongs to User (creator)
BusinessRuleTemplate.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// User has many BusinessRuleTemplates
User.hasMany(BusinessRuleTemplate, {
  foreignKey: 'createdBy',
  as: 'createdRuleTemplates'
});

// BusinessRuleAssignment belongs to BusinessRuleTemplate
BusinessRuleAssignment.belongsTo(BusinessRuleTemplate, {
  foreignKey: 'ruleTemplateId',
  as: 'BusinessRuleTemplate'
});

// BusinessRuleTemplate has many BusinessRuleAssignments
BusinessRuleTemplate.hasMany(BusinessRuleAssignment, {
  foreignKey: 'ruleTemplateId',
  as: 'assignments'
});

// BusinessRuleAssignment belongs to Business
BusinessRuleAssignment.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business'
});

// Business has many BusinessRuleAssignments
Business.hasMany(BusinessRuleAssignment, {
  foreignKey: 'businessId',
  as: 'ruleAssignments'
});

// BusinessRuleAssignment belongs to User (assignedBy)
BusinessRuleAssignment.belongsTo(User, {
  foreignKey: 'assignedBy',
  as: 'assignedByUser'
});

// BusinessRuleAssignment belongs to User (modifiedBy)
BusinessRuleAssignment.belongsTo(User, {
  foreignKey: 'modifiedBy',
  as: 'modifiedByUser'
});

// User has many BusinessRuleAssignments (assigned)
User.hasMany(BusinessRuleAssignment, {
  foreignKey: 'assignedBy',
  as: 'assignedRules'
});

// BusinessRules belongs to BusinessRuleTemplate
BusinessRules.belongsTo(BusinessRuleTemplate, {
  foreignKey: 'ruleTemplateId',
  as: 'ruleTemplate'
});

// BusinessRuleTemplate has many BusinessRules
BusinessRuleTemplate.hasMany(BusinessRules, {
  foreignKey: 'ruleTemplateId',
  as: 'effectiveRules'
});

// BusinessRules belongs to BusinessRuleAssignment
BusinessRules.belongsTo(BusinessRuleAssignment, {
  foreignKey: 'ruleAssignmentId',
  as: 'assignment'
});

// BusinessRuleAssignment has one BusinessRules
BusinessRuleAssignment.hasOne(BusinessRules, {
  foreignKey: 'ruleAssignmentId',
  as: 'effectiveRule'
});

// BusinessRules belongs to Business
BusinessRules.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business'
});

// Business has many BusinessRules
Business.hasMany(BusinessRules, {
  foreignKey: 'businessId',
  as: 'businessRules'
});

module.exports = {
  BusinessRuleTemplate,
  BusinessRuleAssignment,
  BusinessRules,
  Business,
  User
};