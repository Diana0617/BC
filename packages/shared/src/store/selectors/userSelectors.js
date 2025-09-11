// Selectors for user state
export const selectUserState = (state) => state.user;
export const selectUsers = (state) => state.user.users;
export const selectSelectedUser = (state) => state.user.selectedUser;
export const selectTotalUsers = (state) => state.user.totalUsers;
export const selectCurrentPage = (state) => state.user.currentPage;
export const selectTotalPages = (state) => state.user.totalPages;

// User loading states
export const selectUserLoading = (state) => state.user.isLoading;
export const selectIsFetchingUsers = (state) => state.user.isFetchingUsers;
export const selectIsFetchingUser = (state) => state.user.isFetchingUser;
export const selectIsUpdatingUser = (state) => state.user.isUpdating;
export const selectIsDeletingUser = (state) => state.user.isDeleting;

// User error states
export const selectUserError = (state) => state.user.error;
export const selectFetchUsersError = (state) => state.user.fetchUsersError;
export const selectFetchUserError = (state) => state.user.fetchUserError;
export const selectUpdateUserError = (state) => state.user.updateError;
export const selectDeleteUserError = (state) => state.user.deleteError;

// User success states
export const selectUpdateUserSuccess = (state) => state.user.updateSuccess;
export const selectDeleteUserSuccess = (state) => state.user.deleteSuccess;

// User filters
export const selectUserFilters = (state) => state.user.filters;
export const selectUserSearch = (state) => state.user.filters.search;
export const selectUserRoleFilter = (state) => state.user.filters.role;
export const selectUserStatusFilter = (state) => state.user.filters.status;
export const selectUserSortBy = (state) => state.user.filters.sortBy;
export const selectUserSortOrder = (state) => state.user.filters.sortOrder;

// Computed selectors
export const selectFilteredUsers = (state) => {
  const users = selectUsers(state);
  const filters = selectUserFilters(state);
  
  return users.filter(user => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }
    
    // Role filter
    if (filters.role && user.role !== filters.role) {
      return false;
    }
    
    // Status filter
    if (filters.status && user.status !== filters.status) {
      return false;
    }
    
    return true;
  });
};

export const selectUsersPagination = (state) => ({
  currentPage: selectCurrentPage(state),
  totalPages: selectTotalPages(state),
  totalUsers: selectTotalUsers(state),
  hasNextPage: selectCurrentPage(state) < selectTotalPages(state),
  hasPrevPage: selectCurrentPage(state) > 1
});