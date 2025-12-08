import React from 'react'
import { Edit, Trash2, Eye, Tag, Calendar, BarChart3, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const RuleTemplateCard = ({ template, onEdit, onDelete, onView, loading = false }) => {
  // ================================
  // UTILS
  // ================================
  
  const getCategoryColor = (category) => {
    const colors = {
      'PAYMENT_POLICY': 'bg-blue-100 text-blue-800',
      'CANCELLATION_POLICY': 'bg-red-100 text-red-800', 
      'BOOKING_POLICY': 'bg-green-100 text-green-800',
      'SERVICE_POLICY': 'bg-purple-100 text-purple-800',
      'SCHEDULING_POLICY': 'bg-yellow-100 text-yellow-800',
      'CUSTOMER_POLICY': 'bg-indigo-100 text-indigo-800',
      'PROMOTIONAL_POLICY': 'bg-pink-100 text-pink-800',
      'OPERATIONAL_POLICY': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: es 
      })
    } catch {
      return 'N/A'
    }
  }

  // ================================
  // HANDLERS
  // ================================
  
  const handleEdit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(template)
  }

  const handleDelete = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete?.(template)
  }

  const handleView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onView?.(template)
  }

  // ================================
  // RENDER
  // ================================
  
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {template.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {template.description}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className="ml-4 flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              template.isActive 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {template.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>

        {/* Category Tag */}
        <div className="mt-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
            <Tag className="w-3 h-3 mr-1" />
            {getCategoryLabel(template.category)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {/* Rule Key */}
        <div className="mb-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Clave de Regla
          </span>
          <p className="mt-1 text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
            {template.ruleKey}
          </p>
        </div>

        {/* Meta Information */}
        <div className="space-y-2">
          {/* Business Types */}
          {template.businessTypes && template.businessTypes.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {template.businessTypes.join(', ')}
              </span>
            </div>
          )}

          {/* Usage Count */}
          <div className="flex items-center text-sm text-gray-500">
            <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {template.usageCount || 0} {template.usageCount === 1 ? 'uso' : 'usos'}
            </span>
          </div>

          {/* Last Updated */}
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              Actualizada {formatDate(template.updatedAt)}
            </span>
          </div>
        </div>

        {/* Rule Preview */}
        {template.ruleDefinition && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Definición
            </span>
            <p className="mt-1 text-sm text-gray-600 line-clamp-3">
              {typeof template.ruleDefinition === 'string' 
                ? template.ruleDefinition 
                : template.ruleDefinition.description || 'Sin descripción'}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleView}
            disabled={loading}
            className="inline-flex items-center px-2 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Ver detalles"
          >
            <Eye className="w-3 h-3" />
          </button>

          <button
            onClick={handleEdit}
            disabled={loading}
            className="inline-flex items-center px-2 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Editar plantilla"
          >
            <Edit className="w-3 h-3" />
          </button>
          
          <button
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center px-2 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Eliminar plantilla"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default RuleTemplateCard