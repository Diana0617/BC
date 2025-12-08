import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { useAuthToken } from '../../hooks/useAuth';
import { API_CONFIG } from '@shared/constants/api';

/**
 * Modal para crear nuevo turno/cita
 * Incluye búsqueda de cliente, selección de servicio, especialista, sucursal y fecha/hora
 */
const AppointmentCreateModal = ({ 
  visible, 
  onClose, 
  onAppointmentCreated,
  preselectedSpecialistId = null 
}) => {
  const token = useAuthToken();
  const { user } = useSelector(state => state.auth);
  const businessId = useSelector(state => state.auth.businessId);
  
  // Estados del formulario
  const [loading, setLoading] = useState(false);
  const [searchingClient, setSearchingClient] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState([]);
  const [showClientResults, setShowClientResults] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: null,
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    serviceId: null,
    serviceName: '',
    specialistId: null, // No preseleccionar aquí, se hace en useEffect
    specialistName: '',
    branchId: null,
    branchName: '',
    date: new Date(),
    time: new Date(),
    duration: 60,
    notes: ''
  });
  
  // Estados para listas
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [branches, setBranches] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loadingSpecialistServices, setLoadingSpecialistServices] = useState(false);
  
  // Estados de UI
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [showSpecialistPicker, setShowSpecialistPicker] = useState(false);
  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  // Validación de nuevo cliente
  const [isNewClient, setIsNewClient] = useState(false);
  
  // Opciones de fecha (próximos 30 días)
  const [dateOptions, setDateOptions] = useState([]);
  
  // Opciones de hora (cada 30 minutos de 8:00 a 20:00)
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  useEffect(() => {
    if (visible && businessId) {
      loadInitialData();
      generateDateOptions();
    }
  }, [visible, businessId]);
  
  /**
   * Generar opciones de fecha (próximos 30 días)
   */
  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      options.push({
        date: date,
        label: date.toLocaleDateString('es-AR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        })
      });
    }
    
    setDateOptions(options);
  };

  useEffect(() => {
    if (preselectedSpecialistId && specialists.length > 0) {
      console.log('🔍 [MOBILE] Looking for specialist with userId:', preselectedSpecialistId);
      console.log('🔍 [MOBILE] Available specialists:', specialists.map(s => ({ 
        id: s.id, 
        userId: s.userId, 
        name: `${s.firstName || ''} ${s.lastName || ''}`.trim() 
      })));
      
      // Buscar por userId (preselectedSpecialistId es el user.id del especialista logueado)
      const specialist = specialists.find(s => s.userId === preselectedSpecialistId);
      
      if (specialist) {
        const fullName = `${specialist.firstName || ''} ${specialist.lastName || ''}`.trim();
        console.log('✅ [MOBILE] Specialist found:', { id: specialist.id, userId: specialist.userId, name: fullName });
        setFormData(prev => ({
          ...prev,
          specialistId: specialist.id, // Este es el specialistProfile.id
          specialistName: fullName
        }));
      } else {
        console.log('⚠️ [MOBILE] Specialist not found for userId:', preselectedSpecialistId);
      }
    }
  }, [preselectedSpecialistId, specialists]);

  // Buscar cliente con debounce (mínimo 2 caracteres igual que en web)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (clientSearch.length >= 2) {
        console.log('⏱️ [MOBILE] Debounce trigger - calling searchClients after 500ms');
        searchClients();
      } else {
        console.log('⏱️ [MOBILE] Search too short or empty, clearing results');
        setClientResults([]);
        setShowClientResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [clientSearch]);

  // Cargar servicios del especialista cuando cambie (igual que en web)
  useEffect(() => {
    console.log('🔄 [MOBILE] useEffect triggered - specialistId:', formData.specialistId, 'businessId:', businessId, 'token:', token ? 'exists' : 'missing');
    
    if (formData.specialistId && businessId && token) {
      console.log('🔄 [MOBILE] Specialist changed, loading their services:', formData.specialistId);
      loadSpecialistServices(formData.specialistId);
    } else {
      console.log('🔄 [MOBILE] No specialist selected or missing data, clearing filtered services');
      setFilteredServices([]);
      // Limpiar servicio seleccionado si se deselecciona especialista
      if (formData.serviceId) {
        setFormData(prev => ({ ...prev, serviceId: null, serviceName: '' }));
      }
    }
  }, [formData.specialistId, businessId, token]);

  // Filtrar especialistas cuando cambie la sucursal (solo si hay múltiples sucursales)
  useEffect(() => {
    // Solo filtrar si hay múltiples sucursales, hay una seleccionada, y NO hay especialista preseleccionado
    if (branches.length > 1 && formData.branchId && specialists.length > 0 && !preselectedSpecialistId) {
      console.log('🏢 [MOBILE] Branch changed, filtering specialists for branch:', formData.branchId);
      // Filtrar especialistas que trabajan en esta sucursal
      const filteredByBranch = specialists.filter(s => 
        s.branches?.some(b => b.id === formData.branchId) || !s.branches || s.branches.length === 0
      );
      console.log('👥 [MOBILE] Specialists in this branch:', filteredByBranch.length);
      
      // Si el especialista actual no está en esta sucursal, limpiarlo
      if (formData.specialistId) {
        const currentSpecialistInBranch = filteredByBranch.find(s => s.id === formData.specialistId);
        if (!currentSpecialistInBranch) {
          console.log('⚠️ [MOBILE] Current specialist not in this branch, clearing');
          setFormData(prev => ({
            ...prev,
            specialistId: null,
            specialistName: '',
            serviceId: null,
            serviceName: ''
          }));
        }
      }
    }
  }, [formData.branchId, specialists, preselectedSpecialistId, branches.length]);

  // TEMPORAL: Deshabilitado - verificar disponibilidad cuando cambian fecha/hora/servicio/especialista
  // TODO: Habilitar cuando se configuren horarios del especialista
  // useEffect(() => {
  //   if (formData.date && formData.time && formData.serviceId && formData.specialistId) {
  //     checkAvailability();
  //   }
  // }, [formData.date, formData.time, formData.serviceId, formData.specialistId]);

  /**
   * Cargar datos iniciales (servicios, especialistas, sucursales)
   */
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar servicios
      const servicesResponse = await fetch(
        `${API_CONFIG.BASE_URL}/api/services?businessId=${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setServices(servicesData.data || []);
      }

      // Cargar especialistas (mismo endpoint que web)
      console.log('👨‍⚕️ [MOBILE] Loading specialists from:', `${API_CONFIG.BASE_URL}/api/business/${businessId}/config/specialists`);
      const specialistsResponse = await fetch(
        `${API_CONFIG.BASE_URL}/api/business/${businessId}/config/specialists?isActive=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (specialistsResponse.ok) {
        const specialistsData = await specialistsResponse.json();
        console.log('✅ [MOBILE] Specialists loaded:', specialistsData.data?.specialists?.length || 0);
        console.log('👤 [MOBILE] First specialist structure:', specialistsData.data?.specialists?.[0]);
        setSpecialists(specialistsData.data?.specialists || specialistsData.data || []);
      }

      // Cargar sucursales
      console.log('🏢 [MOBILE] Loading branches...');
      const branchesResponse = await fetch(
        `${API_CONFIG.BASE_URL}/api/branches?businessId=${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (branchesResponse.ok) {
        const branchesData = await branchesResponse.json();
        const branchesList = branchesData.data || [];
        console.log('✅ [MOBILE] Branches loaded:', branchesList.length);
        console.log('🏢 [MOBILE] Branches:', branchesList.map(b => ({ id: b.id, name: b.name })));
        setBranches(branchesList);
        
        // Seleccionar primera (y única) sucursal por defecto
        if (branchesList.length === 1) {
          console.log('🏢 [MOBILE] Single branch detected, auto-selecting:', branchesList[0].name);
          console.log('🏢 [MOBILE] Branch ID:', branchesList[0].id);
          setFormData(prev => {
            const updated = {
              ...prev,
              branchId: branchesList[0].id,
              branchName: branchesList[0].name
            };
            console.log('✅ [MOBILE] Branch auto-selected in formData:', updated.branchId);
            return updated;
          });
        } else if (branchesList.length > 1) {
          console.log('🏢 [MOBILE] Multiple branches detected:', branchesList.length);
        } else {
          console.log('⚠️ [MOBILE] No branches found');
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buscar clientes por nombre o teléfono (igual que en web)
   */
  const searchClients = async () => {
    console.log('🔍 [MOBILE] searchClients called with:', clientSearch);
    console.log('🏢 [MOBILE] businessId:', businessId);
    console.log('🔑 [MOBILE] token:', token ? 'exists' : 'missing');
    
    if (!clientSearch || clientSearch.trim().length < 2) {
      console.log('⚠️ [MOBILE] Search term too short');
      setClientResults([]);
      setShowClientResults(false);
      return;
    }

    if (!businessId) {
      console.error('❌ [MOBILE] No businessId available');
      return;
    }

    if (!token) {
      console.error('❌ [MOBILE] No token available');
      return;
    }

    try {
      setSearchingClient(true);
      
      console.log('📞 [MOBILE] Calling API:', `${API_CONFIG.BASE_URL}/api/business/${businessId}/clients/search?q=${clientSearch}`);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/business/${businessId}/clients/search?q=${encodeURIComponent(clientSearch)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📡 [MOBILE] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 [MOBILE] Results:', data.data?.length || 0, 'clients found');
        console.log('📋 [MOBILE] Data:', data.data);
        setClientResults(data.data || []);
        setShowClientResults(data.data && data.data.length > 0);
        console.log('✅ [MOBILE] Client results updated');
      } else {
        console.error('❌ [MOBILE] Response not OK:', response.status);
        setClientResults([]);
        setShowClientResults(false);
      }
    } catch (error) {
      console.error('❌ [MOBILE] Error searching clients:', error);
      setClientResults([]);
      setShowClientResults(false);
    } finally {
      setSearchingClient(false);
    }
  };

  /**
   * Cargar servicios de un especialista específico (igual que en web)
   */
  const loadSpecialistServices = async (specialistId) => {
    if (!specialistId || !businessId || !token) {
      console.log('⚠️ [MOBILE] Missing data for loadSpecialistServices');
      console.log('⚠️ [MOBILE] specialistId:', specialistId);
      console.log('⚠️ [MOBILE] businessId:', businessId);
      console.log('⚠️ [MOBILE] token:', token ? 'exists' : 'missing');
      setFilteredServices(services); // Fallback a todos los servicios
      return;
    }

    try {
      setLoadingSpecialistServices(true);
      console.log('🔧 [MOBILE] Loading services for specialist:', specialistId);
      console.log('🔧 [MOBILE] businessId:', businessId);
      
      const url = `${API_CONFIG.BASE_URL}/api/business/${businessId}/specialists/${specialistId}/services`;
      console.log('📞 [MOBILE] Full URL:', url);
      
      const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📡 [MOBILE] Response status:', response.status);
      console.log('📡 [MOBILE] Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('🔧 [MOBILE] Specialist services loaded:', data.data?.length || 0);
        console.log('🔧 [MOBILE] First service structure:', data.data?.[0]);
        
        // Filtrar solo servicios activos
        const activeServices = (data.data || []).filter(ss => ss.isActive);
        
        // Mapear a formato compatible (igual que web)
        const mappedServices = activeServices.map(ss => ({
          id: ss.serviceId,
          name: ss.service?.name || ss.serviceName || ss.name || 'Servicio sin nombre',
          duration: ss.service?.duration || ss.duration,
          price: ss.customPrice !== null && ss.customPrice !== undefined 
            ? ss.customPrice 
            : (ss.service?.price || ss.price)
        }));
        
        console.log('✅ [MOBILE] Mapped services:', mappedServices.length);
        setFilteredServices(mappedServices);
        
        // Si el servicio seleccionado no está en la lista, limpiarlo
        if (formData.serviceId && !mappedServices.find(s => s.id === formData.serviceId)) {
          console.log('⚠️ [MOBILE] Current service not in specialist services, clearing');
          setFormData(prev => ({ ...prev, serviceId: null, serviceName: '' }));
        }
      } else {
        console.error('❌ [MOBILE] Error loading specialist services:', response.status);
        
        // Intentar leer el body del error
        try {
          const errorText = await response.text();
          console.error('❌ [MOBILE] Error response body:', errorText);
        } catch (e) {
          console.error('❌ [MOBILE] Could not read error body');
        }
        
        setFilteredServices(services); // Fallback
      }
    } catch (error) {
      console.error('❌ [MOBILE] Error loading specialist services:', error);
      console.error('❌ [MOBILE] Error details:', error.message);
      setFilteredServices(services); // Fallback a todos los servicios
    } finally {
      setLoadingSpecialistServices(false);
    }
  };

  /**
   * Seleccionar cliente de los resultados
   */
  const selectClient = (client) => {
    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email || ''
    }));
    setClientSearch(client.name);
    setShowClientResults(false);
    setIsNewClient(false);
  };

  /**
   * Habilitar creación de nuevo cliente
   */
  const enableNewClient = () => {
    setFormData(prev => ({
      ...prev,
      clientId: null,
      clientName: clientSearch,
      clientPhone: '',
      clientEmail: ''
    }));
    setShowClientResults(false);
    setIsNewClient(true);
  };

  /**
   * Seleccionar servicio
   */
  const selectService = (service) => {
    setFormData(prev => ({
      ...prev,
      serviceId: service.id,
      serviceName: service.name,
      duration: service.duration || 60
    }));
    setShowServicePicker(false);
  };

  /**
   * Seleccionar especialista
   */
  const selectSpecialist = (specialist) => {
    const fullName = `${specialist.firstName || ''} ${specialist.lastName || ''}`.trim();
    setFormData(prev => ({
      ...prev,
      specialistId: specialist.id,
      specialistName: fullName
    }));
    setShowSpecialistPicker(false);
  };

  /**
   * Seleccionar sucursal
   */
  const selectBranch = (branch) => {
    setFormData(prev => ({
      ...prev,
      branchId: branch.id,
      branchName: branch.name
    }));
    setShowBranchPicker(false);
  };
  
  /**
   * Seleccionar fecha
   */
  const selectDate = (dateObj) => {
    setFormData(prev => ({
      ...prev,
      date: dateObj.date
    }));
    setShowDateSelector(false);
  };
  
  /**
   * Seleccionar hora
   */
  const selectTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const newTime = new Date();
    newTime.setHours(parseInt(hours));
    newTime.setMinutes(parseInt(minutes));
    
    setFormData(prev => ({
      ...prev,
      time: newTime
    }));
    setShowTimeSelector(false);
  };

  /**
   * Verificar disponibilidad del especialista
   * TEMPORAL: Solo registra en logs, no bloquea la creación
   */
  const checkAvailability = async () => {
    try {
      setCheckingAvailability(true);
      
      const dateStr = formData.date.toISOString().split('T')[0];
      const timeStr = `${formData.time.getHours().toString().padStart(2, '0')}:${formData.time.getMinutes().toString().padStart(2, '0')}`;
      
      console.log('🔍 [MOBILE] Checking availability:', {
        specialistId: formData.specialistId,
        date: dateStr,
        time: timeStr,
        duration: formData.duration
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/appointments/check-availability`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            specialistId: formData.specialistId,
            date: dateStr,
            time: timeStr,
            duration: formData.duration
          })
        }
      );
      
      const data = await response.json();
      console.log('📡 [MOBILE] Availability check response:', data);
      
      // TEMPORAL: Comentado para permitir crear citas sin validación de horarios
      // TODO: Descomentar cuando los especialistas tengan horarios configurados
      // if (!data.available) {
      //   Alert.alert(
      //     'No Disponible',
      //     data.reason || 'El especialista no está disponible en este horario',
      //     [{ text: 'OK' }]
      //   );
      // }
    } catch (error) {
      console.error('❌ [MOBILE] Error checking availability:', error);
      // TEMPORAL: No mostrar error al usuario, permitir continuar
    } finally {
      setCheckingAvailability(false);
    }
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    console.log('🔍 [MOBILE] Validating form...');
    console.log('📋 [MOBILE] formData:', {
      clientName: formData.clientName,
      clientId: formData.clientId,
      serviceId: formData.serviceId,
      specialistId: formData.specialistId,
      branchId: formData.branchId,
      branchesCount: branches.length
    });

    if (!formData.clientName.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del cliente');
      return false;
    }

    if (isNewClient && !formData.clientPhone.trim()) {
      Alert.alert('Error', 'Ingresa el teléfono del cliente');
      return false;
    }

    if (!formData.serviceId) {
      Alert.alert('Error', 'Selecciona un servicio');
      return false;
    }

    if (!formData.specialistId) {
      Alert.alert('Error', 'Selecciona un especialista');
      return false;
    }

    // Solo validar sucursal si hay múltiples sucursales
    if (branches.length > 1 && !formData.branchId) {
      console.log('❌ [MOBILE] Multiple branches but no branch selected');
      Alert.alert('Error', 'Selecciona una sucursal');
      return false;
    }

    console.log('✅ [MOBILE] Form validation passed');
    return true;
  };

  /**
   * Crear turno
   */
  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Combinar fecha y hora
      const appointmentDate = new Date(formData.date);
      appointmentDate.setHours(formData.time.getHours());
      appointmentDate.setMinutes(formData.time.getMinutes());

      const appointmentData = {
        businessId,
        clientId: formData.clientId,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        serviceId: formData.serviceId,
        specialistId: formData.specialistId,
        branchId: formData.branchId || (branches.length === 1 ? branches[0].id : null),
        startTime: appointmentDate.toISOString(),
        duration: formData.duration,
        notes: formData.notes,
        createdBy: user.id
      };

      console.log('📝 [MOBILE] Creating appointment with data:', appointmentData);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/appointments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointmentData)
        }
      );

      console.log('📡 [MOBILE] Create appointment response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [MOBILE] Create appointment error:', errorData);
        throw new Error(errorData.error || 'Error creando turno');
      }

      const data = await response.json();
      console.log('✅ [MOBILE] Appointment created successfully:', data);
      
      Alert.alert(
        'Éxito',
        'Turno creado correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onAppointmentCreated) {
                onAppointmentCreated(data.data);
              }
              handleClose();
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ [MOBILE] Error creating appointment:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el turno');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar modal y resetear estado
   */
  const handleClose = () => {
    setFormData({
      clientId: null,
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      serviceId: null,
      serviceName: '',
      specialistId: null, // No preseleccionar aquí, se hace en useEffect
      specialistName: '',
      branchId: null,
      branchName: '',
      date: new Date(),
      time: new Date(),
      duration: 60,
      notes: ''
    });
    setClientSearch('');
    setClientResults([]);
    setShowClientResults(false);
    setIsNewClient(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={['#3b82f6', '#2563eb']}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Nuevo Turno</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </LinearGradient>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* CLIENTE */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cliente</Text>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="search" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Buscar por nombre o teléfono..."
                    value={clientSearch}
                    onChangeText={setClientSearch}
                    autoCapitalize="words"
                  />
                  {searchingClient && (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  )}
                </View>

                {/* Resultados de búsqueda */}
                {showClientResults && clientResults.length > 0 && (
                  <View style={styles.resultsContainer}>
                    {clientResults.map((client) => (
                      <TouchableOpacity
                        key={client.id}
                        style={styles.resultItem}
                        onPress={() => selectClient(client)}
                      >
                        <Ionicons name="person" size={20} color="#3b82f6" />
                        <View style={styles.resultInfo}>
                          <Text style={styles.resultName}>{client.name}</Text>
                          <Text style={styles.resultPhone}>{client.phone}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Opción de crear nuevo cliente */}
                {showClientResults && clientResults.length === 0 && clientSearch.length >= 3 && (
                  <TouchableOpacity
                    style={styles.newClientButton}
                    onPress={enableNewClient}
                  >
                    <Ionicons name="add-circle" size={20} color="#10b981" />
                    <Text style={styles.newClientText}>Crear cliente nuevo: "{clientSearch}"</Text>
                  </TouchableOpacity>
                )}

                {/* Formulario de nuevo cliente */}
                {isNewClient && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Teléfono *"
                      value={formData.clientPhone}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, clientPhone: text }))}
                      keyboardType="phone-pad"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email (opcional)"
                      value={formData.clientEmail}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, clientEmail: text }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </>
                )}

                {/* Cliente seleccionado */}
                {formData.clientId && (
                  <View style={styles.selectedItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.selectedText}>{formData.clientName}</Text>
                  </View>
                )}
              </View>

              {/* SUCURSAL - Solo mostrar si hay múltiples sucursales */}
              {branches.length > 1 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Sucursal *</Text>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => setShowBranchPicker(true)}
                  >
                    <Ionicons name="business" size={20} color="#9ca3af" />
                    <Text style={[styles.pickerText, !formData.branchName && styles.pickerPlaceholder]}>
                      {formData.branchName || 'Seleccionar sucursal'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              )}

              {/* ESPECIALISTA - Solo bloquear si hay múltiples sucursales y no se ha seleccionado */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Especialista *</Text>
                {branches.length > 1 && !formData.branchId ? (
                  <View style={styles.disabledPicker}>
                    <Ionicons name="person" size={20} color="#d1d5db" />
                    <Text style={styles.disabledPickerText}>
                      Primero selecciona una sucursal
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => setShowSpecialistPicker(true)}
                  >
                    <Ionicons name="person" size={20} color="#9ca3af" />
                    <Text style={[styles.pickerText, !formData.specialistName && styles.pickerPlaceholder]}>
                      {formData.specialistName || 'Seleccionar especialista'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>

              {/* SERVICIO - Se filtra según el especialista seleccionado */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Servicio</Text>
                {!formData.specialistId ? (
                  <View style={styles.disabledPicker}>
                    <Ionicons name="cut" size={20} color="#d1d5db" />
                    <Text style={styles.disabledPickerText}>
                      Primero selecciona un especialista
                    </Text>
                  </View>
                ) : loadingSpecialistServices ? (
                  <View style={styles.loadingPicker}>
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text style={styles.loadingPickerText}>Cargando servicios...</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => setShowServicePicker(true)}
                  >
                    <Ionicons name="cut" size={20} color="#9ca3af" />
                    <Text style={[styles.pickerText, !formData.serviceName && styles.pickerPlaceholder]}>
                      {formData.serviceName || 'Seleccionar servicio'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>

              {/* FECHA Y HORA */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fecha y Hora</Text>
                
                <View style={styles.dateTimeRow}>
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowDateSelector(true)}
                  >
                    <Ionicons name="calendar" size={20} color="#3b82f6" />
                    <Text style={styles.dateTimeText}>
                      {formData.date.toLocaleDateString('es-AR')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => {
                      console.log('🕐 [MOBILE] Opening time selector, available slots:', timeSlots.length);
                      console.log('🕐 [MOBILE] Time slots:', timeSlots);
                      setShowTimeSelector(true);
                    }}
                  >
                    <Ionicons name="time" size={20} color="#3b82f6" />
                    <Text style={styles.dateTimeText}>
                      {formData.time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>

                {checkingAvailability && (
                  <View style={styles.availabilityCheck}>
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text style={styles.availabilityText}>Verificando disponibilidad...</Text>
                  </View>
                )}
              </View>

              {/* NOTAS */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notas (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Observaciones del turno..."
                  value={formData.notes}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Botones */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.createButton, loading && styles.createButtonDisabled]}
                  onPress={handleCreate}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#ffffff" />
                      <Text style={styles.createButtonText}>Crear Turno</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* Date Selector Modal */}
          <Modal
            visible={showDateSelector}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDateSelector(false)}
          >
            <View style={styles.pickerModal}>
              <View style={styles.pickerContent}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Seleccionar Fecha</Text>
                  <TouchableOpacity onPress={() => setShowDateSelector(false)}>
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {dateOptions.map((dateObj, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.pickerItem}
                      onPress={() => selectDate(dateObj)}
                    >
                      <Text style={styles.pickerItemText}>{dateObj.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Time Selector Modal */}
          <Modal
            visible={showTimeSelector}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowTimeSelector(false)}
          >
            <View style={styles.pickerModal}>
              <View style={styles.pickerContent}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Seleccionar Hora</Text>
                  <TouchableOpacity onPress={() => setShowTimeSelector(false)}>
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {timeSlots.length === 0 ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ color: '#6b7280', textAlign: 'center' }}>
                        No hay horarios disponibles
                      </Text>
                    </View>
                  ) : (
                    timeSlots.map((timeStr, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.pickerItem}
                        onPress={() => selectTime(timeStr)}
                      >
                        <Text style={styles.pickerItemText}>{timeStr}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Service Picker Modal */}
          <Modal
            visible={showServicePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowServicePicker(false)}
          >
            <View style={styles.pickerModal}>
              <View style={styles.pickerContent}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Seleccionar Servicio</Text>
                  <TouchableOpacity onPress={() => setShowServicePicker(false)}>
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {filteredServices.length === 0 ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ color: '#6b7280', textAlign: 'center' }}>
                        {formData.specialistId 
                          ? 'Este especialista no tiene servicios asignados' 
                          : 'Selecciona un especialista primero'}
                      </Text>
                    </View>
                  ) : (
                    filteredServices.map((service) => (
                      <TouchableOpacity
                        key={service.id}
                        style={styles.pickerItem}
                        onPress={() => selectService(service)}
                      >
                        <Text style={styles.pickerItemText}>{service.name}</Text>
                        <Text style={styles.pickerItemSubtext}>
                          {service.duration} min • ${service.price?.toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Specialist Picker Modal */}
          <Modal
            visible={showSpecialistPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowSpecialistPicker(false)}
          >
            <View style={styles.pickerModal}>
              <View style={styles.pickerContent}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Seleccionar Especialista</Text>
                  <TouchableOpacity onPress={() => setShowSpecialistPicker(false)}>
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {specialists
                    .filter(specialist => {
                      // Solo filtrar por sucursal si hay múltiples sucursales
                      if (branches.length <= 1) return true; // No filtrar si hay 0 o 1 sucursal
                      if (!formData.branchId) return true; // Mostrar todos si no hay sucursal seleccionada
                      if (!specialist.branches || specialist.branches.length === 0) return true; // Mostrar si no tiene sucursales asignadas
                      return specialist.branches.some(b => b.id === formData.branchId);
                    })
                    .map((specialist) => {
                      const fullName = `${specialist.firstName || ''} ${specialist.lastName || ''}`.trim();
                      return (
                        <TouchableOpacity
                          key={specialist.id}
                          style={styles.pickerItem}
                          onPress={() => selectSpecialist(specialist)}
                        >
                          <Text style={styles.pickerItemText}>{fullName}</Text>
                          {specialist.specialization && (
                            <Text style={styles.pickerItemSubtext}>{specialist.specialization}</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  }
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Branch Picker Modal */}
          <Modal
            visible={showBranchPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowBranchPicker(false)}
          >
            <View style={styles.pickerModal}>
              <View style={styles.pickerContent}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Seleccionar Sucursal</Text>
                  <TouchableOpacity onPress={() => setShowBranchPicker(false)}>
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <ScrollView>
                  {branches.map((branch) => (
                    <TouchableOpacity
                      key={branch.id}
                      style={styles.pickerItem}
                      onPress={() => selectBranch(branch)}
                    >
                      <Text style={styles.pickerItemText}>{branch.name}</Text>
                      <Text style={styles.pickerItemSubtext}>{branch.address}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  resultsContainer: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultInfo: {
    marginLeft: 12,
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  resultPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  newClientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    marginTop: 8,
  },
  newClientText: {
    fontSize: 14,
    color: '#10b981',
    marginLeft: 8,
    fontWeight: '500',
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    marginTop: 8,
  },
  selectedText: {
    fontSize: 16,
    color: '#10b981',
    marginLeft: 8,
    fontWeight: '500',
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
  },
  pickerPlaceholder: {
    color: '#9ca3af',
  },
  disabledPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    opacity: 0.6,
  },
  disabledPickerText: {
    flex: 1,
    fontSize: 16,
    color: '#9ca3af',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  loadingPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loadingPickerText: {
    flex: 1,
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
    fontWeight: '500',
  },
  availabilityCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  pickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  pickerItemSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default AppointmentCreateModal;
