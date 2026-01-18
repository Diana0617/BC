import { useState, useMemo } from 'react';
import { PAGINATION } from '../constants/ui';

/**
 * Hook para manejar paginación de datos
 * @param {Array} data - Array de datos a paginar
 * @param {number} initialPageSize - Tamaño inicial de página (por defecto PAGINATION.DEFAULT_PAGE_SIZE)
 * @returns {Object} - Objeto con datos paginados y funciones de control
 */
export const usePagination = (data = [], initialPageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calcular datos paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  // Calcular información de paginación
  const pagination = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalItems);

    return {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages
    };
  }, [data.length, currentPage, pageSize]);

  // Funciones de navegación
  const goToPage = (page) => {
    const newPage = Math.max(1, Math.min(page, pagination.totalPages));
    setCurrentPage(newPage);
  };

  const nextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(pagination.totalPages);
  };

  const changePageSize = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset a primera página cuando cambia el tamaño
  };

  // Reset cuando cambian los datos
  const reset = () => {
    setCurrentPage(1);
    setPageSize(initialPageSize);
  };

  return {
    // Datos paginados
    data: paginatedData,
    
    // Información de paginación
    pagination,
    
    // Funciones de navegación
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    reset
  };
};

export default usePagination;
