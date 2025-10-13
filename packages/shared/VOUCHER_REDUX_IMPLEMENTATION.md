# Sistema de Vouchers - Redux Implementation

## 📁 Archivos Creados

### 1. API Client (`voucherApi.js`)
**Ubicación**: `packages/shared/src/api/voucherApi.js`

Contiene todas las llamadas HTTP al backend para el sistema de vouchers:

#### Endpoints para Clientes:
- `getMyVouchers()` - Obtener vouchers activos del cliente
- `validateVoucher(voucherCode)` - Validar un código de voucher
- `applyVoucher({ voucherCode, bookingId })` - Aplicar voucher a una cita
- `checkBlockStatus()` - Verificar si está bloqueado
- `getCancellationHistory(days)` - Historial de cancelaciones

#### Endpoints para Negocios:
- `listBusinessVouchers(params)` - Listar vouchers con filtros y paginación
- `cancelVoucher(voucherId, { reason })` - Cancelar un voucher
- `createManualVoucher(data)` - Crear voucher de cortesía
- `listBlockedCustomers(params)` - Listar clientes bloqueados
- `liftBlock(blockId, { notes })` - Levantar bloqueo
- `getCustomerStats(customerId, days)` - Estadísticas de cliente

#### Endpoints Administrativos:
- `cleanupExpired()` - Limpiar vouchers y bloqueos expirados (CRON)

---

### 2. Redux Slice (`voucherSlice.js`)
**Ubicación**: `packages/shared/src/store/slices/voucherSlice.js`

Maneja todo el estado de vouchers, bloqueos y cancelaciones.

#### Estado Inicial:
```javascript
{
  // Cliente
  myVouchers: [],
  myVouchersLoading: false,
  myVouchersError: null,
  
  validatedVoucher: null,
  validationLoading: false,
  validationError: null,
  
  appliedVoucher: null,
  applyLoading: false,
  applyError: null,
  
  blockStatus: null,
  blockStatusLoading: false,
  blockStatusError: null,
  
  cancellationHistory: [],
  historyLoading: false,
  historyError: null,
  
  // Negocio
  businessVouchers: {
    data: [],
    pagination: null,
    loading: false,
    error: null
  },
  
  blockedCustomers: {
    data: [],
    loading: false,
    error: null
  },
  
  customerStats: null,
  customerStatsLoading: false,
  customerStatsError: null,
  
  // Operaciones
  operationLoading: false,
  operationError: null,
  operationSuccess: null
}
```

#### Thunks Disponibles:

**Para Clientes:**
- `fetchMyVouchers()` - Cargar vouchers del cliente
- `validateVoucherCode(voucherCode)` - Validar código
- `applyVoucherToBooking({ voucherCode, bookingId })` - Aplicar voucher
- `checkCustomerBlockStatus()` - Verificar bloqueo
- `fetchCancellationHistory(days)` - Obtener historial

**Para Negocios:**
- `fetchBusinessVouchers(params)` - Listar vouchers del negocio
- `cancelBusinessVoucher({ voucherId, reason })` - Cancelar voucher
- `createManualVoucher(data)` - Crear voucher manual
- `fetchBlockedCustomers(params)` - Listar bloqueados
- `liftCustomerBlock({ blockId, notes })` - Levantar bloqueo
- `fetchCustomerStats({ customerId, days })` - Stats de cliente

#### Actions:
- `clearValidation()` - Limpiar validación de voucher
- `clearApplyState()` - Limpiar estado de aplicación
- `clearOperationMessages()` - Limpiar mensajes
- `resetVoucherState()` - Reset completo

---

### 3. Selectores (`voucherSelectors.js`)
**Ubicación**: `packages/shared/src/store/selectors/voucherSelectors.js`

Facilitan el acceso al estado desde los componentes.

#### Selectores para Clientes:
```javascript
// Básicos
selectMyVouchers(state)
selectMyVouchersLoading(state)
selectMyVouchersError(state)

selectValidatedVoucher(state)
selectValidationLoading(state)
selectValidationError(state)

selectAppliedVoucher(state)
selectApplyLoading(state)
selectApplyError(state)

selectBlockStatus(state)
selectIsBlocked(state)

selectCancellationHistory(state)

// Derivados
selectAvailableVouchers(state) - Solo vouchers activos y no expirados
selectActiveVouchersCount(state) - Cantidad de vouchers activos
selectHighestValueVoucher(state) - Voucher de mayor valor
selectExpiringVouchers(state) - Vouchers que expiran en 7 días
selectRecentCancellationsCount(state) - Cancelaciones últimos 30 días
```

