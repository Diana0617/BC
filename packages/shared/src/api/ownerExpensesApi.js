/**
 * API para Gestión de Gastos del Owner
 * Endpoints para crear, gestionar y reportar gastos con comprobantes en Cloudinary
 */

import { apiClient } from './client';

const EXPENSES_ENDPOINTS = {
  CREATE: '/owner/expenses',
  GET_ALL: '/owner/expenses',
  GET_BY_ID: (id) => `/owner/expenses/${id}`,
  UPDATE: (id) => `/owner/expenses/${id}`,
  DELETE: (id) => `/owner/expenses/${id}`,
  APPROVE: (id) => `/owner/expenses/${id}/approve`,
  REJECT: (id) => `/owner/expenses/${id}/reject`,
  MARK_PAID: (id) => `/owner/expenses/${id}/mark-paid`,
  REMOVE_RECEIPT: (id) => `/owner/expenses/${id}/receipt`,
  CATEGORIES: '/owner/expenses/categories',
  STATS: '/owner/expenses/stats'
};

export const ownerExpensesApi = {
  /**
   * Crear un nuevo gasto con posible comprobante
   * @param {Object} expenseData - Datos del gasto
   * @param {File} receiptFile - Archivo de comprobante (opcional)
   * @returns {Promise} Respuesta del servidor
   */
  async createExpense(expenseData, receiptFile = null) {
    try {
      const formData = new FormData();
      
      // Agregar todos los campos de datos
      Object.keys(expenseData).forEach(key => {
        if (expenseData[key] !== null && expenseData[key] !== undefined) {
          formData.append(key, expenseData[key]);
        }
      });
      
      // Agregar archivo si existe
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const response = await apiClient.post(EXPENSES_ENDPOINTS.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creando gasto:', error);
      throw error;
    }
  },

  /**
   * Obtener lista de gastos con filtros
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise} Lista de gastos con estadísticas
   */
  async getExpenses(params = {}) {
    try {
      const response = await apiClient.get(EXPENSES_ENDPOINTS.GET_ALL, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo gastos:', error);
      throw error;
    }
  },

  /**
   * Obtener un gasto específico por ID
   * @param {string} expenseId - ID del gasto
   * @returns {Promise} Datos del gasto
   */
  async getExpenseById(expenseId) {
    try {
      const response = await apiClient.get(EXPENSES_ENDPOINTS.GET_BY_ID(expenseId));
      return response.data;
    } catch (error) {
      console.error('Error obteniendo gasto por ID:', error);
      throw error;
    }
  },

  /**
   * Actualizar un gasto existente con posible nuevo comprobante
   * @param {string} expenseId - ID del gasto
   * @param {Object} updateData - Datos a actualizar
   * @param {File} receiptFile - Nuevo archivo de comprobante (opcional)
   * @returns {Promise} Datos del gasto actualizado
   */
  async updateExpense(expenseId, updateData, receiptFile = null) {
    try {
      const formData = new FormData();
      
      // Agregar campos de actualización
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== null && updateData[key] !== undefined) {
          formData.append(key, updateData[key]);
        }
      });
      
      // Agregar nuevo archivo si existe
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      const response = await apiClient.put(EXPENSES_ENDPOINTS.UPDATE(expenseId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error actualizando gasto:', error);
      throw error;
    }
  },

  /**
   * Eliminar un gasto (soft delete)
   * @param {string} expenseId - ID del gasto
   * @returns {Promise} Confirmación de eliminación
   */
  async deleteExpense(expenseId) {
    try {
      const response = await apiClient.delete(EXPENSES_ENDPOINTS.DELETE(expenseId));
      return response.data;
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      throw error;
    }
  },

  /**
   * Aprobar un gasto pendiente
   * @param {string} expenseId - ID del gasto
   * @param {string} notes - Notas de aprobación (opcional)
   * @returns {Promise} Gasto aprobado
   */
  async approveExpense(expenseId, notes = '') {
    try {
      const response = await apiClient.patch(EXPENSES_ENDPOINTS.APPROVE(expenseId), {
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error aprobando gasto:', error);
      throw error;
    }
  },

  /**
   * Rechazar un gasto pendiente
   * @param {string} expenseId - ID del gasto
   * @param {string} rejectionReason - Razón del rechazo (obligatoria)
   * @returns {Promise} Gasto rechazado
   */
  async rejectExpense(expenseId, rejectionReason) {
    try {
      if (!rejectionReason) {
        throw new Error('La razón del rechazo es obligatoria');
      }

      const response = await apiClient.patch(EXPENSES_ENDPOINTS.REJECT(expenseId), {
        rejectionReason
      });
      return response.data;
    } catch (error) {
      console.error('Error rechazando gasto:', error);
      throw error;
    }
  },

  /**
   * Marcar un gasto como pagado
   * @param {string} expenseId - ID del gasto
   * @param {string} paymentNotes - Notas del pago (opcional)
   * @returns {Promise} Gasto marcado como pagado
   */
  async markExpenseAsPaid(expenseId, paymentNotes = '') {
    try {
      const response = await apiClient.patch(EXPENSES_ENDPOINTS.MARK_PAID(expenseId), {
        paymentNotes
      });
      return response.data;
    } catch (error) {
      console.error('Error marcando gasto como pagado:', error);
      throw error;
    }
  },

  /**
   * Eliminar comprobante de un gasto
   * @param {string} expenseId - ID del gasto
   * @returns {Promise} Confirmación de eliminación
   */
  async removeReceipt(expenseId) {
    try {
      const response = await apiClient.delete(EXPENSES_ENDPOINTS.REMOVE_RECEIPT(expenseId));
      return response.data;
    } catch (error) {
      console.error('Error eliminando comprobante:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías de gastos disponibles
   * @returns {Promise} Lista de categorías
   */
  async getCategories() {
    try {
      const response = await apiClient.get(EXPENSES_ENDPOINTS.CATEGORIES);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de gastos
   * @param {Object} params - Parámetros de filtrado para estadísticas
   * @returns {Promise} Estadísticas detalladas
   */
  async getExpenseStats(params = {}) {
    try {
      const response = await apiClient.get(EXPENSES_ENDPOINTS.STATS, {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de gastos:', error);
      throw error;
    }
  },

  // === MÉTODOS DE UTILIDAD ===

  /**
   * Filtros predefinidos para gastos
   */
  getFilterPresets() {
    return {
      pending: { status: 'PENDING' },
      approved: { status: 'APPROVED' },
      rejected: { status: 'REJECTED' },
      paid: { status: 'PAID' },
      thisMonth: { 
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      lastMonth: { 
        startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
      },
      recurring: { isRecurring: true },
      withReceipt: { hasReceipt: true }
    };
  },

  /**
   * Validar datos de gasto antes del envío
   * @param {Object} expenseData - Datos a validar
   * @returns {Object} Resultado de validación
   */
  validateExpenseData(expenseData) {
    const errors = [];
    const required = ['description', 'amount', 'category', 'expenseDate'];
    
    required.forEach(field => {
      if (!expenseData[field]) {
        errors.push(`El campo ${field} es obligatorio`);
      }
    });

    if (expenseData.amount && expenseData.amount <= 0) {
      errors.push('El monto debe ser mayor a 0');
    }

    if (expenseData.vendorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(expenseData.vendorEmail)) {
      errors.push('El email del proveedor no es válido');
    }

    if (expenseData.isRecurring && !expenseData.recurringFrequency) {
      errors.push('Debe especificar la frecuencia para gastos recurrentes');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Formatear datos de gasto para el envío
   * @param {Object} rawData - Datos sin procesar
   * @returns {Object} Datos formateados
   */
  formatExpenseData(rawData) {
    const formatted = { ...rawData };

    // Formatear fechas
    if (formatted.expenseDate) {
      formatted.expenseDate = new Date(formatted.expenseDate).toISOString().split('T')[0];
    }
    if (formatted.dueDate) {
      formatted.dueDate = new Date(formatted.dueDate).toISOString().split('T')[0];
    }

    // Convertir números
    if (formatted.amount) {
      formatted.amount = parseFloat(formatted.amount);
    }
    if (formatted.taxAmount) {
      formatted.taxAmount = parseFloat(formatted.taxAmount);
    }
    if (formatted.taxRate) {
      formatted.taxRate = parseFloat(formatted.taxRate);
    }

    // Convertir booleanos
    if (typeof formatted.isRecurring === 'string') {
      formatted.isRecurring = formatted.isRecurring === 'true';
    }

    return formatted;
  },

  /**
   * Obtener estado legible del gasto
   * @param {string} status - Estado del gasto
   * @returns {Object} Información del estado
   */
  getStatusInfo(status) {
    const statusMap = {
      'DRAFT': { label: 'Borrador', color: 'gray', icon: 'draft' },
      'PENDING': { label: 'Pendiente', color: 'yellow', icon: 'clock' },
      'APPROVED': { label: 'Aprobado', color: 'green', icon: 'check' },
      'REJECTED': { label: 'Rechazado', color: 'red', icon: 'x' },
      'PAID': { label: 'Pagado', color: 'blue', icon: 'dollar' }
    };

    return statusMap[status] || { label: status, color: 'gray', icon: 'question' };
  },

  /**
   * Obtener información de categoría
   * @param {string} category - Categoría del gasto
   * @returns {Object} Información de la categoría
   */
  getCategoryInfo(category) {
    const categoryMap = {
      'INFRASTRUCTURE': { label: 'Infraestructura', icon: 'server' },
      'MARKETING': { label: 'Marketing', icon: 'megaphone' },
      'PERSONNEL': { label: 'Personal', icon: 'users' },
      'OFFICE': { label: 'Oficina', icon: 'building' },
      'TECHNOLOGY': { label: 'Tecnología', icon: 'laptop' },
      'LEGAL': { label: 'Legal', icon: 'scale' },
      'TRAVEL': { label: 'Viajes', icon: 'plane' },
      'TRAINING': { label: 'Capacitación', icon: 'graduation-cap' },
      'MAINTENANCE': { label: 'Mantenimiento', icon: 'wrench' },
      'UTILITIES': { label: 'Servicios', icon: 'zap' },
      'INSURANCE': { label: 'Seguros', icon: 'shield' },
      'TAXES': { label: 'Impuestos', icon: 'receipt' },
      'OTHER': { label: 'Otros', icon: 'more-horizontal' }
    };

    return categoryMap[category] || { label: category, icon: 'folder' };
  }
};

// Exportar también los endpoints para uso directo si es necesario
export { EXPENSES_ENDPOINTS };