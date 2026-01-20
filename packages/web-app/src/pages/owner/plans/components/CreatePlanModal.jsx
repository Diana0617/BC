import React, { useState, useEffect } from 'react';
import { useOwnerPlans, useOwnerModules } from '@shared';
import {
  XMarkIcon,
  PlusIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  UserIcon,
  ClockIcon,
  ServerIcon,
  CheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const CreatePlanModal = ({ isOpen, onClose }) => {
  console.log('🎯 CreatePlanModal renderizado - isOpen:', isOpen);
  
  const { actions, createLoading } = useOwnerPlans();
  const { modules } = useOwnerModules();

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'COP',
    duration: '',
    durationType: 'MONTHS',
    maxUsers: '',
    maxClients: '',
    maxAppointments: '',
    storageLimit: '',
    trialDays: 0,
    features: [],
    limitations: {},
    isPopular: false
  });

  const [selectedModules, setSelectedModules] = useState([]);
  const [moduleSearch, setModuleSearch] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Limpiar formulario al abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        price: '',
        currency: 'COP',
        duration: '',
        durationType: 'MONTHS',
        maxUsers: '',
        maxClients: '',
        maxAppointments: '',
        storageLimit: '',
        trialDays: 0,
        features: [],
        limitations: {},
        isPopular: false
      });
      setSelectedModules([]);
      setModuleSearch('');
      setNewFeature('');
      setValidationErrors({});
    }
  }, [isOpen]);

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Formatear precio mientras el usuario escribe
    if (name === 'price') {
      // Remover caracteres no numéricos excepto punto decimal
      const numericValue = value.replace(/[^0-9.]/g, '');
      // Asegurar solo un punto decimal
      const parts = numericValue.split('.');
      const formattedValue = parts.length > 2 
        ? parts[0] + '.' + parts.slice(1).join('') 
        : numericValue;
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

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

  // Filtrar módulos disponibles
  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(moduleSearch.toLowerCase()) ||
    module.displayName?.toLowerCase().includes(moduleSearch.toLowerCase())
  );

  // Agregar módulo seleccionado
  const addModule = (module) => {
    if (!selectedModules.find(m => m.id === module.id)) {
      setSelectedModules(prev => [...prev, {
        ...module,
        isIncluded: true,
        additionalPrice: 0,
        limitQuantity: ''
      }]);
    }
  };

  // Remover módulo
  const removeModule = (moduleId) => {
    setSelectedModules(prev => prev.filter(m => m.id !== moduleId));
  };

  // Actualizar configuración de módulo
  const updateModuleConfig = (moduleId, field, value) => {
    setSelectedModules(prev => prev.map(module =>
      module.id === moduleId
        ? { ...module, [field]: value }
        : module
    ));
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.description.trim()) errors.description = 'La descripción es requerida';
    
    // Validación de precio - permitir 0 para planes gratuitos
    if (formData.price === '' || formData.price === null || formData.price === undefined) {
      errors.price = 'El precio es requerido (use 0 para planes gratuitos)';
    } else if (parseFloat(formData.price) < 0) {
      errors.price = 'El precio no puede ser negativo';
    } else if (parseFloat(formData.price) > 99999999.99) {
      errors.price = 'El precio no puede superar $99,999,999.99 COP';
    }
    
    if (!formData.duration || formData.duration <= 0) errors.duration = 'La duración debe ser mayor a 0';
    if (selectedModules.length === 0) errors.modules = 'Debe seleccionar al menos un módulo';

    // Validar límites adicionales si se especifican
    if (formData.maxUsers && parseInt(formData.maxUsers) > 99999) {
      errors.maxUsers = 'El máximo de usuarios no puede superar 99,999';
    }
    if (formData.maxClients && parseInt(formData.maxClients) > 99999) {
      errors.maxClients = 'El máximo de clientes no puede superar 99,999';
    }
    if (formData.maxAppointments && parseInt(formData.maxAppointments) > 99999) {
      errors.maxAppointments = 'El máximo de citas no puede superar 99,999';
    }

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

      await actions.createPlan(planData);
      onClose();
    } catch (error) {
      console.error('Error creando plan:', error);
    }
  };

  const formatPrice = (price, currency = 'COP') => {
    if (!price) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  console.log('🎯 CreatePlanModal - isOpen:', isOpen, 'tipo:', typeof isOpen);
  
  if (!isOpen) {
    console.log('🎯 CreatePlanModal - NO se renderiza porque isOpen es:', isOpen);
    return null;
  }

  console.log('🎯 CreatePlanModal - SÍ se va a renderizar');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
              </div>
              <div>
                <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
                  Crear Nuevo Plan
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Configure un nuevo plan de suscripción
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={createLoading}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Información Básica */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Información Básica</h4>
                  
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="price" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Precio * <span className="hidden sm:inline">(máx: $99,999,999.99)</span>
                      </label>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-3 top-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        <input
                          type="text"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          className={`w-full pl-8 sm:pl-10 pr-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            validationErrors.price ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {validationErrors.price && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.price}</p>
                      )}
                      {formData.price && (
                        <p className="mt-1 text-xs text-gray-500">
                          {formatPrice(formData.price, formData.currency)}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="currency" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Moneda
                      </label>
                      <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="COP">COP</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
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
                        <option value="DAYS">Días</option>
                        <option value="WEEKS">Semanas</option>
                        <option value="MONTHS">Meses</option>
                        <option value="YEARS">Años</option>
                      </select>
                    </div>
                  </div>

                  {/* Días de prueba */}
                  <div className="mb-4">
                    <label htmlFor="trialDays" className="block text-sm font-medium text-gray-700 mb-1">
                      Días de Prueba Gratuita
                    </label>
                    <input
                      type="number"
                      id="trialDays"
                      name="trialDays"
                      value={formData.trialDays}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Plan Popular */}
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPopular"
                        checked={formData.isPopular}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Marcar como Plan Popular</span>
                    </label>
                  </div>
                </div>

                {/* Límites y Capacidades */}
                <div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Límites y Capacidades</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="maxUsers" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Máx. Usuarios <span className="hidden sm:inline">(máx: 99,999)</span>
                      </label>
                      <div className="relative">
                        <UserGroupIcon className="absolute left-3 top-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        <input
                          type="number"
                          id="maxUsers"
                          name="maxUsers"
                          value={formData.maxUsers}
                          onChange={handleInputChange}
                          min="1"
                          className={`w-full pl-8 sm:pl-10 pr-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            validationErrors.maxUsers ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Ilimitado"
                        />
                      </div>
                      {validationErrors.maxUsers && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.maxUsers}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="maxClients" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Máx. Clientes <span className="hidden sm:inline">(máx: 99,999)</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                        <input
                          type="number"
                          id="maxClients"
                          name="maxClients"
                          value={formData.maxClients}
                          onChange={handleInputChange}
                          min="1"
                          className={`w-full pl-8 sm:pl-10 pr-3 py-2 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            validationErrors.maxClients ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Ilimitado"
                        />
                      </div>
                      {validationErrors.maxClients && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.maxClients}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="maxAppointments" className="block text-sm font-medium text-gray-700 mb-1">
                        Máximo Citas/mes (máx: 99,999)
                      </label>
                      <div className="relative">
                        <ClockIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          id="maxAppointments"
                          name="maxAppointments"
                          value={formData.maxAppointments}
                          onChange={handleInputChange}
                          min="1"
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            validationErrors.maxAppointments ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Ilimitado"
                        />
                      </div>
                      {validationErrors.maxAppointments && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.maxAppointments}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="storageLimit" className="block text-sm font-medium text-gray-700 mb-1">
                        Almacenamiento (GB)
                      </label>
                      <div className="relative">
                        <ServerIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          id="storageLimit"
                          name="storageLimit"
                          value={formData.storageLimit}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Ilimitado"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Características */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Características</h4>
                  
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Agregar característica..."
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                        <span className="text-sm text-gray-700">{feature}</span>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selección de Módulos */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Módulos del Plan *
                  </h4>
                  
                  {validationErrors.modules && (
                    <p className="mb-3 text-sm text-red-600">{validationErrors.modules}</p>
                  )}

                  {/* Buscador de módulos */}
                  <div className="relative mb-4">
                    <MagnifyingGlassIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={moduleSearch}
                      onChange={(e) => setModuleSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Buscar módulos..."
                    />
                  </div>

                  {/* Lista de módulos disponibles */}
                  <div className="mb-6">
                    <h5 className="text-md font-medium text-gray-700 mb-3">Módulos Disponibles</h5>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                      {filteredModules.filter(module => !selectedModules.find(m => m.id === module.id)).map((module) => (
                        <div
                          key={module.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <TagIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {module.displayName || module.name}
                                </p>
                                <p className="text-xs text-gray-500">{module.description}</p>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => addModule(module)}
                            className="ml-3 px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                          >
                            Agregar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Módulos seleccionados */}
                  <div>
                    <h5 className="text-md font-medium text-gray-700 mb-3">
                      Módulos Seleccionados ({selectedModules.length})
                    </h5>
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {selectedModules.map((module) => (
                        <div key={module.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckIcon className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {module.displayName || module.name}
                                </p>
                                <p className="text-xs text-gray-500">{module.description}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeModule(module.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>

                          {/* Configuración del módulo */}
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Precio Adicional
                              </label>
                              <input
                                type="number"
                                value={module.additionalPrice}
                                onChange={(e) => updateModuleConfig(module.id, 'additionalPrice', e.target.value)}
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
                                value={module.limitQuantity}
                                onChange={(e) => updateModuleConfig(module.id, 'limitQuantity', e.target.value)}
                                min="1"
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Ilimitado"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={createLoading}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span className="text-xs sm:text-sm">Creando...</span>
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm">Crear Plan</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export { CreatePlanModal };