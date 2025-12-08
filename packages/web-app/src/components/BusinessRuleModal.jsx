// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { 
//   X, 
//   Clock, 
//   AlertTriangle, 
//   Settings, 
//   Users, 
//   Calendar,
//   Bell,
//   CreditCard,
//   MapPin,
//   Phone,
//   Mail,
//   Plus,
//   Check,
//   Loader2,
//   Search,
//   Edit2,
//   Save,
//   Info,
//   ChevronDown,
//   ChevronUp,
//   CheckCircle2,
//   XCircle,
//   AlertCircle
// } from 'lucide-react';
// import {
//   getAvailableTemplates,
//   assignRuleTemplate,
//   getBusinessAssignedRules,
//   removeRuleAssignment,
//   toggleRuleAssignment,
//   customizeAssignedRule
// } from '@shared/store/slices/businessRuleSlice';

// const BusinessRuleModal = ({ isOpen, onClose, business }) => {
//   const dispatch = useDispatch();
//   const [activeTab, setActiveTab] = useState('available');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [editingRule, setEditingRule] = useState(null);
//   const [editValue, setEditValue] = useState('');
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [expandedRules, setExpandedRules] = useState({});
//   const [selectedTemplateCard, setSelectedTemplateCard] = useState(null);
//   const [toast, setToast] = useState({ show: false, type: '', message: '' });

//   const {
//     availableTemplates,
//     assignedRules,
//     availableTemplatesLoaded,
//     assignedRulesLoaded
//   } = useSelector(state => state.businessRule);

//   // Get auth state
//   const { user, token, isAuthenticated } = useSelector(state => state.auth);

//   // Función para mostrar Toast
//   const showToast = (type, message) => {
//     setToast({ show: true, type, message });
//     setTimeout(() => {
//       setToast({ show: false, type: '', message: '' });
//     }, 4000);
//   };

//   useEffect(() => {
//     if (isOpen && business?.id) {
//       // Only proceed if user is authenticated
//       if (!isAuthenticated || !token) {
//         return;
//       }

//       // Cargar plantillas disponibles si no están cargadas
//       if (!availableTemplatesLoaded) {
//         dispatch(getAvailableTemplates());
//       }
      
//       // Cargar reglas asignadas
//       if (!assignedRulesLoaded) {
//         dispatch(getBusinessAssignedRules());
//       }
//     }
//   }, [isOpen, business, dispatch, availableTemplatesLoaded, assignedRulesLoaded, isAuthenticated, token, user?.role]);

//   if (!isOpen || !business) return null;

//   // Don't render modal if user is not authenticated
//   if (!isAuthenticated || !token) {
//     return (
//       <div className="fixed inset-0 z-50 overflow-y-auto">
//         <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//           <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
//           <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
//             <div className="px-6 py-4">
//               <div className="flex items-center justify-center mb-4">
//                 <div className="p-3 bg-red-100 rounded-full">
//                   <X className="h-6 w-6 text-red-600" />
//                 </div>
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
//                 Autenticación Requerida
//               </h3>
//               <p className="text-gray-600 text-center mb-4">
//                 Necesitas iniciar sesión para acceder a las reglas de negocio.
//               </p>
//               <button
//                 onClick={onClose}
//                 className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//               >
//                 Cerrar
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Función para obtener el icono según el tipo de regla
//   const getRuleIcon = (category) => {
//     const icons = {
//       'CANCELLATION_POLICY': AlertTriangle,
//       'BOOKING_POLICY': Calendar,
//       'WORKING_HOURS': Clock,
//       'NOTIFICATION_POLICY': Bell,
//       'PAYMENT_POLICY': CreditCard,
//       'SERVICE_POLICY': Settings,
//       'CUSTOMER_SETTINGS': Users,
//       'LOCATION_SETTINGS': MapPin,
//       'CONTACT_SETTINGS': Phone,
//       'EMAIL_SETTINGS': Mail,
//       'REFUND_POLICY': AlertTriangle
//     };
    
//     return icons[category] || Settings;
//   };

//   // Función para formatear el valor de la regla
//   const formatRuleValue = (value) => {
//     if (!value) return 'No configurado';

//     // Si el valor ya es un objeto, convertirlo a JSON string
//     if (typeof value === 'object') {
//       return JSON.stringify(value, null, 2);
//     }

//     // Si es una cadena que parece JSON, intentar formatearlo
//     try {
//       if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
//         const parsed = JSON.parse(value);
//         return JSON.stringify(parsed, null, 2);
//       }
//     } catch {
//       // Si no es JSON válido, devolver como string
//     }

//     return String(value);
//   };

//   // Función para obtener categorías únicas
//   const getCategories = () => {
//     const categories = new Set(['all']);
//     if (availableTemplates && Array.isArray(availableTemplates)) {
//       availableTemplates.forEach(template => {
//         if (template.category) {
//           categories.add(template.category);
//         }
//       });
//     }
    
//     return Array.from(categories);
//   };

//   // Filtrar plantillas disponibles (separar de reglas asignadas)
//   const getFilteredAvailableTemplates = () => {
//     let filtered = availableTemplates || [];

//     // Verificar si tenemos datos válidos
//     if (!availableTemplates || !Array.isArray(availableTemplates)) {
//       return [];
//     }

