import React, { useEffect, useState } from 'react';
import { useOwnerModules } from '../../../../shared/src/index.js';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

/**
 * Página principal de gestión de módulos del Owner
 */
const OwnerModulesPage = () => {
  const {
    // State
    modules,
    totalModules,
    modulesByCategory,
    pagination,
    filters,
    categories,
    statuses,
    
    // Loading states
    loading,
    createLoading,
    updateLoading,
    deleteLoading,
    
    // UI State
    showCreateModal,
    showEditModal,
    showDeleteModal,
    showDependenciesModal,
    editingModule,
    
    // Helpers
    helpers,
    
    // Computed
    computed
  } = useOwnerModules();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Cargar módulos al montar
  useEffect(() => {
    helpers.refresh();
  }, []);

  // Filtrar en tiempo real
  const handleSearch = (value) => {
    setSearchTerm(value);
    helpers.searchModules(value);
  };

  const handleCategoryFilter = (category) => {
    setFilterCategory(category);
    helpers.filterByCategory(category);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    helpers.filterModules({ status: status || undefined });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Módulos</h1>
          <p className="text-gray-600 mt-1">
            Administra los módulos del sistema Business Control
          </p>
        </div>
        
        <button
          onClick={helpers.openCreateModal}
          className="flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nuevo Módulo</span>
        </button>
      </div>

      {/* Estadísticas por categoría */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {computed.categoryStats.map((category) => (
          <div 
            key={category.value} 
            className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-colors ${
              filterCategory === category.value ? 'ring-2 ring-pink-500 bg-pink-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleCategoryFilter(
              filterCategory === category.value ? '' : category.value
            )}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{category.count}</div>
              <div className="text-xs text-gray-600">{category.label}</div>
              <div className="text-xs text-green-600">{category.activeCount} activos</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar módulos..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por categoría */}
          <div className="relative">
            <FunnelIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
            >
              <option value="">Todos los estados</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Estadísticas */}
          <div className="flex items-center justify-end space-x-4 text-sm text-gray-600">
            <span>Total: {totalModules}</span>
            <span>Mostrando: {modules.length}</span>
          </div>
        </div>
      </div>

      {/* Lista de módulos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            <span className="ml-3 text-gray-600">Cargando módulos...</span>
          </div>
        ) : modules.length === 0 ? (
          <div className="text-center py-12">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-gray-500 mb-4">
              {searchTerm || filterCategory || filterStatus 
                ? 'No se encontraron módulos con los filtros aplicados'
                : 'No hay módulos registrados'
              }
            </div>
            {!searchTerm && !filterCategory && !filterStatus && (
              <button
                onClick={helpers.openCreateModal}
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Crear el primer módulo
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid de módulos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {modules.map((module) => (
                <ModuleCard 
                  key={module.id} 
                  module={module} 
                  helpers={helpers}
                  loading={updateLoading || deleteLoading}
                />
              ))}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => helpers.goToPage(pagination.page - 1)}
                    disabled={!computed.hasPrevPage}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => helpers.goToPage(pagination.page + 1)}
                    disabled={!computed.hasNextPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Siguiente
                  </button>
                </div>
                
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">
                        {((pagination.page - 1) * pagination.itemsPerPage) + 1}
                      </span>{' '}
                      a{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.itemsPerPage, totalModules)}
                      </span>{' '}
                      de{' '}
                      <span className="font-medium">{totalModules}</span> resultados
                    </p>
                  </div>
                  
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => helpers.goToPage(pagination.page - 1)}
                        disabled={!computed.hasPrevPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + Math.max(1, pagination.page - 2);
                        return (
                          <button
                            key={page}
                            onClick={() => helpers.goToPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.page
                                ? 'z-10 bg-pink-50 border-pink-500 text-pink-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => helpers.goToPage(pagination.page + 1)}
                        disabled={!computed.hasNextPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <CreateModuleModal 
          onClose={helpers.closeModals}
          loading={createLoading}
          categories={categories}
          statuses={statuses}
        />
      )}
      
      {showEditModal && editingModule && (
        <EditModuleModal 
          module={editingModule}
          onClose={helpers.closeModals}
          loading={updateLoading}
          categories={categories}
          statuses={statuses}
        />
      )}
      
      {showDeleteModal && editingModule && (
        <DeleteModuleModal 
          module={editingModule}
          onClose={helpers.closeModals}
          loading={deleteLoading}
        />
      )}

      {showDependenciesModal && editingModule && (
        <DependenciesModal 
          module={editingModule}
          onClose={helpers.closeModals}
        />
      )}
    </div>
  );
};

/**
 * Tarjeta de módulo individual
 */
const ModuleCard = ({ module, helpers, loading }) => {
  const getStatusBadge = (status) => {
    const statusInfo = helpers.getStatusInfo(status);
    const statusConfig = {
      DEVELOPMENT: { color: 'yellow', icon: WrenchScrewdriverIcon },
      ACTIVE: { color: 'green', icon: CheckCircleIcon },
      INACTIVE: { color: 'gray', icon: ClockIcon },
      DEPRECATED: { color: 'red', icon: XCircleIcon }
    };
    
    const config = statusConfig[status] || statusConfig.INACTIVE;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {statusInfo.label}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const categoryInfo = helpers.getCategoryInfo(category);
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {categoryInfo.label}
      </span>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header de la tarjeta */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <CubeIcon className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {module.displayName}
              </h3>
              <p className="text-sm text-gray-500">{module.name}</p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            {getStatusBadge(module.status)}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {module.description}
        </p>

        {/* Metadatos */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Categoría:</span>
            {getCategoryBadge(module.category)}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Versión:</span>
            <span className="text-gray-900">{module.version}</span>
          </div>
          
          {module.requiresConfiguration && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Configuración:</span>
              <span className="text-yellow-600">Requerida</span>
            </div>
          )}
          
          {module.dependencies && module.dependencies.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Dependencias:</span>
              <button
                onClick={() => helpers.openDependenciesModal(module)}
                className="text-blue-600 hover:text-blue-800"
              >
                Ver ({module.dependencies.length})
              </button>
            </div>
          )}
        </div>

        {/* Permisos */}
        {module.permissions && module.permissions.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Permisos:</p>
            <div className="flex flex-wrap gap-1">
              {module.permissions.slice(0, 3).map((permission) => (
                <span 
                  key={permission}
                  className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded"
                >
                  {permission}
                </span>
              ))}
              {module.permissions.length > 3 && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                  +{module.permissions.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <button
              onClick={() => helpers.selectModule(module.id)}
              className="text-indigo-600 hover:text-indigo-900 text-sm"
              title="Ver detalles"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => helpers.openEditModal(module)}
              disabled={loading}
              className="text-pink-600 hover:text-pink-900 disabled:text-gray-400 text-sm"
              title="Editar"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => helpers.openDeleteModal(module)}
              disabled={loading || !helpers.canDeleteModule(module.id)}
              className="text-red-600 hover:text-red-900 disabled:text-gray-400 text-sm"
              title={helpers.canDeleteModule(module.id) ? "Eliminar" : "No se puede eliminar (tiene dependencias)"}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={() => helpers.toggleModuleStatus(module.id, module.status)}
            disabled={loading}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              module.status === 'ACTIVE'
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {module.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal para crear módulo
 */
const CreateModuleModal = ({ onClose, loading, categories, statuses }) => {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    category: '',
    price: '',
    description: '',
    features: [''],
    dependencies: [],
    status: 'DEVELOPMENT',
    version: '1.0.0',
    requiresConfiguration: false,
    permissions: ['']
  });

  const [errors, setErrors] = useState({});
  const [availableModules, setAvailableModules] = useState([]);
  const { actions } = useOwnerModules();

  // Cargar módulos disponibles para dependencias
  useEffect(() => {
    const loadAvailableModules = async () => {
      try {
        // Usar la API directamente para no interferir con el estado principal
        const { ownerModulesApi } = await import('../../../../shared/src/api/ownerModulesApi.js');
        const response = await ownerModulesApi.getAllModules({ status: 'ACTIVE' });
        setAvailableModules(response.data?.data || []);
      } catch (error) {
        console.error('Error loading available modules:', error);
      }
    };
    loadAvailableModules();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (arrayName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleDependencyToggle = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.includes(moduleId)
        ? prev.dependencies.filter(id => id !== moduleId)
        : [...prev.dependencies, moduleId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (!/^[a-z_][a-z0-9_]*$/.test(formData.name)) {
      newErrors.name = 'El nombre debe ser snake_case (ej: appointment_management)';
    }
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'El nombre para mostrar es requerido';
    }
    
    if (!formData.category) {
      newErrors.category = 'La categoría es requerida';
    }
    
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'El precio debe ser un número válido mayor o igual a 0';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    
    // Validar que al menos haya una característica no vacía
    const validFeatures = formData.features.filter(f => f.trim());
    if (validFeatures.length === 0) {
      newErrors.features = 'Debe agregar al menos una característica';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Limpiar arrays de elementos vacíos
      const cleanedData = {
        ...formData,
        price: parseFloat(formData.price),
        features: formData.features.filter(f => f.trim()),
        permissions: formData.permissions.filter(p => p.trim())
      };
      
      await actions.createModule(cleanedData);
      onClose();
    } catch (error) {
      console.error('Error creating module:', error);
      setErrors({ general: 'Error al crear el módulo. Por favor, inténtalo de nuevo.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Módulo</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete todos los campos para crear un nuevo módulo del sistema
            </p>
          </div>

          <div className="px-6 py-4 space-y-6">
            {/* Error general */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre interno */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre interno *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="appointment_management"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Nombre único en formato snake_case
                </p>
              </div>

              {/* Nombre para mostrar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre para mostrar *
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Gestión de Citas"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.displayName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.displayName && (
                  <p className="text-sm text-red-600 mt-1">{errors.displayName}</p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                )}
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (COP) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="5000"
                  min="0"
                  step="100"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.price && (
                  <p className="text-sm text-red-600 mt-1">{errors.price}</p>
                )}
              </div>

              {/* Versión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Versión
                </label>
                <input
                  type="text"
                  name="version"
                  value={formData.version}
                  onChange={handleInputChange}
                  placeholder="1.0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado inicial
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describa la funcionalidad principal del módulo..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Características */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Características *
              </label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleArrayChange('features', index, e.target.value)}
                    placeholder="Creación de citas"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('features', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('features')}
                className="text-pink-600 hover:text-pink-800 text-sm flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Agregar característica
              </button>
              {errors.features && (
                <p className="text-sm text-red-600 mt-1">{errors.features}</p>
              )}
            </div>

            {/* Permisos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permisos requeridos
              </label>
              {formData.permissions.map((permission, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={permission}
                    onChange={(e) => handleArrayChange('permissions', index, e.target.value)}
                    placeholder="appointments.create"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  {formData.permissions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('permissions', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('permissions')}
                className="text-pink-600 hover:text-pink-800 text-sm flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Agregar permiso
              </button>
            </div>

            {/* Configuración requerida */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="requiresConfiguration"
                checked={formData.requiresConfiguration}
                onChange={handleInputChange}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Requiere configuración adicional
              </label>
            </div>

            {/* Dependencias */}
            {availableModules.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dependencias (opcional)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                  {availableModules.map((module) => (
                    <div key={module.id} className="flex items-center p-3 border-b border-gray-100 last:border-b-0">
                      <input
                        type="checkbox"
                        checked={formData.dependencies.includes(module.id)}
                        onChange={() => handleDependencyToggle(module.id)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {module.displayName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {module.name} - {module.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selecciona los módulos de los que depende este módulo
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-400 flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Creando...' : 'Crear Módulo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Modal para editar módulo (placeholder)
 */
const EditModuleModal = ({ module, onClose, loading, categories, statuses }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Editar Módulo: {module.displayName}
        </h2>
        <p className="text-gray-600 mb-4">
          Modal de edición de módulo - Implementar formulario completo
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            disabled={loading}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:bg-gray-400"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Modal para confirmar eliminación
 */
const DeleteModuleModal = ({ module, onClose, loading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-md w-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h2>
        <p className="text-gray-600 mb-4">
          ¿Estás seguro de que deseas eliminar el módulo "<strong>{module.displayName}</strong>"?
        </p>
        <p className="text-sm text-red-600 mb-6">
          Esta acción marcará el módulo como deprecated.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Modal para mostrar dependencias (placeholder)
 */
const DependenciesModal = ({ module, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-lg w-full">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Dependencias de {module.displayName}
        </h2>
        <p className="text-gray-600 mb-4">
          Este módulo depende de los siguientes módulos:
        </p>
        <div className="space-y-2 mb-6">
          {module.dependencies?.map((depId) => (
            <div key={depId} className="p-2 bg-gray-50 rounded">
              Módulo ID: {depId}
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default OwnerModulesPage;