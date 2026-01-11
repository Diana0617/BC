import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

/**
 * Selector de productos para agregar a la venta
 * Permite buscar, seleccionar y ajustar cantidades
 */
export default function ProductSelector({ 
  businessId, 
  onProductsSelected, 
  onCancel 
}) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [businessId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products?businessId=${businessId}&available=true`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Error loading products');

      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const addProduct = (product) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setSelectedProducts(prev =>
          prev.map(p =>
            p.id === product.id
              ? { ...p, quantity: p.quantity + 1 }
              : p
          )
        );
      } else {
        alert('No hay más stock disponible');
      }
    } else {
      setSelectedProducts(prev => [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock
      }]);
    }
  };

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeProduct(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      alert('Stock insuficiente');
      return;
    }

    setSelectedProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, quantity: newQuantity }
          : p
      )
    );
  };

  const getTotalAmount = () => {
    return selectedProducts.reduce((sum, product) =>
      sum + (product.price * product.quantity), 0
    );
  };

  const handleConfirm = () => {
    if (selectedProducts.length === 0) {
      alert('Selecciona al menos un producto');
      return;
    }
    onProductsSelected(selectedProducts);
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <ShoppingBagIcon className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Agregar Productos
            </h3>
            <p className="text-sm text-gray-500">
              Selecciona productos para la venta
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Búsqueda */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de Productos */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredProducts.map(product => {
              const selected = selectedProducts.find(p => p.id === product.id);
              const isOutOfStock = product.stock === 0;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-lg border-2 p-4 transition-all ${
                    selected
                      ? 'border-purple-500 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isOutOfStock ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h4>
                      {product.category && (
                        <p className="text-xs text-gray-500 mb-1">
                          {product.category}
                        </p>
                      )}
                      <p className="text-lg font-bold text-purple-600">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg ml-3"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${
                      product.stock > 5 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {isOutOfStock ? 'Sin stock' : `Stock: ${product.stock}`}
                    </span>

                    {selected ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(product.id, selected.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900">
                          {selected.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, selected.quantity + 1)}
                          disabled={selected.quantity >= product.stock}
                          className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addProduct(product)}
                        disabled={isOutOfStock}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Agregar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumen y Confirmación */}
      {selectedProducts.length > 0 && (
        <div className="border-t-2 border-gray-200 bg-white p-4">
          <div className="bg-purple-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">
                {selectedProducts.length} producto{selectedProducts.length > 1 ? 's' : ''} seleccionado{selectedProducts.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSelectedProducts([])}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Limpiar
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-2xl font-bold text-purple-600">
                {formatCurrency(getTotalAmount())}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircleIcon className="w-5 h-5" />
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
