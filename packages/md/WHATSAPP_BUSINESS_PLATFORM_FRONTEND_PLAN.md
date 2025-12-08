# 📱 WhatsApp Business Platform - Plan de Implementación Frontend

## 🎯 Objetivo

Permitir que los usuarios **BUSINESS** gestionen su integración de WhatsApp Business Platform directamente desde su dashboard, incluyendo:

1. **Conexión con Embedded Signup** (flujo guiado de Meta)
2. **Gestión de tokens encriptados** (rotar, ver estado, eliminar)
3. **Gestión de templates** de mensajes (crear, editar, enviar a Meta para aprobación, ver estado)
4. **Historial de mensajes** enviados
5. **Log de webhooks** recibidos

**Visibilidad:** Solo si el plan del negocio incluye el módulo de WhatsApp.

---

## 📋 Fases de Implementación

### ✅ FASE 1: Backend API Endpoints (COMPLETADO 70%)

**Estado:** Parcialmente completado. Faltan endpoints de admin.

#### Endpoints Existentes
- ✅ `POST /api/webhooks/whatsapp` - Webhook público de Meta
- ✅ `GET /api/webhooks/whatsapp` - Verificación de webhook
- ✅ `GET/PUT /api/business/:id/config/communications` - Configuración legacy

#### Endpoints Nuevos a Crear

```javascript
// packages/backend/src/routes/whatsappAdminRoutes.js

// === GESTIÓN DE TOKENS ===
POST   /api/admin/whatsapp/businesses/:businessId/tokens
  // Almacenar token manualmente (migración o recuperación)
  Body: { accessToken, phoneNumberId, wabaId, phoneNumber }

GET    /api/admin/whatsapp/businesses/:businessId/tokens
  // Obtener info del token actual (sin mostrar el token real)
  Response: { hasToken, expiresAt, isActive, phoneNumber, etc. }

POST   /api/admin/whatsapp/businesses/:businessId/tokens/rotate
  // Rotar token (invalidar anterior, guardar nuevo)
  Body: { newAccessToken }

DELETE /api/admin/whatsapp/businesses/:businessId/tokens
  // Eliminar token (desconectar WhatsApp)

POST   /api/admin/whatsapp/businesses/:businessId/test-connection
  // Probar conexión con Meta API
  Response: { success, phoneNumberId, businessName, errorDetails }

// === EMBEDDED SIGNUP ===
GET    /api/admin/whatsapp/embedded-signup/config
  // Obtener App ID y config para Embedded Signup
  Response: { appId, redirectUri, state }

POST   /api/admin/whatsapp/embedded-signup/callback
  // Callback después de Embedded Signup
  Body: { code, state, businessId }
  // Intercambia code por access_token y lo almacena encriptado

// === GESTIÓN DE TEMPLATES ===
GET    /api/admin/whatsapp/businesses/:businessId/templates
  // Listar templates del negocio (desde DB + Meta)

POST   /api/admin/whatsapp/businesses/:businessId/templates
  // Crear template localmente y enviarlo a Meta para aprobación
  Body: { name, language, category, components }

PUT    /api/admin/whatsapp/businesses/:businessId/templates/:templateId
  // Actualizar template (solo si status = DRAFT)

DELETE /api/admin/whatsapp/businesses/:businessId/templates/:templateId
  // Eliminar template (local + Meta)

POST   /api/admin/whatsapp/businesses/:businessId/templates/:templateId/submit
  // Re-enviar template a Meta para aprobación

GET    /api/admin/whatsapp/businesses/:businessId/templates/sync
  // Sincronizar templates desde Meta

// === HISTORIAL DE MENSAJES ===
GET    /api/admin/whatsapp/businesses/:businessId/messages
  // Listar mensajes enviados
  Query: { page, limit, status, startDate, endDate, clientId }

GET    /api/admin/whatsapp/businesses/:businessId/messages/:messageId
  // Detalle de un mensaje específico

// === WEBHOOKS (ADMIN) ===
GET    /api/admin/whatsapp/businesses/:businessId/webhook-events
  // Listar eventos de webhook recibidos
  Query: { page, limit, eventType, startDate, endDate }

GET    /api/admin/whatsapp/businesses/:businessId/webhook-events/:eventId
  // Detalle de un evento de webhook

POST   /api/admin/whatsapp/businesses/:businessId/webhook-events/:eventId/replay
  // Re-procesar un evento de webhook (troubleshooting)
```

