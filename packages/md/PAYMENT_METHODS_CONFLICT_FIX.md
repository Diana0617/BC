# 🔧 Fix: Conflicto de Exportaciones en Payment Methods

## ❌ Error Exacto

```
Uncaught SyntaxError: The requested module '/.../shared/src/index.js' 
contains conflicting star exports for name 'createPaymentMethod'
```

## 🔍 Causa Raíz

Teníamos **dos exportaciones con el mismo nombre** `createPaymentMethod`:

### 1️⃣ En la API (paymentMethodsApi.js):
```javascript
export const createPaymentMethod = async (methodData) => {
  const response = await apiClient.post('/api/payment-config/methods', methodData);
  return response.data;
};
```

### 2️⃣ En el Slice (paymentMethodsSlice.js):
```javascript
export const createPaymentMethod = createAsyncThunk(
  'paymentMethods/createPaymentMethod',
  async (methodData, { rejectWithValue }) => {
    const response = await paymentMethodsApi.createPaymentMethod(methodData);
    return response.data;
  }
);
```

### 🔥 El Conflicto:

```javascript
// shared/src/index.js
export * from './api/paymentMethodsApi.js';          // ❌ exporta createPaymentMethod
export * from './store/slices/paymentMethodsSlice.js'; // ❌ exporta createPaymentMethod

// ⚠️ Dos exportaciones con el mismo nombre = CONFLICTO
```

## ✅ Solución

Cambiamos las funciones individuales de la API a **funciones privadas** (sin `export`), y solo exportamos el objeto `paymentMethodsApi`:

```javascript
// ❌ ANTES - paymentMethodsApi.js
export const getPaymentMethods = async (activeOnly) => { ... }
export const createPaymentMethod = async (methodData) => { ... }
export const updatePaymentMethod = async (methodId, methodData) => { ... }
// ... más exports

export const paymentMethodsApi = {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  // ...
};
```

```javascript
// ✅ DESPUÉS - paymentMethodsApi.js
const getPaymentMethods = async (activeOnly) => { ... }        // Sin export
const createPaymentMethod = async (methodData) => { ... }      // Sin export
const updatePaymentMethod = async (methodId, methodData) => { ... } // Sin export
// ... sin exports individuales

export const paymentMethodsApi = {  // ✅ SOLO este export
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  // ...
};
```

## 📦 Exportaciones Ahora

### ✅ Desde la API (sin conflicto):
```javascript
import { paymentMethodsApi } from '@shared'

// Uso interno (slice lo usa así)
paymentMethodsApi.createPaymentMethod(data)
paymentMethodsApi.getPaymentMethods()
```

### ✅ Desde el Slice (para componentes):
```javascript
import {
  fetchPaymentMethods,      // ✅ async thunk
  createPaymentMethod,       // ✅ async thunk (ÚNICO con este nombre)
  updatePaymentMethod,       // ✅ async thunk
  selectPaymentMethods       // ✅ selector
} from '@shared'

// Uso en componentes
dispatch(createPaymentMethod(data))  // ✅ Sin conflicto
```

## 🎯 Flujo Correcto

```
Componente
  ↓
  dispatch(createPaymentMethod(data))  ← Async Thunk del Slice
    ↓
    paymentMethodsApi.createPaymentMethod(data)  ← Función de API
      ↓
      apiClient.post('/api/payment-config/methods', data)  ← HTTP Request
        ↓
        Backend
```

## ✅ Verificación

```bash
# Sin conflictos de nombres
✅ Solo 1 export de createPaymentMethod (desde el slice)
✅ paymentMethodsApi exporta objeto con funciones
✅ Sin errores de compilación
```

### Exports Disponibles:

**API Object:**
```javascript
paymentMethodsApi.getPaymentMethods()
paymentMethodsApi.createPaymentMethod()
paymentMethodsApi.updatePaymentMethod()
paymentMethodsApi.togglePaymentMethod()
paymentMethodsApi.deletePaymentMethod()
paymentMethodsApi.getPaymentConfig()
paymentMethodsApi.updatePaymentConfig()
```

**Async Thunks (para dispatch):**
```javascript
fetchPaymentMethods
createPaymentMethod        ← ÚNICO con este nombre
updatePaymentMethod        ← ÚNICO con este nombre
togglePaymentMethod        ← ÚNICO con este nombre
deletePaymentMethod        ← ÚNICO con este nombre
fetchPaymentConfig
```

**Selectors:**
```javascript
selectPaymentMethods
selectActivePaymentMethods
selectPaymentMethodsLoading
selectPaymentMethodsError
// ... etc
```

## 📚 Patrón Estándar

Este es el patrón correcto que usan otros módulos del proyecto:

```javascript
// ✅ API File (funciones privadas)
const getFoo = async () => { ... }
const createFoo = async () => { ... }

export const fooApi = { getFoo, createFoo }

// ✅ Slice File (async thunks públicos)
export const fetchFoo = createAsyncThunk(...)
export const createFoo = createAsyncThunk(...)  // ✅ Sin conflicto
```

## 🎉 Resultado

**Conflicto resuelto**
- ✅ Una sola exportación por nombre
- ✅ API accesible vía objeto
- ✅ Thunks accesibles directamente
- ✅ Componente funciona correctamente

**¡Problema solucionado!** 🚀
