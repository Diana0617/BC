import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight, Store, Package, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBusinessContext } from '../../context/BusinessContext';

const TransferStockModal = ({ open, onClose, onSuccess, products = [], branches = [] }) => {
  const { businessId } = useBusinessContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    fromBranchId: '',
    toBranchId: '',
    quantity: '',
    notes: ''
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [fromBranchStock, setFromBranchStock] = useState(null);
  const [toBranchStock, setToBranchStock] = useState(null);

  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p.id === formData.productId);
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, products]);

  useEffect(() => {
    if (selectedProduct && formData.fromBranchId) {
      const stock = selectedProduct.branchStocks?.find(
        bs => bs.branchId === formData.fromBranchId
      );
      setFromBranchStock(stock);
    } else {
      setFromBranchStock(null);
    }
  }, [selectedProduct, formData.fromBranchId]);

  useEffect(() => {
    if (selectedProduct && formData.toBranchId) {
      const stock = selectedProduct.branchStocks?.find(
        bs => bs.branchId === formData.toBranchId
      );
      setToBranchStock(stock);
    } else {
      setToBranchStock(null);
    }
  }, [selectedProduct, formData.toBranchId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar sucursal destino si se cambia origen
    if (field === 'fromBranchId' && formData.toBranchId === value) {
      setFormData(prev => ({ ...prev, toBranchId: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.productId || !formData.fromBranchId || !formData.toBranchId || !formData.quantity) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (formData.fromBranchId === formData.toBranchId) {
      setError('Las sucursales de origen y destino no pueden ser iguales');
      return;
    }

    if (formData.quantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    const availableStock = fromBranchStock?.currentStock || 0;
    if (formData.quantity > availableStock) {
      setError(`Stock insuficiente. Disponible: ${availableStock}`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/business/${businessId}/config/inventory/transfer-between-branches`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            productId: formData.productId,
            fromBranchId: formData.fromBranchId,
            toBranchId: formData.toBranchId,
            quantity: parseFloat(formData.quantity),
            notes: formData.notes
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al transferir stock');
      }

      toast.success(data.message || 'Transferencia exitosa');
      
      if (onSuccess) {
        onSuccess(data.data);
      }
      
      handleClose();
    } catch (err) {
      console.error('Error transferring stock:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      productId: '',
      fromBranchId: '',
      toBranchId: '',
      quantity: '',
      notes: ''
    });
    setSelectedProduct(null);
    setFromBranchStock(null);
    setToBranchStock(null);
    setError(null);
    onClose();
  };

  const fromBranch = branches.find(b => b.id === formData.fromBranchId);
  const toBranch = branches.find(b => b.id === formData.toBranchId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Transferir Stock entre Sucursales</h3>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-4 text-red-800 bg-red-50 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Seleccionar Producto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Producto
                  </div>
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleChange('productId', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - SKU: {product.sku} | Stock: {product.currentStock} {product.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sucursales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sucursal Origen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      Desde Sucursal
                    </div>
                  </label>
                  <select
                    value={formData.fromBranchId}
                    onChange={(e) => handleChange('fromBranchId', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar sucursal</option>
                    {branches.map((branch) => (
                      <option 
                        key={branch.id} 
                        value={branch.id}
                        disabled={branch.id === formData.toBranchId}
                      >
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  
                  {fromBranchStock && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        fromBranchStock.currentStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Stock disponible: {fromBranchStock.currentStock} {selectedProduct?.unit || ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Sucursal Destino */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      Hacia Sucursal
                    </div>
                  </label>
                  <select
                    value={formData.toBranchId}
                    onChange={(e) => handleChange('toBranchId', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar sucursal</option>
                    {branches.map((branch) => (
                      <option 
                        key={branch.id} 
                        value={branch.id}
                        disabled={branch.id === formData.fromBranchId}
                      >
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  
                  {toBranchStock && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Stock actual: {toBranchStock.currentStock} {selectedProduct?.unit || ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad a Transferir
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {fromBranchStock && formData.quantity && (
                  <p className="mt-1 text-sm text-gray-500">
                    Quedarán {fromBranchStock.currentStock - formData.quantity} en {fromBranch?.name}
                  </p>
                )}
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                  placeholder="Motivo de la transferencia, observaciones..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Resumen */}
              {selectedProduct && fromBranch && toBranch && formData.quantity && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>Resumen:</strong> Se transferirán <strong>{formData.quantity} {selectedProduct.unit || 'unidades'}</strong> de <strong>{selectedProduct.name}</strong> desde <strong>{fromBranch.name}</strong> hacia <strong>{toBranch.name}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.productId || !formData.fromBranchId || !formData.toBranchId || !formData.quantity}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transfiriendo...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight className="w-4 h-4" />
                    Transferir
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransferStockModal;
