import { apiClient } from './client';

export const plansApi = {
  // Plans Management
  getPlans: (params = {}) => 
    apiClient.get('/plans', { params }),

  getPlanById: (planId) => 
    apiClient.get(`/plans/${planId}`),

  getPlanModules: (planId) => 
    apiClient.get(`/plans/${planId}/modules`)
};