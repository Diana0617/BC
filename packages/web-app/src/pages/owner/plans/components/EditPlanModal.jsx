import React, { useState, useEffect } from 'react';
import { useOwnerPlans, useOwnerModules } from '@bc/shared';
import {
  XMarkIcon,
  PencilIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UsersIcon,
  Cog6ToothIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  StarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const EditPlanModal = ({ isOpen, plan, onClose }) => {
  const { actions, updateLoading, updateError } = useOwnerPlans();
  const { modules: availableModules, loading: modulesLoading } = useOwnerModules();

  // Validación para evitar errores
  if (!isOpen || !plan) {
    return null;
  }

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: plan.name || '',
    description: plan.description || '',
    price: typeof plan.price === 'string' ? plan.price : plan.price?.toString() || '',
    currency: plan.currency || 'COP',
    duration: plan.duration || '',
    durationType: plan.durationType || 'MONTHS',
    maxUsers: plan.maxUsers || '',
    maxClients: plan.maxClients || '',
    maxAppointments: plan.maxAppointments || '',
    storageLimit: plan.storageLimit || '',
    trialDays: plan.trialDays || '0',
    features: Array.isArray(plan.features) ? [...plan.features] : [],
    limitations: plan.limitations || {},
    isPopular: plan.isPopular || false,
    status: plan.status || 'ACTIVE'
  });

  // Estado para selección de módulos
  const [selectedModules, setSelectedModules] = useState([]);
  const [moduleSearch, setModuleSearch] = useState('');

  // Estado para características dinámicas
  const [newFeature, setNewFeature] = useState('');

  // Errores de validación
  const [validationErrors, setValidationErrors] = useState({});

  // Inicializar módulos seleccionados
  useEffect(() => {
    // Los módulos pueden venir en plan.modules o plan.planModules
    const planModulesData = plan.planModules || plan.modules || [];
    
    if (planModulesData && planModulesData.length > 0) {
      const planModules = planModulesData.map(planModule => {
        // Si viene de planModules, la estructura es diferente
        if (planModule.module) {
          return {
            id: planModule.module.id,
            name: planModule.module.name,
            displayName: planModule.module.displayName,
            isIncluded: planModule.isIncluded ?? true,
            additionalPrice: planModule.additionalPrice || 0,
            limitQuantity: planModule.limitQuantity || null
          };
        } else {
          // Si viene de modules directo
          return {
            id: planModule.id,
            name: planModule.name,
            displayName: planModule.displayName,
            isIncluded: planModule.PlanModule?.isIncluded ?? true,
            additionalPrice: planModule.PlanModule?.additionalPrice || 0,
            limitQuantity: planModule.PlanModule?.limitQuantity || null
          };
        }
      });
      setSelectedModules(planModules);
    }
  }, [plan.planModules, plan.modules]);

  // Filtrar módulos disponibles
  const filteredModules = availableModules.filter(module =>
    module.status === 'ACTIVE' &&
    (module.name.toLowerCase().includes(moduleSearch.toLowerCase()) ||
     module.displayName.toLowerCase().includes(moduleSearch.toLowerCase()))
  );

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error de validación si existe
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Agregar característica
  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  // Remover característica
  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Manejar selección de módulos
  const toggleModule = (module) => {
    setSelectedModules(prev => {
      const isSelected = prev.some(m => m.id === module.id);
      if (isSelected) {
        return prev.filter(m => m.id !== module.id);
      } else {
        return [...prev, {
          id: module.id,
          name: module.name,
          displayName: module.displayName,
          isIncluded: true,
          additionalPrice: 0,
          limitQuantity: null
        }];
      }
    });
  };

  // Actualizar configuración de módulo
  const updateModuleConfig = (moduleId, config) => {
    setSelectedModules(prev =>
      prev.map(module =>
        module.id === moduleId ? { ...module, ...config } : module
      )
    );
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.description.trim()) errors.description = 'La descripción es requerida';
    if (!formData.price || formData.price <= 0) errors.price = 'El precio debe ser mayor a 0';
    if (!formData.duration || formData.duration <= 0) errors.duration = 'La duración debe ser mayor a 0';
    if (selectedModules.length === 0) errors.modules = 'Debe seleccionar al menos un módulo';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const planData = {
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        maxUsers: formData.maxUsers ? parseInt(formData.maxUsers) : null,
        maxClients: formData.maxClients ? parseInt(formData.maxClients) : null,
        maxAppointments: formData.maxAppointments ? parseInt(formData.maxAppointments) : null,
        storageLimit: formData.storageLimit ? parseInt(formData.storageLimit) : null,
        trialDays: parseInt(formData.trialDays),
        modules: selectedModules.map(module => ({
          moduleId: module.id,
          isIncluded: module.isIncluded,
          additionalPrice: parseFloat(module.additionalPrice) || 0,
          limitQuantity: module.limitQuantity ? parseInt(module.limitQuantity) : null
        }))
      };

      await actions.updatePlan(plan.id, planData);
      onClose();
    } catch (error) {
      console.error('Error actualizando plan:', error);
    }
  };

  const formatPrice = (price, currency = 'COP') => {
    // Convertir string a number si es necesario
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numericPrice);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl bg-white rounded-md shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <PencilIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Editar Plan
              </h3>
              <p className="text-sm text-gray-500">
                Modifique la configuración del plan "{plan.name}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={updateLoading}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h4>
                
                {/* Nombre */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Plan *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      validationErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Plan Premium"
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>

                {/* Descripción */}
                <div className="mb-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                      validationErrors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Descripción del plan..."
                  />
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                  )}
                </div>

                {/* Precio y Moneda */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Precio *
                    </label>
                    <div className="relative">
                      <CurrencyDollarIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          validationErrors.price ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {validationErrors.price && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                      Moneda
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="COP">COP - Peso Colombiano</option>
                      <option value="USD">USD - Dólar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>
                </div>

                {/* Duración */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                      Duración *
                    </label>
                    <div className="relative">
                      <CalendarDaysIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        min="1"
                        className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          validationErrors.duration ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="1"
                      />
                    </div>
                    {validationErrors.duration && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.duration}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="durationType" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      id="durationType"
                      name="durationType"
                      value={formData.durationType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="MONTHS">Mes(es)</option>
                      <option value="YEARS">Año(s)</option>
                    </select>
                  </div>
                </div>

                {/* Estado y Configuración */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="ACTIVE">Activo</option>
                      <option value="INACTIVE">Inactivo</option>
                      <option value="DEPRECATED">Depreciado</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPopular"
                        checked={formData.isPopular}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                        <StarIcon className="h-4 w-4 mr-1" />
                        Popular
                      </span>
                    </label>
                  </div>
                </div>

                {/* Limitaciones */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="maxUsers" className="block text-sm font-medium text-gray-700 mb-1">
                      Usuarios Máx
                    </label>
                    <div className="relative">
                      <UsersIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        id="maxUsers"
                        name="maxUsers"
                        value={formData.maxUsers}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Ilimitado"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="trialDays" className="block text-sm font-medium text-gray-700 mb-1">
                      Días de Prueba
                    </label>
                    <input
                      type="number"
                      id="trialDays"
                      name="trialDays"
                      value={formData.trialDays}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Características */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Características
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Ej: Citas ilimitadas"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Selección de Módulos */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Cog6ToothIcon className="h-5 w-5 mr-2" />
                  Módulos del Plan *
                </h4>
                
                {/* Búsqueda de módulos */}
                <div className="mb-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={moduleSearch}
                      onChange={(e) => setModuleSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Buscar módulos..."
                    />
                  </div>
                </div>

                {validationErrors.modules && (
                  <p className="mb-4 text-sm text-red-600">{validationErrors.modules}</p>
                )}

                {/* Lista de módulos disponibles */}
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                  {modulesLoading ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                      <span className="text-gray-500">Cargando módulos...</span>
                    </div>
                  ) : filteredModules.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No se encontraron módulos
                    </div>
                  ) : (
                    filteredModules.map((module) => {
                      const isSelected = selectedModules.some(m => m.id === module.id);
                      const selectedModule = selectedModules.find(m => m.id === module.id);
                      
                      return (
                        <div key={module.id} className="border-b border-gray-200 last:border-b-0">
                          <div className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleModule(module)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-sm font-medium text-gray-900">
                                    {module.displayName || module.name}
                                  </h5>
                                  <span className="text-xs text-gray-500">{module.category}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                                
                                {isSelected && (
                                  <div className="mt-3 p-3 bg-indigo-50 rounded border grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Precio Adicional
                                      </label>
                                      <input
                                        type="number"
                                        value={selectedModule?.additionalPrice || 0}
                                        onChange={(e) => updateModuleConfig(module.id, { additionalPrice: e.target.value })}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="0.00"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Límite Cantidad
                                      </label>
                                      <input
                                        type="number"
                                        value={selectedModule?.limitQuantity || ''}
                                        onChange={(e) => updateModuleConfig(module.id, { limitQuantity: e.target.value })}
                                        min="0"
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Ilimitado"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Resumen de módulos seleccionados */}
                {selectedModules.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Módulos Seleccionados ({selectedModules.length})
                    </h5>
                    <div className="space-y-1">
                      {selectedModules.map((module) => (
                        <div key={module.id} className="text-xs text-gray-600 flex justify-between">
                          <span>{module.displayName || module.name}</span>
                          {module.additionalPrice > 0 && (
                            <span className="text-green-600">
                              +{formatPrice(module.additionalPrice, formData.currency)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error de actualización */}
          {updateError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{updateError}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={updateLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={updateLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
            >
              {updateLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Actualizar Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { EditPlanModal };