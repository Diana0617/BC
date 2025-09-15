import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ConsentCaptureModal = ({ 
  visible,
  appointment,
  specialistId,
  onClose,
  onConsentCaptured 
}) => {
  const [loading, setLoading] = useState(false);
  const [specialistSignature, setSpecialistSignature] = useState(null);
  const [clientConsent, setClientConsent] = useState({
    clientName: appointment?.client?.name || '',
    clientId: '',
    consentText: '',
    agreedToTerms: false,
    agreedToTreatment: false,
    agreedToPhotos: false
  });
  const [consentTemplate, setConsentTemplate] = useState(null);

  useEffect(() => {
    if (visible && specialistId) {
      loadSpecialistSignature();
      loadConsentTemplate();
    }
  }, [visible, specialistId, appointment]);

  /**
   * Cargar firma guardada del especialista
   */
  const loadSpecialistSignature = async () => {
    try {
      const response = await fetch(
        `/api/specialist-documents/${specialistId}/signature`, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

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
    if (!appointment?.service?.id) return;

    try {
      const response = await fetch(
        `/api/services/${appointment.service.id}/consent-template`, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConsentTemplate(data.template);
        
        // Pre-llenar el texto de consentimiento
        if (data.template?.consentText) {
          setClientConsent(prev => ({
            ...prev,
            consentText: data.template.consentText
          }));
        }
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

  const toggleAgreement = (field) => {
    setClientConsent(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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

    if (!specialistSignature) {
      Alert.alert('Error', 'No se encontró la firma del especialista');
      return false;
    }

    return true;
  };

  const captureConsent = async () => {
    if (!validateConsent()) return;

    setLoading(true);
    try {
      // Generar documento PDF de consentimiento
      const consentData = {
        appointmentId: appointment.id,
        clientData: clientConsent,
        specialistSignature: specialistSignature.fileUrl,
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
      const response = await fetch(
        `/api/appointments/${appointment.id}/consent`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(consentData)
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        Alert.alert('Éxito', 'Consentimiento capturado correctamente');
        
        if (onConsentCaptured) {
          onConsentCaptured({
            consentDocument: result.consentDocument,
            clientData: clientConsent,
            capturedAt: new Date().toISOString()
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
        <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text className="text-red-800 font-medium ml-2">Firma No Disponible</Text>
          </View>
          <Text className="text-red-700 text-sm mb-3">
            Necesitas subir tu firma digital en tu perfil para capturar consentimientos.
          </Text>
          <TouchableOpacity
            onPress={navigateToProfile}
            className="bg-red-600 rounded-lg py-2 px-4"
          >
            <Text className="text-white text-center font-medium">Ir a Perfil</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text className="text-green-800 font-medium ml-2">Firma Verificada</Text>
        </View>
        <Text className="text-green-700 text-sm mt-1">
          Firma aprobada el {new Date(specialistSignature.approvedAt).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  const renderConsentForm = () => {
    return (
      <View className="space-y-4">
        {/* Información del cliente */}
        <View>
          <Text className="text-gray-900 font-medium mb-2">Información del Cliente</Text>
          
          <View className="mb-3">
            <Text className="text-gray-700 text-sm mb-1">Nombre Completo *</Text>
            <TextInput
              value={clientConsent.clientName}
              onChangeText={(value) => handleClientDataChange('clientName', value)}
              placeholder="Nombre completo del cliente"
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            />
          </View>

          <View className="mb-3">
            <Text className="text-gray-700 text-sm mb-1">Número de Identificación *</Text>
            <TextInput
              value={clientConsent.clientId}
              onChangeText={(value) => handleClientDataChange('clientId', value)}
              placeholder="Cédula o documento de identidad"
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            />
          </View>
        </View>

        {/* Texto de consentimiento */}
        {consentTemplate && (
          <View>
            <Text className="text-gray-900 font-medium mb-2">Consentimiento Informado</Text>
            <View className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-32">
              <ScrollView>
                <Text className="text-gray-700 text-sm">
                  {consentTemplate.consentText || clientConsent.consentText}
                </Text>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Términos y condiciones */}
        <View>
          <Text className="text-gray-900 font-medium mb-3">Autorizaciones</Text>
          
          <TouchableOpacity
            onPress={() => toggleAgreement('agreedToTerms')}
            className="flex-row items-center mb-3"
          >
            <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
              clientConsent.agreedToTerms ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
            }`}>
              {clientConsent.agreedToTerms && (
                <Ionicons name="checkmark" size={12} color="white" />
              )}
            </View>
            <Text className="text-gray-700 text-sm flex-1">
              Acepto los términos y condiciones del servicio
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleAgreement('agreedToTreatment')}
            className="flex-row items-center mb-3"
          >
            <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
              clientConsent.agreedToTreatment ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
            }`}>
              {clientConsent.agreedToTreatment && (
                <Ionicons name="checkmark" size={12} color="white" />
              )}
            </View>
            <Text className="text-gray-700 text-sm flex-1">
              Autorizo la realización del tratamiento descrito
            </Text>
          </TouchableOpacity>

          {appointment?.service?.requiresPhotos && (
            <TouchableOpacity
              onPress={() => toggleAgreement('agreedToPhotos')}
              className="flex-row items-center mb-3"
            >
              <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                clientConsent.agreedToPhotos ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
              }`}>
                {clientConsent.agreedToPhotos && (
                  <Ionicons name="checkmark" size={12} color="white" />
                )}
              </View>
              <Text className="text-gray-700 text-sm flex-1">
                Autorizo la toma de fotografías para evidencia médica
              </Text>
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
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <Text className="text-lg font-bold text-gray-900">
            Capturar Consentimiento
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Información de la cita */}
          <View className="bg-gray-50 rounded-lg p-4 mb-6">
            <Text className="font-medium text-gray-900 mb-1">
              {appointment?.service?.name}
            </Text>
            <Text className="text-gray-600 mb-1">
              Cliente: {appointment?.client?.name}
            </Text>
            <Text className="text-sm text-gray-500">
              {new Date(appointment?.scheduledDate).toLocaleString()}
            </Text>
          </View>

          {/* Estado de la firma */}
          {renderSignatureStatus()}

          {/* Formulario de consentimiento */}
          {specialistSignature && renderConsentForm()}
        </ScrollView>

        {/* Botones de acción */}
        <View className="p-4 border-t border-gray-200">
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-200 rounded-lg py-3"
            >
              <Text className="text-gray-800 text-center font-medium">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={captureConsent}
              disabled={loading || !specialistSignature}
              className={`flex-1 rounded-lg overflow-hidden ${
                loading || !specialistSignature ? 'opacity-50' : ''
              }`}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                className="px-6 py-3 flex-row items-center justify-center"
              >
                {loading && (
                  <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                )}
                <Text className="text-white font-medium">
                  {loading ? 'Generando...' : 'Capturar Consentimiento'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConsentCaptureModal;