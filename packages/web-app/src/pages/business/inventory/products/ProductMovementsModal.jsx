import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  XIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  PackageIcon,
  ShoppingCartIcon,
  ScissorsIcon,
  UserIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';
import productApi from '../../../../api/productApi';

const ProductMovementsModal = ({ product, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [summary, setSummary] = useState([]);
  const [filter, setFilter] = useState('all'); // all, entries, exits
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  useEffect(() => {
    loadMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, pagination.page]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Product object:', product);
      console.log('🔍 Product ID:', product.id);
      console.log('🔍 Product SKU:', product.sku);
      console.log('🔍 User object:', user);
      console.log('🔍 User businessId:', user.businessId);
      
      const params = {
        page: pagination.page,
        limit: 20
      };

      // Filtrar por tipo si no es "all"
      // Los valores deben coincidir con el ENUM de InventoryMovement
      if (filter === 'entries') {
        params.movementType = 'INITIAL_STOCK,PURCHASE';
      } else if (filter === 'exits') {
        params.movementType = 'SALE';
      }
      // ADJUSTMENT y TRANSFER pueden ser entrada o salida según quantity (positivo/negativo)

      const response = await productApi.getProductMovements(
        user.businessId, 
        product.id,
        params
      );
      
      if (response.success) {
        setMovements(response.data.movements || []);
        setSummary(response.data.summary || []);
        setPagination({
          page: response.data.page,
          totalPages: response.data.totalPages
        });
      }
    } catch (error) {
      console.error('Error loading movements:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (movement) => {
    const isEntry = movement.quantity > 0 || ['INITIAL_STOCK', 'PURCHASE'].includes(movement.movementType);
    
    if (isEntry) {
      return <TrendingUpIcon className="h-5 w-5 text-green-600" />;
    } else if (movement.movementType === 'SALE') {
      return <ShoppingCartIcon className="h-5 w-5 text-blue-600" />;
    } else {
      return <TrendingDownIcon className="h-5 w-5 text-red-600" />;
    }
  };

  const getMovementBadge = (movement) => {
    const isEntry = movement.quantity > 0 || ['INITIAL_STOCK', 'PURCHASE'].includes(movement.movementType);
    
    if (isEntry) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Entrada</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Salida</span>;
    }
  };

  const getMovementTypeLabel = (movement) => {
    const { movementType, quantity } = movement;
    const labels = {
      INITIAL_STOCK: 'Stock Inicial',
      PURCHASE: 'Compra',
      SALE: 'Venta',
      ADJUSTMENT: quantity > 0 ? 'Ajuste (Entrada)' : 'Ajuste (Salida)',
      TRANSFER: quantity > 0 ? 'Transferencia (Entrada)' : 'Transferencia (Salida)',
      RETURN: 'Devolución',
      DAMAGE: 'Daño',
      EXPIRED: 'Vencido'
    };
    return labels[movementType] || movementType;
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PackageIcon className="h-5 w-5 text-blue-600" />
              Movimientos de {product.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Stock actual: {product.currentStock || 0} unidades
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Filtros */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('entries')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'entries'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setFilter('exits')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'exits'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Salidas
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-12">
              <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay movimientos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se han registrado movimientos para este producto
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {movements.map((movement) => (
                <div
                  key={movement.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getMovementIcon(movement)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getMovementBadge(movement)}
                          <span className="text-sm text-gray-600">
                            {getMovementTypeLabel(movement)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDate(movement.createdAt)}
                          </span>
                          {movement.user && (
                            <span className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              {movement.user.firstName} {movement.user.lastName}
                            </span>
                          )}
                        </div>
                        {movement.reason && (
                          <div className="text-sm text-gray-600 mt-1">
                            {movement.reason}
                          </div>
                        )}
                        {movement.notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            {movement.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        ['INITIAL_STOCK', 'PURCHASE', 'ADJUSTMENT_IN', 'TRANSFER_IN'].includes(movement.movementType)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {['INITIAL_STOCK', 'PURCHASE', 'ADJUSTMENT_IN', 'TRANSFER_IN'].includes(movement.movementType) ? '+' : '-'}
                        {movement.quantity}
                      </div>
                      <div className="text-xs text-gray-500">unidades</div>
                      {movement.unitCost && (
                        <div className="text-xs text-gray-500 mt-1">
                          ${movement.unitCost.toLocaleString('es-CO')} c/u
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Página {pagination.page} de {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductMovementsModal;
