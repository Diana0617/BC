const { sequelize } = require('../config/database');


// Importar modelos en orden de dependencias (sin referencias primero)
const SubscriptionPlan = require('./SubscriptionPlan');
const Module = require('./Module');
const Business = require('./Business');
const BusinessRules = require('./BusinessRules');
const User = require('./User');
const Client = require('./Client');
const Service = require('./Service');
const Product = require('./Product');
const Appointment = require('./Appointment');

// Modelos de relaciones (tablas intermedias)
const PlanModule = require('./PlanModule');
const BusinessSubscription = require('./BusinessSubscription');
const BusinessClient = require('./BusinessClient');
const InventoryMovement = require('./InventoryMovement');
const FinancialMovement = require('./FinancialMovement');
const PaymentIntegration = require('./PaymentIntegration');

// Definir asociaciones
// User - Business
User.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});
Business.hasMany(User, { 
  foreignKey: 'businessId', 
  as: 'users' 
});

// Business - BusinessRules (uno a uno)
Business.hasOne(BusinessRules, { 
  foreignKey: 'businessId', 
  as: 'rules' 
});
BusinessRules.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

// SubscriptionPlan - Module (muchos a muchos a través de PlanModule)
SubscriptionPlan.belongsToMany(Module, {
  through: PlanModule,
  foreignKey: 'subscriptionPlanId',
  otherKey: 'moduleId',
  as: 'modules'
});
Module.belongsToMany(SubscriptionPlan, {
  through: PlanModule,
  foreignKey: 'moduleId',
  otherKey: 'subscriptionPlanId',
  as: 'plans'
});

// Relaciones directas con PlanModule
SubscriptionPlan.hasMany(PlanModule, { 
  foreignKey: 'subscriptionPlanId', 
  as: 'planModules' 
});
Module.hasMany(PlanModule, { 
  foreignKey: 'moduleId', 
  as: 'planModules' 
});
PlanModule.belongsTo(SubscriptionPlan, { 
  foreignKey: 'subscriptionPlanId', 
  as: 'plan' 
});
PlanModule.belongsTo(Module, { 
  foreignKey: 'moduleId', 
  as: 'module' 
});

// Business - SubscriptionPlan (muchos a muchos a través de BusinessSubscription)
Business.belongsToMany(SubscriptionPlan, {
  through: BusinessSubscription,
  foreignKey: 'businessId',
  otherKey: 'subscriptionPlanId',
  as: 'subscriptionPlans'
});
SubscriptionPlan.belongsToMany(Business, {
  through: BusinessSubscription,
  foreignKey: 'subscriptionPlanId',
  otherKey: 'businessId',
  as: 'businesses'
});

// Relaciones directas con BusinessSubscription
Business.hasMany(BusinessSubscription, { 
  foreignKey: 'businessId', 
  as: 'subscriptions' 
});
SubscriptionPlan.hasMany(BusinessSubscription, { 
  foreignKey: 'subscriptionPlanId', 
  as: 'subscriptions' 
});
BusinessSubscription.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});
BusinessSubscription.belongsTo(SubscriptionPlan, { 
  foreignKey: 'subscriptionPlanId', 
  as: 'plan' 
});

// Business - Plan actual (relación directa)
Business.belongsTo(SubscriptionPlan, {
  foreignKey: 'currentPlanId',
  as: 'currentPlan'
});
SubscriptionPlan.hasMany(Business, {
  foreignKey: 'currentPlanId',
  as: 'activeBusinesses'
});

// Client - Business (muchos a muchos a través de BusinessClient)
Client.belongsToMany(Business, {
  through: BusinessClient,
  foreignKey: 'clientId',
  otherKey: 'businessId',
  as: 'businesses'
});
Business.belongsToMany(Client, {
  through: BusinessClient,
  foreignKey: 'businessId',
  otherKey: 'clientId',
  as: 'clients'
});

// Relaciones directas con BusinessClient
Client.hasMany(BusinessClient, { 
  foreignKey: 'clientId', 
  as: 'businessRelations' 
});
Business.hasMany(BusinessClient, { 
  foreignKey: 'businessId', 
  as: 'clientRelations' 
});
BusinessClient.belongsTo(Client, { 
  foreignKey: 'clientId', 
  as: 'client' 
});
BusinessClient.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});
BusinessClient.belongsTo(User, { 
  foreignKey: 'preferredSpecialistId', 
  as: 'preferredSpecialist' 
});

// Business - Service
Business.hasMany(Service, { 
  foreignKey: 'businessId', 
  as: 'services' 
});
Service.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

// Appointment relationships
Appointment.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});
Appointment.belongsTo(Client, { 
  foreignKey: 'clientId', 
  as: 'client' 
});
Appointment.belongsTo(User, { 
  foreignKey: 'specialistId', 
  as: 'specialist' 
});
Appointment.belongsTo(Service, { 
  foreignKey: 'serviceId', 
  as: 'service' 
});
Appointment.belongsTo(User, { 
  foreignKey: 'canceledBy', 
  as: 'canceledByUser' 
});

Business.hasMany(Appointment, { 
  foreignKey: 'businessId', 
  as: 'appointments' 
});
Client.hasMany(Appointment, { 
  foreignKey: 'clientId', 
  as: 'appointments' 
});
User.hasMany(Appointment, { 
  foreignKey: 'specialistId', 
  as: 'appointments' 
});
Service.hasMany(Appointment, { 
  foreignKey: 'serviceId', 
  as: 'appointments' 
});

// Product relationships
Business.hasMany(Product, { 
  foreignKey: 'businessId', 
  as: 'products' 
});
Product.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

// InventoryMovement relationships
InventoryMovement.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});
InventoryMovement.belongsTo(Product, { 
  foreignKey: 'productId', 
  as: 'product' 
});
InventoryMovement.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

Business.hasMany(InventoryMovement, { 
  foreignKey: 'businessId', 
  as: 'inventoryMovements' 
});
Product.hasMany(InventoryMovement, { 
  foreignKey: 'productId', 
  as: 'movements' 
});
User.hasMany(InventoryMovement, { 
  foreignKey: 'userId', 
  as: 'inventoryMovements' 
});

// FinancialMovement relationships
FinancialMovement.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});
FinancialMovement.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});
FinancialMovement.belongsTo(Client, { 
  foreignKey: 'clientId', 
  as: 'client' 
});

Business.hasMany(FinancialMovement, { 
  foreignKey: 'businessId', 
  as: 'financialMovements' 
});
User.hasMany(FinancialMovement, { 
  foreignKey: 'userId', 
  as: 'financialMovements' 
});
Client.hasMany(FinancialMovement, { 
  foreignKey: 'clientId', 
  as: 'financialMovements' 
});

// PaymentIntegration relationships
Business.hasMany(PaymentIntegration, { 
  foreignKey: 'businessId', 
  as: 'paymentIntegrations' 
});
PaymentIntegration.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

// Exportar modelos y sequelize
module.exports = {
  sequelize,
  User,
  Business,
  BusinessRules,
  SubscriptionPlan,
  Module,
  PlanModule,
  BusinessSubscription,
  Client,
  BusinessClient,
  Service,
  Appointment,
  Product,
  InventoryMovement,
  FinancialMovement,
  PaymentIntegration
};