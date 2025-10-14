const { sequelize } = require('../config/database');


// Importar modelos en orden de dependencias (sin referencias primero)
const SubscriptionPlan = require('./SubscriptionPlan');
const Module = require('./Module');
const Business = require('./Business');
const Branch = require('./Branch');
const User = require('./User');
const Client = require('./Client');
const Service = require('./Service');
const Product = require('./Product');

// Modelos de proveedores
const Supplier = require('./Supplier');
const SupplierContact = require('./SupplierContact');
const PurchaseOrder = require('./PurchaseOrder');
const SupplierInvoice = require('./SupplierInvoice');
const SupplierEvaluation = require('./SupplierEvaluation');
const SupplierCatalogItem = require('./SupplierCatalogItem');
const Appointment = require('./Appointment');
const PasswordResetToken = require('./PasswordResetToken');

// Modelos de configuración del negocio
const SpecialistProfile = require('./SpecialistProfile');
const SpecialistBranchSchedule = require('./SpecialistBranchSchedule');
const UserBranch = require('./UserBranch');
const SpecialistService = require('./SpecialistService');
const Schedule = require('./Schedule');
const TimeSlot = require('./TimeSlot');
const BusinessPaymentConfig = require('./BusinessPaymentConfig');

// Nuevos modelos simplificados de reglas
const RuleTemplate = require('./RuleTemplate');
const BusinessRule = require('./BusinessRule');

// Modelos de relaciones (tablas intermedias)
const PlanModule = require('./PlanModule');
const BusinessSubscription = require('./BusinessSubscription');
const BusinessClient = require('./BusinessClient');
const InventoryMovement = require('./InventoryMovement');

const FinancialMovement = require('./FinancialMovement');
const PaymentIntegration = require('./PaymentIntegration');

// Nuevos modelos de comisiones y documentos
const SpecialistDocument = require('./SpecialistDocument');
const SpecialistCommission = require('./SpecialistCommission');
const CommissionPaymentRequest = require('./CommissionPaymentRequest');
const CommissionDetail = require('./CommissionDetail');

// Modelo de recibos
const Receipt = require('./Receipt');

// Nuevos modelos de pagos OWNER
const OwnerPaymentConfiguration = require('./OwnerPaymentConfiguration');
const SubscriptionPayment = require('./SubscriptionPayment');
const OwnerFinancialReport = require('./OwnerFinancialReport');
const OwnerExpense = require('./OwnerExpense');
const SavedPaymentMethod = require('./SavedPaymentMethod');
const BusinessInvitation = require('./BusinessInvitation');

// Modelos de gastos del negocio
const BusinessExpenseCategory = require('./BusinessExpenseCategory');
const BusinessExpense = require('./BusinessExpense');

// Modelos de vouchers y penalizaciones
const Voucher = require('./Voucher');
const CustomerCancellationHistory = require('./CustomerCancellationHistory');
const CustomerBookingBlock = require('./CustomerBookingBlock');

// Modelos de comisiones y consentimientos
const BusinessCommissionConfig = require('./BusinessCommissionConfig');
const ServiceCommission = require('./ServiceCommission');
const ConsentTemplate = require('./ConsentTemplate');
const ConsentSignature = require('./ConsentSignature');

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

// Business - Branch
Business.hasMany(Branch, {
  foreignKey: 'businessId',
  as: 'branches'
});
Branch.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business'
});

// Branch - Specialist (muchos a muchos a través de SpecialistBranchSchedule)
Branch.belongsToMany(SpecialistProfile, {
  through: SpecialistBranchSchedule,
  foreignKey: 'branchId',
  otherKey: 'specialistId',
  as: 'specialists'
});
SpecialistProfile.belongsToMany(Branch, {
  through: SpecialistBranchSchedule,
  foreignKey: 'specialistId',
  otherKey: 'branchId',
  as: 'branches'
});

