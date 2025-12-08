/**
 * API para operaciones de reservas públicas (sin autenticación)
 * Incluye funciones para consultar servicios, especialistas, disponibilidad y crear reservas
 */

import { apiClient } from './client.js';

// ================================
// PUBLIC BOOKING API
// ================================

/**
 * Obtener servicios disponibles para un negocio
 */
export const getPublicServices = async (businessCode) => {
  try {
    const response = await apiClient.get(`/api/public/bookings/business/${businessCode}/services`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo servicios públicos:', error);
    throw error;
  }
};

/**
 * Obtener especialistas disponibles para un negocio
 */
export const getPublicSpecialists = async (businessCode, serviceId = null) => {
  try {
    const params = serviceId ? { serviceId } : {};
    const response = await apiClient.get(`/api/public/bookings/business/${businessCode}/specialists`, { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo especialistas públicos:', error);
    throw error;
  }
};

/**
 * Consultar disponibilidad de horarios
 */
export const getPublicAvailability = async (businessCode, params) => {
  try {
    const response = await apiClient.get(`/api/public/bookings/business/${businessCode}/availability`, { params });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    throw error;
  }
};

/**
 * Crear una reserva online
 */
export const createPublicBooking = async (businessCode, bookingData) => {
  try {
    const response = await apiClient.post(`/api/public/bookings/business/${businessCode}`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creando reserva:', error);
    throw error;
  }
};

/**
 * Subir comprobante de pago para una reserva
 */
export const uploadPaymentProof = async (businessCode, bookingCode, formData) => {
  try {
    // Para subida de archivos, necesitamos usar fetch directamente con FormData
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    const response = await fetch(`${API_BASE_URL}/api/public/bookings/business/${businessCode}/upload-proof/${bookingCode}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al subir el comprobante');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error subiendo comprobante:', error);
    throw error;
  }
};

/**
 * Obtener información de pago (para transferencias bancarias)
 */
export const getPaymentInfo = async (businessCode, paymentMethod) => {
  try {
    const response = await apiClient.get(`/api/public/bookings/business/${businessCode}/payment-info`, {
      params: { paymentMethod }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo información de pago:', error);
    throw error;
  }
};