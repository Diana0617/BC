import { apiClient } from './client.js';

export const ownerApi = {
  // Business Management
  getAllBusinesses: (params = {}) => 
    apiClient.get('/owner/businesses', { params }),

  createBusinessManually: (businessData) => 
    apiClient.post('/owner/businesses', businessData),

  toggleBusinessStatus: (businessId, data) => 
    apiClient.patch(`/owner/businesses/${businessId}/status`, data),

  // Subscription Management
  createSubscription: (subscriptionData) => 
    apiClient.post('/owner/subscriptions', subscriptionData),

  cancelSubscription: (subscriptionId, data) => 
    apiClient.patch(`/owner/subscriptions/${subscriptionId}/cancel`, data)
};