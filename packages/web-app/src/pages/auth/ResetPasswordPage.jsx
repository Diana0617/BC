import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LockIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { verifyResetToken, resetPassword, clearErrors, clearSuccess } from '@shared/store/slices/authSlice';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = searchParams.get('token');

  const { 
    isVerifyingToken, 
    verifyTokenError, 
    isResettingPassword, 
    resetPasswordError, 
    resetPasswordSuccess 
  } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Limpiar errores anteriores
    dispatch(clearErrors());
    dispatch(clearSuccess());

    if (!token) {
      setLocalError('Token de recuperación no válido');
      return;
    }

    // Validar token
    dispatch(verifyResetToken(token))
      .unwrap()
      .then(() => {
        setTokenValid(true);
      })
      .catch(() => {
        setTokenValid(false);
      });
  }, [token, dispatch]);

  useEffect(() => {
    // Si el password fue restablecido exitosamente, redirigir después de 3 segundos
    if (resetPasswordSuccess) {
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [resetPasswordSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setLocalError(null);
    dispatch(clearErrors());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || formData.password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    setLocalError(null);
    dispatch(resetPassword({ token, newPassword: formData.password }));
  };

  const displayError = localError || verifyTokenError || resetPasswordError;

  if (isVerifyingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Validando token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid && verifyTokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <XCircleIcon className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Token Inválido
          </h2>
          <p className="text-center text-gray-600 mb-6">
            {verifyTokenError || 'El enlace de recuperación ha expirado o no es válido'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (resetPasswordSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            ¡Contraseña Actualizada!
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Tu contraseña ha sido restablecida exitosamente. 
            Serás redirigido al inicio de sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <LockIcon className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Restablecer Contraseña
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Ingresa tu nueva contraseña
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {displayError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {displayError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Repite tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={isResettingPassword}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isResettingPassword ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-2 px-4 text-gray-700 hover:text-gray-900 font-medium"
          >
            Volver al inicio
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
