import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { useAuthToken } from './useAuth';

/**
 * Hook personalizado para gestionar comisiones de especialista
 * Maneja generación    } catch (error) {
      console.error('Error canceling payment request:', error);
      Alert.alert('Error', 'No se pudo cancelar la solicitud de pago');
    }
  }, [authToken, loadPaymentRequests, loadCommissions]);uimiento y solicitudes de pago de comisiones
 */
export const useCommissionManager = (specialistId) => {
  const dispatch = useDispatch();
  const authToken = useAuthToken();
  const [commissions, setCommissions] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [selectedCommissions, setSelectedCommissions] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    pending: 0,
    totalPending: 0,
    requested: 0,
    totalRequested: 0,
    paid: 0,
    totalPaid: 0
  });

  /**
   * Cargar comisiones del especialista
   */
  const loadCommissions = useCallback(async () => {
    if (!specialistId || !authToken) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/specialist-commissions/${specialistId}/commissions`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCommissions(data.commissions || []);
        calculateSummary(data.commissions || []);
      }
    } catch (error) {
      console.error('Error loading commissions:', error);
      Alert.alert('Error', 'No se pudieron cargar las comisiones');
    } finally {
      setLoading(false);
    }
  }, [specialistId, authToken]);

  /**
   * Cargar solicitudes de pago
   */
  const loadPaymentRequests = useCallback(async () => {
    if (!specialistId || !authToken) return;
    
    try {
      const response = await fetch(`/api/specialist-commissions/${specialistId}/payment-requests`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentRequests(data.paymentRequests || []);
      }
    } catch (error) {
      console.error('Error loading payment requests:', error);
    }
  }, [specialistId, authToken]);

  /**
   * Calcular resumen de comisiones
   */
  const calculateSummary = (commissionsData) => {
    const newSummary = {
      pending: 0,
      totalPending: 0,
      requested: 0,
      totalRequested: 0,
      paid: 0,
      totalPaid: 0
    };

    commissionsData.forEach(commission => {
      const amount = parseFloat(commission.commissionAmount) || 0;
      
      switch (commission.status) {
        case 'pending':
          newSummary.pending++;
          newSummary.totalPending += amount;
          break;
        case 'payment_requested':
          newSummary.requested++;
          newSummary.totalRequested += amount;
          break;
        case 'paid':
          newSummary.paid++;
          newSummary.totalPaid += amount;
          break;
      }
    });

    setSummary(newSummary);
  };

  /**
   * Generar comisión automáticamente al cerrar cita
   */
  const generateCommission = useCallback(async (appointmentId, serviceDetails) => {
    if (!authToken) return;
    
    try {
      const response = await fetch('/api/specialist-commissions/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId,
          specialistId,
          serviceDetails
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Commission generated:', data);
        
        // Recargar comisiones para reflejar la nueva
        await loadCommissions();
        
        return data.commission;
      } else {
        throw new Error('Failed to generate commission');
      }
    } catch (error) {
      console.error('Error generating commission:', error);
      Alert.alert('Error', 'No se pudo generar la comisión automáticamente');
      return null;
    }
  }, [authToken, specialistId, loadCommissions]);

  /**
   * Seleccionar/deseleccionar comisión para solicitud de pago
   */
  const toggleCommissionSelection = useCallback((commissionId) => {
    setSelectedCommissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commissionId)) {
        newSet.delete(commissionId);
      } else {
        newSet.add(commissionId);
      }
      return newSet;
    });
  }, []);

  /**
   * Seleccionar todas las comisiones pendientes
   */
  const selectAllPendingCommissions = useCallback(() => {
    const pendingIds = commissions
      .filter(c => c.status === 'pending')
      .map(c => c.id);
    setSelectedCommissions(new Set(pendingIds));
  }, [commissions]);

  /**
   * Limpiar selección
   */
  const clearSelection = useCallback(() => {
    setSelectedCommissions(new Set());
  }, []);

  /**
   * Crear solicitud de pago con comisiones seleccionadas
   */
  const createPaymentRequest = useCallback(async (requestData = {}) => {
    if (selectedCommissions.size === 0) {
      Alert.alert('Error', 'Selecciona al menos una comisión para crear la solicitud');
      return null;
    }

    setLoading(true);
    try {
      const selectedCommissionData = commissions.filter(c => 
        selectedCommissions.has(c.id)
      );

      const totalAmount = selectedCommissionData.reduce(
        (sum, commission) => sum + parseFloat(commission.commissionAmount), 
        0
      );

      const response = await fetch('/api/commission-payment-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          specialistId,
          commissionIds: Array.from(selectedCommissions),
          totalAmount,
          requestDate: new Date().toISOString(),
          notes: requestData.notes || '',
          ...requestData
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        Alert.alert(
          'Éxito', 
          `Solicitud de pago creada por $${totalAmount.toLocaleString()}`
        );
        
        // Limpiar selección y recargar datos
        clearSelection();
        await loadCommissions();
        await loadPaymentRequests();
        
        return data.paymentRequest;
      } else {
        throw new Error('Failed to create payment request');
      }
    } catch (error) {
      console.error('Error creating payment request:', error);
      Alert.alert('Error', 'No se pudo crear la solicitud de pago');
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedCommissions, commissions, specialistId, clearSelection, loadCommissions, loadPaymentRequests]);

  /**
   * Obtener total de comisiones seleccionadas
   */
  const getSelectedTotal = useCallback(() => {
    return commissions
      .filter(c => selectedCommissions.has(c.id))
      .reduce((sum, commission) => sum + parseFloat(commission.commissionAmount), 0);
  }, [commissions, selectedCommissions]);

  /**
   * Obtener comisiones por estado
   */
  const getCommissionsByStatus = useCallback((status) => {
    return commissions.filter(c => c.status === status);
  }, [commissions]);

  /**
   * Obtener histórico de pagos
   */
  const getPaymentHistory = useCallback(() => {
    return paymentRequests
      .filter(pr => pr.status === 'paid')
      .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate));
  }, [paymentRequests]);

  /**
   * Cancelar solicitud de pago (solo si está pendiente)
   */
  const cancelPaymentRequest = useCallback(async (requestId) => {
    if (!authToken) return;
    
    try {
      const response = await fetch(`/api/commission-payment-requests/${requestId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Solicitud de pago cancelada');
        await loadPaymentRequests();
        await loadCommissions();
      } else {
        throw new Error('Failed to cancel payment request');
      }
    } catch (error) {
      console.error('Error canceling payment request:', error);
      Alert.alert('Error', 'No se pudo cancelar la solicitud');
    }
  }, [loadPaymentRequests, loadCommissions]);

  /**
   * Formatear cantidad como moneda
   */
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    if (specialistId) {
      loadCommissions();
      loadPaymentRequests();
    }
  }, [specialistId, loadCommissions, loadPaymentRequests]);

  return {
    // Estado
    loading,
    commissions,
    paymentRequests,
    selectedCommissions,
    summary,
    
    // Funciones de carga
    loadCommissions,
    loadPaymentRequests,
    
    // Funciones de comisiones
    generateCommission,
    
    // Funciones de selección
    toggleCommissionSelection,
    selectAllPendingCommissions,
    clearSelection,
    getSelectedTotal,
    
    // Funciones de solicitudes de pago
    createPaymentRequest,
    cancelPaymentRequest,
    
    // Funciones de consulta
    getCommissionsByStatus,
    getPaymentHistory,
    
    // Utilidades
    formatCurrency
  };
};

export default useCommissionManager;