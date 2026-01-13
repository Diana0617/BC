/**
 * API para gestión de clientes del negocio
 */

import apiClient from './client';

/**
 * Listar todos los clientes del negocio con paginación
 * @param {string} businessId - ID del negocio
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} params.page - Número de página
 * @param {number} params.limit - Límite por página
 * @param {string} params.status - Filtrar por estado (ACTIVE, BLOCKED)
 * @param {string} params.search - Buscar por nombre, email o teléfono
 * @returns {Promise} Lista paginada de clientes
 */
export const listClients = (businessId, params = {}) => {
  return apiClient.get(`/api/business/${businessId}/clients`, { params });
};

/**
 * Buscar clientes por nombre, email o teléfono
 * @param {string} businessId - ID del negocio
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.q - Término de búsqueda
 * @param {number} params.limit - Límite de resultados
 * @returns {Promise} Lista de clientes que coinciden
 */
export const searchClients = (businessId, params = {}) => {
  return apiClient.get(`/api/business/${businessId}/clients/search`, { params });
};

/**
 * Obtener detalles de un cliente específico
 * @param {string} businessId - ID del negocio
 * @param {string} clientId - ID del cliente
 * @returns {Promise} Detalles del cliente
 */
export const getClientDetails = (businessId, clientId) => {
  return apiClient.get(`/api/business/${businessId}/clients/${clientId}`);
};

/**
 * Crear un nuevo cliente
 * @param {string} businessId - ID del negocio
 * @param {Object} clientData - Datos del cliente
 * @param {string} clientData.firstName - Nombre
 * @param {string} clientData.lastName - Apellido
 * @param {string} clientData.email - Email
 * @param {string} clientData.phone - Teléfono
 * @param {string} clientData.address - Dirección (opcional)
 * @param {Date} clientData.birthDate - Fecha de nacimiento (opcional)
 * @param {string} clientData.notes - Notas (opcional)
 * @returns {Promise} Cliente creado
 */
export const createClient = (businessId, clientData) => {
  return apiClient.post(`/api/business/${businessId}/clients`, clientData);
};

/**
 * Actualizar un cliente existente
 * @param {string} businessId - ID del negocio
 * @param {string} clientId - ID del cliente
 * @param {Object} clientData - Datos a actualizar
 * @returns {Promise} Cliente actualizado
 */
export const updateClient = (businessId, clientId, clientData) => {
  return apiClient.put(`/api/business/${businessId}/clients/${clientId}`, clientData);
};

/**
 * Cambiar estado del cliente (activar/bloquear)
 * @param {string} businessId - ID del negocio
 * @param {string} clientId - ID del cliente
 * @param {Object} data - Datos del cambio
 * @param {string} data.status - Nuevo estado (ACTIVE, BLOCKED)
 * @param {string} data.reason - Motivo del cambio (opcional)
 * @returns {Promise} Cliente actualizado
 */
export const toggleClientStatus = (businessId, clientId, data) => {
  return apiClient.patch(`/api/business/${businessId}/clients/${clientId}/status`, data);
};

/**
 * Obtener vouchers de un cliente
 * @param {string} businessId - ID del negocio
 * @param {string} clientId - ID del cliente
 * @returns {Promise} Lista de vouchers del cliente
 */
export const getClientVouchers = (businessId, clientId) => {
  return apiClient.get(`/api/business/${businessId}/clients/${clientId}/vouchers`);
};

/**
 * Bloquear cliente manualmente
 * @param {string} businessId - ID del negocio
 * @param {string} clientId - ID del cliente
 * @param {Object} data - Datos del bloqueo
 * @param {string} data.reason - Motivo del bloqueo
 * @param {number} data.duration - Duración en días (opcional)
 * @returns {Promise} Cliente bloqueado
 */
export const blockClient = (businessId, clientId, data) => {
  return apiClient.post(`/api/business/${businessId}/clients/${clientId}/block`, data);
};

const clientsApi = {
  listClients,
  searchClients,
  getClientDetails,
  createClient,
  updateClient,
  toggleClientStatus,
  getClientVouchers,
  blockClient
};

export default clientsApi;
