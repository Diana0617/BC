import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import useUserPermissions from '../../hooks/useUserPermissions'
import {
  fetchExpenses,
  fetchExpenseCategories,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  markExpenseAsPaid,
  selectExpenses,
  selectExpenseCategories,
  selectExpensesLoading
} from '@shared'
import ExpensesTab from '../../components/business/profile/ExpensesTab'
import ExpenseFormModal from '../../components/business/profile/ExpenseFormModal'
import { ReceiptPercentIcon } from '@heroicons/react/24/outline'

const ExpensesPage = () => {
  const dispatch = useDispatch()
  const { currentBusiness } = useSelector(state => state.business)

  // Permisos del usuario
  const { expenses: expensesPerms, loading: permissionsLoading } = useUserPermissions()

  // Redux state
  const expenses = useSelector(selectExpenses)
  const expenseCategories = useSelector(selectExpenseCategories)
  const expensesLoading = useSelector(selectExpensesLoading)

  // Local state
  const [expenseFilters, setExpenseFilters] = useState({})
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    if (currentBusiness?.id && expensesPerms?.view) {
      dispatch(fetchExpenses({ businessId: currentBusiness.id }))
      dispatch(fetchExpenseCategories({ businessId: currentBusiness.id }))
    }
  }, [dispatch, currentBusiness?.id, expensesPerms?.view])

  // Si no tiene permiso, redirigir
  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Verificando permisos...</div>
      </div>
    )
  }

  if (!expensesPerms?.view) {
    return <Navigate to="/" replace />
  }

  // Handlers
  const handleCreateExpense = () => {
    setEditingExpense(null)
    setIsExpenseModalOpen(true)
  }

  const handleEditExpense = (expense) => {
    setEditingExpense(expense)
    setIsExpenseModalOpen(true)
  }

  const handleSaveExpense = async (expenseData) => {
    if (editingExpense) {
      await dispatch(updateExpense({
        businessId: currentBusiness.id,
        expenseId: editingExpense.id,
        expenseData
      }))
    } else {
      await dispatch(createExpense({
        businessId: currentBusiness.id,
        expenseData
      }))
    }
    setIsExpenseModalOpen(false)
    setEditingExpense(null)
    // Recargar gastos
    dispatch(fetchExpenses({ businessId: currentBusiness.id }))
  }

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('¿Estás seguro de eliminar este gasto?')) {
      await dispatch(deleteExpense({
        businessId: currentBusiness.id,
        expenseId
      }))
      dispatch(fetchExpenses({ businessId: currentBusiness.id }))
    }
  }

  const handleApproveExpense = async (expenseId, approved) => {
    await dispatch(approveExpense({
      businessId: currentBusiness.id,
      expenseId,
      approved
    }))
    dispatch(fetchExpenses({ businessId: currentBusiness.id }))
  }

  const handleMarkAsPaid = async (expenseId) => {
    await dispatch(markExpenseAsPaid({
      businessId: currentBusiness.id,
      expenseId
    }))
    dispatch(fetchExpenses({ businessId: currentBusiness.id }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <ReceiptPercentIcon className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Gastos</h1>
              <p className="text-sm text-gray-500">
                {currentBusiness?.name || 'Mi Negocio'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          permissions={expensesPerms}
        />
      </div>

      {/* Modal de creación/edición */}
      {isExpenseModalOpen && (
        <ExpenseFormModal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setIsExpenseModalOpen(false)
            setEditingExpense(null)
          }}
          onSubmit={handleSaveExpense}
          expense={editingExpense}
          categories={expenseCategories}
        />
      )}
    </div>
  )
}

export default ExpensesPage
