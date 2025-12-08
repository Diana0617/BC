/**
 * Selectores para User Branch (multi-sucursal)
 */

// Selectores básicos
export const selectUserBranchState = (state) => state.userBranch;

export const selectUserBranches = (state) => state.userBranch.userBranches;

export const selectBranchUsers = (state) => state.userBranch.branchUsers;

export const selectDefaultBranch = (state) => state.userBranch.defaultBranch;

export const selectUserBranchLoading = (state) => state.userBranch.loading;

export const selectUserBranchError = (state) => state.userBranch.error;

export const selectUserBranchSuccess = (state) => state.userBranch.success;

export const selectUserBranchMessage = (state) => state.userBranch.message;

// Selectores avanzados
export const selectUserBranchIds = (state) => 
  state.userBranch.userBranches.map(b => b.branchId);

export const selectDefaultBranchId = (state) => 
  state.userBranch.defaultBranch?.branchId || null;

export const selectUserHasMultipleBranches = (state) => 
  state.userBranch.userBranches.length > 1;

export const selectUserBranchCount = (state) => 
  state.userBranch.userBranches.length;

export const selectUserBranchById = (state, branchId) => 
  state.userBranch.userBranches.find(b => b.branchId === branchId);

export const selectCanManageScheduleInBranch = (state, branchId) => {
  const branch = state.userBranch.userBranches.find(b => b.branchId === branchId);
  return branch?.canManageSchedule || false;
};

export const selectCanCreateAppointmentsInBranch = (state, branchId) => {
  const branch = state.userBranch.userBranches.find(b => b.branchId === branchId);
  return branch?.canCreateAppointments || false;
};

export const selectBranchesWithPermission = (state, permission) => {
  const permissionMap = {
    manageSchedule: 'canManageSchedule',
    createAppointments: 'canCreateAppointments'
  };
  const field = permissionMap[permission];
  if (!field) return [];
  return state.userBranch.userBranches.filter(b => b[field]);
};

export const selectBranchUsersByRole = (state, role) => 
  state.userBranch.branchUsers.filter(u => u.role === role);

export const selectBranchSpecialists = (state) => 
  state.userBranch.branchUsers.filter(u => 
    u.role === 'SPECIALIST' || u.role === 'RECEPTIONIST_SPECIALIST'
  );

export const selectBranchReceptionists = (state) => 
  state.userBranch.branchUsers.filter(u => 
    u.role === 'RECEPTIONIST' || u.role === 'RECEPTIONIST_SPECIALIST'
  );

export const selectIsUserInBranch = (state, userId, branchId) => {
  return state.userBranch.branchUsers.some(
    u => u.userId === userId && u.branchId === branchId
  );
};
