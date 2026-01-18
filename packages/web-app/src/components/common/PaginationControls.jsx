import React from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

/**
 * Componente de controles de paginación reutilizable
 */
const PaginationControls = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 8, 10, 20, 50],
  showPageSizeSelector = true,
  showFirstLast = true,
  className = ''
}) => {
  const {
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    pageSize
  } = pagination;

  if (totalItems === 0) return null;

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 ${className}`}>
      {/* Información de items */}
      <div className="flex-1 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">{startIndex}</span>
            {' '}-{' '}
            <span className="font-medium">{endIndex}</span>
            {' '}de{' '}
            <span className="font-medium">{totalItems}</span>
            {' '}resultados
          </p>
        </div>

        {/* Selector de tamaño de página */}
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <label htmlFor="pageSize" className="text-sm text-gray-700">
              Mostrar:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Controles de navegación */}
      <div className="flex items-center gap-2">
        {/* Primera página */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={!hasPrevPage}
            className="relative inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Primera página"
          >
            <ChevronDoubleLeftIcon className="h-4 w-4" />
          </button>
        )}

        {/* Página anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="relative inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Página anterior"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {/* Números de página */}
        <div className="hidden sm:flex gap-1">
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                  ...
                </span>
              )}
            </>
          )}

          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                page === currentPage
                  ? 'bg-pink-600 text-white border border-pink-600'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700">
                  ...
                </span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Página siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="relative inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Página siguiente"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>

        {/* Última página */}
        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
            className="relative inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Última página"
          >
            <ChevronDoubleRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PaginationControls;
