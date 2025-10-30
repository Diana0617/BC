import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ENV from '../config/env';

/**
 * Hook para obtener métodos de pago del negocio (solo lectura)
 * Usado por especialistas/recepcionistas para seleccionar método al cerrar turno
 */
export const usePaymentMethodsReadOnly = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const businessId = user?.businessId;

  const fetchPaymentMethods = useCallback(async () => {
    console.log('🔍 usePaymentMethodsReadOnly - Iniciando fetch:', {
      businessId,
      hasToken: !!token,
      apiUrl: ENV.apiUrl
    });
    
    if (!businessId) {
      console.log('❌ usePaymentMethodsReadOnly - Business ID no disponible');
      setError('Business ID no disponible');
      return;
    }

    if (!token) {
      console.log('❌ usePaymentMethodsReadOnly - Token no disponible');
      setError('Token de autenticación no disponible');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${ENV.apiUrl}/api/business/${businessId}/payment-methods`;
      console.log('🌐 usePaymentMethodsReadOnly - Llamando a:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 usePaymentMethodsReadOnly - Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 usePaymentMethodsReadOnly - Response data:', data);

      if (response.ok && data.success) {
        console.log('✅ usePaymentMethodsReadOnly - Métodos cargados:', data.data?.length || 0);
        setMethods(data.data || []);
      } else {
        console.log('❌ usePaymentMethodsReadOnly - Error en respuesta:', data.message);
        setError(data.message || 'Error obteniendo métodos de pago');
        setMethods([]);
      }
    } catch (err) {
      console.error('💥 usePaymentMethodsReadOnly - Error de conexión:', err);
      setError('Error de conexión con el servidor');
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, [businessId, token]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  return {
    methods,
    loading,
    error,
    refetch: fetchPaymentMethods
  };
};
