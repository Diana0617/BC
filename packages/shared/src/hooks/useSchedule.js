import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createSchedule,
  getScheduleById,
  getSchedulesByBranch,
  updateSchedule,
  deleteSchedule,
  generateSlots,
  getWeeklySchedule,
  getMonthlySchedule,
  clearScheduleError,
  clearScheduleSuccess,
  resetScheduleState,
  setCurrentSchedule,
  clearWeeklyView,
  clearMonthlyView
} from '../store/slices/scheduleSlice';

import {
  selectSchedules,
  selectCurrentSchedule,
  selectWeeklyView,
  selectMonthlyView,
  selectGeneratedSlots,
  selectScheduleLoading,
  selectScheduleError,
  selectScheduleSuccess,
  selectScheduleMessage,
  selectSchedulesBySpecialist,
  selectSchedulesByBranch,
  selectActiveSchedules,
  selectCurrentScheduleAvailableDays,
  selectHasGeneratedSlots,
  selectGeneratedSlotsByDate,
  selectProcessedWeeklyView,
  selectMonthlyViewStats,
  selectCurrentScheduleHasDays
} from '../store/selectors/scheduleSelectors';

/**
 * 📅 Custom Hook for Schedule Management
 * Hook para gestión completa de horarios de especialistas
 */
export const useSchedule = () => {
  const dispatch = useDispatch();

  // Selectors
  const schedules = useSelector(selectSchedules);
  const currentSchedule = useSelector(selectCurrentSchedule);
  const weeklyView = useSelector(selectWeeklyView);
  const monthlyView = useSelector(selectMonthlyView);
  const generatedSlots = useSelector(selectGeneratedSlots);
  const loading = useSelector(selectScheduleLoading);
  const error = useSelector(selectScheduleError);
  const success = useSelector(selectScheduleSuccess);
  const message = useSelector(selectScheduleMessage);
  const activeSchedules = useSelector(selectActiveSchedules);
  const hasGeneratedSlots = useSelector(selectHasGeneratedSlots);
  const processedWeeklyView = useSelector(selectProcessedWeeklyView);
  const monthlyStats = useSelector(selectMonthlyViewStats);
  const currentScheduleHasDays = useSelector(selectCurrentScheduleHasDays);

  // Actions
  const handleCreateSchedule = useCallback(
    (scheduleData) => {
      return dispatch(createSchedule(scheduleData));
    },
    [dispatch]
  );

  const handleGetScheduleById = useCallback(
    (scheduleId) => {
      return dispatch(getScheduleById(scheduleId));
    },
    [dispatch]
  );

  const handleGetSchedulesByBranch = useCallback(
    (branchId) => {
      return dispatch(getSchedulesByBranch(branchId));
    },
    [dispatch]
  );

  const handleUpdateSchedule = useCallback(
    ({ scheduleId, updateData }) => {
      return dispatch(updateSchedule({ scheduleId, updateData }));
    },
    [dispatch]
  );

  const handleDeleteSchedule = useCallback(
    (scheduleId) => {
      return dispatch(deleteSchedule(scheduleId));
    },
    [dispatch]
  );

  const handleGenerateSlots = useCallback(
    ({ scheduleId, startDate, endDate }) => {
      return dispatch(generateSlots({ scheduleId, startDate, endDate }));
    },
    [dispatch]
  );

  const handleGetWeeklySchedule = useCallback(
    ({ scheduleId, date }) => {
      return dispatch(getWeeklySchedule({ scheduleId, date }));
    },
    [dispatch]
  );

  const handleGetMonthlySchedule = useCallback(
    ({ scheduleId, year, month }) => {
      return dispatch(getMonthlySchedule({ scheduleId, year, month }));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearScheduleError());
  }, [dispatch]);

  const handleClearSuccess = useCallback(() => {
    dispatch(clearScheduleSuccess());
  }, [dispatch]);

  const handleResetState = useCallback(() => {
    dispatch(resetScheduleState());
  }, [dispatch]);

  const handleSetCurrentSchedule = useCallback(
    (schedule) => {
      dispatch(setCurrentSchedule(schedule));
    },
    [dispatch]
  );

  const handleClearWeeklyView = useCallback(() => {
    dispatch(clearWeeklyView());
  }, [dispatch]);

  const handleClearMonthlyView = useCallback(() => {
    dispatch(clearMonthlyView());
  }, [dispatch]);

  // Selector Functions (with params)
  const getSchedulesBySpecialist = useCallback(
    (specialistId) => {
      return selectSchedulesBySpecialist({ schedule: { schedules } }, specialistId);
    },
    [schedules]
  );

  const getSchedulesByBranchFilter = useCallback(
    (branchId) => {
      return selectSchedulesByBranch({ schedule: { schedules } }, branchId);
    },
    [schedules]
  );

  const getCurrentScheduleAvailableDays = useCallback(() => {
    return selectCurrentScheduleAvailableDays({ schedule: { currentSchedule } });
  }, [currentSchedule]);

  const getGeneratedSlotsByDate = useCallback(() => {
    return selectGeneratedSlotsByDate({ schedule: { generatedSlots } });
  }, [generatedSlots]);

  return {
    // State
    schedules,
    currentSchedule,
    weeklyView,
    monthlyView,
    generatedSlots,
    loading,
    error,
    success,
    message,
    activeSchedules,
    hasGeneratedSlots,
    processedWeeklyView,
    monthlyStats,
    currentScheduleHasDays,

    // Actions
    createSchedule: handleCreateSchedule,
    getScheduleById: handleGetScheduleById,
    getSchedulesByBranch: handleGetSchedulesByBranch,
    updateSchedule: handleUpdateSchedule,
    deleteSchedule: handleDeleteSchedule,
    generateSlots: handleGenerateSlots,
    getWeeklySchedule: handleGetWeeklySchedule,
    getMonthlySchedule: handleGetMonthlySchedule,
    clearError: handleClearError,
    clearSuccess: handleClearSuccess,
    resetState: handleResetState,
    setCurrentSchedule: handleSetCurrentSchedule,
    clearWeeklyView: handleClearWeeklyView,
    clearMonthlyView: handleClearMonthlyView,

    // Selector Functions
    getSchedulesBySpecialist,
    getSchedulesByBranchFilter,
    getCurrentScheduleAvailableDays,
    getGeneratedSlotsByDate
  };
};
