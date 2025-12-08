/**
 * Selectors para el sistema de vouchers
 * Facilitan el acceso al estado de vouchers desde los componentes
 */

/**
 * ========================================
 * SELECTORES PARA CLIENTES
 * ========================================
 */

// Vouchers del cliente
export const selectMyVouchers = (state) => state.voucher?.myVouchers || [];
export const selectMyVouchersLoading = (state) => state.voucher?.myVouchersLoading || false;
export const selectMyVouchersError = (state) => state.voucher?.myVouchersError;

// Validación de voucher
export const selectValidatedVoucher = (state) => state.voucher?.validatedVoucher;
export const selectValidationLoading = (state) => state.voucher?.validationLoading || false;
export const selectValidationError = (state) => state.voucher?.validationError;

// Aplicación de voucher
export const selectAppliedVoucher = (state) => state.voucher?.appliedVoucher;
export const selectApplyLoading = (state) => state.voucher?.applyLoading || false;
export const selectApplyError = (state) => state.voucher?.applyError;

// Estado de bloqueo
export const selectBlockStatus = (state) => state.voucher?.blockStatus;
export const selectBlockStatusLoading = (state) => state.voucher?.blockStatusLoading || false;
export const selectBlockStatusError = (state) => state.voucher?.blockStatusError;
export const selectIsBlocked = (state) => state.voucher?.blockStatus?.isBlocked || false;

// Historial de cancelaciones
export const selectCancellationHistory = (state) => state.voucher?.cancellationHistory || [];
export const selectHistoryLoading = (state) => state.voucher?.historyLoading || false;
export const selectHistoryError = (state) => state.voucher?.historyError;

/**
 * ========================================
 * SELECTORES PARA NEGOCIOS
 * ========================================
 */

// Vouchers del negocio
export const selectBusinessVouchers = (state) => state.voucher?.businessVouchers?.data || [];
export const selectBusinessVouchersPagination = (state) => state.voucher?.businessVouchers?.pagination;
export const selectBusinessVouchersLoading = (state) => state.voucher?.businessVouchers?.loading || false;
export const selectBusinessVouchersError = (state) => state.voucher?.businessVouchers?.error;

// Clientes bloqueados
export const selectBlockedCustomers = (state) => state.voucher?.blockedCustomers?.data || [];
export const selectBlockedCustomersLoading = (state) => state.voucher?.blockedCustomers?.loading || false;
export const selectBlockedCustomersError = (state) => state.voucher?.blockedCustomers?.error;

// Estadísticas de cliente
export const selectCustomerStats = (state) => state.voucher?.customerStats;
export const selectCustomerStatsLoading = (state) => state.voucher?.customerStatsLoading || false;
export const selectCustomerStatsError = (state) => state.voucher?.customerStatsError;

// Estado de operaciones
export const selectOperationLoading = (state) => state.voucher?.operationLoading || false;
export const selectOperationError = (state) => state.voucher?.operationError;
export const selectOperationSuccess = (state) => state.voucher?.operationSuccess;

/**
 * ========================================
 * SELECTORES DERIVADOS
 * ========================================
 */

/**
 * Obtener vouchers activos disponibles para usar
 */
export const selectAvailableVouchers = (state) => {
  const vouchers = state.voucher?.myVouchers || [];
  return vouchers.filter(v => v.status === 'ACTIVE' && new Date(v.expiresAt) > new Date());
};

/**
 * Contar vouchers activos del cliente
 */
export const selectActiveVouchersCount = (state) => {
  const vouchers = state.voucher?.myVouchers || [];
  return vouchers.filter(v => v.status === 'ACTIVE').length;
};

/**
 * Obtener el voucher con mayor valor
 */
export const selectHighestValueVoucher = (state) => {
  const vouchers = state.voucher?.myVouchers || [];
  if (vouchers.length === 0) return null;
  
  return vouchers.reduce((highest, current) => {
    return (current.amount > highest.amount) ? current : highest;
  });
};

/**
 * Verificar si hay vouchers próximos a expirar (menos de 7 días)
 */
export const selectExpiringVouchers = (state) => {
  const vouchers = state.voucher?.myVouchers || [];
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  return vouchers.filter(v => {
    const expiresAt = new Date(v.expiresAt);
    return v.status === 'ACTIVE' && expiresAt <= sevenDaysFromNow && expiresAt > new Date();
  });
};

/**
 * Contar cancelaciones recientes (últimos 30 días)
 */
export const selectRecentCancellationsCount = (state) => {
  const history = state.voucher?.cancellationHistory || [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return history.filter(h => new Date(h.cancelledAt) >= thirtyDaysAgo).length;
};

/**
 * Obtener bloqueos activos del negocio
 */
export const selectActiveBlocks = (state) => {
  const blocks = state.voucher?.blockedCustomers?.data || [];
  return blocks.filter(b => b.status === 'ACTIVE');
};

/**
 * Contar bloqueos activos
 */
export const selectActiveBlocksCount = (state) => {
  return selectActiveBlocks(state).length;
};

/**
 * Filtrar vouchers del negocio por estado
 */
export const selectBusinessVouchersByStatus = (status) => (state) => {
  const vouchers = state.voucher?.businessVouchers?.data || [];
  return vouchers.filter(v => v.status === status);
};

/**
 * Calcular valor total de vouchers activos del negocio
 */
export const selectTotalActiveVouchersValue = (state) => {
  const vouchers = state.voucher?.businessVouchers?.data || [];
  return vouchers
    .filter(v => v.status === 'ACTIVE')
    .reduce((total, v) => total + parseFloat(v.amount), 0);
};

/**
 * Calcular valor total de vouchers usados
 */
export const selectTotalUsedVouchersValue = (state) => {
  const vouchers = state.voucher?.businessVouchers?.data || [];
  return vouchers
    .filter(v => v.status === 'USED')
    .reduce((total, v) => total + parseFloat(v.amount), 0);
};

/**
 * Obtener estadísticas generales de vouchers del negocio
 */
export const selectBusinessVoucherStats = (state) => {
  const vouchers = state.voucher?.businessVouchers?.data || [];
  
  const active = vouchers.filter(v => v.status === 'ACTIVE').length;
  const used = vouchers.filter(v => v.status === 'USED').length;
  const expired = vouchers.filter(v => v.status === 'EXPIRED').length;
  const cancelled = vouchers.filter(v => v.status === 'CANCELLED').length;
  
  return {
    total: vouchers.length,
    active,
    used,
    expired,
    cancelled,
    activeValue: selectTotalActiveVouchersValue(state),
    usedValue: selectTotalUsedVouchersValue(state)
  };
};

/**
 * Verificar si hay alguna operación en curso
 */
export const selectIsAnyOperationLoading = (state) => {
  return (
    state.voucher?.myVouchersLoading ||
    state.voucher?.validationLoading ||
    state.voucher?.applyLoading ||
    state.voucher?.blockStatusLoading ||
    state.voucher?.historyLoading ||
    state.voucher?.businessVouchers?.loading ||
    state.voucher?.blockedCustomers?.loading ||
    state.voucher?.customerStatsLoading ||
    state.voucher?.operationLoading ||
    false
  );
};
