// 💳 ADVANCE PAYMENT TYPES

export interface AdvancePaymentInfo {
  appointmentId: string;
  required: boolean;
  amount: number;
  percentage: number;
  status: AdvancePaymentStatus;
  wompiReference?: string;
  paymentLink?: string;
  wompiPublicKey?: string;
  paidAt?: string;
  transactionData?: WompiTransactionData;
}

export type AdvancePaymentStatus = 
  | 'NOT_REQUIRED'
  | 'PENDING' 
  | 'PAID' 
  | 'FAILED' 
  | 'REFUNDED';

export interface WompiTransactionData {
  transactionId: string;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface AdvancePaymentCustomerData {
  email: string;
  phone: string;
  fullName: string;
  documentType?: string;
  documentNumber?: string;
}

export interface AdvancePaymentConfig {
  requireDeposit: boolean;
  depositPercentage: number;
  depositMinAmount: number;
  allowPartialPayments: boolean;
  autoRefundCancellations: boolean;
}

export interface AdvancePaymentRequest {
  appointmentId: string;
  businessId: string;
  customerData: AdvancePaymentCustomerData;
}

export interface AdvancePaymentResponse {
  success: boolean;
  paymentLink: string;
  wompiReference: string;
  wompiPublicKey: string;
  amount: number;
  expirationTime: string;
}

export interface AdvancePaymentStatusResponse {
  appointmentId: string;
  status: AdvancePaymentStatus;
  amount: number;
  paidAt?: string;
  transactionData?: WompiTransactionData;
  canProceed: boolean;
}

export interface AdvancePaymentHistory {
  appointmentId: string;
  transactions: Array<{
    id: string;
    type: 'PAYMENT' | 'REFUND';
    amount: number;
    status: AdvancePaymentStatus;
    wompiReference: string;
    createdAt: string;
    completedAt?: string;
    metadata?: Record<string, any>;
  }>;
}

export interface AdvancePaymentStats {
  totalAdvancePayments: number;
  totalAmount: number;
  pendingPayments: number;
  pendingAmount: number;
  paidPayments: number;
  paidAmount: number;
  failedPayments: number;
  refundedPayments: number;
  refundedAmount: number;
  averagePaymentTime: number; // minutes
  conversionRate: number; // percentage
}

export interface AdvancePaymentRefundRequest {
  appointmentId: string;
  businessId: string;
  reason: string;
  amount?: number; // optional, default: full amount
  metadata?: Record<string, any>;
}

export interface AdvancePaymentRefundResponse {
  success: boolean;
  refundId: string;
  amount: number;
  estimatedRefundTime: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

// 🔐 BUSINESS VALIDATION TYPES

export interface BusinessAccessValidation {
  businessId: string;
  hasAccess: boolean;
  userRole: BusinessUserRole;
  permissions: BusinessPermission[];
  businessData?: BusinessBasicInfo;
  restrictions?: AccessRestriction[];
}

export type BusinessUserRole = 
  | 'OWNER'
  | 'ADMIN' 
  | 'SPECIALIST'
  | 'RECEPTIONIST'
  | 'VIEWER';

export type BusinessPermission = 
  | 'READ_APPOINTMENTS'
  | 'WRITE_APPOINTMENTS'
  | 'DELETE_APPOINTMENTS'
  | 'READ_CLIENTS'
  | 'WRITE_CLIENTS'
  | 'READ_INVENTORY'
  | 'WRITE_INVENTORY'
  | 'READ_PAYMENTS'
  | 'WRITE_PAYMENTS'
  | 'READ_REPORTS'
  | 'MANAGE_STAFF'
  | 'MANAGE_SETTINGS'
  | 'MANAGE_BILLING'
  | 'SUPER_ADMIN';

export interface BusinessBasicInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: BusinessStatus;
  planType: string;
  subscriptionStatus: string;
}

export type BusinessStatus = 
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'TRIAL'
  | 'EXPIRED'
  | 'PENDING_SETUP';

export interface AccessRestriction {
  type: 'TIME_LIMIT' | 'IP_RESTRICTION' | 'FEATURE_LIMIT';
  description: string;
  active: boolean;
  metadata?: Record<string, any>;
}

export interface AccessibleBusiness {
  id: string;
  name: string;
  role: BusinessUserRole;
  permissions: BusinessPermission[];
  status: BusinessStatus;
  lastAccessed?: string;
  isActive: boolean;
}

export interface BusinessValidationRequest {
  businessId: string;
  userId?: string;
  requestedAction?: string;
  requestedResource?: string;
}

export interface BusinessValidationResponse {
  valid: boolean;
  businessId: string;
  hasAccess: boolean;
  userRole: BusinessUserRole;
  permissions: BusinessPermission[];
  businessData: BusinessBasicInfo;
  restrictions: AccessRestriction[];
  validUntil?: string;
}

export interface MultipleBusinessValidation {
  businessIds: string[];
  results: Array<{
    businessId: string;
    hasAccess: boolean;
    role?: BusinessUserRole;
    error?: string;
  }>;
}

export interface BusinessPermissionCheck {
  businessId: string;
  permission: BusinessPermission;
  hasPermission: boolean;
  reason?: string;
}

export interface BusinessActionCheck {
  businessId: string;
  action: string;
  resource: string;
  allowed: boolean;
  reason?: string;
  requiredPermissions: BusinessPermission[];
}

export interface BusinessAccessHistory {
  id: string;
  businessId: string;
  userId: string;
  action: string;
  resource?: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface BusinessUsageStats {
  businessId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  uniqueUsers: number;
  averageResponseTime: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  timeRange: {
    from: string;
    to: string;
  };
}

export interface BusinessLimits {
  businessId: string;
  planLimits: {
    maxUsers: number;
    maxAppointments: number;
    maxStorage: number; // MB
    maxApiCalls: number; // per month
  };
  currentUsage: {
    users: number;
    appointments: number;
    storage: number; // MB
    apiCalls: number; // current month
  };
  warnings: Array<{
    type: 'APPROACHING_LIMIT' | 'LIMIT_EXCEEDED';
    resource: string;
    current: number;
    limit: number;
    percentage: number;
  }>;
}

export interface UnauthorizedAccessReport {
  businessId: string;
  attemptedAction: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface MultitenancyConfig {
  enabled: boolean;
  strictValidation: boolean;
  allowCrossBusiness: boolean;
  cacheValidationMinutes: number;
  maxBusinessesPerUser: number;
  requireExplicitPermissions: boolean;
}

// 🎯 REDUX STATE TYPES

export interface AdvancePaymentState {
  loading: {
    checkingRequired: boolean;
    initiating: boolean;
    checkingStatus: boolean;
    loadingConfig: boolean;
  };
  errors: {
    checkRequired: string | null;
    initiate: string | null;
    checkStatus: string | null;
    config: string | null;
  };
  currentPayment: AdvancePaymentInfo;
  businessConfig: AdvancePaymentConfig;
  paymentsHistory: Record<string, AdvancePaymentInfo>;
  ui: {
    showPaymentModal: boolean;
    selectedAppointmentId: string | null;
    paymentInProgress: boolean;
  };
}

export interface BusinessValidationState {
  loading: {
    validatingAccess: boolean;
    loadingBusinesses: boolean;
    switchingBusiness: boolean;
    checkingPermission: boolean;
  };
  errors: {
    validation: string | null;
    businesses: string | null;
    switching: string | null;
    permission: string | null;
  };
  activeBusiness: {
    id: string | null;
    name: string | null;
    hasAccess: boolean;
    permissions: BusinessPermission[];
    role: BusinessUserRole | null;
    isOwner: boolean;
  };
  accessibleBusinesses: AccessibleBusiness[];
  validationCache: Record<string, BusinessAccessValidation & { cachedAt: number }>;
  multitenancy: MultitenancyConfig;
  ui: {
    showBusinessSelector: boolean;
    businessSelectorLoading: boolean;
    selectedBusinessId: string | null;
  };
}

// 🔄 API RESPONSE WRAPPERS

export interface AdvancePaymentApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface BusinessValidationApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// 🎨 UI COMPONENT PROPS

export interface AdvancePaymentModalProps {
  appointmentId: string;
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentData: AdvancePaymentInfo) => void;
  onPaymentError: (error: string) => void;
}

export interface BusinessSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onBusinessSelect: (businessId: string) => void;
  currentBusinessId?: string;
}

export interface AdvancePaymentStatusProps {
  appointmentId: string;
  businessId: string;
  showDetails?: boolean;
  onStatusChange?: (status: AdvancePaymentStatus) => void;
}

export interface BusinessValidationGuardProps {
  businessId: string;
  requiredPermissions?: BusinessPermission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// 🔧 UTILITY TYPES

export type AdvancePaymentAction = 
  | 'CHECK_REQUIRED'
  | 'INITIATE_PAYMENT'
  | 'CHECK_STATUS'
  | 'PROCESS_REFUND'
  | 'VIEW_HISTORY';

export type BusinessValidationAction = 
  | 'VALIDATE_ACCESS'
  | 'SWITCH_BUSINESS'
  | 'CHECK_PERMISSION'
  | 'VIEW_STATS'
  | 'AUDIT_ACCESS';

export interface AdvancePaymentFilters {
  status?: AdvancePaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface BusinessValidationFilters {
  businessId?: string;
  action?: string;
  success?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}