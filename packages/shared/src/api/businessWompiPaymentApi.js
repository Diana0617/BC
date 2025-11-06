/**
 * businessWompiPaymentApi.js
 * 
 * API client para la configuración de pagos Wompi de cada Business.
 * 
 * IMPORTANTE: Este API es COMPLETAMENTE SEPARADO del sistema de suscripciones
 * de Beauty Control. Es para que cada negocio configure sus propias credenciales
 * de Wompi para recibir pagos de turnos online de sus clientes.
 */

import { apiClient } from './client.js'

/**
 * Obtener la configuración de Wompi del negocio
 * @param {string} businessId - ID del negocio
 * @returns {Promise} Configuración de Wompi
 */
export const getWompiConfig = async (businessId) => {
  try {
    const response = await apiClient.get(`/business/${businessId}/wompi-config`)
    return response.data
  } catch (error) {
    console.error('Error al obtener configuración de Wompi:', error)
    throw error
  }
}

/**
 * Guardar o actualizar la configuración de Wompi del negocio
 * @param {string} businessId - ID del negocio
 * @param {Object} configData - Datos de configuración
 * @param {string} configData.testPublicKey - Clave pública de prueba
 * @param {string} configData.testPrivateKey - Clave privada de prueba
 * @param {string} configData.testIntegritySecret - Secret de integridad de prueba
 * @param {string} configData.prodPublicKey - Clave pública de producción (opcional)
 * @param {string} configData.prodPrivateKey - Clave privada de producción (opcional)
 * @param {string} configData.prodIntegritySecret - Secret de integridad de producción (opcional)
 * @param {boolean} configData.isTestMode - Modo de prueba o producción
 * @returns {Promise} Resultado de la operación
 */
export const saveWompiConfig = async (businessId, configData) => {
  try {
    const response = await apiClient.post(
      `/business/${businessId}/wompi-config`,
      configData
    )
    return response.data
  } catch (error) {
    console.error('Error al guardar configuración de Wompi:', error)
    throw error
  }
}

/**
 * Verificar las credenciales de Wompi del negocio
 * Hace una llamada real a la API de Wompi para validar que las credenciales funcionen
 * @param {string} businessId - ID del negocio
 * @returns {Promise} Resultado de la verificación
 */
export const verifyWompiCredentials = async (businessId) => {
  try {
    const response = await apiClient.post(
      `/business/${businessId}/wompi-config/verify`
    )
    return response.data
  } catch (error) {
    console.error('Error al verificar credenciales de Wompi:', error)
    throw error
  }
}

/**
 * Cambiar entre modo test y producción
 * @param {string} businessId - ID del negocio
 * @param {boolean} isTestMode - true para modo test, false para producción
 * @returns {Promise} Resultado de la operación
 */
export const toggleWompiMode = async (businessId, isTestMode) => {
  try {
    const response = await apiClient.patch(
      `/business/${businessId}/wompi-config/toggle-mode`,
      { isTestMode }
    )
    return response.data
  } catch (error) {
    console.error('Error al cambiar modo de Wompi:', error)
    throw error
  }
}

/**
 * Activar o desactivar la configuración de Wompi
 * @param {string} businessId - ID del negocio
 * @param {boolean} isActive - true para activar, false para desactivar
 * @returns {Promise} Resultado de la operación
 */
export const toggleWompiStatus = async (businessId, isActive) => {
  try {
    const response = await apiClient.patch(
      `/business/${businessId}/wompi-config/toggle-status`,
      { isActive }
    )
    return response.data
  } catch (error) {
    console.error('Error al cambiar estado de Wompi:', error)
    throw error
  }
}

export default {
  getWompiConfig,
  saveWompiConfig,
  verifyWompiCredentials,
  toggleWompiMode,
  toggleWompiStatus
}