// Relaciones directas con SpecialistBranchSchedule
SpecialistBranchSchedule.belongsTo(SpecialistProfile, {
  foreignKey: 'specialistId',
  as: 'specialist'
});
SpecialistBranchSchedule.belongsTo(Branch, {
  foreignKey: 'branchId',
  as: 'branch'
});
Branch.hasMany(SpecialistBranchSchedule, {
  foreignKey: 'branchId',
  as: 'specialistSchedules'
});
SpecialistProfile.hasMany(SpecialistBranchSchedule, {
  foreignKey: 'specialistId',
  as: 'branchSchedules'
});

// ==================== NUEVAS ASOCIACIONES MULTI-BRANCH ====================

// User - Branch (muchos a muchos a través de UserBranch)
// Permite que recepcionistas y especialistas trabajen en múltiples sucursales
User.belongsToMany(Branch, {
  through: UserBranch,
  foreignKey: 'userId',
  otherKey: 'branchId',
  as: 'branches'
});
Branch.belongsToMany(User, {
  through: UserBranch,
  foreignKey: 'branchId',
  otherKey: 'userId',
  as: 'assignedUsers'
});

// Relaciones directas con UserBranch
UserBranch.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});
UserBranch.belongsTo(Branch, {
  foreignKey: 'branchId',
  as: 'branch'
});
UserBranch.belongsTo(User, {
  foreignKey: 'assignedBy',
  as: 'assigner'
});
User.hasMany(UserBranch, {
  foreignKey: 'userId',
  as: 'userBranches'
});
Branch.hasMany(UserBranch, {
  foreignKey: 'branchId',
  as: 'branchUsers'
});

// User (Specialist) - Service (muchos a muchos a través de SpecialistService)
// Permite que cada especialista tenga precios personalizados por servicio
User.belongsToMany(Service, {
  through: SpecialistService,
  foreignKey: 'specialistId',
  otherKey: 'serviceId',
  as: 'specialistServices'
});
Service.belongsToMany(User, {
  through: SpecialistService,
  foreignKey: 'serviceId',
  otherKey: 'specialistId',
  as: 'specialists'
});

// Relaciones directas con SpecialistService
SpecialistService.belongsTo(User, {
  foreignKey: 'specialistId',
  as: 'specialist'
});
SpecialistService.belongsTo(Service, {
  foreignKey: 'serviceId',
  as: 'service'
});
SpecialistService.belongsTo(User, {
  foreignKey: 'assignedBy',
  as: 'assigner'
});
User.hasMany(SpecialistService, {
  foreignKey: 'specialistId',
  as: 'serviceAssignments'
});
Service.hasMany(SpecialistService, {
  foreignKey: 'serviceId',
  as: 'specialistAssignments'
});

// ==================== FIN NUEVAS ASOCIACIONES ====================


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
Appointment.belongsTo(Branch, {
  foreignKey: 'branchId',
  as: 'branch'
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

// ================================
// COMISIONES - Relaciones
// ================================

// Business - BusinessCommissionConfig (uno a uno)
Business.hasOne(BusinessCommissionConfig, {
  foreignKey: 'businessId',
  as: 'commissionConfig'
});
BusinessCommissionConfig.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business'
});

// Service - ServiceCommission (uno a uno)
Service.hasOne(ServiceCommission, {
  foreignKey: 'serviceId',
  as: 'commission'
});
ServiceCommission.belongsTo(Service, {
  foreignKey: 'serviceId',
  as: 'service'
});

// ================================
// CONSENTIMIENTOS - Relaciones
// ================================

// Business - ConsentTemplate (uno a muchos)
Business.hasMany(ConsentTemplate, {
  foreignKey: 'businessId',
  as: 'consentTemplates'
});
ConsentTemplate.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business'
});

// Service - ConsentTemplate (muchos a uno - servicio puede tener un template por defecto)
Service.belongsTo(ConsentTemplate, {
  foreignKey: 'consentTemplateId',
  as: 'consentTemplate'
});
ConsentTemplate.hasMany(Service, {
  foreignKey: 'consentTemplateId',
  as: 'services'
});

