# 📱 Plan de Implementación - Gestión de Turnos Móvil

## 📋 Resumen Ejecutivo

Implementar gestión completa de turnos en la app móvil para **Especialistas** y **Recepcionistas**, con verificación de permisos granulares y flujo completo de gestión de citas.

---

## 🎯 Objetivos

### Para Especialistas:
- ✅ Ver sus turnos asignados
- ✅ Crear turnos (si permisos lo permiten)
- ✅ Gestionar el turno: Confirmar → Completar → Cerrar
- ✅ Capturar consentimientos (si servicio lo requiere)
- ✅ Subir evidencia fotográfica (si reglas de negocio lo requieren)
- ✅ Procesar pagos (si permisos lo permiten)
- ✅ Ver comisiones generadas

### Para Recepcionistas:
- ✅ Ver todos los turnos del negocio
- ✅ Crear turnos para cualquier especialista
- ✅ Asignar/reasignar especialistas
- ✅ Gestionar cancelaciones
- ✅ Ver estado de pagos

---

## 🔐 Sistema de Permisos

### Permisos a Validar (desde Redux)

```javascript
// Permisos de citas
appointments.view          // Ver turnos
appointments.view_all      // Ver todos vs solo propios
appointments.create        // Crear turnos
appointments.edit          // Editar turnos
appointments.cancel        // Cancelar turnos
appointments.complete      // Completar turnos

// Permisos de clientes
clients.view               // Ver info del cliente
clients.create             // Crear clientes nuevos

// Permisos de pagos
payments.view              // Ver pagos
payments.create            // Registrar pagos
payments.edit              // Editar pagos

// Permisos de servicios
services.view              // Ver servicios disponibles

// Permisos de evidencia
evidence.upload            // Subir fotos de evidencia
consents.capture           // Capturar firma de consentimiento
```

### Reglas de Negocio a Validar

```javascript
// Desde useBusinessRules
{
  // Creación de turnos
  canSpecialistCreateAppointments: boolean,
  canReceptionistCreateAppointments: boolean,
  
  // Requisitos de cierre
  requiresConsentForCompletion: boolean,
  requiresEvidencePhotos: boolean,
  requiresFullPayment: boolean,
  minimumPaymentPercentage: number,
  
  // Cancelaciones
  enableCancellation: boolean,
  cancellationTimeLimit: number, // Horas de anticipación
  autoRefund: boolean,
  createVoucher: boolean,
  
  // Evidencia
  evidencePhotosRequired: boolean,
  maxEvidencePhotos: number,
  
  // Consentimientos
  requireConsentSignature: boolean,
  allowDigitalConsent: boolean
}
```

---

## 📁 Estructura de Archivos

### Nuevos Componentes a Crear

```
packages/business-control-mobile/src/
├── components/
│   ├── appointments/
│   │   ├── AppointmentCard.js              ✅ Tarjeta de turno (ya existe parcial)
│   │   ├── AppointmentCreateModal.js       🆕 Modal crear turno
│   │   ├── AppointmentDetailsModal.js      🆕 Modal detalles turno
│   │   ├── AppointmentStatusBadge.js       🆕 Badge de estado
│   │   └── AppointmentFilters.js           🆕 Filtros (fecha, estado, sucursal)
│   │
│   ├── permissions/
│   │   ├── PermissionGuard.js              🆕 Componente guardia de permisos
│   │   └── PermissionButton.js             🆕 Botón con validación de permisos
│   │
│   ├── consent/
│   │   ├── ConsentCaptureModal.js          ✅ (Ya existe)
│   │   └── ConsentPreview.js               🆕 Vista previa de consentimiento
│   │
│   ├── evidence/
│   │   ├── EvidenceUploader.js             ✅ (Ya existe)
│   │   ├── EvidenceGallery.js              🆕 Galería de evidencias
│   │   └── CameraCapture.js                🆕 Captura de fotos
│   │
│   └── payment/
│       ├── PaymentProcessor.js             ✅ (Ya existe)
│       ├── PaymentSummary.js               🆕 Resumen de pago
│       └── PaymentMethodSelector.js        🆕 Selector de método de pago
│
├── hooks/
│   ├── usePermissions.js                   🆕 Hook de permisos (mobile)
│   ├── useAppointments.js                  🆕 Hook de gestión de turnos
│   ├── useAppointmentValidation.js         ✅ (Ya existe)
│   ├── useBusinessRules.js                 ✅ (Ya existe)
│   └── useCommissionManager.js             ✅ (Ya existe)
│
└── screens/
    └── appointments/
        ├── AppointmentManagementScreen.js  🆕 Vista completa de gestión
        └── AppointmentClosureScreen.js     🆕 Pantalla de cierre de turno
```

