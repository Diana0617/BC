/**
 * API para gestión de métodos de pago del negocio
 * Permite configurar los métodos de pago disponibles (Efectivo, Yape, Transferencia, etc.)
 */

import { apiClient } from './client.js';

// ================================
// PAYMENT METHODS API
// ================================

/**
 * Obtener el ID del negocio actual desde el token o estado
 * Por ahora asumimos que el businessId está en el user del token
 */
const getBusinessId = () => {
  // El businessId debería estar disponible en el contexto de autenticación
  // Por ahora retornamos null y se deberá pasar como parámetro
  return null;
};

/**
 * Obtener todos los métodos de pago del negocio
 * @param {string} businessId - ID del negocio (opcional, se obtiene del contexto si no se provee)
 * @param {boolean} activeOnly - Si es true, solo retorna métodos activos
 */
const getPaymentMethods = async (businessId = null, activeOnly = false) => {
  try {
    if (!businessId) {
      throw new Error('businessId es requerido');
    }
    
    const endpoint = activeOnly 
      ? `/api/business/${businessId}/payment-methods`
      : `/api/business/${businessId}/payment-methods/all`;
    
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo métodos de pago:', error);
    throw error;
  }
};

/**
 * Crear un nuevo método de pago
 * @param {string} businessId - ID del negocio
 * @param {Object} methodData - Datos del método de pago
 * @param {string} methodData.name - Nombre del método (ej: "Yape", "Efectivo")
 * @param {string} methodData.type - Tipo: CASH, CARD, TRANSFER, QR, ONLINE, OTHER
 * @param {boolean} methodData.requiresProof - Si requiere comprobante de pago
 * @param {string} methodData.icon - Nombre del ícono (Ionicons)
 * @param {number} methodData.order - Orden de visualización
 * @param {Object} methodData.bankInfo - Info bancaria (opcional)
 * @param {Object} methodData.metadata - Metadata adicional (opcional)
 */
const createPaymentMethod = async (businessId, methodData) => {
  try {
    console.log('🔍 Debug createPaymentMethod API:', {
      businessId,
      typeOfBusinessId: typeof businessId,
      methodData
    });
    
    if (!businessId) {
      throw new Error('businessId es requerido');
    }
    
    const url = `/api/business/${businessId}/payment-methods`;
    console.log('📡 URL final:', url);
    
    const response = await apiClient.post(url, methodData);
    return response.data;
  } catch (error) {
    console.error('Error creando método de pago:', error);
    throw error;
  }
};

/**
 * Actualizar un método de pago existente
 * @param {string} businessId - ID del negocio
 * @param {string} methodId - ID del método de pago
 * @param {Object} methodData - Datos actualizados
 */
const updatePaymentMethod = async (businessId, methodId, methodData) => {
  try {
    if (!businessId) {
      throw new Error('businessId es requerido');
    }
    
    const response = await apiClient.put(`/api/business/${businessId}/payment-methods/${methodId}`, methodData);
    return response.data;
  } catch (error) {
    console.error('Error actualizando método de pago:', error);
    throw error;
  }
};

/**
 * Activar/Desactivar un método de pago (toggle)
 * @param {string} businessId - ID del negocio
 * @param {string} methodId - ID del método de pago
 */
const togglePaymentMethod = async (businessId, methodId) => {
  try {
    if (!businessId) {
      throw new Error('businessId es requerido');
    }
    
    const response = await apiClient.patch(`/api/business/${businessId}/payment-methods/${methodId}/toggle`);
    return response.data;
  } catch (error) {
    console.error('Error cambiando estado del método de pago:', error);
    throw error;
  }
};

/**
 * Eliminar un método de pago permanentemente
 * @param {string} businessId - ID del negocio
 * @param {string} methodId - ID del método de pago
 */
const deletePaymentMethod = async (businessId, methodId) => {
  try {
    if (!businessId) {
      throw new Error('businessId es requerido');
    }
    
    const response = await apiClient.delete(`/api/business/${businessId}/payment-methods/${methodId}`, {
      params: { hardDelete: true }
    });
    return response.data;
  } catch (error) {
    console.error('Error eliminando método de pago:', error);
    throw error;
  }
};

// Export default object with all functions
export const paymentMethodsApi = {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethod,
  deletePaymentMethod
};