// ConsentTemplate - ConsentSignature (uno a muchos)
ConsentTemplate.hasMany(ConsentSignature, {
  foreignKey: 'consentTemplateId',
  as: 'signatures'
});
ConsentSignature.belongsTo(ConsentTemplate, {
  foreignKey: 'consentTemplateId',
  as: 'template'
});

// Business - ConsentSignature (uno a muchos)
Business.hasMany(ConsentSignature, {
  foreignKey: 'businessId',
  as: 'consentSignatures'
});
ConsentSignature.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business'
});

// Client - ConsentSignature (uno a muchos)
Client.hasMany(ConsentSignature, {
  foreignKey: 'customerId',
  as: 'consentSignatures'
});
ConsentSignature.belongsTo(Client, {
  foreignKey: 'customerId',
  as: 'customer'
});

// Service - ConsentSignature (uno a muchos - opcional)
Service.hasMany(ConsentSignature, {
  foreignKey: 'serviceId',
  as: 'consentSignatures'
});
ConsentSignature.belongsTo(Service, {
  foreignKey: 'serviceId',
  as: 'service'
});

// Appointment - ConsentSignature (uno a muchos - opcional)
Appointment.hasMany(ConsentSignature, {
  foreignKey: 'appointmentId',
  as: 'consentSignatures'
});
ConsentSignature.belongsTo(Appointment, {
  foreignKey: 'appointmentId',
  as: 'appointment'
});

// User - ConsentSignature (quien revocó)
User.hasMany(ConsentSignature, {
  foreignKey: 'revokedBy',
  as: 'revokedConsentSignatures'
});
ConsentSignature.belongsTo(User, {
  foreignKey: 'revokedBy',
  as: 'revokedByUser'
});

// Receipt relationships
Receipt.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});
Receipt.belongsTo(Appointment, { 
  foreignKey: 'appointmentId', 
  as: 'appointment' 
});
Receipt.belongsTo(User, { 
  foreignKey: 'specialistId', 
  as: 'specialist' 
});
Receipt.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});
Receipt.belongsTo(User, { 
  foreignKey: 'createdBy', 
  as: 'creator' 
});

Business.hasMany(Receipt, { 
  foreignKey: 'businessId', 
  as: 'receipts' 
});
Appointment.hasOne(Receipt, { 
  foreignKey: 'appointmentId', 
  as: 'receipt' 
});
User.hasMany(Receipt, { 
  foreignKey: 'specialistId', 
  as: 'specialistReceipts' 
});
User.hasMany(Receipt, { 
  foreignKey: 'userId', 
  as: 'clientReceipts' 
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

// ================================
// SUPPLIER RELATIONSHIPS
// ================================

// Supplier relationships
Business.hasMany(Supplier, { 
  foreignKey: 'businessId', 
  as: 'suppliers' 
});
Supplier.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

// SupplierContact relationships
Supplier.hasMany(SupplierContact, { 
  foreignKey: 'supplierId', 
  as: 'contacts' 
});
SupplierContact.belongsTo(Supplier, { 
  foreignKey: 'supplierId', 
  as: 'supplier' 
});

// PurchaseOrder relationships
Business.hasMany(PurchaseOrder, { 
  foreignKey: 'businessId', 
  as: 'purchaseOrders' 
});
Supplier.hasMany(PurchaseOrder, { 
  foreignKey: 'supplierId', 
  as: 'purchaseOrders' 
});
PurchaseOrder.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});
PurchaseOrder.belongsTo(Supplier, { 
  foreignKey: 'supplierId', 
  as: 'supplier' 
});

// SupplierInvoice relationships
Business.hasMany(SupplierInvoice, { 
  foreignKey: 'businessId', 
  as: 'supplierInvoices' 
});
Supplier.hasMany(SupplierInvoice, { 
  foreignKey: 'supplierId', 
  as: 'invoices' 
});
PurchaseOrder.hasMany(SupplierInvoice, { 
  foreignKey: 'purchaseOrderId', 
  as: 'invoices' 
});
SupplierInvoice.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});
SupplierInvoice.belongsTo(Supplier, { 
  foreignKey: 'supplierId', 
  as: 'supplier' 
});
SupplierInvoice.belongsTo(PurchaseOrder, { 
  foreignKey: 'purchaseOrderId', 
  as: 'purchaseOrder' 
});

// SupplierEvaluation relationships
Supplier.hasMany(SupplierEvaluation, { 
  foreignKey: 'supplierId', 
  as: 'evaluations' 
});
User.hasMany(SupplierEvaluation, { 
  foreignKey: 'evaluatedBy', 
  as: 'supplierEvaluations' 
});
SupplierEvaluation.belongsTo(Supplier, { 
  foreignKey: 'supplierId', 
  as: 'supplier' 
});
SupplierEvaluation.belongsTo(User, { 
  foreignKey: 'evaluatedBy', 
  as: 'evaluator' 
});

// SupplierCatalogItem relationships
Supplier.hasMany(SupplierCatalogItem, { 
  foreignKey: 'supplierId', 
  as: 'catalogItems' 
});
SupplierCatalogItem.belongsTo(Supplier, { 
  foreignKey: 'supplierId', 
  as: 'supplier' 
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

// ==================== BUSINESS EXPENSE RELATIONSHIPS ====================

// BusinessExpenseCategory - Business
Business.hasMany(BusinessExpenseCategory, {
  foreignKey: 'businessId',
  as: 'expenseCategories'
});
BusinessExpenseCategory.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business'
});
BusinessExpenseCategory.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// BusinessExpenseCategory - BusinessExpense
BusinessExpenseCategory.hasMany(BusinessExpense, {
  foreignKey: 'categoryId',
  as: 'expenses'
});
BusinessExpense.belongsTo(BusinessExpenseCategory, {
  foreignKey: 'categoryId',
  as: 'category'
});

// BusinessExpense - Business
Business.hasMany(BusinessExpense, {
  foreignKey: 'businessId',
  as: 'expenses'
});
BusinessExpense.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business'
});

// BusinessExpense - User (creator and approver)
BusinessExpense.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});
BusinessExpense.belongsTo(User, {
  foreignKey: 'approvedBy',
  as: 'approver'
});
User.hasMany(BusinessExpense, {
  foreignKey: 'createdBy',
  as: 'createdBusinessExpenses'
});
User.hasMany(BusinessExpense, {
  foreignKey: 'approvedBy',
  as: 'approvedBusinessExpenses'
});

// FinancialMovement - BusinessExpenseCategory
FinancialMovement.belongsTo(BusinessExpenseCategory, {
  foreignKey: 'businessExpenseCategoryId',
  as: 'expenseCategory'
});
BusinessExpenseCategory.hasMany(FinancialMovement, {
  foreignKey: 'businessExpenseCategoryId',
  as: 'financialMovements'
});

// FinancialMovement - BusinessExpense
FinancialMovement.belongsTo(BusinessExpense, {
  foreignKey: 'businessExpenseId',
  as: 'expense'
});
BusinessExpense.hasOne(FinancialMovement, {
  foreignKey: 'businessExpenseId',
  as: 'financialMovement'
});

// ==================== END BUSINESS EXPENSE RELATIONSHIPS ====================

// ==================== VOUCHER & CANCELLATION RELATIONSHIPS ====================

// Voucher - Business
Voucher.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business'
});
Business.hasMany(Voucher, {
  foreignKey: 'businessId',
  as: 'vouchers'
});

// Voucher - Customer (User)
Voucher.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer'
});
User.hasMany(Voucher, {
  foreignKey: 'customerId',
  as: 'vouchers'
});

// Voucher - Appointment (Original)
Voucher.belongsTo(Appointment, {
  foreignKey: 'originalBookingId',
  as: 'originalBooking'
});
Appointment.hasOne(Voucher, {
  foreignKey: 'originalBookingId',
  as: 'generatedVoucher'
});

