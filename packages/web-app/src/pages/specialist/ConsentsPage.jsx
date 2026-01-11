import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { DocumentTextIcon, ClockIcon, PlusIcon } from '@heroicons/react/24/outline'
import ConsentFormView from '../../components/specialist/consent/ConsentFormView'
import ConsentHistory from '../../components/specialist/consent/ConsentHistory'

const ConsentsPage = () => {
  const [activeTab, setActiveTab] = useState('history') // 'history', 'create'
  const { user } = useSelector(state => state.auth)

  const tabs = [
    {
      id: 'history',
      name: 'Historial',
      icon: ClockIcon,
      description: 'Ver consentimientos firmados'
    },
    {
      id: 'create',
      name: 'Crear Consentimiento',
      icon: PlusIcon,
      description: 'Generar nuevo consentimiento'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">
                Consentimientos Informados
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona los consentimientos de tus pacientes
              </p>
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
            {activeTab === 'history' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Historial de Consentimientos</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Consulta todos los consentimientos firmados por tus pacientes
                  </p>
                </div>
                <ConsentHistory />
              </div>
            )}

            {activeTab === 'create' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Crear Nuevo Consentimiento</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Genera un consentimiento informado para un paciente
                  </p>
                </div>
                <ConsentFormView 
                  onSuccess={() => {
                    // Cambiar a la pestaña de historial después de crear
                    setActiveTab('history')
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsentsPage
