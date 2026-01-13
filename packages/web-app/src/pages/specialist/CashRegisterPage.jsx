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
import CashRegisterMovementsUnified from '../../components/specialist/cash-register/CashRegisterMovementsUnified'

const CashRegisterPage = () => {
  const [activeTab, setActiveTab] = useState('summary') // 'summary', 'movements', 'open', 'close'
  const [activeCashRegister, setActiveCashRegister] = useState(null)
  const [shiftData, setShiftData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user, token } = useSelector(state => state.auth)

  const checkActiveCashRegister = useCallback(async () => {
    if (!token || !user?.businessId) return;
    
    try {
      setLoading(true)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cash-register/active-shift?businessId=${user.businessId}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.ok) {
        const result = await response.json()
        // El endpoint devuelve { success: true, data: { hasActiveShift: true, shift: {...} } }
        const shift = result?.data?.shift || null
        setActiveCashRegister(shift)
        
        // Si hay caja activa, mostrar movimientos por defecto
        if (shift) {
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

  const loadShiftData = useCallback(async () => {
    if (!activeCashRegister?.id || !token || !user?.businessId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cash-register/shift/${activeCashRegister.id}?businessId=${user.businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('Shift data loaded:', result.data);
        setShiftData(result.data);
      }
    } catch (error) {
      console.error('Error loading shift data:', error);
    }
  }, [activeCashRegister?.id, token, user?.businessId]);

  useEffect(() => {
    if (activeTab === 'close' && activeCashRegister) {
      loadShiftData();
    }
  }, [activeTab, activeCashRegister, loadShiftData]);

  const handleCashRegisterOpened = () => {
    checkActiveCashRegister()
  }

  const handleCashRegisterClosed = () => {
    setActiveCashRegister(null)
    setShiftData(null)
    setActiveTab('summary')
    checkActiveCashRegister()
  }

  const tabs = [
    {
      id: 'movements',
      name: 'Movimientos',
      icon: BanknotesIcon,
      description: 'Ver resumen y registrar movimientos',
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Caja Registradora
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Gestiona tu caja diaria, movimientos y cierres de turno
              </p>
            </div>
            <div className="flex flex-row sm:flex-col gap-2 sm:items-end">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800 whitespace-nowrap">
                {user?.firstName} {user?.lastName}
              </span>
              {activeCashRegister && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 whitespace-nowrap">
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
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 px-4 sm:px-6" aria-label="Tabs">
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
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap
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
                        -ml-0.5 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5
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
            {activeTab === 'movements' && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Gestión de Caja</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Resumen, turnos pendientes y movimientos de tu caja actual
                  </p>
                </div>
                <CashRegisterMovementsUnified 
                  shiftId={activeCashRegister?.id}
                  onMovementAdded={() => {
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
                <CashRegisterOpening 
                  specialistId={user?.id}
                  businessId={user?.businessId}
                  token={token}
                  onSuccess={handleCashRegisterOpened} 
                />
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
                  shiftId={activeCashRegister?.id}
                  shiftData={shiftData}
                  onSuccess={handleCashRegisterClosed}
                  onCancel={() => setActiveTab('movements')}
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
