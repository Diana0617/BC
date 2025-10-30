import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  PlusIcon,
  TrashIcon,
  SaveIcon,
  UploadIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
  Loader2Icon
} from 'lucide-react';
import { 
  fetchProducts, 
  bulkInitialStock,
  clearBulkStockResult,
  clearProductsError
} from '@shared';

const StockInitial = () => {
  const dispatch = useDispatch();
  const { 
    products: productsData, 
    loading: productsLoading, 
    error: productsError,
    bulkStockResult 
  } = useSelector(state => state.products);

  const [stockItems, setStockItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ 
      isActive: true, 
      trackInventory: true, 
      limit: 1000 
    }));
  }, [dispatch]);

  // Handle bulk stock result
  useEffect(() => {
    if (bulkStockResult) {
      setSuccess(`Stock inicial cargado exitosamente: ${bulkStockResult.processed} productos`);
      setStockItems([]);
      setConfirmDialog(false);
      
      // Reload products to update the list
      dispatch(fetchProducts({ 
        isActive: true, 
        trackInventory: true, 
        limit: 1000 
      }));
      
      // Clear result after showing
      setTimeout(() => {
        dispatch(clearBulkStockResult());
      }, 100);
    }
  }, [bulkStockResult, dispatch]);

  // Filter products with no stock
  const productsWithoutStock = productsData.filter(p => p.currentStock === 0);
  const products = productsWithoutStock;
  const loading = productsLoading;
  const error = productsError;

  const handleAddProduct = (product) => {
    if (stockItems.find(item => item.productId === product.id)) {
      return;
    }

    setStockItems([
      ...stockItems,
      {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        unit: product.unit,
        quantity: 1,
        unitCost: product.cost || 0
      }
    ]);
  };

  const handleRemoveProduct = (productId) => {
    setStockItems(stockItems.filter(item => item.productId !== productId));
  };

  const handleQuantityChange = (productId, value) => {
    setStockItems(stockItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity: parseInt(value) || 0 }
        : item
    ));
  };

  const handleCostChange = (productId, value) => {
    setStockItems(stockItems.map(item => 
      item.productId === productId 
        ? { ...item, unitCost: parseFloat(value) || 0 }
        : item
    ));
  };

  const calculateTotal = () => {
    return stockItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      await dispatch(bulkInitialStock(
        stockItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost
        }))
      )).unwrap();
      
      // Success is handled by the useEffect watching bulkStockResult
    } catch {
      setSuccess(null);
      // Error is already in Redux state
    } finally {
      setSubmitting(false);
    }
  };

  const availableProducts = products.filter(
    p => !stockItems.find(item => item.productId === p.id)
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Loader2Icon className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {typeof error === 'string' ? error : error.message || 'Error al procesar la solicitud'}
              </h3>
            </div>
            <button
              onClick={() => dispatch(clearProductsError())}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Información */}
      <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
        <div className="flex">
          <InfoIcon className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Importante</h3>
            <p className="mt-1 text-sm text-blue-700">
              La carga inicial solo se puede realizar una vez por producto.
              Una vez cargado el stock inicial, las modificaciones se deben hacer a través de movimientos
              de inventario (compras, ajustes, etc.).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de productos disponibles */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Productos Disponibles ({availableProducts.length})
              </h3>
            </div>
            
            <div className="p-4 max-h-[600px] overflow-y-auto">
              {availableProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <PackageIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm">No hay productos disponibles</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleAddProduct(product)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.sku && `SKU: ${product.sku} • `}
                            {product.category && `${product.category} • `}
                            {product.unit}
                          </p>
                        </div>
                        <PlusIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-2" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de productos seleccionados */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Stock a Cargar ({stockItems.length} productos)
              </h3>
              {stockItems.length > 0 && (
                <button
                  onClick={() => setConfirmDialog(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <SaveIcon className="h-4 w-4 mr-2" />
                  Cargar Stock
                </button>
              )}
            </div>

            {stockItems.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg m-4">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  Selecciona productos de la lista
                </h3>
                <p className="text-sm text-gray-500">
                  Haz clic en un producto para agregarlo
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Costo Unit.
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stockItems.map((item) => (
                        <tr key={item.productId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.productName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.productSku && `${item.productSku} • `}
                                {item.unit}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                              className="w-24 px-3 py-1 text-right border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end">
                              <span className="text-gray-500 mr-1">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitCost}
                                onChange={(e) => handleCostChange(item.productId, e.target.value)}
                                className="w-32 px-3 py-1 text-right border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-medium text-gray-900">
                              ${(item.quantity * item.unitCost).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleRemoveProduct(item.productId)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Inversión Total en Stock Inicial</span>
                    <span className="text-2xl font-bold">
                      ${calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resultados */}
      {bulkStockResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resultados de la Carga
          </h3>
          
          {bulkStockResult.results && bulkStockResult.results.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center text-green-600 mb-3">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  Productos cargados exitosamente: {bulkStockResult.processed}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {bulkStockResult.results.map((result, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {result.productName}: {result.quantity} unidades
                  </span>
                ))}
              </div>
            </div>
          )}

          {bulkStockResult.errors && bulkStockResult.errors.length > 0 && (
            <div>
              <div className="flex items-center text-red-600 mb-3">
                <XCircleIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  Errores encontrados: {bulkStockResult.errors.length}
                </span>
              </div>
              <div className="space-y-2">
                {bulkStockResult.errors.map((err, index) => (
                  <div key={index} className="rounded-md bg-red-50 p-3 border border-red-200">
                    <p className="text-sm text-red-800">{err.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diálogo de confirmación */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmar Carga de Stock Inicial
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de cargar el stock inicial para {stockItems.length} producto(s)?
              </p>
              
              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Esta acción:</p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Creará movimientos de inventario tipo INITIAL_STOCK</li>
                  <li>Actualizará el stock de cada producto</li>
                  <li>Registrará una inversión total de <strong>${calculateTotal().toLocaleString()}</strong></li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
              <button
                onClick={() => setConfirmDialog(false)}
                disabled={submitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    Cargando...
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Confirmar Carga
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Ícono de paquete para el placeholder
const PackageIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

export default StockInitial;
