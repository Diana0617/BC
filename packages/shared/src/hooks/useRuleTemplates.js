import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect, useMemo } from 'react'
import * as ruleTemplateApi from '../api/ruleTemplateApi.js'
import {
  // Async thunks
  createRuleTemplate,
  getOwnerRuleTemplates,
  updateRuleTemplate,
  deleteRuleTemplate,
  // getRuleTemplateStats, // NO IMPLEMENTADO EN BACKEND
  // syncRulesWithTemplates, // NO IMPLEMENTADO EN BACKEND
  
  // Actions
  setFilters,
  clearFilters,
  setPagination,
  setCurrentTemplate,
  clearCurrentTemplate,
  openModal,
  closeModal,
  closeAllModals,
  clearErrors,
  clearSuccess,
  clearMessages,
  
  // Selectors
  selectRuleTemplates,
  selectCurrentTemplate,
  // selectRuleTemplateStats, // NO IMPLEMENTADO
  selectFilters,
  selectPagination,
  selectModals,
  selectTemplatesLoading,
  selectCreateLoading,
  selectUpdateLoading,
  selectDeleteLoading,
  // selectStatsLoading, // NO IMPLEMENTADO
  // selectSyncLoading, // NO IMPLEMENTADO
  selectTemplatesError,
  selectCreateError,
  selectUpdateError,
  selectDeleteError,
  // selectStatsError, // NO IMPLEMENTADO
  // selectSyncError, // NO IMPLEMENTADO
  selectCreateSuccess,
  selectUpdateSuccess,
  selectDeleteSuccess,
  // selectSyncSuccess, // NO IMPLEMENTADO
  selectFilteredTemplates,
  selectTemplatesByCategory,
  selectActiveTemplatesCount,
  selectTotalUsageCount
} from '../store/slices/ruleTemplateSlice'

/**
 * Hook personalizado para manejar Rule Templates
 * Proporciona todas las funcionalidades CRUD y estados del slice
 */
