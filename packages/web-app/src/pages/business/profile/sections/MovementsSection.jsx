import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchFinancialMovements,
  fetchTodayAppointmentsSummary,
  selectMovements,
  selectMovementsLoading,
  selectMovementsTotals,
  selectTodayAppointmentsSummary,
  selectTodayAppointmentsSummaryLoading,
  // Expenses
  fetchExpenses,
  fetchExpenseCategories,
  createExpense,
  updateExpense,
  selectExpenses,
  selectExpenseCategories,
  selectExpensesLoading,
  deleteExpense,
  approveExpense,
  markExpenseAsPaid,
  // Commissions
  fetchSpecialistsSummary,
  fetchCommissionConfig,
  fetchSpecialistDetails,
  registerCommissionPayment,
  selectSpecialists,
  selectCommissionConfig,
  selectCommissionsLoading,
  selectSpecialistDetails,
  // Pagination
  usePagination,
  PAGINATION
} from '@shared'
import ExpensesTab from '../../../../components/business/profile/ExpensesTab'
import CommissionsTab from '../../../../components/business/profile/CommissionsTab'
import ExpenseFormModal from '../../../../components/business/profile/ExpenseFormModal'
import CommissionPaymentModal from '../../../../components/business/profile/CommissionPaymentModal'
import PaginationControls from '../../../../components/common/PaginationControls'
import {
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  ReceiptPercentIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { exportMovementsToExcel, exportPaymentMethodBalanceToExcel } from '../../../../utils/excelExport'

const MovementsSection = () => {
  const dispatch = useDispatch()
  const { currentBusiness } = useSelector(state => state.business)
  
  // Redux state
  const movements = useSelector(selectMovements)
  const movementsLoading = useSelector(selectMovementsLoading)
  const movementsTotals = useSelector(selectMovementsTotals)
  const todayAppointments = useSelector(selectTodayAppointmentsSummary)
  const todayAppointmentsLoading = useSelector(selectTodayAppointmentsSummaryLoading)
  const expenses = useSelector(selectExpenses)
  const expenseCategories = useSelector(selectExpenseCategories)
  const expensesLoading = useSelector(selectExpensesLoading)
  const specialists = useSelector(selectSpecialists)
  const commissionConfig = useSelector(selectCommissionConfig)
  const commissionsLoading = useSelector(selectCommissionsLoading)
  const selectedSpecialistDetails = useSelector(selectSpecialistDetails)

  // Local state
  const [activeTab, setActiveTab] = useState('financial') // 'financial', 'appointments', 'expenses', 'commissions'
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })
  const [expenseFilters, setExpenseFilters] = useState({})
  const [commissionFilters, setCommissionFilters] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  })
  
  // Modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [selectedSpecialistForPayment, setSelectedSpecialistForPayment] = useState(null)
  const [selectedSpecialistPaymentDetails, setSelectedSpecialistPaymentDetails] = useState(null)

  // Cargar datos cuando cambia la pestaña o las fechas
  useEffect(() => {
    if (!currentBusiness?.id) return

    if (activeTab === 'financial') {
      dispatch(fetchFinancialMovements({
        businessId: currentBusiness.id,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }))
    } else if (activeTab === 'appointments') {
      dispatch(fetchTodayAppointmentsSummary({
        businessId: currentBusiness.id,
        date: dateRange.startDate
      }))
    } else if (activeTab === 'expenses') {
      dispatch(fetchExpenses({
        businessId: currentBusiness.id,
        branchId: expenseFilters.branchId || undefined,
        filters: {
          ...expenseFilters,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      }))
      dispatch(fetchExpenseCategories({ businessId: currentBusiness.id }))
    } else if (activeTab === 'commissions') {
      dispatch(fetchSpecialistsSummary({
        businessId: currentBusiness.id,
        month: commissionFilters.month + 1,
        year: commissionFilters.year
      }))
      dispatch(fetchCommissionConfig({ businessId: currentBusiness.id }))
    }
  }, [activeTab, dateRange, currentBusiness, dispatch, expenseFilters, commissionFilters])

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  // Expense handlers
  const handleCreateExpense = () => {
    setSelectedExpense(null)
    setShowExpenseModal(true)
  }

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense)
    setShowExpenseModal(true)
  }

  const handleExpenseSubmit = async (expenseData, expenseId) => {
    try {
      if (expenseId) {
        await dispatch(updateExpense({ 
          businessId: currentBusiness.id, 
          expenseId, 
          expenseData 
        })).unwrap()
      } else {
        await dispatch(createExpense({ 
          businessId: currentBusiness.id, 
          expenseData 
        })).unwrap()
      }
      
      setShowExpenseModal(false)
      setSelectedExpense(null)
      
      // Reload expenses
      dispatch(fetchExpenses({
        businessId: currentBusiness.id,
        branchId: expenseFilters.branchId || undefined,
        filters: {
          ...expenseFilters,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      }))
    } catch (error) {
      console.error('Error saving expense:', error)
      throw error
    }
  }

  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('¿Estás seguro de eliminar este gasto?')) {
      dispatch(deleteExpense({ businessId: currentBusiness.id, expenseId }))
    }
  }

  const handleApproveExpense = (expenseId) => {
    dispatch(approveExpense({ businessId: currentBusiness.id, expenseId, status: 'approved' }))
  }

  const handleMarkAsPaid = (expenseId) => {
    dispatch(markExpenseAsPaid({ businessId: currentBusiness.id, expenseId }))
  }

  // Commission handlers
  const handleViewSpecialistDetails = (specialistId) => {
    dispatch(fetchSpecialistDetails({
      businessId: currentBusiness.id,
      specialistId,
      month: commissionFilters.month + 1,
      year: commissionFilters.year
    }))
  }

  const handlePayCommission = (specialist, details) => {
    setSelectedSpecialistForPayment(specialist)
    setSelectedSpecialistPaymentDetails(details)
    setShowCommissionModal(true)
  }

  const handleCommissionPaymentSubmit = async (paymentData) => {
    try {
      await dispatch(registerCommissionPayment({
        businessId: currentBusiness.id,
        paymentData
      })).unwrap()
      
      setShowCommissionModal(false)
      setSelectedSpecialistForPayment(null)
      setSelectedSpecialistPaymentDetails(null)
      
      // Reload specialists summary
      dispatch(fetchSpecialistsSummary({
        businessId: currentBusiness.id,
        month: commissionFilters.month + 1,
        year: commissionFilters.year
      }))
    } catch (error) {
      console.error('Error registering payment:', error)
      throw error
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      CASH: 'Efectivo',
      CREDIT_CARD: 'Tarjeta de Crédito',
      DEBIT_CARD: 'Tarjeta de Débito',
      BANK_TRANSFER: 'Transferencia',
      DIGITAL_WALLET: 'Billetera Digital',
      CHECK: 'Cheque',
      VOUCHER: 'Bono',
      CREDIT: 'Crédito'
    }
    return labels[method] || method
  }

  const getStatusBadge = (status) => {
    const config = {
      COMPLETED: { label: 'Completado', color: 'bg-emerald-100 text-emerald-800' },
      PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      FAILED: { label: 'Fallido', color: 'bg-red-100 text-red-800' },
      CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
      REFUNDED: { label: 'Reembolsado', color: 'bg-blue-100 text-blue-800' },
      CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { label: 'En Progreso', color: 'bg-purple-100 text-purple-800' },
      NO_SHOW: { label: 'No Asistió', color: 'bg-orange-100 text-orange-800' }
    }
    const { label, color } = config[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ChartBarIcon className="h-8 w-8 text-pink-600" />
            Movimientos del Negocio
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Visualiza tus movimientos financieros y el resumen de turnos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('financial')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'financial'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BanknotesIcon className="h-5 w-5 inline-block mr-2" />
            Movimientos Financieros
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CalendarDaysIcon className="h-5 w-5 inline-block mr-2" />
            Turnos del Día
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'expenses'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ReceiptPercentIcon className="h-5 w-5 inline-block mr-2" />
            Gastos del Negocio
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === 'commissions'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CurrencyDollarIcon className="h-5 w-5 inline-block mr-2" />
            Comisiones Especialistas
          </button>
        </nav>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            {activeTab === 'financial' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            )}
          </div>
          <button
            onClick={() => {
              const today = format(new Date(), 'yyyy-MM-dd')
              setDateRange({ startDate: today, endDate: today })
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'financial' && (
        <FinancialMovementsTab
          movements={movements}
          loading={movementsLoading}
          totals={movementsTotals}
          currentBusiness={currentBusiness}
          dateRange={dateRange}
          formatCurrency={formatCurrency}
          getPaymentMethodLabel={getPaymentMethodLabel}
          getStatusBadge={getStatusBadge}
        />
      )}
      
      {activeTab === 'appointments' && (
        <AppointmentsTab
          summary={todayAppointments}
          loading={todayAppointmentsLoading}
          formatCurrency={formatCurrency}
          selectedDate={dateRange.startDate}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpensesTab
          expenses={expenses}
          categories={expenseCategories}
          loading={expensesLoading}
          onCreateExpense={handleCreateExpense}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
          onApproveExpense={handleApproveExpense}
          onMarkAsPaid={handleMarkAsPaid}
          filters={expenseFilters}
          onFilterChange={setExpenseFilters}
        />
      )}

      {activeTab === 'commissions' && (
        <CommissionsTab
          specialists={specialists}
          config={commissionConfig}
          selectedSpecialistDetails={selectedSpecialistDetails}
          loading={commissionsLoading}
          onPayCommission={handlePayCommission}
          onViewDetails={handleViewSpecialistDetails}
          filters={commissionFilters}
          onFilterChange={setCommissionFilters}
        />
      )}
      
      {/* Modals */}
      <ExpenseFormModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false)
          setSelectedExpense(null)
        }}
        onSubmit={handleExpenseSubmit}
        expense={selectedExpense}
        categories={expenseCategories}
        loading={expensesLoading}
      />

      <CommissionPaymentModal
        isOpen={showCommissionModal}
        onClose={() => {
          setShowCommissionModal(false)
          setSelectedSpecialistForPayment(null)
          setSelectedSpecialistPaymentDetails(null)
        }}
        onSubmit={handleCommissionPaymentSubmit}
        specialist={selectedSpecialistForPayment}
        details={selectedSpecialistPaymentDetails}
        loading={commissionsLoading}
      />
    </div>
  )
}

