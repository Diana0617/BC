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
  const { loading, error } = useSelector(state => state.auth)

  const [credentials, setCredentials] = useState({
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
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await dispatch(loginUser({ 
        credentials, 
        rememberMe: false 
      })).unwrap()
      if (result.token) {
        if (result.user?.role === 'OWNER') {
          navigate('/owner/dashboard')
        } else {
          navigate('/dashboard')
        }
        onClose()
      }
    } catch (error) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-4 sm:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md shadow-2xl border border-white/20 relative flex flex-col justify-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
        <div className="flex flex-col items-center mb-8">
          <div className="bg-cyan-400 rounded-full p-3 sm:p-4 mb-2 flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-10 w-auto sm:h-12" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 bg-red-400 bg-clip-text text-transparent">
            Business Control
          </h1>
          <p className="text-gray-600 text-base sm:text-lg text-center">
            Gestiona tu negocio de manera inteligente
          </p>
        </div>
        <div className="w-full">
          {!showForgot ? (
            <>
              <form onSubmit={handleSubmit} className="mb-6">
                <div className="mb-6">
                  <label htmlFor="email" className="block mb-2 font-medium text-gray-700 text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-white focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block mb-2 font-medium text-gray-700 text-sm">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-white focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 pr-12"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-6 w-6" />
                      ) : (
                        <EyeIcon className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-200">
                    {error}
                  </div>
                )}
                <button 
                  type="submit" 
                  className="w-full bg-red-400 text-white font-semibold py-4 rounded-xl transition-all duration-200 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>
              <div className="text-center">
                <button type="button" onClick={() => setShowForgot(true)} className="text-cyan-500 text-sm font-medium hover:underline bg-transparent border-none">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleForgotPassword} className="mb-6">
                <div className="mb-6">
                  <label htmlFor="forgotEmail" className="block mb-2 font-medium text-gray-700 text-sm">
                    Ingresa tu email
                  </label>
                  <input
                    type="email"
                    id="forgotEmail"
                    name="forgotEmail"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-white focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                {forgotError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-200">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm border border-green-200">
                    {forgotSuccess}
                  </div>
                )}
                <button 
                  type="submit" 
                  className="w-full bg-cyan-400 text-white font-semibold py-4 rounded-xl transition-all duration-200 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Enviando...' : 'Enviar recuperación'}
                </button>
              </form>
              <div className="text-center">
                <button type="button" onClick={() => setShowForgot(false)} className="text-gray-500 text-sm font-medium hover:underline bg-transparent border-none">
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
