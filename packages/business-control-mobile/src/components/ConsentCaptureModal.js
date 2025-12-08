import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SignatureCanvas from 'react-native-signature-canvas';
import { getApiUrl } from '@shared/constants/api';
import { StorageHelper } from '@shared/utils/storage';
import { STORAGE_KEYS } from '@shared/constants/api';
import { useSelector } from 'react-redux';

/**
 * Limpia etiquetas HTML de un texto
 */
const stripHtml = (html) => {
  if (!html) return '';
  
  return html
    // Reemplazar <br>, <p>, </p> con saltos de línea
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    // Remover todas las demás etiquetas HTML
    .replace(/<[^>]+>/g, '')
    // Decodificar entidades HTML comunes
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Limpiar espacios múltiples y saltos de línea excesivos
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
};

const ConsentCaptureModal = ({ 
  visible,
  appointment,
  specialistId,
  onClose,
  onConsentCaptured 
}) => {
  const { user } = useSelector(state => state.auth);
  const signatureRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [specialistSignature, setSpecialistSignature] = useState(null);
  const [clientSignature, setClientSignature] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [editableFieldsData, setEditableFieldsData] = useState({}); // Campos dinámicos del template
  const [clientConsent, setClientConsent] = useState({
    clientName: appointment?.client ? `${appointment.client.firstName || ''} ${appointment.client.lastName || ''}`.trim() : '',
    clientId: '',
    consentText: '',
    agreedToTerms: false,
    agreedToTreatment: false,
    agreedToPhotos: false
  });
  const [consentTemplate, setConsentTemplate] = useState(null);

  // Actualizar nombre del cliente cuando cambie el appointment
  useEffect(() => {
    if (appointment?.client) {
      const fullName = `${appointment.client.firstName || ''} ${appointment.client.lastName || ''}`.trim();
      setClientConsent(prev => ({
        ...prev,
        clientName: fullName
      }));
    }
  }, [appointment?.client]);

  useEffect(() => {
    if (visible && specialistId) {
      loadSpecialistSignature();
      loadConsentTemplate();
      
      // Debug appointment data
      console.log('📋 Appointment data en ConsentCaptureModal:', {
        id: appointment?.id,
        appointmentDate: appointment?.appointmentDate,
        client: appointment?.client,
        service: appointment?.service
      });
    }
  }, [visible, specialistId, appointment]);

  /**
   * Cargar firma guardada del especialista
   */
  const loadSpecialistSignature = async () => {
    try {
      const token = await StorageHelper.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const url = `${getApiUrl()}/api/specialist-documents/${specialistId}/signature`;
      console.log('📝 Cargando firma del especialista:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.signature && data.signature.status === 'APPROVED') {
          setSpecialistSignature(data.signature);
        } else if (data.signature && data.signature.status === 'PENDING') {
          Alert.alert(
            'Firma Pendiente',
            'Tu firma está pendiente de aprobación. Contacta con el administrador.'
          );
        } else {
          Alert.alert(
            'Firma Requerida',
            'Necesitas subir tu firma digital en tu perfil antes de capturar consentimientos.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Ir a Perfil', onPress: () => navigateToProfile() }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Error loading specialist signature:', error);
      Alert.alert('Error', 'No se pudo cargar la firma del especialista');
    }
  };

  /**
   * Cargar plantilla de consentimiento del servicio
   */
  const loadConsentTemplate = async () => {
    if (!appointment?.service?.id) {
      console.log('⚠️ No hay serviceId en appointment');
      return;
    }

    try {
      const token = await StorageHelper.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const url = `${getApiUrl()}/api/services/${appointment.service.id}/consent-template?businessId=${user.businessId}`;
      console.log('📝 Cargando template de consentimiento:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Template recibido:', data);
        
        // El backend devuelve { success: true, data: { service, template } }
        const template = data.data?.template || data.template;
        setConsentTemplate(template);
        
        // Pre-llenar el texto de consentimiento (el campo es "content", no "consentText")
        if (template?.content) {
          console.log('📄 Texto del consentimiento cargado, longitud:', template.content.length);
          setClientConsent(prev => ({
            ...prev,
            consentText: template.content
          }));
        } else {
          console.log('⚠️ No hay content en template:', template);
        }
      } else {
        console.log('❌ Error en response:', response.status);
      }
    } catch (error) {
      console.error('Error loading consent template:', error);
    }
  };

  const navigateToProfile = () => {
    onClose();
    // Aquí navegarías a la pantalla de perfil del especialista
    // navigation.navigate('SpecialistProfile', { section: 'documents' });
  };

  const handleClientDataChange = (field, value) => {
    setClientConsent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditableFieldChange = (fieldName, value) => {
    setEditableFieldsData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const toggleAgreement = (field) => {
    setClientConsent(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSignatureEnd = (signature) => {
    setClientSignature(signature);
    setShowSignaturePad(false);
    Alert.alert('Éxito', 'Firma capturada correctamente');
  };

  const handleSignatureClear = () => {
    signatureRef.current?.clearSignature();
  };

  const handleSignatureCancel = () => {
    setShowSignaturePad(false);
  };

  const validateConsent = () => {
    if (!clientConsent.clientName.trim()) {
      Alert.alert('Error', 'El nombre del cliente es requerido');
      return false;
    }

    if (!clientConsent.clientId.trim()) {
      Alert.alert('Error', 'La identificación del cliente es requerida');
      return false;
    }

    // Validar campos editables requeridos del template
    if (consentTemplate?.editableFields) {
      for (const field of consentTemplate.editableFields) {
        if (field.required && !editableFieldsData[field.name]?.trim()) {
          Alert.alert('Campo Requerido', `Por favor complete: ${field.label}`);
          return false;
        }
      }
    }

    if (!clientConsent.agreedToTerms) {
      Alert.alert('Error', 'El cliente debe aceptar los términos y condiciones');
      return false;
    }

    if (!clientConsent.agreedToTreatment) {
      Alert.alert('Error', 'El cliente debe autorizar el tratamiento');
      return false;
    }

    if (appointment?.service?.requiresPhotos && !clientConsent.agreedToPhotos) {
      Alert.alert('Error', 'El cliente debe autorizar la toma de fotografías');
      return false;
    }

    if (!clientSignature) {
      Alert.alert('Firma Requerida', 'El cliente debe firmar el consentimiento');
      return false;
    }

    // La firma del especialista es opcional - se puede configurar después
    // if (!specialistSignature) {
    //   Alert.alert('Error', 'No se encontró la firma del especialista');
    //   return false;
    // }

    return true;
  };

  const captureConsent = async () => {
    if (!validateConsent()) return;

    setLoading(true);
    try {
      // Generar documento PDF de consentimiento
      const consentData = {
        appointmentId: appointment.id,
        clientData: {
          ...clientConsent,
          signature: clientSignature, // Firma en base64
          editableFields: editableFieldsData // Campos dinámicos completados
        },
        specialistSignature: specialistSignature?.fileUrl || null, // Opcional
        serviceInfo: {
          name: appointment.service?.name,
          description: appointment.service?.description,
          duration: appointment.service?.duration,
          price: appointment.service?.price
        },
        consentTemplate: consentTemplate,
        capturedAt: new Date().toISOString(),
        capturedBy: specialistId
      };

      // Llamar API para generar y subir PDF de consentimiento
      const token = await StorageHelper.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      const url = `${getApiUrl()}/api/appointments/${appointment.id}/consent?businessId=${user.businessId}`;
      console.log('📝 Guardando consentimiento:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(consentData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Consentimiento guardado:', result);
        
        // Verificar si se generó el PDF
        const pdfUrl = result.data?.consentSignature?.pdfUrl;
        const fullPdfUrl = pdfUrl ? `${getApiUrl()}${pdfUrl}` : null;
        
        if (fullPdfUrl) {
          // Mostrar opciones para el PDF
          Alert.alert(
            '✅ Consentimiento Capturado',
            'El consentimiento ha sido firmado correctamente. ¿Qué deseas hacer con el PDF?',
            [
              {
                text: 'Ver PDF',
                onPress: () => Linking.openURL(fullPdfUrl)
              },
              {
                text: 'Compartir',
                onPress: async () => {
                  try {
                    await Share.share({
                      message: `Consentimiento firmado - ${appointment.service?.name}\nCliente: ${clientConsent.clientName}\n\nPDF: ${fullPdfUrl}`,
                      url: fullPdfUrl,
                      title: 'Consentimiento Informado'
                    });
                  } catch (error) {
                    console.error('Error compartiendo:', error);
                  }
                }
              },
              {
                text: 'Cerrar',
                style: 'cancel'
              }
            ]
          );
        } else {
          Alert.alert('Éxito', 'Consentimiento capturado correctamente');
        }
        
        if (onConsentCaptured) {
          onConsentCaptured({
            consentDocument: result.consentDocument,
            clientData: clientConsent,
            capturedAt: new Date().toISOString(),
            pdfUrl: fullPdfUrl
          });
        }
        
        onClose();
      } else {
        throw new Error('Failed to capture consent');
      }
    } catch (error) {
      console.error('Error capturing consent:', error);
      Alert.alert('Error', 'No se pudo capturar el consentimiento');
    } finally {
      setLoading(false);
    }
  };

  const renderSignatureStatus = () => {
    if (!specialistSignature) {
      return (
        <View style={styles.warningBox}>
          <View style={styles.warningHeader}>
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <Text style={styles.warningTitle}>Firma del Especialista Pendiente</Text>
          </View>
          <Text style={styles.warningText}>
            Puedes capturar el consentimiento ahora. La firma digital del especialista se puede agregar después desde el perfil.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.successBox}>
        <View style={styles.successHeader}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.successTitle}>Firma Verificada</Text>
        </View>
        <Text style={styles.successText}>
          Firma aprobada el {new Date(specialistSignature.approvedAt).toLocaleString('es-CO', {
            timeZone: 'America/Bogota',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>
    );
  };

  // Renderiza campos dinámicos según el template
  const renderEditableFields = () => {
    if (!consentTemplate?.editableFields || consentTemplate.editableFields.length === 0) {
      return null;
    }

    return (
      <View style={{ marginTop: 16 }}>
        <Text style={styles.sectionTitle}>Información Adicional</Text>
        {consentTemplate.editableFields.map((field, index) => (
          <View key={field.name || index} style={{ marginBottom: 12 }}>
            <Text style={styles.inputLabel}>
              {field.label} {field.required && '*'}
            </Text>
            <TextInput
              value={editableFieldsData[field.name] || ''}
              onChangeText={(value) => handleEditableFieldChange(field.name, value)}
              placeholder={field.label}
              style={[
                styles.input,
                field.type === 'textarea' && styles.textareaInput
              ]}
              multiline={field.type === 'textarea'}
              numberOfLines={field.type === 'textarea' ? 4 : 1}
            />
          </View>
        ))}
      </View>
    );
  };

  const renderConsentForm = () => {
    return (
      <View>
        {/* Información del cliente */}
        <Text style={styles.sectionTitle}>Información del Cliente</Text>
        
        <Text style={styles.inputLabel}>Nombre Completo *</Text>
        <TextInput
          value={clientConsent.clientName}
          onChangeText={(value) => handleClientDataChange('clientName', value)}
          placeholder="Nombre completo del cliente"
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Número de Identificación *</Text>
        <TextInput
          value={clientConsent.clientId}
          onChangeText={(value) => handleClientDataChange('clientId', value)}
          placeholder="Cédula o documento de identidad"
          style={styles.input}
          keyboardType="numeric"
        />

        {/* Campos dinámicos del template */}
        {renderEditableFields()}

        {/* Texto de consentimiento */}
        {consentTemplate && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Consentimiento Informado</Text>
            <View style={styles.consentBox}>
              <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
                <Text style={styles.consentText}>
                  {stripHtml(consentTemplate.content || clientConsent.consentText)}
                </Text>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Autorizaciones */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Autorizaciones</Text>
        
        <TouchableOpacity
          onPress={() => toggleAgreement('agreedToTerms')}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkbox, clientConsent.agreedToTerms && styles.checkboxChecked]}>
            {clientConsent.agreedToTerms && (
              <Ionicons name="checkmark" size={12} color="white" />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            Acepto los términos y condiciones del servicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => toggleAgreement('agreedToTreatment')}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkbox, clientConsent.agreedToTreatment && styles.checkboxChecked]}>
            {clientConsent.agreedToTreatment && (
              <Ionicons name="checkmark" size={12} color="white" />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            Autorizo la realización del tratamiento descrito
          </Text>
        </TouchableOpacity>

        {appointment?.service?.requiresPhotos && (
          <TouchableOpacity
            onPress={() => toggleAgreement('agreedToPhotos')}
            style={styles.checkboxRow}
          >
            <View style={[styles.checkbox, clientConsent.agreedToPhotos && styles.checkboxChecked]}>
              {clientConsent.agreedToPhotos && (
                <Ionicons name="checkmark" size={12} color="white" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              Autorizo la toma de fotografías para evidencia médica
            </Text>
          </TouchableOpacity>
        )}

        {/* Firma del Cliente */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.sectionTitle}>Firma del Cliente *</Text>
          {clientSignature ? (
            <View style={styles.signaturePreview}>
              <View style={styles.signatureHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.signatureText}>Firma capturada</Text>
                <TouchableOpacity onPress={() => setClientSignature(null)}>
                  <Text style={styles.signatureChangeButton}>Cambiar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setShowSignaturePad(true)}
              style={styles.signatureButton}
            >
              <Ionicons name="create-outline" size={24} color="#3B82F6" />
              <Text style={styles.signatureButtonText}>Firmar Ahora</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Capturar Consentimiento
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          {/* Información de la cita */}
          <View style={styles.appointmentInfo}>
            <Text style={styles.serviceName}>
              {appointment?.service?.name}
            </Text>
            <Text style={styles.clientName}>
              Cliente: {appointment?.client?.firstName} {appointment?.client?.lastName}
            </Text>
            <Text style={styles.appointmentDate}>
              {appointment?.appointmentDate ? new Date(appointment.appointmentDate).toLocaleString('es-CO', {
                timeZone: 'America/Bogota',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Fecha no disponible'}
            </Text>
          </View>

          {/* Estado de la firma */}
          {renderSignatureStatus()}

          {/* Formulario de consentimiento - siempre visible */}
          {renderConsentForm()}
        </ScrollView>

        {/* Botones de acción */}
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={captureConsent}
              disabled={loading}
              style={[styles.submitButton, loading && { opacity: 0.5 }]}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.gradientButton}
              >
                {loading && (
                  <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.buttonText}>
                  {loading ? 'Generando...' : 'Capturar Consentimiento'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal de Firma */}
      <Modal
        visible={showSignaturePad}
        animationType="slide"
        transparent={false}
        onRequestClose={handleSignatureCancel}
      >
        <View style={styles.signatureModal}>
          <View style={styles.signatureModalHeader}>
            <Text style={styles.signatureModalTitle}>Firma del Cliente</Text>
            <TouchableOpacity onPress={handleSignatureCancel}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.signatureCanvas}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={handleSignatureEnd}
              onEmpty={() => Alert.alert('Por favor', 'Firma antes de guardar')}
              descriptionText="Firme en el espacio de abajo"
              clearText="Limpiar"
              confirmText="Guardar"
              webStyle={`
                .m-signature-pad {
                  box-shadow: none;
                  border: none;
                  width: 100%;
                  height: 100%;
                }
                .m-signature-pad--body {
                  border: 2px dashed #D1D5DB;
                  border-radius: 8px;
                  background-color: #F9FAFB;
                }
                .m-signature-pad--footer {
                  display: none;
                  margin: 0px;
                }
                body, html {
                  margin: 0;
                  padding: 0;
                  height: 100%;
                  width: 100%;
                }
              `}
              backgroundColor="#F9FAFB"
              penColor="#000000"
            />
          </View>

          <View style={styles.signatureModalFooter}>
            <TouchableOpacity
              onPress={handleSignatureClear}
              style={styles.signatureClearButton}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.signatureClearText}>Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => signatureRef.current?.readSignature()}
              style={styles.signatureSaveButton}
            >
              <Ionicons name="checkmark-outline" size={20} color="#fff" />
              <Text style={styles.signatureSaveText}>Guardar Firma</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827'
  },
  scrollContent: {
    flex: 1,
    padding: 16
  },
  appointmentInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24
  },
  serviceName: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  clientName: {
    color: '#4B5563',
    marginBottom: 4
  },
  appointmentDate: {
    fontSize: 14,
    color: '#6B7280'
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  warningTitle: {
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 8
  },
  warningText: {
    color: '#78350F',
    fontSize: 14
  },
  successBox: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  successTitle: {
    color: '#065F46',
    fontWeight: '600',
    marginLeft: 8
  },
  successText: {
    color: '#047857',
    fontSize: 14,
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    marginBottom: 12
  },
  textareaInput: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  consentBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    height: 350,
    marginBottom: 16
  },
  consentText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6'
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151'
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#1F2937',
    fontWeight: '600'
  },
  submitButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden'
  },
  gradientButton: {
    paddingHorizontal: 24,  
    paddingVertical: 12,    
    flexDirection: 'row',   
    alignItems: 'center',   
    justifyContent: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'       
  },
  // Estilos de firma
  signaturePreview: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F9FAFB'
  },
  signatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  signatureText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#065F46',
    fontWeight: '600'
  },
  signatureChangeButton: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600'
  },
  signatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    backgroundColor: '#EFF6FF'
  },
  signatureButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  signatureModal: {
    flex: 1,
    backgroundColor: '#fff'
  },
  signatureModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  signatureModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827'
  },
  signatureCanvas: {
    flex: 1,
    backgroundColor: '#fff',
    minHeight: 300
  },
  signatureModalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12
  },
  signatureClearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 12
  },
  signatureClearText: {
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8
  },
  signatureSaveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12
  },
  signatureSaveText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8
  }
});export default ConsentCaptureModal;