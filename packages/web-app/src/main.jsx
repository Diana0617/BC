import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Configure environment before importing anything else
import './config/env.js'
import StoreProvider from './store/StoreProvider.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
)
