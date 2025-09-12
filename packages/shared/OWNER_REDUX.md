# Redux OWNER Management

Esta carpeta contiene toda la lógica Redux para las funcionalidades de administrador OWNER de Beauty Control.

## 📁 Estructura

```
src/store/slices/
├── ownerStatsSlice.js       # Estadísticas de la plataforma
├── ownerBusinessesSlice.js  # Gestión de negocios
├── ownerSubscriptionsSlice.js # Gestión de suscripciones
└── plansSlice.js           # Gestión de planes de suscripción

src/api/
├── ownerApi.js             # API calls para funcionalidades OWNER
└── plansApi.js             # API calls para planes

src/hooks/
└── useOwner.js             # Hooks personalizados para OWNER

src/store/selectors/
└── ownerSelectors.js       # Selectores combinados
```

## 🚀 Uso Básico

### En un componente React:

```jsx
import { useOwner } from '@packages/shared';

function OwnerDashboard() {
  const { 
    stats, 
    businesses, 
    subscriptions, 
    plans 
  } = useOwner();

  useEffect(() => {
    stats.fetchStats();
    businesses.fetchBusinessesList();
    plans.fetchPlansList();
  }, []);

  if (stats.loading) return <Loading />;
  if (stats.error) return <Error message={stats.error.message} />;

  return (
    <div>
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