//     // Filtrar por categoría
//     if (selectedCategory !== 'all') {
//       filtered = filtered.filter(template => template.category === selectedCategory);
//     }

//     // Filtrar por término de búsqueda
//     if (searchTerm) {
//       filtered = filtered.filter(template => {
//         const keyMatch = template.key?.toLowerCase().includes(searchTerm.toLowerCase());
//         const descMatch = template.description?.toLowerCase().includes(searchTerm.toLowerCase());
//         return keyMatch || descMatch;
//       });
//     }

//     return filtered;
//   };

//   // Filtrar solo las reglas que están realmente asignadas (tienen business_rule_id o customValue)
//   const getAssignedRules = () => {
//     return (assignedRules || []).filter(rule =>
//       rule.business_rule_id ||
//       rule.customValue !== null ||
//       rule.rule_is_active !== null ||
//       rule.appliedAt
//     );
//   };  // Verificar si una plantilla ya está asignada
//   const isTemplateAssigned = (templateId) => {
//     const assignedRulesFiltered = getAssignedRules();
//     const isAssigned = assignedRulesFiltered.some(rule =>
//       rule.template_id === templateId ||
//       rule.id === templateId
//     );
//     return isAssigned;
//   };

//   // Manejar asignación de plantilla
//   const handleAssignTemplate = async (template) => {
//     try {
      
//       // Verificar si ya está asignada antes de intentar asignar
//       if (isTemplateAssigned(template.template_id)) {
//         showToast('warning', `⚠️ La plantilla "${template.key}" ya está asignada a tu negocio`);
//         return;
//       }
      
//       // Si el template es un objeto, usar su template_id
//       const templateId = typeof template === 'string' ? template : template.template_id;
      
//       await dispatch(assignRuleTemplate({ templateId })).unwrap();
//       // Recargar reglas asignadas
//       dispatch(getBusinessAssignedRules());
      
//       // Limpiar selección de tarjeta
//       setSelectedTemplateCard(null);
      
//       // Mostrar feedback al usuario con toast
//       showToast('success', `✅ Regla "${template.key}" asignada correctamente. Ve a "Reglas Asignadas" para configurarla.`);
      
//     } catch (error) {
      
//       // Mejorar el manejo de errores
//       let errorMessage = 'Error desconocido';
//       if (error.message) {
//         errorMessage = error.message;
//       } else if (typeof error === 'string') {
//         errorMessage = error;
//       }
      
//       // Mensajes de error más específicos con toast
//       if (errorMessage.includes('already assigned') || errorMessage.includes('duplicate') || errorMessage.includes('conflict')) {
//         showToast('warning', `⚠️ La plantilla "${template.key}" ya está asignada`);
//       } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
//         showToast('error', `❌ No se encontró la plantilla "${template.key}"`);
//       } else {
//         showToast('error', `❌ Error al asignar: ${errorMessage}`);
//       }
//     }
//   };

//   // Función para editar reglas asignadas
//   const handleEditTemplate = (rule) => {
//     // Obtener el valor actual (personalizado o por defecto)
//     let currentValue = rule.customValue !== undefined ? rule.customValue : rule.defaultValue;
    
//     // Si es BOOLEAN y no tiene valor, usar false por defecto
//     if (rule.type === 'BOOLEAN' && currentValue === undefined) {
//       currentValue = false;
//     }
    
//     setEditingRule(rule);
//     setEditValue(currentValue);
//     setShowEditModal(true);
//   };

//   // Guardar edición de regla
//   const handleSaveEdit = async () => {
//     if (!editingRule) return;

//     try {
//       let finalValue = editValue;

//       // Validar según el tipo
//       const ruleType = editingRule.type || 'STRING';

//       if (ruleType === 'NUMBER') {
//         const numValue = parseFloat(editValue);
//         if (isNaN(numValue)) {
//           alert('❌ Por favor ingresa un número válido.');
//           return;
//         }

//         // Validar contra las reglas si existen
//         if (editingRule.validationRules) {
//           const validation = typeof editingRule.validationRules === 'string' 
//             ? JSON.parse(editingRule.validationRules) 
//             : editingRule.validationRules;
          
//           if (validation.min !== undefined && numValue < validation.min) {
//             alert(`❌ El valor debe ser mayor o igual a ${validation.min}`);
//             return;
//           }
//           if (validation.max !== undefined && numValue > validation.max) {
//             alert(`❌ El valor debe ser menor o igual a ${validation.max}`);
//             return;
//           }
//         }

//         finalValue = numValue;
//       } else if (ruleType === 'JSON') {
//         try {
//           finalValue = JSON.parse(editValue);
//         } catch {
//           alert('❌ El valor ingresado no es un JSON válido.');
//           return;
//         }
//       } else if (ruleType === 'BOOLEAN') {
//         finalValue = editValue === true || editValue === 'true';
//       }

//       // Usar la función de personalización existente
//       await dispatch(customizeAssignedRule({
//         ruleKey: editingRule.key,
//         customValue: finalValue,
//         notes: `Editado el ${new Date().toLocaleDateString('es-ES', { 
//           year: 'numeric', 
//           month: 'long', 
//           day: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit'
//         })}`
//       })).unwrap();

//       // Recargar reglas asignadas
//       dispatch(getBusinessAssignedRules());

