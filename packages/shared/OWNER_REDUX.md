# Redux Owner Management - Documentación

Esta documentación explica cómo usar los nuevos slices y hooks de Redux para la gestión de planes y módulos como OWNER.

## 📦 Componentes Incluidos

### Slices
- `ownerPlansSlice` - Gestión completa de planes de suscripción
- `ownerModulesSlice` - Gestión completa de módulos del sistema

### APIs
- `ownerPlansApi` - API endpoints para planes
- `ownerModulesApi` - API endpoints para módulos

### Hooks
- `useOwnerPlans` - Hook para gestión de planes
- `useOwnerModules` - Hook para gestión de módulos

## 🚀 Uso Básico

### Hook de Planes (`useOwnerPlans`)

```jsx
import React, { useEffect } from 'react';
import { useOwnerPlans } from '@bc/shared';

const OwnerPlansPage = () => {
  const {
    // State
    plans,
    totalPlans,
    selectedPlan,
    pagination,
    filters,
    
    // Loading states
    loading,
    createLoading,
    
    // UI State
    showCreateModal,
    
    // Actions
    actions,
    
    // Computed
    computed,
    
    // Helpers
    helpers
  } = useOwnerPlans();

  // Cargar planes al montar el componente
  useEffect(() => {
    helpers.refresh();
  }, []);

  return (
    <div>
      <h1>Gestión de Planes</h1>
      
      {/* Búsqueda */}
      <input
        type="text"
        placeholder="Buscar planes..."
        onChange={(e) => helpers.searchPlans(e.target.value)}
      />
      
      {/* Botón crear */}
      <button onClick={helpers.openCreateModal}>
        Crear Plan
      </button>
      
      {/* Lista de planes */}
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div>
          {plans.map(plan => (
            <div key={plan.id}>
              <h3>{plan.name}</h3>
              <p>${plan.price}</p>
              <button onClick={() => helpers.selectPlan(plan.id)}>
                Ver Detalles
              </button>
              <button onClick={() => helpers.openEditModal(plan)}>
                Editar
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Paginación */}
      <div>
        <button 
          disabled={!computed.hasPrevPage}
          onClick={() => helpers.goToPage(pagination.page - 1)}
        >
          Anterior
        </button>
        <span>Página {pagination.page} de {pagination.totalPages}</span>
        <button 
          disabled={!computed.hasNextPage}
          onClick={() => helpers.goToPage(pagination.page + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
```

### Hook de Módulos (`useOwnerModules`)

```jsx
import React, { useEffect } from 'react';
import { useOwnerModules } from '@bc/shared';

const OwnerModulesPage = () => {
  const {
    // State
    modules,
    categories,
    filters,
    
    // Loading states
    loading,
    
    // Actions
    actions,
    
    // Helpers
    helpers
  } = useOwnerModules();

  useEffect(() => {
    helpers.refresh();
  }, []);

  return (
    <div>
      <h1>Gestión de Módulos</h1>
      
      {/* Filtro por categoría */}
      <select 
        value={filters.category} 
        onChange={(e) => helpers.filterByCategory(e.target.value)}
      >
        <option value="">Todas las categorías</option>
        {categories.map(cat => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
      
      {/* Crear módulo */}
      <button onClick={helpers.openCreateModal}>
        Crear Módulo
      </button>
      
      {/* Lista de módulos */}
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div>
          {modules.map(module => (
            <div key={module.id}>
              <h3>{module.displayName}</h3>
              <span>{helpers.getStatusInfo(module.status).label}</span>
              <p>{module.description}</p>
              <button onClick={() => helpers.openEditModal(module)}>
                Editar
              </button>
              <button onClick={() => helpers.openDependenciesModal(module)}>
                Ver Dependencias
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 🔧 Funcionalidades Principales

### Gestión de Planes

#### Crear Plan con Módulos
```jsx
const handleCreatePlan = async () => {
  const planData = {
    name: "Plan Premium",
    description: "Plan completo",
    price: 89900,
    currency: "COP",
    duration: 1,
    durationType: "MONTHS",
    modules: [
      {
        moduleId: "module-uuid-123",
        isIncluded: true,
        limitQuantity: null,
        additionalPrice: 0,
        configuration: {
          allowOnlineBooking: true
        }
      }
    ]
  };
  
  await actions.createPlan(planData);
};
```

#### Filtrar y Buscar Planes
```jsx
// Buscar por nombre
helpers.searchPlans("Premium");

// Filtrar por estado
helpers.filterPlans({ status: "ACTIVE" });

// Filtros combinados
helpers.filterPlans({
  status: "ACTIVE",
  sortBy: "price",
  sortOrder: "ASC"
});
```

### Gestión de Módulos

#### Crear Módulo
```jsx
const handleCreateModule = async () => {
  const moduleData = {
    name: "appointment-booking",
    displayName: "Gestión de Citas",
    description: "Módulo para gestionar citas",
    category: "APPOINTMENTS",
    status: "ACTIVE",
    permissions: ["appointments.read", "appointments.create"],
    configurationSchema: {
      type: "object",
      properties: {
        maxAppointments: { type: "number", default: 100 }
      }
    }
  };
  
  await actions.createModule(moduleData);
};
```

#### Gestión por Categorías
```jsx
// Cargar módulos de una categoría específica
helpers.loadCategory("APPOINTMENTS");