---

## 🔧 Implementación por Fases

## **FASE 1: Infraestructura de Permisos** ⏱️ 2-3 horas

### 1.1. Hook de Permisos (Mobile)

**Archivo**: `packages/business-control-mobile/src/hooks/usePermissions.js`

```javascript
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Hook de permisos para React Native
 * Compatible con el sistema de permisos del backend
 */
export const usePermissions = () => {
  const user = useSelector(state => state.auth.user);
  const userPermissions = useSelector(state => state.permissions?.currentUserPermissions?.permissions || []);
  
  // Set de permisos activos (optimización O(1))
  const permissionsSet = useMemo(() => {
    return new Set(
      userPermissions
        .filter(p => p.isGranted)
        .map(p => p.key)
    );
  }, [userPermissions]);
  
  // Verificar permiso individual
  const hasPermission = (permissionKey) => {
    // OWNER y BUSINESS tienen todos los permisos
    if (['OWNER', 'BUSINESS'].includes(user?.role)) {
      return true;
    }
    
    return permissionsSet.has(permissionKey);
  };
  
  // Verificar cualquiera de varios permisos
  const hasAnyPermission = (permissionKeys) => {
    if (['OWNER', 'BUSINESS'].includes(user?.role)) {
      return true;
    }
    
    return permissionKeys.some(key => permissionsSet.has(key));
  };
  
  // Verificar todos los permisos
  const hasAllPermissions = (permissionKeys) => {
    if (['OWNER', 'BUSINESS'].includes(user?.role)) {
      return true;
    }
    
    return permissionKeys.every(key => permissionsSet.has(key));
  };
  
  return {
    user,
    userRole: user?.role,
    permissions: Array.from(permissionsSet),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Helpers rápidos
    isOwner: user?.role === 'OWNER',
    isBusiness: user?.role === 'BUSINESS',
    isSpecialist: user?.role === 'SPECIALIST',
    isReceptionist: user?.role === 'RECEPTIONIST',
    isReceptionistSpecialist: user?.role === 'RECEPTIONIST_SPECIALIST'
  };
};
```

### 1.2. PermissionGuard Component

**Archivo**: `packages/business-control-mobile/src/components/permissions/PermissionGuard.js`

```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePermissions } from '../../hooks/usePermissions';
import { Ionicons } from '@expo/vector-icons';

/**
 * Componente de protección por permisos
 * Renderiza children solo si tiene el permiso requerido
 */
export const PermissionGuard = ({ 
  permission,           // string | string[]
  requireAll = false,   // boolean - ¿requiere todos los permisos?
  children,             // ReactNode - contenido a proteger
  fallback = null,      // ReactNode - mostrar si no tiene permiso
  showMessage = false   // boolean - mostrar mensaje de "sin permisos"
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  // Determinar si tiene acceso
  let hasAccess = false;
  
  if (Array.isArray(permission)) {
    hasAccess = requireAll 
      ? hasAllPermissions(permission) 
      : hasAnyPermission(permission);
  } else {
    hasAccess = hasPermission(permission);
  }
  
  // Si tiene acceso, renderizar children
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // Si no tiene acceso y hay fallback, mostrarlo
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Si showMessage, mostrar mensaje de error
  if (showMessage) {
    return (
      <View style={styles.noPermissionContainer}>
        <Ionicons name="lock-closed" size={48} color="#ef4444" />
        <Text style={styles.noPermissionTitle}>Sin Permisos</Text>
        <Text style={styles.noPermissionText}>
          No tienes permiso para acceder a esta funcionalidad
        </Text>
      </View>
    );
  }
  
  // Por defecto, no renderizar nada
  return null;
};

const styles = StyleSheet.create({
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fef2f2'
  },
  noPermissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 16,
    marginBottom: 8
  },
  noPermissionText: {
    fontSize: 14,
    color: '#7f1d1d',
    textAlign: 'center'
  }
});
```

