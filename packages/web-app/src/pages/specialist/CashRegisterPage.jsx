import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { 
  BanknotesIcon, 
  ClockIcon, 
  ChartBarIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowLeftEndOnRectangleIcon
} from '@heroicons/react/24/outline'
import CashRegisterOpening from '../../components/specialist/cash-register/CashRegisterOpening'
import CashRegisterClosing from '../../components/specialist/cash-register/CashRegisterClosing'
import CashRegisterMovements from '../../components/specialist/cash-register/CashRegisterMovements'
import CashRegisterSummary from '../../components/specialist/cash-register/CashRegisterSummary'

const CashRegisterPage = () => {
  const [activeTab, setActiveTab] = useState('summary') // 'summary', 'movements', 'open', 'close'
  const [activeCashRegister, setActiveCashRegister] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user, token } = useSelector(state => state.auth)

  const checkActiveCashRegister = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cash-registers/active`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setActiveCashRegister(data)
        
        // Si hay caja activa, mostrar movimientos por defecto
        if (data) {
          setActiveTab('movements')
        }
      } else {
        setActiveCashRegister(null)
      }
    } catch (error) {
      console.error('Error checking active cash register:', error)
      setActiveCashRegister(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    checkActiveCashRegister()
  }, [checkActiveCashRegister])

  const handleCashRegisterOpened = () => {
    checkActiveCashRegister()
  }

  const handleCashRegisterClosed = () => {
    setActiveCashRegister(null)
    setActiveTab('summary')
    checkActiveCashRegister()
  }

  const tabs = [
    {
      id: 'summary',
      name: 'Resumen',
      icon: ChartBarIcon,
      description: 'Ver resumen de cajas',
      disabled: false
    },
    {
      id: 'movements',
      name: 'Movimientos',
      icon: BanknotesIcon,
      description: 'Registrar ingresos/egresos',
      disabled: !activeCashRegister
    },
    {
      id: 'open',
      name: 'Abrir Caja',
      icon: ArrowRightStartOnRectangleIcon,
      description: 'Iniciar turno',
      disabled: activeCashRegister !== null
    },
    {
      id: 'close',
      name: 'Cerrar Caja',
      icon: ArrowLeftEndOnRectangleIcon,
      description: 'Finalizar turno',
      disabled: !activeCashRegister
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">
                Caja Registradora
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona tu caja diaria, movimientos y cierres de turno
              </p>
            </div>
            <div className="mt-4 flex flex-col items-end md:mt-0 md:ml-4 space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                {user?.firstName} {user?.lastName}
              </span>
              {activeCashRegister && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                  Caja Activa
                </span>
              )}
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
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`
                      ${activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : tab.disabled
                          ? 'border-transparent text-gray-300 cursor-not-allowed'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    `}
                  >
                    <Icon
                      className={`
                        ${activeTab === tab.id 
                          ? 'text-purple-500' 
                          : tab.disabled 
                            ? 'text-gray-300' 
                            : 'text-gray-400 group-hover:text-gray-500'
                        }
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
            {activeTab === 'summary' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Resumen de Cajas</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Estadísticas y resumen de tus movimientos de caja
                  </p>
                </div>
                <CashRegisterSummary />
              </div>
            )}

            {activeTab === 'movements' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Movimientos de Caja</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Registra ingresos y egresos de tu caja actual
                  </p>
                </div>
                <CashRegisterMovements 
                  cashRegisterId={activeCashRegister?.id}
                  onMovementAdded={() => {
                    // Refrescar datos si es necesario
                    checkActiveCashRegister()
                  }}
                />
              </div>
            )}

            {activeTab === 'open' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Abrir Caja</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Inicia tu turno con el conteo de efectivo inicial
                  </p>
                </div>
                <CashRegisterOpening onSuccess={handleCashRegisterOpened} />
              </div>
            )}

            {activeTab === 'close' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Cerrar Caja</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Finaliza tu turno con el conteo final y arqueo de caja
                  </p>
                </div>
                <CashRegisterClosing 
                  cashRegisterId={activeCashRegister?.id}
                  onSuccess={handleCashRegisterClosed}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CashRegisterPage
