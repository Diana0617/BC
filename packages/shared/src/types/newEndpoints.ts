// Types for Auto-Renewal System
export interface AutoRenewalStats {
  totalBusinesses: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  subscriptionsRenewedToday: number;
  totalPaymentsToday: number;
  averageMonthlyRevenue: number;
  failedPaymentsLast30Days: number;
  retrySuccessRate: number;
}

export interface CronJobConfig {
  id: string;
  name: string;
  pattern: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  description: string;
}

export interface FailedPaymentRetry {
  id: string;
  businessId: string;
  businessName: string;
  amount: number;
  failureReason: string;
  retryCount: number;
  lastRetryAt?: string;
  maxRetries: number;
  status: 'pending' | 'retrying' | 'failed' | 'success';
  nextRetryAt?: string;
}

export interface ManualAutoRenewalResult {
  success: boolean;
  processedBusinesses: number;
  successfulRenewals: number;
  failedRenewals: number;
  totalRevenue: number;
  errors?: string[];
  details: Array<{
    businessId: string;
    businessName: string;
    status: 'success' | 'failed';
    amount?: number;
    error?: string;
  }>;
}

// Types for Business Invitation Management
export interface BusinessInvitation {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  selectedPlan: string;
  planPrice: number;
  status: 'pending' | 'paid' | 'completed' | 'expired' | 'cancelled';
  token: string;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  completedAt?: string;
  paymentId?: string;
  wompiTransactionId?: string;
  ownerId: string;
}

export interface CreateBusinessInvitationData {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  selectedPlan: string;
}

export interface BusinessInvitationStats {
  totalInvitations: number;
  pendingInvitations: number;
  paidInvitations: number;
  completedInvitations: number;
  expiredInvitations: number;
  cancelledInvitations: number;
  conversionRate: number;
  totalRevenue: number;
  averageCompletionTime: number;
}

export interface InvitationListParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: 'createdAt' | 'businessName' | 'status' | 'planPrice';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface InvitationListResponse {
  invitations: BusinessInvitation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types for Public Invitation Processing
export interface InvitationToken {
  valid: boolean;
  invitation?: BusinessInvitation;
  error?: string;
}

export interface PaymentRequest {
  token: string;
  paymentMethod: 'CARD' | 'NEQUI' | 'PSE';
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  cardInfo?: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    holderName: string;
  };
  nequiInfo?: {
    phoneNumber: string;
  };
  pseInfo?: {
    userType: string;
    userDocument: string;
    financialInstitutionCode: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  wompiTransactionId?: string;
  redirectUrl?: string;
  message: string;
  error?: string;
}

export interface InvitationStatus {
  status: 'pending' | 'paid' | 'completed' | 'expired' | 'cancelled';
  businessName: string;
  planName: string;
  planPrice: number;
  expiresAt: string;
  paymentStatus?: 'pending' | 'approved' | 'declined' | 'error';
  completionProgress?: {
    businessCreated: boolean;
    userConfigured: boolean;
    paymentProcessed: boolean;
  };
}

// Types for Owner Payment Configuration
export interface PaymentConfiguration {
  id: string;
  ownerId: string;
  provider: 'wompi' | 'stripe' | 'paypal';
  isActive: boolean;
  publicKey: string;
  privateKey: string;
  webhookSecret?: string;
  testMode: boolean;
  configuration: {
    currency: string;
    country: string;
    acceptedMethods: string[];
    webhookUrl?: string;
    returnUrl?: string;
    cancelUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastTestedAt?: string;
  testStatus?: 'success' | 'failed' | 'pending';
}

export interface CreatePaymentConfigData {
  provider: 'wompi' | 'stripe' | 'paypal';
  publicKey: string;
  privateKey: string;
  webhookSecret?: string;
  testMode: boolean;
  configuration: {
    currency: string;
    country: string;
    acceptedMethods: string[];
    webhookUrl?: string;
    returnUrl?: string;
    cancelUrl?: string;
  };
}

export interface UpdatePaymentConfigData {
  publicKey?: string;
  privateKey?: string;
  webhookSecret?: string;
  testMode?: boolean;
  configuration?: {
    currency?: string;
    country?: string;
    acceptedMethods?: string[];
    webhookUrl?: string;
    returnUrl?: string;
    cancelUrl?: string;
  };
}

export interface PaymentConfigTest {
  success: boolean;
  provider: string;
  testType: 'connection' | 'transaction' | 'webhook';
  message: string;
  details?: {
    responseTime: number;
    statusCode?: number;
    testTransactionId?: string;
    supportedMethods?: string[];
  };
  error?: string;
}

export interface PaymentConfigStats {
  totalConfigurations: number;
  activeConfigurations: number;
  configurationsByProvider: {
    [provider: string]: number;
  };
  testModeConfigurations: number;
  productionConfigurations: number;
  lastTestResults: {
    [configId: string]: {
      status: 'success' | 'failed';
      testedAt: string;
      message: string;
    };
  };
}

// Common API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

// Loading States
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

// Form States
export interface FormState<T> {
  data: T;
  errors: { [K in keyof T]?: string };
  touched: { [K in keyof T]?: boolean };
  isValid: boolean;
  isSubmitting: boolean;
}

// Filter and Sort Types
export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface SortOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

// Notification Types for Auto-Renewal
export interface RenewalNotification {
  id: string;
  businessId: string;
  businessName: string;
  type: 'upcoming_renewal' | 'renewal_success' | 'renewal_failed' | 'payment_retry';
  message: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  recipientEmail: string;
  metadata?: {
    renewalDate?: string;
    amount?: number;
    retryCount?: number;
    paymentMethod?: string;
  };
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}

export interface WompiWebhookData {
  event: 'transaction.updated';
  data: {
    transaction: {
      id: string;
      amount_in_cents: number;
      reference: string;
      customer_email: string;
      currency: string;
      payment_method_type: string;
      payment_method: any;
      status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR';
      status_message: string;
      created_at: string;
      finalized_at?: string;
    };
  };
  sent_at: string;
  timestamp: number;
  signature: {
    properties: string[];
    checksum: string;
  };
}

// Export all types
export type {
  // Auto-Renewal
  AutoRenewalStats,
  CronJobConfig,
  FailedPaymentRetry,
  ManualAutoRenewalResult,
  RenewalNotification,
  
  // Business Invitations
  BusinessInvitation,
  CreateBusinessInvitationData,
  BusinessInvitationStats,
  InvitationListParams,
  InvitationListResponse,
  
  // Public Invitations
  InvitationToken,
  PaymentRequest,
  PaymentResponse,
  InvitationStatus,
  
  // Payment Configuration
  PaymentConfiguration,
  CreatePaymentConfigData,
  UpdatePaymentConfigData,
  PaymentConfigTest,
  PaymentConfigStats,
  
  // Common
  ApiResponse,
  PaginatedResponse,
  ApiError,
  LoadingState,
  AsyncState,
  FormState,
  BaseFilters,
  SortOptions,
  DateRange,
  
  // Webhooks
  WebhookPayload,
  WompiWebhookData
};