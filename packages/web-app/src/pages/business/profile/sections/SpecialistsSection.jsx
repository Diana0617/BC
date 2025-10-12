import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  StarIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { businessSpecialistsApi, businessBranchesApi, specialistServicesApi, businessServicesApi } from '@shared/api';

const SpecialistsSection = ({ isSetupMode, onComplete, isCompleted }) => {
  const dispatch = useDispatch();
  // Corrección: el estado en businessSlice se llama currentBusiness, no activeBusiness
  const activeBusiness = useSelector(state => state.business.currentBusiness);
  const isLoadingBusiness = useSelector(state => state.business.isLoading);
  
  const [specialists, setSpecialists] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isAddingSpecialist, setIsAddingSpecialist] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // Para wizard multi-paso
  const [step3Visited, setStep3Visited] = useState(false); // Para evitar submit automático
  const [currentTab, setCurrentTab] = useState('info'); // 'info' | 'services' | 'calendar'
  
  // Estado para servicios del especialista
  const [specialistServices, setSpecialistServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  
  const [formData, setFormData] = useState({
    // Datos de usuario
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'SPECIALIST',
    
    // Datos de perfil
    specialization: '',
    yearsOfExperience: '',
    certifications: '',
    bio: '',
    hourlyRate: '',
    commissionPercentage: '',
    
    // Sucursal principal
    branchId: '',
    
    // Sucursales adicionales (multi-branch)
    additionalBranches: [],
    
    // Estado
    isActive: true
  });

  const roleOptions = [
    { 
      value: 'SPECIALIST', 
      label: 'Especialista', 
      description: 'Solo realiza servicios y procedimientos',
      icon: StarIcon
    },
    { 
      value: 'RECEPTIONIST_SPECIALIST', 
      label: 'Recepcionista-Especialista', 
      description: 'Puede gestionar citas y realizar servicios',
      icon: UsersIcon
    }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    if (activeBusiness?.id) {
      loadSpecialists();
      loadBranches();
      loadAvailableServices();
    }
  }, [activeBusiness?.id]);

  const loadSpecialists = async () => {
    try {
      setLoading(true);
      const response = await businessSpecialistsApi.getSpecialists(activeBusiness.id);
      setSpecialists(response.data || response || []);
    } catch (err) {
      setError('Error al cargar especialistas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await businessBranchesApi.getBranches(activeBusiness.id);
      setBranches(response.data || response || []);
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
      // Si no hay sucursales, usar un array vacío
      setBranches([]);
    }
  };

  // Cargar servicios disponibles del negocio
  const loadAvailableServices = async () => {
    if (!activeBusiness?.id) return;
    try {
      const response = await businessServicesApi.getServices(activeBusiness.id, { isActive: true });
      setAvailableServices(response.data || response || []);
    } catch (err) {
      console.error('Error al cargar servicios:', err);
      setAvailableServices([]);
    }
  };

  // Cargar servicios del especialista
  const loadSpecialistServices = async (specialistId) => {
    if (!specialistId || !activeBusiness?.id) return;
    
    try {
      setLoadingServices(true);
      const response = await specialistServicesApi.getSpecialistServices(activeBusiness.id, specialistId);
      setSpecialistServices(response.data || response || []);
    } catch (err) {
      console.error('Error al cargar servicios del especialista:', err);
      setSpecialistServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleKeyDown = (e) => {
    // Prevenir submit del formulario cuando se presiona Enter en un campo de texto
    if (e.key === 'Enter' && e.target.type !== 'textarea') {
      e.preventDefault();
      // Si estamos en un paso anterior al 3, avanzar al siguiente paso
      if (currentStep < 3 && validateStep(currentStep)) {
        nextStep();
      }
    }
  };

  const handleBranchToggle = (branchId) => {
    setFormData(prev => {
      const isSelected = prev.additionalBranches.includes(branchId);
      return {
        ...prev,
        additionalBranches: isSelected
          ? prev.additionalBranches.filter(id => id !== branchId)
          : [...prev.additionalBranches, branchId]
      };
    });
  };

  const validateStep = (step) => {
    switch (step) {
      case 1: // Datos básicos
        return !!(formData.firstName && formData.lastName && formData.email && 
               (!!editingSpecialist || formData.password));
      case 2: // Rol y sucursal
        return !!formData.role; // Solo requiere rol, la sucursal es opcional (se crea automáticamente si no existe)
      case 3: // Datos profesionales (opcional)
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Solo procesar el submit si estamos en el paso 3 Y hemos visitado el paso (delay de 300ms)
    if (currentStep !== 3 || !step3Visited) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);

      // Preparar datos para enviar al backend según la estructura esperada
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      };

      // Solo enviar password si es nuevo especialista
      if (!editingSpecialist && formData.password) {
        userData.password = formData.password;
      }

      // Convertir certificaciones de string a array si es necesario
      let certifications = [];
      if (formData.certifications) {
        if (typeof formData.certifications === 'string') {
          // Dividir por comas y limpiar espacios
          certifications = formData.certifications
            .split(',')
            .map(cert => cert.trim())
            .filter(cert => cert.length > 0);
        } else if (Array.isArray(formData.certifications)) {
          certifications = formData.certifications;
        }
      }

      const profileData = {
        specialization: formData.specialization,
        experience: formData.experience ? parseInt(formData.experience) : null,
        certifications: certifications,
        biography: formData.biography,
        isActive: formData.isActive
      };

      // Solo incluir commissionRate si el negocio usa sistema de comisiones
      if (activeBusiness?.useCommissionSystem) {
        profileData.commissionRate = formData.commissionRate ? parseFloat(formData.commissionRate) : null;
      }

      // Solo incluir branchId si hay uno seleccionado
      if (formData.branchId) {
        profileData.branchId = formData.branchId;
      }

      // Solo incluir additionalBranches si hay seleccionadas
      if (formData.additionalBranches && formData.additionalBranches.length > 0) {
        profileData.additionalBranches = formData.additionalBranches;
      }

      if (editingSpecialist) {
        // Actualizar especialista existente
        await businessSpecialistsApi.updateSpecialistProfile(
          activeBusiness.id, 
          editingSpecialist.id, 
          { ...userData, ...profileData }
        );
      } else {
        // Crear nuevo especialista
        await businessSpecialistsApi.createSpecialist(activeBusiness.id, {
          userData,
          profileData
        });
        
        // Si es el primer registro en modo setup, completar paso
        if (isSetupMode && specialists.length === 0 && onComplete) {
          onComplete();
        }
      }
      
      // Recargar lista
      await loadSpecialists();
      
      // Mostrar mensaje de éxito
      setSuccess(editingSpecialist ? '✅ Especialista actualizado correctamente' : '✅ Especialista creado correctamente');
      setLoading(false);
      
      // Cerrar formulario después de 1.5 segundos
      setTimeout(() => {
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al guardar especialista');
      console.error('Error completo:', err);
      setLoading(false);
    }
  };

  const handleEdit = (specialist) => {
    setEditingSpecialist(specialist);
    setFormData({
      firstName: specialist.firstName,
      lastName: specialist.lastName,
      email: specialist.email,
      phone: specialist.phone || '',
      password: '',
      role: specialist.role,
      specialization: specialist.specialization || '',
      experience: specialist.experience || '',
      certifications: Array.isArray(specialist.certifications) 
        ? specialist.certifications.join(', ') 
        : (specialist.certifications || ''),
      biography: specialist.biography || '',
      commissionRate: specialist.commissionRate || '',
      branchId: specialist.branchId || '',
      additionalBranches: specialist.additionalBranches || [],
      isActive: specialist.isActive
    });
    setShowPasswordField(false);
    setIsAddingSpecialist(true);
    setCurrentStep(1);
    setCurrentTab('info'); // Resetear a tab de info
    
    // Cargar servicios del especialista si tiene ID
    if (specialist.id) {
      loadSpecialistServices(specialist.id);
    }
  };

  const handleDelete = async (specialistId) => {
    if (!confirm('¿Estás seguro de eliminar este especialista? Esta acción no se puede deshacer.')) return;
    
    try {
      setLoading(true);
      await businessSpecialistsApi.deleteSpecialist(activeBusiness.id, specialistId);
      await loadSpecialists();
    } catch (err) {
      setError('Error al eliminar especialista');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (specialistId) => {
    try {
      const specialist = specialists.find(s => s.id === specialistId);
      await businessSpecialistsApi.toggleSpecialistStatus(
        activeBusiness.id, 
        specialistId, 
        !specialist.isActive
      );
      await loadSpecialists();
    } catch (err) {
      setError('Error al cambiar estado');
      console.error(err);
    }
  };

  // ================================
  // FUNCIONES DE SERVICIOS
  // ================================

  const handleAssignService = async () => {
    try {
      const serviceId = document.getElementById('newServiceId').value;
      const customPrice = document.getElementById('newServicePrice').value;
      const skillLevel = document.getElementById('newServiceSkillLevel').value;
      const commissionPercentage = document.getElementById('newServiceCommission').value;

      if (!serviceId) {
        setError('Debe seleccionar un servicio');
        return;
      }

      const serviceData = {
        serviceId,
        skillLevel
      };

      if (customPrice) {
        serviceData.customPrice = parseFloat(customPrice);
      }

      if (commissionPercentage) {
        serviceData.commissionPercentage = parseFloat(commissionPercentage);
      }

      await specialistServicesApi.assignServiceToSpecialist(activeBusiness.id, editingSpecialist.id, serviceData);
      
      // Recargar servicios
      await loadSpecialistServices(editingSpecialist.id);
      
      // Limpiar campos
      document.getElementById('newServiceId').value = '';
      document.getElementById('newServicePrice').value = '';
      document.getElementById('newServiceSkillLevel').value = 'INTERMEDIATE';
      document.getElementById('newServiceCommission').value = '';
      
      setSuccess('✅ Servicio asignado correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Error al asignar servicio');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveService = async (serviceId) => {
    if (!confirm('¿Quitar este servicio del especialista?')) return;

    try {
      await specialistServicesApi.removeServiceFromSpecialist(activeBusiness.id, editingSpecialist.id, serviceId);
      await loadSpecialistServices(editingSpecialist.id);
      setSuccess('✅ Servicio quitado correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Error al quitar servicio');
      setTimeout(() => setError(null), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: 'SPECIALIST',
      specialization: '',
      experience: '',
      certifications: '',
      biography: '',
      commissionRate: '',
      branchId: '',
      additionalBranches: [],
      isActive: true
    });
    setEditingSpecialist(null);
    setIsAddingSpecialist(false);
    setShowPasswordField(true);
    setCurrentStep(1);
    setStep3Visited(false);
    setCurrentTab('info');
    setSpecialistServices([]); // Limpiar servicios
    setError(null);
    setSuccess(null);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // Marcar que hemos visitado el paso 3, pero con un pequeño delay
      // para evitar submit automático
      if (newStep === 3) {
        setTimeout(() => {
          setStep3Visited(true);
        }, 300);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Datos Básicos</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Juan"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apellido *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Pérez"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="juan.perez@ejemplo.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+57 300 123 4567"
            />
          </div>
        </div>
        
        {(showPasswordField || !editingSpecialist) && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña {editingSpecialist ? '' : '*'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={editingSpecialist ? 'Dejar en blanco para mantener la actual' : 'Mínimo 8 caracteres'}
              required={!editingSpecialist}
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">
              {editingSpecialist 
                ? 'Solo completa si deseas cambiar la contraseña' 
                : 'El especialista usará este email y contraseña para iniciar sesión'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Rol y Ubicación</h4>
      
      {/* Selección de Rol */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Rol *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {roleOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: option.value }))}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.role === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-6 w-6 mt-0.5 ${
                    formData.role === option.value ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sucursal Principal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sucursal Principal {branches.length > 0 ? '(Opcional)' : ''}
        </label>
        <div className="relative">
          <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            name="branchId"
            value={formData.branchId}
            onChange={handleInputChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={branches.length === 0}
          >
            <option value="">
              {branches.length === 0 
                ? 'Se creará automáticamente con la ubicación del negocio' 
                : 'Selecciona una sucursal (se usará la ubicación del negocio por defecto)'}
            </option>
            {branches.filter(b => b.status === 'ACTIVE').map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name} {branch.isMainBranch ? '(Principal)' : ''}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {branches.length === 0 
            ? 'No te preocupes, se creará automáticamente una sucursal principal con los datos de tu negocio'
            : 'Si no seleccionas una sucursal, se usará la ubicación del negocio por defecto'}
        </p>
      </div>

      {/* Sucursales Adicionales (Multi-Branch) */}
      {branches.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sucursales Adicionales (Opcional)
          </label>
          <div className="space-y-2 border border-gray-200 rounded-lg p-4">
            {branches
              .filter(b => b.id !== formData.branchId && b.status === 'ACTIVE')
              .map(branch => (
                <label key={branch.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.additionalBranches.includes(branch.id)}
                    onChange={() => handleBranchToggle(branch.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{branch.name}</span>
                </label>
              ))}
            {branches.filter(b => b.id !== formData.branchId && b.status === 'ACTIVE').length === 0 && (
              <p className="text-sm text-gray-500 text-center py-2">
                No hay sucursales adicionales disponibles
              </p>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            El especialista podrá atender citas en estas sucursales también
          </p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Datos Profesionales (Opcional)</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especialización
          </label>
          <div className="relative">
            <AcademicCapIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Colorimetría, Corte Avanzado, Diseño de Uñas"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Años de Experiencia
          </label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="5"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certificaciones
          </label>
          <input
            type="text"
            name="certifications"
            value={formData.certifications}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: Certificado en..."
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Biografía
          </label>
          <textarea
            name="biography"
            value={formData.biography}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Breve descripción del especialista..."
          />
        </div>
        
        {/* Campo de Comisión - Solo si el negocio usa sistema de comisiones */}
        {activeBusiness?.useCommissionSystem && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comisión (%)
            </label>
            <input
              type="number"
              name="commissionRate"
              value={formData.commissionRate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="30"
              min="0"
              max="100"
              step="5"
            />
            <p className="mt-1 text-xs text-gray-500">
              Porcentaje de comisión por servicio (0-100%). Dejar en blanco para usar 50% por defecto.
            </p>
          </div>
        )}
        
        {/* Mensaje informativo si NO usa comisiones */}
        {!activeBusiness?.useCommissionSystem && (
          <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ℹ️ Tu negocio no usa sistema de comisiones. Los especialistas recibirán pago fijo según tu configuración.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar sección de Servicios
  const renderServicesTab = () => {
    if (!editingSpecialist?.id) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">
            Primero guarda los datos básicos del especialista para poder asignar servicios.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Servicios Asignados</h4>
          
          {loadingServices ? (
            <p className="text-gray-500 text-sm">Cargando servicios...</p>
          ) : specialistServices.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay servicios asignados aún.</p>
          ) : (
            <div className="space-y-2">
              {specialistServices.map(ss => (
                <div key={ss.id} className="bg-gray-50 rounded p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{ss.service?.name}</h5>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                      <span>
                        💰 {ss.customPrice !== null && ss.customPrice !== undefined 
                          ? `$${ss.customPrice.toLocaleString()} (personalizado)` 
                          : `$${ss.service?.price?.toLocaleString()} (precio base)`}
                      </span>
                      {ss.skillLevel && (
                        <span>📊 {ss.skillLevel}</span>
                      )}
                      {ss.commissionPercentage !== null && ss.commissionPercentage !== undefined && (
                        <span>💼 {ss.commissionPercentage}% comisión</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(ss.serviceId)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Asignar Nuevo Servicio</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servicio *
              </label>
              <select 
                id="newServiceId"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Seleccionar servicio...</option>
                {availableServices.filter(service => 
                  !specialistServices.some(ss => ss.serviceId === service.id)
                ).map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price?.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Personalizado
              </label>
              <input
                type="number"
                id="newServicePrice"
                placeholder="Dejar vacío para usar precio base"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de Habilidad
              </label>
              <select 
                id="newServiceSkillLevel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                defaultValue="INTERMEDIATE"
              >
                <option value="BEGINNER">Principiante</option>
                <option value="INTERMEDIATE">Intermedio</option>
                <option value="ADVANCED">Avanzado</option>
                <option value="EXPERT">Experto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comisión (%)
              </label>
              <input
                type="number"
                id="newServiceCommission"
                min="0"
                max="100"
                placeholder="Ej: 50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAssignService}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Asignar Servicio
          </button>
        </div>
      </div>
    );
  };

  // Renderizar sección de Calendario (placeholder)
  const renderCalendarTab = () => {
    if (!editingSpecialist?.id) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">
            Primero guarda los datos básicos del especialista para poder configurar su calendario.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Calendario Semanal</h4>
        <p className="text-gray-500 text-sm">
          🚧 Funcionalidad de calendario en desarrollo...
        </p>
        <p className="text-gray-400 text-xs mt-2">
          Próximamente podrás configurar horarios semanales, excepciones y disponibilidad.
        </p>
      </div>
    );
  };

  // Mostrar loading mientras se carga el negocio
  if (isLoadingBusiness) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <UsersIcon className="h-12 w-12 text-blue-400 mx-auto mb-3 animate-pulse" />
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Cargando información del negocio...
          </h3>
          <p className="text-sm text-blue-700">
            Un momento por favor
          </p>
        </div>
      </div>
    );
  }

  // Si no hay negocio activo después de cargar, mostrar mensaje de error
  if (!activeBusiness) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <UsersIcon className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-red-900 mb-2">
            No se pudo cargar la información del negocio
          </h3>
          <p className="text-sm text-red-700 mb-4">
            Por favor, recarga la página o inicia sesión nuevamente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Recargar Página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <UsersIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">Especialistas</h2>
          {isCompleted && !isSetupMode && (
            <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
          )}
        </div>
        
        {!isAddingSpecialist && (
          <button
            onClick={() => setIsAddingSpecialist(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            title="Agregar especialista"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Agregar Especialista
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Lista de especialistas */}
      {specialists.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialists.map((specialist) => (
            <div 
              key={specialist.id} 
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                !specialist.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {specialist.firstName} {specialist.lastName}
                    </h3>
                    {specialist.isActive ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {specialist.role === 'RECEPTIONIST_SPECIALIST' ? 'Recep.-Especialista' : 'Especialista'}
                  </p>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(specialist)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Editar"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(specialist.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Eliminar"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {specialist.specialization && (
                <div className="flex items-start gap-2 mb-2">
                  <StarIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">{specialist.specialization}</p>
                </div>
              )}
              
              <div className="space-y-1 text-sm">
                {specialist.email && (
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-gray-600 truncate">{specialist.email}</p>
                  </div>
                )}
                
                {specialist.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-gray-600">{specialist.phone}</p>
                  </div>
                )}

                {/* Mostrar sucursales asignadas */}
                {specialist.branches && specialist.branches.length > 0 && (
                  <div className="flex items-start gap-2">
                    <BuildingOfficeIcon className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      {specialist.branches.length === 1 ? (
                        <p className="text-gray-600 text-xs">
                          {specialist.branches[0].name}
                        </p>
                      ) : (
                        <div className="space-y-0.5">
                          {specialist.branches.map((branch) => (
                            <p key={branch.id} className="text-gray-600 text-xs">
                              {branch.name}
                              {branch.isDefault && <span className="ml-1 text-blue-600">(Principal)</span>}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {specialist.yearsOfExperience && (
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-gray-600 text-xs">
                      {specialist.yearsOfExperience} años de experiencia
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                {specialist.commissionPercentage ? (
                  <span className="text-xs text-gray-500">
                    Comisión: {specialist.commissionPercentage}%
                  </span>
                ) : specialist.hourlyRate ? (
                  <span className="text-xs text-gray-500">
                    Tarifa: ${parseFloat(specialist.hourlyRate).toLocaleString('es-CO')}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">
                    Sin comisión configurada
                  </span>
                )}
                <button
                  onClick={() => toggleStatus(specialist.id)}
                  className={`text-sm font-medium ${
                    specialist.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  {specialist.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario Multi-Step */}
      {isAddingSpecialist && (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="bg-gray-50 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSpecialist ? 'Editar Especialista' : 'Nuevo Especialista'}
            </h3>
            
            {/* Tabs - Solo mostrar si estamos editando un especialista existente */}
            {editingSpecialist?.id && (
              <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('info')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                      currentTab === 'info'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📋 Información
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('services')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                      currentTab === 'services'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    💼 Servicios
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('calendar')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                      currentTab === 'calendar'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    📅 Calendario
                  </button>
                </div>
              </div>
            )}
            
            {/* Progress Steps - Solo mostrar en tab de info */}
            {currentTab === 'info' && (
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step}
                      </div>
                      <span className={`ml-2 text-sm font-medium ${
                        currentStep >= step ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step === 1 ? 'Datos' : step === 2 ? 'Rol' : 'Profesional'}
                      </span>
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-1 mx-4 ${
                        currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Mensajes de error y éxito */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}

          {/* Tab Content */}
          {currentTab === 'info' && (
            <>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </>
          )}
          
          {currentTab === 'services' && renderServicesTab()}
          {currentTab === 'calendar' && renderCalendarTab()}
          
          {/* Navigation Buttons - Solo mostrar en tab de info */}
          {currentTab === 'info' && (
            <div className="flex gap-3 mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Anterior
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !validateStep(1) || !validateStep(2)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : editingSpecialist ? 'Actualizar Especialista' : 'Crear Especialista'}
                </button>
              )}
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
            </div>
          )}
          
          {/* Botón de cerrar para tabs que no son info */}
          {currentTab !== 'info' && (
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          )}
        </form>
      )}

      {/* Estado vacío */}
      {specialists.length === 0 && !isAddingSpecialist && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin especialistas registrados
          </h3>
          <p className="text-gray-500 mb-4">
            Agrega a tu equipo de trabajo para comenzar a programar citas
          </p>
          <button
            onClick={() => setIsAddingSpecialist(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 inline mr-2" />
            Agregar Primer Especialista
          </button>
        </div>
      )}

      {/* Mensaje de ayuda */}
      {isSetupMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Paso 2 de la configuración:</strong> Agrega a tu equipo de trabajo. 
            Los especialistas podrán iniciar sesión con su email y contraseña, y acceder 
            solo a sus citas y horarios.
          </p>
        </div>
      )}

      {/* Info sobre multi-branch */}
      {branches.length > 1 && !isAddingSpecialist && specialists.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <BuildingOfficeIcon className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900 mb-1">Multi-Sucursal Activo</h4>
              <p className="text-sm text-purple-800">
                Tus especialistas pueden trabajar en múltiples sucursales. 
                Al crearlos o editarlos, puedes asignarles sucursales adicionales.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialistsSection;
