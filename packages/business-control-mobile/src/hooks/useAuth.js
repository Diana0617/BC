import { useSelector } from 'react-redux';

/**
 * Hook personalizado para obtener el token de autenticación desde Redux
 * Reemplaza localStorage.getItem('authToken') para React Native
 */
export const useAuthToken = () => {
  const token = useSelector(state => state.auth.token);
  return token;
};

/**
 * Hook personalizado para obtener toda la información de autenticación
 */
export const useAuth = () => {
  const auth = useSelector(state => state.auth);
  return {
    token: auth.token,
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading
  };
};