// Voucher - Appointment (Used in)
Voucher.belongsTo(Appointment, {
  foreignKey: 'usedInBookingId',
  as: 'usedInBooking'
});
Appointment.hasOne(Voucher, {
  foreignKey: 'usedInBookingId',
  as: 'appliedVoucher'
});

// CustomerCancellationHistory - Business
CustomerCancellationHistory.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business'
});
Business.hasMany(CustomerCancellationHistory, {
  foreignKey: 'businessId',
  as: 'cancellationHistory'
});

// CustomerCancellationHistory - Customer (User)
CustomerCancellationHistory.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer'
});
User.hasMany(CustomerCancellationHistory, {
  foreignKey: 'customerId',
  as: 'cancellationHistory'
});

// CustomerCancellationHistory - Appointment
CustomerCancellationHistory.belongsTo(Appointment, {
  foreignKey: 'bookingId',
  as: 'booking'
});
Appointment.hasOne(CustomerCancellationHistory, {
  foreignKey: 'bookingId',
  as: 'cancellationRecord'
});

// CustomerCancellationHistory - Voucher
CustomerCancellationHistory.belongsTo(Voucher, {
  foreignKey: 'voucherId',
  as: 'voucher'
});
Voucher.hasOne(CustomerCancellationHistory, {
  foreignKey: 'voucherId',
  as: 'cancellationRecord'
});

// CustomerBookingBlock - Business
CustomerBookingBlock.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business'
});
Business.hasMany(CustomerBookingBlock, {
  foreignKey: 'businessId',
  as: 'customerBlocks'
});

// CustomerBookingBlock - Customer (User)
CustomerBookingBlock.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer'
});
User.hasMany(CustomerBookingBlock, {
  foreignKey: 'customerId',
  as: 'bookingBlocks'
});

// CustomerBookingBlock - LiftedBy (User)
CustomerBookingBlock.belongsTo(User, {
  foreignKey: 'liftedBy',
  as: 'lifter'
});
User.hasMany(CustomerBookingBlock, {
  foreignKey: 'liftedBy',
  as: 'liftedBlocks'
});

// ==================== END VOUCHER & CANCELLATION RELATIONSHIPS ====================

// PaymentIntegration relationships
Business.hasMany(PaymentIntegration, { 
  foreignKey: 'businessId', 
  as: 'paymentIntegrations' 
});
PaymentIntegration.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

// PasswordResetToken relationships
User.hasMany(PasswordResetToken, { 
  foreignKey: 'userId', 
  as: 'passwordResetTokens' 
});
PasswordResetToken.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// === NUEVAS ASOCIACIONES DE COMISIONES Y DOCUMENTOS ===

// SpecialistDocument relationships
User.hasMany(SpecialistDocument, { 
  foreignKey: 'specialistId', 
  as: 'documents' 
});
SpecialistDocument.belongsTo(User, { 
  foreignKey: 'specialistId', 
  as: 'specialist' 
});

Business.hasMany(SpecialistDocument, { 
  foreignKey: 'businessId', 
  as: 'specialistDocuments' 
});
SpecialistDocument.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

User.hasMany(SpecialistDocument, { 
  foreignKey: 'uploadedBy', 
  as: 'uploadedDocuments' 
});
SpecialistDocument.belongsTo(User, { 
  foreignKey: 'uploadedBy', 
  as: 'uploader' 
});

User.hasMany(SpecialistDocument, { 
  foreignKey: 'approvedBy', 
  as: 'approvedDocuments' 
});
SpecialistDocument.belongsTo(User, { 
  foreignKey: 'approvedBy', 
  as: 'approver' 
});

// SpecialistCommission relationships
User.hasMany(SpecialistCommission, { 
  foreignKey: 'specialistId', 
  as: 'commissions' 
});
SpecialistCommission.belongsTo(User, { 
  foreignKey: 'specialistId', 
  as: 'specialist' 
});

Business.hasMany(SpecialistCommission, { 
  foreignKey: 'businessId', 
  as: 'specialistCommissions' 
});
SpecialistCommission.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

Service.hasMany(SpecialistCommission, { 
  foreignKey: 'serviceId', 
  as: 'commissions' 
});
SpecialistCommission.belongsTo(Service, { 
  foreignKey: 'serviceId', 
  as: 'service' 
});

User.hasMany(SpecialistCommission, { 
  foreignKey: 'createdBy', 
  as: 'createdCommissions' 
});
SpecialistCommission.belongsTo(User, { 
  foreignKey: 'createdBy', 
  as: 'creator' 
});

// CommissionPaymentRequest relationships
User.hasMany(CommissionPaymentRequest, { 
  foreignKey: 'specialistId', 
  as: 'paymentRequests' 
});
CommissionPaymentRequest.belongsTo(User, { 
  foreignKey: 'specialistId', 
  as: 'specialist' 
});

Business.hasMany(CommissionPaymentRequest, { 
  foreignKey: 'businessId', 
  as: 'commissionPaymentRequests' 
});
CommissionPaymentRequest.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

User.hasMany(CommissionPaymentRequest, { 
  foreignKey: 'reviewedBy', 
  as: 'reviewedPaymentRequests' 
});
CommissionPaymentRequest.belongsTo(User, { 
  foreignKey: 'reviewedBy', 
  as: 'reviewer' 
});

User.hasMany(CommissionPaymentRequest, { 
  foreignKey: 'paidBy', 
  as: 'paidPaymentRequests' 
});
CommissionPaymentRequest.belongsTo(User, { 
  foreignKey: 'paidBy', 
  as: 'payer' 
});

// CommissionDetail relationships
CommissionPaymentRequest.hasMany(CommissionDetail, { 
  foreignKey: 'paymentRequestId', 
  as: 'details' 
});
CommissionDetail.belongsTo(CommissionPaymentRequest, { 
  foreignKey: 'paymentRequestId', 
  as: 'paymentRequest' 
});

Appointment.hasMany(CommissionDetail, { 
  foreignKey: 'appointmentId', 
  as: 'commissionDetails' 
});
CommissionDetail.belongsTo(Appointment, { 
  foreignKey: 'appointmentId', 
  as: 'appointment' 
});

Service.hasMany(CommissionDetail, { 
  foreignKey: 'serviceId', 
  as: 'commissionDetails' 
});
CommissionDetail.belongsTo(Service, { 
  foreignKey: 'serviceId', 
  as: 'service' 
});

Client.hasMany(CommissionDetail, { 
  foreignKey: 'clientId', 
  as: 'commissionDetails' 
});
CommissionDetail.belongsTo(Client, { 
  foreignKey: 'clientId', 
  as: 'client' 
});

// ===============================
// ASOCIACIONES PAGOS OWNER
// ===============================

// BusinessSubscription - SubscriptionPayment (uno a muchos)
BusinessSubscription.hasMany(SubscriptionPayment, { 
  foreignKey: 'businessSubscriptionId', 
  as: 'payments' 
});
SubscriptionPayment.belongsTo(BusinessSubscription, { 
  foreignKey: 'businessSubscriptionId', 
  as: 'subscription' 
});

// OwnerPaymentConfiguration - SubscriptionPayment (uno a muchos)
OwnerPaymentConfiguration.hasMany(SubscriptionPayment, { 
  foreignKey: 'paymentConfigurationId', 
  as: 'payments' 
});
SubscriptionPayment.belongsTo(OwnerPaymentConfiguration, { 
  foreignKey: 'paymentConfigurationId', 
  as: 'paymentConfiguration' 
});

