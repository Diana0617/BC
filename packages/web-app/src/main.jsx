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

// Router is now inside App.jsx to prevent useLocation() errors
// during module import phase
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
