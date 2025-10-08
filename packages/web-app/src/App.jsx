import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { checkExistingSession, OwnerOnlyRoute, AdminRoute } from '../../shared/src/index.js'

// Branding Context
import { BrandingProvider } from './contexts/BrandingContext'

// Pages
import DashboardPage from './pages/dashboard/DashboardPage'

// Subscription Pages (Public)
import SubscriptionPage from './pages/subscription/SubscriptionPage'
import PaymentSuccess from './pages/PaymentSuccess'

// Owner Pages
import OwnerLayout from './layouts/OwnerLayout'
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage'
import OwnerPlansPage from './pages/owner/plans/OwnerPlansPage'
import OwnerModulesPage from './pages/owner/OwnerModulesPage'
import RuleTemplatesPage from './pages/owner/RuleTemplates/RuleTemplatesPage'
import OwnerSubscriptionsPage from './pages/owner/suscriptions/OwnerSubscriptionsPage.jsx'
import OwnerBusinessesPage from './pages/owner/business/OwnerBusinessesPage.jsx'
import OwnerExpensesPage from './pages/owner/Expenses/OwnerExpensesPage.jsx'
import OwnerReports from './pages/owner/reports/OwnerReports'

// Business Pages
import BusinessProfile from './pages/business/profile/BusinessProfile.jsx'

// Public Pages
import LandingPage from './pages/public/LandingPage'
import OnlineBookingPage from './pages/public/OnlineBookingPage'
import BookingSuccess from './pages/public/BookingSuccess'

// Test Components (temporal)
import ReduxPlansTest from './components/test/ReduxPlansTest'
import TestPayment1000 from './components/payments/TestPayment1000'

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
      <BrandingProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
          {/* Public routes - No authentication required */}
          {!isAuthenticated && <Route path="/" element={<LandingPage />} />}
          <Route path="/book/:businessCode" element={<OnlineBookingPage />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          
          {/* Subscription routes (Public) */}
          <Route path="/subscribe" element={<SubscriptionPage />} />
          <Route path="/subscribe/:planId" element={<SubscriptionPage />} />
          <Route path="/invitation/:token" element={<SubscriptionPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          
          {/* Test routes (Temporal) */}
          <Route path="/test-payment-1000" element={<TestPayment1000 />} />
          
          {/* Owner routes - Protected */}
          <Route path="/owner" element={
            <OwnerOnlyRoute>
              <OwnerLayout />
            </OwnerOnlyRoute>
          }>
            <Route path="dashboard" element={<OwnerDashboardPage />} />
            <Route path="plans" element={<OwnerPlansPage />} />
            <Route path="modules" element={<OwnerModulesPage />} />
            <Route path="rule-templates" element={<RuleTemplatesPage />} />
            <Route path="subscriptions" element={<OwnerSubscriptionsPage />} />
            <Route path="businesses" element={<OwnerBusinessesPage />} />
            <Route path="expenses" element={<OwnerExpensesPage />} />
            <Route path="test-redux" element={<ReduxPlansTest />} />
            <Route path="reports" element={<OwnerReports />} />
            <Route path="payments" element={<div>Pagos - En desarrollo</div>} />
            <Route path="settings" element={<div>Configuración - En desarrollo</div>} />
          </Route>
          
          {/* Business routes - Protected */}
          {isAuthenticated && user?.role === 'BUSINESS' && (
            <Route path="/business/profile" element={<BusinessProfile />} />
          )}
          
          {/* Redirect non-business users trying to access business routes */}
          {isAuthenticated && user?.role !== 'BUSINESS' && (
            <Route path="/business/*" element={<Navigate to="/dashboard" replace />} />
          )}
          
          {/* Regular user routes */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated && user?.role !== 'OWNER' && user?.role !== 'BUSINESS' 
                ? <DashboardPage /> 
                : <Navigate to={
                    isAuthenticated 
                      ? (user?.role === 'OWNER' ? "/owner/dashboard" : 
                         user?.role === 'BUSINESS' ? "/business/profile" : 
                         "/")
                      : "/"
                  } replace />
            } 
          />
          
          {/* Root redirect - only when authenticated */}
          {isAuthenticated && (
            <Route 
              path="/" 
              element={<Navigate to={
                user?.role === 'OWNER' ? "/owner/dashboard" : 
                user?.role === 'BUSINESS' ? "/business/profile" : 
                "/dashboard"
              } replace />} 
            />
          )}
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={<Navigate to={
              isAuthenticated 
                ? (user?.role === 'OWNER' ? "/owner/dashboard" : 
                   user?.role === 'BUSINESS' ? "/business/profile" : 
                   "/dashboard")
                : "/"
            } replace />} 
          />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
      </BrandingProvider>
    </Router>
  )
}

function App() {
  return <AppLayout />
}

export default App