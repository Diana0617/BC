import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchOwnerModules,
  fetchOwnerModuleById,
  fetchOwnerModulesByCategory,
  createOwnerModule,
  updateOwnerModule,
  updateOwnerModuleStatus,
  fetchOwnerModuleDependencies,
  deleteOwnerModule,
  setFilters,
  resetFilters,
  setSearch,
  setCategory,
  setPage,
  setShowCreateModal,
  setShowEditModal,
  setShowDeleteModal,
  setShowDependenciesModal,
  setEditingModule,
  clearErrors,
  clearSelectedModule,
  resetOwnerModules
} from '../store/slices/ownerModulesSlice';

/**
 * Hook personalizado para gestión de módulos (OWNER)
 */
export const useOwnerModules = () => {
  const dispatch = useDispatch();
  
  // Selectors
  const {
    modules,
    totalModules,
    modulesByCategory,
    selectedModule,
    selectedModuleDependencies,
    pagination,
    filters,
    loading,
    selectedModuleLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    categoryLoading,
    dependenciesLoading,
    error,
    selectedModuleError,
    createError,
    updateError,
    deleteError,
    categoryError,
    dependenciesError,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    showDependenciesModal,
    editingModule,
    categories,
    statuses
  } = useSelector(state => state.ownerModules);

  // Actions
  const actions = {
    // Fetch operations
    fetchModules: useCallback((params) => dispatch(fetchOwnerModules(params)), [dispatch]),
    fetchModuleById: useCallback((moduleId) => dispatch(fetchOwnerModuleById(moduleId)), [dispatch]),
    fetchModulesByCategory: useCallback((category, params) => dispatch(fetchOwnerModulesByCategory({ category, ...params })), [dispatch]),
    fetchModuleDependencies: useCallback((moduleId) => dispatch(fetchOwnerModuleDependencies(moduleId)), [dispatch]),
    
    // CRUD operations
    createModule: useCallback((moduleData) => dispatch(createOwnerModule(moduleData)), [dispatch]),
    updateModule: useCallback((moduleId, moduleData) => dispatch(updateOwnerModule({ moduleId, moduleData })), [dispatch]),
    deleteModule: useCallback((moduleId) => dispatch(deleteOwnerModule(moduleId)), [dispatch]),
    updateModuleStatus: useCallback((moduleId, status) => dispatch(updateOwnerModuleStatus({ moduleId, status })), [dispatch]),
    
    // Filters and search
    setFilters: useCallback((filters) => dispatch(setFilters(filters)), [dispatch]),
    resetFilters: useCallback(() => dispatch(resetFilters()), [dispatch]),
    setSearch: useCallback((search) => dispatch(setSearch(search)), [dispatch]),
    setCategory: useCallback((category) => dispatch(setCategory(category)), [dispatch]),
    setPage: useCallback((page) => dispatch(setPage(page)), [dispatch]),
    
    // UI State
    setShowCreateModal: useCallback((show) => dispatch(setShowCreateModal(show)), [dispatch]),
    setShowEditModal: useCallback((show) => dispatch(setShowEditModal(show)), [dispatch]),
    setShowDeleteModal: useCallback((show) => dispatch(setShowDeleteModal(show)), [dispatch]),
    setShowDependenciesModal: useCallback((show) => dispatch(setShowDependenciesModal(show)), [dispatch]),
    setEditingModule: useCallback((module) => dispatch(setEditingModule(module)), [dispatch]),
    
    // Cleanup
    clearErrors: useCallback(() => dispatch(clearErrors()), [dispatch]),
    clearSelectedModule: useCallback(() => dispatch(clearSelectedModule()), [dispatch]),
    reset: useCallback(() => dispatch(resetOwnerModules()), [dispatch])
  };

  // Computed values
  const computed = {
    hasModules: modules.length > 0,
    hasSelectedModule: !!selectedModule,
    hasErrors: !!(error || selectedModuleError || createError || updateError || deleteError || categoryError || dependenciesError),
    isAnyLoading: loading || selectedModuleLoading || createLoading || updateLoading || deleteLoading || categoryLoading || dependenciesLoading,
    canCreateModule: !createLoading,
    canEditModule: !!editingModule && !updateLoading,
    canDeleteModule: !!editingModule && !deleteLoading,
    hasNextPage: pagination.page < pagination.totalPages,
    hasPrevPage: pagination.page > 1,
    
    // Filtros y categorías
    availableCategories: categories,
    availableStatuses: statuses,
    activeCategory: filters.category,
    
    // Estadísticas por categoría
    categoryStats: categories.map(cat => ({
      ...cat,
      count: modulesByCategory[cat.value]?.length || 0,
      activeCount: modulesByCategory[cat.value]?.filter(m => m.status === 'ACTIVE').length || 0
    }))
  };

  // Helper functions
  const helpers = {
    // Navegar a una página específica
    goToPage: (page) => {
      actions.setPage(page);
      actions.fetchModules({ ...filters, page });
    },
    
    // Buscar módulos
    searchModules: (searchTerm) => {
      actions.setSearch(searchTerm);
      actions.fetchModules({ ...filters, search: searchTerm, page: 1 });
    },
    
    // Filtrar por categoría
    filterByCategory: (category) => {
      const updatedFilters = { ...filters, category, page: 1 };
      actions.setCategory(category);
      actions.setPage(1);
      actions.fetchModules(updatedFilters);
    },
    
    // Filtrar módulos
    filterModules: (newFilters) => {
      const updatedFilters = { ...filters, ...newFilters, page: 1 };
      actions.setFilters(updatedFilters);
      actions.fetchModules(updatedFilters);
    },
    
    // Abrir modal de creación
    openCreateModal: () => {
      actions.clearErrors();
      actions.setShowCreateModal(true);
    },
    
    // Abrir modal de edición
    openEditModal: (module) => {
      actions.clearErrors();
      actions.setEditingModule(module);
      actions.setShowEditModal(true);
    },
    
    // Abrir modal de eliminación
    openDeleteModal: (module) => {
      actions.clearErrors();
      actions.setEditingModule(module);
      actions.setShowDeleteModal(true);
    },
    
    // Abrir modal de dependencias
    openDependenciesModal: (module) => {
      actions.clearErrors();
      actions.setEditingModule(module);
      actions.fetchModuleDependencies(module.id);
      actions.setShowDependenciesModal(true);
    },
    
    // Cerrar modales
    closeModals: () => {
      actions.setShowCreateModal(false);
      actions.setShowEditModal(false);
      actions.setShowDeleteModal(false);
      actions.setShowDependenciesModal(false);
      actions.setEditingModule(null);
      actions.clearErrors();
    },
    
    // Refrescar lista
    refresh: () => {
      actions.fetchModules(filters);
    },
    
    // Cargar módulos por categoría
    loadCategory: (category) => {
      actions.fetchModulesByCategory(category, { status: 'ACTIVE' });
    },
    
    // Seleccionar módulo y cargar detalles
    selectModule: (moduleId) => {
      actions.fetchModuleById(moduleId);
    },
    
    // Cambiar estado de módulo con confirmación
    toggleModuleStatus: (moduleId, currentStatus) => {
      const newStatus = currentStatus === 'ACTIVE' ? 'DEPRECATED' : 'ACTIVE';
      actions.updateModuleStatus(moduleId, newStatus);
    },
    
    // Obtener módulos por estado
    getModulesByStatus: (status) => {
      return modules.filter(module => module.status === status);
    },
    
    // Obtener módulos de una categoría específica
    getModulesByCategory: (category) => {
      return modulesByCategory[category] || [];
    },
    
    // Validar si se puede eliminar un módulo (verificar dependencias)
    canDeleteModule: (moduleId) => {
      // Verificar si otros módulos dependen de este
      const hasDependents = modules.some(module => 
        module.dependencies && module.dependencies.includes(moduleId)
      );
      return !hasDependents;
    },
    
    // Obtener información de estado con colores
    getStatusInfo: (status) => {
      return statuses.find(s => s.value === status) || { label: status, color: 'default' };
    },
    
    // Obtener información de categoría
    getCategoryInfo: (category) => {
      return categories.find(c => c.value === category) || { label: category, description: '' };
    }
  };

  return {
    // State
    modules,
    totalModules,
    modulesByCategory,
    selectedModule,
    selectedModuleDependencies,
    pagination,
    filters,
    categories,
    statuses,
    
    // Loading states
    loading,
    selectedModuleLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    categoryLoading,
    dependenciesLoading,
    
    // Error states
    error,
    selectedModuleError,
    createError,
    updateError,
    deleteError,
    categoryError,
    dependenciesError,
    
    // UI State
    showCreateModal,
    showEditModal,
    showDeleteModal,
    showDependenciesModal,
    editingModule,
    
    // Actions
    actions,
    
    // Computed
    computed,
    
    // Helpers
    helpers
  };
};