**Archivos a Crear:**
- `packages/backend/src/routes/whatsappAdminRoutes.js`
- `packages/backend/src/controllers/WhatsAppAdminController.js`

**Archivos a Modificar:**
- `packages/backend/src/app.js` (registrar rutas)
- `packages/backend/src/services/WhatsAppService.js` (agregar métodos de admin)

---

### 🔄 FASE 2: Redux Store (Shared)

Crear slices de Redux para gestionar el estado de WhatsApp en el frontend.

#### 2.1 API Client

**Archivo:** `packages/shared/src/api/whatsappApi.js`

```javascript
import { apiClient } from './client'

/**
 * API Client para WhatsApp Business Platform
 */

// === TOKENS ===
export const storeToken = (businessId, data) => 
  apiClient.post(`/api/admin/whatsapp/businesses/${businessId}/tokens`, data)

export const getTokenInfo = (businessId) => 
  apiClient.get(`/api/admin/whatsapp/businesses/${businessId}/tokens`)

export const rotateToken = (businessId, newAccessToken) => 
  apiClient.post(`/api/admin/whatsapp/businesses/${businessId}/tokens/rotate`, { newAccessToken })

export const deleteToken = (businessId) => 
  apiClient.delete(`/api/admin/whatsapp/businesses/${businessId}/tokens`)

export const testConnection = (businessId) => 
  apiClient.post(`/api/admin/whatsapp/businesses/${businessId}/test-connection`)

// === EMBEDDED SIGNUP ===
export const getEmbeddedSignupConfig = () => 
  apiClient.get('/api/admin/whatsapp/embedded-signup/config')

export const handleEmbeddedSignupCallback = (data) => 
  apiClient.post('/api/admin/whatsapp/embedded-signup/callback', data)

// === TEMPLATES ===
export const getTemplates = (businessId, params = {}) => 
  apiClient.get(`/api/admin/whatsapp/businesses/${businessId}/templates`, { params })

export const createTemplate = (businessId, data) => 
  apiClient.post(`/api/admin/whatsapp/businesses/${businessId}/templates`, data)

export const updateTemplate = (businessId, templateId, data) => 
  apiClient.put(`/api/admin/whatsapp/businesses/${businessId}/templates/${templateId}`, data)

export const deleteTemplate = (businessId, templateId) => 
  apiClient.delete(`/api/admin/whatsapp/businesses/${businessId}/templates/${templateId}`)

export const submitTemplate = (businessId, templateId) => 
  apiClient.post(`/api/admin/whatsapp/businesses/${businessId}/templates/${templateId}/submit`)

export const syncTemplates = (businessId) => 
  apiClient.get(`/api/admin/whatsapp/businesses/${businessId}/templates/sync`)

// === MESSAGES ===
export const getMessages = (businessId, params = {}) => 
  apiClient.get(`/api/admin/whatsapp/businesses/${businessId}/messages`, { params })

export const getMessageById = (businessId, messageId) => 
  apiClient.get(`/api/admin/whatsapp/businesses/${businessId}/messages/${messageId}`)

// === WEBHOOK EVENTS ===
export const getWebhookEvents = (businessId, params = {}) => 
  apiClient.get(`/api/admin/whatsapp/businesses/${businessId}/webhook-events`, { params })

export const getWebhookEventById = (businessId, eventId) => 
  apiClient.get(`/api/admin/whatsapp/businesses/${businessId}/webhook-events/${eventId}`)

export const replayWebhookEvent = (businessId, eventId) => 
  apiClient.post(`/api/admin/whatsapp/businesses/${businessId}/webhook-events/${eventId}/replay`)
```

---

#### 2.2 Redux Slices

**Archivos a Crear:**

1. **`packages/shared/src/store/slices/whatsappTokenSlice.js`**

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as whatsappApi from '../../api/whatsappApi'