### 1.3. PermissionButton Component

**Archivo**: `packages/business-control-mobile/src/components/permissions/PermissionButton.js`

```javascript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { usePermissions } from '../../hooks/usePermissions';
import { Ionicons } from '@expo/vector-icons';

/**
 * Botón con validación de permisos
 * Se oculta o deshabilita si no tiene el permiso
 */
export const PermissionButton = ({
  permission,           // string | string[]
  requireAll = false,
  onPress,
  children,
  style,
  textStyle,
  disabled = false,
  showDisabled = false, // Mostrar deshabilitado en vez de ocultar
  icon,
  iconSize = 20,
  iconColor = '#fff',
  ...props
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  // Determinar si tiene acceso
  let hasAccess = false;
  
  if (Array.isArray(permission)) {
    hasAccess = requireAll 
      ? hasAllPermissions(permission) 
      : hasAnyPermission(permission);
  } else {
    hasAccess = hasPermission(permission);
  }
  
  // Si no tiene acceso y showDisabled es false, ocultar
  if (!hasAccess && !showDisabled) {
    return null;
  }
  
  // Si no tiene acceso, deshabilitar
  const isDisabled = disabled || !hasAccess;
  
  return (
    <TouchableOpacity
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        isDisabled && styles.buttonDisabled,
        style
      ]}
      {...props}
    >
      <View style={styles.content}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={iconSize} 
            color={isDisabled ? '#9ca3af' : iconColor} 
            style={styles.icon}
          />
        )}
        <Text style={[
          styles.text,
          isDisabled && styles.textDisabled,
          textStyle
        ]}>
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#e5e7eb',
    opacity: 0.6
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    marginRight: 8
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  textDisabled: {
    color: '#9ca3af'
  }
});
```

---

## **FASE 2: Hook de Gestión de Turnos** ⏱️ 3-4 horas

### 2.1. useAppointments Hook

**Archivo**: `packages/business-control-mobile/src/hooks/useAppointments.js`

