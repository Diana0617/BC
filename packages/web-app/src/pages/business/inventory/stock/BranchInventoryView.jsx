import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import branchApi from '../../../../api/branchApi';
import branchInventoryApi from '../../../../api/branchInventoryApi';
import {
  Search,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Filter,
  RefreshCw,
  Settings,
  History,
  Edit,
  CheckCircle,
  XCircle
} from 'lucide-react';

const BranchInventoryView = () => {
  const { user } = useSelector((state) => state.auth);

  // Estados principales
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 20;

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
    ok: 0
  });

  // Cargar sucursales
  const loadBranches = useCallback(async () => {
    try {
      setLoadingBranches(true);
      const data = await branchApi.getBranches(user.businessId);
      setBranches(data.branches || []);
      
      if (data.branches && data.branches.length > 0) {
        setSelectedBranch(data.branches[0]);
      }
    } catch (error) {
      setError('Error al cargar sucursales');
      console.error(error);
    } finally {
      setLoadingBranches(false);
    }
  }, [user.businessId]);

  // Cargar productos
  const loadProducts = useCallback(async () => {
    if (!selectedBranch) return;

    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (searchTerm) filters.search = searchTerm;
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      if (productTypeFilter !== 'all') filters.productType = productTypeFilter;
      if (stockStatusFilter !== 'all') filters.stockStatus = stockStatusFilter;

      const response = await branchInventoryApi.getBranchProducts(
        user.businessId,
        selectedBranch.id,
        filters
      );

      setProducts(response.data.products || []);
      setTotalProducts(response.data.pagination.total);
      setTotalPages(response.data.pagination.pages);

      // Calcular estadísticas
      calculateStats(response.data.products);

    } catch (error) {
      setError('Error al cargar productos: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user.businessId, selectedBranch, searchTerm, categoryFilter, productTypeFilter, stockStatusFilter, currentPage]);

  // Cargar sucursales al montar
  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  // Cargar productos cuando cambie la sucursal o filtros
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const calculateStats = (productsList) => {
    const stats = {
      total: productsList.length,
      lowStock: 0,
      outOfStock: 0,
      ok: 0
    };

    productsList.forEach(product => {
      switch (product.stockStatus) {
        case 'OUT_OF_STOCK':
          stats.outOfStock++;
          break;
        case 'LOW_STOCK':
          stats.lowStock++;
          break;
        case 'OK':
          stats.ok++;
          break;
      }
    });

    setStats(stats);
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    loadProducts();
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleProductTypeChange = (value) => {
    setProductTypeFilter(value);
    setCurrentPage(1);
  };

  const handleStockStatusChange = (value) => {
    setStockStatusFilter(value);
    setCurrentPage(1);
  };

  const getStockStatusBadge = (status) => {
    const badges = {
      'OUT_OF_STOCK': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Sin Stock',
        icon: <XCircle className="h-4 w-4" />
      },
      'LOW_STOCK': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Stock Bajo',
        icon: <AlertTriangle className="h-4 w-4" />
      },
      'OK': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Stock OK',
        icon: <CheckCircle className="h-4 w-4" />
      },
      'OVERSTOCK': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Sobre Stock',
        icon: <TrendingUp className="h-4 w-4" />
      }
    };

    const badge = badges[status] || badges['OK'];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getProductTypeLabel = (type) => {
    const types = {
      'FOR_SALE': 'Solo Venta',
      'FOR_PROCEDURES': 'Solo Procedimientos',
      'BOTH': 'Venta y Procedimientos'
    };
    return types[type] || type;
  };

  if (loadingBranches) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay sucursales configuradas
        </h3>
        <p className="text-gray-600">
          Configura al menos una sucursal para gestionar el inventario.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con selector de sucursal */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Inventario por Sucursal</h1>
            <p className="text-pink-100">Gestiona el stock de tus productos por sucursal</p>
          </div>
          <Package className="h-12 w-12 text-white opacity-80" />
        </div>

        {/* Selector de Sucursal */}
        {branches.length > 1 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <label className="block text-sm font-medium text-white mb-2">
              Sucursal Activa
            </label>
            <select
              value={selectedBranch?.id || ''}
              onChange={(e) => {
                const branch = branches.find(b => b.id === e.target.value);
                setSelectedBranch(branch);
                setCurrentPage(1);
              }}
              className="w-full bg-white text-gray-900 border-0 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-300 px-4 py-2"
            >
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Sucursal: {branches[0]?.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock OK</p>
              <p className="text-2xl font-bold text-green-600">{stats.ok}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sin Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, SKU o código de barras..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showFilters
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-5 w-5" />
              Filtros
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                <option value="HAIR">Cabello</option>
                <option value="SKIN">Piel</option>
                <option value="NAILS">Uñas</option>
                <option value="TOOLS">Herramientas</option>
                <option value="OTHER">Otros</option>
              </select>
            </div>

            {/* Filtro por tipo de producto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Producto
              </label>
              <select
                value={productTypeFilter}
                onChange={(e) => handleProductTypeChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="FOR_SALE">Solo Venta</option>
                <option value="FOR_PROCEDURES">Solo Procedimientos</option>
                <option value="BOTH">Venta y Procedimientos</option>
              </select>
            </div>

            {/* Filtro por estado de stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de Stock
              </label>
              <select
                value={stockStatusFilter}
                onChange={(e) => handleStockStatusChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="OUT_OF_STOCK">Sin Stock</option>
                <option value="LOW_STOCK">Stock Bajo</option>
                <option value="OK">Stock OK</option>
                <option value="OVERSTOCK">Sobre Stock</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Lista de productos */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-600">
            {searchTerm || categoryFilter !== 'all' || productTypeFilter !== 'all' || stockStatusFilter !== 'all'
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Carga productos en el Stock Inicial para comenzar'}
          </p>
        </div>
      ) : (
        <>
          {/* Tabla de productos */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Actual
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mín / Máx
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-pink-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            {product.brand && (
                              <div className="text-sm text-gray-500">
                                {product.brand}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.sku || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-600">
                          {getProductTypeLabel(product.productType)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {product.currentStock} {product.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">
                          {product.minStock} / {product.maxStock || '∞'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStockStatusBadge(product.stockStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Ajustar stock"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="Ver historial"
                          >
                            <History className="h-5 w-5" />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                            title="Configurar"
                          >
                            <Settings className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg shadow px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalProducts)}
                </span> de{' '}
                <span className="font-medium">{totalProducts}</span> productos
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BranchInventoryView;
