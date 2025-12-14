/**
 * Selectores Redux para el sistema de fidelización/loyalty
 * Selectores memoizados para acceder al estado de loyalty
 */

/**
 * ========================================
 * SELECTORES BÁSICOS
 * ========================================
 */

// Balance del cliente autenticado
export const selectMyBalance = (state) => state.loyalty?.myBalance;
export const selectMyBalanceLoading = (state) => state.loyalty?.myBalanceLoading;
export const selectMyBalanceError = (state) => state.loyalty?.myBalanceError;

// Transacciones del cliente autenticado
export const selectMyTransactions = (state) => state.loyalty?.myTransactions || [];
export const selectMyTransactionsPagination = (state) => state.loyalty?.myTransactionsPagination;
export const selectMyTransactionsLoading = (state) => state.loyalty?.myTransactionsLoading;
export const selectMyTransactionsError = (state) => state.loyalty?.myTransactionsError;

// Código de referido del cliente autenticado
export const selectMyReferralCode = (state) => state.loyalty?.myReferralCode;
export const selectMyReferralCodeLoading = (state) => state.loyalty?.myReferralCodeLoading;
export const selectMyReferralCodeError = (state) => state.loyalty?.myReferralCodeError;

// Referidos del cliente autenticado
export const selectMyReferrals = (state) => state.loyalty?.myReferrals || [];
export const selectMyReferralsPagination = (state) => state.loyalty?.myReferralsPagination;
export const selectMyReferralsLoading = (state) => state.loyalty?.myReferralsLoading;
export const selectMyReferralsError = (state) => state.loyalty?.myReferralsError;

// Recompensas del cliente autenticado
export const selectMyRewards = (state) => state.loyalty?.myRewards || [];
export const selectMyRewardsLoading = (state) => state.loyalty?.myRewardsLoading;
export const selectMyRewardsError = (state) => state.loyalty?.myRewardsError;

// Estado de canje
export const selectRedeemLoading = (state) => state.loyalty?.redeemLoading;
export const selectRedeemError = (state) => state.loyalty?.redeemError;
export const selectLastRedeemedReward = (state) => state.loyalty?.lastRedeemedReward;

// Estado de aplicación de recompensa
export const selectApplyRewardLoading = (state) => state.loyalty?.applyRewardLoading;
export const selectApplyRewardError = (state) => state.loyalty?.applyRewardError;

// Balance de cliente específico (para negocio)
export const selectClientBalance = (state) => state.loyalty?.clientBalance;
export const selectClientBalanceLoading = (state) => state.loyalty?.clientBalanceLoading;
export const selectClientBalanceError = (state) => state.loyalty?.clientBalanceError;

// Transacciones de cliente específico (para negocio)
export const selectClientTransactions = (state) => state.loyalty?.clientTransactions || [];
export const selectClientTransactionsPagination = (state) => state.loyalty?.clientTransactionsPagination;
export const selectClientTransactionsLoading = (state) => state.loyalty?.clientTransactionsLoading;
export const selectClientTransactionsError = (state) => state.loyalty?.clientTransactionsError;

// Referidos de cliente específico (para negocio)
export const selectClientReferrals = (state) => state.loyalty?.clientReferrals || [];
export const selectClientReferralsLoading = (state) => state.loyalty?.clientReferralsLoading;
export const selectClientReferralsError = (state) => state.loyalty?.clientReferralsError;

// Búsqueda por código de referido
export const selectFoundClient = (state) => state.loyalty?.foundClient;
export const selectFindClientLoading = (state) => state.loyalty?.findClientLoading;
export const selectFindClientError = (state) => state.loyalty?.findClientError;

// Descarga de tarjetas
export const selectDownloadCardLoading = (state) => state.loyalty?.downloadCardLoading;
export const selectDownloadCardError = (state) => state.loyalty?.downloadCardError;

// UI helpers
export const selectShowRedeemModal = (state) => state.loyalty?.showRedeemModal;
export const selectShowRewardDetailsModal = (state) => state.loyalty?.showRewardDetailsModal;
export const selectSelectedReward = (state) => state.loyalty?.selectedReward;

/**
 * ========================================
 * SELECTORES COMPUTADOS
 * ========================================
 */

/**
 * Obtener puntos totales del balance
 */
export const selectTotalPoints = (state) => {
  const balance = selectMyBalance(state);
  return balance?.totalPoints || 0;
};

/**
 * Obtener puntos por expirar pronto
 */
export const selectExpiringSoonPoints = (state) => {
  const balance = selectMyBalance(state);
  return balance?.expiringSoon || [];
};

/**
 * Verificar si el cliente tiene puntos
 */
export const selectHasPoints = (state) => {
  return selectTotalPoints(state) > 0;
};

/**
 * Verificar si hay puntos por expirar
 */
export const selectHasPointsExpiringSoon = (state) => {
  return selectExpiringSoonPoints(state).length > 0;
};

