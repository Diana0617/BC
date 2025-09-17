import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBusinessAssignedRules } from '../../../shared/src/store/slices/businessRuleSlice';

/**
 * Hook personalizado para gestionar reglas de negocio
 * Carga y valida reglas asignadas al negocio actual
 */
export const useBusinessRules = (businessId) => {
  const dispatch = useDispatch();
  const [rulesLoaded, setRulesLoaded] = useState(false);
  const [ruleChecks, setRuleChecks] = useState({});
  
  // Redux state
  const {
    assignedRules,
    loading,
    errors
  } = useSelector(state => state.businessRule);

  /**
   * Cargar reglas de negocio asignadas
   */
  const checkBusinessRules = useCallback(async () => {
    if (!businessId) return;
    
    try {
      // Add delay to ensure token is saved in AsyncStorage after login
      console.log('checkBusinessRules: waiting for token to be available...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('checkBusinessRules: calling getBusinessAssignedRules...');
      await dispatch(getBusinessAssignedRules(false)).unwrap();
      setRulesLoaded(true);
      console.log('checkBusinessRules: rules loaded successfully');
    } catch (error) {
      console.error('Error loading business rules:', error);
      setRulesLoaded(false);
    }
  }, [dispatch, businessId]);

  /**
   * Procesar reglas en formato útil para validaciones
   */
  useEffect(() => {
    if (assignedRules && assignedRules.length > 0) {
      const processedRules = {};
      
      assignedRules.forEach(ruleAssignment => {
        const rule = ruleAssignment.effectiveRule;
        if (rule && rule.isActive) {
          processedRules[rule.ruleKey] = {
            key: rule.ruleKey,
            value: rule.ruleValue,
            category: rule.category,
            priority: rule.priority,
            description: rule.description,
            assignmentId: ruleAssignment.id,
            templateId: ruleAssignment.ruleTemplateId
          };
        }
      });
      
      setRuleChecks(processedRules);
    }
  }, [assignedRules]);

  /**
   * Verificar regla específica
   */
  const checkRule = useCallback((ruleKey) => {
    const rule = ruleChecks[ruleKey];
    if (!rule) return { exists: false, enabled: false };
    
    return {
      exists: true,
      enabled: rule.value?.enabled || false,
      value: rule.value,
      description: rule.description,
      category: rule.category
    };
  }, [ruleChecks]);

  /**
   * Verificar si se permite cerrar cita sin pago
   */
  const canCloseWithoutPayment = useCallback(() => {
    const rule = checkRule('allowCloseWithoutPayment');
    return rule.enabled && rule.value?.enabled === true;
  }, [checkRule]);

  /**
   * Verificar si se permite cerrar cita sin consentimiento
   */
  const canCloseWithoutConsent = useCallback(() => {
    const rule = checkRule('allowCloseWithoutConsent');
    return rule.enabled && rule.value?.enabled === true;
  }, [checkRule]);

  /**
   * Verificar si requiere aprobación del manager
   */
  const requiresManagerApproval = useCallback((action) => {
    let ruleKey = '';
    
    switch (action) {
      case 'closeWithoutPayment':
        ruleKey = 'allowCloseWithoutPayment';
        break;
      case 'closeWithoutConsent':
        ruleKey = 'allowCloseWithoutConsent';
        break;
      default:
        return false;
    }
    
    const rule = checkRule(ruleKey);
    return rule.enabled && rule.value?.requiresManagerApproval === true;
  }, [checkRule]);

  /**
   * Obtener configuración de cancelación
   */
  const getCancellationPolicy = useCallback(() => {
    const rule = checkRule('enableCancellation');
    
    if (!rule.enabled) {
      return { 
        enabled: false,
        timeLimit: 0,
        autoRefund: false,
        createVoucher: false
      };
    }
    
    return {
      enabled: true,
      timeLimit: rule.value?.cancellationTimeLimit || 24,
      autoRefund: rule.value?.autoRefundOnCancel || false,
      createVoucher: rule.value?.createVoucherOnCancel || false,
      policy: rule.value?.cancellationPolicy || ''
    };
  }, [checkRule]);

  /**
   * Obtener configuración de horarios de trabajo
   */
  const getWorkingHours = useCallback(() => {
    const rule = checkRule('workingHours');
    
    if (!rule.enabled) {
      return {
        enabled: false,
        schedule: {}
      };
    }
    
    return {
      enabled: true,
      schedule: rule.value?.schedule || {},
      timezone: rule.value?.timezone || 'America/Bogota'
    };
  }, [checkRule]);

  /**
   * Validar acción según reglas de negocio
   */
  const validateAction = useCallback((action, context = {}) => {
    const validation = {
      allowed: false,
      requiresApproval: false,
      warnings: [],
      requirements: []
    };

    switch (action) {
      case 'closeAppointment':
        return validateAppointmentClosure(context);
        
      case 'cancelAppointment':
        return validateAppointmentCancellation(context);
        
      case 'rescheduleAppointment':
        return validateAppointmentReschedule(context);
        
      default:
        return validation;
    }
  }, [ruleChecks]);

  /**
   * Validar cierre de cita
   */
  const validateAppointmentClosure = (context) => {
    const validation = {
      allowed: true,
      requiresApproval: false,
      warnings: [],
      requirements: []
    };

    // Verificar pago
    if (!context.hasPaid && !canCloseWithoutPayment()) {
      validation.allowed = false;
      validation.requirements.push('Pago requerido para cerrar la cita');
    } else if (!context.hasPaid && canCloseWithoutPayment()) {
      validation.requiresApproval = requiresManagerApproval('closeWithoutPayment');
      validation.warnings.push('Cerrando cita sin pago - Requiere justificación');
    }

    // Verificar consentimiento
    if (context.requiresConsent && !context.hasConsent && !canCloseWithoutConsent()) {
      validation.allowed = false;
      validation.requirements.push('Consentimiento requerido para cerrar la cita');
    } else if (context.requiresConsent && !context.hasConsent && canCloseWithoutConsent()) {
      validation.requiresApproval = requiresManagerApproval('closeWithoutConsent');
      validation.warnings.push('Cerrando cita sin consentimiento - Requiere justificación');
    }

    return validation;
  };

  /**
   * Validar cancelación de cita
   */
  const validateAppointmentCancellation = (context) => {
    const cancellationPolicy = getCancellationPolicy();
    const validation = {
      allowed: cancellationPolicy.enabled,
      requiresApproval: false,
      warnings: [],
      requirements: [],
      refundOptions: {
        autoRefund: cancellationPolicy.autoRefund,
        createVoucher: cancellationPolicy.createVoucher
      }
    };

    if (!cancellationPolicy.enabled) {
      validation.requirements.push('Las cancelaciones no están habilitadas');
      return validation;
    }

    // Verificar límite de tiempo
    const hoursUntilAppointment = context.hoursUntilAppointment || 0;
    if (hoursUntilAppointment < cancellationPolicy.timeLimit) {
      validation.warnings.push(
        `Cancelación dentro del límite de ${cancellationPolicy.timeLimit} horas`
      );
      validation.requiresApproval = true;
    }

    return validation;
  };

  /**
   * Validar reagendamiento de cita
   */
  const validateAppointmentReschedule = (context) => {
    const rule = checkRule('allowReschedule');
    const validation = {
      allowed: rule.enabled && rule.value?.enabled !== false,
      requiresApproval: false,
      warnings: [],
      requirements: []
    };

    if (!validation.allowed) {
      validation.requirements.push('Los reagendamientos no están habilitados');
      return validation;
    }

    // Verificar límite de tiempo para reagendar
    const rescheduleTimeLimit = rule.value?.rescheduleTimeLimit || 4;
    const hoursUntilAppointment = context.hoursUntilAppointment || 0;
    
    if (hoursUntilAppointment < rescheduleTimeLimit) {
      validation.warnings.push(
        `Reagendamiento dentro del límite de ${rescheduleTimeLimit} horas`
      );
      validation.requiresApproval = true;
    }

    return validation;
  };

  return {
    // Estado
    rulesLoaded,
    loading: loading.assignedRules,
    errors: errors.assignedRules,
    
    // Datos
    assignedRules,
    ruleChecks,
    
    // Funciones de carga
    checkBusinessRules,
    
    // Funciones de validación
    checkRule,
    canCloseWithoutPayment,
    canCloseWithoutConsent,
    requiresManagerApproval,
    getCancellationPolicy,
    getWorkingHours,
    validateAction
  };
};

export default useBusinessRules;