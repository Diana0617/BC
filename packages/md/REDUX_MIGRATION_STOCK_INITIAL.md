# Migración de Stock Initial a Redux

## 📋 Resumen

Se completó exitosamente la migración del componente `StockInitial.jsx` para usar Redux en lugar de llamadas directas a axios, siguiendo el patrón establecido en el resto de la aplicación.

## 🔧 Cambios Realizados

### 1. **Redux API Layer** - `packages/shared/src/api/productsApi.js`
✅ **CREADO** - API client wrapper para productos

**Métodos implementados:**
- `getProducts(params)` - Listar productos con filtros
- `getProductById(productId)` - Obtener producto por ID
- `createProduct(productData)` - Crear nuevo producto
- `updateProduct(productId, productData)` - Actualizar producto
- `deleteProduct(productId)` - Eliminar producto
- `getCategories()` - Obtener categorías
- `bulkInitialStock(products)` - Carga masiva de stock inicial
- `getProductMovements(productId, params)` - Historial de movimientos
- `createMovement(productId, movementData)` - Crear movimiento

**Patrón usado:**
```javascript
export const productsApi = {
  getProducts: (params) => apiClient.get('/api/products', { params }),
  bulkInitialStock: (products) => apiClient.post('/api/products/bulk-initial-stock', { products }),
  // ...
};
```

### 2. **Redux Slice** - `packages/shared/src/store/slices/productsSlice.js`
✅ **CREADO** - State management completo para productos

**Async Thunks (9):**
- `fetchProducts` - Cargar lista de productos
- `fetchProductById` - Cargar producto individual
- `createProduct` - Crear producto
- `updateProduct` - Actualizar producto
- `deleteProduct` - Eliminar producto
- `fetchCategories` - Cargar categorías
- `bulkInitialStock` - Carga inicial masiva (⭐ usado en StockInitial)
- `fetchProductMovements` - Cargar movimientos
- `createMovement` - Crear movimiento

**Estado:**
```javascript
{
  products: [],           // Lista de productos
  currentProduct: null,   // Producto seleccionado
  categories: [],         // Categorías disponibles
  movements: [],          // Historial de movimientos
  total: 0,              // Total de registros
  page: 1,               // Página actual
  totalPages: 0,         // Total de páginas
  loading: false,        // Cargando datos
  error: null,           // Errores
  bulkStockResult: null  // Resultado de carga masiva
}
```

**Acciones:**
- `clearProductsError()` - Limpiar errores (⚠️ renombrado para evitar conflictos)
- `clearCurrentProduct()` - Limpiar producto actual
- `clearBulkStockResult()` - Limpiar resultado de carga masiva

### 3. **Store Configuration** - `packages/shared/src/store/index.js`
✅ **MODIFICADO** - Registrado reducer de productos

```javascript
// Import
import productsReducer from './slices/productsSlice';

// Registro en store
const store = configureStore({
  reducer: {
    // ... otros reducers
    products: productsReducer  // ✅ AGREGADO
  }
});
```

### 4. **Exports** - `packages/shared/src/index.js`
✅ **MODIFICADO** - Exportados API y slice

```javascript
// 📦 PRODUCTS & INVENTORY APIs
export * from './api/productsApi.js';

// 📦 PRODUCTS & INVENTORY SLICES
export * from './store/slices/productsSlice.js';
```

### 5. **Componente StockInitial** - `packages/web-app/src/pages/business/inventory/stock/StockInitial.jsx`
✅ **REFACTORIZADO** - Migrado de axios a Redux

**ANTES:**
```javascript
import axios from 'axios';

const StockInitial = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadProducts = async () => {
    const response = await axios.get('/api/products', { params });
    setProducts(response.data.data.products);
  };
  
  const handleSubmit = async () => {
    const response = await axios.post('/api/products/bulk-initial-stock', { products });
    setResults(response.data.data);
  };
};
```

