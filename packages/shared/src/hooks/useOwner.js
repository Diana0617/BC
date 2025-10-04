import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  fetchPlatformStats,
  clearError as clearStatsError,
  resetStats,
  selectOwnerStats,
  selectOwnerStatsLoading,
  selectOwnerStatsError,
  selectTotalUsers,
  selectTotalBusinesses,
  selectActiveSubscriptions
} from '../store/slices/ownerStatsSlice';

import {
  fetchBusinesses,
  createBusiness,
  toggleBusinessStatus,
  setFilters,
  clearFilters,
  clearErrors as clearBusinessErrors,
  resetBusinesses,
  selectBusinesses,
  selectBusinessesPagination,
  selectBusinessesLoading,
  selectBusinessesCreating,
  selectBusinessesUpdating,
  selectBusinessesError
} from '../store/slices/ownerBusinessesSlice';

import {
  createSubscription,
  cancelSubscription,
  clearErrors as clearSubscriptionErrors,
  selectSubscriptionsCreating,
  selectSubscriptionsCancelling,
  selectSubscriptionsCreateError,
  selectSubscriptionsCancelError
} from '../store/slices/ownerSubscriptionsSlice';

import {
  fetchPlans,
  setFilters as setPlansFilters,
  clearFilters as clearPlansFilters,
  clearErrors as clearPlansErrors,
  selectPlans,
  selectPlansLoading,
  selectPlansError,
  selectActivePlans,
  selectPopularPlans
} from '../store/slices/plansSlice';

// Hook para las estadísticas de la plataforma
export const useOwnerStats = () => {
  const dispatch = useDispatch();
  
  const stats = useSelector(selectOwnerStats);
  const loading = useSelector(selectOwnerStatsLoading);
  const error = useSelector(selectOwnerStatsError);
  const totalUsers = useSelector(selectTotalUsers);
  const totalBusinesses = useSelector(selectTotalBusinesses);
  const activeSubscriptions = useSelector(selectActiveSubscriptions);

  const fetchStats = useCallback(() => {
    dispatch(fetchPlatformStats());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearStatsError());
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetStats());
  }, [dispatch]);

  return {
    stats,
    loading,
    error,
    totalUsers,
    totalBusinesses,
    activeSubscriptions,
    fetchStats,
    clearError,
    reset
  };
};

// Hook para la gestión de negocios
export const useOwnerBusinesses = () => {
  const dispatch = useDispatch();

  const businesses = useSelector(selectBusinesses);
  const pagination = useSelector(selectBusinessesPagination);
  const loading = useSelector(selectBusinessesLoading);
  const creating = useSelector(selectBusinessesCreating);
  const updating = useSelector(selectBusinessesUpdating);
  const error = useSelector(selectBusinessesError);

  const fetchBusinessesList = useCallback((params) => {
    dispatch(fetchBusinesses(params));
  }, [dispatch]);

  const createNewBusiness = useCallback((businessData) => {
    return dispatch(createBusiness(businessData));
  }, [dispatch]);

  const updateBusinessStatus = useCallback((businessId, status, reason) => {
    return dispatch(toggleBusinessStatus({ businessId, status, reason }));
  }, [dispatch]);

  const updateFilters = useCallback((filters) => {
    dispatch(setFilters(filters));
  }, [dispatch]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearBusinessErrors());
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(resetBusinesses());
  }, [dispatch]);

  return {
    businesses,
    pagination,
    loading,
    creating,
    updating,
    error,
    fetchBusinessesList,
    createNewBusiness,
    updateBusinessStatus,
    updateFilters,
    clearAllFilters,
    clearErrors,
    reset
  };
};

// Hook para la gestión de suscripciones
export const useOwnerSubscriptions = () => {
  const dispatch = useDispatch();

  const creating = useSelector(selectSubscriptionsCreating);
  const cancelling = useSelector(selectSubscriptionsCancelling);
  const createError = useSelector(selectSubscriptionsCreateError);
  const cancelError = useSelector(selectSubscriptionsCancelError);

  const createNewSubscription = useCallback((subscriptionData) => {
    return dispatch(createSubscription(subscriptionData));
  }, [dispatch]);

  const cancelExistingSubscription = useCallback((subscriptionId, reason) => {
    return dispatch(cancelSubscription({ subscriptionId, reason }));
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearSubscriptionErrors());
  }, [dispatch]);

  return {
    creating,
    cancelling,
    createError,
    cancelError,
    createNewSubscription,
    cancelExistingSubscription,
    clearErrors
  };
};

// Hook para los planes de suscripción
export const usePlans = () => {
  const dispatch = useDispatch();

  const plans = useSelector(selectPlans);
  const loading = useSelector(selectPlansLoading);
  const error = useSelector(selectPlansError);
  const activePlans = useSelector(selectActivePlans);
  const popularPlans = useSelector(selectPopularPlans);

  const fetchPlansList = useCallback((params) => {
    dispatch(fetchPlans(params));
  }, [dispatch]);

  const updateFilters = useCallback((filters) => {
    dispatch(setPlansFilters(filters));
  }, [dispatch]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearPlansFilters());
  }, [dispatch]);

  const clearErrors = useCallback(() => {
    dispatch(clearPlansErrors());
  }, [dispatch]);

  // Auto-fetch plans when hook is first used
  useEffect(() => {
    if (plans.length === 0 && !loading && !error) {
      fetchPlansList({ status: 'ACTIVE' });
    }
  }, [fetchPlansList, plans.length, loading, error]);

  return {
    plans,
    loading,
    error,
    activePlans,
    popularPlans,
    fetchPlansList,
    updateFilters,
    clearAllFilters,
    clearErrors
  };
};

// Hook principal que combina todas las funcionalidades OWNER
export const useOwner = () => {
  const stats = useOwnerStats();
  const businesses = useOwnerBusinesses();
  const subscriptions = useOwnerSubscriptions();
  const plans = usePlans();

  const isLoading = stats.loading || businesses.loading || subscriptions.creating || 
                   subscriptions.cancelling || plans.loading;
  
  const hasErrors = !!(stats.error || businesses.error || subscriptions.createError || 
                      subscriptions.cancelError || plans.error);

  const clearAllErrors = useCallback(() => {
    stats.clearError();
    businesses.clearErrors();
    subscriptions.clearErrors();
    plans.clearErrors();
  }, [stats, businesses, subscriptions, plans]);

  return {
    stats,
    businesses,
    subscriptions,
    plans,
    isLoading,
    hasErrors,
    clearAllErrors
  };
};

// Export como default también para compatibilidad
export default useOwner;