export const useRuleTemplates = () => {
  const dispatch = useDispatch()

  // ================================
  // SELECTORS
  // ================================
  
  // Data selectors
  const templates = useSelector(selectRuleTemplates)
  const filteredTemplates = useSelector(selectFilteredTemplates)
  const templatesByCategory = useSelector(selectTemplatesByCategory)
  const currentTemplate = useSelector(selectCurrentTemplate)
  // const stats = useSelector(selectRuleTemplateStats) // NO IMPLEMENTADO
  const filters = useSelector(selectFilters)
  const pagination = useSelector(selectPagination)
  const modals = useSelector(selectModals)
  
  // Loading selectors
  const loading = {
    templates: useSelector(selectTemplatesLoading),
    create: useSelector(selectCreateLoading),
    update: useSelector(selectUpdateLoading),
    delete: useSelector(selectDeleteLoading),
    // stats: useSelector(selectStatsLoading), // NO IMPLEMENTADO
    // sync: useSelector(selectSyncLoading) // NO IMPLEMENTADO
  }
  
  // Error selectors
  const errors = {
    templates: useSelector(selectTemplatesError),
    create: useSelector(selectCreateError),
    update: useSelector(selectUpdateError),
    delete: useSelector(selectDeleteError),
    // stats: useSelector(selectStatsError), // NO IMPLEMENTADO
    // sync: useSelector(selectSyncError) // NO IMPLEMENTADO
  }
  
  // Success selectors
  const success = {
    create: useSelector(selectCreateSuccess),
    update: useSelector(selectUpdateSuccess),
    delete: useSelector(selectDeleteSuccess),
    // sync: useSelector(selectSyncSuccess) // NO IMPLEMENTADO
  }
  
  // Computed values
  const activeTemplatesCount = useSelector(selectActiveTemplatesCount)
  const totalUsageCount = useSelector(selectTotalUsageCount)
  const hasTemplates = templates.length > 0
  const hasFilters = Object.values(filters).some(value => value !== '' && value !== null)

  // ================================
  // ACTIONS
  // ================================
  
  /**
   * Cargar plantillas del owner
   */
  const loadOwnerTemplates = useCallback(async (customFilters = {}) => {
    const filterParams = { ...filters, ...customFilters }
    try {
      await dispatch(getOwnerRuleTemplates(filterParams)).unwrap()
      return true
    } catch (error) {
      return false
    }
  }, [dispatch, filters])

  /**
   * Cargar detalles completos de una plantilla (con estadísticas)
   */
  const loadTemplateDetails = useCallback(async (templateId) => {
    try {
      console.log('loadTemplateDetails - calling API with templateId:', templateId)
      const response = await ruleTemplateApi.getRuleTemplateById(templateId)
      console.log('loadTemplateDetails - raw response:', response)
      
      // El ApiClient wrappea la respuesta en { data: {...}, status, statusText }
      const serverData = response.data
      console.log('loadTemplateDetails - server data:', serverData)
      
      if (serverData && serverData.success) {
        console.log('loadTemplateDetails - success, returning:', serverData.data)
        return serverData.data // Contains { template, stats }
      }
      
      console.error('loadTemplateDetails - server response not successful:', serverData)
      throw new Error(serverData?.message || 'Error loading template details')
    } catch (error) {
      console.error('Error loading template details:', error)
      throw error // Re-throw para que el componente pueda manejar el error
    }
  }, [])

  /**
   * Crear nueva plantilla
   */
  const createTemplate = useCallback(async (templateData) => {
    try {
      await dispatch(createRuleTemplate(templateData)).unwrap()
      return true
    } catch (error) {
      return false
    }
  }, [dispatch])

  /**
   * Actualizar plantilla existente
   */
  const updateTemplate = useCallback(async (templateId, updateData) => {
    try {
      await dispatch(updateRuleTemplate({ templateId, updateData })).unwrap()
      return true
    } catch (error) {
      return false
    }
  }, [dispatch])

  /**
   * Eliminar plantilla
   */
  const removeTemplate = useCallback(async (templateId) => {
    try {
      await dispatch(deleteRuleTemplate(templateId)).unwrap()
      return true
    } catch (error) {
      return false
    }
  }, [dispatch])

  /**
   * Cargar estadísticas - NO IMPLEMENTADO EN BACKEND
   */
  // const loadStats = useCallback(async () => {
  //   try {
  //     await dispatch(getRuleTemplateStats()).unwrap()
  //     return true
  //   } catch (error) {
  //     return false
  //   }
  // }, [dispatch])

  /**
   * Sincronizar reglas con plantillas - NO IMPLEMENTADO EN BACKEND
   */
  // const syncRules = useCallback(async (businessId = null) => {
  //   try {
  //     await dispatch(syncRulesWithTemplates(businessId)).unwrap()
  //     return true
  //   } catch (error) {
  //     return false
  //   }
  // }, [dispatch])

  // ================================
  // FILTERS & PAGINATION
  // ================================
  
  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters) => {
    dispatch(setFilters(newFilters))
  }, [dispatch])

  /**
   * Limpiar filtros
   */
  const resetFilters = useCallback(() => {
    dispatch(clearFilters())
  }, [dispatch])

  /**
   * Actualizar paginación
   */
  const updatePagination = useCallback((newPagination) => {
    dispatch(setPagination(newPagination))
  }, [dispatch])

  /**
   * Cambiar página
   */
  const changePage = useCallback((newPage) => {
    dispatch(setPagination({ page: newPage }))
  }, [dispatch])

  // ================================
  // TEMPLATE SELECTION
  // ================================
  
  /**
   * Seleccionar plantilla actual
   */
  const selectTemplate = useCallback((template) => {
    dispatch(setCurrentTemplate(template))
  }, [dispatch])

  /**
   * Limpiar plantilla actual
   */
  const clearTemplate = useCallback(() => {
    dispatch(clearCurrentTemplate())
  }, [dispatch])

  // ================================
  // MODALS
  // ================================
  
  /**
   * Abrir modal específico
   */
  const openTemplateModal = useCallback((modalName, data = null) => {
    dispatch(openModal({ modal: modalName, data }))
  }, [dispatch])

  /**
   * Cerrar modal específico
   */
  const closeTemplateModal = useCallback((modalName) => {
    dispatch(closeModal(modalName))
  }, [dispatch])

  /**
   * Cerrar todos los modales
   */
  const closeAllTemplateModals = useCallback(() => {
    dispatch(closeAllModals())
  }, [dispatch])

  // ================================
  // MESSAGE HANDLING
  // ================================
  
  /**
   * Limpiar errores
   */
  const clearTemplateErrors = useCallback(() => {
    dispatch(clearErrors())
  }, [dispatch])

  /**
   * Limpiar mensajes de éxito
   */
  const clearTemplateSuccess = useCallback(() => {
    dispatch(clearSuccess())
  }, [dispatch])

  /**
   * Limpiar todos los mensajes
   */
  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages())
  }, [dispatch])

  // ================================
  // UTILITY FUNCTIONS
  // ================================
  
  /**
   * Buscar plantilla por ID
   */
  const findTemplateById = useCallback((templateId) => {
    return templates.find(template => template.id === templateId)
  }, [templates])

  /**
   * Obtener plantillas por categoría
   */
  const getTemplatesByCategory = useCallback((category) => {
    return templates.filter(template => template.category === category)
  }, [templates])

  /**
   * Verificar si una plantilla está activa
   */
  const isTemplateActive = useCallback((templateId) => {
    const template = findTemplateById(templateId)
    return template?.isActive || false
  }, [findTemplateById])

  /**
   * Obtener el conteo de uso de una plantilla
   */
  const getTemplateUsageCount = useCallback((templateId) => {
    const template = findTemplateById(templateId)
    return template?.usageCount || 0
  }, [findTemplateById])

  // ================================
  // SEARCH & FILTER UTILITIES
  // ================================
  
  /**
   * Filtrar plantillas por texto de búsqueda
   */
  const searchTemplates = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return templates
    
    const term = searchTerm.toLowerCase()
    return templates.filter(template =>
      template.name.toLowerCase().includes(term) ||
      template.description.toLowerCase().includes(term) ||
      template.ruleKey.toLowerCase().includes(term)
    )
  }, [templates])

  /**
   * Obtener categorías únicas
   */
  const uniqueCategories = useMemo(() => {
    return [...new Set(templates.map(template => template.category))].sort()
  }, [templates])

  /**
   * Obtener tipos de negocio únicos
   */
  const uniqueBusinessTypes = useMemo(() => {
    const allBusinessTypes = templates.flatMap(template => template.businessTypes || [])
    return [...new Set(allBusinessTypes)].sort()
  }, [templates])

  // ================================
  // RETURN OBJECT
  // ================================
  
  return {
    // Data
    templates,
    filteredTemplates,
    templatesByCategory,
    currentTemplate,
    // stats, // NO IMPLEMENTADO
    filters,
    pagination,
    modals,
    
    // States
    loading,
    errors,
    success,
    hasTemplates,
    hasFilters,
    activeTemplatesCount,
    totalUsageCount,
    
    // Actions - Solo las implementadas en backend
    loadOwnerTemplates,
    loadTemplateDetails,
    createTemplate,
    updateTemplate,
    removeTemplate,
    // loadStats, // NO IMPLEMENTADO EN BACKEND
    // syncRules, // NO IMPLEMENTADO EN BACKEND
    
    // Filters & Pagination
    updateFilters,
    resetFilters,
    updatePagination,
    changePage,
    
    // Template Selection
    selectTemplate,
    clearTemplate,
    
    // Modals
    openTemplateModal,
    closeTemplateModal,
    closeAllTemplateModals,
    
    // Messages
    clearTemplateErrors,
    clearTemplateSuccess,
    clearAllMessages,
    
    // Utilities
    findTemplateById,
    getTemplatesByCategory,
    isTemplateActive,
    getTemplateUsageCount,
    searchTemplates,
    uniqueCategories,
    uniqueBusinessTypes
  }
}

export default useRuleTemplates