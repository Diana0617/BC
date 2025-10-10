import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAvailableSlots,
  getSlotsByDateRange,
  createTimeSlot,
  updateTimeSlot,
  blockTimeSlot,
  unblockTimeSlot,
  deleteTimeSlot,
  clearTimeSlotError,
  clearTimeSlotSuccess,
  resetTimeSlotState,
  setSelectedSlot,
  groupSlotsByDate
} from '../store/slices/timeSlotSlice';

import {
  selectTimeSlots,
  selectAvailableSlots,
  selectSelectedSlot,
  selectSlotsByDate,
  selectTimeSlotLoading,
  selectTimeSlotError,
  selectTimeSlotSuccess,
  selectTimeSlotMessage,
  selectSlotsBySpecificDate,
  selectAvailableSlotsByDate,
  selectSlotsBySpecialist,
  selectSlotsByBranch,
  selectSlotsByStatus,
  selectBlockedSlots,
  selectBookedSlots,
  selectSlotStats,
  selectDatesWithAvailableSlots,
  selectHasAvailableSlots,
  selectTodaySlots,
  selectFutureSlots
} from '../store/selectors/timeSlotSelectors';

/**
 * 🕐 Custom Hook for Time Slot Management
 * Hook para gestión de slots de tiempo y disponibilidad
 */
export const useTimeSlot = () => {
  const dispatch = useDispatch();

  // Selectors
  const slots = useSelector(selectTimeSlots);
  const availableSlots = useSelector(selectAvailableSlots);
  const selectedSlot = useSelector(selectSelectedSlot);
  const slotsByDate = useSelector(selectSlotsByDate);
  const loading = useSelector(selectTimeSlotLoading);
  const error = useSelector(selectTimeSlotError);
  const success = useSelector(selectTimeSlotSuccess);
  const message = useSelector(selectTimeSlotMessage);
  const blockedSlots = useSelector(selectBlockedSlots);
  const bookedSlots = useSelector(selectBookedSlots);
  const slotStats = useSelector(selectSlotStats);
  const datesWithAvailableSlots = useSelector(selectDatesWithAvailableSlots);
  const hasAvailableSlots = useSelector(selectHasAvailableSlots);
  const todaySlots = useSelector(selectTodaySlots);
  const futureSlots = useSelector(selectFutureSlots);

  // Actions
  const handleGetAvailableSlots = useCallback(
    ({ specialistId, date, serviceId }) => {
      return dispatch(getAvailableSlots({ specialistId, date, serviceId }));
    },
    [dispatch]
  );

  const handleGetSlotsByDateRange = useCallback(
    ({ startDate, endDate, specialistId, branchId }) => {
      return dispatch(getSlotsByDateRange({ startDate, endDate, specialistId, branchId }));
    },
    [dispatch]
  );

  const handleCreateSlot = useCallback(
    (slotData) => {
      return dispatch(createTimeSlot(slotData));
    },
    [dispatch]
  );

  const handleUpdateSlot = useCallback(
    ({ slotId, updateData }) => {
      return dispatch(updateTimeSlot({ slotId, updateData }));
    },
    [dispatch]
  );

  const handleBlockSlot = useCallback(
    ({ slotId, reason }) => {
      return dispatch(blockTimeSlot({ slotId, reason }));
    },
    [dispatch]
  );

  const handleUnblockSlot = useCallback(
    (slotId) => {
      return dispatch(unblockTimeSlot(slotId));
    },
    [dispatch]
  );

  const handleDeleteSlot = useCallback(
    (slotId) => {
      return dispatch(deleteTimeSlot(slotId));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearTimeSlotError());
  }, [dispatch]);

  const handleClearSuccess = useCallback(() => {
    dispatch(clearTimeSlotSuccess());
  }, [dispatch]);

  const handleResetState = useCallback(() => {
    dispatch(resetTimeSlotState());
  }, [dispatch]);

  const handleSetSelectedSlot = useCallback(
    (slot) => {
      dispatch(setSelectedSlot(slot));
    },
    [dispatch]
  );

  const handleGroupSlotsByDate = useCallback(() => {
    dispatch(groupSlotsByDate());
  }, [dispatch]);

  // Selector Functions (with params)
  const getSlotsByDate = useCallback(
    (date) => {
      return selectSlotsBySpecificDate({ timeSlot: { slots } }, date);
    },
    [slots]
  );

  const getAvailableSlotsByDate = useCallback(
    (date) => {
      return selectAvailableSlotsByDate({ timeSlot: { availableSlots } }, date);
    },
    [availableSlots]
  );

  const getSlotsBySpecialist = useCallback(
    (specialistId) => {
      return selectSlotsBySpecialist({ timeSlot: { slots } }, specialistId);
    },
    [slots]
  );

  const getSlotsByBranch = useCallback(
    (branchId) => {
      return selectSlotsByBranch({ timeSlot: { slots } }, branchId);
    },
    [slots]
  );

  const getSlotsByStatus = useCallback(
    (status) => {
      return selectSlotsByStatus({ timeSlot: { slots } }, status);
    },
    [slots]
  );

  return {
    // State
    slots,
    availableSlots,
    selectedSlot,
    slotsByDate,
    loading,
    error,
    success,
    message,
    blockedSlots,
    bookedSlots,
    slotStats,
    datesWithAvailableSlots,
    hasAvailableSlots,
    todaySlots,
    futureSlots,

    // Actions
    getAvailableSlots: handleGetAvailableSlots,
    getSlotsByDateRange: handleGetSlotsByDateRange,
    createSlot: handleCreateSlot,
    updateSlot: handleUpdateSlot,
    blockSlot: handleBlockSlot,
    unblockSlot: handleUnblockSlot,
    deleteSlot: handleDeleteSlot,
    clearError: handleClearError,
    clearSuccess: handleClearSuccess,
    resetState: handleResetState,
    setSelectedSlot: handleSetSelectedSlot,
    groupSlotsByDate: handleGroupSlotsByDate,

    // Selector Functions
    getSlotsByDate,
    getAvailableSlotsByDate,
    getSlotsBySpecialist,
    getSlotsByBranch,
    getSlotsByStatus
  };
};
