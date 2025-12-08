import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  getSpecialistServices,
  assignServiceToSpecialist,
  updateSpecialistService,
  removeServiceFromSpecialist,
  clearSpecialistServiceError,
  clearSpecialistServiceSuccess,
  resetSpecialistServiceState,
  setSelectedSpecialistService
} from '../store/slices/specialistServiceSlice';
import {
  selectSpecialistServices,
  selectSelectedSpecialistService,
  selectSpecialistServiceLoading,
  selectSpecialistServiceError,
  selectSpecialistServiceSuccess,
  selectSpecialistServiceMessage,
  selectActiveSpecialistServices,
  selectBookableSpecialistServices,
  selectCustomPriceForService,
  selectHasCustomPrice,
  selectSpecialistServicesCount
} from '../store/selectors/specialistServiceSelectors';

/**
 * Hook personalizado para gestión de servicios de especialistas con precios personalizados
 * 
 * @returns {Object} Objeto con estado y acciones para specialist services
 * 
 * @example
 * const {
 *   services,
 *   loading,
 *   error,
 *   getServices,
 *   assignService,
 *   updateService,
 *   removeService
 * } = useSpecialistService();
 */
export const useSpecialistService = () => {
  const dispatch = useDispatch();

  // Selectores
  const services = useSelector(selectSpecialistServices);
  const selectedService = useSelector(selectSelectedSpecialistService);
  const loading = useSelector(selectSpecialistServiceLoading);
  const error = useSelector(selectSpecialistServiceError);
  const success = useSelector(selectSpecialistServiceSuccess);
  const message = useSelector(selectSpecialistServiceMessage);
  const activeServices = useSelector(selectActiveSpecialistServices);
  const bookableServices = useSelector(selectBookableSpecialistServices);
  const servicesCount = useSelector(selectSpecialistServicesCount);

  // Acciones
  const getServices = useCallback(
    (specialistId, isActive) => {
      return dispatch(getSpecialistServices({ specialistId, isActive }));
    },
    [dispatch]
  );

  const assignService = useCallback(
    (specialistId, serviceData) => {
      return dispatch(assignServiceToSpecialist({ specialistId, serviceData }));
    },
    [dispatch]
  );

  const updateService = useCallback(
    (specialistId, serviceId, updateData) => {
      return dispatch(updateSpecialistService({ specialistId, serviceId, updateData }));
    },
    [dispatch]
  );

  const removeService = useCallback(
    (specialistId, serviceId) => {
      return dispatch(removeServiceFromSpecialist({ specialistId, serviceId }));
    },
    [dispatch]
  );

  const selectService = useCallback(
    (service) => {
      dispatch(setSelectedSpecialistService(service));
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearSpecialistServiceError());
  }, [dispatch]);

  const clearSuccess = useCallback(() => {
    dispatch(clearSpecialistServiceSuccess());
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(resetSpecialistServiceState());
  }, [dispatch]);

  // Helpers
  const getCustomPrice = useCallback(
    (serviceId) => {
      return selectCustomPriceForService({ specialistService: { specialistServices: services } }, serviceId);
    },
    [services]
  );

  const hasCustomPrice = useCallback(
    (serviceId) => {
      return selectHasCustomPrice({ specialistService: { specialistServices: services } }, serviceId);
    },
    [services]
  );

  const getServiceById = useCallback(
    (serviceId) => {
      return services.find(s => s.serviceId === serviceId);
    },
    [services]
  );

  return {
    // Estado
    services,
    selectedService,
    loading,
    error,
    success,
    message,
    activeServices,
    bookableServices,
    servicesCount,

    // Acciones
    getServices,
    assignService,
    updateService,
    removeService,
    selectService,
    clearError,
    clearSuccess,
    resetState,

    // Helpers
    getCustomPrice,
    hasCustomPrice,
    getServiceById
  };
};

export default useSpecialistService;
