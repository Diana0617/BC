import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { 
  CalendarDaysIcon,
  CheckCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { businessBranchesApi } from '@shared'

const ScheduleConfigSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const { currentBusiness } = useSelector(state => state.business)
  
  // Leer reglas de negocio para verificar si tiene multisucursal
  const businessRules = useSelector(state => state.businessRule?.assignedRules || [])
  const multiBranchRule = businessRules.find(r => r.key === 'MULTISUCURSAL')
  const hasMultiBranch = multiBranchRule?.customValue ?? multiBranchRule?.effective_value ?? multiBranchRule?.defaultValue ?? multiBranchRule?.template?.defaultValue ?? false
  
  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const [schedule, setSchedule] = useState({
    monday: { enabled: true, start: '08:00', end: '18:00' },
    tuesday: { enabled: true, start: '08:00', end: '18:00' },
    wednesday: { enabled: true, start: '08:00', end: '18:00' },
    thursday: { enabled: true, start: '08:00', end: '18:00' },
    friday: { enabled: true, start: '08:00', end: '18:00' },
    saturday: { enabled: true, start: '08:00', end: '17:00' },
    sunday: { enabled: false, start: '08:00', end: '17:00' }
  })
  
  const [isSaving, setIsSaving] = useState(false)

  const dayNames = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  }
  
  const branchColors = [
    { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700' },
    { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-700' },
    { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700' },
    { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700' },
    { bg: 'bg-pink-50', border: 'border-pink-500', text: 'text-pink-700' },
    { bg: 'bg-indigo-50', border: 'border-indigo-500', text: 'text-indigo-700' }
  ]

  // Cargar sucursales cuando se monta el componente
  useEffect(() => {
    if (currentBusiness?.id) {
      loadBranches()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBusiness?.id])

  // Cargar horarios cuando se selecciona una sucursal
  useEffect(() => {
    if (selectedBranch) {
      loadBranchSchedule()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch])

  const loadBranches = useCallback(async () => {
    if (!currentBusiness?.id) return
    
    try {
      setIsLoading(true)
      console.log('🏢 Cargando sucursales para configurar horarios...')
      console.log('📋 currentBusiness:', currentBusiness)
      console.log('🔐 hasMultiBranch:', hasMultiBranch)
      
      const response = await businessBranchesApi.getBranches(currentBusiness.id, {
        isActive: true,
        limit: 50
      })
      
      console.log('📦 Respuesta completa de la API:', response)
      
      // La API devuelve { success: true, data: [...] } donde data es directamente el array
      const branchesData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.branches || response.branches || [])
      console.log('🏪 Sucursales parseadas:', branchesData)
      console.log('📊 Cantidad de sucursales:', branchesData.length)
      
      setBranches(branchesData)
      
      // Si no hay módulo multisucursal o solo hay una sucursal, seleccionarla automáticamente
      if ((!hasMultiBranch || branchesData.length === 1) && branchesData.length > 0) {
        console.log('🔒 Seleccionando sucursal automáticamente:', branchesData[0])
        setSelectedBranch(branchesData[0])
      } else if (branchesData.length === 0) {
        console.log('⚠️ No se encontraron sucursales')
      } else {
        console.log('🔓 Modo multisucursal - esperando selección manual')
      }
    } catch (error) {
      console.error('❌ Error cargando sucursales:', error)
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBusiness?.id, hasMultiBranch])

  const loadBranchSchedule = useCallback(() => {
    if (!selectedBranch) return

    console.log('📅 Cargando horarios de sucursal:', selectedBranch)

    // Si la sucursal tiene businessHours, cargarlos
    if (selectedBranch.businessHours) {
      const hours = selectedBranch.businessHours
      console.log('✅ businessHours encontrados:', hours)
      
      const newSchedule = {}
      Object.keys(schedule).forEach(day => {
        const dayData = hours[day]
        if (dayData) {
          newSchedule[day] = {
            enabled: !dayData.closed && dayData.open && dayData.close,
            start: dayData.open || '08:00',
            end: dayData.close || '18:00'
          }
        } else {
          // Mantener valores por defecto
          newSchedule[day] = schedule[day]
        }
      })
      
      console.log('📋 Horarios cargados:', newSchedule)
      setSchedule(newSchedule)
    } else {
      console.log('⚠️ No hay businessHours guardados, usando valores por defecto')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch])

  const handleDayChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    if (!selectedBranch || !currentBusiness?.id) {
      toast.error('Por favor selecciona una sucursal')
      return
    }

    setIsSaving(true)
    
    try {
      console.log('💾 Guardando horarios de sucursal:', selectedBranch.name)
      
      // Convertir schedule al formato businessHours
      const businessHours = {}
      Object.entries(schedule).forEach(([day, data]) => {
        businessHours[day] = {
          open: data.start,
          close: data.end,
          closed: !data.enabled
        }
      })
      
      console.log('📋 businessHours a guardar:', businessHours)
      
      // Guardar en la API
      await businessBranchesApi.updateBranch(
        currentBusiness.id,
        selectedBranch.id,
        { businessHours }
      )
      
      console.log('✅ Horarios guardados exitosamente')
      
      // Actualizar la sucursal seleccionada con los nuevos datos
      setSelectedBranch(prev => ({
        ...prev,
        businessHours
      }))
      
      // Actualizar en la lista de sucursales
      setBranches(prev => 
        prev.map(branch => 
          branch.id === selectedBranch.id 
            ? { ...branch, businessHours }
            : branch
        )
      )
      
      toast.success('Horarios guardados correctamente')
      
      if (isSetupMode && onComplete) {
        onComplete()
      }
      
    } catch (error) {
      console.error('❌ Error guardando horarios:', error)
      toast.error('Error al guardar los horarios. Por favor intenta nuevamente.')
    } finally {
      setIsSaving(false)
    }
  }

  // Renderizar selector de sucursales
  const renderBranchSelector = () => {
    // No mostrar si solo hay una sucursal y no tiene multisucursal
    if (!hasMultiBranch && branches.length <= 1) {
      return null
    }

    if (isLoading) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-gray-600">Cargando sucursales...</span>
          </div>
        </div>
      )
    }

    if (branches.length === 0) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ No hay sucursales disponibles. Por favor crea una sucursal primero.
          </p>
        </div>
      )
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Sucursal a configurar:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {branches.map((branch, index) => (
            <button
              key={branch.id}
              onClick={() => setSelectedBranch(branch)}
              className={`${
                selectedBranch?.id === branch.id
                  ? `${branchColors[index % branchColors.length].bg} ${branchColors[index % branchColors.length].border} border-2`
                  : 'bg-white border-2 border-gray-200 hover:border-gray-300'
              } p-4 rounded-lg transition-all duration-200 text-left`}
            >
              <div className="flex items-center">
                <BuildingOfficeIcon className={`h-5 w-5 mr-2 ${
                  selectedBranch?.id === branch.id
                    ? branchColors[index % branchColors.length].text
                    : 'text-gray-500'
                }`} />
                <div>
                  <div className={`font-medium ${
                    selectedBranch?.id === branch.id
                      ? branchColors[index % branchColors.length].text
                      : 'text-gray-900'
                  }`}>
                    {branch.name}
                  </div>
                  <div className="text-xs text-gray-500">{branch.code}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CalendarDaysIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            Horarios de Atención
          </h2>
          {isCompleted && !isSetupMode && (
            <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
          )}
        </div>
      </div>

      {/* Selector de Sucursales */}
      {renderBranchSelector()}

      {/* Mostrar contenido solo si hay sucursal seleccionada */}
      {!selectedBranch ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            👆 Selecciona una sucursal para configurar sus horarios
          </p>
        </div>
      ) : (
        <>
          {/* Configuración por día */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Horarios por Día</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {Object.entries(schedule).map(([day, config]) => (
            <div key={day} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => handleDayChange(day, 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm font-medium text-gray-900 w-20">
                    {dayNames[day]}
                  </span>
                </div>
                
                {config.enabled && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Desde:</span>
                      <input
                        type="time"
                        value={config.start}
                        onChange={(e) => handleDayChange(day, 'start', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Hasta:</span>
                      <input
                        type="time"
                        value={config.end}
                        onChange={(e) => handleDayChange(day, 'end', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                )}
                
                {!config.enabled && (
                  <span className="text-sm text-gray-500">Cerrado</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón guardar */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </div>
          ) : (
            'Guardar Horarios'
          )}
        </button>
      </div>

      {/* Mensaje de ayuda en modo setup */}
      {isSetupMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Paso 4 de la configuración:</strong> Define los horarios de atención de tu negocio. 
            La duración de cada procedimiento se configura al crear el servicio.
          </p>
        </div>
      )}
        </>
      )}
    </div>
  )
}

export default ScheduleConfigSection