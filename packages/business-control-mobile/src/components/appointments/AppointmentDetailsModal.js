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
import { useAppointments } from '../../hooks/useAppointments';
import { usePermissions } from '../../hooks/usePermissions';

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
  const {
    confirmAppointment,
    startAppointment,
    completeAppointment,
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

  // Recargar detalles cuando se abre el modal
  useEffect(() => {
    if (visible && appointment?.id) {
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
      Alert.alert('Sin Permisos', 'No tienes permiso para confirmar turnos');
      return;
    }

    Alert.alert(
      'Confirmar Turno',
      `¿Deseas confirmar el turno de ${appointmentDetails.clientName}?`,
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
    if (!hasPermission('appointments.start')) {
      Alert.alert('Sin Permisos', 'No tienes permiso para iniciar turnos');
      return;
    }

    Alert.alert(
      'Iniciar Procedimiento',
      `¿Deseas iniciar el procedimiento para ${appointmentDetails.clientName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Iniciar',
          onPress: async () => {
            try {
              setActionLoading('start');
              await startAppointment(appointmentDetails.id);
              
              // Actualizar estado local
              setAppointmentDetails(prev => ({ ...prev, status: 'IN_PROGRESS' }));
              
              Alert.alert('Éxito', 'Procedimiento iniciado');
              
              if (onAppointmentUpdated) {
                onAppointmentUpdated({ ...appointmentDetails, status: 'IN_PROGRESS' });
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo iniciar el procedimiento');
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
  const handleComplete = async () => {
    // Validar con el hook
    const validation = canComplete(appointmentDetails);
    if (!validation.allowed) {
      Alert.alert(
        'No se puede completar',
        validation.reason,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Completar Turno',
      `¿Deseas completar el turno de ${appointmentDetails.clientName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          onPress: async () => {
            try {
              setActionLoading('complete');
              await completeAppointment(appointmentDetails.id);
              
              // Actualizar estado local
              setAppointmentDetails(prev => ({ ...prev, status: 'COMPLETED' }));
              
              Alert.alert('Éxito', 'Turno completado correctamente');
              
              if (onAppointmentUpdated) {
                onAppointmentUpdated({ ...appointmentDetails, status: 'COMPLETED' });
              }
              
              // Cerrar modal después de completar
              setTimeout(() => {
                onClose();
              }, 1500);
            } catch (error) {
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
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Cliente */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person" size={20} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>Cliente</Text>
                </View>
                <Text style={styles.clientName}>{appointmentDetails.clientName}</Text>
                {appointmentDetails.clientPhone && (
                  <View style={styles.infoRow}>
                    <Ionicons name="call" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>{appointmentDetails.clientPhone}</Text>
                  </View>
                )}
                {appointmentDetails.clientEmail && (
                  <View style={styles.infoRow}>
                    <Ionicons name="mail" size={16} color="#6b7280" />
                    <Text style={styles.infoText}>{appointmentDetails.clientEmail}</Text>
                  </View>
                )}
              </View>

              {/* Servicio */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="cut" size={20} color="#3b82f6" />
                  <Text style={styles.sectionTitle}>Servicio</Text>
                </View>
                <Text style={styles.serviceName}>{appointmentDetails.serviceName}</Text>
                <View style={styles.serviceDetails}>
                  <View style={styles.serviceDetail}>
                    <Ionicons name="time" size={16} color="#6b7280" />
                    <Text style={styles.serviceDetailText}>
                      {appointmentDetails.duration || 60} min
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
          )}

          {/* Botones de acción */}
          {!loading && !showCancelForm && appointmentDetails.status !== 'COMPLETED' && appointmentDetails.status !== 'CANCELED' && (
            <View style={styles.actionsContainer}>
              {appointmentDetails.status === 'PENDING' && hasPermission('appointments.confirm') && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmButton, actionLoading === 'confirm' && styles.buttonDisabled]}
                  onPress={handleConfirm}
                  disabled={actionLoading === 'confirm'}
                >
                  {actionLoading === 'confirm' ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                      <Text style={styles.actionButtonText}>Confirmar</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {appointmentDetails.status === 'CONFIRMED' && hasPermission('appointments.start') && (
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
                      <Text style={styles.actionButtonText}>Iniciar</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {appointmentDetails.status === 'IN_PROGRESS' && hasPermission('appointments.complete') && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton, actionLoading === 'complete' && styles.buttonDisabled]}
                  onPress={handleComplete}
                  disabled={actionLoading === 'complete'}
                >
                  {actionLoading === 'complete' ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-done-circle" size={20} color="#ffffff" />
                      <Text style={styles.actionButtonText}>Completar</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {hasPermission('appointments.cancel') && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={showCancelDialog}
                >
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                  <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
});

export default AppointmentDetailsModal;