/**
 * Obtener cantidad de referidos
 */
export const selectReferralCount = (state) => {
  const referralCode = selectMyReferralCode(state);
  return referralCode?.referralCount || 0;
};

/**
 * Obtener puntos ganados por referidos
 */
export const selectReferralPoints = (state) => {
  const referralCode = selectMyReferralCode(state);
  return referralCode?.referralPoints || 0;
};

/**
 * Filtrar recompensas activas
 */
export const selectActiveRewards = (state) => {
  const rewards = selectMyRewards(state);
  return rewards.filter(reward => reward.status === 'ACTIVE');
};

/**
 * Filtrar recompensas usadas
 */
export const selectUsedRewards = (state) => {
  const rewards = selectMyRewards(state);
  return rewards.filter(reward => reward.status === 'USED');
};

/**
 * Filtrar recompensas expiradas
 */
export const selectExpiredRewards = (state) => {
  const rewards = selectMyRewards(state);
  return rewards.filter(reward => reward.status === 'EXPIRED');
};

/**
 * Contar recompensas activas
 */
export const selectActiveRewardsCount = (state) => {
  return selectActiveRewards(state).length;
};

/**
 * Verificar si hay recompensas activas
 */
export const selectHasActiveRewards = (state) => {
  return selectActiveRewardsCount(state) > 0;
};

/**
 * Filtrar transacciones por tipo
 */
export const selectTransactionsByType = (state, type) => {
  const transactions = selectMyTransactions(state);
  if (!type) return transactions;
  return transactions.filter(transaction => transaction.type === type);
};

/**
 * Obtener transacciones de créditos (positivas)
 */
export const selectCreditTransactions = (state) => {
  const transactions = selectMyTransactions(state);
  return transactions.filter(transaction => transaction.points > 0);
};

/**
 * Obtener transacciones de débitos (negativas)
 */
export const selectDebitTransactions = (state) => {
  const transactions = selectMyTransactions(state);
  return transactions.filter(transaction => transaction.points < 0);
};

/**
 * Verificar si el cliente tiene código de referido
 */
export const selectHasReferralCode = (state) => {
  const referralCode = selectMyReferralCode(state);
  return !!referralCode?.referralCode;
};

/**
 * Obtener string del código de referido
 */
export const selectReferralCodeString = (state) => {
  const referralCode = selectMyReferralCode(state);
  return referralCode?.referralCode || '';
};

/**
 * Verificar si hay algún error en loyalty
 */
export const selectHasAnyError = (state) => {
  return !!(
    selectMyBalanceError(state) ||
    selectMyTransactionsError(state) ||
    selectMyReferralCodeError(state) ||
    selectMyReferralsError(state) ||
    selectMyRewardsError(state) ||
    selectRedeemError(state) ||
    selectApplyRewardError(state) ||
    selectClientBalanceError(state) ||
    selectClientTransactionsError(state) ||
    selectClientReferralsError(state) ||
    selectFindClientError(state) ||
    selectDownloadCardError(state)
  );
};

/**
 * Verificar si hay alguna carga en progreso
 */
export const selectIsAnyLoading = (state) => {
  return !!(
    selectMyBalanceLoading(state) ||
    selectMyTransactionsLoading(state) ||
    selectMyReferralCodeLoading(state) ||
    selectMyReferralsLoading(state) ||
    selectMyRewardsLoading(state) ||
    selectRedeemLoading(state) ||
    selectApplyRewardLoading(state) ||
    selectClientBalanceLoading(state) ||
    selectClientTransactionsLoading(state) ||
    selectClientReferralsLoading(state) ||
    selectFindClientLoading(state) ||
    selectDownloadCardLoading(state)
  );
};

/**
 * Selector combinado de estado del cliente (para vista de dashboard)
 */
export const selectMyLoyaltyDashboard = (state) => {
  return {
    balance: selectMyBalance(state),
    totalPoints: selectTotalPoints(state),
    hasPoints: selectHasPoints(state),
    expiringSoon: selectExpiringSoonPoints(state),
    hasPointsExpiringSoon: selectHasPointsExpiringSoon(state),
    referralCode: selectReferralCodeString(state),
    referralCount: selectReferralCount(state),
    referralPoints: selectReferralPoints(state),
    activeRewardsCount: selectActiveRewardsCount(state),
    hasActiveRewards: selectHasActiveRewards(state),
    isLoading: selectMyBalanceLoading(state) || selectMyReferralCodeLoading(state),
    error: selectMyBalanceError(state) || selectMyReferralCodeError(state)
  };
};

/**
 * Selector combinado de estado del cliente para negocio
 */
export const selectClientLoyaltyDashboard = (state) => {
  const balance = selectClientBalance(state);
  return {
    balance,
    totalPoints: balance?.totalPoints || 0,
    expiringSoon: balance?.expiringSoon || [],
    isLoading: selectClientBalanceLoading(state),
    error: selectClientBalanceError(state)
  };
};