// Obtener módulos de una categoría
const appointmentModules = helpers.getModulesByCategory("APPOINTMENTS");

// Filtrar por categoría
helpers.filterByCategory("CORE");
```

## 🎯 Estados y Loading

### Estados de Carga
```jsx
const {
  loading,              // Lista de elementos
  createLoading,        // Creando elemento
  updateLoading,        // Actualizando elemento
  deleteLoading,        // Eliminando elemento
  selectedPlanLoading,  // Cargando plan específico
} = useOwnerPlans();

// Mostrar indicadores apropiados
if (loading) return <Spinner />;
if (createLoading) return <CreateSpinner />;
```

### Manejo de Errores
```jsx
const {
  error,
  createError,
  updateError,
  actions
} = useOwnerPlans();

// Limpiar errores
useEffect(() => {
  actions.clearErrors();
}, []);

// Mostrar errores
if (error) {
  return <ErrorMessage message={error} />;
}
```

## 🔄 Sincronización y Refrescos

### Auto-refresh
```jsx
// Refrescar automáticamente cada 30 segundos
useEffect(() => {
  const interval = setInterval(() => {
    helpers.refresh();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

### Sincronización entre componentes
```jsx
// Los cambios se propagan automáticamente a todos los componentes
// que usen el mismo slice gracias a Redux

// Componente A crea un plan
actions.createPlan(planData);

// Componente B se actualiza automáticamente
// sin necesidad de hacer nada adicional
```

## 🎨 UI Helpers

### Modales y Estados UI
```jsx
const {
  showCreateModal,
  showEditModal,
  editingPlan,
  helpers
} = useOwnerPlans();

return (
  <>
    {showCreateModal && (
      <CreatePlanModal 
        onClose={helpers.closeModals}
        onSubmit={actions.createPlan}
      />
    )}
    
    {showEditModal && (
      <EditPlanModal 
        plan={editingPlan}
        onClose={helpers.closeModals}
        onSubmit={(data) => actions.updatePlan(editingPlan.id, data)}
      />
    )}
  </>
);
```

### Paginación
```jsx
const { pagination, computed, helpers } = useOwnerPlans();

const PaginationComponent = () => (
  <div>
    <button 
      disabled={!computed.hasPrevPage}
      onClick={() => helpers.goToPage(pagination.page - 1)}
    >
      Anterior
    </button>
    
    {/* Números de página */}
    {Array.from({ length: pagination.totalPages }, (_, i) => (
      <button
        key={i + 1}
        className={pagination.page === i + 1 ? 'active' : ''}
        onClick={() => helpers.goToPage(i + 1)}
      >
        {i + 1}
      </button>
    ))}
    
    <button 
      disabled={!computed.hasNextPage}
      onClick={() => helpers.goToPage(pagination.page + 1)}
    >
      Siguiente
    </button>
  </div>
);
```

## 📋 Campos Disponibles

### Plan Object
```typescript
interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  durationType: 'DAYS' | 'MONTHS' | 'YEARS';
  maxUsers: number;
  maxClients: number;
  maxAppointments: number;
  storageLimit: number;
  trialDays: number;
  features: object;
  limitations: object;
  status: 'ACTIVE' | 'INACTIVE';
  isPopular: boolean;
  modules?: PlanModule[];
  createdAt: string;
  updatedAt: string;
}
```

### Module Object
```typescript
interface Module {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: 'CORE' | 'APPOINTMENTS' | 'CLIENTS' | 'FINANCIAL' | 'PREMIUM';
  status: 'DEVELOPMENT' | 'ACTIVE' | 'DEPRECATED' | 'MAINTENANCE';
  version: string;
  requiresConfiguration: boolean;
  configurationSchema: object;
  permissions: string[];
  dependencies: string[];
  pricing: object;
  createdAt: string;
  updatedAt: string;
}
```

## 💡 Tips y Mejores Prácticas

1. **Siempre limpiar errores**: Usa `actions.clearErrors()` antes de operaciones importantes
2. **Usar computed values**: Los valores computados como `computed.hasPlans` son más eficientes
3. **Helpers para operaciones comunes**: Los helpers encapsulan lógica compleja de manera reutilizable
4. **Loading states específicos**: Usa loading states específicos para mejor UX
5. **Cleanup en unmount**: Considera usar `actions.reset()` al desmontar componentes grandes

Este sistema de Redux está diseñado para ser robusto, escalable y fácil de usar en el contexto de Beauty Control.
      <h1>Dashboard OWNER</h1>
      <StatsCards stats={stats.stats} />
      <BusinessesList businesses={businesses.businesses} />
    </div>
  );
}
```

### Usando hooks específicos:

```jsx
import { useOwnerStats, useOwnerBusinesses } from '@packages/shared';

function StatsComponent() {
  const { 
    stats, 
    loading, 
    error, 
    fetchStats 
  } = useOwnerStats();

  const {
    businesses,
    createNewBusiness,
    creating
  } = useOwnerBusinesses();

  const handleCreateBusiness = async (businessData) => {
    try {
      await createNewBusiness(businessData);
      // Refetch businesses after creation
      businesses.fetchBusinessesList();
    } catch (error) {
      console.error('Error creating business:', error);
    }
  };

  return (
    <div>
      <button onClick={fetchStats}>
        Actualizar Estadísticas
      </button>
      
      <CreateBusinessForm 
        onSubmit={handleCreateBusiness}
        loading={creating}
      />
    </div>
  );
}
```

## 📊 Funcionalidades Disponibles

### 1. Estadísticas de Plataforma (`useOwnerStats`)
- `fetchStats()` - Obtener estadísticas
- `stats` - Datos de estadísticas
- `totalUsers`, `totalBusinesses`, `activeSubscriptions` - Contadores rápidos
- `loading`, `error` - Estados de loading y error
- `clearError()`, `reset()` - Limpiar errores y resetear

### 2. Gestión de Negocios (`useOwnerBusinesses`)
- `fetchBusinessesList(params)` - Listar negocios con filtros
- `createNewBusiness(data)` - Crear negocio manualmente
- `updateBusinessStatus(id, status, reason)` - Cambiar estado de negocio
- `businesses`, `pagination` - Datos y paginación
- `loading`, `creating`, `updating` - Estados
- `updateFilters()`, `clearAllFilters()` - Gestión de filtros

### 3. Gestión de Suscripciones (`useOwnerSubscriptions`)
- `createNewSubscription(data)` - Crear suscripción
- `cancelExistingSubscription(id, reason)` - Cancelar suscripción
- `creating`, `cancelling` - Estados de loading
- `createError`, `cancelError` - Errores específicos

### 4. Gestión de Planes (`usePlans`)
- `fetchPlansList(params)` - Obtener planes
- `plans`, `activePlans`, `popularPlans` - Datos de planes
- `loading`, `error` - Estados
- Auto-fetch de planes activos al montar el componente

## 🔍 Selectores Avanzados

```jsx
import { 
  selectOwnerDashboardSummary,
  selectGrowthStats,
  selectPopularPlansInfo,
  selectOwnerLoadingState,
  selectOwnerErrors 
} from '@packages/shared';

function AdvancedDashboard() {
  const summary = useSelector(selectOwnerDashboardSummary);
  const growth = useSelector(selectGrowthStats);
  const plansInfo = useSelector(selectPopularPlansInfo);
  const loadingState = useSelector(selectOwnerLoadingState);
  const errors = useSelector(selectOwnerErrors);

  return (
    <div>
      <DashboardSummary data={summary} />
      <GrowthCharts data={growth} />
      <PopularPlans data={plansInfo} />
      {loadingState.isAnyLoading && <GlobalLoader />}
      {errors.hasErrors && <ErrorNotification errors={errors.errors} />}
    </div>
  );
}
```

## 🛡️ Manejo de Errores

Todos los slices tienen manejo de errores integrado:

```jsx
const { stats, clearAllErrors } = useOwner();

// Limpiar todos los errores de una vez
useEffect(() => {
  if (stats.error) {
    console.error('Error in stats:', stats.error);
    clearAllErrors();
  }
}, [stats.error, clearAllErrors]);
```

## 🔄 Estados de Loading

Control granular de estados de carga:

```jsx
const { 
  isLoading,           // Cualquier operación en progreso
  stats.loading,       // Solo estadísticas
  businesses.creating, // Solo creación de negocios
  plans.loading        // Solo carga de planes
} = useOwner();
```

## 📱 Compatibilidad

Este Redux store es compatible con:
- ✅ React Web (web-app)
- ✅ React Native (mobile-app)
- ✅ Next.js SSR/SSG
- ✅ Redux DevTools
- ✅ Redux Persist (si se configura)

## 🚨 Notas Importantes

1. **Autenticación**: Asegúrate de que el usuario tenga rol OWNER antes de usar estas funcionalidades
2. **Tokens**: Las APIs requieren token de autenticación válido
3. **Permisos**: Todas las rutas están protegidas con middleware `ownerOnly`
4. **Performance**: Los hooks incluyen optimizaciones con `useCallback` y auto-fetch inteligente

## 🧪 Testing

```jsx
import { renderWithProviders } from '../test-utils';
import { useOwnerStats } from '@packages/shared';

test('should fetch stats on mount', async () => {
  const TestComponent = () => {
    const { fetchStats, stats } = useOwnerStats();
    
    useEffect(() => {
      fetchStats();
    }, []);
    
    return <div>{stats.users.total}</div>;
  };

  renderWithProviders(<TestComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('6')).toBeInTheDocument();
  });
});
```