import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  fetchOwnerExpenses,
  createOwnerExpense,
  setFilters,
  resetError
} from '../store/slices/ownerExpensesSlice';


export const useOwnerExpenses = () => {
  const dispatch = useDispatch();
  const {
    expenses,
    loading,
    error,
    filters,
    pagination,
    stats
  } = useSelector(state => state.ownerExpenses);

  // Listar gastos con filtros
  const fetchExpenses = useCallback(() => {
    dispatch(fetchOwnerExpenses(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Crear gasto con comprobante
  const createExpense = async (expenseData, receiptFile) => {
    await dispatch(createOwnerExpense({ expenseData, receiptFile }));
    fetchExpenses(); // recargar lista
  };

  // Cambiar filtros
  const updateFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  // Resetear error
  const clearError = () => {
    dispatch(resetError());
  };

  return {
    expenses,
    loading,
    error,
    filters,
    pagination,
    stats,
    fetchExpenses,
    createExpense,
    updateFilters,
    clearError,
  };
};

export default useOwnerExpenses;
