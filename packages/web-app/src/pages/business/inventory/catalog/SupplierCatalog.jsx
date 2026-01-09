import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  BookOpenIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import supplierCatalogApi from '@shared/api/supplierCatalogApi';

const SupplierCatalog = () => {
  const business = useSelector(state => state.business?.currentBusiness);
  const [catalogItems, setCatalogItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    supplierId: '',
    category: '',
    search: '',
    available: 'true',
    page: 1,
    limit: 20
  });
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Debug: Log cuando cambia el business
  useEffect(() => {
    console.log('🏢 SupplierCatalog - Business state:', business);
    console.log('🏢 SupplierCatalog - Business ID:', business?.id);
  }, [business]);

  useEffect(() => {
    console.log('🔄 useEffect triggered - business.id:', business?.id);
    if (business?.id) {
      console.log('✅ Calling loadInitialData...');
      loadInitialData();
    } else {
      console.warn('⚠️ business.id is not available yet');
    }
  }, [business?.id]);

  useEffect(() => {
    if (business?.id) {
      loadCatalog();
    }
  }, [business?.id, filters.supplierId, filters.category, filters.available, filters.page]);

  const loadInitialData = async () => {
    try {
      console.log('🔍 Loading initial data with businessId:', business.id);
      const [suppliersRes, categoriesRes] = await Promise.all([
        supplierCatalogApi.getSuppliers(business.id),
        supplierCatalogApi.getCategories(business.id)
      ]);

      console.log('📦 Suppliers response:', suppliersRes);
      console.log('📂 Categories response:', categoriesRes);

      if (suppliersRes.success) setSuppliers(suppliersRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    }
  };

  const loadCatalog = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading catalog with businessId:', business.id, 'filters:', filters);
      const response = await supplierCatalogApi.getCatalog(business.id, filters);
      
      console.log('📦 Catalog response:', response);
      
      if (response.success) {
        setCatalogItems(response.data);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('❌ Error loading catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    loadCatalog();
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const selectedSupplier = suppliers.find(s => s.id === filters.supplierId);
      await supplierCatalogApi.downloadPDF(business.id, {
        supplierId: filters.supplierId,
        category: filters.category,
        supplierName: selectedSupplier?.name
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al generar PDF');
    } finally {
      setDownloading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      supplierId: '',
      category: '',
      search: '',
      available: 'true',
      page: 1,
      limit: 20
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
              Catálogo de Proveedores
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {total} productos disponibles
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4" />
              Filtros
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading || catalogItems.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {downloading ? 'Generando...' : 'Descargar PDF'}
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Nombre o SKU..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {/* Proveedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor
                </label>
                <select
                  value={filters.supplierId}
                  onChange={(e) => setFilters(prev => ({ ...prev, supplierId: e.target.value, page: 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Todos</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Todas</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Disponibilidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disponibilidad
                </label>
                <select
                  value={filters.available}
                  onChange={(e) => setFilters(prev => ({ ...prev, available: e.target.value, page: 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Todos</option>
                  <option value="true">Disponibles</option>
                  <option value="false">No disponibles</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Buscar
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de items */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Cargando catálogo...</p>
          </div>
        ) : catalogItems.length === 0 ? (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron productos en el catálogo</p>
            <p className="text-sm text-gray-400 mt-2">
              Los productos se agregarán automáticamente al aprobar facturas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalogItems.map(item => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Imagen */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden p-2">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0].thumbnail?.url || item.images[0].main?.url}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <PhotoIcon className="h-16 w-16 text-gray-300" />
                  )}
                </div>

                {/* Información */}
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">SKU: {item.supplierSku}</p>
                
                {item.supplier && (
                  <p className="text-sm text-gray-600 mb-2">
                    {item.supplier.name}
                  </p>
                )}

                {item.category && (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded mb-2">
                    {item.category}
                  </span>
                )}

                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-gray-900">
                    ${parseFloat(item.price).toLocaleString('es-CO')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.available ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && total > filters.limit && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={filters.page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Página {filters.page} de {Math.ceil(total / filters.limit)}
            </span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={filters.page >= Math.ceil(total / filters.limit)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierCatalog;
