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
    
    // Error states
    error,
    createError,
    updateError,
    deleteError,
    
    // UI State
    showCreateModal,
    showEditModal,
    showDeleteModal,
    showDependenciesModal,
    showViewModal,
    editingModule,
    
    // Helpers
    helpers,
    
    // Computed
    computed
  } = useOwnerModules();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Mapeo de categorías y estados para traducción
  const categoryLabels = {
    'CORE': 'Inicial',
    'APPOINTMENTS': 'Citas',
    'PAYMENTS': 'Pagos',
    'INVENTORY': 'Inventario',
    'REPORTS': 'Reportes',
    'INTEGRATIONS': 'Integraciones',
    'COMMUNICATIONS': 'Comunicaciones',
    'ANALYTICS': 'Analíticas'
  };

  const statusLabels = {
    'DEVELOPMENT': 'En Desarrollo',
    'ACTIVE': 'Activo',
    'INACTIVE': 'Inactivo',
    'DEPRECATED': 'Obsoleto'
  };

  // Cargar módulos al montar
  useEffect(() => {
    console.log('🔄 OwnerModulesPage: Cargando módulos...');
    helpers.refresh();
  }, []);

  // Debug: Log cuando cambien los módulos
  useEffect(() => {
    console.log('📊 OwnerModulesPage - Estado actual:', {
      modules: modules,
      modulesLength: modules?.length || 0,
      loading,
      error
    });
  }, [modules, loading, error]);

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
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
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
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
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
        />
      )}
      
      {showEditModal && editingModule && (
        <EditModuleModal 
          module={editingModule}
          onClose={helpers.closeModals}
          loading={updateLoading}
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

      {showViewModal && editingModule && (
        <ViewModuleModal 
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
  // Mapeo de traducciones locales
  const categoryLabels = {
    'CORE': 'Inicial',
    'APPOINTMENTS': 'Citas',
    'PAYMENTS': 'Pagos',
    'INVENTORY': 'Inventario',
    'REPORTS': 'Reportes',
    'INTEGRATIONS': 'Integraciones',
    'COMMUNICATIONS': 'Comunicaciones',
    'ANALYTICS': 'Analíticas'
  };

  const statusLabels = {
    'DEVELOPMENT': 'En Desarrollo',
    'ACTIVE': 'Activo',
    'INACTIVE': 'Inactivo',
    'DEPRECATED': 'Obsoleto'
  };

  const getStatusBadge = (status) => {
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
        {statusLabels[status] || status}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {categoryLabels[category] || category}
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
              onClick={() => helpers.openViewModal(module)}
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
const CreateModuleModal = ({ onClose, loading }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    category: '',
    price: '',
    description: '',
    status: 'DEVELOPMENT',
    icon: ''
  });

  const [errors, setErrors] = useState({});
  const { actions } = useOwnerModules();

  // Mapeo de categorías a español
  const categoryLabels = {
    'CORE': 'Inicial',
    'APPOINTMENTS': 'Citas',
    'PAYMENTS': 'Pagos',
    'INVENTORY': 'Inventario',
    'REPORTS': 'Reportes',
    'INTEGRATIONS': 'Integraciones',
    'COMMUNICATIONS': 'Comunicaciones',
    'ANALYTICS': 'Analíticas'
  };

  // Iconos por categoría
  const iconsByCategory = {
    'CORE': [
      { value: 'cog-6-tooth', label: '⚙️ Configuración', icon: '⚙️' },
      { value: 'squares-plus', label: '⊞ Módulos', icon: '⊞' },
      { value: 'shield-check', label: '🛡️ Seguridad', icon: '🛡️' }
    ],
    'APPOINTMENTS': [
      { value: 'calendar-days', label: '📅 Calendario', icon: '📅' },
      { value: 'clock', label: '⏰ Horarios', icon: '⏰' },
      { value: 'user-group', label: '👥 Citas', icon: '👥' }
    ],
    'PAYMENTS': [
      { value: 'credit-card', label: '💳 Tarjetas', icon: '💳' },
      { value: 'banknotes', label: '💵 Pagos', icon: '💵' },
      { value: 'receipt-percent', label: '🧾 Facturas', icon: '🧾' }
    ],
    'INVENTORY': [
      { value: 'cube', label: '📦 Productos', icon: '📦' },
      { value: 'archive-box', label: '📋 Stock', icon: '📋' },
      { value: 'truck', label: '🚛 Suministros', icon: '🚛' }
    ],
    'REPORTS': [
      { value: 'chart-bar', label: '📊 Reportes', icon: '📊' },
      { value: 'document-chart-bar', label: '📈 Análisis', icon: '📈' },
      { value: 'clipboard-document-list', label: '📄 Informes', icon: '📄' }
    ],
    'INTEGRATIONS': [
      { value: 'link', label: '🔗 Conectores', icon: '🔗' },
      { value: 'globe-alt', label: '🌐 APIs', icon: '🌐' },
      { value: 'arrows-right-left', label: '↔️ Sincronización', icon: '↔️' }
    ],
    'COMMUNICATIONS': [
      { value: 'envelope', label: '📧 Email', icon: '📧' },
      { value: 'chat-bubble-left-right', label: '💬 Chat', icon: '💬' },
      { value: 'megaphone', label: '📢 Notificaciones', icon: '📢' }
    ],
    'ANALYTICS': [
      { value: 'chart-pie', label: '📊 Gráficos', icon: '📊' },
      { value: 'calculator', label: '🧮 Métricas', icon: '🧮' },
      { value: 'light-bulb', label: '💡 Insights', icon: '💡' }
    ]
  };

  // Generar name automáticamente desde displayName
  const generateName = (displayName) => {
    return displayName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
      .trim()
      .replace(/\s+/g, '_'); // Reemplazar espacios con guiones bajos
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updatedData = { ...prev, [name]: newValue };
      
      // Auto-generar name cuando cambie displayName
      if (name === 'displayName') {
        updatedData.name = generateName(value);
      }
      
      // Limpiar icon cuando cambie la categoría
      if (name === 'category') {
        updatedData.icon = '';
      }
      
      return updatedData;
    });
    
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'El nombre es requerido';
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
    
    if (!formData.icon) {
      newErrors.icon = 'Debe seleccionar un icono';
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
      // Preparar datos para envío
      const moduleData = {
        name: generateName(formData.displayName),
        displayName: formData.displayName,
        category: formData.category,
        description: formData.description,
        icon: formData.icon,
        pricing: {
          type: parseFloat(formData.price) === 0 ? 'FREE' : 'PAID',
          price: parseFloat(formData.price),
          currency: 'COP'
        },
        status: formData.status,
        version: '1.0.0',
        requiresConfiguration: false,
        permissions: [],
        dependencies: []
      };
      
      console.log('🚀 Creando módulo:', moduleData);
      
      const result = await actions.createModule(moduleData);
      console.log('✅ Módulo creado exitosamente:', result);
      
      // Refrescar la lista después de crear
      actions.fetchModules();
      
      onClose();
    } catch (error) {
      console.error('❌ Error creating module:', error);
      setErrors({ general: 'Error al crear el módulo. Por favor, inténtalo de nuevo.' });
    }
  };

  const availableIcons = iconsByCategory[formData.category] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-lg md:max-w-2xl xl:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Crear Nuevo Módulo</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Complete la información para crear un nuevo módulo del sistema
            </p>
          </div>

          <div className="px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
            {/* Error general */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Información básica */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Nombre para mostrar */}
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Nombre del módulo *
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Gestión de Citas"
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.displayName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.displayName && (
                  <p className="text-xs text-red-600 mt-1">{errors.displayName}</p>
                )}
                {formData.displayName && (
                  <p className="text-xs text-gray-500 mt-1">
                    Nombre interno: <code className="text-xs">{generateName(formData.displayName)}</code>
                  </p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar categoría</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-600 mt-1">{errors.category}</p>
                )}
              </div>

              {/* Precio */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
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
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.price && (
                  <p className="text-xs text-red-600 mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            {/* Selector de icono */}
            {formData.category && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Icono *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {availableIcons.map((iconOption) => (
                    <label
                      key={iconOption.value}
                      className={`flex items-center space-x-2 p-2 sm:p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.icon === iconOption.value
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="icon"
                        value={iconOption.value}
                        checked={formData.icon === iconOption.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-lg sm:text-2xl">{iconOption.icon}</span>
                      <span className="text-xs sm:text-sm text-gray-700 truncate">{iconOption.label}</span>
                    </label>
                  ))}
                </div>
                {errors.icon && (
                  <p className="text-xs text-red-600 mt-1">{errors.icon}</p>
                )}
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describa la funcionalidad principal del módulo..."
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Estado inicial
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="DEVELOPMENT">En Desarrollo</option>
                <option value="ACTIVE">Activo</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 disabled:bg-gray-400 flex items-center justify-center order-1 sm:order-2"
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
const EditModuleModal = ({ module, onClose, loading }) => {
  const [formData, setFormData] = useState({
    displayName: module?.displayName || '',
    category: module?.category || '',
    price: module?.pricing?.price || '',
    description: module?.description || '',
    status: module?.status || 'DEVELOPMENT',
    icon: module?.icon || ''
  });

  const [errors, setErrors] = useState({});
  const { actions } = useOwnerModules();

  // Mapeo de categorías a español
  const categoryLabels = {
    'CORE': 'Inicial',
    'APPOINTMENTS': 'Citas',
    'PAYMENTS': 'Pagos',
    'INVENTORY': 'Inventario',
    'REPORTS': 'Reportes',
    'INTEGRATIONS': 'Integraciones',
    'COMMUNICATIONS': 'Comunicaciones',
    'ANALYTICS': 'Analíticas'
  };

  // Iconos por categoría (igual que en CreateModal)
  const iconsByCategory = {
    'CORE': [
      { value: 'cog-6-tooth', label: '⚙️ Configuración', icon: '⚙️' },
      { value: 'squares-plus', label: '⊞ Módulos', icon: '⊞' },
      { value: 'shield-check', label: '🛡️ Seguridad', icon: '🛡️' }
    ],
    'APPOINTMENTS': [
      { value: 'calendar-days', label: '📅 Calendario', icon: '📅' },
      { value: 'clock', label: '⏰ Horarios', icon: '⏰' },
      { value: 'user-group', label: '👥 Citas', icon: '👥' }
    ],
    'PAYMENTS': [
      { value: 'credit-card', label: '💳 Tarjetas', icon: '💳' },
      { value: 'banknotes', label: '💵 Pagos', icon: '💵' },
      { value: 'receipt-percent', label: '🧾 Facturas', icon: '🧾' }
    ],
    'INVENTORY': [
      { value: 'cube', label: '📦 Productos', icon: '📦' },
      { value: 'archive-box', label: '📋 Stock', icon: '📋' },
      { value: 'truck', label: '🚛 Suministros', icon: '🚛' }
    ],
    'REPORTS': [
      { value: 'chart-bar', label: '📊 Reportes', icon: '📊' },
      { value: 'document-chart-bar', label: '📈 Análisis', icon: '📈' },
      { value: 'clipboard-document-list', label: '📄 Informes', icon: '📄' }
    ],
    'INTEGRATIONS': [
      { value: 'link', label: '🔗 Conectores', icon: '🔗' },
      { value: 'globe-alt', label: '🌐 APIs', icon: '🌐' },
      { value: 'arrows-right-left', label: '↔️ Sincronización', icon: '↔️' }
    ],
    'COMMUNICATIONS': [
      { value: 'envelope', label: '📧 Email', icon: '📧' },
      { value: 'chat-bubble-left-right', label: '💬 Chat', icon: '💬' },
      { value: 'megaphone', label: '📢 Notificaciones', icon: '📢' }
    ],
    'ANALYTICS': [
      { value: 'chart-pie', label: '📊 Gráficos', icon: '📊' },
      { value: 'calculator', label: '🧮 Métricas', icon: '🧮' },
      { value: 'light-bulb', label: '💡 Insights', icon: '💡' }
    ]
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };
      
      // Limpiar icon cuando cambie la categoría
      if (name === 'category') {
        updatedData.icon = '';
      }
      
      return updatedData;
    });
    
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'El nombre es requerido';
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
    
    if (!formData.icon) {
      newErrors.icon = 'Debe seleccionar un icono';
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
      // Preparar datos para envío
      const moduleData = {
        displayName: formData.displayName,
        category: formData.category,
        description: formData.description,
        icon: formData.icon,
        pricing: {
          type: parseFloat(formData.price) === 0 ? 'FREE' : 'PAID',
          price: parseFloat(formData.price),
          currency: 'COP'
        },
        status: formData.status
      };
      
      await actions.updateModule(module.id, moduleData);
      onClose();
    } catch (error) {
      console.error('Error updating module:', error);
      setErrors({ general: 'Error al actualizar el módulo. Por favor, inténtalo de nuevo.' });
    }
  };

  const availableIcons = iconsByCategory[formData.category] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-lg md:max-w-2xl xl:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Editar Módulo</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Actualice la información del módulo: {module.displayName}
            </p>
          </div>

          <div className="px-4 sm:px-6 py-4 space-y-4 sm:space-y-6">
            {/* Error general */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Información básica */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Nombre para mostrar */}
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Nombre del módulo *
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Gestión de Citas"
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.displayName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.displayName && (
                  <p className="text-xs text-red-600 mt-1">{errors.displayName}</p>
                )}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar categoría</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-600 mt-1">{errors.category}</p>
                )}
              </div>

              {/* Precio */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
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
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.price && (
                  <p className="text-xs text-red-600 mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            {/* Selector de icono */}
            {formData.category && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Icono *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {availableIcons.map((iconOption) => (
                    <label
                      key={iconOption.value}
                      className={`flex items-center space-x-2 p-2 sm:p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.icon === iconOption.value
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="icon"
                        value={iconOption.value}
                        checked={formData.icon === iconOption.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-lg sm:text-2xl">{iconOption.icon}</span>
                      <span className="text-xs sm:text-sm text-gray-700 truncate">{iconOption.label}</span>
                    </label>
                  ))}
                </div>
                {errors.icon && (
                  <p className="text-xs text-red-600 mt-1">{errors.icon}</p>
                )}
              </div>
            )}

            {/* Descripción */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describa la funcionalidad principal del módulo..."
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-600 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="DEVELOPMENT">En Desarrollo</option>
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-pink-600 text-white text-sm rounded-md hover:bg-pink-700 disabled:bg-gray-400 flex items-center justify-center order-1 sm:order-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Actualizando...' : 'Actualizar Módulo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Modal para confirmar eliminación con opciones avanzadas
 */
const DeleteModuleModal = ({ module, onClose, loading }) => {
  const { actions } = useOwnerModules();
  const [deleteType, setDeleteType] = useState('soft'); // 'soft' o 'permanent'
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmInput, setShowConfirmInput] = useState(false);

  const handleDeleteTypeChange = (type) => {
    setDeleteType(type);
    setShowConfirmInput(type === 'permanent');
    setConfirmText('');
  };

  const handleDelete = async () => {
    if (deleteType === 'permanent' && confirmText !== module.displayName) {
      return;
    }

    try {
      if (deleteType === 'permanent') {
        await actions.deleteModulePermanently(module.id);
      } else {
        await actions.deleteModule(module.id);
      }
      onClose();
    } catch (error) {
      console.error('Error eliminando módulo:', error);
    }
  };

  const canDelete = deleteType === 'soft' || (deleteType === 'permanent' && confirmText === module.displayName);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-lg md:max-w-xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Eliminar Módulo</h2>
          
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            ¿Cómo deseas eliminar el módulo "<strong>{module.displayName}</strong>"?
          </p>

          {/* Opciones de eliminación */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {/* Eliminación suave */}
            <div className="border rounded-lg p-3 sm:p-4">
              <label className="flex items-start space-x-2 sm:space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="deleteType"
                  value="soft"
                  checked={deleteType === 'soft'}
                  onChange={() => handleDeleteTypeChange('soft')}
                  className="mt-1 text-blue-600 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-medium text-gray-900">Eliminación Suave</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">
                    Marca el módulo como <span className="font-mono text-orange-600 text-xs">DEPRECATED</span>. 
                    El módulo permanece en la base de datos pero no estará disponible para nuevos usos.
                  </div>
                  <div className="text-xs sm:text-sm text-green-600 mt-1">✅ Reversible</div>
                </div>
              </label>
            </div>

            {/* Eliminación permanente */}
            <div className="border rounded-lg p-3 sm:p-4 border-red-200">
              <label className="flex items-start space-x-2 sm:space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="deleteType"
                  value="permanent"
                  checked={deleteType === 'permanent'}
                  onChange={() => handleDeleteTypeChange('permanent')}
                  className="mt-1 text-red-600 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-medium text-red-700">Eliminación Permanente</div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1">
                    Elimina completamente el módulo de la base de datos. 
                    Esta acción <strong>NO se puede deshacer</strong>.
                  </div>
                  <div className="text-xs sm:text-sm text-red-600 mt-1">⚠️ No reversible</div>
                </div>
              </label>
            </div>
          </div>

          {/* Campo de confirmación para eliminación permanente */}
          {showConfirmInput && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <label className="block text-xs sm:text-sm font-medium text-red-700 mb-2">
                Para confirmar la eliminación permanente, escriba el nombre del módulo:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={module.displayName}
                className="w-full px-3 py-2 text-sm border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {confirmText && confirmText !== module.displayName && (
                <p className="text-xs text-red-600 mt-1">
                  El texto debe coincidir exactamente: "{module.displayName}"
                </p>
              )}
            </div>
          )}

          {/* Información del módulo */}
          <div className="mb-4 sm:mb-6 p-3 bg-gray-50 rounded-lg text-xs sm:text-sm">
            <div><strong>Versión:</strong> {module.version}</div>
            <div><strong>Estado actual:</strong> <span className="font-mono text-xs">{module.status}</span></div>
            <div><strong>Categoría:</strong> {module.category}</div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={!canDelete || loading}
              className={`w-full sm:w-auto px-4 py-2 text-white text-sm rounded-md disabled:opacity-50 order-1 sm:order-2 ${
                deleteType === 'permanent' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {loading ? (
                'Procesando...'
              ) : deleteType === 'permanent' ? (
                'Eliminar Permanentemente'
              ) : (
                'Marcar como Obsoleto'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal para vista previa detallada del módulo
 */
const ViewModuleModal = ({ module, onClose }) => {
  // Mapeo de categorías y estados para traducción
  const categoryLabels = {
    'CORE': 'Inicial',
    'APPOINTMENTS': 'Citas',
    'PAYMENTS': 'Pagos',
    'INVENTORY': 'Inventario',
    'REPORTS': 'Reportes',
    'INTEGRATIONS': 'Integraciones',
    'COMMUNICATIONS': 'Comunicaciones',
    'ANALYTICS': 'Analíticas'
  };

  const statusLabels = {
    'DEVELOPMENT': 'En Desarrollo',
    'ACTIVE': 'Activo',
    'INACTIVE': 'Inactivo',
    'DEPRECATED': 'Obsoleto'
  };

  const getStatusBadge = (status) => {
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
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatPrice = (pricing) => {
    if (!pricing || pricing.type === 'FREE' || pricing.price === 0) {
      return 'Gratuito';
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: pricing.currency || 'COP'
    }).format(pricing.price);
  };

  const getIconEmoji = (iconName) => {
    const iconMap = {
      'cog-6-tooth': '⚙️',
      'squares-plus': '⊞',
      'shield-check': '🛡️',
      'calendar-days': '📅',
      'clock': '⏰',
      'user-group': '👥',
      'credit-card': '💳',
      'banknotes': '💵',
      'receipt-percent': '🧾',
      'cube': '📦',
      'archive-box': '📋',
      'truck': '🚛',
      'chart-bar': '📊',
      'document-chart-bar': '📈',
      'clipboard-document-list': '📄',
      'link': '🔗',
      'globe-alt': '🌐',
      'arrows-right-left': '↔️',
      'envelope': '📧',
      'chat-bubble-left-right': '💬',
      'megaphone': '📢',
      'chart-pie': '📊',
      'calculator': '🧮',
      'light-bulb': '💡'
    };
    return iconMap[iconName] || '📦';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-lg md:max-w-3xl xl:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-pink-100 rounded-lg">
                <span className="text-2xl">{getIconEmoji(module.icon)}</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {module.displayName}
                </h2>
                <p className="text-sm text-gray-500 font-mono">{module.name}</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {getStatusBadge(module.status)}
              <span className="text-xs text-gray-500">v{module.version}</span>
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {module.description || 'No hay descripción disponible.'}
            </p>
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Información básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Información General
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Categoría:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {categoryLabels[module.category] || module.category}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Precio:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPrice(module.pricing)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Configuración:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    module.requiresConfiguration 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {module.requiresConfiguration ? 'Requerida' : 'No requerida'}
                  </span>
                </div>
                
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Creado:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(module.createdAt).toLocaleDateString('es-CO')}
                  </span>
                </div>
                
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Actualizado:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(module.updatedAt).toLocaleDateString('es-CO')}
                  </span>
                </div>
              </div>
            </div>

            {/* Información técnica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Información Técnica
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 block mb-1">ID del Módulo:</span>
                  <code className="text-xs bg-gray-100 p-1 rounded text-gray-800 break-all">
                    {module.id}
                  </code>
                </div>
                
                {module.permissions && module.permissions.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">Permisos:</span>
                    <div className="flex flex-wrap gap-1">
                      {module.permissions.slice(0, 6).map((permission, index) => (
                        <span 
                          key={index}
                          className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                        >
                          {permission}
                        </span>
                      ))}
                      {module.permissions.length > 6 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{module.permissions.length - 6} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {module.dependencies && module.dependencies.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-2">Dependencias:</span>
                    <div className="space-y-1">
                      {module.dependencies.slice(0, 3).map((depId, index) => (
                        <div key={index} className="text-xs bg-orange-50 text-orange-800 p-2 rounded border-l-2 border-orange-200">
                          {depId}
                        </div>
                      ))}
                      {module.dependencies.length > 3 && (
                        <div className="text-xs text-gray-500 p-2">
                          +{module.dependencies.length - 3} dependencias más
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Esquema de configuración si existe */}
          {module.configurationSchema && Object.keys(module.configurationSchema).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Esquema de Configuración
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(module.configurationSchema, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Última actualización: {new Date(module.updatedAt).toLocaleString('es-CO')}
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal para mostrar dependencias
 */
const DependenciesModal = ({ module, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
    <div className="bg-white rounded-lg w-full max-w-xs sm:max-w-lg md:max-w-xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
      <div className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Dependencias de {module.displayName}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          Este módulo depende de los siguientes módulos:
        </p>
        <div className="space-y-2 mb-4 sm:mb-6 max-h-48 sm:max-h-64 overflow-y-auto">
          {module.dependencies?.map((depId) => (
            <div key={depId} className="p-2 sm:p-3 bg-gray-50 rounded text-sm">
              Módulo ID: {depId}
            </div>
          ))}
          {(!module.dependencies || module.dependencies.length === 0) && (
            <div className="p-2 sm:p-3 bg-gray-50 rounded text-sm text-gray-500 text-center">
              No hay dependencias
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default OwnerModulesPage;