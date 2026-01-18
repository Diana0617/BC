import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  PackageIcon,
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  ImageIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  HistoryIcon,
  RefreshCwIcon,
  FilterIcon,
  XIcon
} from 'lucide-react';
import productApi from '../../../../api/productApi';
import EditProductModal from './EditProductModal';
import ProductMovementsModal from './ProductMovementsModal';
import UploadImageModal from './UploadImageModal';

const ProductManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const branding = useSelector(state => state.businessConfiguration?.branding);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMovementsModal, setShowMovementsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productApi.getProducts(user.businessId, {
        search: searchTerm,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        productType: typeFilter !== 'all' ? typeFilter : undefined,
        page: currentPage,
        limit: itemsPerPage
      });

      if (response.success) {
        setProducts(response.data.products || response.data);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [user.businessId, searchTerm, categoryFilter, typeFilter, currentPage]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleViewMovements = (product) => {
    setSelectedProduct(product);
    setShowMovementsModal(true);
  };

  const handleUploadImage = (product) => {
    setSelectedProduct(product);
    setShowImageModal(true);
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      return;
    }

    try {
      const response = await productApi.deleteProduct(user.businessId, product.id);
      console.log('Delete response:', response);
      if (response.success) {
        await loadProducts(); // Aseguramos que se refresque la lista
        
        // Mostrar mensaje apropiado según si fue eliminado o desactivado
        if (response.deactivated) {
          alert(`⚠️ ${response.message}\n\nEl producto no se puede eliminar completamente porque tiene historial, pero ha sido desactivado.`);
        } else {
          alert('✅ Producto eliminado correctamente');
        }
      } else {
        alert('Error al eliminar el producto: ' + (response.message || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error al eliminar el producto: ' + (err.message || 'Error de red'));
    }
  };

  const getStockBadge = (stock, minStock) => {
    if (stock === 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Sin stock</span>;
    } else if (stock <= minStock) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Stock bajo</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">En stock</span>;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: branding?.primaryColor || '#2563eb' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <PackageIcon className="h-6 w-6" style={{ color: branding?.primaryColor || '#2563eb' }} />
              Gestión de Productos
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {products.length} productos registrados
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FilterIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
            
            <button
              onClick={loadProducts}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCwIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre, SKU, código de barras..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                <option value="FACIAL">Facial</option>
                <option value="CORPORAL">Corporal</option>
                <option value="CAPILAR">Capilar</option>
                <option value="MAQUILLAJE">Maquillaje</option>
                <option value="HERRAMIENTAS">Herramientas</option>
                <option value="EQUIPOS">Equipos</option>
                <option value="OTROS">Otros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="FOR_SALE">Para venta</option>
                <option value="FOR_PROCEDURES">Para procedimientos</option>
                <option value="BOTH">Ambos</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista de productos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].thumbnail?.url || product.images[0].main?.url}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <PackageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-900">
                        {product.currentStock || 0} uds
                      </span>
                      {getStockBadge(product.currentStock || 0, product.minStock || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(product.price || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(product.cost || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.category || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewMovements(product)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver movimientos"
                      >
                        <HistoryIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleUploadImage(product)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Gestionar imágenes"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar producto"
                      >
                        <EditIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar producto"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando productos desde el Stock Inicial o Compras
            </p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      {showEditModal && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
            loadProducts();
          }}
        />
      )}

      {showMovementsModal && selectedProduct && (
        <ProductMovementsModal
          product={selectedProduct}
          onClose={() => {
            setShowMovementsModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {showImageModal && selectedProduct && (
        <UploadImageModal
          product={selectedProduct}
          onClose={() => {
            setShowImageModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setShowImageModal(false);
            setSelectedProduct(null);
            loadProducts();
          }}
        />
      )}
    </div>
  );
};

export default ProductManagement;
