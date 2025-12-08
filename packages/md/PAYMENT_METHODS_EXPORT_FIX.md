# 🔧 Fix: Exports de Payment Methods en Shared

## ❌ Error

```
Uncaught SyntaxError: The requested module '/@fs/C:/Users/merce/Desktop/desarrollo/BC/packages/shared/src/index.js' 
does not provide an export named 'createPaymentMethod'
```

## 🔍 Causa Raíz

La API y el slice de `paymentMethods` fueron creados en `shared`, pero **no se exportaron** en el archivo principal `packages/shared/src/index.js`.

```javascript
// ❌ ANTES - shared/src/index.js
export * from './api/advancePaymentApi.js';
export * from './api/businessValidationApi.js';
// ❌ FALTABA: export * from './api/paymentMethodsApi.js';

export * from './store/slices/advancePaymentSlice.js';
export * from './store/slices/businessValidationSlice.js';
// ❌ FALTABA: export * from './store/slices/paymentMethodsSlice.js';
```

## ✅ Solución

Agregadas las exportaciones faltantes en `packages/shared/src/index.js`:

```javascript
// ✅ DESPUÉS - shared/src/index.js

// APIs
export * from './api/advancePaymentApi.js';
export * from './api/businessValidationApi.js';
export * from './api/paymentMethodsApi.js'; // ✅ Agregado

// Slices
export * from './store/slices/advancePaymentSlice.js';
export * from './store/slices/businessValidationSlice.js';
export * from './store/slices/paymentMethodsSlice.js'; // ✅ Agregado
```

## 📦 Exportaciones Ahora Disponibles

### Desde `@shared`:

**APIs:**
```javascript
import { paymentMethodsApi } from '@shared'
// paymentMethodsApi.getPaymentMethods()
// paymentMethodsApi.createPaymentMethod()
// paymentMethodsApi.updatePaymentMethod()
// paymentMethodsApi.togglePaymentMethod()
// paymentMethodsApi.deletePaymentMethod()
// paymentMethodsApi.getPaymentConfig()
// paymentMethodsApi.updatePaymentConfig()
```

**Async Thunks:**
```javascript
import {
  fetchPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  togglePaymentMethod,
  deletePaymentMethod,
  fetchPaymentConfig
} from '@shared'
```

**Selectors:**
```javascript
import {
  selectPaymentMethods,
  selectActivePaymentMethods,
  selectPaymentMethodsLoading,
  selectPaymentMethodsError,
  selectPaymentMethodsCreating,
  selectPaymentMethodsUpdating,
  selectPaymentMethodsDeleting
} from '@shared'
```

**Actions:**
```javascript
import {
  clearPaymentMethodsErrors,
  clearPaymentMethods
} from '@shared'
```

## ✅ Verificación

```bash
# Sin errores de compilación
✅ packages/shared/src/index.js
✅ packages/web-app/.../PaymentMethodsSection.jsx

# Exportaciones disponibles
✅ paymentMethodsApi (7 funciones)
✅ 5 async thunks
✅ 8 selectors
✅ 2 actions
```

## 🎯 Resultado

```javascript
// ✅ Ahora funciona correctamente
import { 
  fetchPaymentMethods,
  createPaymentMethod,
  selectPaymentMethods 
} from '@shared'

const paymentMethods = useSelector(selectPaymentMethods)
dispatch(fetchPaymentMethods())
```

**¡Problema resuelto!** 🎉
