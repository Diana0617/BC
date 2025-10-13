# Sistema de Gestión de Clientes - Frontend

## 📁 Componentes Creados (con Tailwind CSS)

### 1. **CustomersPage.jsx** (Página Principal)
**Ubicación**: `packages/web-app/src/pages/business/customers/CustomersPage.jsx`

Página principal de gestión de clientes para Owner, Recepcionista y Especialista_Recepcionista.

**Características**:
- ✅ Header con estadísticas rápidas (Total, Bloqueados, Con Vouchers, Canceladores)
- ✅ Buscador en tiempo real (nombre, email, teléfono)
- ✅ Filtros avanzados expandibles
- ✅ Lista responsiva de clientes (tabla en desktop, cards en móvil)
- ✅ Modales para detalle y creación de voucher

**Tailwind Classes Principales**:
- Layout: `min-h-screen`, `max-w-7xl`, `mx-auto`
- Cards: `bg-white`, `rounded-lg`, `shadow-sm`
- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- Responsive: `hidden lg:block`, `block lg:hidden`

---

### 2. **ClientList.jsx** (Lista de Clientes)
**Ubicación**: `packages/web-app/src/pages/business/customers/components/ClientList.jsx`

Componente responsivo que muestra la lista de clientes.

**Características**:
- ✅ Tabla completa en desktop con 7 columnas
- ✅ Cards en móvil optimizadas para touch
- ✅ Estados visuales con badges (bloqueado, activo, vouchers)
- ✅ Botones de acción (ver detalle, crear voucher)
- ✅ Loading state y empty state

**Tailwind Classes Destacadas**:
```jsx
// Tabla Desktop
className="min-w-full divide-y divide-gray-200"
className="px-6 py-4 whitespace-nowrap"

// Cards Móvil
className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors"

// Badges
className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"

// Botones de acción
className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
```

---

### 3. **ClientFilters.jsx** (Filtros Avanzados)
**Ubicación**: `packages/web-app/src/pages/business/customers/components/ClientFilters.jsx`

Panel expandible con filtros para la lista de clientes.

**Características**:
- ✅ Filtro por estado (Todos, Bloqueados, Con Vouchers, Canceladores Frecuentes)
- ✅ Ordenamiento (Reciente, Nombre, Citas, Cancelaciones, Vouchers)
- ✅ Rango de tiempo (7 días a 1 año)
- ✅ Botones con feedback visual (activo/inactivo)
- ✅ Botón para limpiar filtros

**Tailwind Classes Destacadas**:
```jsx
// Layout de filtros
className="grid grid-cols-1 md:grid-cols-3 gap-4"

// Botones de filtro activos
className="w-full flex items-center px-3 py-2 border rounded-lg transition-colors bg-green-100 text-green-900 border-green-300"

// Select estilizado
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
```

---

### 4. **CreateManualVoucherModal.jsx** (Modal de Creación)
**Ubicación**: `packages/web-app/src/pages/business/customers/components/CreateManualVoucherModal.jsx`

Modal para crear vouchers de cortesía o compensación.

**Características**:
- ✅ Formulario con validación en tiempo real
- ✅ Campos: Monto, Días de validez, Motivo
- ✅ Preview de información del cliente
- ✅ Loading state en el botón de submit
- ✅ Manejo de errores con mensajes visuales

**Tailwind Classes Destacadas**:
```jsx
// Modal overlay
className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"

// Modal container
className="relative bg-white rounded-lg shadow-xl max-w-lg w-full"

// Input con icono
className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"

// Loading spinner
className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
```

---

### 5. **ClientDetailModal.jsx** (Modal de Detalle)
**Ubicación**: `packages/web-app/src/pages/business/customers/components/ClientDetailModal.jsx`

Modal completo con tabs para mostrar toda la información del cliente.

**Características**:
- ✅ **Tab 1 - Información**: Contacto, estadísticas rápidas, estado de bloqueo
- ✅ **Tab 2 - Citas**: Historial completo de citas (completadas/canceladas/pendientes)
- ✅ **Tab 3 - Vouchers**: Lista de vouchers con estados
- ✅ **Tab 4 - Estadísticas**: Métricas de comportamiento y análisis
- ✅ Avatar con inicial del cliente
- ✅ Botón para levantar bloqueo (si aplica)

**Tailwind Classes Destacadas**:
```jsx
// Modal grande
className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"

// Tabs navigation
className="flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors border-indigo-600 text-indigo-600"

// Avatar circular
className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center"

// Alert de bloqueo
className="bg-red-50 border border-red-200 rounded-lg p-4"

// Grid de métricas
className="grid grid-cols-2 sm:grid-cols-4 gap-4"
```

---

## 🎨 Paleta de Colores (Tailwind)

### Colores Principales:
- **Indigo** (`indigo-600`, `indigo-100`): Acción principal, branding
- **Green** (`green-600`, `green-100`): Vouchers, estados positivos
- **Red** (`red-600`, `red-100`): Bloqueos, cancelaciones, alertas
- **Orange** (`orange-600`, `orange-100`): Advertencias, canceladores frecuentes
- **Gray** (`gray-50` a `gray-900`): Texto, bordes, fondos

### Estados de Componentes:
```jsx
// Hover states
hover:bg-gray-50
hover:text-indigo-900
hover:bg-indigo-50

// Focus states
focus:ring-2
focus:ring-indigo-500
focus:border-transparent

// Disabled states
disabled:opacity-50
disabled:cursor-not-allowed

// Transition
transition-colors
transition-shadow
```

