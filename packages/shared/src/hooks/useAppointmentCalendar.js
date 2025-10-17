import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentsByDateRange,
  clearAppointmentError,
  clearAppointmentSuccess,
  resetAppointmentState,
  setSelectedAppointment,
  setCalendarView,
  setAppointmentFilters,
  clearAppointmentFilters
} from '../store/slices/appointmentCalendarSlice';

import {
  selectAppointments,
  selectCalendarAppointments,
  selectSelectedAppointment,
  selectAppointmentFilters,
  selectAppointmentPagination,
  selectAppointmentLoading,
  selectAppointmentError,
  selectAppointmentSuccess,
  selectAppointmentMessage,
  selectAppointmentsByDate,
  selectAppointmentsBySpecialist,
  selectAppointmentsByBranch,
  selectAppointmentsByStatus,
  selectConfirmedAppointments,
  selectPendingAppointments,
  selectFilteredAppointments,
  selectCalendarStats,
  selectHasActiveFilters,
  selectPaginationInfo,
  selectTodayAppointments,
  selectUpcomingAppointments
} from '../store/selectors/appointmentCalendarSelectors';

/**
 * 📆 Custom Hook for Appointment Calendar
 * Hook para gestión de calendario de citas con filtros y vistas
 */
export const useAppointmentCalendar = () => {
  const dispatch = useDispatch();

  // Selectors
  const appointments = useSelector(selectAppointments);
  const calendarAppointments = useSelector(selectCalendarAppointments);
  const selectedAppointment = useSelector(selectSelectedAppointment);
  const filters = useSelector(selectAppointmentFilters);
  const pagination = useSelector(selectAppointmentPagination);
  const loading = useSelector(selectAppointmentLoading);
  const error = useSelector(selectAppointmentError);
  const success = useSelector(selectAppointmentSuccess);
  const message = useSelector(selectAppointmentMessage);
  const confirmedAppointments = useSelector(selectConfirmedAppointments);
  const pendingAppointments = useSelector(selectPendingAppointments);
  const filteredAppointments = useSelector(selectFilteredAppointments);
  const calendarStats = useSelector(selectCalendarStats);
  const hasActiveFilters = useSelector(selectHasActiveFilters);
  const paginationInfo = useSelector(selectPaginationInfo);
  const todayAppointments = useSelector(selectTodayAppointments);
  const upcomingAppointments = useSelector(selectUpcomingAppointments);

  // Actions
  const handleGetAppointments = useCallback(
    (params) => {
      return dispatch(getAppointments(params));
    },
    [dispatch]
  );

  const handleGetAppointmentById = useCallback(
    (appointmentId) => {
      return dispatch(getAppointmentById(appointmentId));
    },
    [dispatch]
  );

  const handleCreateAppointment = useCallback(
    (appointmentData) => {
      return dispatch(createAppointment(appointmentData));
    },
    [dispatch]
  );

  const handleUpdateAppointment = useCallback(
    ({ appointmentId, updateData }) => {
      return dispatch(updateAppointment({ appointmentId, updateData }));
    },
    [dispatch]
  );

  const handleUpdateStatus = useCallback(
    ({ appointmentId, status, notes }) => {
      return dispatch(updateAppointmentStatus({ appointmentId, status, notes }));
    },
    [dispatch]
  );

  const handleCancelAppointment = useCallback(
    ({ appointmentId, cancelReason }) => {
      return dispatch(cancelAppointment({ appointmentId, cancelReason }));
    },
    [dispatch]
  );

  const handleGetByDateRange = useCallback(
    ({ businessId, startDate, endDate, specialistId, branchId, status }) => {
      return dispatch(getAppointmentsByDateRange({ 
        businessId,
        startDate, 
        endDate, 
        specialistId, 
        branchId, 
        status 
      }));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearAppointmentError());
  }, [dispatch]);

  const handleClearSuccess = useCallback(() => {
    dispatch(clearAppointmentSuccess());
  }, [dispatch]);

  const handleResetState = useCallback(() => {
    dispatch(resetAppointmentState());
  }, [dispatch]);

  const handleSetSelectedAppointment = useCallback(
    (appointment) => {
      dispatch(setSelectedAppointment(appointment));
    },
    [dispatch]
  );

  const handleSetCalendarView = useCallback(
    (appointments) => {
      dispatch(setCalendarView(appointments));
    },
    [dispatch]
  );

  const handleSetFilters = useCallback(
    (newFilters) => {
      dispatch(setAppointmentFilters(newFilters));
    },
    [dispatch]
  );

  const handleClearFilters = useCallback(() => {
    dispatch(clearAppointmentFilters());
  }, [dispatch]);

  // Selector Functions (with params)
  const getAppointmentsByDate = useCallback(
    (date) => {
      return selectAppointmentsByDate({ 
        appointmentCalendar: { calendarAppointments } 
      }, date);
    },
    [calendarAppointments]
  );

  const getAppointmentsBySpecialist = useCallback(
    (specialistId) => {
      return selectAppointmentsBySpecialist({ 
        appointmentCalendar: { calendarAppointments } 
      }, specialistId);
    },
    [calendarAppointments]
  );

  const getAppointmentsByBranch = useCallback(
    (branchId) => {
      return selectAppointmentsByBranch({ 
        appointmentCalendar: { calendarAppointments } 
      }, branchId);
    },
    [calendarAppointments]
  );

  const getAppointmentsByStatus = useCallback(
    (status) => {
      return selectAppointmentsByStatus({ 
        appointmentCalendar: { calendarAppointments } 
      }, status);
    },
    [calendarAppointments]
  );

  return {
    // State
    appointments,
    calendarAppointments,
    selectedAppointment,
    filters,
    pagination,
    loading,
    error,
    success,
    message,
    confirmedAppointments,
    pendingAppointments,
    filteredAppointments,
    calendarStats,
    hasActiveFilters,
    paginationInfo,
    todayAppointments,
    upcomingAppointments,

    // Actions
    getAppointments: handleGetAppointments,
    getAppointmentById: handleGetAppointmentById,
    createAppointment: handleCreateAppointment,
    updateAppointment: handleUpdateAppointment,
    updateStatus: handleUpdateStatus,
    cancelAppointment: handleCancelAppointment,
    getByDateRange: handleGetByDateRange,
    clearError: handleClearError,
    clearSuccess: handleClearSuccess,
    resetState: handleResetState,
    setSelectedAppointment: handleSetSelectedAppointment,
    setCalendarView: handleSetCalendarView,
    setFilters: handleSetFilters,
    clearFilters: handleClearFilters,

    // Selector Functions
    getAppointmentsByDate,
    getAppointmentsBySpecialist,
    getAppointmentsByBranch,
    getAppointmentsByStatus
  };
};