//       // Cerrar modal
//       setShowEditModal(false);
//       setEditingRule(null);
//       setEditValue('');

//       showToast('success', `✅ Regla "${editingRule.key}" actualizada correctamente`);

//     } catch (error) {
//       showToast('error', `❌ Error al editar la regla: ${error.message || 'Error desconocido'}`);
//     }
//   };

//   // Función para expandir/colapsar detalles de una regla
//   const toggleRuleExpansion = (ruleId) => {
//     setExpandedRules(prev => ({
//       ...prev,
//       [ruleId]: !prev[ruleId]
//     }));
//   };

//   // Función para obtener explicación contextual de la regla
//   const getRuleExplanation = (rule) => {
//     const explanations = {
//       'CANCELLATION_POLICY': {
//         title: 'Política de Cancelación',
//         description: 'Define las condiciones bajo las cuales los clientes pueden cancelar sus citas.',
//         examples: [
//           'Permitir cancelación hasta 24 horas antes',
//           'Cancelación gratuita hasta 48 horas antes',
//           'Sin cancelación permitida'
//         ],
//         impact: 'Afecta la gestión de citas y la satisfacción del cliente'
//       },
//       'BOOKING_POLICY': {
//         title: 'Política de Reserva',
//         description: 'Establece las reglas para reservar citas y servicios.',
//         examples: [
//           'Reserva con anticipación mínima de 2 horas',
//           'Máximo 3 citas por cliente al mes',
//           'Requiere confirmación previa'
//         ],
//         impact: 'Controla el flujo de reservas y disponibilidad'
//       },
//       'WORKING_HOURS': {
//         title: 'Horarios de Trabajo',
//         description: 'Define los horarios en los que tu negocio opera.',
//         examples: [
//           'Lunes a Viernes: 9:00 - 18:00',
//           'Sábados: 10:00 - 14:00',
//           'Domingos: Cerrado'
//         ],
//         impact: 'Determina cuándo los clientes pueden agendar citas'
//       },
//       'PAYMENT_POLICY': {
//         title: 'Política de Pago',
//         description: 'Regula cómo y cuándo los clientes deben realizar pagos.',
//         examples: [
//           'Pago al finalizar el servicio',
//           'Anticipo del 50% al reservar',
//           'Acepta tarjetas y efectivo'
//         ],
//         impact: 'Afecta el flujo de caja y confianza del cliente'
//       },
//       'NOTIFICATION_POLICY': {
//         title: 'Política de Notificaciones',
//         description: 'Controla cómo y cuándo se envían notificaciones a clientes.',
//         examples: [
//           'Recordatorio 24 horas antes de la cita',
//           'Confirmación inmediata al reservar',
//           'Notificación de cambios'
//         ],
//         impact: 'Mejora la comunicación y reduce ausencias'
//       }
//     };

//     const category = rule.category || 'GENERAL';
//     return explanations[category] || {
//       title: 'Regla de Negocio',
//       description: rule.description || 'Esta regla personaliza el comportamiento de tu negocio.',
//       examples: ['Configura según tus necesidades'],
//       impact: 'Puede afectar la experiencia del cliente y operaciones'
//     };
//   };

//   // Función para formatear el tipo de dato esperado
//   const getInputType = (type) => {
//     switch (type) {
//       case 'NUMBER':
//         return 'number';
//       case 'BOOLEAN':
//         return 'checkbox';
//       case 'JSON':
//         return 'textarea';
//       default:
//         return 'text';
//     }
//   };

//   // Función para obtener placeholder apropiado
//   const getPlaceholder = (rule) => {
//     const type = rule.type || 'STRING';
    
//     switch (type) {
//       case 'NUMBER':
//         return 'Ej: 24, 48, 72';
//       case 'BOOLEAN':
//         return '';
//       case 'JSON':
//         return '{"key": "value"}';
//       default:
//         return 'Ingresa el valor de la regla';
//     }
//   };

//   // Función para obtener nombre amigable del tipo de dato
//   const getFriendlyTypeName = (type) => {
//     const typeNames = {
//       'BOOLEAN': 'Sí / No',
//       'NUMBER': 'Número',
//       'STRING': 'Texto',
//       'JSON': 'Configuración',
//       'DATE': 'Fecha',
//       'TIME': 'Hora',
//       'DURATION': 'Duración'
//     };
//     return typeNames[type] || type;
//   };

//   // Manejar eliminación de regla
//   const handleRemoveRule = async (assignmentId) => {
//     if (window.confirm('¿Estás seguro de que deseas eliminar esta regla?')) {
//       try {
//         await dispatch(removeRuleAssignment(assignmentId)).unwrap();
//         dispatch(getBusinessAssignedRules());
//       } catch {
//         // Error handled silently
//       }
//     }
//   };

//   // Manejar activar/desactivar regla con confirmación
//   const handleToggleRule = async (assignmentId, currentStatus, ruleKey) => {
//     const action = currentStatus ? 'desactivar' : 'activar';
//     const confirmed = window.confirm(
//       `¿Estás seguro de que deseas ${action} la regla "${ruleKey}"?\n\n` +
//       `${currentStatus ? '⚠️ Al desactivarla, dejará de aplicarse en tu negocio.' : '✅ Al activarla, comenzará a aplicarse inmediatamente.'}`
//     );

