import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

/**
 * ProductSelector - Componente reutilizable para seleccionar y gestionar productos
 * Puede ser usado en ventas, citas, o cualquier flujo que requiera selección de productos
 */
const ProductSelector = ({
  products = [],
  selectedItems = [],
  onItemsChange,
  allowQuantityEdit = true,
  allowPriceEdit = false,
  showStock = true,
  title = 'Productos'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductList, setShowProductList] = useState(false);

  // Filtrar productos disponibles
  const availableProducts = products.filter(p => 
    p.isActive && 
    p.currentStock > 0 &&
    !selectedItems.find(item => item.productId === p.id)
  );

  // Filtrar productos por búsqueda
  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Agregar producto
  const handleAddProduct = (product) => {
    const newItem = {
      productId: product.id,
      product: product,
      productName: product.name,
      quantity: 1,
      unitPrice: product.price,
      subtotal: product.price,
      discount: 0,
      discountType: 'NONE',
      discountValue: 0,
      total: product.price
    };
    
    onItemsChange([...selectedItems, newItem]);
    setSearchTerm('');
    setShowProductList(false);
  };

  // Actualizar cantidad
  const handleQuantityChange = (index, newQuantity) => {
    if (!allowQuantityEdit) return;
    
    const updatedItems = [...selectedItems];
    const item = updatedItems[index];
    const maxStock = item.product?.currentStock || 999;
    
    const validQuantity = Math.max(1, Math.min(newQuantity, maxStock));
    item.quantity = validQuantity;
    item.subtotal = item.unitPrice * validQuantity;
    item.total = item.subtotal - item.discount;
    
    onItemsChange(updatedItems);
  };

  // Actualizar precio (si se permite)
  const handlePriceChange = (index, newPrice) => {
    if (!allowPriceEdit) return;
    
    const updatedItems = [...selectedItems];
    const item = updatedItems[index];
    
    item.unitPrice = parseFloat(newPrice) || 0;
    item.subtotal = item.unitPrice * item.quantity;
    item.total = item.subtotal - item.discount;
    
    onItemsChange(updatedItems);
  };

  // Remover producto
  const handleRemoveItem = (index) => {
    const updatedItems = selectedItems.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5 text-pink-600" />
          {title}
        </h3>
        <span className="text-sm text-gray-500">
          {selectedItems.length} item(s)
        </span>
      </div>

      {/* Buscador de productos */}
      <div className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowProductList(e.target.value.length > 0);
            }}
            onFocus={() => searchTerm && setShowProductList(true)}
            placeholder="Buscar producto por nombre o código..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        {/* Dropdown de productos */}
        {showProductList && filteredProducts.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => handleAddProduct(product)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.sku && `SKU: ${product.sku} • `}
                      {formatCurrency(product.price)}
                      {showStock && ` • Stock: ${product.currentStock}`}
                    </p>
                  </div>
                  <PlusIcon className="h-5 w-5 text-pink-600" />
                </div>
              </button>
            ))}
          </div>
        )}

        {showProductList && searchTerm && filteredProducts.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-500 text-center">
              No se encontraron productos
            </p>
          </div>
        )}
      </div>

      {/* Lista de productos seleccionados */}
      {selectedItems.length > 0 ? (
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          {selectedItems.map((item, index) => (
            <div key={`${item.productId}-${index}`} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.productName || item.product?.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                    {showStock && item.product?.currentStock && (
                      <span className="ml-2">
                        (Stock: {item.product.currentStock})
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Control de cantidad */}
                  {allowQuantityEdit && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MinusIcon className="h-4 w-4 text-gray-600" />
                      </button>
                      
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                        min="1"
                        max={item.product?.currentStock || 999}
                        className="w-16 text-center border border-gray-300 rounded-lg py-1"
                      />
                      
                      <button
                        onClick={() => handleQuantityChange(index, item.quantity + 1)}
                        disabled={item.product?.currentStock && item.quantity >= item.product.currentStock}
                        className="p-1 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  )}

                  {/* Precio editable (opcional) */}
                  {allowPriceEdit && (
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handlePriceChange(index, e.target.value)}
                      className="w-24 text-right border border-gray-300 rounded-lg py-1 px-2"
                      placeholder="Precio"
                    />
                  )}

                  {/* Total */}
                  <div className="min-w-[100px] text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.total)}
                    </p>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar producto"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No hay productos agregados
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Busca y selecciona productos para agregar
          </p>
        </div>
      )}

      {/* Resumen */}
      {selectedItems.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Subtotal Productos:</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(selectedItems.reduce((sum, item) => sum + item.total, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelector;