// Async Thunks
export const fetchTokenInfo = createAsyncThunk(
  'whatsappToken/fetchInfo',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await whatsappApi.getTokenInfo(businessId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const saveToken = createAsyncThunk(
  'whatsappToken/save',
  async ({ businessId, data }, { rejectWithValue }) => {
    try {
      const response = await whatsappApi.storeToken(businessId, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const rotateToken = createAsyncThunk(
  'whatsappToken/rotate',
  async ({ businessId, newAccessToken }, { rejectWithValue }) => {
    try {
      const response = await whatsappApi.rotateToken(businessId, newAccessToken)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const removeToken = createAsyncThunk(
  'whatsappToken/remove',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await whatsappApi.deleteToken(businessId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const testConnection = createAsyncThunk(
  'whatsappToken/testConnection',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await whatsappApi.testConnection(businessId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Initial State
const initialState = {
  tokenInfo: null,
  connectionStatus: null,
  loading: false,
  saving: false,
  testing: false,
  error: null
}

// Slice
const whatsappTokenSlice = createSlice({
  name: 'whatsappToken',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearConnectionStatus: (state) => {
      state.connectionStatus = null
    }
  },
  extraReducers: (builder) => {
    // Fetch Token Info
    builder
      .addCase(fetchTokenInfo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTokenInfo.fulfilled, (state, action) => {
        state.loading = false
        state.tokenInfo = action.payload.data
      })
      .addCase(fetchTokenInfo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Save Token
    builder
      .addCase(saveToken.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(saveToken.fulfilled, (state, action) => {
        state.saving = false
        state.tokenInfo = action.payload.data
      })
      .addCase(saveToken.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })
    
    // Rotate Token
    builder
      .addCase(rotateToken.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(rotateToken.fulfilled, (state, action) => {
        state.saving = false
        state.tokenInfo = action.payload.data
      })
      .addCase(rotateToken.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })
    
    // Remove Token
    builder
      .addCase(removeToken.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(removeToken.fulfilled, (state) => {
        state.saving = false
        state.tokenInfo = null
      })
      .addCase(removeToken.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })
    
    // Test Connection
    builder
      .addCase(testConnection.pending, (state) => {
        state.testing = true
        state.error = null
        state.connectionStatus = null
      })
      .addCase(testConnection.fulfilled, (state, action) => {
        state.testing = false
        state.connectionStatus = action.payload
      })
      .addCase(testConnection.rejected, (state, action) => {
        state.testing = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearConnectionStatus } = whatsappTokenSlice.actions
export default whatsappTokenSlice.reducer
```

---

2. **`packages/shared/src/store/slices/whatsappTemplatesSlice.js`**

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as whatsappApi from '../../api/whatsappApi'

// Async Thunks
export const fetchTemplates = createAsyncThunk(
  'whatsappTemplates/fetchAll',
  async ({ businessId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await whatsappApi.getTemplates(businessId, params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const createTemplate = createAsyncThunk(
  'whatsappTemplates/create',
  async ({ businessId, data }, { rejectWithValue }) => {
    try {
      const response = await whatsappApi.createTemplate(businessId, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateTemplate = createAsyncThunk(
  'whatsappTemplates/update',
  async ({ businessId, templateId, data }, { rejectWithValue }) => {
    try {
      const response = await whatsappApi.updateTemplate(businessId, templateId, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const removeTemplate = createAsyncThunk(
  'whatsappTemplates/remove',
  async ({ businessId, templateId }, { rejectWithValue }) => {
    try {
      const response = await whatsappApi.deleteTemplate(businessId, templateId)
      return { templateId, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const submitTemplateForApproval = createAsyncThunk(
  'whatsappTemplates/submit',
  async ({ businessId, templateId }, { rejectWithValue }) => {
    try {
      const response = await whatsappApi.submitTemplate(businessId, templateId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const syncTemplatesFromMeta = createAsyncThunk(
  'whatsappTemplates/sync',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await whatsappApi.syncTemplates(businessId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Initial State
const initialState = {
  templates: [],
  selectedTemplate: null,
  loading: false,
  saving: false,
  syncing: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  }
}

// Slice
const whatsappTemplatesSlice = createSlice({
  name: 'whatsappTemplates',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload
    },
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null
    }
  },
  extraReducers: (builder) => {
    // Fetch Templates
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false
        state.templates = action.payload.data.templates
        state.pagination = action.payload.data.pagination || state.pagination
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
    
    // Create Template
    builder
      .addCase(createTemplate.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.saving = false
        state.templates.unshift(action.payload.data)
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })
    
    // Update Template
    builder
      .addCase(updateTemplate.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.saving = false
        const index = state.templates.findIndex(t => t.id === action.payload.data.id)
        if (index !== -1) {
          state.templates[index] = action.payload.data
        }
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })
    
    // Remove Template
    builder
      .addCase(removeTemplate.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(removeTemplate.fulfilled, (state, action) => {
        state.saving = false
        state.templates = state.templates.filter(t => t.id !== action.payload.templateId)
      })
      .addCase(removeTemplate.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })
    
    // Submit Template
    builder
      .addCase(submitTemplateForApproval.pending, (state) => {
        state.saving = true
        state.error = null
      })
      .addCase(submitTemplateForApproval.fulfilled, (state, action) => {
        state.saving = false
        const index = state.templates.findIndex(t => t.id === action.payload.data.id)
        if (index !== -1) {
          state.templates[index] = action.payload.data
        }
      })
      .addCase(submitTemplateForApproval.rejected, (state, action) => {
        state.saving = false
        state.error = action.payload
      })
    
    // Sync Templates
    builder
      .addCase(syncTemplatesFromMeta.pending, (state) => {
        state.syncing = true
        state.error = null
      })
      .addCase(syncTemplatesFromMeta.fulfilled, (state, action) => {
        state.syncing = false
        state.templates = action.payload.data.templates
      })
      .addCase(syncTemplatesFromMeta.rejected, (state, action) => {
        state.syncing = false
        state.error = action.payload
      })
  }
})

export const { clearError, setSelectedTemplate, clearSelectedTemplate } = whatsappTemplatesSlice.actions
export default whatsappTemplatesSlice.reducer
```

---

3. **`packages/shared/src/store/slices/whatsappMessagesSlice.js`**
4. **`packages/shared/src/store/slices/whatsappWebhookEventsSlice.js`**

(Similares a los anteriores, con paginación y filtros)

---

#### 2.3 Registrar en Store

**Archivo:** `packages/shared/src/store/index.js`

```javascript
// Importar reducers
import whatsappTokenReducer from './slices/whatsappTokenSlice';
import whatsappTemplatesReducer from './slices/whatsappTemplatesSlice';
import whatsappMessagesReducer from './slices/whatsappMessagesSlice';
import whatsappWebhookEventsReducer from './slices/whatsappWebhookEventsSlice';

// En configureStore:
const store = configureStore({
  reducer: {
    // ... otros reducers
    whatsappToken: whatsappTokenReducer,
    whatsappTemplates: whatsappTemplatesReducer,
    whatsappMessages: whatsappMessagesReducer,
    whatsappWebhookEvents: whatsappWebhookEventsReducer
  }
});
```

**Archivo:** `packages/shared/src/store/slices/index.js`

```javascript
// Exportar slices
export { default as whatsappTokenSlice } from './whatsappTokenSlice';
export { default as whatsappTemplatesSlice } from './whatsappTemplatesSlice';
export { default as whatsappMessagesSlice } from './whatsappMessagesSlice';
export { default as whatsappWebhookEventsSlice } from './whatsappWebhookEventsSlice';

// Exportar acciones
export * from './whatsappTokenSlice';
export * from './whatsappTemplatesSlice';
export * from './whatsappMessagesSlice';
export * from './whatsappWebhookEventsSlice';
```

**Archivo:** `packages/shared/src/index.js`

```javascript
// Exportar API
export * from './api/whatsappApi.js';

// Exportar slices
export * from './store/slices/whatsappTokenSlice.js';
export * from './store/slices/whatsappTemplatesSlice.js';
export * from './store/slices/whatsappMessagesSlice.js';
export * from './store/slices/whatsappWebhookEventsSlice.js';
```

---

### 🎨 FASE 3: Frontend UI Components

Actualizar `WhatsAppConfigSection.jsx` para usar el nuevo sistema.

#### 3.1 Nueva Estructura del Componente

**Archivo:** `packages/web-app/src/pages/business/profile/sections/WhatsAppConfigSection.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import {
  fetchTokenInfo,
  testConnection,
  removeToken,
  clearError
} from '@shared/store/slices/whatsappTokenSlice'
import {
  fetchTemplates,
  syncTemplatesFromMeta
} from '@shared/store/slices/whatsappTemplatesSlice'

// Sub-componentes
import WhatsAppConnectionCard from './whatsapp/WhatsAppConnectionCard'
import WhatsAppEmbeddedSignup from './whatsapp/WhatsAppEmbeddedSignup'
import WhatsAppTokenManagement from './whatsapp/WhatsAppTokenManagement'
import WhatsAppTemplatesList from './whatsapp/WhatsAppTemplatesList'
import WhatsAppMessagesHistory from './whatsapp/WhatsAppMessagesHistory'
import WhatsAppWebhookEvents from './whatsapp/WhatsAppWebhookEvents'

const WhatsAppConfigSection = () => {
  const dispatch = useDispatch()
  const { currentBusiness } = useSelector(state => state.business)
  const { tokenInfo, loading, testing, error } = useSelector(state => state.whatsappToken)
  
  const [activeTab, setActiveTab] = useState('connection') // connection | templates | messages | webhooks

  useEffect(() => {
    if (currentBusiness?.id) {
      // Cargar info del token al montar
      dispatch(fetchTokenInfo(currentBusiness.id))
    }
  }, [dispatch, currentBusiness?.id])

  const handleTestConnection = async () => {
    try {
      const result = await dispatch(testConnection(currentBusiness.id)).unwrap()
      if (result.success) {
        toast.success('✅ Conexión exitosa con WhatsApp Business API')
      } else {
        toast.error('❌ Error de conexión: ' + result.errorDetails)
      }
    } catch (err) {
      toast.error('❌ Error al probar conexión')
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de desconectar WhatsApp? Se eliminarán los tokens almacenados.')) {
      return
    }
    
    try {
      await dispatch(removeToken(currentBusiness.id)).unwrap()
      toast.success('WhatsApp desconectado correctamente')
    } catch (err) {
      toast.error('Error al desconectar WhatsApp')
    }
  }

  const tabs = [
    { id: 'connection', name: 'Conexión', icon: ChatBubbleLeftRightIcon },
    { id: 'templates', name: 'Plantillas de Mensajes', icon: DocumentTextIcon },
    { id: 'messages', name: 'Historial de Mensajes', icon: EnvelopeIcon },
    { id: 'webhooks', name: 'Eventos Webhook', icon: ClockIcon }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Integración con WhatsApp Business Platform
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tu conexión con Meta y configura plantillas de mensajes
              </p>
            </div>
          </div>
          
          {/* Estado de conexión */}
          <div className="flex items-center space-x-4">
            {tokenInfo?.hasToken ? (
              <>
                <div className="flex items-center text-sm font-medium text-green-600">
                  <CheckCircleIcon className="h-5 w-5 mr-1" />
                  Conectado
                </div>
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-3 py-1.5 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                >
                  {testing ? 'Probando...' : 'Probar Conexión'}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Desconectar
                </button>
              </>
            ) : (
              <div className="flex items-center text-sm font-medium text-gray-500">
                <XCircleIcon className="h-5 w-5 mr-1" />
                No conectado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'connection' && (
          <div className="space-y-6">
            {!tokenInfo?.hasToken ? (
              <>
                {/* Embedded Signup (Recomendado) */}
                <WhatsAppEmbeddedSignup businessId={currentBusiness.id} />
                
                {/* Separador */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">o</span>
                  </div>
                </div>
                
                {/* Token Manual (Avanzado) */}
                <WhatsAppTokenManagement businessId={currentBusiness.id} />
              </>
            ) : (
              <WhatsAppConnectionCard 
                businessId={currentBusiness.id}
                tokenInfo={tokenInfo}
                onTest={handleTestConnection}
                onDisconnect={handleDisconnect}
              />
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <WhatsAppTemplatesList businessId={currentBusiness.id} />
        )}

        {activeTab === 'messages' && (
          <WhatsAppMessagesHistory businessId={currentBusiness.id} />
        )}

        {activeTab === 'webhooks' && (
          <WhatsAppWebhookEvents businessId={currentBusiness.id} />
        )}
      </div>
    </div>
  )
}

export default WhatsAppConfigSection
```

---

#### 3.2 Sub-Componentes a Crear

**Estructura de carpetas:**

```
packages/web-app/src/pages/business/profile/sections/whatsapp/
├── WhatsAppEmbeddedSignup.jsx           # Botón de Embedded Signup
├── WhatsAppTokenManagement.jsx          # Gestión manual de tokens
├── WhatsAppConnectionCard.jsx           # Info de conexión actual
├── WhatsAppTemplatesList.jsx            # Lista y gestión de templates
├── WhatsAppTemplateEditor.jsx           # Crear/Editar template
├── WhatsAppTemplatePreview.jsx          # Preview de template
├── WhatsAppMessagesHistory.jsx          # Historial de mensajes
├── WhatsAppWebhookEvents.jsx            # Log de webhooks
└── components/
    ├── TemplateStatusBadge.jsx          # Badge de estado (APPROVED, PENDING, REJECTED)
    ├── MessageStatusBadge.jsx           # Badge de estado de mensaje
    └── WebhookEventCard.jsx             # Card para evento webhook
```

---

#### 3.3 Componente Principal: WhatsAppEmbeddedSignup

**Archivo:** `packages/web-app/src/pages/business/profile/sections/whatsapp/WhatsAppEmbeddedSignup.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { apiClient } from '@shared/api/client'
import toast from 'react-hot-toast'

const WhatsAppEmbeddedSignup = ({ businessId }) => {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmbeddedSignupConfig()
  }, [])

  const loadEmbeddedSignupConfig = async () => {
    try {
      const response = await apiClient.get('/api/admin/whatsapp/embedded-signup/config')
      setConfig(response.data.data)
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmbeddedSignup = () => {
    if (!config) return

    const { appId, redirectUri, state } = config
    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=whatsapp_business_management,whatsapp_business_messaging`
    
    // Abrir ventana de Meta
    const width = 600
    const height = 700
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    const popup = window.open(
      url,
      'WhatsApp Business Signup',
      `width=${width},height=${height},left=${left},top=${top}`
    )

    // Escuchar mensaje de callback
    window.addEventListener('message', handleSignupCallback)
  }

  const handleSignupCallback = async (event) => {
    // Validar origen
    if (event.origin !== window.location.origin) return
    
    if (event.data.type === 'whatsapp-signup-success') {
      const { code, state } = event.data
      
      try {
        const response = await apiClient.post('/api/admin/whatsapp/embedded-signup/callback', {
          code,
          state,
          businessId
        })
        
        if (response.data.success) {
          toast.success('✅ WhatsApp conectado correctamente!')
          window.location.reload() // Recargar para mostrar token
        }
      } catch (error) {
        toast.error('Error al completar la conexión')
      }
    }
  }

  return (
    <div className="bg-white border-2 border-green-500 rounded-lg p-6">
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Conexión Recomendada: Embedded Signup
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Conecta tu WhatsApp Business Account de forma segura en pocos pasos
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
          <InformationCircleIcon className="h-5 w-5 mr-2" />
          ¿Qué necesitas?
        </h4>
        <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
          <li>Una cuenta de Facebook Business verificada</li>
          <li>Permisos de administrador en la cuenta de Facebook</li>
          <li>Un número de teléfono verificado para WhatsApp Business</li>
        </ul>
      </div>

      <button
        onClick={handleEmbeddedSignup}
        disabled={loading || !config}
        className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        Conectar con WhatsApp Business
      </button>

      <p className="text-xs text-gray-500 text-center mt-3">
        Al conectar, aceptas que Meta comparta tu información con Beauty Control
      </p>
    </div>
  )
}

export default WhatsAppEmbeddedSignup
```

---

### 📝 FASE 4: Gestión de Templates

**Componente:** `WhatsAppTemplatesList.jsx`

Funcionalidades:
- Listar templates (local + sincronizados de Meta)
- Crear nuevo template
- Editar template (solo DRAFT)
- Eliminar template
- Enviar a Meta para aprobación
- Ver estados: DRAFT, PENDING, APPROVED, REJECTED
- Sincronizar con Meta

**Componente:** `WhatsAppTemplateEditor.jsx`

Form builder con:
- Nombre del template
- Idioma (dropdown)
- Categoría (UTILITY, MARKETING, AUTHENTICATION)
- Componentes:
  - Header (TEXT, IMAGE, VIDEO, DOCUMENT)
  - Body (con variables {{1}}, {{2}}, etc.)
  - Footer (texto estático)
  - Buttons (QUICK_REPLY, CALL_TO_ACTION, URL)
- Preview en tiempo real

---

## 🔐 Seguridad y Validaciones

### Backend
1. ✅ Validar que el usuario es BUSINESS y es dueño del businessId
2. ✅ Validar que el plan incluye el módulo de WhatsApp
3. ✅ Rate limiting en endpoints de admin
4. ✅ Encriptar tokens en DB (ya implementado)
5. ✅ No devolver tokens en GET (solo metadata)
6. ✅ Validar firma HMAC de webhooks

### Frontend
1. ✅ Ocultar sección si no tiene el módulo
2. ✅ Validar permisos antes de mostrar acciones
3. ✅ Confirmar acciones destructivas (eliminar token, template)
4. ✅ Validar formularios de templates
5. ✅ Mostrar errores claros de Meta

---

## 📊 Checklist de Implementación

### Backend (FASE 1)
- [ ] Crear `WhatsAppAdminController.js`
- [ ] Crear `whatsappAdminRoutes.js`
- [ ] Implementar endpoints de tokens (CRUD + test)
- [ ] Implementar Embedded Signup (config + callback)
- [ ] Implementar endpoints de templates (CRUD + submit + sync)
- [ ] Implementar endpoints de mensajes (list + detail)
- [ ] Implementar endpoints de webhook events (list + detail + replay)
- [ ] Registrar rutas en `app.js`
- [ ] Agregar middleware de autenticación y autorización
- [ ] Pruebas unitarias de endpoints

### Redux (FASE 2)
- [ ] Crear `whatsappApi.js` (API client)
- [ ] Crear `whatsappTokenSlice.js`
- [ ] Crear `whatsappTemplatesSlice.js`
- [ ] Crear `whatsappMessagesSlice.js`
- [ ] Crear `whatsappWebhookEventsSlice.js`
- [ ] Registrar reducers en store
- [ ] Exportar en `index.js` y `slices/index.js`
- [ ] Crear selectores (si son necesarios)

### Frontend (FASE 3)
- [ ] Actualizar `WhatsAppConfigSection.jsx` con tabs
- [ ] Crear `WhatsAppEmbeddedSignup.jsx`
- [ ] Crear `WhatsAppTokenManagement.jsx`
- [ ] Crear `WhatsAppConnectionCard.jsx`
- [ ] Crear `WhatsAppTemplatesList.jsx`
- [ ] Crear `WhatsAppTemplateEditor.jsx`
- [ ] Crear `WhatsAppTemplatePreview.jsx`
- [ ] Crear `WhatsAppMessagesHistory.jsx`
- [ ] Crear `WhatsAppWebhookEvents.jsx`
- [ ] Crear componentes auxiliares (badges, cards)
- [ ] Agregar validaciones de formularios
- [ ] Agregar loading states
- [ ] Agregar empty states
- [ ] Agregar error handling

### Testing
- [ ] Probar Embedded Signup con Meta sandbox
- [ ] Probar creación de templates
- [ ] Probar envío de template a Meta
- [ ] Probar sincronización de templates
- [ ] Probar envío de mensaje con template
- [ ] Probar recepción de webhook
- [ ] Probar visualización de historial
- [ ] Probar gestión de tokens (rotar, eliminar)

### Documentación
- [ ] Actualizar README con nuevos endpoints
- [ ] Documentar flujo de Embedded Signup
- [ ] Documentar estructura de templates
- [ ] Crear guía de uso para business users
- [ ] Actualizar variables de entorno necesarias

---

## 🎯 Próximos Pasos

1. ✅ **Aprobar este plan** y ajustar si es necesario
2. ⏭️ **Empezar con FASE 1** (Backend API endpoints)
3. ⏭️ **Continuar con FASE 2** (Redux store)
4. ⏭️ **Finalizar con FASE 3** (Frontend UI)
5. ⏭️ **Testing end-to-end** con Meta sandbox

---

**¿Estás de acuerdo con este plan? ¿Quieres que empiece con la FASE 1 (Backend API endpoints)?** 🚀
