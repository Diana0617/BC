import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Configure environment before importing anything else
import './config/env.js'
import StoreProvider from './store/StoreProvider.jsx'
import './index.css'
import App from './App.jsx'
// Force rebuild by importing build config
import { BUILD_ID } from './buildConfig.js'

console.log('Build ID:', BUILD_ID);

// CRITICAL: BrowserRouter MUST wrap StoreProvider
// If Redux components use useLocation(), Router context must exist first
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>,
)
