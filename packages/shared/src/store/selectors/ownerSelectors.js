// Selectors combinados para funcionalidades OWNER
import { createSelector } from '@reduxjs/toolkit';

// Selector para obtener un resumen completo del dashboard OWNER
export const selectOwnerDashboardSummary = createSelector(
  [
    state => state.ownerStats.stats.users.total,
    state => state.ownerStats.stats.businesses.total,
    state => state.ownerStats.stats.subscriptions.activeCount,
    state => state.ownerStats.stats.plans.total,
    state => state.ownerStats.stats.modules.total,
    state => state.ownerStats.loading
  ],
  (totalUsers, totalBusinesses, activeSubscriptions, totalPlans, totalModules, loading) => ({
    totalUsers,
    totalBusinesses,
    activeSubscriptions,
    totalPlans,
    totalModules,
    loading
  })
);

// Selector para obtener estadísticas de crecimiento
export const selectGrowthStats = createSelector(
  [
    state => state.ownerStats.stats.users.byRole,
    state => state.ownerStats.stats.businesses.byStatus,
    state => state.ownerStats.stats.subscriptions.byStatus
  ],
  (usersByRole, businessesByStatus, subscriptionsByStatus) => {
    const ownerUsers = usersByRole.find(u => u.role === 'OWNER')?.count || 0;
    const clientUsers = usersByRole.find(u => u.role === 'CLIENT')?.count || 0;
    const businessUsers = usersByRole.find(u => u.role === 'BUSINESS')?.count || 0;
    
    const activeBusinesses = businessesByStatus.find(b => b.status === 'ACTIVE')?.count || 0;
    const inactiveBusinesses = businessesByStatus.find(b => b.status === 'INACTIVE')?.count || 0;
    
    const activeSubscriptions = subscriptionsByStatus.find(s => s.status === 'ACTIVE')?.count || 0;
    const expiredSubscriptions = subscriptionsByStatus.find(s => s.status === 'EXPIRED')?.count || 0;
    
    return {
      users: {
        owners: ownerUsers,
        clients: clientUsers,
        businesses: businessUsers,
        total: ownerUsers + clientUsers + businessUsers
      },
      businesses: {
        active: activeBusinesses,
        inactive: inactiveBusinesses,
        total: activeBusinesses + inactiveBusinesses
      },
      subscriptions: {
        active: activeSubscriptions,
        expired: expiredSubscriptions,
        total: activeSubscriptions + expiredSubscriptions
      }
    };
  }
);

// Selector para obtener información de planes más populares
export const selectPopularPlansInfo = createSelector(
  [state => state.plans.plans],
  (plans) => {
    const popularPlans = plans.filter(plan => plan.isPopular && plan.status === 'ACTIVE');
    const priceRanges = plans
      .filter(plan => plan.status === 'ACTIVE')
      .map(plan => parseFloat(plan.price))
      .sort((a, b) => a - b);
    
    return {
      popularPlans,
      totalPlans: plans.filter(plan => plan.status === 'ACTIVE').length,
      priceRange: {
        min: priceRanges[0] || 0,
        max: priceRanges[priceRanges.length - 1] || 0,
        average: priceRanges.length > 0 
          ? priceRanges.reduce((sum, price) => sum + price, 0) / priceRanges.length 
          : 0
      }
    };
  }
);

// Selector para obtener el estado general de loading de las funcionalidades OWNER
export const selectOwnerLoadingState = createSelector(
  [
    state => state.ownerStats.loading,
    state => state.ownerBusinesses.loading,
    state => state.ownerBusinesses.creating,
    state => state.ownerBusinesses.updating,
    state => state.ownerSubscriptions.creating,
    state => state.ownerSubscriptions.cancelling,
    state => state.plans.loading
  ],
  (statsLoading, businessesLoading, businessCreating, businessUpdating, 
   subscriptionCreating, subscriptionCancelling, plansLoading) => ({
    isAnyLoading: statsLoading || businessesLoading || businessCreating || 
                  businessUpdating || subscriptionCreating || subscriptionCancelling || plansLoading,
    statsLoading,
    businessesLoading,
    businessCreating,
    businessUpdating,
    subscriptionCreating,
    subscriptionCancelling,
    plansLoading
  })
);

// Selector para obtener todos los errores de las funcionalidades OWNER
export const selectOwnerErrors = createSelector(
  [
    state => state.ownerStats.error,
    state => state.ownerBusinesses.error,
    state => state.ownerBusinesses.createError,
    state => state.ownerBusinesses.updateError,
    state => state.ownerSubscriptions.createError,
    state => state.ownerSubscriptions.cancelError,
    state => state.plans.error
  ],
  (statsError, businessesError, businessCreateError, businessUpdateError,
   subscriptionCreateError, subscriptionCancelError, plansError) => {
    const errors = [
      statsError,
      businessesError,
      businessCreateError,
      businessUpdateError,
      subscriptionCreateError,
      subscriptionCancelError,
      plansError
    ].filter(Boolean);
    
    return {
      hasErrors: errors.length > 0,
      errors,
      statsError,
      businessesError,
      businessCreateError,
      businessUpdateError,
      subscriptionCreateError,
      subscriptionCancelError,
      plansError
    };
  }
);