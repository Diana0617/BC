import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  XIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  PackageIcon,
  ShoppingCartIcon,
  UserIcon,
  CalendarIcon
} from 'lucide-react';

const ProductMovementsModal = ({ product, onClose }) => {
  // eslint-disable-next-line no-unused-vars
  const { user } = useSelector((state) => state.auth);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, entries, exits

  useEffect(() => {
    loadMovements();
  }, [filter]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      // TODO: Implementar endpoint para obtener movimientos de inventario
      // Por ahora, datos de ejemplo
      const mockMovements = [
        {
          id: 1,
          type: 'ENTRY',
          subtype: 'PURCHASE',
          quantity: 50,
          date: new Date(),
          reference: 'Factura #0001',
          user: 'Admin'
        },
        {
          id: 2,
          type: 'EXIT',
          subtype: 'SALE',
          quantity: 5,
          date: new Date(Date.now() - 86400000),
          reference: 'Venta #001',
          user: 'Cajero 1'
        },
        {
          id: 3,
          type: 'EXIT',
          subtype: 'PROCEDURE',
          quantity: 2,
          date: new Date(Date.now() - 172800000),
          reference: 'Cita #123',
          user: 'Especialista María'
        }
      ];
      
      const filtered = filter === 'all' 
        ? mockMovements
        : mockMovements.filter(m => filter === 'entries' ? m.type === 'ENTRY' : m.type === 'EXIT');
      
      setMovements(filtered);
    } catch (err) {
      console.error('Error loading movements:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type, subtype) => {
    if (type === 'ENTRY') {
      return <TrendingUpIcon className="h-5 w-5 text-green-600" />;
    } else if (subtype === 'SALE') {
      return <ShoppingCartIcon className="h-5 w-5 text-blue-600" />;
    } else {
      return <UserIcon className="h-5 w-5 text-purple-600" />;
    }
  };

  const getMovementBadge = (type) => {
    if (type === 'ENTRY') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Entrada</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Salida</span>;
    }
  };

  const getSubtypeLabel = (subtype) => {
    const labels = {
      PURCHASE: 'Compra',
      SALE: 'Venta',
      PROCEDURE: 'Uso en procedimiento',
      ADJUSTMENT: 'Ajuste de inventario',
      RETURN: 'Devolución',
      TRANSFER: 'Transferencia'
    };
    return labels[subtype] || subtype;
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
                        {getMovementIcon(movement.type, movement.subtype)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getMovementBadge(movement.type)}
                          <span className="text-sm text-gray-600">
                            {getSubtypeLabel(movement.subtype)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDate(movement.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-4 w-4" />
                            {movement.user}
                          </span>
                        </div>
                        {movement.reference && (
                          <div className="text-sm text-gray-600 mt-1">
                            Ref: {movement.reference}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        movement.type === 'ENTRY' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'ENTRY' ? '+' : '-'}{movement.quantity}
                      </div>
                      <div className="text-xs text-gray-500">unidades</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductMovementsModal;
