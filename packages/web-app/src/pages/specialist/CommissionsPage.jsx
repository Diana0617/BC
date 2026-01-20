import  { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ChartBarIcon, ClockIcon, DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import CommissionDetailView from '../../components/specialist/commissions/CommissionDetailView'
import CommissionHistoryList from '../../components/specialist/commissions/CommissionHistoryList'
import CommissionRequestForm from '../../components/specialist/commissions/CommissionRequestForm'

const CommissionsPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('detail') // 'detail', 'history', 'request'
  const { user } = useSelector(state => state.auth)

  console.log('🟣 CommissionsPage - Usuario:', user)
  console.log('🟣 CommissionsPage - specialistId:', user?.id, 'businessId:', user?.businessId)

  const tabs = [
    {
      id: 'detail',
      name: 'Detalle de Comisiones',
      icon: ChartBarIcon,
      description: 'Ver comisiones del período actual'
    },
    {
      id: 'history',
      name: 'Historial',
      icon: ClockIcon,
      description: 'Ver historial completo de comisiones'
    },
    {
      id: 'request',
      name: 'Solicitar Pago',
      icon: DocumentTextIcon,
      description: 'Crear solicitud de pago de comisiones'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/specialist/dashboard')}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Volver
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Sistema de Comisiones
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Gestiona tus comisiones, historial y solicitudes de pago
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      ${activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    `}
                  >
                    <Icon
                      className={`
                        ${activeTab === tab.id ? 'text-purple-500' : 'text-gray-400 group-hover:text-gray-500'}
                        -ml-0.5 mr-2 h-5 w-5
                      `}
                      aria-hidden="true"
                    />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'detail' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Comisiones del Período Actual</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Revisa el detalle de tus comisiones por servicios y ventas
                  </p>
                </div>
                <CommissionDetailView 
                  specialistId={user?.id} 
                  businessId={user?.businessId}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Historial de Comisiones</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Consulta el historial completo de tus comisiones pagadas
                  </p>
                </div>
                <CommissionHistoryList 
                  specialistId={user?.id} 
                  businessId={user?.businessId} 
                />
              </div>
            )}

            {activeTab === 'request' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Solicitar Pago de Comisiones</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Crea una solicitud de pago para tus comisiones acumuladas
                  </p>
                </div>
                <CommissionRequestForm 
                  specialistId={user?.id}
                  businessId={user?.businessId}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommissionsPage
