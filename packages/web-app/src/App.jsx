import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { checkExistingSession, OwnerOnlyRoute } from '../../shared/src/index.js'

// Pages
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'

// Owner Pages
import OwnerLayout from './layouts/OwnerLayout'
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage'
import OwnerPlansPage from './pages/owner/OwnerPlansPage'
import OwnerModulesPage from './pages/owner/OwnerModulesPage'

function AppLayout() {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading, user } = useSelector(state => state.auth)

  useEffect(() => {
    // Check for existing session on app load
    dispatch(checkExistingSession())
  }, [dispatch])

  // Show loading while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage /> : <Navigate to={user?.role === 'OWNER' ? "/owner/dashboard" : "/dashboard"} />} 
          />
          
          {/* Owner routes - Protected */}
          <Route path="/owner" element={
            <OwnerOnlyRoute>
              <OwnerLayout />
            </OwnerOnlyRoute>
          }>
            <Route path="dashboard" element={<OwnerDashboardPage />} />
            <Route path="plans" element={<OwnerPlansPage />} />
            <Route path="modules" element={<OwnerModulesPage />} />
            {/* TODO: Agregar más rutas de Owner */}
            <Route path="businesses" element={<div>Negocios - En desarrollo</div>} />
            <Route path="reports" element={<div>Reportes - En desarrollo</div>} />
            <Route path="payments" element={<div>Pagos - En desarrollo</div>} />
            <Route path="settings" element={<div>Configuración - En desarrollo</div>} />
          </Route>
          
          {/* Regular user routes */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated && user?.role !== 'OWNER' ? <DashboardPage /> : <Navigate to="/login" />} 
          />
          
          {/* Root redirect */}
          <Route 
            path="/" 
            element={<Navigate to={
              isAuthenticated 
                ? (user?.role === 'OWNER' ? "/owner/dashboard" : "/dashboard")
                : "/login"
            } />} 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={<Navigate to={
              isAuthenticated 
                ? (user?.role === 'OWNER' ? "/owner/dashboard" : "/dashboard")
                : "/login"
            } />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

function App() {
  return <AppLayout />
}

export default App
