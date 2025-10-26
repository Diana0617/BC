import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Alert } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Hook personalizado para gestionar métodos de pago del negocio
 */
export const usePaymentMethods = () => {
  const { user, token } = useSelector((state) => state.auth);
  const businessId = user?.businessId;

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [allPaymentMethods, setAllPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Configuración de axios con token
  const getAxiosConfig = useCallback(() => ({
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }), [token]);

  /**
   * Obtener métodos de pago activos
   */
  const fetchPaymentMethods = useCallback(async () => {
    if (!businessId || !token) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/business/${businessId}/payment-methods`,
        getAxiosConfig()
      );

      if (response.data.success) {
        setPaymentMethods(response.data.data.paymentMethods || []);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'No se pudieron cargar los métodos de pago'
      );
    } finally {
      setLoading(false);
    }
  }, [businessId, token, getAxiosConfig]);

  /**
   * Obtener todos los métodos de pago (incluidos inactivos)
   */
  const fetchAllPaymentMethods = useCallback(async () => {
    if (!businessId || !token) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/business/${businessId}/payment-methods/all`,
        getAxiosConfig()
      );

      if (response.data.success) {
        setAllPaymentMethods(response.data.data.paymentMethods || []);
      }
    } catch (error) {
      console.error('Error fetching all payment methods:', error);
    }
  }, [businessId, token, getAxiosConfig]);

  /**
   * Crear nuevo método de pago
   */
  const createPaymentMethod = useCallback(async (methodData) => {
    if (!businessId || !token) return { success: false };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/business/${businessId}/payment-methods`,
        methodData,
        getAxiosConfig()
      );

      if (response.data.success) {
        // Refrescar lista
        await fetchPaymentMethods();
        return { success: true, data: response.data.data.paymentMethod };
      }
    } catch (error) {
      console.error('Error creating payment method:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al crear método de pago',
      };
    }
  }, [businessId, token, getAxiosConfig, fetchPaymentMethods]);

  /**
   * Actualizar método de pago
   */
  const updatePaymentMethod = useCallback(async (methodId, methodData) => {
    if (!businessId || !token) return { success: false };

    try {
      const response = await axios.put(
        `${API_BASE_URL}/business/${businessId}/payment-methods/${methodId}`,
        methodData,
        getAxiosConfig()
      );

      if (response.data.success) {
        // Actualizar lista local
        await fetchPaymentMethods();
        return { success: true, data: response.data.data.paymentMethod };
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar método de pago',
      };
    }
  }, [businessId, token, getAxiosConfig, fetchPaymentMethods]);

  /**
   * Eliminar método de pago (soft delete)
   */
  const deletePaymentMethod = useCallback(async (methodId, hardDelete = false) => {
    if (!businessId || !token) return { success: false };

    try {
      const url = hardDelete
        ? `${API_BASE_URL}/business/${businessId}/payment-methods/${methodId}?hardDelete=true`
        : `${API_BASE_URL}/business/${businessId}/payment-methods/${methodId}`;

      const response = await axios.delete(url, getAxiosConfig());

      if (response.data.success) {
        await fetchPaymentMethods();
        return { success: true };
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al eliminar método de pago',
      };
    }
  }, [businessId, token, getAxiosConfig, fetchPaymentMethods]);

  /**
   * Activar método de pago
   */
  const activatePaymentMethod = useCallback(async (methodId) => {
    if (!businessId || !token) return { success: false };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/business/${businessId}/payment-methods/${methodId}/activate`,
        {},
        getAxiosConfig()
      );

      if (response.data.success) {
        await fetchPaymentMethods();
        return { success: true };
      }
    } catch (error) {
      console.error('Error activating payment method:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al activar método de pago',
      };
    }
  }, [businessId, token, getAxiosConfig, fetchPaymentMethods]);

  /**
   * Reordenar métodos de pago
   */
  const reorderPaymentMethods = useCallback(async (methodIds) => {
    if (!businessId || !token) return { success: false };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/business/${businessId}/payment-methods/reorder`,
        { methodIds },
        getAxiosConfig()
      );

      if (response.data.success) {
        await fetchPaymentMethods();
        return { success: true };
      }
    } catch (error) {
      console.error('Error reordering payment methods:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al reordenar métodos',
      };
    }
  }, [businessId, token, getAxiosConfig, fetchPaymentMethods]);

  /**
   * Toggle activación de método
   */
  const togglePaymentMethod = useCallback(async (methodId, currentActiveState) => {
    if (currentActiveState) {
      return await deletePaymentMethod(methodId, false); // Soft delete
    } else {
      return await activatePaymentMethod(methodId);
    }
  }, [deletePaymentMethod, activatePaymentMethod]);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPaymentMethods();
    setRefreshing(false);
  }, [fetchPaymentMethods]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    // Estados
    paymentMethods,
    allPaymentMethods,
    loading,
    refreshing,

    // Acciones
    fetchPaymentMethods,
    fetchAllPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    activatePaymentMethod,
    togglePaymentMethod,
    reorderPaymentMethods,
    refresh,
  };
};
