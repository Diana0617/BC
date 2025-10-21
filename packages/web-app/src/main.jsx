import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Configure environment before importing anything else
import './config/env.js'
import StoreProvider from './store/StoreProvider.jsx'
import './index.css'
import App from './App.jsx'

// BrowserRouter MUST be at root level to provide context for all components
// including OwnerOnlyRoute/RoleBasedRoute that use useLocation()
// Force rebuild: 2025-10-21-13:00 - Fix trust proxy + CSP
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
