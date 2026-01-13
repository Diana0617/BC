# Redux - Sistema de Ventas

## 📦 Archivos Creados

### APIs
1. **salesApi.js** - Cliente API para ventas
2. **procedureSupplyApi.js** - Cliente API para consumo de productos

### Slices
1. **salesSlice.js** - State management de ventas
2. **procedureSupplySlice.js** - State management de consumo

## 🎯 Uso en Componentes

### 1. Importar Hooks y Actions

```javascript
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSales,
  fetchSaleById,
  createSale,
  cancelSale,
  fetchSalesSummary,
  clearSalesError,
  clearCurrentSale
} from '@beautycontrol/shared/src/store/slices/salesSlice';

import {
  fetchSupplies,
  createSupply,
  fetchSuppliesByAppointment,
  clearSupplyError
} from '@beautycontrol/shared/src/store/slices/procedureSupplySlice';
```

### 2. Crear Venta

```javascript
const CreateSaleModal = () => {
  const dispatch = useDispatch();
  const { loading, error, createSuccess } = useSelector(state => state.sales);
  const [items, setItems] = useState([]);

  const handleSubmit = async () => {
    const saleData = {
      branchId: 'uuid-sucursal',
      clientId: 'uuid-cliente',
      items: [
        {
          productId: 'uuid-producto-1',
          quantity: 2,
          discountType: 'PERCENTAGE',
          discountValue: 10
        },
        {
          productId: 'uuid-producto-2',
          quantity: 1
        }
      ],
      paymentMethod: 'CASH',
      paidAmount: 100000,
      notes: 'Venta al contado'
    };

    try {
      await dispatch(createSale(saleData)).unwrap();
      toast.success('Venta registrada exitosamente');
      onClose();
    } catch (error) {
      toast.error(error.error || 'Error al crear venta');
    }
  };

  return (
    <div>
      {/* UI del formulario */}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Procesando...' : 'Registrar Venta'}
      </button>
    </div>
  );
};
```

### 3. Listar Ventas

```javascript
const SalesList = () => {
  const dispatch = useDispatch();
  const { sales, loading, total, page, totalPages } = useSelector(state => state.sales);
  const [filters, setFilters] = useState({
    status: 'COMPLETED',
    startDate: '2025-01-01',
    endDate: '2025-01-31'
  });

  useEffect(() => {
    dispatch(fetchSales(filters));
  }, [dispatch, filters]);

  const handlePageChange = (newPage) => {
    dispatch(fetchSales({ ...filters, page: newPage }));
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h2>Ventas - Total: {total}</h2>
      {sales.map(sale => (
        <div key={sale.id}>
          <p>#{sale.saleNumber}</p>
          <p>Total: ${sale.total}</p>
          <p>Estado: {sale.status}</p>
        </div>
      ))}
      <Pagination 
        currentPage={page} 
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
```

### 4. Ver Detalle de Venta

```javascript
const SaleDetailModal = ({ saleId, onClose }) => {
  const dispatch = useDispatch();
  const { currentSale, loading } = useSelector(state => state.sales);

  useEffect(() => {
    dispatch(fetchSaleById(saleId));
    
    return () => {
      dispatch(clearCurrentSale());
    };
  }, [dispatch, saleId]);

  if (loading) return <Spinner />;
  if (!currentSale) return null;

  return (
    <div>
      <h2>Venta #{currentSale.saleNumber}</h2>
      <p>Cliente: {currentSale.client?.firstName} {currentSale.client?.lastName}</p>
      <p>Vendedor: {currentSale.user?.firstName}</p>
      
      <h3>Items</h3>
      {currentSale.items?.map(item => (
        <div key={item.id}>
          <p>{item.product?.name}</p>
          <p>Cantidad: {item.quantity}</p>
          <p>Precio: ${item.unitPrice}</p>
          <p>Total: ${item.total}</p>
        </div>
      ))}

      <div>
        <p>Subtotal: ${currentSale.subtotal}</p>
        <p>Descuento: -${currentSale.discount}</p>
        <p>Impuesto: ${currentSale.tax}</p>
        <p><strong>Total: ${currentSale.total}</strong></p>
      </div>
    </div>
  );
};
```

### 5. Cancelar Venta

