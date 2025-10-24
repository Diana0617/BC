import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePermissions } from './usePermissions';
import { useBusinessRules } from './useBusinessRules';
import { useAuthToken } from './useAuth';
import { API_CONFIG } from '@shared/constants/api';

/**
 * Hook para gestión completa de turnos/citas en React Native
 * Integra permisos, reglas de negocio y llamadas a la API
 */
export const useAppointments = () => {
  const { user } = useSelector(state => state.auth);
  const token = useAuthToken();
  const { hasPermission, isSpecialist, isReceptionist } = usePermissions();
  const { checkRule } = useBusinessRules(user?.businessId);
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  /**
   * Verificar si puede crear turnos
   * Combina permisos granulares + reglas de negocio
   */
  const canCreate = useCallback(() => {
    // 1. Verificar permiso granular
    if (!hasPermission('appointments.create')) {
      return { 
        allowed: false, 
        reason: 'Sin permiso para crear turnos' 
      };
    }
    
    // 2. Verificar regla de negocio para especialistas
    if (isSpecialist) {
      const rule = checkRule('canSpecialistCreateAppointments');
      if (rule.exists && !rule.enabled) {
        return { 
          allowed: false, 
          reason: 'Los especialistas no pueden crear turnos según las reglas del negocio' 
        };
      }
    }
    
    return { allowed: true };
  }, [hasPermission, isSpecialist, checkRule]);
  
  /**
   * Verificar si puede editar un turno específico
   */
  const canEdit = useCallback((appointment) => {
    // Verificar permiso básico
    if (!hasPermission('appointments.edit')) {
      return { allowed: false, reason: 'Sin permiso para editar turnos' };
    }
    
    // Especialistas solo pueden editar sus propios turnos
    if (isSpecialist && appointment.specialistId !== user.id) {
      return { allowed: false, reason: 'Solo puedes editar tus propios turnos' };
    }
    
    // No editar turnos completados o cancelados
    if (['COMPLETED', 'CANCELED'].includes(appointment.status)) {
      return { allowed: false, reason: 'No se pueden editar turnos completados o cancelados' };
    }
    
    return { allowed: true };
  }, [hasPermission, isSpecialist, user?.id]);
  
  /**
   * Verificar si puede cancelar un turno
   */
  const canCancel = useCallback((appointment) => {
    if (!hasPermission('appointments.cancel')) {
      return { allowed: false, reason: 'Sin permiso para cancelar turnos' };
    }
    
    if (['COMPLETED', 'CANCELED'].includes(appointment.status)) {
      return { allowed: false, reason: 'Este turno ya está completado o cancelado' };
    }
    
    // Verificar regla de tiempo de anticipación
    const cancellationRule = checkRule('enableCancellation');
    if (cancellationRule.exists && cancellationRule.enabled) {
      const timeLimit = cancellationRule.value?.cancellationTimeLimit || 24;
      const appointmentTime = new Date(appointment.startTime);
      const now = new Date();
      const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
      
      if (hoursUntilAppointment < timeLimit) {
        return { 
          allowed: false, 
          reason: `Debes cancelar con al menos ${timeLimit} horas de anticipación` 
        };
      }
    }
    
    return { allowed: true };
  }, [hasPermission, checkRule]);
  
  /**
   * Verificar si puede completar un turno
   */
  const canComplete = useCallback((appointment) => {
    if (!hasPermission('appointments.complete')) {
      return { allowed: false, reason: 'Sin permiso para completar turnos' };
    }
    
    if (appointment.status !== 'IN_PROGRESS') {
      return { allowed: false, reason: 'El turno debe estar en progreso para completarlo' };
    }
    
    // Verificar si requiere consentimiento
    const consentRule = checkRule('requiresConsentForCompletion');
    if (consentRule.exists && consentRule.enabled && !appointment.hasConsent) {
      return { allowed: false, reason: 'Requiere firma de consentimiento' };
    }
    
    // Verificar si requiere evidencia
    const evidenceRule = checkRule('requiresEvidencePhotos');
    if (evidenceRule.exists && evidenceRule.enabled) {
      const photoCount = appointment.evidencePhotos?.length || 0;
      if (photoCount === 0) {
        return { allowed: false, reason: 'Requiere subir fotos de evidencia' };
      }
    }
    
    // Verificar pago
    const paymentRule = checkRule('requiresFullPayment');
    if (paymentRule.exists && paymentRule.enabled) {
      if (appointment.paidAmount < appointment.totalAmount) {
        return { allowed: false, reason: 'Requiere pago completo' };
      }
    }
    
    return { allowed: true };
  }, [hasPermission, checkRule]);
  
  /**
   * Cargar turnos desde la API
   */
  const fetchAppointments = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Endpoint diferente según rol
      const endpoint = isSpecialist 
        ? '/api/specialists/me/appointments'
        : '/api/appointments';
      
      // Limpiar filtros: remover valores null, undefined, 'null'
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== 'null' && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const params = new URLSearchParams({
        businessId: user.businessId,
        ...cleanFilters
      });
      
      console.log('🔍 Fetching appointments:', { endpoint, filters: cleanFilters, businessId: user.businessId });
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${endpoint}?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('📡 Appointments response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || errorData.message || 'Error cargando turnos');
      }
      
      const result = await response.json();
      console.log('📦 Backend response:', result);
      
      // El backend retorna: { success: true, data: { appointments: [...], pagination: {...} } }
      const appointmentsData = result.data?.appointments || result.data || [];
      
      console.log('✅ Appointments loaded:', Array.isArray(appointmentsData) ? appointmentsData.length : 'NOT AN ARRAY', appointmentsData);
      
      setAppointments(appointmentsData);
      return appointmentsData;
    } catch (err) {
      const errorMsg = err.message || 'Error cargando turnos';
      console.error('❌ fetchAppointments error:', err);
      setError(errorMsg);
      
      // No lanzar error, solo setear en el estado
      // throw new Error(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.businessId, token, isSpecialist]);
  
  /**
   * Refrescar turnos (para pull-to-refresh)
   */
  const refresh = useCallback(async (filters = {}) => {
    setRefreshing(true);
    try {
      await fetchAppointments(filters);
    } finally {
      setRefreshing(false);
    }
  }, [fetchAppointments]);
  
  /**
   * Crear nuevo turno
   */
  const createAppointment = useCallback(async (appointmentData) => {
    const canCreateResult = canCreate();
    if (!canCreateResult.allowed) {
      throw new Error(canCreateResult.reason);
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/appointments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...appointmentData,
            businessId: user.businessId
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creando turno');
      }
      
      const data = await response.json();
      const newAppointment = data.data;
      
      // Agregar a la lista local
      setAppointments(prev => [newAppointment, ...prev]);
      
      return newAppointment;
    } catch (err) {
      const errorMsg = err.message || 'Error creando turno';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [canCreate, user?.businessId, token]);
  
  /**
   * Actualizar estado del turno
   */
  const updateAppointmentStatus = useCallback(async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/appointments/${appointmentId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error actualizando turno');
      }
      
      const data = await response.json();
      
      // Actualizar en la lista local
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      );
      
      return data.data;
    } catch (err) {
      const errorMsg = err.message || 'Error actualizando turno';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  /**
   * Cancelar turno
   */
  const cancelAppointment = useCallback(async (appointmentId, reason) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      throw new Error('Turno no encontrado');
    }
    
    const canCancelResult = canCancel(appointment);
    if (!canCancelResult.allowed) {
      throw new Error(canCancelResult.reason);
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/appointments/${appointmentId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error cancelando turno');
      }
      
      // Actualizar en la lista local
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'CANCELED', cancellationReason: reason }
            : apt
        )
      );
    } catch (err) {
      const errorMsg = err.message || 'Error cancelando turno';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [appointments, canCancel, token]);
  
  /**
   * Confirmar turno
   */
  const confirmAppointment = useCallback(async (appointmentId) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/appointments/${appointmentId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error confirmando turno');
      }
      
      // Actualizar en la lista local
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'CONFIRMED' }
            : apt
        )
      );
    } catch (err) {
      const errorMsg = err.message || 'Error confirmando turno';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  /**
   * Iniciar turno
   */
  const startAppointment = useCallback(async (appointmentId) => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/appointments/${appointmentId}/start`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error iniciando turno');
      }
      
      // Actualizar en la lista local
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'IN_PROGRESS' }
            : apt
        )
      );
    } catch (err) {
      const errorMsg = err.message || 'Error iniciando turno';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  /**
   * Completar turno
   */
  const completeAppointment = useCallback(async (appointmentId) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      throw new Error('Turno no encontrado');
    }
    
    const canCompleteResult = canComplete(appointment);
    if (!canCompleteResult.allowed) {
      throw new Error(canCompleteResult.reason);
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/appointments/${appointmentId}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error completando turno');
      }
      
      // Actualizar en la lista local
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'COMPLETED' }
            : apt
        )
      );
    } catch (err) {
      const errorMsg = err.message || 'Error completando turno';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [appointments, canComplete, token]);
  
  /**
   * Obtener un turno específico por ID
   */
  const getAppointmentById = useCallback(async (appointmentId) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/appointments/${appointmentId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Error obteniendo turno');
      }
      
      const data = await response.json();
      return data.data;
    } catch (err) {
      throw new Error(err.message || 'Error obteniendo turno');
    }
  }, [token]);
  
  return {
    // Datos
    appointments,
    loading,
    refreshing,
    error,
    
    // Funciones de carga
    fetchAppointments,
    refresh,
    getAppointmentById,
    
    // Funciones de gestión
    createAppointment,
    updateAppointmentStatus,
    confirmAppointment,
    startAppointment,
    completeAppointment,
    cancelAppointment,
    
    // Funciones de validación
    canCreate,
    canEdit,
    canCancel,
    canComplete
  };
};