// Pestaña de Movimientos Financieros
const FinancialMovementsTab = ({ movements, loading, totals, formatCurrency, getPaymentMethodLabel, getStatusBadge, currentBusiness, dateRange }) => {
  // Paginación
  const {
    data: paginatedMovements,
    pagination,
    goToPage,
    changePageSize
  } = usePagination(movements, PAGINATION.MOVEMENTS);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  // Calcular totales por método de pago (usando todos los movements, no los paginados)
  const paymentMethodTotals = movements.reduce((acc, movement) => {
    const method = movement.paymentMethod;
    const amount = parseFloat(movement.amount);
    
    if (!acc[method]) {
      acc[method] = { income: 0, expense: 0, balance: 0 };
    }
    
    if (movement.type === 'INCOME') {
      acc[method].income += amount;
    } else if (movement.type === 'EXPENSE') {
      acc[method].expense += amount;
    }
    
    acc[method].balance = acc[method].income - acc[method].expense;
    
    return acc;
  }, {});

  // Iconos por método de pago
  const paymentMethodIcons = {
    'CASH': '💵',
    'CREDIT_CARD': '💳',
    'DEBIT_CARD': '💳',
    'BANK_TRANSFER': '🏦',
    'DIGITAL_WALLET': '📱',
    'CHECK': '📝',
    'VOUCHER': '🎫',
    'CREDIT': '📋',
    'TRANSFER': '🏦'
  };

  const handleExportToExcel = () => {
    try {
      const businessName = currentBusiness?.name || 'Negocio';
      const filters = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      exportMovementsToExcel(movements, filters, businessName);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
    }
  };

  const handleExportPaymentMethodBalance = () => {
    try {
      const businessName = currentBusiness?.name || 'Negocio';
      exportPaymentMethodBalanceToExcel(movements, businessName);
    } catch (error) {
      console.error('Error al exportar balance de métodos de pago:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Botones de Exportación */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={handleExportPaymentMethodBalance}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Exportar Balance
        </button>
        <button
          onClick={handleExportToExcel}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Exportar Movimientos a Excel
        </button>
      </div>

      {/* Totales Generales */
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-100 text-sm font-medium">Ingresos</span>
            <ArrowTrendingUpIcon className="h-6 w-6 text-emerald-100" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totals.totalIncome)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-100 text-sm font-medium">Gastos</span>
            <ArrowTrendingDownIcon className="h-6 w-6 text-red-100" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totals.totalExpense)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Balance Neto</span>
            <BanknotesIcon className="h-6 w-6 text-blue-100" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totals.netBalance)}</p>
        </div>
      </div>

      }
      {Object.keys(paymentMethodTotals).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance por Método de Pago</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(paymentMethodTotals).map(([method, data]) => (
              <div key={method} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{paymentMethodIcons[method] || '💰'}</span>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {getPaymentMethodLabel(method)}
                  </h4>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ingresos:</span>
                    <span className="font-semibold text-emerald-600">
                      {formatCurrency(data.income)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Gastos:</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(data.expense)}
                    </span>
                  </div>
                  
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Balance:</span>
                      <span className={`font-bold text-base ${
                        data.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(data.balance)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de Movimientos */}
      {movements.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método de Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.transactionDate 
                        ? movement.transactionDate.split('-').reverse().join('/')
                        : format(new Date(movement.createdAt), 'dd/MM/yyyy', { locale: es })
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{movement.description}</div>
                      {movement.category && (
                        <div className="text-xs text-gray-500 mt-1">{movement.category}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {movement.type === 'INCOME' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <ArrowTrendingUpIcon className="h-4 w-4" />
                          Ingreso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <ArrowTrendingDownIcon className="h-4 w-4" />
                          Gasto
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {getPaymentMethodLabel(movement.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      <span className={movement.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}>
                        {movement.type === 'INCOME' ? '+' : '-'}{formatCurrency(movement.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(movement.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Controles de paginación */}
          <PaginationControls
            pagination={pagination}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
            pageSizeOptions={[5, 8, 10, 20, 50]}
          />
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <BanknotesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay movimientos financieros
          </h3>
          <p className="text-gray-500">
            No se encontraron movimientos para el rango de fechas seleccionado
          </p>
        </div>
      )}
    </div>
  )
}

// Pestaña de Turnos del Día
const AppointmentsTab = ({ summary, loading, formatCurrency, selectedDate }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
        <CalendarDaysIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay datos disponibles
        </h3>
        <p className="text-gray-500">
          Selecciona una fecha para ver el resumen de turnos
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen del {format(new Date(selectedDate), "dd 'de' MMMM, yyyy", { locale: es })}
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{summary.total}</p>
            <p className="text-sm text-gray-600 mt-1">Total Turnos</p>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <p className="text-3xl font-bold text-emerald-600">{summary.completed}</p>
            <p className="text-sm text-gray-600 mt-1">Completados</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{summary.confirmed + summary.pending}</p>
            <p className="text-sm text-gray-600 mt-1">Pendientes</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{summary.cancelled}</p>
            <p className="text-sm text-gray-600 mt-1">Cancelados</p>
          </div>
        </div>
      </div>

      {/* Ingresos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-100 text-sm font-medium">Ingresos Realizados</span>
            <CheckCircleIcon className="h-6 w-6 text-emerald-100" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
          <p className="text-emerald-100 text-sm mt-1">{summary.completed} servicios completados</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100 text-sm font-medium">Ingresos Potenciales</span>
            <ClockIcon className="h-6 w-6 text-blue-100" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(summary.potentialRevenue)}</p>
          <p className="text-blue-100 text-sm mt-1">
            {summary.confirmed + summary.pending + summary.inProgress} turnos pendientes
          </p>
        </div>
      </div>

      {/* Detalles por Estado */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles por Estado</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
              <span className="font-medium text-gray-900">Completados</span>
            </div>
            <span className="text-xl font-bold text-emerald-600">{summary.completed}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-900">Confirmados</span>
            </div>
            <span className="text-xl font-bold text-blue-600">{summary.confirmed}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-3">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-gray-900">Pendientes</span>
            </div>
            <span className="text-xl font-bold text-yellow-600">{summary.pending}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <ClockIcon className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-gray-900">En Progreso</span>
            </div>
            <span className="text-xl font-bold text-purple-600">{summary.inProgress}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-3">
              <XCircleIcon className="h-5 w-5 text-red-600" />
              <span className="font-medium text-gray-900">Cancelados</span>
            </div>
            <span className="text-xl font-bold text-red-600">{summary.cancelled}</span>
          </div>

          {summary.noShow > 0 && (
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircleIcon className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">No Asistió</span>
              </div>
              <span className="text-xl font-bold text-orange-600">{summary.noShow}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovementsSection
