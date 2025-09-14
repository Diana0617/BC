import React, { useEffect } from 'react';
import { useOwnerDashboard } from '../../../../shared/src/index.js';
import { 
  CurrencyDollarIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

/**
 * Dashboard principal del Owner con todas las métricas y gráficos
 */
const OwnerDashboardPage = () => {
  const {
    // Datos
    mainMetrics,
    revenueChart,
    planDistribution,
    topBusinesses,
    growthStats,
    quickSummary,
    
    // Loading states
    loading,
    
    // Helpers
    helpers,
    
    // Computed values
    computed
  } = useOwnerDashboard();

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    helpers.loadAll();
  }, []);

  if (computed.isAnyLoading && !mainMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        <span className="ml-3 text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header del dashboard */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-1">
            Resumen general de la plataforma Business Control
          </p>
        </div>
        
        <button
          onClick={helpers.refresh}
          disabled={computed.isAnyLoading}
          className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
        >
          <ArrowPathIcon className={`h-5 w-5 ${computed.isAnyLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Widgets de resumen rápido */}
      {quickSummary?.widgets && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickSummary.widgets.map((widget, index) => (
            <QuickWidget 
              key={widget.title} 
              widget={widget} 
              helpers={helpers}
            />
          ))}
        </div>
      )}

      {/* Grid principal de métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Métricas principales */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Métricas Principales
          </h2>
          
          {mainMetrics ? (
            <div className="space-y-4">
              <MetricItem
                label="Total Negocios"
                value={mainMetrics.totalBusinesses}
                format="number"
                trend={mainMetrics.growthRate}
                icon={BuildingOfficeIcon}
              />
              <MetricItem
                label="Ingresos Totales"
                value={mainMetrics.totalRevenue}
                format="currency"
                trend={mainMetrics.revenueTrend}
                icon={CurrencyDollarIcon}
              />
              <MetricItem
                label="Suscripciones Activas"
                value={mainMetrics.totalSubscriptions}
                format="number"
                trend={mainMetrics.subscriptionTrend}
                icon={UsersIcon}
              />
              <MetricItem
                label="Ingreso Promedio"
                value={mainMetrics.averageRevenue}
                format="currency"
                icon={ChartBarIcon}
              />
            </div>
          ) : (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          )}
        </div>

        {/* Gráfico de ingresos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ingresos por Mes
          </h2>
          
          {revenueChart?.data ? (
            <RevenueChart 
              data={revenueChart.data} 
              helpers={helpers}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
              {loading.revenueChart ? (
                <div className="animate-pulse text-gray-500">
                  Cargando gráfico...
                </div>
              ) : (
                <div className="text-gray-500">
                  No hay datos de ingresos disponibles
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Segunda fila de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Distribución de planes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Distribución de Planes
          </h2>
          
          {planDistribution?.distribution ? (
            <PlanDistributionChart 
              data={planDistribution.distribution}
              total={planDistribution.totalSubscriptions}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
              {loading.planDistribution ? (
                <div className="animate-pulse text-gray-500">
                  Cargando distribución...
                </div>
              ) : (
                <div className="text-gray-500">
                  No hay datos de planes disponibles
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top negocios */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Negocios Más Activos
          </h2>
          
          {topBusinesses?.businesses ? (
            <TopBusinessesList businesses={topBusinesses.businesses} />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
              {loading.topBusinesses ? (
                <div className="animate-pulse text-gray-500">
                  Cargando negocios...
                </div>
              ) : (
                <div className="text-gray-500">
                  No hay datos de negocios disponibles
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas de crecimiento */}
      {growthStats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Estadísticas de Crecimiento
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GrowthStat
              title="Conversión Trial → Activo"
              value={growthStats.conversionRate?.value || 0}
              description={growthStats.conversionRate?.description}
              format="percentage"
            />
            <GrowthStat
              title="Crecimiento de Negocios"
              value={growthStats.businessGrowth?.value || 0}
              description={growthStats.businessGrowth?.description}
              format="percentage"
            />
            <GrowthStat
              title="Tendencia de Ingresos"
              value={growthStats.revenueTrend?.value || 0}
              description={growthStats.revenueTrend?.description}
              format="percentage"
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Widget de resumen rápido
 */
const QuickWidget = ({ widget, helpers }) => {
  const getIcon = (iconType) => {
    const icons = {
      dollar: CurrencyDollarIcon,
      calendar: CalendarIcon,
      subscription: UsersIcon,
      business: BuildingOfficeIcon
    };
    return icons[iconType] || CurrencyDollarIcon;
  };

  const formatValue = (value, format) => {
    switch (format) {
      case 'currency':
        return helpers.formatCurrency(value);
      case 'number':
        return helpers.formatNumber(value);
      case 'percentage':
        return helpers.formatPercentage(value);
      default:
        return value;
    }
  };

  const IconComponent = getIcon(widget.icon);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-pink-100 rounded-lg">
          <IconComponent className="h-6 w-6 text-pink-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-600">{widget.title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatValue(widget.value, widget.format)}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de métrica individual
 */
const MetricItem = ({ label, value, format, trend, icon: Icon }) => {
  const formatValue = (val, fmt) => {
    if (fmt === 'currency') {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
      }).format(val);
    }
    if (fmt === 'number') {
      return new Intl.NumberFormat('es-CO').format(val);
    }
    return val;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <Icon className="h-8 w-8 text-pink-600" />
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-xl font-semibold text-gray-900">
            {formatValue(value, format)}
          </p>
        </div>
      </div>
      
      {trend !== undefined && (
        <div className={`flex items-center space-x-1 ${
          trend >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend >= 0 ? (
            <ArrowTrendingUpIcon className="h-4 w-4" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {Math.abs(trend).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Gráfico simple de ingresos
 */
const RevenueChart = ({ data, helpers }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={item.month} className="flex items-center space-x-3">
          <div className="w-16 text-sm text-gray-600">
            {new Date(item.month).toLocaleDateString('es-CO', { 
              month: 'short', 
              year: '2-digit' 
            })}
          </div>
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-4 rounded-full"
                style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
              />
            </div>
          </div>
          <div className="w-24 text-sm text-gray-900 text-right">
            {helpers.formatCurrency(item.revenue)}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Gráfico de distribución de planes
 */
const PlanDistributionChart = ({ data, total }) => {
  const colors = [
    'bg-pink-500', 'bg-purple-500', 'bg-blue-500', 
    'bg-green-500', 'bg-yellow-500', 'bg-red-500'
  ];
  
  return (
    <div className="space-y-4">
      {data.map((plan, index) => {
        const percentage = ((plan.value / total) * 100).toFixed(1);
        return (
          <div key={plan.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`} />
              <span className="text-sm text-gray-700">{plan.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{plan.value}</span>
              <span className="text-xs text-gray-500">({percentage}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Lista de top negocios
 */
const TopBusinessesList = ({ businesses }) => {
  return (
    <div className="space-y-3">
      {businesses.map((business, index) => (
        <div key={business.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-pink-600">
                #{index + 1}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{business.name}</p>
              <p className="text-sm text-gray-500">{business.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {business.activity_score} pts
            </p>
            <p className="text-xs text-gray-500">
              {business.appointments_count} citas
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Estadística de crecimiento
 */
const GrowthStat = ({ title, value, description, format }) => {
  const formatValue = (val, fmt) => {
    if (fmt === 'percentage') {
      return `${val.toFixed(1)}%`;
    }
    return val;
  };

  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <p className="text-lg font-semibold text-gray-900">
        {formatValue(value, format)}
      </p>
      <p className="text-sm font-medium text-gray-700 mt-1">{title}</p>
      <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
  );
};

export default OwnerDashboardPage;