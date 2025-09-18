import React from 'react'
import { Package, Plus } from 'lucide-react'

const EmptyState = ({ onCreateTemplate }) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
        <Package className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        No hay plantillas de reglas
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Comienza creando tu primera plantilla de regla para optimizar la gestión de tus negocios.
      </p>
      <div className="mt-6">
        <button
          onClick={onCreateTemplate}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear primera plantilla
        </button>
      </div>
    </div>
  )
}

export default EmptyState