//     if (!confirmed) return;

//     try {
//       await dispatch(toggleRuleAssignment({ 
//         assignmentId, 
//         isActive: !currentStatus 
//       })).unwrap();
//       dispatch(getBusinessAssignedRules());
      
//       showToast(
//         'success', 
//         currentStatus 
//           ? `⚠️ Regla "${ruleKey}" desactivada` 
//           : `✅ Regla "${ruleKey}" activada`
//       );
//     } catch {
//       showToast('error', `❌ Error al cambiar el estado de la regla`);
//     }
//   };

//   const tabs = [
//     { id: 'available', label: 'Reglas Disponibles', icon: Plus },
//     { id: 'assigned', label: 'Reglas Asignadas', icon: Check }
//   ];

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//         {/* Overlay */}
//         <div 
//           className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
//           onClick={onClose}
//         />

//         {/* Modal */}
//         <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
//           {/* Header */}
//           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Gestión de Reglas de Negocio
//                 </h3>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="border-b border-gray-200">
//             <nav className="flex space-x-8 px-6">
//               {tabs.map(tab => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id)}
//                     className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
//                       activeTab === tab.id
//                         ? 'border-pink-500 text-pink-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     }`}
//                   >
//                     <div className="flex items-center space-x-2">
//                       <Icon className="h-4 w-4" />
//                       <span>{tab.label}</span>
//                       {tab.id === 'assigned' && getAssignedRules().length > 0 && (
//                         <span className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full">
//                           {getAssignedRules().length}
//                         </span>
//                       )}
//                     </div>
//                   </button>
//                 );
//               })}
//             </nav>
//           </div>

//           {/* Filters - Solo mostrar en pestaña de disponibles */}
//           {activeTab === 'available' && (
//             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <div className="flex-1">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                     <input
//                       type="text"
//                       placeholder="Buscar reglas..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>
//                 <div className="sm:w-48">
//                   <select
//                     value={selectedCategory}
//                     onChange={(e) => setSelectedCategory(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
//                   >
//                     <option value="all">Todas las categorías</option>
//                     {getCategories().filter(cat => cat !== 'all').map(category => {
//                       // Convertir categorías a nombres más amigables
//                       const categoryNames = {
//                         'PAYMENT_POLICY': 'Políticas de Pago',
//                         'BOOKING_POLICY': 'Políticas de Reserva',
//                         'CANCELLATION_POLICY': 'Políticas de Cancelación',
//                         'WORKING_HOURS': 'Horarios de Trabajo',
//                         'NOTIFICATION_POLICY': 'Políticas de Notificación',
//                         'SERVICE_POLICY': 'Políticas de Servicio',
//                         'REFUND_POLICY': 'Políticas de Devolución'
//                       };
                      
//                       return (
//                         <option key={category} value={category}>
//                           {categoryNames[category] || category.replace('_', ' ')}
//                         </option>
//                       );
//                     })}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Content */}
//           <div className="p-6 max-h-96 overflow-y-auto">
//             {activeTab === 'available' ? (
//               /* Plantillas Disponibles - Solo las NO asignadas */
//               <div className="space-y-4">
//                 {(() => {
//                   // Filtrar solo las plantillas que NO están asignadas
//                   const unassignedTemplates = getFilteredAvailableTemplates().filter(template =>
//                     !isTemplateAssigned(template.template_id)
//                   );

//                   if (unassignedTemplates.length === 0) {
//                     return (
//                       <div className="text-center py-8">
//                         <div className="text-gray-400 mb-4">
//                           <Check className="h-12 w-12 mx-auto" />
//                         </div>
//                         <h4 className="text-lg font-medium text-gray-900 mb-2">
//                           Todas las plantillas están asignadas
//                         </h4>
//                         <p className="text-gray-500 mb-4">
//                           Ve a la pestaña "Reglas Asignadas" para configurar las reglas que ya tienes.
//                         </p>
//                         <button
//                           onClick={() => setActiveTab('assigned')}
//                           className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-md hover:bg-pink-700 transition-colors"
//                         >
//                           Ver Reglas Asignadas
//                         </button>
//                       </div>
//                     );
//                   }

//                   // Renderizar plantillas disponibles agrupadas por categoría
//                   const templatesByCategory = unassignedTemplates.reduce((acc, template) => {
//                     const category = template.category || 'GENERAL';
//                     if (!acc[category]) {
//                       acc[category] = [];
//                     }
//                     acc[category].push(template);
//                     return acc;
//                   }, {});

//                   return (
//                     <div className="space-y-6 max-h-96 overflow-y-auto">
//                       <div className="bg-blue-100 border border-blue-400 rounded p-3 text-sm text-center">
//                         📊 Mostrando <strong>{unassignedTemplates.length} plantillas disponibles</strong> para asignar
//                         {searchTerm.trim() && <span> (filtradas por: "{searchTerm}")</span>}
//                       </div>

