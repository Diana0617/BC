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
    specialistId: preselectedSpecialistId,
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
      const specialist = specialists.find(s => s.id === preselectedSpecialistId);
      if (specialist) {
        setFormData(prev => ({
          ...prev,
          specialistId: specialist.id,
          specialistName: specialist.name
        }));
      }
    }
  }, [preselectedSpecialistId, specialists]);

  // Buscar cliente con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (clientSearch.length >= 3) {
        searchClients();
      } else {
        setClientResults([]);
        setShowClientResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [clientSearch]);

  // Verificar disponibilidad cuando cambian fecha/hora/servicio/especialista
  useEffect(() => {
    if (formData.date && formData.time && formData.serviceId && formData.specialistId) {
      checkAvailability();
    }
  }, [formData.date, formData.time, formData.serviceId, formData.specialistId]);

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

      // Cargar especialistas
      const specialistsResponse = await fetch(
        `${API_CONFIG.BASE_URL}/api/specialists?businessId=${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (specialistsResponse.ok) {
        const specialistsData = await specialistsResponse.json();
        setSpecialists(specialistsData.data || []);
      }

      // Cargar sucursales
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
        setBranches(branchesData.data || []);
        
        // Seleccionar primera sucursal por defecto
        if (branchesData.data && branchesData.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            branchId: branchesData.data[0].id,
            branchName: branchesData.data[0].name
          }));
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
   * Buscar clientes por nombre o teléfono
   */
  const searchClients = async () => {
    try {
      setSearchingClient(true);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/clients/search?q=${encodeURIComponent(clientSearch)}&businessId=${businessId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setClientResults(data.data || []);
        setShowClientResults(true);
      }
    } catch (error) {
      console.error('Error searching clients:', error);
    } finally {
      setSearchingClient(false);
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
    setFormData(prev => ({
      ...prev,
      specialistId: specialist.id,
      specialistName: specialist.name
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
   */
  const checkAvailability = async () => {
    try {
      setCheckingAvailability(true);
      
      const dateStr = formData.date.toISOString().split('T')[0];
      const timeStr = `${formData.time.getHours().toString().padStart(2, '0')}:${formData.time.getMinutes().toString().padStart(2, '0')}`;
      
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
      
      if (!data.available) {
        Alert.alert(
          'No Disponible',
          data.reason || 'El especialista no está disponible en este horario',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
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

    if (!formData.branchId) {
      Alert.alert('Error', 'Selecciona una sucursal');
      return false;
    }

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
        branchId: formData.branchId,
        startTime: appointmentDate.toISOString(),
        duration: formData.duration,
        notes: formData.notes,
        createdBy: user.id
      };

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creando turno');
      }

      const data = await response.json();
      
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
      console.error('Error creating appointment:', error);
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
      specialistId: preselectedSpecialistId,
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

              {/* SERVICIO */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Servicio</Text>
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
              </View>

              {/* ESPECIALISTA */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Especialista</Text>
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
              </View>

              {/* SUCURSAL */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sucursal</Text>
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
                    onPress={() => setShowTimeSelector(true)}
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
                  {timeSlots.map((timeStr, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.pickerItem}
                      onPress={() => selectTime(timeStr)}
                    >
                      <Text style={styles.pickerItemText}>{timeStr}</Text>
                    </TouchableOpacity>
                  ))}
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
                  {services.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={styles.pickerItem}
                      onPress={() => selectService(service)}
                    >
                      <Text style={styles.pickerItemText}>{service.name}</Text>
                      <Text style={styles.pickerItemSubtext}>
                        {service.duration} min • ${service.price}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
                  {specialists.map((specialist) => (
                    <TouchableOpacity
                      key={specialist.id}
                      style={styles.pickerItem}
                      onPress={() => selectSpecialist(specialist)}
                    >
                      <Text style={styles.pickerItemText}>{specialist.name}</Text>
                    </TouchableOpacity>
                  ))}
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
