import { apiClient } from './client.js';

export const plansApi = {
  // Plans Management (public endpoints for getting plans)
  getPlans: (params = {}) => 
    apiClient.get('/api/plans', { params }),

  getPlanById: (planId) => 
    apiClient.get(`/api/plans/${planId}`),

  getPlanModules: (planId) => 
    apiClient.get(`/api/plans/${planId}/modules`),

  // Owner specific endpoints (using ownerOnly middleware)
  createPlan: (planData) => 
    apiClient.post('/api/plans', planData),

  updatePlan: (planId, planData) => 
    apiClient.put(`/api/plans/${planId}`, planData),

  deletePlan: (planId) => 
    apiClient.delete(`/api/plans/${planId}`),

  togglePlanStatus: (planId) => 
    apiClient.patch(`/api/plans/${planId}/toggle-status`)
};