```javascript
import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { usePermissions } from './usePermissions';
import { useBusinessRules } from './useBusinessRules';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://bc-16wt.onrender.com';

/**
 * Hook para gestión de turnos/citas
 */
export const useAppointments = () => {
  const { user } = useSelector(state => state.auth);
  const { hasPermission } = usePermissions();
  const { checkRule } = useBusinessRules(user?.businessId);
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Verificar si puede crear turnos
  const canCreate = useCallback(() => {
    // Verificar permiso
    if (!hasPermission('appointments.create')) {
      return { allowed: false, reason: 'Sin permiso para crear turnos' };
    }
    
    // Verificar regla de negocio
    const rule = checkRule('canSpecialistCreateAppointments');
    if (user.role === 'SPECIALIST' && !rule.enabled) {
      return { allowed: false, reason: 'Los especialistas no pueden crear turnos según las reglas del negocio' };
    }
    
    return { allowed: true };
  }, [hasPermission, checkRule, user]);
  
  // Cargar turnos
  const fetchAppointments = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('authToken');
      const endpoint = user.role === 'SPECIALIST' 
        ? '/api/specialists/me/appointments'
        : '/api/appointments';
      
      const params = {
        businessId: user.businessId,
        ...filters
      };
      
      const response = await axios.get(`${API_URL}${endpoint}`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAppointments(response.data.data || []);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error cargando turnos';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Refrescar turnos
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAppointments();
    } finally {
      setRefreshing(false);
    }
  }, [fetchAppointments]);
  
  // Crear turno
  const createAppointment = useCallback(async (appointmentData) => {
    const canCreateResult = canCreate();
    if (!canCreateResult.allowed) {
      throw new Error(canCreateResult.reason);
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${API_URL}/api/appointments`,
        {
          ...appointmentData,
          businessId: user.businessId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Agregar a la lista local
      setAppointments(prev => [response.data.data, ...prev]);
      
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error creando turno';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [canCreate, user]);
  
  // Actualizar estado del turno
  const updateAppointmentStatus = useCallback(async (appointmentId, newStatus) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await axios.patch(
        `${API_URL}/api/appointments/${appointmentId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar en la lista local
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      );
      
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error actualizando turno';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Cancelar turno
  const cancelAppointment = useCallback(async (appointmentId, reason) => {
    if (!hasPermission('appointments.cancel')) {
      throw new Error('Sin permiso para cancelar turnos');
    }
    
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      await axios.post(
        `${API_URL}/api/appointments/${appointmentId}/cancel`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar en la lista local
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'CANCELED', cancellationReason: reason }
            : apt
        )
      );
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error cancelando turno';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);
  
  return {
    appointments,
    loading,
    refreshing,
    error,
    fetchAppointments,
    refresh,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    canCreate
  };
};
```

---

## **FASE 3: Pantalla de Gestión de Turnos** ⏱️ 4-5 horas

### 3.1. Actualizar SpecialistDashboard con Permisos

**Archivo**: `packages/business-control-mobile/src/screens/dashboards/SpecialistDashboardNew.js`

**Cambios**:
1. Importar hooks de permisos
2. Validar `appointments.create` antes de mostrar botón "+"
3. Usar `PermissionButton` en lugar de `TouchableOpacity` normal
4. Cargar permisos al montar el componente

```javascript
// AGREGAR AL INICIO
import { usePermissions } from '../../hooks/usePermissions';
import { useAppointments } from '../../hooks/useAppointments';
import { PermissionButton } from '../../components/permissions/PermissionButton';
import { PermissionGuard } from '../../components/permissions/PermissionGuard';

// DENTRO DEL COMPONENTE
const { hasPermission, isSpecialist } = usePermissions();
const { 
  appointments, 
  loading, 
  refreshing, 
  fetchAppointments, 
  refresh, 
  canCreate 
} = useAppointments();

// Cargar permisos y turnos al montar
useEffect(() => {
  if (user?.id && user?.businessId) {
    // Cargar permisos del usuario
    dispatch(fetchUserPermissions({
      userId: user.id,
      businessId: user.businessId
    }));
    
    // Cargar turnos
    fetchAppointments();
  }
}, [user]);

// REEMPLAZAR EL BOTÓN DE CREAR
<PermissionButton
  permission="appointments.create"
  onPress={handleCreateAppointment}
  icon="add-circle-outline"
  style={styles.createButton}
>
  Crear Turno
</PermissionButton>
```

---

## **FASE 4: Modal de Creación de Turnos** ⏱️ 5-6 horas

### 4.1. AppointmentCreateModal

**Archivo**: `packages/business-control-mobile/src/components/appointments/AppointmentCreateModal.js`

```javascript
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useAppointments } from '../../hooks/useAppointments';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://bc-16wt.onrender.com';

export const AppointmentCreateModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useSelector(state => state.auth);
  const { createAppointment } = useAppointments();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    serviceId: null,
    specialistId: user?.role === 'SPECIALIST' ? user.id : null,
    branchId: null,
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    notes: ''
  });
  
  // Datos para selects
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [branches, setBranches] = useState([]);
  const [clients, setClients] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);
  
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      
      // Cargar servicios, especialistas, sucursales en paralelo
      const [servicesRes, specialistsRes, branchesRes] = await Promise.all([
        axios.get(`${API_URL}/api/services?businessId=${user.businessId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/business/${user.businessId}/staff`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/business/${user.businessId}/branches`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setServices(servicesRes.data.data || []);
      setSpecialists(specialistsRes.data.data?.filter(s => 
        ['SPECIALIST', 'RECEPTIONIST_SPECIALIST'].includes(s.role)
      ) || []);
      setBranches(branchesRes.data.data || []);
      
      // Si solo hay una sucursal, seleccionarla automáticamente
      if (branchesRes.data.data?.length === 1) {
        setFormData(prev => ({ ...prev, branchId: branchesRes.data.data[0].id }));
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };
  
  // Buscar cliente por teléfono/email
  const searchClient = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) return;
    
    try {
      setSearching(true);
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await axios.get(
        `${API_URL}/api/clients/search`,
        {
          params: { businessId: user.businessId, q: searchTerm },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Error buscando cliente:', error);
    } finally {
      setSearching(false);
    }
  };
  
  // Seleccionar cliente existente
  const selectClient = (client) => {
    setFormData(prev => ({
      ...prev,
      clientName: `${client.firstName} ${client.lastName}`,
      clientPhone: client.phone || '',
      clientEmail: client.email || ''
    }));
    setClients([]);
  };
  
  // Calcular hora de fin basado en duración del servicio
  const calculateEndTime = (startTime, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return startTime;
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const duration = service.duration || 60;
    const endMinutes = minutes + duration;
    const endHours = hours + Math.floor(endMinutes / 60);
    const finalMinutes = endMinutes % 60;
    
    return `${String(endHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
  };
  
  // Manejar submit
  const handleSubmit = async () => {
    // Validaciones
    if (!formData.clientName) {
      Alert.alert('Error', 'Ingresa el nombre del cliente');
      return;
    }
    
    if (!formData.serviceId) {
      Alert.alert('Error', 'Selecciona un servicio');
      return;
    }
    
    if (!formData.specialistId) {
      Alert.alert('Error', 'Selecciona un especialista');
      return;
    }
    
    try {
      setLoading(true);
      
      const endTime = calculateEndTime(formData.startTime, formData.serviceId);
      
      const appointmentData = {
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        specialistId: formData.specialistId,
        serviceId: formData.serviceId,
        branchId: formData.branchId,
        startTime: `${formData.date}T${formData.startTime}:00`,
        endTime: `${formData.date}T${endTime}:00`,
        notes: formData.notes
      };
      
      await createAppointment(appointmentData);
      
      Alert.alert('Éxito', 'Turno creado exitosamente');
      onSuccess?.();
      handleClose();
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear el turno');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    // Resetear formulario
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      serviceId: null,
      specialistId: user?.role === 'SPECIALIST' ? user.id : null,
      branchId: null,
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      notes: ''
    });
    setClients([]);
    onClose();
  };
  
  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Crear Turno</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          {/* Body */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Cliente */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cliente</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Nombre completo *"
                value={formData.clientName}
                onChangeText={text => setFormData(prev => ({ ...prev, clientName: text }))}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                keyboardType="phone-pad"
                value={formData.clientPhone}
                onChangeText={text => {
                  setFormData(prev => ({ ...prev, clientPhone: text }));
                  searchClient(text);
                }}
              />
              
              {searching && <ActivityIndicator size="small" color="#3b82f6" />}
              
              {/* Lista de clientes encontrados */}
              {clients.length > 0 && (
                <View style={styles.clientsList}>
                  {clients.map(client => (
                    <TouchableOpacity
                      key={client.id}
                      style={styles.clientItem}
                      onPress={() => selectClient(client)}
                    >
                      <Text style={styles.clientName}>
                        {client.firstName} {client.lastName}
                      </Text>
                      <Text style={styles.clientPhone}>{client.phone}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.clientEmail}
                onChangeText={text => setFormData(prev => ({ ...prev, clientEmail: text }))}
              />
            </View>
            
            {/* Servicio */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Servicio *</Text>
              {/* TODO: Implementar Picker o lista de servicios */}
            </View>
            
            {/* Especialista */}
            {user.role !== 'SPECIALIST' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Especialista *</Text>
                {/* TODO: Implementar Picker de especialistas */}
              </View>
            )}
            
            {/* Fecha y Hora */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fecha y Hora *</Text>
              {/* TODO: Implementar DatePicker y TimePicker */}
            </View>
            
            {/* Notas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notas</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notas adicionales..."
                multiline
                numberOfLines={3}
                value={formData.notes}
                onChangeText={text => setFormData(prev => ({ ...prev, notes: text }))}
              />
            </View>
          </ScrollView>
          
          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonPrimaryText}>Crear Turno</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ... estilos (similar a los modales existentes)
});
```

---

## **FASE 5: Flujo de Gestión del Turno** ⏱️ 6-8 horas

### 5.1. AppointmentDetailsModal

**Funcionalidades**:
- Ver detalles completos del turno
- Acciones según estado:
  - **PENDING** → Confirmar | Cancelar
  - **CONFIRMED** → Iniciar | Cancelar
  - **IN_PROGRESS** → Completar
  - **COMPLETED** → Ver resumen, capturar consentimiento, subir evidencia, procesar pago

### 5.2. Validaciones según Reglas de Negocio

```javascript
// Antes de completar un turno
const validateCompletion = () => {
  const errors = [];
  
  // Validar consentimiento
  if (requiresConsentForCompletion && !appointment.hasConsent) {
    errors.push('Requiere firma de consentimiento');
  }
  
  // Validar evidencia fotográfica
  if (requiresEvidencePhotos && (!appointment.evidencePhotos || appointment.evidencePhotos.length === 0)) {
    errors.push('Requiere subir fotos de evidencia');
  }
  
  // Validar pago
  if (requiresFullPayment && appointment.paidAmount < appointment.totalAmount) {
    errors.push('Requiere pago completo');
  } else if (minimumPaymentPercentage) {
    const minimumRequired = appointment.totalAmount * (minimumPaymentPercentage / 100);
    if (appointment.paidAmount < minimumRequired) {
      errors.push(`Requiere al menos ${minimumPaymentPercentage}% de pago`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

---

## **FASE 6: Integración de Componentes Existentes** ⏱️ 2-3 horas

### 6.1. ConsentCaptureModal
- Ya existe en `packages/business-control-mobile/src/components/ConsentCaptureModal.js`
- Integrar con el flujo de cierre de turno

### 6.2. EvidenceUploader
- Ya existe en `packages/business-control-mobile/src/components/EvidenceUploader.js`
- Integrar con el flujo de cierre de turno

### 6.3. PaymentProcessor
- Ya existe en `packages/business-control-mobile/src/components/PaymentProcessor.js`
- Integrar con el flujo de cierre de turno

---

## 📊 Resumen de Tiempo Estimado

| Fase | Descripción | Tiempo |
|------|-------------|--------|
| 1 | Infraestructura de Permisos | 2-3 horas |
| 2 | Hook de Gestión de Turnos | 3-4 horas |
| 3 | Actualizar Dashboard | 4-5 horas |
| 4 | Modal de Creación | 5-6 horas |
| 5 | Flujo de Gestión | 6-8 horas |
| 6 | Integración Componentes | 2-3 horas |
| **TOTAL** | | **22-29 horas** |

---

## ✅ Checklist de Implementación

### Fase 1: Permisos
- [ ] Hook `usePermissions`
- [ ] Componente `PermissionGuard`
- [ ] Componente `PermissionButton`
- [ ] Cargar permisos en Redux al login

### Fase 2: Turnos
- [ ] Hook `useAppointments`
- [ ] Verificación de reglas de negocio
- [ ] Integración con API backend

### Fase 3: Dashboard
- [ ] Integrar permisos en SpecialistDashboard
- [ ] Botón crear con validación de permisos
- [ ] Lista de turnos con permisos

### Fase 4: Crear Turno
- [ ] Modal `AppointmentCreateModal`
- [ ] Búsqueda de clientes
- [ ] Selección de servicios/especialistas
- [ ] Validación de disponibilidad

### Fase 5: Gestionar Turno
- [ ] Modal `AppointmentDetailsModal`
- [ ] Flujo de estados (Pending → Confirmed → In Progress → Completed)
- [ ] Validaciones de cierre
- [ ] Integrar consentimientos, evidencias, pagos

### Fase 6: Testing
- [ ] Probar con SPECIALIST (solo ver sus turnos)
- [ ] Probar con SPECIALIST_RECEPTIONIST (crear turnos)
- [ ] Probar con RECEPTIONIST (ver todos los turnos)
- [ ] Validar reglas de negocio
- [ ] Validar permisos granulares

---

## 🚀 Próximos Pasos Recomendados

1. **Empezar por Fase 1** (Permisos) - Es la base de todo
2. **Luego Fase 2** (Hook de turnos) - Lógica de negocio
3. **Después Fase 3 y 4** (UI básica)
4. **Finalmente Fase 5 y 6** (Flujo completo)

---

## 📝 Notas Importantes

- ✅ **Backend ya listo**: El endpoint `POST /api/appointments` ya existe y funciona
- ✅ **Validación de permisos backend**: Ya está implementada en `checkPermission` middleware
- ✅ **Componentes base**: Ya tienes ConsentCaptureModal, EvidenceUploader, PaymentProcessor
- ✅ **Hooks de reglas**: Ya tienes `useBusinessRules` funcionando
- 🆕 **Falta**: Hooks de permisos mobile, modal de creación, flujo completo de gestión

---

**¿Te parece bien este plan? ¿Quieres que empecemos con la Fase 1 (Permisos)?**
