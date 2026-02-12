import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  PlayCircleIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BeakerIcon,
  ShoppingCartIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  MinusCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AppointmentWorkflowModal from './AppointmentWorkflowModal';
import AppointmentSuppliesTab from './AppointmentSuppliesTab';
import ProductSelector from '../../sales/ProductSelector';
import { fetchProducts } from '@shared/store/slices/productsSlice';
import { createSale } from '@shared/store/slices/salesSlice';

/**
 * Modal de detalles de cita para especialistas
 * Incluye todas las transiciones de estado y validaciones
 */
export default function AppointmentDetailsModal({ isOpen, appointment, businessId, onClose, onUpdate }) {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const { products } = useSelector(state => state.products);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [appointmentDetails, setAppointmentDetails] = useState(appointment);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflowAction, setWorkflowAction] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [savingSale, setSavingSale] = useState(false);
  const [activeShiftId, setActiveShiftId] = useState(null);
  
  // 🆕 Estados para edición de servicios
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [editedServices, setEditedServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [savingServices, setSavingServices] = useState(false);

  const loadAppointmentDetails = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointment.id}?businessId=${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Error cargando detalles');
      
      const data = await response.json();
      setAppointmentDetails(data.data || data.appointment);
    } catch (error) {
      console.error('Error loading appointment details:', error);
    } finally {
      setLoading(false);
    }
  }, [token, businessId, appointment?.id]);

  const loadActiveShift = useCallback(async () => {
    if (!token || !businessId) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/cash-register/active-shift?businessId=${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) return;
      
      const result = await response.json();
      if (result.success && result.data?.hasActiveShift && result.data?.shift) {
        setActiveShiftId(result.data.shift.id);
      }
    } catch (error) {
      console.log('No hay turno activo o error al cargar:', error);
    }
  }, [token, businessId]);

  // 🆕 Cargar servicios disponibles del negocio (filtrados por especialista del turno)
  const loadAvailableServices = useCallback(async () => {
    if (!token || !businessId) return;
    
    try {
      let services = [];
      
      // Si tenemos el especialista, intentar filtrar por sus servicios asignados
      if (appointmentDetails?.specialistId) {
        try {
          const specialistResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/api/business/${businessId}/specialists/${appointmentDetails.specialistId}/services`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (specialistResponse.ok) {
            const specialistData = await specialistResponse.json();
            services = specialistData.data?.services || specialistData.services || [];
          }
        } catch (specialistError) {
          console.log('No se pudieron cargar los servicios del especialista, cargando todos los servicios');
        }
      }
      
      // Si no hay servicios del especialista, cargar todos los servicios del negocio
      if (services.length === 0) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/services?businessId=${businessId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) throw new Error('Error cargando servicios');
        
        const data = await response.json();
        services = data.data?.services || [];
      }
      
      setAvailableServices(services);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  }, [token, businessId, appointmentDetails?.specialistId]);

  // 🆕 Iniciar edición de servicios
  const handleStartEditServices = () => {
    const currentServices = appointmentDetails.services || [];
    setEditedServices(currentServices.map(s => s.id));
    setIsEditingServices(true);
  };

  // 🆕 Cancelar edición de servicios
  const handleCancelEditServices = () => {
    setIsEditingServices(false);
    setEditedServices([]);
  };

  // 🆕 Agregar servicio a la lista
  const handleAddService = (serviceId) => {
    if (!editedServices.includes(serviceId)) {
      setEditedServices([...editedServices, serviceId]);
    }
  };

  // 🆕 Quitar servicio de la lista
  const handleRemoveService = (serviceId) => {
    setEditedServices(editedServices.filter(id => id !== serviceId));
  };

  // 🆕 Guardar servicios actualizados
  const handleSaveServices = async () => {
    if (editedServices.length === 0) {
      toast.error('Debes tener al menos un servicio');
      return;
    }

    try {
      setSavingServices(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointmentDetails.id}?businessId=${businessId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            serviceIds: editedServices
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error actualizando servicios');
      }

      // Consumir respuesta para completar la request
      await response.json();
      
      toast.success('Servicios actualizados exitosamente');
      setIsEditingServices(false);
      setEditedServices([]);
      
      // Recargar detalles de la cita
      await loadAppointmentDetails();
      onUpdate();
      
    } catch (error) {
      console.error('Error saving services:', error);
      toast.error(error.message || 'No se pudieron actualizar los servicios');
    } finally {
      setSavingServices(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'text-yellow-600 bg-yellow-100',
      CONFIRMED: 'text-blue-600 bg-blue-100',
      IN_PROGRESS: 'text-purple-600 bg-purple-100',
      COMPLETED: 'text-green-600 bg-green-100',
      CANCELED: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completado',
      CANCELED: 'Cancelado'
    };
    return texts[status] || status;
  };

  const handleConfirm = async () => {
    try {
      setActionLoading('confirm');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointmentDetails.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            status: 'CONFIRMED',
            businessId: businessId
          })
        }
      );

      if (!response.ok) throw new Error('Error confirmando turno');

      // Consumir respuesta para completar la request
      await response.json();
      setAppointmentDetails(prev => ({ ...prev, status: 'CONFIRMED' }));
      toast.success('✅ Turno confirmado');
      onUpdate();
    } catch (error) {
      toast.error(error.message || 'No se pudo confirmar el turno');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async () => {
    // Abrir workflow modal para validar consentimiento, fotos y arrancar
    setWorkflowAction('start');
    setShowWorkflowModal(true);
  };

  const handleUploadBeforePhoto = () => {
    // Abrir modal para subir foto de "antes"
    setWorkflowAction('before-photo');
    setShowWorkflowModal(true);
  };

  const handleComplete = async () => {
    try {
      setActionLoading('complete');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointmentDetails.id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            status: 'COMPLETED',
            businessId: businessId
          })
        }
      );

      if (!response.ok) throw new Error('Error completando turno');

      // Consumir respuesta para completar la request
      await response.json();
      setAppointmentDetails(prev => ({ ...prev, status: 'COMPLETED' }));
      toast.success('✅ Turno completado');
      onUpdate();
    } catch (error) {
      toast.error(error.message || 'No se pudo completar el turno');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUploadAfterPhoto = () => {
    // Abrir modal para subir foto de "después"
    setWorkflowAction('after-photo');
    setShowWorkflowModal(true);
  };

  const handleWorkflowSuccess = () => {
    setShowWorkflowModal(false);
    setWorkflowAction(null);
    loadAppointmentDetails();
    onUpdate();
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Por favor ingresa un motivo de cancelación');
      return;
    }

    try {
      setActionLoading('cancel');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointmentDetails.id}/cancel`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            status: 'CANCELED',
            cancelReason: cancelReason 
          })
        }
      );

      if (!response.ok) throw new Error('Error cancelando turno');

      // Consumir respuesta para completar la request
      await response.json();
      setAppointmentDetails(prev => ({ ...prev, status: 'CANCELED' }));
      setShowCancelForm(false);
      setCancelReason('');
      toast.success('Turno cancelado correctamente');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.message || 'No se pudo cancelar el turno');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSale = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Debes agregar al menos un producto');
      return;
    }

    try {
      setSavingSale(true);
      
      const saleData = {
        branchId: appointmentDetails.branchId || null,
        clientId: appointmentDetails.clientId,
        shiftId: activeShiftId || null, // Asociar con el turno activo
        items: selectedProducts.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          discountType: 'NONE',
          discountValue: 0
        })),
        discountType: 'NONE',
        discountValue: 0,
        paymentMethod: 'CASH',
        paidAmount: selectedProducts.reduce((sum, item) => sum + item.total, 0),
        notes: `Venta durante turno ${appointmentDetails.appointmentNumber || appointmentDetails.id}`,
        appointmentId: appointmentDetails.id
      };

      await dispatch(createSale(saleData)).unwrap();
      
      toast.success('Venta registrada exitosamente' + (activeShiftId ? ' y asociada al turno de caja' : ''));
      setSelectedProducts([]);
      setActiveTab('details');
    } catch (error) {
      console.error('Error guardando venta:', error);
      toast.error(error.message || 'Error al registrar la venta');
    } finally {
      setSavingSale(false);
    }
  };

  if (!isOpen) return null;
  
  const tabs = [
    { id: 'details', name: 'Detalles', icon: ClockIcon },
    { id: 'supplies', name: 'Consumo de Productos', icon: BeakerIcon },
    { id: 'sales', name: 'Ventas', icon: ShoppingCartIcon }
  ];
  // Validar que appointmentDetails existe antes de renderizar
  if (!appointmentDetails) {
    return null;
  }

  const startDate = new Date(appointmentDetails.startTime);
  const endDate = new Date(appointmentDetails.endTime);
  
  // Soportar ambos formatos: Client/client y Service/service
  const client = appointmentDetails.Client || appointmentDetails.client;
  const service = appointmentDetails.Service || appointmentDetails.service;
  const services = appointmentDetails.services || [];
  
  const clientName = client 
    ? `${client.firstName} ${client.lastName}`
    : appointmentDetails.clientName || 'Cliente no especificado';
  
  // Determinar si hay múltiples servicios
  const hasMultipleServices = services.length > 1;
  const serviceName = hasMultipleServices 
    ? `${services.length} servicios` 
    : (service?.name || appointmentDetails.serviceName || 'Servicio no especificado');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Detalles del Turno
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            {/* Status Badge */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(appointmentDetails.status)}`}>
                {getStatusText(appointmentDetails.status)}
              </span>
              {appointmentDetails.appointmentNumber && (
                <span className="text-white text-sm opacity-80">
                  #{appointmentDetails.appointmentNumber}
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 font-semibold'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : activeTab === 'supplies' ? (
              <AppointmentSuppliesTab
                appointmentId={appointmentDetails.id}
                specialistId={appointmentDetails.specialistId}
                branchId={appointmentDetails.branchId}
                serviceName={appointmentDetails.Service?.name || appointmentDetails.service?.name || appointmentDetails.serviceName}
              />
            ) : activeTab === 'sales' ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💰 Registra los productos vendidos durante este turno. La venta se vinculará automáticamente con la cita y el cliente.
                  </p>
                </div>
                {!activeShiftId && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>No hay turno de caja activo.</strong> La venta se registrará pero no aparecerá en el cierre de caja. Para asociarla con un turno, primero abre un turno en la sección de Caja.
                    </p>
                  </div>
                )}
                <ProductSelector
                  products={products || []}
                  selectedItems={selectedProducts}
                  onItemsChange={setSelectedProducts}
                  allowQuantityEdit={true}
                  allowPriceEdit={false}
                  showStock={true}
                  title="Productos Vendidos"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Fecha y Hora */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ClockIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Fecha y Hora</span>
                  </div>
                  <p className="text-gray-700">
                    {format(startDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                  <p className="text-gray-600">
                    {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                  </p>
                </div>

                {/* Cliente */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Cliente</span>
                  </div>
                  <p className="text-gray-900 font-medium">{clientName}</p>
                  {client?.phone && (
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                      <PhoneIcon className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client?.email && (
                    <div className="flex items-center gap-2 mt-1 text-gray-600">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                </div>

                {/* Servicio(s) */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        {hasMultipleServices ? 'Servicios' : 'Servicio'}
                      </span>
                    </div>
                    
                    {/* 🆕 Botón de editar servicios (solo en PENDING, CONFIRMED, IN_PROGRESS) */}
                    {!isEditingServices && ['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(appointmentDetails.status) && (
                      <button
                        onClick={handleStartEditServices}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Editar
                      </button>
                    )}
                  </div>
                  
                  {isEditingServices ? (
                    // 🆕 Modo de edición de servicios
                    <div className="space-y-4">
                      {/* Lista de servicios actuales en edición */}
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 mb-2">Servicios seleccionados:</p>
                        {editedServices.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No hay servicios seleccionados</p>
                        ) : (
                          editedServices.map((serviceId) => {
                            const service = availableServices.find(s => s.id === serviceId);
                            if (!service) return null;
                            
                            return (
                              <div key={serviceId} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{service.name}</p>
                                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                    <span>{service.duration} min</span>
                                    <span className="font-semibold">${parseFloat(service.price).toLocaleString('es-CO')}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveService(serviceId)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Quitar servicio"
                                >
                                  <MinusCircleIcon className="w-5 h-5" />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Selector para agregar más servicios */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Agregar servicios:</p>
                        <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                          {availableServices
                            .filter(service => !editedServices.includes(service.id))
                            .map((service) => (
                              <button
                                key={service.id}
                                onClick={() => handleAddService(service.id)}
                                className="w-full flex items-center justify-between p-2 hover:bg-blue-50 rounded-lg transition-colors text-left"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                                  <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                                    <span>{service.duration} min</span>
                                    <span>${parseFloat(service.price).toLocaleString('es-CO')}</span>
                                  </div>
                                </div>
                                <PlusCircleIcon className="w-5 h-5 text-blue-600" />
                              </button>
                            ))}
                        </div>
                      </div>

                      {/* Resumen de cambios */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-semibold text-blue-900">Resumen:</p>
                        <div className="flex items-center justify-between text-sm text-blue-800 mt-1">
                          <span>Total servicios: {editedServices.length}</span>
                          <span className="font-bold">
                            Duración: {editedServices.reduce((sum, id) => {
                              const svc = availableServices.find(s => s.id === id);
                              return sum + (svc?.duration || 0);
                            }, 0)} min
                          </span>
                          <span className="font-bold">
                            ${editedServices.reduce((sum, id) => {
                              const svc = availableServices.find(s => s.id === id);
                              return sum + parseFloat(svc?.price || 0);
                            }, 0).toLocaleString('es-CO')}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelEditServices}
                          disabled={savingServices}
                          className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveServices}
                          disabled={savingServices || editedServices.length === 0}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {savingServices ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="w-5 h-5" />
                              Guardar Cambios
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Vista normal de servicios
                    <>
                      {hasMultipleServices ? (
                        <div className="space-y-3">
                          {services.map((svc, index) => (
                            <div key={svc.id || index} className="border-l-2 border-blue-400 pl-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-gray-900 font-medium">{svc.name}</p>
                                  {svc.appointmentService?.duration && (
                                    <p className="text-gray-600 text-sm mt-1">
                                      Duración: {svc.appointmentService.duration} min
                                    </p>
                                  )}
                                </div>
                                {svc.appointmentService?.price && (
                                  <p className="text-gray-900 font-semibold ml-2">
                                    ${parseFloat(svc.appointmentService.price).toLocaleString('es-CO')}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                          <div className="border-t pt-2 mt-2">
                            <p className="text-gray-600 text-sm">
                              Duración total: {services.reduce((sum, s) => sum + (s.appointmentService?.duration || 0), 0)} min
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-900">{serviceName}</p>
                          {service?.duration && (
                            <p className="text-gray-600 text-sm mt-1">
                              Duración: {service.duration} min
                            </p>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Monto */}
                {appointmentDetails.totalAmount && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">Monto</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${appointmentDetails.totalAmount.toLocaleString('es-CO')}
                    </p>
                    {appointmentDetails.specialistCommission && (
                      <p className="text-green-600 text-sm mt-1">
                        Tu comisión: ${appointmentDetails.specialistCommission.toLocaleString('es-CO')}
                      </p>
                    )}
                  </div>
                )}

                {/* Sucursal */}
                {appointmentDetails.Branch && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-900">Sucursal</span>
                    </div>
                    <p className="text-gray-900">{appointmentDetails.Branch.name}</p>
                    {appointmentDetails.Branch.address && (
                      <p className="text-gray-600 text-sm">{appointmentDetails.Branch.address}</p>
                    )}
                  </div>
                )}

                {/* Notas */}
                {appointmentDetails.notes && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Notas:</p>
                    <p className="text-yellow-700">{appointmentDetails.notes}</p>
                  </div>
                )}

                {/* Formulario de Cancelación */}
                {showCancelForm && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-red-800 mb-2">
                      Motivo de cancelación
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Escribe el motivo..."
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer - Acciones según el tab activo */}
          {activeTab === 'sales' ? (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {selectedProducts.length > 0 ? (
                    <>
                      <span className="font-semibold">{selectedProducts.length}</span> producto(s) • Total: <span className="font-bold text-gray-900">${selectedProducts.reduce((sum, item) => sum + item.total, 0).toLocaleString('es-CO')}</span>
                    </>
                  ) : (
                    'No hay productos agregados'
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab('details')}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveSale}
                    disabled={savingSale || selectedProducts.length === 0}
                    className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {savingSale ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <ShoppingCartIcon className="w-5 h-5" />
                        Registrar Venta
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'details' && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between gap-3">
              {/* Lado izquierdo - Botones opcionales según estado */}
              <div className="flex items-center gap-2">
                {['CONFIRMED', 'IN_PROGRESS'].includes(appointmentDetails.status) && (
                  <button
                    onClick={handleUploadBeforePhoto}
                    className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    📷 Subir foto antes
                  </button>
                )}
                {['IN_PROGRESS', 'COMPLETED'].includes(appointmentDetails.status) && (
                  <button
                    onClick={handleUploadAfterPhoto}
                    className="px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    📷 Subir foto después
                  </button>
                )}
              </div>

              {/* Lado derecho - Acciones principales */}
              <div className="flex items-center gap-3">
                {/* Botón Cancelar (siempre visible excepto si ya está cancelado o completado) */}
                {!['CANCELED', 'COMPLETED'].includes(appointmentDetails.status) && (
                  <>
                    {showCancelForm ? (
                      <>
                        <button
                          onClick={() => {
                            setShowCancelForm(false);
                            setCancelReason('');
                          }}
                          className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Volver
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={actionLoading === 'cancel'}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {actionLoading === 'cancel' ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-5 h-5" />
                              Confirmar Cancelación
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setShowCancelForm(true)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <XCircleIcon className="w-5 h-5" />
                        Cancelar Turno
                      </button>
                    )}
                  </>
                )}

                {/* Acciones según estado */}
                {!showCancelForm && (
                  <>
                    {appointmentDetails.status === 'PENDING' && (
                      <button
                        onClick={handleConfirm}
                        disabled={actionLoading === 'confirm'}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === 'confirm' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Confirmando...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-5 h-5" />
                            Confirmar
                          </>
                        )}
                      </button>
                    )}

                    {appointmentDetails.status === 'CONFIRMED' && (
                      <button
                        onClick={handleStart}
                        disabled={actionLoading === 'start'}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === 'start' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Iniciando...
                          </>
                        ) : (
                          <>
                            <PlayCircleIcon className="w-5 h-5" />
                            Iniciar
                          </>
                        )}
                      </button>
                    )}

                    {appointmentDetails.status === 'IN_PROGRESS' && (
                      <button
                        onClick={handleComplete}
                        disabled={actionLoading === 'complete'}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {actionLoading === 'complete' ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Completando...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-5 h-5" />
                            Completar
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Modal de Flujo de Trabajo */}
      {showWorkflowModal && (
        <AppointmentWorkflowModal
          isOpen={showWorkflowModal}
          appointment={appointmentDetails}
          action={workflowAction}
          onClose={() => {
            setShowWorkflowModal(false);
            setWorkflowAction(null);
          }}
          onSuccess={handleWorkflowSuccess}
        />
      )}
    </div>
  );
}
