import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

/**
 * Hook personalizado para validar citas antes del cierre
 * Integra las reglas de negocio y verifica requisitos
 */
export const useAppointmentValidation = () => {
  const [validationResult, setValidationResult] = useState({
    canComplete: false,
    requirements: [],
    warnings: [],
    steps: {
      consent: { required: false, completed: false },
      evidence: { required: true, completed: false },
      payment: { required: true, completed: false },
      inventory: { required: true, completed: false }
    }
  });
  
  const [isValidating, setIsValidating] = useState(false);
  
  const businessRules = useSelector(state => state.businessRule?.assignedRules || []);
  const user = useSelector(state => state.auth.user);

  /**
   * Validar si una cita puede iniciarse
   */
  const validateAppointment = useCallback(async (appointmentId) => {
    setIsValidating(true);
    
    try {
      // Simular llamada a API - En producción usar AppointmentMediaController.validateAppointmentCompletion
      const response = await mockValidateAppointment(appointmentId);
      
      setValidationResult(response);
      return response;
    } catch (error) {
      console.error('Error validating appointment:', error);
      return {
        canStart: false,
        reason: 'Error al validar la cita'
      };
    } finally {
      setIsValidating(false);
    }
  }, [businessRules, user.id]);

  /**
   * Validar paso específico del cierre de cita
   */
  const validateStep = useCallback(async (appointmentId, step, data = {}) => {
    setIsValidating(true);
    
    try {
      let stepValid = false;
      let message = '';

      switch (step) {
        case 'consent':
          stepValid = await validateConsentStep(appointmentId, data);
          message = stepValid ? 'Consentimiento válido' : 'Consentimiento requerido';
          break;
          
        case 'evidence':
          stepValid = await validateEvidenceStep(appointmentId, data);
          message = stepValid ? 'Evidencia suficiente' : 'Se requiere evidencia fotográfica';
          break;
          
        case 'payment':
          stepValid = await validatePaymentStep(appointmentId, data);
          message = stepValid ? 'Pago procesado' : 'Pago pendiente o requerido';
          break;
          
        case 'inventory':
          stepValid = await validateInventoryStep(appointmentId, data);
          message = stepValid ? 'Inventario actualizado' : 'Actualización de inventario pendiente';
          break;
          
        default:
          throw new Error(`Paso de validación desconocido: ${step}`);
      }

      // Actualizar estado de validación
      setValidationResult(prev => ({
        ...prev,
        steps: {
          ...prev.steps,
          [step]: {
            ...prev.steps[step],
            completed: stepValid
          }
        }
      }));

      return {
        isValid: stepValid,
        message,
        step
      };
    } catch (error) {
      console.error(`Error validating step ${step}:`, error);
      return {
        isValid: false,
        message: `Error en validación de ${step}`,
        step
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Verificar si todas las validaciones están completas
   */
  const isFullyValidated = useCallback(() => {
    const { steps } = validationResult;
    
    return Object.entries(steps).every(([stepName, step]) => {
      return !step.required || step.completed;
    });
  }, [validationResult]);

  return {
    validateAppointment,
    validateStep,
    isFullyValidated,
    validationResult,
    isValidating
  };
};

// =====================================================
// FUNCIONES DE VALIDACIÓN POR PASO
// =====================================================

/**
 * Validar consentimiento informado
 */
const validateConsentStep = async (appointmentId, data) => {
  // Verificar si el servicio requiere consentimiento
  if (!data.requiresConsent) {
    return true; // No requerido = válido
  }

  // Verificar si se subió el PDF firmado
  if (data.consentFile && data.consentFile.signed) {
    return true;
  }

  return false;
};

/**
 * Validar evidencia multimedia
 */
const validateEvidenceStep = async (appointmentId, data) => {
  const evidence = data.evidence || { before: [], after: [] };
  
  // Al menos una foto antes (recomendado)
  const hasBeforePhotos = evidence.before && evidence.before.length > 0;
  
  // Al menos una foto después (recomendado)
  const hasAfterPhotos = evidence.after && evidence.after.length > 0;
  
  // Por ahora solo recomendamos, no obligamos
  return true; // Siempre válido, pero se pueden agregar warnings
};

/**
 * Validar procesamiento de pago
 */
const validatePaymentStep = async (appointmentId, data) => {
  const businessRules = data.businessRules || {};
  
  // Si está permitido cerrar sin pago
  if (businessRules.allowCloseWithoutPayment) {
    return true;
  }

  // Verificar si hay pago procesado
  if (data.paymentStatus === 'completed' || data.paymentStatus === 'paid') {
    return true;
  }

  return false;
};

/**
 * Validar actualización de inventario
 */
const validateInventoryStep = async (appointmentId, data) => {
  const usedProducts = data.usedProducts || [];
  
  // Si no se usaron productos, es válido
  if (usedProducts.length === 0) {
    return true;
  }

  // Verificar que todos los productos usados estén registrados
  return usedProducts.every(product => 
    product.quantityUsed && product.quantityUsed > 0
  );
};

// =====================================================
// MOCK FUNCTIONS - En producción reemplazar con APIs reales
// =====================================================

const mockValidateAppointment = async (appointmentId) => {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    canStart: true,
    canComplete: false,
    requirements: [
      'Verificar consentimiento si es requerido',
      'Subir evidencia fotográfica',
      'Procesar pago según reglas de negocio',
      'Actualizar inventario de productos usados'
    ],
    warnings: [
      'Se recomienda tomar fotos antes del procedimiento',
      'Verificar que el cliente esté conforme con el resultado'
    ],
    steps: {
      consent: { required: true, completed: false },
      evidence: { required: true, completed: false },
      payment: { required: true, completed: false },
      inventory: { required: true, completed: false }
    }
  };
};

export default useAppointmentValidation;