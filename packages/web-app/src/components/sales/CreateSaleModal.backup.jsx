import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  XMarkIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  UserIcon,
  CreditCardIcon,
  BanknotesIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { createSale, clearCreateSuccess, clearSalesError } from '@shared/store/slices/salesSlice';
import { fetchProducts } from '@shared/store/slices/productsSlice';

/**
 * CreateSaleModal - Modal para registrar una nueva venta
 * 
 * @param {Boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {String} shiftId - ID del turno activo (opcional)
 * @param {String} branchId - ID de la sucursal (opcional)
 */
const CreateSaleModal = ({ isOpen, onClose, shiftId = null, branchId = null }) => {
  const dispatch = useDispatch();
  const { loading, createSuccess, error } = useSelector(state => state.sales);
  const { products } = useSelector(state => state.products);
  const user = useSelector(state => state.auth?.user);
  const businessId = user?.businessId;

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    clientId: null,
    clientName: '',
    clientPhone: '',
    discount: 0,
    discountType: 'NONE',
    discountValue: 0,
    taxPercentage: 19,
    paymentMethod: 'CASH',
    paidAmount: '',
    notes: ''
  });

  // Cargar productos al abrir
  useEffect(() => {
    if (isOpen && businessId) {
      dispatch(fetchProducts({ 
        businessId,
        productType: 'FOR_SALE,BOTH',
        isActive: true
      }));
    }
  }, [isOpen, businessId, dispatch]);

  // Manejar éxito
  useEffect(() => {
    if (createSuccess) {
      toast.success('Venta registrada exitosamente');
      handleClose();
      dispatch(clearCreateSuccess());
    }
  }, [createSuccess, dispatch]);

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error.error || 'Error al registrar la venta');
      dispatch(clearSalesError());
    }
  }, [error, dispatch]);

  const handleClose = () => {
    setItems([]);
    setSearchTerm('');
    setSelectedProduct(null);
    setFormData({
      clientId: null,
      clientName: '',
      clientPhone: '',
      discount: 0,
      discountType: 'NONE',
      discountValue: 0,
      taxPercentage: 19,
      paymentMethod: 'CASH',
      paidAmount: '',
      notes: ''
    });
    onClose();
  };

  // Agregar producto al carrito
  const handleAddProduct = () => {
    if (!selectedProduct) return;

    const existing = items.find(item => item.productId === selectedProduct.id);
    if (existing) {
      toast.error('Este producto ya está en el carrito');
      return;
    }

    setItems([...items, {
      productId: selectedProduct.id,
      product: selectedProduct,
      quantity: 1,
      unitPrice: selectedProduct.price,
      discountType: 'NONE',
      discountValue: 0
    }]);

    setSelectedProduct(null);
    setSearchTerm('');
  };

  // Actualizar cantidad
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setItems(items.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Actualizar descuento de item
  const handleItemDiscountChange = (productId, discountType, discountValue) => {
    setItems(items.map(item =>
      item.productId === productId
        ? { ...item, discountType, discountValue: parseFloat(discountValue) || 0 }
        : item
    ));
  };

  // Eliminar producto
  const handleRemoveItem = (productId) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  // Calcular subtotal
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // Calcular descuento total
  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    
    // Descuentos por item
    const itemDiscounts = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      if (item.discountType === 'PERCENTAGE') {
        return sum + (itemSubtotal * item.discountValue / 100);
      } else if (item.discountType === 'FIXED') {
        return sum + item.discountValue;
      }
      return sum;
    }, 0);

    // Descuento general
    let generalDiscount = 0;
    if (formData.discountType === 'PERCENTAGE') {
      generalDiscount = subtotal * formData.discountValue / 100;
    } else if (formData.discountType === 'FIXED') {
      generalDiscount = formData.discountValue;
    }

    return itemDiscounts + generalDiscount;
  };

  // Calcular impuesto
  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const taxableAmount = subtotal - discount;
    return taxableAmount * (formData.taxPercentage / 100);
  };

  // Calcular total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  // Calcular cambio
  const calculateChange = () => {
    const total = calculateTotal();
    const paid = parseFloat(formData.paidAmount) || 0;
    return Math.max(0, paid - total);
  };

  // Filtrar productos
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validar y enviar
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    const total = calculateTotal();
    const paidAmount = parseFloat(formData.paidAmount) || 0;

    if (paidAmount < total) {
      toast.error(`Monto insuficiente. Total: $${total.toLocaleString()}`);
      return;
    }

    const saleData = {
      branchId: branchId || null,
      clientId: formData.clientId,
      shiftId: shiftId || null,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        discountType: item.discountType,
        discountValue: item.discountValue
      })),
      discount: formData.discount,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      taxPercentage: formData.taxPercentage,
      paymentMethod: formData.paymentMethod,
      paidAmount,
      notes: formData.notes
    };

    await dispatch(createSale(saleData));
  };

  if (!isOpen) return null;

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const tax = calculateTax();
  const total = calculateTotal();
  const change = calculateChange();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Nueva Venta</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex h-[calc(90vh-120px)]">
          {/* Columna Izquierda - Productos */}
          <div className="w-2/3 p-6 border-r overflow-y-auto">
            {/* Buscar Producto */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Producto
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre o SKU del producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Lista de productos filtrados */}
              {searchTerm && (
                <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">
                      No se encontraron productos
                    </div>
                  ) : (
                    filteredProducts.map(product => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product);
                          handleAddProduct();
                        }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            ${product.price?.toLocaleString()}
                          </p>
                          {product.trackInventory && (
                            <p className="text-sm text-gray-500">
                              Stock: {product.currentStock}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Carrito */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Carrito ({items.length})</h3>
              
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCartIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay productos en el carrito</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.productId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">{item.product.sku}</p>
                          <p className="text-sm text-blue-600 font-medium">
                            ${item.unitPrice?.toLocaleString()} c/u
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Cantidad */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              className="p-1 border rounded hover:bg-gray-100"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                              className="w-20 px-2 py-1 border rounded text-center"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              className="p-1 border rounded hover:bg-gray-100"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Descuento Item */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descuento
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={item.discountType}
                              onChange={(e) => handleItemDiscountChange(item.productId, e.target.value, item.discountValue)}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              <option value="NONE">Sin desc.</option>
                              <option value="PERCENTAGE">%</option>
                              <option value="FIXED">$</option>
                            </select>
                            {item.discountType !== 'NONE' && (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.discountValue}
                                onChange={(e) => handleItemDiscountChange(item.productId, item.discountType, e.target.value)}
                                className="flex-1 px-2 py-1 border rounded text-sm"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t text-right">
                        <span className="text-lg font-bold">
                          Subtotal: ${(item.quantity * item.unitPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha - Resumen y Pago */}
          <div className="w-1/3 p-6 bg-gray-50 overflow-y-auto">
            {/* Cliente (Opcional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente (Opcional)
              </label>
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Descuento General */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descuento General
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="NONE">Sin descuento</option>
                  <option value="PERCENTAGE">Porcentaje (%)</option>
                  <option value="FIXED">Monto Fijo ($)</option>
                </select>
                {formData.discountType !== 'NONE' && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="0"
                  />
                )}
              </div>
            </div>

            {/* Método de Pago */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="CASH">Efectivo</option>
                <option value="CARD">Tarjeta</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="MIXED">Mixto</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>

            {/* Monto Pagado */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Recibido *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.paidAmount}
                onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            {/* Notas */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Observaciones..."
              />
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-lg p-4 space-y-2 mb-6">
              <h3 className="font-semibold text-lg mb-3">Resumen</h3>
              
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Descuento:</span>
                  <span>-${discount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-600">
                <span>IVA ({formData.taxPercentage}%):</span>
                <span>${tax.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-blue-600">${total.toLocaleString()}</span>
              </div>

              {formData.paidAmount && change > 0 && (
                <div className="flex justify-between text-green-600 font-semibold pt-2 border-t">
                  <span>Cambio:</span>
                  <span>${change.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="space-y-2">
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Registrar Venta'}
              </button>
              
              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSaleModal;
