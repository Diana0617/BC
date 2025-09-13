// Import types for use in type guards and utilities
import type {
  ApiError,
  BusinessInvitation,
  PaymentConfiguration,
  AutoRenewalStats,
  CronJobConfig,
  FailedPaymentRetry,
  ManualAutoRenewalResult,
  RenewalNotification,
  CreateBusinessInvitationData,
  BusinessInvitationStats,
  InvitationListParams,
  InvitationListResponse,
  InvitationToken,
  PaymentRequest,
  PaymentResponse,
  InvitationStatus,
  CreatePaymentConfigData,
  UpdatePaymentConfigData,
  PaymentConfigTest,
  PaymentConfigStats,
  ApiResponse,
  PaginatedResponse,
  LoadingState,
  AsyncState,
  FormState,
  BaseFilters,
  SortOptions,
  DateRange,
  WebhookPayload,
  WompiWebhookData
} from './newEndpoints';

// Export all types from different modules
export * from './newEndpoints';

// Type guards for runtime type checking
export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.message === 'string';
};

export const isBusinessInvitation = (data: any): data is BusinessInvitation => {
  return data && 
    typeof data.id === 'string' &&
    typeof data.businessName === 'string' &&
    typeof data.businessEmail === 'string' &&
    typeof data.selectedPlan === 'string' &&
    typeof data.status === 'string';
};

export const isPaymentConfiguration = (data: any): data is PaymentConfiguration => {
  return data &&
    typeof data.id === 'string' &&
    typeof data.ownerId === 'string' &&
    typeof data.provider === 'string' &&
    typeof data.isActive === 'boolean' &&
    typeof data.publicKey === 'string';
};

// Status enums for type safety
export enum BusinessInvitationStatus {
  PENDING = 'pending',
  PAID = 'paid',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum PaymentProvider {
  WOMPI = 'wompi',
  STRIPE = 'stripe',
  PAYPAL = 'paypal'
}

export enum PaymentMethod {
  CARD = 'CARD',
  NEQUI = 'NEQUI',
  PSE = 'PSE'
}

export enum RenewalNotificationType {
  UPCOMING_RENEWAL = 'upcoming_renewal',
  RENEWAL_SUCCESS = 'renewal_success',
  RENEWAL_FAILED = 'renewal_failed',
  PAYMENT_RETRY = 'payment_retry'
}

export enum WompiTransactionStatus {
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
  ERROR = 'ERROR'
}

// Utility types for API responses
export type SuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ErrorResponse = {
  success: false;
  error: string;
  message?: string;
  details?: any;
};

export type ApiResponseType<T> = SuccessResponse<T> | ErrorResponse;

// Pagination utility types
export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type SortParams<T = any> = {
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
};

export type FilterParams<T = any> = PaginationParams & SortParams<T> & {
  search?: string;
  filters?: Partial<T>;
};

// Form validation types
export type ValidationRule<T> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean | string;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

// Async operation types
export type AsyncOperationStatus = 'idle' | 'loading' | 'success' | 'error';

export type AsyncOperation<T> = {
  status: AsyncOperationStatus;
  data: T | null;
  error: string | null;
  lastUpdated?: string;
};

// Export utility types for common patterns
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type Nullable<T> = T | null;
export type ArrayElement<T> = T extends (infer U)[] ? U : never;