**DESPUÉS:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProducts, 
  bulkInitialStock,
  clearBulkStockResult,
  clearProductsError
} from '@shared';

const StockInitial = () => {
  const dispatch = useDispatch();
  const { 
    products: productsData, 
    loading, 
    error,
    bulkStockResult 
  } = useSelector(state => state.products);
  
  useEffect(() => {
    dispatch(fetchProducts({ 
      isActive: true, 
      trackInventory: true, 
      limit: 1000 
    }));
  }, [dispatch]);
  
  const handleSubmit = async () => {
    await dispatch(bulkInitialStock(stockItems)).unwrap();
    // Success manejado por useEffect
  };
};
```

## 🔍 Problema Resuelto

### Error Original:
```
Failed to resolve import 'axios' from StockInitial.jsx
```

### Causa:
- Componente importaba `axios` directamente
- Patrón inconsistente con el resto de la app
- Axios no estaba instalado en web-app

### Solución:
- ✅ Usar Redux Toolkit desde `@shared`
- ✅ Seguir patrón establecido (`useDispatch` + `useSelector`)
- ✅ Aprovechar thunks existentes para manejo de errores
- ✅ State centralizado y predecible

## 🎯 Beneficios

1. **Consistencia**: Mismo patrón que resto de componentes
2. **Mantenibilidad**: Lógica centralizada en slice
3. **Reutilización**: API y thunks disponibles para otros componentes
4. **Performance**: Evita llamadas duplicadas con cache de Redux
5. **DevTools**: Mejor debugging con Redux DevTools
6. **Testing**: Más fácil testear con state predecible

## 📝 Conflicto de Nombres Resuelto

### Problema:
```
Uncaught SyntaxError: The requested module contains conflicting star exports for name 'clearError'
```

### Causa:
Múltiples slices exportaban `clearError`:
- `authSlice` → `clearError`
- `ownerStatsSlice` → `clearError`
- `productsSlice` → `clearError` ❌

### Solución:
Renombrado en `productsSlice.js`:
```javascript
// ANTES
export const { clearError, clearCurrentProduct, clearBulkStockResult } = productsSlice.actions;

// DESPUÉS
export const { clearProductsError, clearCurrentProduct, clearBulkStockResult } = productsSlice.actions;
```

## ✅ Checklist de Migración

- [x] Crear `productsApi.js` con todos los endpoints
- [x] Crear `productsSlice.js` con thunks y reducers
- [x] Exportar desde `shared/index.js`
- [x] Registrar reducer en `store/index.js`
- [x] Refactorizar `StockInitial.jsx`
  - [x] Eliminar `import axios`
  - [x] Agregar `useDispatch` y `useSelector`
  - [x] Reemplazar axios calls con dispatch
  - [x] Usar estado de Redux
  - [x] Manejar loading/error desde Redux
- [x] Resolver conflicto de nombres (`clearError` → `clearProductsError`)
- [x] Eliminar código no usado
- [x] Verificar lint errors

## 🚀 Próximos Pasos

1. **Testing**: Probar carga de productos y stock inicial
2. **Commit**: Subir cambios antes de la presentación
3. **Fase 2**: Implementar tab de "Productos" (CRUD completo)
4. **Fase 3**: Implementar tab de "Compras" con carga de facturas
5. **Integración**: Conectar con sistema de caja y ventas

## 📚 Patrón de Referencia

Este patrón sigue el mismo usado en:
- `plansSlice.js` + `plansApi.js`
- `businessSlice.js`
- `publicBookingSlice.js`
- `paymentMethodsSlice.js`
- Todos los demás módulos de la app

**Regla**: ❌ NO usar axios directamente en componentes  
**Regla**: ✅ SIEMPRE usar Redux thunks desde `@shared`

---

**Fecha**: 30 de Octubre, 2025  
**Autor**: GitHub Copilot  
**Ticket**: Migración Redux - Stock Initial  
**Status**: ✅ COMPLETADO
