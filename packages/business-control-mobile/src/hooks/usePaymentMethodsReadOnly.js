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
    if (!businessId) {
      setError('Business ID no disponible');
      return;
    }

    if (!token) {
      setError('Token de autenticación no disponible');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${ENV.apiUrl}/api/business/${businessId}/payment-methods`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMethods(data.data || []);
      } else {
        setError(data.message || 'Error obteniendo métodos de pago');
        setMethods([]);
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
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