//                       {Object.entries(templatesByCategory).map(([category, templates]) => (
//                         <div key={category} className="border-2 border-gray-200 rounded-lg p-4">
//                           <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
//                             {category === 'PAYMENT_POLICY' && '💳'}
//                             {category === 'BOOKING_POLICY' && '📅'}
//                             {category === 'CANCELLATION_POLICY' && '❌'}
//                             {category === 'SERVICE_POLICY' && '🔧'}
//                             {category === 'NOTIFICATION_POLICY' && '📧'}
//                             {category === 'WORKING_HOURS' && '🕐'}
//                             {category === 'REFUND_POLICY' && '💰'}
//                             {category === 'GENERAL' && '⚙️'}
//                             <span className="ml-2">{category.replace('_', ' ')}</span>
//                             <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
//                               {templates.length}
//                             </span>
//                           </h3>

//                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                             {templates.map((template) => {
//                               const isSelected = selectedTemplateCard === template.template_id;
//                               const explanation = getRuleExplanation({ ...template, category });
                              
//                               return (
//                                 <div
//                                   key={template.template_id}
//                                   onClick={() => setSelectedTemplateCard(isSelected ? null : template.template_id)}
//                                   className={`cursor-pointer rounded-xl overflow-hidden transition-all duration-300 ${
//                                     isSelected 
//                                       ? 'ring-4 ring-pink-500 shadow-2xl scale-105 bg-gradient-to-br from-pink-50 to-purple-50' 
//                                       : 'border-2 border-gray-200 hover:border-pink-300 hover:shadow-lg bg-white'
//                                   }`}
//                                 >
//                                   {/* Header de la tarjeta */}
//                                   <div className={`p-4 ${isSelected ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-50'}`}>
//                                     <div className="flex items-start justify-between">
//                                       <div className="flex-1">
//                                         <h4 className={`text-lg font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
//                                           {explanation.title}
//                                         </h4>
//                                         <p className={`text-sm ${isSelected ? 'text-pink-100' : 'text-gray-600'}`}>
//                                           {template.key}
//                                         </p>
//                                       </div>
//                                       {isSelected && (
//                                         <div className="bg-white rounded-full p-2">
//                                           <CheckCircle2 className="h-6 w-6 text-pink-600" />
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>

//                                   {/* Contenido de la tarjeta */}
//                                   <div className="p-4 space-y-3">
//                                     {/* Descripción */}
//                                     <div>
//                                       <p className="text-sm text-gray-700 leading-relaxed">
//                                         {explanation.description}
//                                       </p>
//                                     </div>

//                                     {/* Tipo de dato */}
//                                     <div className="flex items-center space-x-2">
//                                       <span className="text-xs font-medium text-gray-600">Tipo:</span>
//                                       <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
//                                         {getFriendlyTypeName(template.type)}
//                                       </span>
//                                     </div>

//                                     {/* Impacto */}
//                                     {isSelected && (
//                                       <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
//                                         <div className="flex items-start space-x-2">
//                                           <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
//                                           <div>
//                                             <div className="text-xs font-semibold text-orange-900 mb-1">
//                                               Impacto en tu negocio:
//                                             </div>
//                                             <p className="text-xs text-orange-700">
//                                               {explanation.impact}
//                                             </p>
//                                           </div>
//                                         </div>
//                                       </div>
//                                     )}

//                                     {/* Ejemplos */}
//                                     {isSelected && explanation.examples && (
//                                       <div className="bg-green-50 border border-green-200 rounded-lg p-3">
//                                         <div className="text-xs font-semibold text-green-900 mb-2">
//                                           💡 Ejemplos de uso:
//                                         </div>
//                                         <ul className="space-y-1">
//                                           {explanation.examples.slice(0, 2).map((example, idx) => (
//                                             <li key={idx} className="text-xs text-green-700 flex items-start">
//                                               <span className="mr-2">•</span>
//                                               <span>{example}</span>
//                                             </li>
//                                           ))}
//                                         </ul>
//                                       </div>
//                                     )}

//                                     {/* Valor por defecto */}
//                                     <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
//                                       <div className="text-xs font-semibold text-gray-700 mb-1">
//                                         📌 Valor inicial:
//                                       </div>
//                                       <div className="text-sm text-gray-900 font-mono">
//                                         {template.type === 'BOOLEAN' 
//                                           ? (template.defaultValue ? '✅ Activado' : '❌ Desactivado')
//                                           : JSON.stringify(template.defaultValue)}
//                                       </div>
//                                     </div>

//                                     {/* Botón de asignar */}
//                                     {isSelected && (
//                                       <button
//                                         onClick={(e) => {
//                                           e.stopPropagation();
//                                           handleAssignTemplate(template);
//                                         }}
//                                         className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
//                                       >
//                                         <Plus className="h-5 w-5" />
//                                         <span>Asignar a mi negocio</span>
//                                       </button>
//                                     )}
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   );
//                 })()}
//               </div>
//             ) : (
//               /* Reglas Asignadas - Vista Mejorada */
//               <div className="space-y-4">
//                 {(() => {
//                   const assignedRulesFiltered = getAssignedRules();

