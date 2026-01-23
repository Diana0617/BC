import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  PhoneIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { businessSpecialistsApi, businessBranchesApi, specialistServicesApi, businessServicesApi } from '@shared/api';
import { usePermissions } from '@shared/hooks';
import UpgradePlanModal from '../../../../components/common/UpgradePlanModal';
import StaffKanbanBoard from '../../../../components/staff/StaffKanbanBoard.jsx';
import PhoneInput from '../../../../components/PhoneInput';
import ScheduleEditor from '../../../../components/schedule/ScheduleEditor';

const StaffManagementSection = ({ isSetupMode, onComplete, isCompleted }) => {
  // Corrección: el estado en businessSlice se llama currentBusiness, not activeBusiness
  const activeBusiness = useSelector(state => state.business.currentBusiness);
  const isLoadingBusiness = useSelector(state => state.business.isLoading);
  
  // Leer reglas de negocio para sistema de comisiones
  const businessRules = useSelector(state => state.businessRule?.assignedRules || []);
  const commissionRule = businessRules.find(r => r.key === 'COMISIONES_HABILITADAS');
  const commissionTypeRule = businessRules.find(r => r.key === 'COMISIONES_TIPO_CALCULO');
  const defaultCommissionRule = businessRules.find(r => r.key === 'COMISIONES_PORCENTAJE_GENERAL');
  
  // Determinar si el negocio usa comisiones (por defecto true si no hay regla)
  const useCommissionSystem = commissionRule?.customValue ?? commissionRule?.effective_value ?? commissionRule?.defaultValue ?? commissionRule?.template?.defaultValue ?? true;
  const commissionCalculationType = commissionTypeRule?.customValue ?? commissionTypeRule?.effective_value ?? commissionTypeRule?.defaultValue ?? commissionTypeRule?.template?.defaultValue ?? 'POR_SERVICIO';
  const defaultCommissionRate = defaultCommissionRule?.customValue ?? defaultCommissionRule?.effective_value ?? defaultCommissionRule?.defaultValue ?? defaultCommissionRule?.template?.defaultValue ?? 50;
  
  const { isBusinessSpecialist } = usePermissions();
  
  // Obtener la suscripción activa o la primera disponible
  const currentSubscription = activeBusiness?.subscriptions?.find(sub => 
    sub.status === 'ACTIVE' || sub.status === 'TRIAL'
  ) || activeBusiness?.subscriptions?.[0] || activeBusiness?.subscription;

  // Determinar si el usuario tiene restricciones (por rol o por plan gratuito)
  const planPrice = currentSubscription?.plan?.price;
  const isFreePlan = planPrice === 0 || planPrice === '0.00' || parseFloat(planPrice) === 0;
  const isRestricted = isBusinessSpecialist || isFreePlan;

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [specialists, setSpecialists] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isAddingSpecialist, setIsAddingSpecialist] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPasswordField, setShowPasswordField] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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
    },
    { 
      value: 'RECEPTIONIST', 
      label: 'Recepcionista', 
      description: 'Solo gestiona citas y clientes, no realiza servicios',
      icon: UserIcon
    }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    if (activeBusiness?.id) {
      loadSpecialists();
      loadBranches();
      loadAvailableServices();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBusiness?.id]);

  const loadSpecialists = async () => {
    try {
      setLoading(true);
      const response = await businessSpecialistsApi.getSpecialists(activeBusiness.id);
      console.log('Especialistas cargados:', response);
      const specialistsList = response.data || response || [];
      console.log('Lista de especialistas:', specialistsList);
      setSpecialists(specialistsList);
    } catch (err) {
      console.error('Error al cargar especialistas:', err);
      setError('Error al cargar equipo de trabajo');
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

      // Preparar profileData con información de sucursales
      let profileData = {
        isActive: formData.isActive
      };

      // Incluir branchId (sucursal principal) - si no hay, el backend creará una automáticamente
      if (formData.branchId) {
        profileData.branchId = formData.branchId;
      }

      // Incluir additionalBranches (sucursales adicionales)
      if (formData.additionalBranches && formData.additionalBranches.length > 0) {
        profileData.additionalBranches = formData.additionalBranches;
      }
      
      console.log('🔍 Datos de sucursales a enviar:', {
        branchId: profileData.branchId,
        additionalBranches: profileData.additionalBranches,
        totalBranches: (profileData.branchId ? 1 : 0) + (profileData.additionalBranches?.length || 0)
      });

      // Si NO es RECEPTIONIST puro, incluir datos profesionales
      if (formData.role !== 'RECEPTIONIST') {
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

        profileData = {
          ...profileData,
          specialization: formData.specialization,
          experience: formData.experience ? parseInt(formData.experience) : null,
          certifications: certifications,
          biography: formData.biography
        };

        // Solo incluir commissionRate si el negocio usa sistema de comisiones
        if (useCommissionSystem) {
          profileData.commissionRate = formData.commissionRate ? parseFloat(formData.commissionRate) : defaultCommissionRate;
        }
      }

      if (editingSpecialist) {
        // Actualizar especialista existente
        const updateResult = await businessSpecialistsApi.updateSpecialistProfile(
          activeBusiness.id, 
          editingSpecialist.id, 
          { ...userData, ...profileData }
        );
        console.log('✅ Especialista actualizado:', updateResult);
      } else {
        // Crear nuevo especialista
        const createResult = await businessSpecialistsApi.createSpecialist(activeBusiness.id, {
          userData,
          profileData
        });
        console.log('✅ Especialista creado:', {
          userId: createResult.data?.user?.id,
          profileId: createResult.data?.profile?.id,
          role: createResult.data?.user?.role,
          branches: createResult.data?.branches
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
      console.error('Error creando especialista:', err);
      console.error('Error response:', err.response?.data);
      
      // Extraer el mensaje de error correctamente
      let errorMessage = 'Error al guardar especialista';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
      
      // Scroll al mensaje de error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // const handleEdit = (specialist) => {
  //   setEditingSpecialist(specialist);
  //   setFormData({
  //     firstName: specialist.firstName,
  //     lastName: specialist.lastName,
  //     email: specialist.email,
  //     phone: specialist.phone || '',
  //     password: '',
  //     role: specialist.role,
  //     specialization: specialist.specialization || '',
  //     experience: specialist.experience || '',
  //     certifications: Array.isArray(specialist.certifications) 
  //       ? specialist.certifications.join(', ') 
  //       : (specialist.certifications || ''),
  //     biography: specialist.biography || '',
  //     commissionRate: specialist.commissionRate || '',
  //     branchId: specialist.branchId || '',
  //     additionalBranches: specialist.additionalBranches || [],
  //     isActive: specialist.isActive
  //   });
  //   setShowPasswordField(false);
  //   setIsAddingSpecialist(true);
  //   setCurrentStep(1);
  //   setCurrentTab('info'); // Resetear a tab de info
    
  //   // Cargar servicios del especialista si tiene ID
  //   if (specialist.id) {
  //     loadSpecialistServices(specialist.id);
  //   }
  // };

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
    setShowPassword(false);
    setCurrentStep(1);
    setStep3Visited(false);
    setCurrentTab('info');
    setSpecialistServices([]); // Limpiar servicios
    setError(null);
    setSuccess(null);
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      let newStep = currentStep + 1;
      
      // Si es RECEPTIONIST y estamos en paso 2, saltar directo a paso 3 (confirmación)
      // ya que no necesita configurar servicios ni calendario
      if (formData.role === 'RECEPTIONIST' && currentStep === 2) {
        newStep = 3;
      }
      
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
    let newStep = currentStep - 1;
    
    // Si es RECEPTIONIST y estamos en paso 3, volver a paso 2
    if (formData.role === 'RECEPTIONIST' && currentStep === 3) {
      newStep = 2;
    }
    
    setCurrentStep(newStep);
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
          <PhoneInput
            value={formData.phone}
            onChange={(value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
            placeholder="+57 300 123 4567"
          />
        </div>
        
        {(showPasswordField || !editingSpecialist) && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña {editingSpecialist ? '' : '*'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={editingSpecialist ? 'Dejar en blanco para mantener la actual' : 'Mínimo 8 caracteres'}
                required={!editingSpecialist}
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
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

  const renderReceptionistConfirmation = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <UserIcon className="h-12 w-12 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 text-lg mb-2">
              Recepcionista - Datos Completos
            </h4>
            <p className="text-sm text-blue-800 mb-4">
              Los recepcionistas solo gestionan citas y clientes. No necesitan configuración de servicios ni calendario.
            </p>
            
            <div className="space-y-2 bg-white rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Nombre:</span>
                  <p className="text-gray-900">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{formData.email}</p>
                </div>
                {formData.phone && (
                  <div>
                    <span className="font-medium text-gray-700">Teléfono:</span>
                    <p className="text-gray-900">{formData.phone}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Rol:</span>
                  <p className="text-gray-900">Recepcionista</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-sm text-blue-700">
                ✓ Podrá acceder al sistema para gestionar citas<br />
                ✓ Podrá registrar clientes y consultar historial<br />
                ✓ No aparecerá en la lista de especialistas para servicios
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const renderStep3 = () => {
    // Si es RECEPTIONIST, mostrar confirmación en lugar de datos profesionales
    if (formData.role === 'RECEPTIONIST') {
      return renderReceptionistConfirmation();
    }

    // Para SPECIALIST y RECEPTIONIST_SPECIALIST, mostrar formulario completo
    return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Datos Profesionales (Opcional)</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        
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
        {useCommissionSystem && (
          <div className="md:col-span-2 space-y-3">
            {/* Información sobre el tipo de cálculo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 flex items-start">
                <span className="mr-2">💡</span>
                <span>
                  {commissionCalculationType === 'GENERAL' && (
                    <>
                      <strong>Comisión general:</strong> Tu negocio aplica el mismo porcentaje de comisión ({defaultCommissionRate}%) a todos los servicios. 
                      Puedes personalizar la comisión para este especialista aquí abajo.
                    </>
                  )}
                  {commissionCalculationType === 'POR_SERVICIO' && (
                    <>
                      <strong>Comisión por servicio:</strong> Cada servicio tiene su propio porcentaje de comisión configurado. 
                      Asigna los servicios a este especialista en la pestaña "Servicios" para definir sus comisiones.
                    </>
                  )}
                  {commissionCalculationType === 'MIXTO' && (
                    <>
                      <strong>Comisión mixta:</strong> Algunos servicios usan la comisión general ({defaultCommissionRate}%) y otros tienen comisión personalizada. 
                      Configura las comisiones específicas en la pestaña "Servicios".
                    </>
                  )}
                </span>
              </p>
            </div>
            
            {/* Campo para comisión general del especialista */}
            {(commissionCalculationType === 'GENERAL' || commissionCalculationType === 'MIXTO') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comisión General del Especialista (%)
                </label>
                <input
                  type="number"
                  name="commissionRate"
                  value={formData.commissionRate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={defaultCommissionRate.toString()}
                  min="0"
                  max="100"
                  step="5"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Porcentaje de comisión por servicio (0-100%). Dejar en blanco para usar {defaultCommissionRate}% por defecto.
                </p>
              </div>
            )}
            
            {/* Mensaje para comisión por servicio */}
            {commissionCalculationType === 'POR_SERVICIO' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Las comisiones se configuran individualmente por cada servicio asignado al especialista. 
                  Una vez guardes este especialista, ve a la pestaña "Servicios" para asignar servicios y definir sus comisiones.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Mensaje informativo si NO usa comisiones */}
        {!useCommissionSystem && (
          <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ℹ️ Tu negocio no usa sistema de comisiones. Los especialistas recibirán pago fijo según tu configuración.
            </p>
          </div>
        )}
      </div>
    </div>
    );
  };

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

  // Renderizar sección de Calendario
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

    // Obtener sucursales asignadas al especialista
    const specialistBranches = editingSpecialist?.branches || [];
    
    if (specialistBranches.length === 0) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <BuildingOfficeIcon className="h-12 w-12 text-blue-400 mx-auto mb-3" />
          <p className="text-blue-800 font-medium mb-2">
            Este especialista no tiene sucursales asignadas
          </p>
          <p className="text-blue-600 text-sm">
            Primero asigna sucursales en la pestaña de "Información Básica"
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            📅 Configuración de Horarios por Sucursal
          </h4>
          <p className="text-sm text-blue-700">
            Define los horarios de atención para cada sucursal asignada. Los horarios deben estar dentro del horario de operación del negocio.
          </p>
        </div>

        {specialistBranches.map(branch => (
          <SpecialistBranchScheduleEditor
            key={branch.id}
            branch={branch}
            specialistId={editingSpecialist.id}
            businessId={activeBusiness.id}
            businessHours={activeBusiness.businessHours}
            allBranches={specialistBranches}
          />
        ))}
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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Equipo</h2>
          {isCompleted && !isSetupMode && (
            <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
          )}
        </div>
        
        {!isAddingSpecialist && (
          <button
            onClick={() => {
              if (isRestricted) {
                setShowUpgradeModal(true);
              } else {
                setIsAddingSpecialist(true);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            title="Agregar miembro del equipo"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Agregar Miembro del Equipo
          </button>
        )}
      </div>

      {/* Error Message Global */}
      {error && !isAddingSpecialist && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 shadow-lg">
          <div className="flex items-start">
            <XCircleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-red-900 mb-1">Error</h4>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 shadow-lg">
          <div className="flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">Éxito</h4>
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario Multi-Step */}
      {isAddingSpecialist && (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="bg-gray-50 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSpecialist ? 'Editar miembro del equipo' : 'Nuevo miembro del equipo'}
            </h3>

            {/* Mensajes de error y éxito dentro del formulario */}
            {error && (
              <div className="mb-4 bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg shadow-md">
                <div className="flex items-start">
                  <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Error al guardar</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-50 border-2 border-green-300 text-green-700 px-4 py-3 rounded-lg flex items-center shadow-md">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                {success}
              </div>
            )}
            
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
                  {loading ? 'Guardando...' : editingSpecialist ? 'Actualizar Miembro del equipo' : 'Crear Miembro del equipo'}
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

      {/* Tablero Kanban - Vista de Equipo */}
      {specialists.length > 0 && !isAddingSpecialist && (
        <div className="mt-8">
          <StaffKanbanBoard
            specialists={specialists}
            businessId={activeBusiness?.id}
            onDelete={handleDelete}
            onToggleStatus={toggleStatus}
            onEdit={(staff) => {
              setEditingSpecialist(staff);
              setIsAddingSpecialist(true);
              
              // Pre-cargar datos del formulario
              setFormData({
                firstName: staff.firstName || '',
                lastName: staff.lastName || '',
                email: staff.email || '',
                phone: staff.phone || '',
                password: '',
                role: staff.role || 'SPECIALIST',
                specialization: staff.SpecialistProfile?.specialization || '',
                experience: staff.SpecialistProfile?.experience || '',
                certifications: staff.SpecialistProfile?.certifications?.join(', ') || '',
                biography: staff.SpecialistProfile?.biography || '',
                commissionRate: staff.SpecialistProfile?.commissionRate || '',
                branchId: staff.SpecialistProfile?.branchId || '',
                additionalBranches: staff.UserBranches?.filter(ub => !ub.isDefault).map(ub => ub.branchId) || [],
                isActive: staff.isActive !== undefined ? staff.isActive : true
              });
              
              // Cargar servicios del especialista si aplica
              if (staff.role !== 'RECEPTIONIST') {
                loadSpecialistServices(staff.id);
              }
              
              // Empezar en el paso 1
              setCurrentStep(1);
              setCurrentTab('info');
            }}
            loading={loading}
          />
        </div>
      )}

      {/* Estado vacío */}
      {specialists.length === 0 && !isAddingSpecialist && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay miembros en el equipo
          </h3>
          <p className="text-gray-500 mb-4">
            Agrega especialistas, recepcionistas o recepcionistas-especialistas para comenzar
          </p>
          <button
            onClick={() => setIsAddingSpecialist(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 inline mr-2" />
            Agregar Primer Miembro
          </button>
        </div>
      )}

      {/* Mensaje de ayuda */}
      {isSetupMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Paso 2 de la configuración:</strong> Agrega a tu equipo de trabajo. 
            Puedes crear especialistas (realizan servicios), recepcionistas (gestionan agenda) 
            o recepcionistas-especialistas (ambas funciones). Cada miembro podrá iniciar sesión 
            con su email y contraseña.
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
                Los miembros de tu equipo pueden trabajar en múltiples sucursales. 
                Al crearlos o editarlos, puedes asignarles sucursales adicionales.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Upgrade */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        featureName="Gestión de Equipo"
      />
    </div>
  );
};

// Componente para editar horarios de un especialista en una sucursal específica
const SpecialistBranchScheduleEditor = ({ branch, specialistId, businessId, businessHours, allBranches = [] }) => {
  const [schedules, setSchedules] = useState({});
  const [allBranchesSchedules, setAllBranchesSchedules] = useState([]); // Horarios de todas las sucursales
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const daysOfWeek = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  // Cargar horarios existentes del especialista en esta sucursal
  useEffect(() => {
    loadSchedules();
    loadAllBranchesSchedules();
  }, [specialistId, branch.id]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const response = await businessBranchesApi.getBranchSchedules(businessId, branch.id, {
        specialistId: specialistId
      });
      
      // Convertir array de horarios a nueva estructura con shifts
      const schedulesByDay = {};
      
      // Inicializar con estructura por defecto basada en horarios del negocio
      daysOfWeek.forEach(({ key }) => {
        const businessDay = businessHours?.[key];
        
        if (businessDay?.enabled && businessDay?.shifts?.length > 0) {
          // Si el negocio tiene horarios con shifts, usar esa estructura como base
          schedulesByDay[key] = {
            enabled: false, // Por defecto deshabilitado para el especialista
            shifts: []
          };
        } else if (businessDay && !businessDay.closed && businessDay.open) {
          // Backward compatibility: convertir estructura antigua
          schedulesByDay[key] = {
            enabled: false,
            shifts: [{
              start: businessDay.open,
              end: businessDay.close
            }]
          };
        } else {
          // Sin horarios del negocio, usar valores por defecto
          schedulesByDay[key] = {
            enabled: false,
            shifts: []
          };
        }
      });
      
      // Aplicar horarios guardados del especialista
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(schedule => {
          if (schedulesByDay[schedule.dayOfWeek]) {
            schedulesByDay[schedule.dayOfWeek] = {
              id: schedule.id,
              enabled: schedule.isActive,
              shifts: [{
                start: schedule.startTime.substring(0, 5),
                end: schedule.endTime.substring(0, 5)
              }]
            };
          }
        });
      }
      
      setSchedules(schedulesByDay);
    } catch (err) {
      console.error('Error cargando horarios:', err);
      // Inicializar con valores por defecto si hay error
      const defaultSchedules = {};
      daysOfWeek.forEach(({ key }) => {
        defaultSchedules[key] = {
          enabled: false,
          shifts: []
        };
      });
      setSchedules(defaultSchedules);
    } finally {
      setLoading(false);
    }
  };

  // Cargar horarios del especialista de TODAS las sucursales
  const loadAllBranchesSchedules = async () => {
    try {
      // Usar las sucursales pasadas como prop
      const schedulesByBranch = [];
      
      for (const branchData of allBranches) {
        try {
          const response = await businessBranchesApi.getBranchSchedules(businessId, branchData.id, {
            specialistId: specialistId
          });
          
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            schedulesByBranch.push({
              branchId: branchData.id,
              branchName: branchData.name || 'Sucursal',
              schedules: response.data.map(schedule => ({
                day: schedule.dayOfWeek,
                start: schedule.startTime.substring(0, 5),
                end: schedule.endTime.substring(0, 5),
                isActive: schedule.isActive
              }))
            });
          }
        } catch (branchErr) {
          console.warn(`No se pudieron cargar horarios de sucursal ${branchData.name}:`, branchErr);
        }
      }
      
      setAllBranchesSchedules(schedulesByBranch);
    } catch (err) {
      console.error('Error cargando horarios de todas las sucursales:', err);
      setAllBranchesSchedules([]);
    }
  };

  const handleScheduleChange = (newSchedule) => {
    setSchedules(newSchedule);
  };

  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const checkTimeOverlap = (start1, end1, start2, end2) => {
    const s1 = parseTime(start1);
    const e1 = parseTime(end1);
    const s2 = parseTime(start2);
    const e2 = parseTime(end2);
    
    // Hay overlap si un turno empieza antes de que termine el otro
    return s1 < e2 && s2 < e1;
  };

  const validateScheduleAgainstBusiness = () => {
    const errors = [];
    
    Object.entries(schedules).forEach(([day, schedule]) => {
      if (!schedule.enabled || !schedule.shifts?.length) return;
      
      const businessDay = businessHours?.[day];
      const dayLabel = daysOfWeek.find(d => d.key === day)?.label;
      
      // Validar si el negocio está abierto ese día
      if (!businessDay || businessDay.closed || (!businessDay.enabled && !businessDay.open)) {
        errors.push(`${dayLabel}: El negocio está cerrado este día`);
        return;
      }
      
      // Obtener límites del negocio
      let businessStart, businessEnd;
      
      if (businessDay.shifts && businessDay.shifts.length > 0) {
        // Nueva estructura: encontrar el rango completo del negocio
        businessStart = businessDay.shifts[0].start;
        businessEnd = businessDay.shifts[businessDay.shifts.length - 1].end;
      } else {
        // Estructura antigua
        businessStart = businessDay.open || '00:00';
        businessEnd = businessDay.close || '23:59';
      }
      
      const businessStartMin = parseTime(businessStart);
      const businessEndMin = parseTime(businessEnd);
      
      // Validar cada turno del especialista
      schedule.shifts.forEach((shift, idx) => {
        const shiftStart = parseTime(shift.start);
        const shiftEnd = parseTime(shift.end);
        
        if (shiftStart < businessStartMin) {
          errors.push(`${dayLabel} - Turno ${idx + 1}: Inicia antes del horario del negocio (${businessStart})`);
        }
        
        if (shiftEnd > businessEndMin) {
          errors.push(`${dayLabel} - Turno ${idx + 1}: Termina después del horario del negocio (${businessEnd})`);
        }
      });
    });
    
    return errors;
  };

  // Validar que no haya overlaps con otras sucursales
  const validateScheduleAgainstOtherBranches = () => {
    const errors = [];
    
    // Filtrar horarios de otras sucursales (no la actual)
    const otherBranches = allBranchesSchedules.filter(b => b.branchId !== branch.id);
    
    if (otherBranches.length === 0) {
      return errors; // No hay otras sucursales, no hay conflictos posibles
    }
    
    Object.entries(schedules).forEach(([day, schedule]) => {
      if (!schedule.enabled || !schedule.shifts?.length) return;
      
      const dayLabel = daysOfWeek.find(d => d.key === day)?.label;
      
      // eslint-disable-next-line no-unused-vars
      schedule.shifts.forEach((shift, shiftIdx) => {
        // Buscar conflictos en otras sucursales
        otherBranches.forEach(otherBranch => {
          const conflictingSchedule = otherBranch.schedules.find(s => 
            s.day === day && 
            s.isActive && 
            checkTimeOverlap(shift.start, shift.end, s.start, s.end)
          );
          
          if (conflictingSchedule) {
            errors.push(
              `${dayLabel} ${shift.start}-${shift.end}: Conflicto con ${otherBranch.branchName} ` +
              `(${conflictingSchedule.start}-${conflictingSchedule.end}). ` +
              `El especialista no puede estar en dos lugares al mismo tiempo.`
            );
          }
        });
      });
    });
    
    return errors;
  };

  const handleSaveSchedules = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Validar contra horarios del negocio
      const validationErrors = validateScheduleAgainstBusiness();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      // Validar contra horarios de otras sucursales
      const branchConflicts = validateScheduleAgainstOtherBranches();
      if (branchConflicts.length > 0) {
        throw new Error(branchConflicts.join('\n'));
      }

      // Para cada día con horarios configurados
      for (const [day, schedule] of Object.entries(schedules)) {
        if (!schedule.enabled || !schedule.shifts || schedule.shifts.length === 0) {
          // Si existe y se deshabilitó, eliminarlo
          if (schedule.id) {
            await businessBranchesApi.deleteSpecialistSchedule(
              businessId,
              branch.id,
              schedule.id
            );
          }
          continue;
        }

        // Por ahora solo soportamos el primer turno (backward compatibility)
        // TODO: En el futuro, el backend debería soportar múltiples turnos
        const mainShift = schedule.shifts[0];
        
        if (!mainShift.start || !mainShift.end) {
          throw new Error(`Falta configurar horarios para ${daysOfWeek.find(d => d.key === day)?.label}`);
        }

        const scheduleData = {
          specialistId: specialistId,
          dayOfWeek: day,
          startTime: mainShift.start,
          endTime: mainShift.end,
          isActive: true
        };

        if (schedule.id) {
          // Actualizar existente
          await businessBranchesApi.updateSpecialistSchedule(
            businessId,
            branch.id,
            schedule.id,
            scheduleData
          );
        } else {
          // Crear nuevo
          const response = await businessBranchesApi.createSpecialistSchedule(
            businessId,
            branch.id,
            scheduleData
          );
          // Actualizar con el ID creado
          setSchedules(prev => ({
            ...prev,
            [day]: { ...prev[day], id: response.data.id }
          }));
        }
      }

      setSuccess('✅ Horarios guardados correctamente');
      setIsEditing(false);
      
      // Recargar horarios de todas las sucursales para mantener validación actualizada
      await loadAllBranchesSchedules();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error guardando horarios:', err);
      setError(err.response?.data?.message || err.message || 'Error al guardar horarios');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    loadSchedules(); // Recargar horarios originales
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
          <h5 className="font-medium text-gray-900">{branch.name}</h5>
        </div>
        <p className="text-sm text-gray-500">Cargando horarios...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
          <h5 className="font-medium text-gray-900">{branch.name}</h5>
          {branch.code && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {branch.code}
            </span>
          )}
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <PencilIcon className="h-4 w-4" />
            Editar Horarios
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveSchedules}
              disabled={saving}
              className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  Guardar
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info del horario del negocio */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h6 className="text-sm font-semibold text-blue-900 mb-2">
              📋 Horario de Operación del Negocio
            </h6>
            <p className="text-xs text-blue-700 mb-3">
              El especialista debe configurar sus horarios dentro de estos límites. Los breaks del negocio se muestran como referencia.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {daysOfWeek.map(day => {
                const dayHours = businessHours?.[day.key];
                const hasShifts = dayHours?.shifts && dayHours.shifts.length > 0;
                const isClosed = dayHours?.closed || (!dayHours?.enabled && !dayHours?.open);
                
                return (
                  <div key={day.key} className="bg-white rounded px-2 py-1.5 text-xs">
                    <span className="font-semibold text-gray-900">{day.label}:</span>{' '}
                    {isClosed ? (
                      <span className="text-gray-400">Cerrado</span>
                    ) : hasShifts ? (
                      <div className="mt-1 space-y-1">
                        {dayHours.shifts.map((shift, idx) => (
                          <div key={idx} className="text-gray-700">
                            {shift.start} - {shift.end}
                            {shift.breakStart && shift.breakEnd && (
                              <span className="text-amber-600 block text-[10px]">
                                ☕ Break {shift.breakStart}-{shift.breakEnd}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-700">
                        {dayHours?.open || '09:00'} - {dayHours?.close || '18:00'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Nuevo ScheduleEditor para el especialista */}
      <ScheduleEditor
        initialSchedule={schedules}
        onChange={handleScheduleChange}
        readOnly={!isEditing}
        showTemplates={false}
        compactMode={true}
      />

      {/* Alerta de otras sucursales configuradas */}
      {allBranchesSchedules.filter(b => b.branchId !== branch.id).length > 0 && (
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <BuildingOfficeIcon className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-purple-800">
                <strong>💼 Otras sucursales configuradas:</strong>
              </p>
              <div className="mt-2 space-y-1">
                {allBranchesSchedules
                  .filter(b => b.branchId !== branch.id)
                  .map(otherBranch => (
                    <div key={otherBranch.branchId} className="text-xs text-purple-700">
                      <strong>{otherBranch.branchName}:</strong>
                      {otherBranch.schedules.filter(s => s.isActive).map((s, idx) => {
                        const dayLabel = daysOfWeek.find(d => d.key === s.day)?.label;
                        return (
                          <span key={idx} className="ml-1">
                            {idx > 0 && ', '}
                            {dayLabel} {s.start}-{s.end}
                          </span>
                        );
                      })}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nota adicional */}
      {isEditing && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="mb-2">
                <strong>⚠️ Validaciones automáticas:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Los horarios deben estar dentro del horario de operación del negocio</li>
                {allBranchesSchedules.filter(b => b.branchId !== branch.id).length > 0 && (
                  <li><strong>No puede haber horarios solapados entre sucursales</strong> (el especialista no puede estar en dos lugares a la vez)</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes */}
      {success && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="whitespace-pre-line">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementSection;
