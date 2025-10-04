import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  X, 
  Clock, 
  AlertTriangle, 
  Settings, 
  Users, 
  Calendar,
  Bell,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Plus,
  Check,
  Loader2,
  Search
} from 'lucide-react';
import {
  getAvailableTemplates,
  assignRuleTemplate,
  getBusinessAssignedRules,
  removeRuleAssignment,
  toggleRuleAssignment,
  customizeAssignedRule
} from '@shared/store/slices/businessRuleSlice';

const BusinessRuleModal = ({ isOpen, onClose, business }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const {
    availableTemplates,
    assignedRules,
    availableTemplatesLoaded,
    assignedRulesLoaded
  } = useSelector(state => state.businessRule);

  // Get auth state
  const { user, token, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isOpen && business?.id) {
      // Only proceed if user is authenticated
      if (!isAuthenticated || !token) {
        return;
      }

      // Cargar plantillas disponibles si no están cargadas
      if (!availableTemplatesLoaded) {
        dispatch(getAvailableTemplates());
      }
      
      // Cargar reglas asignadas
      if (!assignedRulesLoaded) {
        dispatch(getBusinessAssignedRules());
      }
    }
  }, [isOpen, business, dispatch, availableTemplatesLoaded, assignedRulesLoaded, isAuthenticated, token, user?.role]);

  if (!isOpen || !business) return null;

  // Don't render modal if user is not authenticated
  if (!isAuthenticated || !token) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
          <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
            <div className="px-6 py-4">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <X className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Autenticación Requerida
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Necesitas iniciar sesión para acceder a las reglas de negocio.
              </p>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Función para obtener el icono según el tipo de regla
  const getRuleIcon = (category) => {
    const icons = {
      'CANCELLATION_POLICY': AlertTriangle,
      'BOOKING_POLICY': Calendar,
      'WORKING_HOURS': Clock,
      'NOTIFICATION_POLICY': Bell,
      'PAYMENT_POLICY': CreditCard,
      'SERVICE_POLICY': Settings,
      'CUSTOMER_SETTINGS': Users,
      'LOCATION_SETTINGS': MapPin,
      'CONTACT_SETTINGS': Phone,
      'EMAIL_SETTINGS': Mail,
      'REFUND_POLICY': AlertTriangle
    };
    
    return icons[category] || Settings;
  };

  // Función para formatear el valor de la regla
  const formatRuleValue = (value) => {
    if (!value) return 'No configurado';

    // Si el valor ya es un objeto, convertirlo a JSON string
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    // Si es una cadena que parece JSON, intentar formatearlo
    try {
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed, null, 2);
      }
    } catch {
      // Si no es JSON válido, devolver como string
    }

    return String(value);
  };

  // Función para obtener categorías únicas
  const getCategories = () => {
    const categories = new Set(['all']);
    if (availableTemplates && Array.isArray(availableTemplates)) {
      availableTemplates.forEach(template => {
        if (template.category) {
          categories.add(template.category);
        }
      });
    }
    
    return Array.from(categories);
  };

  // Filtrar plantillas disponibles (separar de reglas asignadas)
  const getFilteredAvailableTemplates = () => {
    let filtered = availableTemplates || [];

    // Verificar si tenemos datos válidos
    if (!availableTemplates || !Array.isArray(availableTemplates)) {
      return [];
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(template => {
        const keyMatch = template.key?.toLowerCase().includes(searchTerm.toLowerCase());
        const descMatch = template.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return keyMatch || descMatch;
      });
    }

    return filtered;
  };

  // Filtrar solo las reglas que están realmente asignadas (tienen business_rule_id o customValue)
  const getAssignedRules = () => {
    return (assignedRules || []).filter(rule =>
      rule.business_rule_id ||
      rule.customValue !== null ||
      rule.rule_is_active !== null ||
      rule.appliedAt
    );
  };  // Verificar si una plantilla ya está asignada
  const isTemplateAssigned = (templateId) => {
    const assignedRulesFiltered = getAssignedRules();
    const isAssigned = assignedRulesFiltered.some(rule =>
      rule.template_id === templateId ||
      rule.id === templateId
    );
    return isAssigned;
  };

  // Manejar asignación de plantilla
  const handleAssignTemplate = async (template) => {
    try {
      
      // Verificar si ya está asignada antes de intentar asignar
      if (isTemplateAssigned(template.template_id)) {
        alert(`⚠️ La plantilla "${template.key}" ya está asignada a tu negocio. Usa el botón "Editar" para modificar su valor.`);
        return;
      }
      
      // Si el template es un objeto, usar su template_id
      const templateId = typeof template === 'string' ? template : template.template_id;
      
      await dispatch(assignRuleTemplate({ templateId })).unwrap();
      // Recargar reglas asignadas
      dispatch(getBusinessAssignedRules());
      
      // Mostrar feedback al usuario
      alert(`✅ Plantilla "${template.key || templateId}" asignada correctamente`);
      
    } catch (error) {
      
      // Mejorar el manejo de errores
      let errorMessage = 'Error desconocido';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Mensajes de error más específicos
      if (errorMessage.includes('already assigned') || errorMessage.includes('duplicate') || errorMessage.includes('conflict')) {
        alert(`⚠️ La plantilla "${template.key}" ya está asignada a tu negocio.`);
      } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        alert(`❌ No se encontró la plantilla "${template.key}". Por favor, recarga la página.`);
      } else {
        alert(`❌ Error al asignar la plantilla "${template.key}": ${errorMessage}`);
      }
    }
  };

  // Función para editar reglas asignadas
  const handleEditTemplate = async (rule) => {
    try {
      // Obtener el valor actual (personalizado o por defecto)
      const currentValue = rule.customValue !== undefined ? rule.customValue : rule.defaultValue;

      // Mostrar un prompt para editar el valor
      let newValueInput;

      // Determinar el tipo basado en el valor actual o la regla
      const ruleType = rule.type || (typeof currentValue === 'boolean' ? 'BOOLEAN' :
                                    typeof currentValue === 'number' ? 'NUMBER' : 'STRING');

      if (ruleType === 'BOOLEAN') {
        const currentBool = currentValue === true || currentValue === 'true';
        newValueInput = window.confirm(
          `Regla: "${rule.key}"\nValor actual: ${currentBool ? 'Activado' : 'Desactivado'}\n\n¿Deseas activar esta regla?`
        );
      } else if (ruleType === 'NUMBER') {
        newValueInput = window.prompt(
          `Editar regla: "${rule.key}"\nDescripción: ${rule.description}\n\nIngresa el nuevo valor numérico:`,
          String(currentValue)
        );
        if (newValueInput !== null) {
          const numValue = parseFloat(newValueInput);
          if (isNaN(numValue)) {
            alert('❌ Por favor ingresa un número válido.');
            return;
          }
          newValueInput = numValue;
        }
      } else {
        // STRING, JSON u otros tipos
        newValueInput = window.prompt(
          `Editar regla: "${rule.key}"\nDescripción: ${rule.description}\n\nIngresa el nuevo valor:`,
          typeof currentValue === 'object' ? JSON.stringify(currentValue) : String(currentValue)
        );

        // Si es tipo JSON, intentar parsear
        if (newValueInput !== null && ruleType === 'JSON') {
          try {
            newValueInput = JSON.parse(newValueInput);
          } catch {
            alert('❌ El valor ingresado no es un JSON válido.');
            return;
          }
        }
      }

      // Si el usuario canceló
      if (newValueInput === null) {
        return;
      }

      // Usar la función de personalización existente
      await dispatch(customizeAssignedRule({
        ruleKey: rule.key,
        customValue: newValueInput,
        notes: `Editado manualmente el ${new Date().toLocaleDateString()}`
      })).unwrap();

      // Recargar reglas asignadas
      dispatch(getBusinessAssignedRules());

      alert(`✅ Regla "${rule.key}" actualizada correctamente con el nuevo valor.`);

    } catch (error) {
      alert(`❌ Error al editar la regla: ${error.message || 'Error desconocido'}`);
    }
  };

  // Manejar eliminación de regla
  const handleRemoveRule = async (assignmentId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta regla?')) {
      try {
        await dispatch(removeRuleAssignment(assignmentId)).unwrap();
        dispatch(getBusinessAssignedRules());
      } catch {
        // Error handled silently
      }
    }
  };

  // Manejar activar/desactivar regla
  const handleToggleRule = async (assignmentId, currentStatus) => {
    try {
      await dispatch(toggleRuleAssignment({ 
        assignmentId, 
        isActive: !currentStatus 
      })).unwrap();
      dispatch(getBusinessAssignedRules());
    } catch {
      // Error handled silently
    }
  };

  const tabs = [
    { id: 'available', label: 'Reglas Disponibles', icon: Plus },
    { id: 'assigned', label: 'Reglas Asignadas', icon: Check }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Gestión de Reglas de Negocio
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {tab.id === 'assigned' && getAssignedRules().length > 0 && (
                        <span className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full">
                          {getAssignedRules().length}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Filters - Solo mostrar en pestaña de disponibles */}
          {activeTab === 'available' && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar reglas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="all">Todas las categorías</option>
                    {getCategories().filter(cat => cat !== 'all').map(category => {
                      // Convertir categorías a nombres más amigables
                      const categoryNames = {
                        'PAYMENT_POLICY': 'Políticas de Pago',
                        'BOOKING_POLICY': 'Políticas de Reserva',
                        'CANCELLATION_POLICY': 'Políticas de Cancelación',
                        'WORKING_HOURS': 'Horarios de Trabajo',
                        'NOTIFICATION_POLICY': 'Políticas de Notificación',
                        'SERVICE_POLICY': 'Políticas de Servicio',
                        'REFUND_POLICY': 'Políticas de Devolución'
                      };
                      
                      return (
                        <option key={category} value={category}>
                          {categoryNames[category] || category.replace('_', ' ')}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === 'available' ? (
              /* Plantillas Disponibles - Solo las NO asignadas */
              <div className="space-y-4">
                {(() => {
                  // Filtrar solo las plantillas que NO están asignadas
                  const unassignedTemplates = getFilteredAvailableTemplates().filter(template =>
                    !isTemplateAssigned(template.template_id)
                  );

                  if (unassignedTemplates.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-4">
                          <Check className="h-12 w-12 mx-auto" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Todas las plantillas están asignadas
                        </h4>
                        <p className="text-gray-500 mb-4">
                          Ve a la pestaña "Reglas Asignadas" para configurar las reglas que ya tienes.
                        </p>
                        <button
                          onClick={() => setActiveTab('assigned')}
                          className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-md hover:bg-pink-700 transition-colors"
                        >
                          Ver Reglas Asignadas
                        </button>
                      </div>
                    );
                  }

                  // Renderizar plantillas disponibles agrupadas por categoría
                  const templatesByCategory = unassignedTemplates.reduce((acc, template) => {
                    const category = template.category || 'GENERAL';
                    if (!acc[category]) {
                      acc[category] = [];
                    }
                    acc[category].push(template);
                    return acc;
                  }, {});

                  return (
                    <div className="space-y-6 max-h-96 overflow-y-auto">
                      <div className="bg-blue-100 border border-blue-400 rounded p-3 text-sm text-center">
                        📊 Mostrando <strong>{unassignedTemplates.length} plantillas disponibles</strong> para asignar
                        {searchTerm.trim() && <span> (filtradas por: "{searchTerm}")</span>}
                      </div>

                      {Object.entries(templatesByCategory).map(([category, templates]) => (
                        <div key={category} className="border-2 border-gray-200 rounded-lg p-4">
                          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                            {category === 'PAYMENT_POLICY' && '💳'}
                            {category === 'BOOKING_POLICY' && '📅'}
                            {category === 'CANCELLATION_POLICY' && '❌'}
                            {category === 'SERVICE_POLICY' && '🔧'}
                            {category === 'NOTIFICATION_POLICY' && '📧'}
                            {category === 'WORKING_HOURS' && '🕐'}
                            {category === 'REFUND_POLICY' && '💰'}
                            {category === 'GENERAL' && '⚙️'}
                            <span className="ml-2">{category.replace('_', ' ')}</span>
                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {templates.length}
                            </span>
                          </h3>

                          <div className="space-y-3">
                            {templates.map((template, index) => (
                              <div
                                key={template.template_id || index}
                                className="border-l-4 border-blue-500 bg-white p-4 rounded-r shadow hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="text-md font-semibold text-blue-700 mb-1">
                                      {template.key || 'Plantilla sin nombre'}
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {template.description || 'Sin descripción'}
                                    </p>
                                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                                      <span className="bg-gray-100 px-2 py-1 rounded">
                                        🆔 {template.template_id?.substring(0, 8)}...
                                      </span>
                                      <span className="bg-gray-100 px-2 py-1 rounded">
                                        🔧 {template.type || 'STRING'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <button
                                      className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                                      onClick={() => handleAssignTemplate(template)}
                                    >
                                      ✅ Asignar
                                    </button>
                                  </div>
                                </div>

                                <div className="mt-3 bg-gray-50 rounded p-3">
                                  <div className="text-xs font-medium text-gray-700 mb-1">
                                    Valor por defecto:
                                  </div>
                                  <div className="text-sm text-gray-600 font-mono bg-white p-2 rounded border">
                                    {JSON.stringify(template.defaultValue, null, 2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Reglas Asignadas */
              <div className="space-y-4">
                {(() => {
                  const assignedRulesFiltered = getAssignedRules();

                  return assignedRulesFiltered.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <Check className="h-12 w-12 mx-auto" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No tienes reglas asignadas
                      </h4>
                      <p className="text-gray-500 mb-4">
                        Ve a la pestaña "Reglas Disponibles" para seleccionar las reglas que necesitas.
                      </p>
                      <button
                        onClick={() => setActiveTab('available')}
                        className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-md hover:bg-pink-700 transition-colors"
                      >
                        Ver Reglas Disponibles
                      </button>
                    </div>
                  ) : (
                    assignedRulesFiltered.map(rule => {
                      const Icon = getRuleIcon(rule.category);
                      const ruleId = rule.business_rule_id || rule.id || rule.template_id;

                      return (
                        <div key={ruleId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="p-2 bg-pink-100 rounded-lg">
                                <Icon className="h-5 w-5 text-pink-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {rule.key || 'Regla sin nombre'}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {rule.description || 'Sin descripción'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                (rule.rule_is_active ?? rule.isActive) !== false
                                  ? 'text-green-700 bg-green-100'
                                  : 'text-gray-500 bg-gray-100'
                              }`}>
                                {(rule.rule_is_active ?? rule.isActive) !== false ? 'Activa' : 'Inactiva'}
                              </span>
                              <button
                                onClick={() => handleToggleRule(ruleId, rule.rule_is_active ?? rule.isActive)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                                  (rule.rule_is_active ?? rule.isActive) !== false
                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {(rule.rule_is_active ?? rule.isActive) !== false ? 'Desactivar' : 'Activar'}
                              </button>
                              <button
                                onClick={() => handleEditTemplate(rule)}
                                className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleRemoveRule(ruleId)}
                                className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-md p-3">
                            <div className="text-sm font-medium text-gray-700 mb-1">
                              Valor configurado:
                            </div>
                            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                              {formatRuleValue(rule.customValue || rule.effective_value || rule.defaultValue || rule.template?.defaultValue)}
                            </pre>
                          </div>

                          {rule.notes && (
                            <div className="mt-3 bg-blue-50 rounded-md p-3">
                              <div className="text-sm font-medium text-blue-900 mb-1">
                                Notas:
                              </div>
                              <p className="text-sm text-blue-700">
                                {rule.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  );
                })()}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {activeTab === 'available' 
                ? `${getFilteredAvailableTemplates().length} reglas disponibles`
                : `${getAssignedRules().length} reglas asignadas`
              }
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessRuleModal;