#### Selectores para Negocios:
```javascript
// Básicos
selectBusinessVouchers(state)
selectBusinessVouchersPagination(state)
selectBusinessVouchersLoading(state)

selectBlockedCustomers(state)
selectBlockedCustomersLoading(state)

selectCustomerStats(state)

selectOperationLoading(state)
selectOperationError(state)
selectOperationSuccess(state)

// Derivados
selectActiveBlocks(state) - Solo bloqueos activos
selectActiveBlocksCount(state) - Cantidad de bloqueos activos
selectBusinessVouchersByStatus(status) - Filtrar por estado
selectTotalActiveVouchersValue(state) - Valor total activo
selectTotalUsedVouchersValue(state) - Valor total usado
selectBusinessVoucherStats(state) - Estadísticas completas
selectIsAnyOperationLoading(state) - Verificar si hay operaciones en curso
```

---

## 🔄 Integración en el Store

Los archivos ya están integrados en:

1. **`packages/shared/src/api/index.js`**
   - Exporta `voucherApi`
   - Incluido en el objeto `ownerApis`

2. **`packages/shared/src/store/slices/index.js`**
   - Exporta `voucherSlice` como default
   - Exporta todos los thunks y actions

3. **`packages/shared/src/store/selectors/index.js`**
   - Exporta todos los selectores con `export * from './voucherSelectors'`

4. **`packages/shared/src/store/index.js`**
   - Registra `voucherReducer` en el store principal
   - Disponible como `state.voucher`

---

## 📝 Ejemplos de Uso

### En un Componente de Cliente

```javascript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyVouchers,
  validateVoucherCode,
  applyVoucherToBooking,
  selectMyVouchers,
  selectMyVouchersLoading,
  selectAvailableVouchers,
  selectIsBlocked
} from '@beautycontrol/shared';

function MyVouchersComponent() {
  const dispatch = useDispatch();
  
  // Selectores
  const vouchers = useSelector(selectAvailableVouchers);
  const loading = useSelector(selectMyVouchersLoading);
  const isBlocked = useSelector(selectIsBlocked);
  
  // Cargar vouchers al montar
  useEffect(() => {
    dispatch(fetchMyVouchers());
  }, [dispatch]);
  
  // Validar voucher
  const handleValidate = async (code) => {
    const result = await dispatch(validateVoucherCode(code));
    if (result.type.endsWith('/fulfilled')) {
      console.log('Voucher válido:', result.payload);
    }
  };
  
  // Aplicar voucher
  const handleApply = async (voucherCode, bookingId) => {
    const result = await dispatch(applyVoucherToBooking({ 
      voucherCode, 
      bookingId 
    }));
    
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Voucher aplicado correctamente');
    } else {
      toast.error(result.payload);
    }
  };
  
  if (loading) return <div>Cargando...</div>;
  
  if (isBlocked) {
    return <div>Tu cuenta está bloqueada temporalmente</div>;
  }
  
  return (
    <div>
      <h2>Mis Vouchers ({vouchers.length})</h2>
      {vouchers.map(voucher => (
        <div key={voucher.id}>
          <p>Código: {voucher.code}</p>
          <p>Valor: ${voucher.amount}</p>
          <p>Expira: {new Date(voucher.expiresAt).toLocaleDateString()}</p>
          <button onClick={() => handleApply(voucher.code, appointmentId)}>
            Aplicar
          </button>
        </div>
      ))}
    </div>
  );
}
```

### En un Componente de Negocio