```javascript
const CancelSaleButton = ({ sale }) => {
  const dispatch = useDispatch();
  const { loading, cancelSuccess } = useSelector(state => state.sales);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reason, setReason] = useState('');

  const handleCancel = async () => {
    try {
      await dispatch(cancelSale({ 
        saleId: sale.id, 
        reason 
      })).unwrap();
      
      toast.success('Venta cancelada exitosamente');
      setShowConfirm(false);
    } catch (error) {
      toast.error(error.error || 'Error al cancelar venta');
    }
  };

  if (sale.status !== 'COMPLETED') return null;

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Cancelar Venta
      </button>

      {showConfirm && (
        <Modal>
          <h3>¿Cancelar esta venta?</h3>
          <textarea
            placeholder="Motivo de cancelación"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button onClick={handleCancel} disabled={loading}>
            Confirmar Cancelación
          </button>
        </Modal>
      )}
    </>
  );
};
```

### 6. Resumen de Ventas

```javascript
const SalesSummaryDashboard = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector(state => state.sales);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    dispatch(fetchSalesSummary({
      startDate: firstDay.toISOString(),
      endDate: today.toISOString()
    }));
  }, [dispatch]);

  if (loading) return <Spinner />;
  if (!summary) return null;

  return (
    <div className="summary-grid">
      <Card>
        <h3>Total Ventas</h3>
        <p>{summary.summary.totalSales}</p>
      </Card>
      <Card>
        <h3>Ingresos</h3>
        <p>${summary.summary.totalRevenue?.toLocaleString()}</p>
      </Card>
      <Card>
        <h3>Ticket Promedio</h3>
        <p>${summary.summary.averageTicket?.toLocaleString()}</p>
      </Card>

      <h3>Por Método de Pago</h3>
      {summary.byPaymentMethod?.map(method => (
        <div key={method.paymentMethod}>
          <p>{method.paymentMethod}: {method.count} ventas</p>
          <p>Total: ${method.total?.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};
```

### 7. Registrar Consumo en Procedimiento

```javascript
const RegisterSupplyModal = ({ appointmentId, onClose }) => {
  const dispatch = useDispatch();
  const { loading, createSuccess } = useSelector(state => state.procedureSupply);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    unit: 'ml',
    reason: ''
  });

  const handleSubmit = async () => {
    const supplyData = {
      appointmentId,
      specialistId: 'uuid-especialista',
      productId: formData.productId,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      reason: formData.reason
    };

    try {
      await dispatch(createSupply(supplyData)).unwrap();
      toast.success('Consumo registrado exitosamente');
      onClose();
    } catch (error) {
      toast.error(error.error || 'Error al registrar consumo');
    }
  };

  return (
    <Modal>
      <h2>Registrar Consumo de Producto</h2>
      
      <ProductSelect
        value={formData.productId}
        onChange={(id) => setFormData({...formData, productId: id})}
        filter={(p) => p.productType === 'FOR_PROCEDURES' || p.productType === 'BOTH'}
      />

      <input
        type="number"
        step="0.1"
        placeholder="Cantidad"
        value={formData.quantity}
        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
      />

      <select
        value={formData.unit}
        onChange={(e) => setFormData({...formData, unit: e.target.value})}
      >
        <option value="unit">Unidades</option>
        <option value="ml">Mililitros</option>
        <option value="gr">Gramos</option>
        <option value="kg">Kilogramos</option>
      </select>

      <textarea
        placeholder="Motivo/Observaciones"
        value={formData.reason}
        onChange={(e) => setFormData({...formData, reason: e.target.value})}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Registrando...' : 'Registrar Consumo'}
      </button>
    </Modal>
  );
};
```

### 8. Ver Consumos de un Turno