//                   return assignedRulesFiltered.length === 0 ? (
//                     <div className="text-center py-8">
//                       <div className="text-gray-400 mb-4">
//                         <AlertTriangle className="h-12 w-12 mx-auto" />
//                       </div>
//                       <h4 className="text-lg font-medium text-gray-900 mb-2">
//                         No tienes reglas asignadas
//                       </h4>
//                       <p className="text-gray-500 mb-4">
//                         Ve a la pestaña "Reglas Disponibles" para seleccionar las reglas que necesitas.
//                       </p>
//                       <button
//                         onClick={() => setActiveTab('available')}
//                         className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-md hover:bg-pink-700 transition-colors"
//                       >
//                         Ver Reglas Disponibles
//                       </button>
//                     </div>
//                   ) : (
//                     <>
//                       {/* Información general */}
//                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//                         <div className="flex items-start space-x-3">
//                           <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                           <div>
//                             <h4 className="font-medium text-blue-900 mb-1">
//                               💡 Cómo gestionar tus reglas
//                             </h4>
//                             <ul className="text-sm text-blue-700 space-y-1">
//                               <li>• <strong>Editar:</strong> Haz clic en "Editar" para cambiar el valor de la regla</li>
//                               <li>• <strong>Activar/Desactivar:</strong> Controla si la regla está activa sin eliminarla</li>
//                               <li>• <strong>Eliminar:</strong> Quita la regla completamente de tu negocio</li>
//                               <li>• <strong>Ver detalles:</strong> Expande cada regla para ver información completa</li>
//                             </ul>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Lista de reglas asignadas */}
//                       <div className="space-y-3">
//                         {assignedRulesFiltered.map(rule => {
//                           const Icon = getRuleIcon(rule.category);
//                           const ruleId = rule.business_rule_id || rule.id || rule.template_id;
//                           const isExpanded = expandedRules[ruleId];
//                           const explanation = getRuleExplanation(rule);
//                           const currentValue = rule.customValue !== undefined ? rule.customValue : 
//                                              (rule.effective_value !== undefined ? rule.effective_value : 
//                                              (rule.defaultValue !== undefined ? rule.defaultValue : rule.template?.defaultValue));

//                           return (
//                             <div 
//                               key={ruleId} 
//                               className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-pink-300 transition-all"
//                             >
//                               {/* Header de la regla */}
//                               <div className="bg-gradient-to-r from-gray-50 to-white p-4">
//                                 <div className="flex items-start justify-between">
//                                   <div className="flex items-start space-x-3 flex-1">
//                                     <div className="p-3 bg-pink-100 rounded-lg">
//                                       <Icon className="h-6 w-6 text-pink-600" />
//                                     </div>
//                                     <div className="flex-1">
//                                       <div className="flex items-center space-x-2 mb-1">
//                                         <h4 className="font-bold text-gray-900 text-lg">
//                                           {explanation.title}
//                                         </h4>
//                                         <span className={`px-3 py-1 text-xs font-bold rounded-full ${
//                                           (rule.rule_is_active ?? rule.isActive) !== false
//                                             ? 'text-green-700 bg-green-100 border border-green-300'
//                                             : 'text-gray-500 bg-gray-100 border border-gray-300'
//                                         }`}>
//                                           {(rule.rule_is_active ?? rule.isActive) !== false ? '✓ ACTIVA' : '○ INACTIVA'}
//                                         </span>
//                                       </div>
//                                       <p className="text-sm text-gray-600 mb-2">
//                                         {rule.description || explanation.description}
//                                       </p>
//                                       <div className="flex items-center space-x-2 text-xs text-gray-500">
//                                         <span className="bg-gray-100 px-2 py-1 rounded font-mono">
//                                           {rule.key}
//                                         </span>
//                                         <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
//                                           {getFriendlyTypeName(rule.type || 'STRING')}
//                                         </span>
//                                       </div>
//                                     </div>
//                                   </div>

//                                   {/* Botones de acción */}
//                                   <div className="flex items-center space-x-2 ml-4">
//                                     <button
//                                       onClick={() => handleEditTemplate(rule)}
//                                       className="flex items-center space-x-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all hover:scale-105 shadow-sm"
//                                       title="Editar valor de la regla"
//                                     >
//                                       <Edit2 className="h-4 w-4" />
//                                       <span>Editar</span>
//                                     </button>
//                                     <button
//                                       onClick={() => handleToggleRule(ruleId, rule.rule_is_active ?? rule.isActive, rule.key)}
//                                       className={`px-3 py-2 text-sm font-medium rounded-md transition-all hover:scale-105 shadow-sm ${
//                                         (rule.rule_is_active ?? rule.isActive) !== false
//                                           ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-300'
//                                           : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
//                                       }`}
//                                       title={(rule.rule_is_active ?? rule.isActive) !== false ? 'Desactivar regla' : 'Activar regla'}
//                                     >
//                                       {(rule.rule_is_active ?? rule.isActive) !== false ? 'Desactivar' : 'Activar'}
//                                     </button>
//                                     <button
//                                       onClick={() => handleRemoveRule(ruleId)}
//                                       className="px-3 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-all hover:scale-105 border border-red-300 shadow-sm"
//                                       title="Eliminar regla"
//                                     >
//                                       Eliminar
//                                     </button>
//                                     <button
//                                       onClick={() => toggleRuleExpansion(ruleId)}
//                                       className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
//                                       title={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
//                                     >
//                                       {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
//                                     </button>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Valor actual */}
//                               <div className="px-4 py-3 bg-white border-t border-gray-200">
//                                 <div className="flex items-start justify-between">
//                                   <div className="flex-1">
//                                     <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
//                                       <span>📊 Valor Configurado:</span>
//                                       {rule.customValue !== undefined && (
//                                         <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
//                                           Personalizado
//                                         </span>
//                                       )}
//                                     </div>
//                                     <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
//                                       {rule.type === 'BOOLEAN' ? (
//                                         <div className="flex items-center space-x-2">
//                                           <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                                             currentValue ? 'bg-green-500' : 'bg-gray-400'
//                                           }`}>
//                                             {currentValue ? (
//                                               <Check className="h-6 w-6 text-white" />
//                                             ) : (
//                                               <X className="h-6 w-6 text-white" />
//                                             )}
//                                           </div>
//                                           <span className="text-lg font-bold text-gray-900">
//                                             {currentValue ? 'Activado' : 'Desactivado'}
//                                           </span>
//                                         </div>
//                                       ) : (
//                                         <pre className="text-sm text-gray-900 font-mono whitespace-pre-wrap break-words">
//                                           {formatRuleValue(currentValue)}
//                                         </pre>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>