// User - SubscriptionPayment (para el usuario que subió el comprobante)
User.hasMany(SubscriptionPayment, { 
  foreignKey: 'receiptUploadedBy', 
  as: 'uploadedReceipts' 
});
SubscriptionPayment.belongsTo(User, { 
  foreignKey: 'receiptUploadedBy', 
  as: 'receiptUploader' 
});

// User - OwnerExpense (usuario que crea y aprueba gastos)
User.hasMany(OwnerExpense, { 
  foreignKey: 'createdBy', 
  as: 'createdExpenses' 
});
OwnerExpense.belongsTo(User, { 
  foreignKey: 'createdBy', 
  as: 'creator' 
});

User.hasMany(OwnerExpense, { 
  foreignKey: 'approvedBy', 
  as: 'approvedExpenses' 
});
OwnerExpense.belongsTo(User, { 
  foreignKey: 'approvedBy', 
  as: 'approver' 
});

// Business - BusinessInvitation (uno a muchos)
Business.hasMany(BusinessInvitation, { 
  foreignKey: 'businessId', 
  as: 'invitations' 
});
BusinessInvitation.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

// SubscriptionPlan - BusinessInvitation (uno a muchos)
SubscriptionPlan.hasMany(BusinessInvitation, { 
  foreignKey: 'planId', 
  as: 'invitations' 
});
BusinessInvitation.belongsTo(SubscriptionPlan, { 
  foreignKey: 'planId', 
  as: 'plan' 
});

// ==================== RELACIONES DE CONFIGURACIÓN DEL NEGOCIO ====================

// User - SpecialistProfile (uno a uno)
User.hasOne(SpecialistProfile, { 
  foreignKey: 'userId', 
  as: 'specialistProfile' 
});
SpecialistProfile.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// Business - SpecialistProfile (uno a muchos)
Business.hasMany(SpecialistProfile, { 
  foreignKey: 'businessId', 
  as: 'specialistProfiles' 
});
SpecialistProfile.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

// Business - Schedule (uno a muchos)
Business.hasMany(Schedule, { 
  foreignKey: 'businessId', 
  as: 'schedules' 
});
Schedule.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

// User - Schedule (uno a muchos) - Para especialistas
User.hasMany(Schedule, { 
  foreignKey: 'specialistId', 
  as: 'schedules' 
});
Schedule.belongsTo(User, { 
  foreignKey: 'specialistId', 
  as: 'specialist' 
});

// User - Schedule (createdBy)
User.hasMany(Schedule, { 
  foreignKey: 'createdBy', 
  as: 'createdSchedules' 
});
Schedule.belongsTo(User, { 
  foreignKey: 'createdBy', 
  as: 'createdByUser' 
});

// User - Schedule (updatedBy)
User.hasMany(Schedule, { 
  foreignKey: 'updatedBy', 
  as: 'updatedSchedules' 
});
Schedule.belongsTo(User, { 
  foreignKey: 'updatedBy', 
  as: 'updatedByUser' 
});

// Schedule - TimeSlot (uno a muchos)
Schedule.hasMany(TimeSlot, { 
  foreignKey: 'scheduleId', 
  as: 'timeSlots' 
});
TimeSlot.belongsTo(Schedule, { 
  foreignKey: 'scheduleId', 
  as: 'schedule' 
});

// Business - TimeSlot (uno a muchos)
Business.hasMany(TimeSlot, { 
  foreignKey: 'businessId', 
  as: 'timeSlots' 
});
TimeSlot.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

// User - TimeSlot (especialista)
User.hasMany(TimeSlot, { 
  foreignKey: 'specialistId', 
  as: 'timeSlots' 
});
TimeSlot.belongsTo(User, { 
  foreignKey: 'specialistId', 
  as: 'specialist' 
});

// Appointment - TimeSlot (uno a uno)
Appointment.hasOne(TimeSlot, { 
  foreignKey: 'appointmentId', 
  as: 'timeSlot' 
});
TimeSlot.belongsTo(Appointment, { 
  foreignKey: 'appointmentId', 
  as: 'appointment' 
});

