import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  getUserBranches,
  assignBranchToUser,
  updateUserBranch,
  setDefaultBranch,
  removeBranchFromUser,
  getBranchUsers,
  clearUserBranchError,
  clearUserBranchSuccess,
  resetUserBranchState
} from '../store/slices/userBranchSlice';
import {
  selectUserBranches,
  selectBranchUsers,
  selectDefaultBranch,
  selectUserBranchLoading,
  selectUserBranchError,
  selectUserBranchSuccess,
  selectUserBranchMessage,
  selectUserBranchIds,
  selectDefaultBranchId,
  selectUserHasMultipleBranches,
  selectUserBranchCount,
  selectCanManageScheduleInBranch,
  selectCanCreateAppointmentsInBranch,
  selectBranchSpecialists,
  selectBranchReceptionists
} from '../store/selectors/userBranchSelectors';

/**
 * Hook personalizado para gestión de asignación de usuarios a sucursales (multi-branch)
 * 
 * @returns {Object} Objeto con estado y acciones para user branches
 * 
 * @example
 * const {
 *   userBranches,
 *   defaultBranch,
 *   loading,
 *   getBranches,
 *   assignBranch,
 *   setDefault
 * } = useUserBranch();
 */
export const useUserBranch = () => {
  const dispatch = useDispatch();

  // Selectores
  const userBranches = useSelector(selectUserBranches);
  const branchUsers = useSelector(selectBranchUsers);
  const defaultBranch = useSelector(selectDefaultBranch);
  const loading = useSelector(selectUserBranchLoading);
  const error = useSelector(selectUserBranchError);
  const success = useSelector(selectUserBranchSuccess);
  const message = useSelector(selectUserBranchMessage);
  const branchIds = useSelector(selectUserBranchIds);
  const defaultBranchId = useSelector(selectDefaultBranchId);
  const hasMultipleBranches = useSelector(selectUserHasMultipleBranches);
  const branchCount = useSelector(selectUserBranchCount);
  const branchSpecialists = useSelector(selectBranchSpecialists);
  const branchReceptionists = useSelector(selectBranchReceptionists);

  // Acciones
  const getBranches = useCallback(
    (userId) => {
      return dispatch(getUserBranches({ userId }));
    },
    [dispatch]
  );

  const assignBranch = useCallback(
    (userId, branchData) => {
      return dispatch(assignBranchToUser({ userId, branchData }));
    },
    [dispatch]
  );

  const updateBranch = useCallback(
    (userId, branchId, updateData) => {
      return dispatch(updateUserBranch({ userId, branchId, updateData }));
    },
    [dispatch]
  );

  const setDefault = useCallback(
    (userId, branchId) => {
      return dispatch(setDefaultBranch({ userId, branchId }));
    },
    [dispatch]
  );

  const removeBranch = useCallback(
    (userId, branchId) => {
      return dispatch(removeBranchFromUser({ userId, branchId }));
    },
    [dispatch]
  );

  const getBranchStaff = useCallback(
    (branchId) => {
      return dispatch(getBranchUsers({ branchId }));
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearUserBranchError());
  }, [dispatch]);

  const clearSuccess = useCallback(() => {
    dispatch(clearUserBranchSuccess());
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(resetUserBranchState());
  }, [dispatch]);

  // Helpers
  const canManageSchedule = useCallback(
    (branchId) => {
      return selectCanManageScheduleInBranch({ userBranch: { userBranches } }, branchId);
    },
    [userBranches]
  );

  const canCreateAppointments = useCallback(
    (branchId) => {
      return selectCanCreateAppointmentsInBranch({ userBranch: { userBranches } }, branchId);
    },
    [userBranches]
  );

  const getBranchById = useCallback(
    (branchId) => {
      return userBranches.find(b => b.branchId === branchId);
    },
    [userBranches]
  );

  const isDefaultBranch = useCallback(
    (branchId) => {
      return defaultBranchId === branchId;
    },
    [defaultBranchId]
  );

  return {
    // Estado
    userBranches,
    branchUsers,
    defaultBranch,
    loading,
    error,
    success,
    message,
    branchIds,
    defaultBranchId,
    hasMultipleBranches,
    branchCount,
    branchSpecialists,
    branchReceptionists,

    // Acciones
    getBranches,
    assignBranch,
    updateBranch,
    setDefault,
    removeBranch,
    getBranchStaff,
    clearError,
    clearSuccess,
    resetState,

    // Helpers
    canManageSchedule,
    canCreateAppointments,
    getBranchById,
    isDefaultBranch
  };
};

export default useUserBranch;
