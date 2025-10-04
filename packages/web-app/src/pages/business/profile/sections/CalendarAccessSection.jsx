import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  LinkIcon,
  ShareIcon,
  UserGroupIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

const CalendarAccessSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const { currentBusiness } = useSelector(state => state.business)

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarData, setCalendarData] = useState([])
  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Colores para las sucursales
  const branchColors = useMemo(() => [
    { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
    { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
    { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
    { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800' },
    { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
    { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800' }
  ], [])

  const loadBranches = async () => {
    try {
      // TODO: Implementar llamada a API de sucursales
      // const response = await api.get(`/business/${currentBusiness.id}/branches`)
      // setBranches(response.data)

      // Datos de ejemplo por ahora
      setBranches([
        { id: 1, name: 'Sucursal Centro', code: 'CENTRO' },
        { id: 2, name: 'Sucursal Norte', code: 'NORTE' },
        { id: 3, name: 'Sucursal Sur', code: 'SUR' }
      ])
    } catch (error) {
      console.error('Error cargando sucursales:', error)
    }
  }

  const loadCalendarData = useCallback(async () => {
    setIsLoading(true)
    try {
      // TODO: Implementar llamada a API de calendario
      // const response = await api.get(`/business/${currentBusiness.id}/calendar`, {
      //   params: { month: currentMonth.getMonth() + 1, year: currentMonth.getFullYear() }
      // })

      // Datos de ejemplo por ahora - generar datos inline para evitar dependencias circulares
      const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
      const data = []

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        const dayOfWeek = date.getDay() // 0 = Domingo, 1 = Lunes, etc.

        // Solo mostrar días laborables (Lunes a Sábado)
        if (dayOfWeek !== 0) {
          const dayData = {
            date: day,
            dayOfWeek,
            branches: []
          }

          // Agregar horarios por sucursal
          branches.forEach((branch, index) => {
            // Simular que algunas sucursales no trabajan todos los días
            if (Math.random() > 0.3) {
              dayData.branches.push({
                branchId: branch.id,
                branchName: branch.name,
                startTime: '08:00',
                endTime: '18:00',
                colorIndex: index % branchColors.length
              })
            }
          })

          data.push(dayData)
        }
      }

      setCalendarData(data)
    } catch (error) {
      console.error('Error cargando datos del calendario:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentMonth, branches, branchColors])

  // Cargar sucursales cuando cambia el negocio
  useEffect(() => {
    if (currentBusiness?.id) {
      loadBranches()
    }
  }, [currentBusiness])

  // Cargar datos del calendario cuando cambian las sucursales o el mes
  useEffect(() => {
    if (currentBusiness?.id && branches.length > 0) {
      loadCalendarData()
    }
  }, [currentBusiness, branches, currentMonth, loadCalendarData])

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
  }

  const getDayName = (dayOfWeek) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    return days[dayOfWeek]
  }

  const getMonthName = (date) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    return months[date.getMonth()]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <CalendarDaysIcon className="h-8 w-8 text-blue-600 mr-3" />
          Calendario y Acceso a Clientes
        </h2>
        <p className="mt-2 text-gray-600">
          Visualiza tus horarios por sucursal y configura el acceso de tus clientes a la agenda online.
        </p>
      </div>

      {/* Vista del Calendario */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-2" />
            Vista del Calendario
          </h3>

          {/* Navegación del mes */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>

            <span className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
              {getMonthName(currentMonth)} {currentMonth.getFullYear()}
            </span>

            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Leyenda de colores */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Sucursales:</h4>
          <div className="flex flex-wrap gap-3">
            {branches.map((branch, index) => (
              <div key={branch.id} className="flex items-center">
                <div className={`w-4 h-4 rounded ${branchColors[index % branchColors.length].bg} border ${branchColors[index % branchColors.length].border} mr-2`} />
                <span className="text-sm text-gray-600">{branch.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendario */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando calendario...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {calendarData.map((dayData, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold text-gray-900">{dayData.date}</span>
                  <span className="text-sm text-gray-500">{getDayName(dayData.dayOfWeek)}</span>
                </div>

                <div className="space-y-2">
                  {dayData.branches.map((branchSchedule, branchIndex) => (
                    <div
                      key={branchIndex}
                      className={`p-2 rounded-md border ${branchColors[branchSchedule.colorIndex].bg} ${branchColors[branchSchedule.colorIndex].border}`}
                    >
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        {branchSchedule.branchName}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {branchSchedule.startTime} - {branchSchedule.endTime}
                      </div>
                    </div>
                  ))}

                  {dayData.branches.length === 0 && (
                    <div className="text-xs text-gray-400 italic text-center py-2">
                      Sin horarios
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección de Acceso a Clientes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center mb-6">
          <UserGroupIcon className="h-6 w-6 text-green-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Acceso de Clientes a la Agenda
          </h3>
        </div>

        <div className="space-y-6">
          {/* Estado actual */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                ✅ Tu agenda está disponible online
              </span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              Los clientes pueden acceder a tu agenda a través del enlace público.
            </p>
          </div>

          {/* Cómo compartir el enlace */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <ShareIcon className="h-5 w-5 text-blue-600 mr-2" />
              Cómo compartir tu agenda con clientes
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Método 1: Enlace directo */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <LinkIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">Enlace directo</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Comparte este enlace único con tus clientes para que puedan agendar citas online.
                </p>
                <div className="bg-gray-50 rounded p-3">
                  <code className="text-xs text-gray-800 break-all">
                    https://app.beautycontrol.com/book/{currentBusiness?.code || 'TU_CODIGO'}
                  </code>
                </div>
                <button className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Copiar enlace
                </button>
              </div>

              {/* Método 2: Código QR */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <EyeIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-gray-900">Código QR</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Imprime o muestra este código QR en tu local para que los clientes puedan escanearlo.
                </p>
                <div className="bg-gray-50 rounded p-4 flex items-center justify-center h-24">
                  <div className="text-xs text-gray-500">Código QR aquí</div>
                </div>
                <button className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                  Descargar QR
                </button>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-blue-800 mb-1">
                  Información importante
                </h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Los clientes solo verán los horarios disponibles según la sucursal seleccionada</li>
                  <li>• Las citas se confirman automáticamente y se envía confirmación por email</li>
                  <li>• Puedes gestionar todas las citas desde la sección "Gestión de Turnos"</li>
                  <li>• Los clientes pueden cancelar o modificar citas hasta 24 horas antes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de completar setup */}
      {isSetupMode && (
        <div className="flex justify-end">
          <button
            onClick={onComplete}
            disabled={isCompleted}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isCompleted
                ? 'bg-green-600 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isCompleted ? 'Completado' : 'Marcar como completado'}
          </button>
        </div>
      )}
    </div>
  )
}

export default CalendarAccessSection