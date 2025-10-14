/**
 * @file commissionSelectors.js
 * @description Selectores centralizados para el sistema de comisiones (FM-26)
 * @exports Selectores para business config, service commissions y calculations
 */

// Re-export all selectors from commissionSlice
export {
  // Business Commission Config Selectors
  selectBusinessCommissionConfig,
  selectBusinessConfigLoading,
  selectBusinessConfigError,
  
  // Service Commission Selectors
  selectServiceCommission,
  selectServiceCommissionLoading,
  selectServiceCommissionError,
  selectAllServiceCommissions,
  selectHasServiceCommission,
  
  // Calculation Selectors
  selectCalculatedCommission,
  selectCalculationLoading,
  selectCalculationError,
  
  // Utility Selectors
  selectCommissionLastUpdated,
  selectCommissionsEnabled,
  selectCalculationType,
  selectGeneralPercentage,
  selectServiceCommissionsCount
} from '../slices/commissionSlice';

/**
 * Helper function para calcular comisión del especialista
 * @param {Object} commission - Datos de comisión
 * @param {number} amount - Monto del servicio
 * @returns {number} Monto de comisión calculado
 */
export const calculateSpecialistCommission = (commission, amount) => {
  if (!commission || !amount) return 0;
  
  const percentage = commission.specialistPercentage || 0;
  return (amount * percentage) / 100;
};

/**
 * Helper function para validar suma de porcentajes
 * @param {number} specialistPercentage - Porcentaje del especialista
 * @param {number} businessPercentage - Porcentaje del negocio
 * @returns {boolean} True si suma 100
 */
export const validatePercentageSum = (specialistPercentage, businessPercentage) => {
  return (specialistPercentage + businessPercentage) === 100;
};

/**
 * Helper function para formatear comisión para display
 * @param {Object} calculatedCommission - Resultado de cálculo
 * @returns {Object} Datos formateados para UI
 */
export const formatCommissionForDisplay = (calculatedCommission) => {
  if (!calculatedCommission) return null;
  
  return {
    total: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(calculatedCommission.amount),
    
    specialist: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(calculatedCommission.specialistAmount),
    
    business: new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(calculatedCommission.businessAmount),
    
    specialistPercentage: `${calculatedCommission.specialistPercentage}%`,
    businessPercentage: `${calculatedCommission.businessPercentage}%`,
    calculationType: calculatedCommission.calculationType
  };
};