---

## 📱 Responsividad

### Breakpoints Usados:
- **sm**: `640px` - Layouts de 2 columnas
- **md**: `768px` - Filtros en 3 columnas
- **lg**: `1024px` - Tabla desktop visible

### Patrones Implementados:
```jsx
// Ocultar en móvil, mostrar en desktop
<div className="hidden lg:block">
  <TableView />
</div>

// Mostrar en móvil, ocultar en desktop
<div className="block lg:hidden">
  <CardsView />
</div>

// Grid responsivo
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard />
</div>

// Flex responsivo
<div className="flex flex-col sm:flex-row gap-4">
  <Search />
  <Filters />
</div>
```

---

## 🔌 Integración con Redux

### Thunks Utilizados:
```javascript
import {
  fetchBusinessVouchers,
  createManualVoucher,
  fetchCustomerStats,
  fetchCancellationHistory,
  liftCustomerBlock
} from '@beautycontrol/shared';
```

### Selectores Utilizados:
```javascript
import {
  selectOperationLoading,
  selectCustomerStats,
  selectCancellationHistory
} from '@beautycontrol/shared';
```

---

## 📋 Pendientes (TODOs)

### Backend:
- [ ] Crear API endpoint: `GET /api/business/:businessId/customers`
- [ ] Crear API endpoint: `GET /api/business/customers/:customerId/appointments`
- [ ] Integrar con VoucherService en cancelación de citas

### Redux:
- [ ] Crear `businessCustomersApi.js` en `shared/src/api`
- [ ] Crear thunk `fetchBusinessCustomers` en nuevo slice
- [ ] Crear thunk `fetchCustomerAppointments`

### Frontend:
- [ ] Agregar item "Clientes" al sidebar del BusinessProfile
- [ ] Crear ruta `/business/customers`
- [ ] Conectar con datos reales (actualmente usa mock data)
- [ ] Implementar paginación en la lista
- [ ] Agregar exportación a Excel/CSV

---

## 🚀 Cómo Usar

### 1. Agregar al Sidebar:
```jsx
// En packages/web-app/src/layouts/BusinessLayout.jsx
import { UserGroupIcon } from '@heroicons/react/24/outline';

const menuItems = [
  // ... otros items
  {
    name: 'Clientes',
    href: '/business/customers',
    icon: UserGroupIcon,
    roles: ['OWNER', 'BUSINESS_OWNER', 'RECEPTIONIST', 'SPECIALIST_RECEPTIONIST']
  }
];
```

### 2. Agregar Ruta:
```jsx
// En packages/web-app/src/App.jsx
import CustomersPage from './pages/business/customers/CustomersPage';

<Route path="/business/customers" element={<CustomersPage />} />
```

### 3. Usar el Componente:
```jsx
import CustomersPage from './pages/business/customers/CustomersPage';

function App() {
  return <CustomersPage />;
}
```

---

## 🎯 Casos de Uso

### Caso 1: Ver todos los clientes con vouchers activos
1. Usuario hace clic en "Clientes" en el sidebar
2. Hace clic en "Filtros"
3. Selecciona "Con Vouchers"
4. Ve lista filtrada de clientes

### Caso 2: Crear voucher de cortesía
1. Usuario busca al cliente
2. Hace clic en botón "+" (crear voucher)
3. Llena formulario con monto, validez y motivo
4. Confirma creación
5. Voucher se genera automáticamente

### Caso 3: Revisar historial de cliente problemático
1. Usuario busca al cliente
2. Hace clic en ícono de ojo (ver detalle)
3. Navega por tabs:
   - **Información**: Ve que está bloqueado
   - **Citas**: Revisa historial de citas canceladas
   - **Estadísticas**: Ve tasa de cancelación alta
4. Decide si levantar bloqueo o mantenerlo

### Caso 4: Levantar bloqueo manualmente
1. Usuario abre detalle de cliente bloqueado
2. Ve alerta roja de bloqueo en tab "Información"
3. Hace clic en "Levantar bloqueo manualmente"
4. Confirma acción
5. Cliente puede volver a agendar

---

## 💡 Tips de Mantenimiento

### Agregar nuevos filtros:
```jsx
// En ClientFilters.jsx, agregar opción al select
<option value="high_value">Clientes Premium</option>

// En CustomersPage.jsx, implementar lógica
const filteredClients = useMemo(() => {
  if (filters.status === 'high_value') {
    return clients.filter(c => c.totalSpent > 500000);
  }
  // ...
}, [clients, filters]);
```

### Personalizar colores:
```jsx
// Cambiar color principal de indigo a blue
className="bg-blue-600 text-white hover:bg-blue-700"
className="text-blue-600 hover:text-blue-900"
```

### Agregar nueva columna a la tabla:
```jsx
// En ClientList.jsx, agregar <th> y <td>
<th className="px-6 py-3 text-left">
  Última Compra
</th>

<td className="px-6 py-4 whitespace-nowrap">
  {new Date(client.lastPurchase).toLocaleDateString()}
</td>
```

---

## 🎨 Ejemplo de Customización

### Cambiar tema de verde a azul para vouchers:
```jsx
// Antes
className="bg-green-600 text-white hover:bg-green-700"
className="text-green-600"

// Después
className="bg-blue-600 text-white hover:bg-blue-700"
className="text-blue-600"
```

### Agregar animación a los cards:
```jsx
className="transform hover:scale-105 transition-transform duration-200"
```

---

¡Todos los componentes están listos y completamente estilizados con Tailwind CSS! 🎉