```javascript
const AppointmentSuppliesTab = ({ appointmentId }) => {
  const dispatch = useDispatch();
  const { appointmentSupplies, loading } = useSelector(state => state.procedureSupply);

  useEffect(() => {
    dispatch(fetchSuppliesByAppointment(appointmentId));
  }, [dispatch, appointmentId]);

  if (loading) return <Spinner />;
  if (!appointmentSupplies) return null;

  const { supplies, summary } = appointmentSupplies;

  return (
    <div>
      <h3>Productos Consumidos</h3>
      
      {supplies.length === 0 ? (
        <p>No se han registrado consumos</p>
      ) : (
        <>
          {supplies.map(supply => (
            <div key={supply.id} className="supply-item">
              <p><strong>{supply.product?.name}</strong></p>
              <p>Cantidad: {supply.quantity} {supply.unit}</p>
              <p>Costo: ${supply.totalCost}</p>
              <p>Especialista: {supply.specialist?.firstName}</p>
              {supply.reason && <p>Motivo: {supply.reason}</p>}
            </div>
          ))}

          <div className="summary">
            <p>Total Items: {summary.totalItems}</p>
            <p><strong>Costo Total: ${summary.totalCost?.toLocaleString()}</strong></p>
          </div>
        </>
      )}
    </div>
  );
};
```

### 9. Estadísticas de Consumo

```javascript
const SupplyStatsReport = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector(state => state.procedureSupply);
  const [groupBy, setGroupBy] = useState('specialist');

  useEffect(() => {
    dispatch(fetchSupplyStats({
      groupBy,
      startDate: '2025-01-01',
      endDate: '2025-01-31'
    }));
  }, [dispatch, groupBy]);

  if (loading) return <Spinner />;
  if (!stats) return null;

  return (
    <div>
      <h2>Estadísticas de Consumo</h2>
      
      <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
        <option value="specialist">Por Especialista</option>
        <option value="product">Por Producto</option>
      </select>

      <div className="totals">
        <p>Total Registros: {stats.totals.totalRecords}</p>
        <p>Cantidad Total: {stats.totals.totalQuantity}</p>
        <p>Costo Total: ${stats.totals.totalCost?.toLocaleString()}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>{groupBy === 'specialist' ? 'Especialista' : 'Producto'}</th>
            <th>Registros</th>
            <th>Cantidad</th>
            <th>Costo</th>
          </tr>
        </thead>
        <tbody>
          {stats.stats?.map((item, index) => (
            <tr key={index}>
              <td>
                {groupBy === 'specialist' 
                  ? `${item.specialist?.firstName} ${item.specialist?.lastName}`
                  : item.product?.name
                }
              </td>
              <td>{item.totalRecords}</td>
              <td>{item.totalQuantity}</td>
              <td>${item.totalCost?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## 🔄 Manejo de Estado

### Selectors

```javascript
// Sales selectors
const sales = useSelector(state => state.sales.sales);
const currentSale = useSelector(state => state.sales.currentSale);
const summary = useSelector(state => state.sales.summary);
const loading = useSelector(state => state.sales.loading);
const error = useSelector(state => state.sales.error);
const createSuccess = useSelector(state => state.sales.createSuccess);

// Procedure Supply selectors
const supplies = useSelector(state => state.procedureSupply.supplies);
const appointmentSupplies = useSelector(state => state.procedureSupply.appointmentSupplies);
const stats = useSelector(state => state.procedureSupply.stats);
```

### Cleanup

```javascript
useEffect(() => {
  // Limpiar al desmontar
  return () => {
    dispatch(clearCurrentSale());
    dispatch(clearSalesError());
  };
}, [dispatch]);
```

## 📊 Estados del Store

### Sales State
```javascript
{
  sales: [],              // Lista de ventas
  currentSale: null,      // Venta seleccionada
  summary: null,          // Resumen estadístico
  total: 0,               // Total de registros
  page: 1,                // Página actual
  limit: 20,              // Items por página
  totalPages: 0,          // Total de páginas
  loading: false,         // Estado de carga
  error: null,            // Error si existe
  createSuccess: false,   // Flag de creación exitosa
  cancelSuccess: false    // Flag de cancelación exitosa
}
```

### Procedure Supply State
```javascript
{
  supplies: [],           // Lista de consumos
  currentSupply: null,    // Consumo seleccionado
  appointmentSupplies: {  // Consumos de un turno
    supplies: [],
    summary: {
      totalItems: 0,
      totalCost: 0
    }
  },
  stats: {                // Estadísticas
    stats: [],
    totals: {}
  },
  total: 0,
  page: 1,
  limit: 50,
  totalPages: 0,
  loading: false,
  error: null,
  createSuccess: false
}
```

---

**Fecha**: 13 de Enero 2025  
**Versión**: 1.0.0
