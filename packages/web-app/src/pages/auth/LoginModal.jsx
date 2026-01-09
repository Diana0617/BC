/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import logo from '../../../public/logo.png'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser, forgotPassword } from '@shared/store/slices/authSlice.js'

const LoginModal = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoggingIn, loginError } = useSelector(state => state.auth)

  const [credentials, setCredentials] = useState({
    subdomain: '',
    email: '',
    password: ''
  })
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: name === 'subdomain' ? value.toLowerCase().trim() : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Preparar credenciales - solo enviar subdomain si tiene valor
    const loginCredentials = {
      email: credentials.email,
      password: credentials.password
    }
    
    // Solo agregar subdomain si fue proporcionado
    if (credentials.subdomain && credentials.subdomain.trim()) {
      loginCredentials.subdomain = credentials.subdomain
    }
    
    try {
      const result = await dispatch(loginUser({ 
        credentials: loginCredentials, 
        rememberMe: false 
      })).unwrap()
      if (result.token) {
        if (result.user?.role === 'OWNER') {
          navigate('/owner/dashboard')
        } else if (result.user?.role === 'BUSINESS_OWNER' || result.user?.role === 'BUSINESS' || result.user?.role === 'BUSINESS_SPECIALIST') {
          navigate('/business/profile')
        } else {
          navigate('/dashboard')
        }
        onClose()
      }
    } catch (error) {
      // El error ya está siendo manejado por el slice de Redux
      // y se mostrará en el estado 'error' del componente
      console.error('Login failed:', error)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotSuccess('');
    setForgotError('');
    try {
      const result = await dispatch(forgotPassword(forgotEmail)).unwrap();
      setForgotSuccess('Revisa tu correo para instrucciones de recuperación.');
    } catch (err) {
      setForgotError('No se pudo enviar el correo. Verifica el email.');
    }
    setForgotLoading(false);
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold leading-none">
          ×
        </button>
        <div className="flex flex-col items-center mb-4">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-3 mb-2 flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-0.5">
            Control de Negocios
          </h1>
          <p className="text-gray-600 text-sm text-center">
            Gestiona tu negocio de manera inteligente
          </p>
        </div>
        <div className="w-full">
          {!showForgot ? (
            <>
              <form onSubmit={handleSubmit} className="mb-4">
                {/* Subdomain Input - OPCIONAL */}
                <div className="mb-3">
                  <label htmlFor="subdomain" className="block mb-1.5 font-medium text-gray-700 text-sm">
                    Código de tu negocio <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    value={credentials.subdomain}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all bg-slate-50 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    placeholder="bella-vista"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Solo para negocios. Déjalo vacío si eres administrador de la plataforma.
                  </p>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="block mb-1.5 font-medium text-gray-700 text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all bg-slate-50 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="block mb-1.5 font-medium text-gray-700 text-sm">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all bg-slate-50 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 p-1.5"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {loginError && (
                  <div className="bg-red-50 text-red-600 p-2.5 rounded-lg mb-3 text-xs border border-red-200">
                    {loginError}
                  </div>
                )}
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2.5 rounded-lg transition-all text-sm shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>
              <div className="text-center">
                <button type="button" onClick={() => setShowForgot(true)} className="text-pink-500 text-xs font-medium hover:text-pink-600 bg-transparent border-none">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleForgotPassword} className="mb-4">
                <div className="mb-3">
                  <label htmlFor="forgotEmail" className="block mb-1.5 font-medium text-gray-700 text-sm">
                    Ingresa tu email
                  </label>
                  <input
                    type="email"
                    id="forgotEmail"
                    name="forgotEmail"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all bg-slate-50 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                {forgotError && (
                  <div className="bg-red-50 text-red-600 p-2.5 rounded-lg mb-3 text-xs border border-red-200">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="bg-green-50 text-green-700 p-2.5 rounded-lg mb-3 text-xs border border-green-200">
                    {forgotSuccess}
                  </div>
                )}
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2.5 rounded-lg transition-all text-sm shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Enviando...' : 'Enviar recuperación'}
                </button>
              </form>
              <div className="text-center">
                <button type="button" onClick={() => setShowForgot(false)} className="text-gray-500 text-xs font-medium hover:text-gray-700 bg-transparent border-none">
                  Volver al login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginModal
