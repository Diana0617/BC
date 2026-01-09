import { apiClient } from './client.js';

/**
 * API para gestión de suscripciones por Owner
 */

/**
 * Reactivar una suscripción
 */
export const reactivateSubscription = async (subscriptionId, data = {}) => {
  const response = await apiClient.patch(`/api/owner/subscriptions/${subscriptionId}/reactivate`, data);
  return response.data;
};

/**
 * Suspender una suscripción
 */
export const suspendSubscription = async (subscriptionId, reason) => {
  const response = await apiClient.patch(`/api/owner/subscriptions/${subscriptionId}/suspend`, { reason });
  return response.data;
};

/**
 * Eliminar una suscripción (solo desarrollo)
 */
export const deleteSubscription = async (subscriptionId) => {
  const response = await apiClient.delete(`/api/owner/subscriptions/${subscriptionId}`);
  return response.data;
};

export default {
  reactivateSubscription,
  suspendSubscription,
  deleteSubscription
};
