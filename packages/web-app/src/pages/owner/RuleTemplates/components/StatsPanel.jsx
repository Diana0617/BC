import React from 'react'
import { X, BarChart3, TrendingUp, Users, Package, Activity } from 'lucide-react'

const StatsPanel = ({ isOpen, stats, onClose }) => {
  // ================================
  // UTILS
  // ================================
  
  const getCategoryLabel = (category) => {
    const labels = {
      'PAYMENT_POLICY': 'Política de Pago',
      'CANCELLATION_POLICY': 'Política de Cancelación',
      'BOOKING_POLICY': 'Política de Reservas',
      'SERVICE_POLICY': 'Política de Servicios',
      'SCHEDULING_POLICY': 'Política de Horarios',
      'CUSTOMER_POLICY': 'Política de Clientes',
      'PROMOTIONAL_POLICY': 'Política Promocional',
      'OPERATIONAL_POLICY': 'Política Operacional'
    }
    return labels[category] || category
  }

  const getBusinessTypeLabel = (type) => {
    const labels = {
      'BEAUTY_SALON': 'Salón de Belleza',
      'BARBERSHOP': 'Barbería',
      'SPA': 'Spa',
      'NAIL_SALON': 'Salón de Uñas',
      'MEDICAL_SPA': 'Spa Médico',
      'FITNESS_CENTER': 'Centro de Fitness',
      'MASSAGE_CENTER': 'Centro de Masajes',
      'AESTHETICS_CENTER': 'Centro de Estética'
    }
    return labels[type] || type
  }

  const formatPercentage = (value, total) => {
    if (!total || total === 0) return '0%'
    return `${Math.round((value / total) * 100)}%`
  }

  // ================================
  // RENDER
  // ================================
  
  if (!isOpen || !stats) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Estadísticas de Plantillas de Reglas
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Plantillas</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalTemplates || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Plantillas Activas</p>
                  <p className="text-2xl font-bold text-green-900">{stats.activeTemplates || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Total Usos</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.totalUsage || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600">Promedio por Plantilla</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stats.totalTemplates ? Math.round((stats.totalUsage || 0) / stats.totalTemplates) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categories Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
                Plantillas por Categoría
              </h4>
              
              {stats.categoriesStats && stats.categoriesStats.length > 0 ? (
                <div className="space-y-4">
                  {stats.categoriesStats.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {getCategoryLabel(category.category)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {category.count} ({formatPercentage(category.count, stats.totalTemplates)})
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.max(5, (category.count / Math.max(stats.totalTemplates, 1)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay datos de categorías disponibles
                </p>
              )}
            </div>

            {/* Business Types Stats */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-500" />
                Plantillas por Tipo de Negocio
              </h4>
              
              {stats.businessTypesStats && stats.businessTypesStats.length > 0 ? (
                <div className="space-y-4">
                  {stats.businessTypesStats.map((businessType) => (
                    <div key={businessType.businessType} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {getBusinessTypeLabel(businessType.businessType)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {businessType.count}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.max(5, (businessType.count / Math.max(stats.totalTemplates, 1)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay datos de tipos de negocio disponibles
                </p>
              )}
            </div>
          </div>

          {/* Usage Analysis */}
          {stats.totalUsage > 0 && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Análisis de Uso
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatPercentage(stats.activeTemplates || 0, stats.totalTemplates || 0)}
                  </p>
                  <p className="text-sm text-gray-600">Plantillas Activas</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {stats.totalUsage || 0}
                  </p>
                  <p className="text-sm text-gray-600">Usos Totales</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalTemplates ? Math.round((stats.totalUsage || 0) / stats.totalTemplates) : 0}
                  </p>
                  <p className="text-sm text-gray-600">Promedio por Plantilla</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsPanel