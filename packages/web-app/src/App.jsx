import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { checkExistingSession, getUserProfile, setCurrentBusiness, fetchCurrentBusiness } from '../../shared/src/index.js'
import { API_CONFIG } from './constants/api'

// 🔴 DEBUG: Verificar que se carga el nuevo código
console.log('🚀 App.jsx CARGADO - Versión con intercambio de código de sesión - ' + new Date().toISOString());
console.log('🌐 API Base URL detectada:', API_CONFIG.BASE_URL);
if (typeof window !== 'undefined' && window.__BC_DEBUG_LOG) {
  window.__BC_DEBUG_LOG('🚀 App.jsx CARGADO - Versión con intercambio de código de sesión');
  window.__BC_DEBUG_LOG(`🌐 API Base URL detectada: ${API_CONFIG.BASE_URL}`);
}

// Use local route protection components that don't rely on useLocation()
// This avoids the "useLocation() outside Router" error
import { OwnerOnlyRoute, AdminRoute } from './components/LocalRouteProtection.jsx'

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
import ConsentTemplatesPage from './pages/ConsentTemplatesPage.jsx'
import InventoryDashboard from './pages/business/inventory/InventoryDashboard.jsx'

// Public Pages
import LandingPage from './pages/public/LandingPage'
import OnlineBookingPage from './pages/public/OnlineBookingPage'
import BookingSuccess from './pages/public/BookingSuccess'
import TermsOfService from './pages/public/TermsOfService'
import PrivacyPolicy from './pages/public/PrivacyPolicy'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Test Components (temporal)
import ReduxPlansTest from './components/test/ReduxPlansTest'
import TestPayment1000 from './components/payments/TestPayment1000'

function AppLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, user } = useSelector(state => state.auth)
  const [mobileLoginStatus, setMobileLoginStatus] = React.useState(null)
  const [isAuthenticating, setIsAuthenticating] = React.useState(false)
  const logDebug = React.useCallback((...args) => {
    console.log(...args)
    if (typeof window !== 'undefined' && window.__BC_DEBUG_LOG) {
      const serialized = args.map((arg) => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg)
          // eslint-disable-next-line no-unused-vars
          } catch (_error) {
            return '[object]'
          }
        }
        return String(arg)
      }).join(' ')
      window.__BC_DEBUG_LOG(serialized)
    }
  }, [])
  const persistAuthToken = React.useCallback((tokenValue) => {
    if (!tokenValue) return false

    const saveValue = (key, value) => {
      try {
        localStorage.setItem(key, value)
        return true
      } catch (error) {
        logDebug('⚠️ Fallback a sessionStorage para', key, error)
        try {
          sessionStorage.setItem(key, value)
          return true
        } catch (sessionError) {
          logDebug('❌ No se pudo persistir', key, sessionError)
          return false
        }
      }
    }

    const stored = saveValue('bc_auth_token', tokenValue)
    saveValue('bc_mobile_login', 'true')

    if (typeof window !== 'undefined') {
      window.__BC_AUTH_TOKEN__ = tokenValue
    }

    return stored
  }, [logDebug])

  const fallbackJWTDecode = React.useCallback((token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const payload = JSON.parse(jsonPayload);
      const userData = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        businessId: payload.businessId
      };

      localStorage.setItem('bc_user_data', JSON.stringify(userData));
      window.location.href = window.location.origin;
    } catch (error) {
      logDebug('❌ Error decodificando JWT:', error);
    }
  }, [logDebug])
  
  // Detectar token o código INMEDIATAMENTE antes de cualquier render
  const urlParams = new URLSearchParams(window.location.search);
  const hasTokenInURL = (urlParams.get('token') || urlParams.get('code')) && urlParams.get('mobile');

  // Log para debugging
  React.useEffect(() => {
    logDebug('🔍 App State:', { 
      isAuthenticated, 
      isLoading, 
      userRole: user?.role,
      userName: user?.firstName,
      businessName: user?.business?.name 
    });
  }, [isAuthenticated, isLoading, user, logDebug]);

  useEffect(() => {
    logDebug('⚙️ useEffect ejecutado - buscando token o código en URL...');
    
    // Auto-login desde mobile app si viene token o código en URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const code = urlParams.get('code'); // Nuevo: código de sesión corto
    const isMobile = urlParams.get('mobile');
    
    logDebug('🔍 Parámetros URL:', {
      hasToken: !!token,
      hasCode: !!code,
      tokenLength: token?.length,
      code: code,
      isMobile,
      isAuthenticating,
      currentURL: window.location.href
    });
    
    // NUEVO: Si viene código de sesión, intercambiarlo por el token
    if (code && isMobile && !isAuthenticating) {
      logDebug('🔐 Código de sesión detectado:', code);
      setIsAuthenticating(true);
      setMobileLoginStatus('🔐 Validando código de sesión...');
      
      // Intercambiar código por token
      logDebug('🌍 Solicitando intercambio de código por token en', `${API_CONFIG.BASE_URL}/api/mobile/exchange-session`)
      fetch(`${API_CONFIG.BASE_URL}/api/mobile/exchange-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Código inválido o expirado`);
          }
          return response.json();
        })
        .then(data => {
          if (!data.success || !data.data?.token) {
            throw new Error('No se recibió token válido');
          }
          
          const exchangedToken = data.data.token;
          logDebug('✅ Token obtenido del código');
          
          // Guardar token en localStorage
          persistAuthToken(exchangedToken);
          logDebug('💾 Token guardado tras intercambio');
          
          setMobileLoginStatus('📡 Obteniendo perfil del backend...');
          
          // Continuar con el flujo normal de autenticación
          return dispatch(getUserProfile()).unwrap();
        })
        .then((data) => {
          logDebug('✅ Perfil obtenido:', data);
          const userData = data?.data?.user || data;
          logDebug('✅ Usuario:', userData?.firstName, userData?.role, userData?.business?.name);
          
          // Si el usuario tiene un negocio, actualizarlo en el slice de business INMEDIATAMENTE
          if (userData?.business) {
            logDebug('💼 Actualizando business en Redux (temporal):', userData.business);
            dispatch(setCurrentBusiness(userData.business));
            
            // Luego obtener los datos completos del negocio (incluyendo subscriptions)
            logDebug('🔄 Obteniendo datos completos del negocio...');
            dispatch(fetchCurrentBusiness());
          }
          
          setMobileLoginStatus('✅ Sesión iniciada correctamente');
          
          // Limpiar URL
          window.history.replaceState({}, document.title, window.location.origin);
          
          // Determinar ruta de redirección
          let redirectPath = '/business/profile';
          if (userData?.role === 'OWNER') {
            redirectPath = '/owner/dashboard';
          } else if (userData?.role === 'BUSINESS') {
            redirectPath = '/business/profile';
          } else {
            redirectPath = '/dashboard';
          }
          
          logDebug('🔄 Navegando a:', redirectPath);
          
          // Navegar SIN recargar usando React Router
          setTimeout(() => {
            setMobileLoginStatus(null);
            setIsAuthenticating(false);
            navigate(redirectPath, { replace: true });
          }, 500);
        })
        .catch((error) => {
          logDebug('❌ Error en auto-login con código:', error);
          setMobileLoginStatus(`❌ Error: ${error.message || 'Error al validar sesión'}`);
          setTimeout(() => {
            setMobileLoginStatus(null);
            setIsAuthenticating(false);
          }, 3000);
        });
      
      return;
    }
    
    // LEGACY: Si viene token directamente (viejo método)
    if (token && isMobile && !isAuthenticating) {
      logDebug('🔑 Token detectado en URL:', token.substring(0, 20) + '...');
      setIsAuthenticating(true);
      setMobileLoginStatus('🔑 Detectando token...');
      
      // Guardar token en localStorage
      persistAuthToken(token);
      logDebug('💾 Token guardado (token directo)');
      
      setMobileLoginStatus('📡 Obteniendo perfil del backend...');
      
      // Usar Redux para obtener el perfil
      dispatch(getUserProfile())
        .unwrap()
        .then((data) => {
          logDebug('✅ Perfil obtenido:', data);
          const userData = data?.data?.user || data;
          logDebug('✅ Usuario:', userData?.firstName, userData?.role, userData?.business?.name);
          
          // Si el usuario tiene un negocio, actualizarlo en el slice de business INMEDIATAMENTE
          if (userData?.business) {
            logDebug('💼 Actualizando business en Redux (temporal):', userData.business);
            dispatch(setCurrentBusiness(userData.business));
            
            // Luego obtener los datos completos del negocio (incluyendo subscriptions)
            logDebug('🔄 Obteniendo datos completos del negocio...');
            dispatch(fetchCurrentBusiness());
          }
          
          setMobileLoginStatus('✅ Sesión iniciada correctamente');
          
          // Limpiar URL
          window.history.replaceState({}, document.title, window.location.origin);
          
          // Determinar ruta de redirección
          let redirectPath = '/business/profile';
          if (userData?.role === 'OWNER') {
            redirectPath = '/owner/dashboard';
          } else if (userData?.role === 'BUSINESS') {
            redirectPath = '/business/profile';
          } else {
            redirectPath = '/dashboard';
          }
          
          logDebug('🔄 Navegando a:', redirectPath);
          
          // Navegar SIN recargar usando React Router
          setTimeout(() => {
            setMobileLoginStatus(null);
            setIsAuthenticating(false);
            navigate(redirectPath, { replace: true });
          }, 500);
        })
        .catch((error) => {
          logDebug('❌ Error obteniendo perfil:', error);
          setMobileLoginStatus(`❌ Error: ${error || 'Network request failed'}`);
          setIsAuthenticating(false);
          
          // Intentar con datos mínimos del JWT como fallback
          setTimeout(() => fallbackJWTDecode(token), 2000);
        });
      
      return;
    }
    
    // Check for existing session on app load (solo si NO hay token en URL)
    if (!token && !isMobile) {
      dispatch(checkExistingSession());
    }
  }, [dispatch, navigate, isAuthenticating, persistAuthToken, logDebug, fallbackJWTDecode])

  // Show loading while checking session OR while authenticating from mobile OR if there's a token in URL
  if (isLoading || isAuthenticating || hasTokenInURL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {hasTokenInURL ? 'Procesando autenticación desde móvil...' : 
             isAuthenticating ? 'Autenticando desde móvil...' : 
             'Cargando...'}
          </p>
        </div>
      </div>
    )
  }
  
  // Show mobile login status
  if (mobileLoginStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="animate-pulse mb-6">
              <div className="text-6xl mb-4">{mobileLoginStatus.includes('❌') ? '❌' : '🔄'}</div>
            </div>
            <p className="text-xl font-semibold text-gray-800 mb-2">
              Autenticación desde App Móvil
            </p>
            <p className="text-lg text-gray-600 mb-6">
              {mobileLoginStatus}
            </p>
          </div>
          
          {/* Debug Info */}
          <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2 text-sm">
            <h3 className="font-bold text-gray-700 mb-2">📊 Estado de Autenticación:</h3>
            <p className="font-mono text-xs">
              <span className="font-bold">isAuthenticated:</span> {isAuthenticated ? '✅ true' : '❌ false'}
            </p>
            <p className="font-mono text-xs">
              <span className="font-bold">user.role:</span> {user?.role || '❌ sin role'}
            </p>
            <p className="font-mono text-xs">
              <span className="font-bold">user.firstName:</span> {user?.firstName || '❌ sin nombre'}
            </p>
            <p className="font-mono text-xs">
              <span className="font-bold">business.name:</span> {user?.business?.name || '❌ sin negocio'}
            </p>
            <p className="font-mono text-xs">
              <span className="font-bold">token en localStorage:</span> {localStorage.getItem('bc_auth_token') ? '✅ existe' : '❌ no existe'}
            </p>
            <p className="font-mono text-xs">
              <span className="font-bold">user_data en localStorage:</span> {localStorage.getItem('bc_user_data') ? '✅ existe' : '❌ no existe'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <BrandingProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes - No authentication required */}
          {!isAuthenticated && <Route path="/" element={<LandingPage />} />}
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/book/:businessCode" element={<OnlineBookingPage />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/terminos" element={<TermsOfService />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          
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
          
          {/* Business routes - Always register routes, protect inside components */}
          <Route 
            path="/business/profile" 
            element={
              isAuthenticated && user?.role === 'BUSINESS' 
                ? <BusinessProfile /> 
                : <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/business/consent-templates" 
            element={
              isAuthenticated && user?.role === 'BUSINESS' 
                ? <ConsentTemplatesPage /> 
                : <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/business/inventory" 
            element={
              isAuthenticated && user?.role === 'BUSINESS' 
                ? <InventoryDashboard /> 
                : <Navigate to="/" replace />
            } 
          />
          
          {/* Redirect non-business users trying to access business routes */}
          <Route 
            path="/business/*" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} 
          />
          
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
  )
}

// Router is now in main.jsx wrapping StoreProvider
// This ensures Router context is available for Redux and all components
function App() {
  return <AppLayout />
}

export default App