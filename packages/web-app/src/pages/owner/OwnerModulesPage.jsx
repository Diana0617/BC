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
    'CORE': 'Núcleo',
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
    </div>
  );
};

/**
 * Tarjeta de módulo individual
 */
const ModuleCard = ({ module, helpers, loading }) => {
  // Mapeo de traducciones locales
  const categoryLabels = {
    'CORE': 'Núcleo',
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
    'CORE': 'Núcleo',
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Módulo</h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete la información para crear un nuevo módulo del sistema
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
              {/* Nombre para mostrar */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del módulo *
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
                {formData.displayName && (
                  <p className="text-xs text-gray-500 mt-1">
                    Nombre interno: <code>{generateName(formData.displayName)}</code>
                  </p>
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
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
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
            </div>

            {/* Selector de icono */}
            {formData.category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icono *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {availableIcons.map((iconOption) => (
                    <label
                      key={iconOption.value}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
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
                      <span className="text-2xl">{iconOption.icon}</span>
                      <span className="text-sm text-gray-700">{iconOption.label}</span>
                    </label>
                  ))}
                </div>
                {errors.icon && (
                  <p className="text-sm text-red-600 mt-1">{errors.icon}</p>
                )}
              </div>
            )}

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
                <option value="DEVELOPMENT">En Desarrollo</option>
                <option value="ACTIVE">Activo</option>
              </select>
            </div>
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
    'CORE': 'Núcleo',
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Editar Módulo</h2>
            <p className="text-sm text-gray-600 mt-1">
              Actualice la información del módulo: {module.displayName}
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
              {/* Nombre para mostrar */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del módulo *
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
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
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
            </div>

            {/* Selector de icono */}
            {formData.category && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icono *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {availableIcons.map((iconOption) => (
                    <label
                      key={iconOption.value}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
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
                      <span className="text-2xl">{iconOption.icon}</span>
                      <span className="text-sm text-gray-700">{iconOption.label}</span>
                    </label>
                  ))}
                </div>
                {errors.icon && (
                  <p className="text-sm text-red-600 mt-1">{errors.icon}</p>
                )}
              </div>
            )}

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

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="DEVELOPMENT">En Desarrollo</option>
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Eliminar Módulo</h2>
          
          <p className="text-gray-600 mb-6">
            ¿Cómo deseas eliminar el módulo "<strong>{module.displayName}</strong>"?
          </p>

          {/* Opciones de eliminación */}
          <div className="space-y-4 mb-6">
            {/* Eliminación suave */}
            <div className="border rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="deleteType"
                  value="soft"
                  checked={deleteType === 'soft'}
                  onChange={() => handleDeleteTypeChange('soft')}
                  className="mt-1 text-blue-600"
                />
                <div>
                  <div className="font-medium text-gray-900">Eliminación Suave</div>
                  <div className="text-sm text-gray-500">
                    Marca el módulo como <span className="font-mono text-orange-600">DEPRECATED</span>. 
                    El módulo permanece en la base de datos pero no estará disponible para nuevos usos.
                  </div>
                  <div className="text-sm text-green-600 mt-1">✅ Reversible</div>
                </div>
              </label>
            </div>

            {/* Eliminación permanente */}
            <div className="border rounded-lg p-4 border-red-200">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="deleteType"
                  value="permanent"
                  checked={deleteType === 'permanent'}
                  onChange={() => handleDeleteTypeChange('permanent')}
                  className="mt-1 text-red-600"
                />
                <div>
                  <div className="font-medium text-red-700">Eliminación Permanente</div>
                  <div className="text-sm text-gray-500">
                    Elimina completamente el módulo de la base de datos. 
                    Esta acción <strong>NO se puede deshacer</strong>.
                  </div>
                  <div className="text-sm text-red-600 mt-1">⚠️ No reversible</div>
                </div>
              </label>
            </div>
          </div>

          {/* Campo de confirmación para eliminación permanente */}
          {showConfirmInput && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <label className="block text-sm font-medium text-red-700 mb-2">
                Para confirmar la eliminación permanente, escriba el nombre del módulo:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={module.displayName}
                className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {confirmText && confirmText !== module.displayName && (
                <p className="text-sm text-red-600 mt-1">
                  El texto debe coincidir exactamente: "{module.displayName}"
                </p>
              )}
            </div>
          )}

          {/* Información del módulo */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm">
            <div><strong>Versión:</strong> {module.version}</div>
            <div><strong>Estado actual:</strong> <span className="font-mono">{module.status}</span></div>
            <div><strong>Categoría:</strong> {module.category}</div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={!canDelete || loading}
              className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
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