//                               {/* Detalles expandibles */}
//                               {isExpanded && (
//                                 <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-3">
//                                   {/* Impacto */}
//                                   <div>
//                                     <div className="text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1">
//                                       <AlertTriangle className="h-4 w-4 text-orange-500" />
//                                       <span>Impacto:</span>
//                                     </div>
//                                     <p className="text-sm text-gray-600 bg-white rounded p-2 border border-orange-200">
//                                       {explanation.impact}
//                                     </p>
//                                   </div>

//                                   {/* Ejemplos */}
//                                   {explanation.examples && (
//                                     <div>
//                                       <div className="text-sm font-semibold text-gray-700 mb-2">
//                                         💡 Ejemplos de uso:
//                                       </div>
//                                       <ul className="space-y-1">
//                                         {explanation.examples.map((example, idx) => (
//                                           <li key={idx} className="text-sm text-gray-600 bg-white rounded p-2 border border-blue-100">
//                                             {example}
//                                           </li>
//                                         ))}
//                                       </ul>
//                                     </div>
//                                   )}

//                                   {/* Validación */}
//                                   {rule.validationRules && (
//                                     <div>
//                                       <div className="text-sm font-semibold text-gray-700 mb-1">
//                                         ✓ Reglas de validación:
//                                       </div>
//                                       <pre className="text-xs text-gray-600 bg-white rounded p-2 border border-gray-200 font-mono">
//                                         {JSON.stringify(
//                                           typeof rule.validationRules === 'string' 
//                                             ? JSON.parse(rule.validationRules) 
//                                             : rule.validationRules, 
//                                           null, 
//                                           2
//                                         )}
//                                       </pre>
//                                     </div>
//                                   )}

//                                   {/* Notas */}
//                                   {rule.notes && (
//                                     <div>
//                                       <div className="text-sm font-semibold text-gray-700 mb-1 flex items-center space-x-1">
//                                         <Info className="h-4 w-4 text-blue-500" />
//                                         <span>Notas:</span>
//                                       </div>
//                                       <p className="text-sm text-blue-700 bg-blue-50 rounded p-2 border border-blue-200">
//                                         {rule.notes}
//                                       </p>
//                                     </div>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </>
//                   );
//                 })()}
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
//             <div className="text-sm text-gray-500">
//               {activeTab === 'available' 
//                 ? `${getFilteredAvailableTemplates().length} reglas disponibles`
//                 : `${getAssignedRules().length} reglas asignadas`
//               }
//             </div>
//             <button
//               onClick={onClose}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
//             >
//               Cerrar
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Modal de Edición */}
//       {showEditModal && editingRule && (
//         <div className="fixed inset-0 z-[60] overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             {/* Overlay */}
//             <div 
//               className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" 
//               onClick={() => setShowEditModal(false)}
//             />

//             {/* Modal de edición */}
//             <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-xl border-2 border-pink-200">
//               {/* Header del modal de edición */}
//               <div className="px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-600">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     <div className="p-2 bg-white rounded-lg">
//                       <Edit2 className="h-6 w-6 text-pink-600" />
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-white">
//                         Editar Regla
//                       </h3>
//                       <p className="text-pink-100 text-sm">
//                         {editingRule.key}
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => setShowEditModal(false)}
//                     className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
//                   >
//                     <X className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>

//               {/* Contenido del modal */}
//               <div className="px-6 py-4 space-y-4">
//                 {/* Descripción */}
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <div className="flex items-start space-x-2">
//                     <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                     <div>
//                       <p className="text-sm font-medium text-blue-900 mb-1">
//                         {getRuleExplanation(editingRule).title}
//                       </p>
//                       <p className="text-sm text-blue-700">
//                         {editingRule.description || getRuleExplanation(editingRule).description}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Información del tipo */}
//                 <div className="flex items-center space-x-2 text-sm">
//                   <span className="font-medium text-gray-700">Tipo de dato:</span>
//                   <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
//                     {getFriendlyTypeName(editingRule.type || 'STRING')}
//                   </span>
//                 </div>

//                 {/* Validación si existe */}
//                 {editingRule.validationRules && (
//                   <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
//                     <div className="text-sm font-medium text-yellow-900 mb-1">
//                       ⚠️ Restricciones:
//                     </div>
//                     <div className="text-sm text-yellow-700">
//                       {(() => {
//                         try {
//                           const validation = typeof editingRule.validationRules === 'string' 
//                             ? JSON.parse(editingRule.validationRules) 
//                             : editingRule.validationRules;
                          
