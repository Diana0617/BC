import React, { useState, useEffect } from 'react'
import { X, Eye, Users, Building2, Calendar, TrendingUp, BarChart3, Activity, Clock } from 'lucide-react'
import useRuleTemplates from '../../../../../../shared/src/hooks/useRuleTemplates'

const ViewTemplateModal = ({ isOpen, onClose, template }) => {
  const { loadTemplateDetails } = useRuleTemplates()
  
  const [templateData, setTemplateData] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ================================
  // EFFECTS
  // ================================
  
  useEffect(() => {
    if (isOpen && template?.id) {
      loadDetails()
    }
    
    if (!isOpen) {
      // Reset state when modal closes
      setTemplateData(null)
      setStats(null)
      setError(null)
    }
  }, [isOpen, template?.id])

  const loadDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await loadTemplateDetails(template.id)
      console.log('Template data received:', data) // Debug log
      
      if (data && data.template) {
        setTemplateData(data.template)
        setStats(data.stats)
      } else {
        console.error('Invalid data structure received:', data)
        setError('No se pudieron cargar los detalles de la plantilla')
      }
    } catch (err) {
      console.error('Error loading template details:', err)
      setError(`Error al cargar los detalles: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ================================
  // CONSTANTS
  // ================================
  
  const categoryLabels = {
    'PAYMENT_POLICY': 'Política de Pago',
    'CANCELLATION_POLICY': 'Política de Cancelación',
    'BOOKING_POLICY': 'Política de Reservas',
    'SERVICE_POLICY': 'Política de Servicios',
    'SCHEDULING_POLICY': 'Política de Horarios',
    'CUSTOMER_POLICY': 'Política de Clientes',
    'PROMOTIONAL_POLICY': 'Política Promocional',
    'OPERATIONAL_POLICY': 'Política Operacional'
  }

  const businessTypeLabels = {
    'BEAUTY_SALON': 'Salón de Belleza',
    'BARBERSHOP': 'Barbería',
    'SPA': 'Spa',
    'NAIL_SALON': 'Salón de Uñas',
    'MEDICAL_SPA': 'Spa Médico',
    'FITNESS_CENTER': 'Centro de Fitness',
    'MASSAGE_CENTER': 'Centro de Masajes',
    'AESTHETICS_CENTER': 'Centro de Estética'
  }

  // ================================
  // RENDER
  // ================================
  
  if (!isOpen) return null

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
            <div className="flex items-center">
              <Eye className="h-6 w-6 text-indigo-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">
                Vista Previa de Plantilla
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Cargando detalles...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Content */}
          {templateData && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Información General</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Nombre
                      </label>
                      <p className="text-lg font-semibold text-gray-900">{templateData.name}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Categoría
                      </label>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {categoryLabels[templateData.category] || templateData.category}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Descripción
                      </label>
                      <p className="text-gray-700">{templateData.description || 'Sin descripción'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Clave de Regla
                      </label>
                      <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded border">
                        {templateData.ruleKey}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Estado
                      </label>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        templateData.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {templateData.isActive ? 'Activa' : 'Inactiva'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rule Configuration */}
                {templateData.ruleValue && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Configuración de la Regla</h4>
                    
                    <div className="space-y-3">
                      {templateData.ruleValue.description && (
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Descripción Técnica
                          </label>
                          <p className="text-gray-700">{templateData.ruleValue.description}</p>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Habilitada por Defecto
                        </label>
                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          templateData.ruleValue.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {templateData.ruleValue.enabled ? 'Sí' : 'No'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Configuración JSON
                        </label>
                        <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                          {JSON.stringify(templateData.ruleValue, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Compatibility */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Compatibilidad</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Tipos de Negocio
                      </label>
                      {templateData.businessTypes && templateData.businessTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {templateData.businessTypes.map((type) => (
                            <span key={type} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {businessTypeLabels[type] || type}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Todos los tipos de negocio</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Planes Compatibles
                      </label>
                      {templateData.planTypes && templateData.planTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {templateData.planTypes.map((planType) => (
                            <span key={planType} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {planType}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Todos los planes</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                {stats && (
                  <>
                    {/* Usage Stats */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Estadísticas de Uso</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 text-blue-500 mr-2" />
                            <span className="text-sm text-gray-600">Total Asignaciones</span>
                          </div>
                          <span className="text-lg font-semibold text-gray-900">{stats.totalAssignments}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Activity className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-gray-600">Asignaciones Activas</span>
                          </div>
                          <span className="text-lg font-semibold text-green-600">{stats.activeAssignments}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Building2 className="h-5 w-5 text-purple-500 mr-2" />
                            <span className="text-sm text-gray-600">Negocios Usando</span>
                          </div>
                          <span className="text-lg font-semibold text-gray-900">{stats.businessesUsingTemplate}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <BarChart3 className="h-5 w-5 text-orange-500 mr-2" />
                            <span className="text-sm text-gray-600">Reglas Efectivas</span>
                          </div>
                          <span className="text-lg font-semibold text-gray-900">{stats.effectiveRules}</span>
                        </div>
                      </div>

                      {/* Usage Rate Progress */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Tasa de Uso</span>
                          <span className="text-sm font-semibold text-gray-900">{stats.usageRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.usageRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h4>
                      
                      <div className="space-y-4">
                        {stats.lastUsed && (
                          <div>
                            <div className="flex items-center mb-1">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">Último Uso</span>
                            </div>
                            <p className="text-sm text-gray-900 ml-6">
                              {new Date(stats.lastUsed).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}

                        {stats.averagePriority && (
                          <div>
                            <div className="flex items-center mb-1">
                              <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">Prioridad Promedio</span>
                            </div>
                            <p className="text-sm text-gray-900 ml-6">{stats.averagePriority}</p>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center mb-1">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Creada</span>
                          </div>
                          <p className="text-sm text-gray-900 ml-6">
                            {new Date(templateData.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>

                        {templateData.updatedAt && templateData.updatedAt !== templateData.createdAt && (
                          <div>
                            <div className="flex items-center mb-1">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">Última Actualización</span>
                            </div>
                            <p className="text-sm text-gray-900 ml-6">
                              {new Date(templateData.updatedAt).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Creator Info */}
                {templateData.creator && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Creador</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 font-medium">
                        {templateData.creator.firstName} {templateData.creator.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{templateData.creator.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
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

export default ViewTemplateModal