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
  ChevronRight,
  ChevronLeft,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GripVertical,
  Plus,
  Minus
} from 'lucide-react';
import {
  getAvailableTemplates,
  assignRuleTemplate,
  getBusinessAssignedRules,
  removeRuleAssignment,
  customizeAssignedRule
} from '@shared/store/slices/businessRuleSlice';

const BusinessRuleModalV2 = ({ isOpen, onClose, business }) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [draggedItem, setDraggedItem] = useState(null);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [editingRule, setEditingRule] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [mobileTab, setMobileTab] = useState('available'); // 'available' o 'assigned'

  const {
    availableTemplates,
    assignedRules,
    availableTemplatesLoaded,
    assignedRulesLoaded
  } = useSelector(state => state.businessRule);

  const { isAuthenticated, token } = useSelector(state => state.auth);

  // Toast notification
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  useEffect(() => {
    if (isOpen && business?.id && isAuthenticated && token) {
      if (!availableTemplatesLoaded) {
        dispatch(getAvailableTemplates());
      }
      if (!assignedRulesLoaded) {
        dispatch(getBusinessAssignedRules());
      }
    }
  }, [isOpen, business, dispatch, availableTemplatesLoaded, assignedRulesLoaded, isAuthenticated, token]);

  if (!isOpen || !business) return null;

  // Category icons
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
    };
    return icons[category] || Settings;
  };

  // Get assigned rule IDs
  const getAssignedRuleIds = () => {
    return (assignedRules || [])
      .filter(rule => rule.business_rule_id || rule.customValue !== null)
      .map(rule => rule.template_id || rule.id);
  };

  // Filter available (unassigned) templates
  const getAvailableRules = () => {
    const assignedIds = getAssignedRuleIds();
    let filtered = (availableTemplates || []).filter(
      template => !assignedIds.includes(template.template_id)
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.key?.toLowerCase().includes(term) || 
        t.description?.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  // Get assigned rules
  const getAssignedRulesList = () => {
    return (assignedRules || []).filter(rule =>
      rule.business_rule_id || rule.customValue !== null
    );
  };

  // Assign rule
  const handleAssignRule = async (template) => {
    try {
      const templateId = typeof template === 'string' ? template : template.template_id;
      await dispatch(assignRuleTemplate({ templateId })).unwrap();
      dispatch(getBusinessAssignedRules());
      showToast('success', `✅ Regla "${template.key}" asignada`);
    } catch (error) {
      showToast('error', `❌ Error al asignar: ${error.message || error}`);
    }
  };

  // Remove rule
  const handleRemoveRule = async (rule) => {
    if (!confirm(`¿Desasignar la regla "${rule.key}"?`)) return;
    
    try {
      await dispatch(removeRuleAssignment(rule.key)).unwrap();
      dispatch(getBusinessAssignedRules());
      showToast('success', `✅ Regla "${rule.key}" desasignada`);
    } catch (error) {
      showToast('error', `❌ Error al desasignar: ${error.message || error}`);
    }
  };

  // Edit rule
  const handleEditTemplate = (rule) => {
    let currentValue = rule.customValue !== undefined ? rule.customValue : rule.defaultValue;
    
    if (rule.type === 'BOOLEAN' && currentValue === undefined) {
      currentValue = false;
    }
    
    setEditingRule(rule);
    setEditValue(currentValue);
    setShowEditModal(true);
  };

  // Save edit
  const handleSaveEdit = async () => {
    if (!editingRule) return;

    try {
      let finalValue = editValue;
      const ruleType = editingRule.type || 'STRING';

      if (ruleType === 'NUMBER') {
        const numValue = parseFloat(editValue);
        if (isNaN(numValue)) {
          showToast('error', '❌ Por favor ingresa un número válido.');
          return;
        }

        if (editingRule.validationRules) {
          const validation = typeof editingRule.validationRules === 'string' 
            ? JSON.parse(editingRule.validationRules) 
            : editingRule.validationRules;
          
          if (validation.min !== undefined && numValue < validation.min) {
            showToast('error', `❌ El valor debe ser mayor o igual a ${validation.min}`);
            return;
          }
          if (validation.max !== undefined && numValue > validation.max) {
            showToast('error', `❌ El valor debe ser menor o igual a ${validation.max}`);
            return;
          }
        }

        finalValue = numValue;
      } else if (ruleType === 'JSON') {
        try {
          finalValue = JSON.parse(editValue);
        } catch {
          showToast('error', '❌ El valor ingresado no es un JSON válido.');
          return;
        }
      } else if (ruleType === 'BOOLEAN') {
        finalValue = editValue === true || editValue === 'true';
      }

      await dispatch(customizeAssignedRule({
        ruleKey: editingRule.key,
        customValue: finalValue,
        notes: `Editado el ${new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`
      })).unwrap();

      dispatch(getBusinessAssignedRules());
      setShowEditModal(false);
      setEditingRule(null);
      setEditValue('');

      showToast('success', `✅ Regla "${editingRule.key}" actualizada correctamente`);
    } catch (error) {
      showToast('error', `❌ Error al editar la regla: ${error.message || 'Error desconocido'}`);
    }
  };

  // Drag & Drop handlers (Desktop only)
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItem) {
      handleAssignRule(draggedItem);
      setDraggedItem(null);
    }
  };

  // Category options
  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'PAYMENT_POLICY', label: 'Políticas de Pago' },
    { value: 'BOOKING_POLICY', label: 'Políticas de Reserva' },
    { value: 'CANCELLATION_POLICY', label: 'Políticas de Cancelación' },
    { value: 'WORKING_HOURS', label: 'Horarios de Trabajo' },
    { value: 'NOTIFICATION_POLICY', label: 'Notificaciones' },
    { value: 'SERVICE_POLICY', label: 'Políticas de Servicio' },
  ];

  const availableRules = getAvailableRules();
  const assignedRulesList = getAssignedRulesList();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0 lg:pl-10">
          <div className="pointer-events-auto w-screen max-w-full lg:max-w-7xl h-full">
            <div className="flex h-full flex-col bg-white shadow-xl overflow-hidden">
              
              {/* Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-pink-500 to-purple-600 px-4 lg:px-6 py-4 lg:py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-white">
                      Gestión de Reglas de Negocio
                    </h2>
                    <p className="mt-1 text-sm text-pink-100 hidden lg:block">
                      Arrastra las reglas disponibles para asignarlas a tu negocio
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
                  >
                    <X className="h-5 w-5 lg:h-6 lg:w-6" />
                  </button>
                </div>

                {/* Stats */}
                <div className="mt-3 lg:mt-4 grid grid-cols-2 gap-2 lg:gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 lg:p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-pink-100 text-xs lg:text-sm">Disponibles</span>
                      <span className="text-xl lg:text-2xl font-bold text-white">{availableRules.length}</span>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 lg:p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-pink-100 text-xs lg:text-sm">Asignadas</span>
                      <span className="text-xl lg:text-2xl font-bold text-white">{assignedRulesList.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-4 lg:px-6 py-3 lg:py-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar reglas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="sm:w-64">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Mobile Tabs - Solo visible en móvil */}
              <div className="flex-shrink-0 lg:hidden border-b border-gray-200 bg-white">
                <div className="flex">
                  <button
                    onClick={() => setMobileTab('available')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      mobileTab === 'available'
                        ? 'border-pink-500 text-pink-600 bg-pink-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Disponibles</span>
                      <span className="bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded-full">
                        {availableRules.length}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setMobileTab('assigned')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      mobileTab === 'assigned'
                        ? 'border-pink-500 text-pink-600 bg-pink-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Asignadas</span>
                      <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                        {assignedRulesList.length}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Main Content - 2 Columns */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full grid grid-cols-1 lg:grid-cols-2 divide-x divide-gray-200">
                  
                  {/* LEFT COLUMN: Available Rules */}
                  <div className={`flex flex-col h-full overflow-hidden ${mobileTab === 'assigned' ? 'hidden lg:flex' : ''}`}>
                    <div className="hidden lg:block flex-shrink-0 px-6 py-3 bg-gray-100 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Reglas Disponibles ({availableRules.length})
                      </h3>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto p-3 lg:p-4 space-y-3">
                      {availableRules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            ¡Todas asignadas!
                          </h4>
                          <p className="text-sm text-gray-500">
                            Ya has asignado todas las reglas disponibles a tu negocio.
                          </p>
                        </div>
                      ) : (
                        availableRules.map((rule) => {
                          const Icon = getRuleIcon(rule.category);
                          return (
                            <div
                              key={rule.template_id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, rule)}
                              className={`group bg-white border-2 border-gray-200 rounded-lg p-3 lg:p-4 cursor-move hover:border-pink-400 hover:shadow-md transition-all ${
                                draggedItem?.template_id === rule.template_id ? 'opacity-50' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <div className="hidden lg:block">
                                    <GripVertical className="h-5 w-5 text-gray-400 group-hover:text-pink-500" />
                                  </div>
                                  <div className="flex-shrink-0">
                                    <div className="p-2 bg-pink-100 rounded-lg">
                                      <Icon className="h-5 w-5 text-pink-600" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                      {rule.key}
                                    </h4>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                      {rule.description}
                                    </p>
                                    <div className="mt-2">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                        {rule.type || 'STRING'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Mobile: Add button */}
                                <button
                                  onClick={() => handleAssignRule(rule)}
                                  className="lg:hidden ml-2 p-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                  title="Asignar regla"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Assigned Rules */}
                  <div 
                    className={`flex flex-col h-full overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 ${mobileTab === 'available' ? 'hidden lg:flex' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="hidden lg:block flex-shrink-0 px-6 py-3 bg-pink-600 border-b border-pink-700">
                      <h3 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Reglas Asignadas ({assignedRulesList.length})
                      </h3>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto p-3 lg:p-4 space-y-3">
                      {assignedRulesList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                          <div className="hidden lg:block">
                            <ChevronLeft className="h-16 w-16 text-pink-300 mb-4 animate-pulse" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              Arrastra reglas aquí
                            </h4>
                            <p className="text-sm text-gray-600">
                              Arrastra las reglas desde la columna izquierda para asignarlas
                            </p>
                          </div>
                          <div className="lg:hidden">
                            <AlertCircle className="h-16 w-16 text-pink-300 mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              Sin reglas asignadas
                            </h4>
                            <p className="text-sm text-gray-600">
                              Usa el botón + en las reglas disponibles para asignarlas
                            </p>
                          </div>
                        </div>
                      ) : (
                        assignedRulesList.map((rule) => {
                          const Icon = getRuleIcon(rule.category);
                          const currentValue = rule.customValue !== undefined ? rule.customValue : rule.defaultValue;
                          const isActive = rule.rule_is_active !== false;

                          return (
                            <div
                              key={rule.business_rule_id || rule.id}
                              className="bg-white border-2 border-pink-200 rounded-lg p-3 lg:p-4 shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <div className="flex-shrink-0">
                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                                      <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-semibold text-gray-900">
                                        {rule.key}
                                      </h4>
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => handleEditTemplate(rule)}
                                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                          title="Editar"
                                        >
                                          <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => handleRemoveRule(rule)}
                                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                          title="Eliminar"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                      {rule.description}
                                    </p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {isActive ? 'Activa' : 'Inactiva'}
                                      </span>
                                      <span className="text-xs text-gray-600 truncate max-w-[200px]">
                                        Valor: <span className="font-medium">{String(currentValue)}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    <span className="hidden lg:inline">💡 Tip: Arrastra las reglas para asignarlas</span>
                    <span className="lg:hidden">💡 Usa los botones + para asignar reglas</span>
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`rounded-lg shadow-lg p-4 min-w-80 ${
            toast.type === 'success' ? 'bg-green-600' :
            toast.type === 'error' ? 'bg-red-600' :
            'bg-yellow-600'
          }`}>
            <p className="text-white font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRule && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => {
            setShowEditModal(false);
            setEditingRule(null);
          }} />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Edit2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Editar Regla
                    </h3>
                    <p className="text-sm text-blue-100">{editingRule.key}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRule(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Description */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">{editingRule.description}</p>
              </div>

              {/* Rule Type Badge */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Tipo:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {editingRule.type || 'STRING'}
                </span>
              </div>

              {/* Value Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Valor de la Regla
                </label>
                
                {editingRule.type === 'BOOLEAN' ? (
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={editValue === true || editValue === 'true'}
                        onChange={() => setEditValue(true)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Sí / Activo</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={editValue === false || editValue === 'false'}
                        onChange={() => setEditValue(false)}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">No / Inactivo</span>
                    </label>
                  </div>
                ) : editingRule.type === 'NUMBER' ? (
                  <div>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ingresa un número..."
                    />
                    {editingRule.validationRules && (() => {
                      const validation = typeof editingRule.validationRules === 'string' 
                        ? JSON.parse(editingRule.validationRules) 
                        : editingRule.validationRules;
                      return (
                        <p className="mt-1 text-xs text-gray-500">
                          {validation.min !== undefined && `Mínimo: ${validation.min}`}
                          {validation.min !== undefined && validation.max !== undefined && ' • '}
                          {validation.max !== undefined && `Máximo: ${validation.max}`}
                        </p>
                      );
                    })()}
                  </div>
                ) : editingRule.type === 'JSON' ? (
                  <textarea
                    value={typeof editValue === 'object' ? JSON.stringify(editValue, null, 2) : editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                    rows={6}
                    placeholder='{"key": "value"}'
                  />
                ) : (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ingresa el valor..."
                  />
                )}
              </div>

              {/* Default Value Reference */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Valor por defecto:</span> {String(editingRule.defaultValue)}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRule(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessRuleModalV2;