//                           const restrictions = [];
//                           if (validation.min !== undefined) restrictions.push(`Mínimo: ${validation.min}`);
//                           if (validation.max !== undefined) restrictions.push(`Máximo: ${validation.max}`);
//                           if (validation.pattern) restrictions.push(`Patrón: ${validation.pattern}`);
                          
//                           return restrictions.length > 0 
//                             ? restrictions.join(' | ') 
//                             : 'Sin restricciones específicas';
//                         } catch {
//                           return 'Validación configurada';
//                         }
//                       })()}
//                     </div>
//                   </div>
//                 )}

//                 {/* Campo de edición */}
//                 <div>
//                   <label className="block text-sm font-bold text-gray-700 mb-2">
//                     Nuevo Valor:
//                   </label>
                  
//                   {editingRule.type === 'BOOLEAN' ? (
//                     <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
//                       <button
//                         onClick={() => setEditValue(true)}
//                         className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
//                           editValue === true || editValue === 'true'
//                             ? 'bg-green-500 text-white shadow-lg scale-105'
//                             : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500'
//                         }`}
//                       >
//                         <Check className="h-5 w-5 mx-auto mb-1" />
//                         Activado
//                       </button>
//                       <button
//                         onClick={() => setEditValue(false)}
//                         className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
//                           editValue === false || editValue === 'false'
//                             ? 'bg-red-500 text-white shadow-lg scale-105'
//                             : 'bg-white text-gray-700 border border-gray-300 hover:border-red-500'
//                         }`}
//                       >
//                         <X className="h-5 w-5 mx-auto mb-1" />
//                         Desactivado
//                       </button>
//                     </div>
//                   ) : editingRule.type === 'JSON' ? (
//                     <textarea
//                       value={typeof editValue === 'object' ? JSON.stringify(editValue, null, 2) : editValue}
//                       onChange={(e) => setEditValue(e.target.value)}
//                       placeholder={getPlaceholder(editingRule)}
//                       rows={6}
//                       className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-sm"
//                     />
//                   ) : (
//                     <input
//                       type={getInputType(editingRule.type)}
//                       value={editValue}
//                       onChange={(e) => setEditValue(e.target.value)}
//                       placeholder={getPlaceholder(editingRule)}
//                       className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
//                     />
//                   )}
                  
//                   {/* Ayuda según el tipo */}
//                   <p className="mt-2 text-sm text-gray-500">
//                     {editingRule.type === 'NUMBER' && '💡 Ingresa solo números (puede incluir decimales)'}
//                     {editingRule.type === 'JSON' && '💡 Ingresa un objeto JSON válido'}
//                     {editingRule.type === 'STRING' && '💡 Ingresa texto libre'}
//                     {editingRule.type === 'BOOLEAN' && '💡 Selecciona activado o desactivado'}
//                   </p>
//                 </div>

//                 {/* Preview del valor actual */}
//                 <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
//                   <div className="text-sm font-medium text-gray-700 mb-1">
//                     📌 Valor Actual:
//                   </div>
//                   <div className="text-sm text-gray-600 font-mono bg-white rounded p-2">
//                     {formatRuleValue(editingRule.customValue !== undefined ? editingRule.customValue : editingRule.defaultValue)}
//                   </div>
//                 </div>

//                 {/* Ejemplos */}
//                 {getRuleExplanation(editingRule).examples && (
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-3">
//                     <div className="text-sm font-medium text-green-900 mb-2">
//                       💡 Ejemplos de valores válidos:
//                     </div>
//                     <ul className="text-sm text-green-700 space-y-1">
//                       {getRuleExplanation(editingRule).examples.slice(0, 3).map((example, idx) => (
//                         <li key={idx}>• {example}</li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </div>

//               {/* Footer del modal */}
//               <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowEditModal(false)}
//                   className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancelar
//                 </button>
//                 <button
//                   onClick={handleSaveEdit}
//                   className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all hover:scale-105 shadow-lg flex items-center space-x-2"
//                 >
//                   <Save className="h-4 w-4" />
//                   <span>Guardar Cambios</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Toast Notification */}
//       {toast.show && (
//         <div className="fixed top-4 right-4 z-[70] animate-slideInRight">
//           <div className={`rounded-lg shadow-2xl p-4 flex items-start space-x-3 max-w-md border-2 ${
//             toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-900' :
//             toast.type === 'error' ? 'bg-red-50 border-red-500 text-red-900' :
//             toast.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-900' :
//             'bg-blue-50 border-blue-500 text-blue-900'
//           }`}>
//             {toast.type === 'success' && <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />}
//             {toast.type === 'error' && <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />}
//             {toast.type === 'warning' && <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />}
//             {toast.type === 'info' && <Info className="h-6 w-6 text-blue-600 flex-shrink-0" />}
            
//             <div className="flex-1">
//               <p className="text-sm font-medium">{toast.message}</p>
//             </div>
            
//             <button
//               onClick={() => setToast({ show: false, type: '', message: '' })}
//               className="text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BusinessRuleModal;
