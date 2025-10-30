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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useAppointments } from '../../hooks/useAppointments';
import { usePermissions } from '../../hooks/usePermissions';
import { 
  startAppointment as startAppointmentAction,
  completeAppointment as completeAppointmentAction 
} from '@shared/store/slices/specialistDashboardSlice';
import { getApiUrl } from '@shared/constants/api';
import { StorageHelper } from '@shared/utils/storage';
import { STORAGE_KEYS } from '@shared/constants/api';
import PaymentStep from './PaymentStep';
import EvidenceCaptureModal from './EvidenceCaptureModal';

/**
 * Modal de detalles y gestión de turno
 * Incluye todas las transiciones de estado y validaciones
 */
const AppointmentDetailsModal = ({ 
  visible, 
  appointment, 
  onClose, 
  onAppointmentUpdated 
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const {
    confirmAppointment,
    cancelAppointment,
    canComplete,
    canCancel,
    getAppointmentById
  } = useAppointments();
  
  const { hasPermission } = usePermissions();
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(appointment);
  
  // Estados para el flujo de pago
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentValid, setPaymentValid] = useState(false);
  
  // Estados para evidencia fotográfica
  const [showEvidenceCapture, setShowEvidenceCapture] = useState(false);
  const [evidenceData, setEvidenceData] = useState(null);

  // Recargar detalles cuando se abre el modal
  useEffect(() => {
    if (visible && appointment?.id) {
      console.log('📋 Modal abierto - Appointment:', {
        id: appointment.id,
        status: appointment.status,
        clientName: appointment.clientName
      });
      loadAppointmentDetails();
    }
  }, [visible, appointment?.id]);

  /**
   * Cargar detalles completos del turno
   */
  const loadAppointmentDetails = async () => {
    try {
      setLoading(true);
      const details = await getAppointmentById(appointment.id);
      console.log('📋 Detalles cargados:', {
        id: details.id,
        status: details.status,
        requiresConsent: details.requiresConsent,
        hasConsent: details.hasConsent
      });
      setAppointmentDetails(details);
    } catch (error) {
      console.error('Error loading appointment details:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener color según estado
   */
  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      CONFIRMED: '#3b82f6',
      IN_PROGRESS: '#8b5cf6',
      COMPLETED: '#10b981',
      CANCELED: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  /**
   * Obtener texto del estado
   */
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

  /**
   * Confirmar turno
   */
  const handleConfirm = async () => {
    if (!hasPermission('appointments.confirm')) {
      Alert.alert('Sin permiso', 'No tienes permiso para confirmar turnos');
      return;
    }

    const clientName = appointmentDetails.client 
      ? `${appointmentDetails.client.firstName} ${appointmentDetails.client.lastName}`
      : appointmentDetails.clientName || 'el cliente';

    Alert.alert(
      'Confirmar Turno',
      `¿Deseas confirmar el turno de ${clientName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setActionLoading('confirm');
              await confirmAppointment(appointmentDetails.id);
              
              // Actualizar estado local
              setAppointmentDetails(prev => ({ ...prev, status: 'CONFIRMED' }));
              
              Alert.alert('Éxito', 'Turno confirmado correctamente');
              
              if (onAppointmentUpdated) {
                onAppointmentUpdated({ ...appointmentDetails, status: 'CONFIRMED' });
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo confirmar el turno');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  /**
   * Iniciar procedimiento
   */
  const handleStart = async () => {
    if (!hasPermission('appointments.complete')) {
      Alert.alert('Sin permiso', 'No tienes permiso para iniciar turnos');
      return;
    }

    const clientName = appointmentDetails.client 
      ? `${appointmentDetails.client.firstName} ${appointmentDetails.client.lastName}`
      : appointmentDetails.clientName || 'el cliente';

    Alert.alert(
      'Iniciar Turno',
      `¿Deseas iniciar el procedimiento para ${clientName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar',
          onPress: async () => {
            try {
              setActionLoading('start');
              
              // Usar Redux action que tiene la ruta correcta
              await dispatch(startAppointmentAction(appointmentDetails.id)).unwrap();
              
              // Actualizar estado local
              setAppointmentDetails(prev => ({ ...prev, status: 'IN_PROGRESS' }));
              
              Alert.alert('Éxito', 'Procedimiento iniciado');
              
              if (onAppointmentUpdated) {
                onAppointmentUpdated({ ...appointmentDetails, status: 'IN_PROGRESS' });
              }
            } catch (error) {
              Alert.alert('Error', error.message || error || 'No se pudo iniciar el procedimiento');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  /**
   * Completar turno (con validaciones)
   */
  /**
   * Iniciar flujo de completar turno
   */
  const handleComplete = async () => {
    console.log('🔵 handleComplete - Iniciando...');
    console.log('🔵 Appointment details:', appointmentDetails);
    
    // Validar permiso
    if (!hasPermission('appointments.close_with_payment')) {
      console.log('❌ Sin permiso: appointments.close_with_payment');
      Alert.alert('Sin permiso', 'No tienes permiso para cerrar turnos y cobrar');
      return;
    }
    console.log('✅ Permiso validado: appointments.close_with_payment');

    // VALIDACIÓN OBLIGATORIA: Consentimiento
    if (appointmentDetails.service?.requiresConsent && !appointmentDetails.hasConsent) {
      console.log('❌ Falta consentimiento obligatorio');
      Alert.alert(
        'Consentimiento Requerido',
        `El servicio "${appointmentDetails.service.name}" requiere consentimiento firmado antes de completar el turno.`,
        [
          { text: 'Entendido', style: 'cancel' },
          { 
            text: 'Firmar Ahora', 
            onPress: () => {
              // TODO: Abrir modal de firma de consentimiento
              Alert.alert('Info', 'Funcionalidad de firma de consentimiento próximamente');
            }
          }
        ]
      );
      return;
    }

    // Validar con el hook
    const validation = canComplete(appointmentDetails);
    console.log('🔍 Validación canComplete:', validation);
    
    if (!validation.allowed) {
      console.log('❌ Validación falló:', validation.reason);
      Alert.alert(
        'No se puede completar',
        validation.reason,
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('✅ Todas las validaciones pasadas');
    
    // PREGUNTA OPCIONAL: ¿Capturar evidencia?
    Alert.alert(
      'Captura de Evidencia',
      '¿Deseas capturar fotos del resultado del procedimiento?',
      [
        { 
          text: 'No', 
          style: 'cancel',
          onPress: () => {
            console.log('📸 Usuario omitió captura de evidencia');
            setShowPaymentStep(true);
          }
        },
        { 
          text: 'Sí, capturar', 
          onPress: () => {
            console.log('📸 Usuario eligió capturar evidencia');
            setShowEvidenceCapture(true);
          }
        }
      ],
      { cancelable: false }
    );
  };
  
  /**
   * Guardar evidencia y continuar al pago
   */
  const handleEvidenceSaved = async (evidence) => {
    console.log('📸 Evidencia capturada:', evidence);
    setEvidenceData(evidence);
    setShowEvidenceCapture(false);
    setShowPaymentStep(true);
  };
  
  /**
   * Completar turno con pago procesado
   */
  const handleCompleteWithPayment = async () => {
    if (!paymentValid) {
      Alert.alert('Error', 'Completa los datos de pago antes de continuar');
      return;
    }

    const clientName = appointmentDetails.client 
      ? `${appointmentDetails.client.firstName} ${appointmentDetails.client.lastName}`
      : appointmentDetails.clientName || 'el cliente';

    Alert.alert(
      'Completar Turno',
      `¿Deseas completar el turno de ${clientName}?\n\nPago: $${paymentData?.amount} - ${paymentData?.method?.name}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          onPress: async () => {
            try {
              setActionLoading('complete');
              
              // 1. Si hay evidencia, subirla primero
              if (evidenceData) {
                console.log('📸 Subiendo evidencia...');
                const token = await StorageHelper.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
                const evidenceUrl = `${getApiUrl()}/api/appointments/${appointmentDetails.id}/evidence?businessId=${user.businessId}`;
                
                const evidenceResponse = await fetch(evidenceUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    evidence: evidenceData
                  })
                });

                if (!evidenceResponse.ok) {
                  console.warn('⚠️ No se pudo guardar la evidencia, pero continuaremos');
                }
              }
              
              // 2. Preparar datos de pago para el backend
              const paymentPayload = {
                methodId: paymentData.methodId,
                amount: paymentData.amount,
                notes: paymentData.notes,
                proofImageBase64: paymentData.proofImage
              };

              // 3. Llamar API para completar el turno
              const token = await StorageHelper.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
              const url = `${getApiUrl()}/api/appointments/${appointmentDetails.id}/complete?businessId=${user.businessId}`;
              
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  payment: paymentPayload
                })
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Error al completar turno');
              }

              const data = await response.json();
              
              // Actualizar estado local
              setAppointmentDetails(prev => ({ ...prev, status: 'COMPLETED' }));
              
              Alert.alert('Éxito', 'Turno completado y pago registrado correctamente');
              
              if (onAppointmentUpdated) {
                onAppointmentUpdated({ ...appointmentDetails, status: 'COMPLETED' });
              }
              
              // Cerrar modal después de completar
              setTimeout(() => {
                setShowPaymentStep(false);
                onClose();
              }, 1500);
            } catch (error) {
              console.error('Error completando turno:', error);
              Alert.alert('Error', error.message || 'No se pudo completar el turno');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };
  
  /**
   * Volver del paso de pago
   */
  const handleBackFromPayment = () => {
    setShowPaymentStep(false);
    setPaymentData(null);
    setPaymentValid(false);
  };

  /**
   * Mostrar formulario de cancelación
   */
  const showCancelDialog = () => {
    // Validar con el hook
    const validation = canCancel(appointmentDetails);
    if (!validation.allowed) {
      Alert.alert(
        'No se puede cancelar',
        validation.reason,
        [{ text: 'OK' }]
      );
      return;
    }

    setShowCancelForm(true);
  };

  /**
   * Cancelar turno
   */
  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      Alert.alert('Error', 'Debes indicar el motivo de cancelación');
      return;
    }

    try {
      setActionLoading('cancel');
      await cancelAppointment(appointmentDetails.id, cancelReason);
      
      // Actualizar estado local
      setAppointmentDetails(prev => ({ 
        ...prev, 
        status: 'CANCELED',
        cancellationReason: cancelReason
      }));
      
      Alert.alert('Éxito', 'Turno cancelado correctamente');
      
      if (onAppointmentUpdated) {
        onAppointmentUpdated({ 
          ...appointmentDetails, 
          status: 'CANCELED',
          cancellationReason: cancelReason
        });
      }
      
      setShowCancelForm(false);
      setCancelReason('');
      
      // Cerrar modal después de cancelar
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo cancelar el turno');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Formatear fecha y hora
   */
  const formatDateTime = (dateString) => {
    if (!dateString) {
      return { date: 'Fecha no disponible', time: 'Hora no disponible' };
    }
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return { date: dateStr, time: timeStr };
  };

  if (!appointmentDetails) {
    return null;
  }

  const { date, time } = formatDateTime(appointmentDetails.startTime);
  const statusColor = getStatusColor(appointmentDetails.status);
  const statusText = getStatusText(appointmentDetails.status);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={[statusColor, statusColor]}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>Detalles del Turno</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{statusText}</Text>
              </View>
            </View>
          </LinearGradient>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Cargando detalles...</Text>
            </View>
          ) : showPaymentStep ? (
            // Mostrar SOLO el paso de pago cuando está activo
            <View style={styles.paymentContainer}>
              <PaymentStep
                appointment={appointmentDetails}
                onPaymentDataChange={(data) => {
                  console.log('💳 Datos de pago actualizados:', data);
                  setPaymentData(data);
                }}
                onValidationChange={(isValid) => {
                  console.log('✅ Validación de pago:', isValid);
                  setPaymentValid(isValid);
                }}
              />
              
              {/* Botones del paso de pago */}
              <View style={styles.paymentActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    console.log('❌ Cancelar pago');
                    setShowPaymentStep(false);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                  <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton, (!paymentValid || actionLoading === 'complete') && styles.buttonDisabled]}
                  onPress={handleCompleteWithPayment}
                  disabled={!paymentValid || actionLoading === 'complete'}
                >
                  {actionLoading === 'complete' ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                      <Text style={styles.actionButtonText}>Confirmar y Completar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Cliente */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person" size={20} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>Cliente</Text>
                </View>
                <Text style={styles.clientName}>
                  {appointmentDetails.client 
                    ? `${appointmentDetails.client.firstName} ${appointmentDetails.client.lastName}`
                    : appointmentDetails.clientName || 'Sin información'}
                </Text>
                {(appointmentDetails.client?.phone || appointmentDetails.clientPhone) && (
                  <View style={styles.infoRow}>
                    <Ionicons name="call" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>
                      {appointmentDetails.client?.phone || appointmentDetails.clientPhone}
                    </Text>
                  </View>
                )}
                {(appointmentDetails.client?.email || appointmentDetails.clientEmail) && (
                  <View style={styles.infoRow}>
                    <Ionicons name="mail" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>
                      {appointmentDetails.client?.email || appointmentDetails.clientEmail}
                    </Text>
                  </View>
                )}
              </View>

              {/* Servicio */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="cut" size={20} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>Servicio</Text>
                </View>
                <Text style={styles.serviceName}>
                  {appointmentDetails.service?.name || appointmentDetails.serviceName || 'Sin información'}
                </Text>
                <View style={styles.serviceDetails}>
                  <View style={styles.serviceDetail}>
                    <Ionicons name="time" size={16} color="#6b7280" />
                    <Text style={styles.serviceDetailText}>
                      {appointmentDetails.service?.duration || appointmentDetails.duration || 60} min
                    </Text>
                  </View>
                  {appointmentDetails.totalAmount && (
                    <View style={styles.serviceDetail}>
                      <Ionicons name="cash" size={16} color="#6b7280" />
                      <Text style={styles.serviceDetailText}>
                        ${appointmentDetails.totalAmount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Fecha y Hora */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar" size={20} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>Fecha y Hora</Text>
                </View>
                <Text style={styles.dateText}>{date}</Text>
                <View style={styles.timeRow}>
                  <Ionicons name="time" size={20} color="#3b82f6" />
                  <Text style={styles.timeText}>{time}</Text>
                </View>
              </View>

              {/* Especialista */}
              {appointmentDetails.specialistName && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="medical" size={20} color="#3b82f6" />
                    <Text style={styles.sectionTitle}>Especialista</Text>
                  </View>
                  <Text style={styles.specialistName}>{appointmentDetails.specialistName}</Text>
                </View>
              )}

              {/* Sucursal */}
              {appointmentDetails.branchName && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="business" size={20} color="#3b82f6" />
                    <Text style={styles.sectionTitle}>Sucursal</Text>
                  </View>
                  <Text style={styles.branchName}>{appointmentDetails.branchName}</Text>
                </View>
              )}

              {/* Notas */}
              {appointmentDetails.notes && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="document-text" size={20} color="#3b82f6" />
                    <Text style={styles.sectionTitle}>Notas</Text>
                  </View>
                  <Text style={styles.notesText}>{appointmentDetails.notes}</Text>
                </View>
              )}

              {/* Motivo de cancelación */}
              {appointmentDetails.status === 'CANCELED' && appointmentDetails.cancellationReason && (
                <View style={[styles.section, styles.canceledSection]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="information-circle" size={20} color="#ef4444" />
                    <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Motivo de Cancelación</Text>
                  </View>
                  <Text style={styles.cancelReason}>{appointmentDetails.cancellationReason}</Text>
                </View>
              )}

              {/* Formulario de cancelación */}
              {showCancelForm && (
                <View style={[styles.section, styles.cancelFormSection]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="close-circle" size={20} color="#ef4444" />
                    <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Cancelar Turno</Text>
                  </View>
                  <TextInput
                    style={styles.cancelInput}
                    placeholder="Indica el motivo de cancelación..."
                    value={cancelReason}
                    onChangeText={setCancelReason}
                    multiline
                    numberOfLines={3}
                    autoFocus
                  />
                  <View style={styles.cancelButtons}>
                    <TouchableOpacity
                      style={styles.cancelBackButton}
                      onPress={() => {
                        setShowCancelForm(false);
                        setCancelReason('');
                      }}
                    >
                      <Text style={styles.cancelBackText}>Volver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cancelConfirmButton, actionLoading === 'cancel' && styles.buttonDisabled]}
                      onPress={handleCancelConfirm}
                      disabled={actionLoading === 'cancel'}
                    >
                      {actionLoading === 'cancel' ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.cancelConfirmText}>Confirmar Cancelación</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Indicadores de requisitos */}
              {appointmentDetails.status === 'IN_PROGRESS' && (
                <View style={styles.section}>
                  <Text style={styles.requirementsTitle}>Requisitos para completar</Text>
                  
                  {appointmentDetails.requiresConsent && (
                    <View style={styles.requirementRow}>
                      <Ionicons 
                        name={appointmentDetails.hasConsent ? "checkmark-circle" : "alert-circle"} 
                        size={20} 
                        color={appointmentDetails.hasConsent ? "#10b981" : "#f59e0b"} 
                      />
                      <Text style={styles.requirementText}>
                        Consentimiento firmado
                      </Text>
                    </View>
                  )}
                  
                  {appointmentDetails.requiresEvidence && (
                    <View style={styles.requirementRow}>
                      <Ionicons 
                        name={appointmentDetails.evidencePhotos?.length > 0 ? "checkmark-circle" : "alert-circle"} 
                        size={20} 
                        color={appointmentDetails.evidencePhotos?.length > 0 ? "#10b981" : "#f59e0b"} 
                      />
                      <Text style={styles.requirementText}>
                        Fotos de evidencia ({appointmentDetails.evidencePhotos?.length || 0})
                      </Text>
                    </View>
                  )}
                  
                  {appointmentDetails.requiresPayment && (
                    <View style={styles.requirementRow}>
                      <Ionicons 
                        name={appointmentDetails.paidAmount >= appointmentDetails.totalAmount ? "checkmark-circle" : "alert-circle"} 
                        size={20} 
                        color={appointmentDetails.paidAmount >= appointmentDetails.totalAmount ? "#10b981" : "#f59e0b"} 
                      />
                      <Text style={styles.requirementText}>
                        Pago completo (${appointmentDetails.paidAmount || 0} / ${appointmentDetails.totalAmount})
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Botones de acción */}
            {!showCancelForm && appointmentDetails.status !== 'COMPLETED' && appointmentDetails.status !== 'CANCELED' && (
              <View style={styles.actionsContainer}>
                {/* Botón Iniciar - Para turnos PENDING o CONFIRMED */}
                {(appointmentDetails.status === 'PENDING' || appointmentDetails.status === 'CONFIRMED') && hasPermission('appointments.complete') && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.startButton, actionLoading === 'start' && styles.buttonDisabled]}
                    onPress={handleStart}
                    disabled={actionLoading === 'start'}
                  >
                    {actionLoading === 'start' ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name="play-circle" size={20} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Iniciar Turno</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {/* Botón Completar con Pago - Para turnos IN_PROGRESS */}
                {appointmentDetails.status === 'IN_PROGRESS' && hasPermission('appointments.close_with_payment') && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.completeButton, actionLoading === 'complete' && styles.buttonDisabled]}
                    onPress={() => {
                      console.log('🟢 Botón "Cerrar y Cobrar" presionado');
                      console.log('🟢 Status actual:', appointmentDetails.status);
                      console.log('🟢 Tiene permiso close_with_payment:', hasPermission('appointments.close_with_payment'));
                      handleComplete();
                    }}
                    disabled={actionLoading === 'complete'}
                  >
                    {actionLoading === 'complete' ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name="cash" size={20} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Cerrar y Cobrar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {/* Botón Cancelar - Siempre visible si no está completado/cancelado */}
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={showCancelDialog}
                >
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                  <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
            </>
          )}
        </View>
      </View>
      
      {/* Modal de Captura de Evidencia */}
      <EvidenceCaptureModal
        visible={showEvidenceCapture}
        onClose={() => {
          setShowEvidenceCapture(false);
          // Si cierra sin guardar, ir directo al pago
          setShowPaymentStep(true);
        }}
        onSave={handleEvidenceSaved}
        initialEvidence={appointmentDetails.evidence || { before: [], after: [], documents: [] }}
        appointment={appointmentDetails}
      />
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
    height: '90%',
    flex: 1,
  },
  header: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  headerContent: {
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  infoText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDetailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 8,
  },
  specialistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  branchName: {
    fontSize: 16,
    color: '#1f2937',
  },
  notesText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  canceledSection: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  cancelReason: {
    fontSize: 16,
    color: '#ef4444',
    fontStyle: 'italic',
  },
  cancelFormSection: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  cancelInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    fontSize: 16,
    color: '#1f2937',
    textAlignVertical: 'top',
    minHeight: 80,
    marginBottom: 12,
  },
  cancelButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBackButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelBackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  cancelConfirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
  },
  cancelConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  actionsContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
  },
  startButton: {
    backgroundColor: '#8b5cf6',
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  paymentContainer: {
    flex: 1,
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
});

export default AppointmentDetailsModal;