// Service - TimeSlot (uno a muchos)
Service.hasMany(TimeSlot, { 
  foreignKey: 'serviceId', 
  as: 'timeSlots' 
});
TimeSlot.belongsTo(Service, { 
  foreignKey: 'serviceId', 
  as: 'service' 
});

// User - TimeSlot (lastModifiedBy)
User.hasMany(TimeSlot, { 
  foreignKey: 'lastModifiedBy', 
  as: 'modifiedTimeSlots' 
});
TimeSlot.belongsTo(User, { 
  foreignKey: 'lastModifiedBy', 
  as: 'lastModifiedByUser' 
});

// Business - BusinessPaymentConfig (uno a uno)
Business.hasOne(BusinessPaymentConfig, { 
  foreignKey: 'businessId', 
  as: 'paymentConfig' 
});
BusinessPaymentConfig.belongsTo(Business, { 
  foreignKey: 'businessId', 
  as: 'business' 
});

// User - BusinessPaymentConfig (activatedBy)
User.hasMany(BusinessPaymentConfig, { 
  foreignKey: 'activatedBy', 
  as: 'activatedPaymentConfigs' 
});
BusinessPaymentConfig.belongsTo(User, { 
  foreignKey: 'activatedBy', 
  as: 'activatedByUser' 
});





// ================================
// NUEVAS ASOCIACIONES SIMPLIFICADAS
// ================================

// RuleTemplate has many BusinessRule (one template can be used by many businesses)
RuleTemplate.hasMany(BusinessRule, {
  foreignKey: 'ruleTemplateId',
  as: 'businessRules',
  onDelete: 'CASCADE'
});

// BusinessRule belongs to RuleTemplate
BusinessRule.belongsTo(RuleTemplate, {
  foreignKey: 'ruleTemplateId',
  as: 'template'
});

// Business has many BusinessRule (one business can have many rules)
Business.hasMany(BusinessRule, {
  foreignKey: 'businessId',
  as: 'businessRules',
  onDelete: 'CASCADE'
});

// BusinessRule belongs to Business
BusinessRule.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business'
});

// BusinessRule belongs to User (updatedBy)
BusinessRule.belongsTo(User, {
  foreignKey: 'updatedBy',
  as: 'updatedByUser'
});

// User has many BusinessRule (updated by)
User.hasMany(BusinessRule, {
  foreignKey: 'updatedBy',
  as: 'updatedBusinessRules'
});

// Exportar modelos y sequelize
module.exports = {
  sequelize,
  User,
  Business,
  Branch,
  SpecialistBranchSchedule,
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
  // Modelos de proveedores
  Supplier,
  SupplierContact,
  PurchaseOrder,
  SupplierInvoice,
  SupplierEvaluation,
  SupplierCatalogItem,
  FinancialMovement,
  PaymentIntegration,
  PasswordResetToken,
  // Modelos de comisiones especialistas
  SpecialistDocument,
  SpecialistCommission,
  CommissionPaymentRequest,
  CommissionDetail,
  // Modelo de recibos
  Receipt,
  // Modelos de configuración del negocio
  SpecialistProfile,
  Schedule,
  TimeSlot,
  BusinessPaymentConfig,
  SpecialistBranchSchedule,
  UserBranch,
  SpecialistService,
  // Nuevos modelos simplificados de reglas
  RuleTemplate,
  BusinessRule,
  // Modelos de pagos OWNER
  OwnerPaymentConfiguration,
  SubscriptionPayment,
  OwnerFinancialReport,
  OwnerExpense,
  SavedPaymentMethod,
  BusinessInvitation,
  // Modelos de gastos del negocio
  BusinessExpenseCategory,
  BusinessExpense,
  // Modelos de vouchers y penalizaciones
  Voucher,
  CustomerCancellationHistory,
  CustomerBookingBlock,
  // Modelos de comisiones y consentimientos
  BusinessCommissionConfig,
  ServiceCommission,
  ConsentTemplate,
  ConsentSignature
};