```javascript
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBusinessVouchers,
  createManualVoucher,
  fetchBlockedCustomers,
  liftCustomerBlock,
  selectBusinessVouchers,
  selectBusinessVouchersLoading,
  selectBusinessVoucherStats,
  selectBlockedCustomers,
  selectOperationSuccess
} from '@beautycontrol/shared';

function BusinessVouchersManager() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  
  const vouchers = useSelector(selectBusinessVouchers);
  const loading = useSelector(selectBusinessVouchersLoading);
  const stats = useSelector(selectBusinessVoucherStats);
  const blockedCustomers = useSelector(selectBlockedCustomers);
  const operationSuccess = useSelector(selectOperationSuccess);
  
  useEffect(() => {
    // Cargar datos iniciales
    dispatch(fetchBusinessVouchers({ page: 1, limit: 20 }));
    dispatch(fetchBlockedCustomers({ status: 'ACTIVE' }));
  }, [dispatch]);
  
  // Mostrar notificación de éxito
  useEffect(() => {
    if (operationSuccess) {
      toast.success(operationSuccess);
    }
  }, [operationSuccess]);
  
  // Crear voucher manual
  const handleCreateManualVoucher = async (customerId, amount, validityDays, reason) => {
    const result = await dispatch(createManualVoucher({
      customerId,
      amount,
      validityDays,
      reason
    }));
    
    if (result.type.endsWith('/fulfilled')) {
      setShowModal(false);
      dispatch(fetchBusinessVouchers({ page: 1, limit: 20 })); // Recargar lista
    }
  };
  
  // Levantar bloqueo
  const handleLiftBlock = async (blockId) => {
    const result = await dispatch(liftCustomerBlock({
      blockId,
      notes: 'Cliente contactó al negocio y se acordó levantar el bloqueo'
    }));
    
    if (result.type.endsWith('/fulfilled')) {
      dispatch(fetchBlockedCustomers({ status: 'ACTIVE' })); // Recargar lista
    }
  };
  
  return (
    <div>
      <h2>Gestión de Vouchers</h2>
      
      {/* Estadísticas */}
      <div className="stats">
        <div>Total: {stats.total}</div>
        <div>Activos: {stats.active}</div>
        <div>Usados: {stats.used}</div>
        <div>Valor Activo: ${stats.activeValue}</div>
      </div>
      
      {/* Botón para crear voucher manual */}
      <button onClick={() => setShowModal(true)}>
        Crear Voucher de Cortesía
      </button>
      
      {/* Lista de vouchers */}
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Estado</th>
              <th>Expira</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map(voucher => (
              <tr key={voucher.id}>
                <td>{voucher.code}</td>
                <td>{voucher.Customer?.name}</td>
                <td>${voucher.amount}</td>
                <td>{voucher.status}</td>
                <td>{new Date(voucher.expiresAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* Clientes bloqueados */}
      <h3>Clientes Bloqueados ({blockedCustomers.length})</h3>
      {blockedCustomers.map(block => (
        <div key={block.id}>
          <p>{block.Customer?.name}</p>
          <p>Cancelaciones: {block.cancellationCount}</p>
          <p>Bloqueado: {new Date(block.blockedAt).toLocaleDateString()}</p>
          <p>Expira: {new Date(block.expiresAt).toLocaleDateString()}</p>
          <button onClick={() => handleLiftBlock(block.id)}>
            Levantar Bloqueo
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## ✅ Checklist de Integración

- [x] **API Client** creado (`voucherApi.js`)
- [x] **Redux Slice** creado (`voucherSlice.js`)
- [x] **Selectores** creados (`voucherSelectors.js`)
- [x] **API exportada** en `api/index.js`
- [x] **Slice exportado** en `slices/index.js`
- [x] **Selectores exportados** en `selectors/index.js`
- [x] **Reducer registrado** en `store/index.js`
- [x] **Collection de Insomnia** creado para testing
- [ ] **Integrar con cancelación de citas** (próximo paso)
- [ ] **Crear componentes frontend** (próximo paso)
- [ ] **Configurar CRON para cleanup** (próximo paso)

---

## 🚀 Próximos Pasos

1. **Integrar con cancelación de citas**: Modificar el endpoint/controller de cancelación de citas para llamar a `VoucherService.processCancellation()`

2. **Crear UI para clientes**:
   - Componente para ver "Mis Vouchers"
   - Modal para aplicar voucher en booking
   - Notificación de voucher generado al cancelar

3. **Crear UI para negocios**:
   - Pantalla de gestión de vouchers
   - Configuración de reglas de vouchers
   - Gestión de clientes bloqueados

4. **Setup CRON**: Script para ejecutar `/api/vouchers/cleanup` diariamente

---

## 📚 Documentación Adicional

- **Backend**: Ver `packages/backend/VOUCHER_SYSTEM_INSOMNIA.json` para todos los endpoints
- **Reglas de Negocio**: Ver `packages/backend/scripts/seed-rule-templates.js` (líneas 130-280)
- **Modelos**: `packages/backend/src/models/Voucher.js`, `CustomerCancellationHistory.js`, `CustomerBookingBlock.js`
- **Servicio**: `packages/backend/src/services/VoucherService.js`
