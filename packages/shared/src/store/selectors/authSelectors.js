// Selectors for auth state
export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

// Auth specific loading states
export const selectIsRegistering = (state) => state.auth.isRegistering;
export const selectIsLoggingIn = (state) => state.auth.isLoggingIn;
export const selectIsForgettingPassword = (state) => state.auth.isForgettingPassword;
export const selectIsVerifyingToken = (state) => state.auth.isVerifyingToken;
export const selectIsResettingPassword = (state) => state.auth.isResettingPassword;
export const selectIsChangingPassword = (state) => state.auth.isChangingPassword;

// Auth specific error states
export const selectRegisterError = (state) => state.auth.registerError;
export const selectLoginError = (state) => state.auth.loginError;
export const selectForgotPasswordError = (state) => state.auth.forgotPasswordError;
export const selectVerifyTokenError = (state) => state.auth.verifyTokenError;
export const selectResetPasswordError = (state) => state.auth.resetPasswordError;
export const selectChangePasswordError = (state) => state.auth.changePasswordError;

// Auth success states
export const selectRegisterSuccess = (state) => state.auth.registerSuccess;
export const selectForgotPasswordSuccess = (state) => state.auth.forgotPasswordSuccess;
export const selectResetPasswordSuccess = (state) => state.auth.resetPasswordSuccess;
export const selectChangePasswordSuccess = (state) => state.auth.changePasswordSuccess;

// Remember email
export const selectRememberedEmail = (state) => state.auth.rememberedEmail;

// User role and permissions
export const selectUserRole = (state) => state.auth.user?.role;
export const selectIsOwner = (state) => state.auth.user?.role === 'OWNER';
export const selectIsAdmin = (state) => state.auth.user?.role === 'ADMIN';
export const selectIsBusinessOwner = (state) => state.auth.user?.role === 'BUSINESS_OWNER';
export const selectIsEmployee = (state) => state.auth.user?.role === 'EMPLOYEE';
export const selectIsClient = (state) => state.auth.user?.role === 'CLIENT';

// Business-specific selectors for Owner
export const selectCanManageAllBusiness = (state) => ['OWNER', 'ADMIN'].includes(state.auth.user?.role);
export const selectCanCreateCashSubscriptions = (state) => state.auth.user?.role === 'OWNER';