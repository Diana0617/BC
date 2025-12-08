import React from 'react'
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useRuleTemplates } from '@shared/hooks'

const DeleteTemplateModal = ({ isOpen, template, onClose }) => {
  const { removeTemplate, loading } = useRuleTemplates()

  // ================================
  // HANDLERS
  // ================================
  
  const handleDelete = async () => {
    if (!template) return
    
    const success = await removeTemplate(template.id)
    if (success) {
      toast.success('Plantilla eliminada exitosamente')
      onClose()
    } else {
      toast.error('Error al eliminar plantilla')
    }
  }

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

  // ================================
  // RENDER
  // ================================
  
  if (!isOpen || !template) return null

  const hasUsage = template.usageCount > 0
  const isHighUsage = template.usageCount >= 10

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Eliminar Plantilla de Regla
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ¿Estás seguro de que deseas eliminar esta plantilla?
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg text-left">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Nombre:</span>
                  <p className="text-sm text-gray-900">{template.name}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Categoría:</span>
                  <p className="text-sm text-gray-900">{getCategoryLabel(template.category)}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Clave:</span>
                  <p className="text-sm font-mono text-gray-900">{template.ruleKey}</p>
                </div>
                
                {template.usageCount > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Usos actuales:</span>
                    <p className="text-sm text-gray-900">
                      {template.usageCount} {template.usageCount === 1 ? 'negocio' : 'negocios'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Warning */}
            {hasUsage && (
              <div className={`mb-4 p-4 rounded-lg ${
                isHighUsage 
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className={`h-5 w-5 ${
                      isHighUsage ? 'text-red-400' : 'text-yellow-400'
                    }`} />
                  </div>
                  <div className="ml-3 text-left">
                    <h3 className={`text-sm font-medium ${
                      isHighUsage ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {isHighUsage ? 'Advertencia crítica' : 'Advertencia'}
                    </h3>
                    <div className={`mt-2 text-sm ${
                      isHighUsage ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      <p>
                        Esta plantilla está siendo utilizada en <strong>{template.usageCount}</strong> {template.usageCount === 1 ? 'negocio' : 'negocios'}. 
                        Al eliminarla:
                      </p>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        <li>Se removerá de todos los negocios que la utilizan</li>
                        <li>Las reglas asociadas podrían dejar de funcionar</li>
                        <li>Esta acción no se puede deshacer</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-6">
              Esta acción no se puede deshacer. La plantilla será eliminada permanentemente.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading.delete}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading.delete}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isHighUsage
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              {loading.delete ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {hasUsage ? 'Eliminar de todos modos' : 'Eliminar plantilla'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteTemplateModal