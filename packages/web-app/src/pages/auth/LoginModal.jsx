import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../../../../shared/src/store/slices/authSlice.js'

const LoginModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(state => state.auth)

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-10 w-full max-w-md shadow-2xl border border-white/20 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 bg-red-400  bg-clip-text text-transparent">
            Business Control
          </h1>
          <p className="text-gray-600 text-lg">
            Gestiona tu negocio de manera inteligente
          </p>
        </div>
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
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-white focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              placeholder="••••••••"
              required
            />
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
          <a href="#" className="text-cyan-500 text-sm font-medium hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
