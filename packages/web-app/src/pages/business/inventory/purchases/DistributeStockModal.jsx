import React, { useState, useEffect } from 'react';
import {
  XIcon,
  Share2Icon,
  StoreIcon,
  AlertCircleIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon
} from 'lucide-react';
import { useBusinessContext } from '../../../../context/BusinessContext';
import businessBranchesApi from '../../../../api/businessBranchesApi';
import supplierInvoicesApi from '../../../../api/supplierInvoicesApi';

const DistributeStockModal = ({ invoice, onClose, onDistributed }) => {
  const { businessId } = useBusinessContext();
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);
  
  // distribution: [{ branchId, items: [{ productId, quantity }] }]
  const [distribution, setDistribution] = useState([]);

  useEffect(() => {
    if (businessId) {
      loadBranches();
    }
  }, [businessId]);

  useEffect(() => {
    if (branches.length > 0 && invoice?.items) {
      initializeDistribution();
    }
  }, [branches, invoice]);

  const loadBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await businessBranchesApi.getBranches(businessId);
      setBranches(response.data || []);
    } catch (error) {
      console.error('Error loading branches:', error);
      setError('Error al cargar sucursales');
    } finally {
      setLoadingBranches(false);
    }
  };

  const initializeDistribution = () => {
    if (!invoice?.items || branches.length === 0) return;

    // Inicializar con una sucursal por defecto (la primera)
    const initialDist = [{
      branchId: branches[0]?.id || '',
      items: invoice.items.map(item => ({
        productId: item.productId,
        quantity: 0
      }))
    }];

    setDistribution(initialDist);
  };

  const handleAddBranch = () => {
    if (!invoice?.items) return;

    setDistribution([
      ...distribution,
      {
        branchId: '',
        items: invoice.items.map(item => ({
          productId: item.productId,
          quantity: 0
        }))
      }
    ]);
  };

  const handleRemoveBranch = (distIndex) => {
    if (distribution.length === 1) {
      setError('Debe haber al menos una sucursal');
      return;
    }
    setDistribution(distribution.filter((_, i) => i !== distIndex));
  };

  const handleBranchChange = (distIndex, branchId) => {
    const newDist = [...distribution];
    newDist[distIndex].branchId = branchId;
    setDistribution(newDist);
  };

  const handleQuantityChange = (distIndex, itemIndex, quantity) => {
    const newDist = [...distribution];
    newDist[distIndex].items[itemIndex].quantity = parseFloat(quantity) || 0;
    setDistribution(newDist);
  };

  const getProductTotalDistributed = (productId) => {
    return distribution.reduce((sum, dist) => {
      const item = dist.items.find(i => i.productId === productId);
      return sum + (item?.quantity || 0);
    }, 0);
  };

  const isValidDistribution = () => {
    if (!invoice?.items) return false;

    // Verificar que todas las sucursales estén seleccionadas
    if (distribution.some(d => !d.branchId)) {
      return false;
    }

    // Verificar que no haya sucursales duplicadas
    const branchIds = distribution.map(d => d.branchId);
    if (new Set(branchIds).size !== branchIds.length) {
      return false;
    }

    // Verificar que cada producto esté completamente distribuido
    return invoice.items.every(item => {
      const distributed = getProductTotalDistributed(item.productId);
      return distributed === item.quantity;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isValidDistribution()) {
      setError('La distribución no es válida. Verifica que todas las cantidades coincidan con la factura.');
      return;
    }

    setLoading(true);

    try {
      const response = await supplierInvoicesApi.distributeStock(businessId, invoice.id, distribution);
      
      if (onDistributed) {
        onDistributed(response.data);
      }
    } catch (err) {
      console.error('Error distributing stock:', err);
      setError(err.message || 'Error al distribuir el stock');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDistribution([]);
    setError(null);
    onClose();
  };

  const getUsedBranches = () => {
    return distribution.map(d => d.branchId).filter(Boolean);
  };

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Share2Icon className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Distribuir Stock entre Sucursales</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Factura: {invoice.invoiceNumber}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {loadingBranches ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : branches.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                No hay sucursales registradas. Crea al menos una sucursal para distribuir stock.
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
                  Distribuye las cantidades de cada producto entre las sucursales. Las cantidades deben sumar exactamente lo indicado en la factura.
                </div>

                {/* Resumen de productos en la factura */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Productos en la Factura:</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-2 px-2 font-medium text-gray-700">Producto</th>
                          <th className="text-right py-2 px-2 font-medium text-gray-700">Cant. Facturada</th>
                          <th className="text-right py-2 px-2 font-medium text-gray-700">Distribuido</th>
                          <th className="text-center py-2 px-2 font-medium text-gray-700">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item, idx) => {
                          const distributed = getProductTotalDistributed(item.productId);
                          const remaining = item.quantity - distributed;
                          const isComplete = remaining === 0;
                          const isOver = distributed > item.quantity;

                          return (
                            <tr key={idx} className="border-b border-gray-200">
                              <td className="py-2 px-2">{item.product?.name || item.productId}</td>
                              <td className="text-right py-2 px-2">
                                <strong>{item.quantity}</strong> {item.product?.unit}
                              </td>
                              <td className={`text-right py-2 px-2 ${
                                isOver ? 'text-red-600 font-bold' : 
                                isComplete ? 'text-green-600 font-bold' : 
                                'text-gray-600'
                              }`}>
                                {distributed}
                              </td>
                              <td className="text-center py-2 px-2">
                                {isOver ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                    +{distributed - item.quantity} exceso
                                  </span>
                                ) : isComplete ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                    <CheckCircleIcon className="w-3 h-3" />
                                    Completo
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                    Faltan {remaining}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Sucursal:</h3>

                  {distribution.map((dist, distIndex) => {
                    const usedBranches = getUsedBranches();

                    return (
                      <div key={distIndex} className="border border-gray-300 rounded-lg p-4 mb-4 bg-white">
                        <div className="flex items-center gap-3 mb-4">
                          <StoreIcon className="w-5 h-5 text-blue-600" />
                          <select
                            value={dist.branchId}
                            onChange={(e) => handleBranchChange(distIndex, e.target.value)}
                            required
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Selecciona una sucursal</option>
                            {branches.map((branch) => (
                              <option
                                key={branch.id}
                                value={branch.id}
                                disabled={usedBranches.includes(branch.id) && branch.id !== dist.branchId}
                              >
                                {branch.name}
                              </option>
                            ))}
                          </select>

                          {distribution.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBranch(distIndex)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Quitar sucursal"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {invoice.items.map((item, itemIndex) => (
                            <div key={itemIndex}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {item.product?.name || 'Producto'}
                              </label>
                              <input
                                type="number"
                                value={dist.items[itemIndex]?.quantity || ''}
                                onChange={(e) => handleQuantityChange(distIndex, itemIndex, e.target.value)}
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Máx: {item.quantity} {item.product?.unit || ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleAddBranch}
                    disabled={distribution.length >= branches.length}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Agregar Otra Sucursal
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingBranches || !isValidDistribution()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Distribuyendo...
                </>
              ) : (
                <>
                  <Share2Icon className="w-4 h-4" />
                  Distribuir Stock
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DistributeStockModal;
