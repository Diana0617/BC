import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import useBusinessRules from '../hooks/useBusinessRules';
import useAppointmentValidation from '../hooks/useAppointmentValidation';
import { useAuthToken } from '../hooks/useAuth';

const AppointmentClosureValidator = ({ 
  appointment, 
  businessId,
  onClose, 
  onValidationComplete 
}) => {
  const authToken = useAuthToken();
  const [currentStep, setCurrentStep] = useState(0);
  const [validationResults, setValidationResults] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  
  const { validateAction } = useBusinessRules(businessId);
  const { 
    validateAppointment, 
    isFullyValidated,
    validationStatus 
  } = useAppointmentValidation(appointment.id);

  const steps = [
    {
      key: 'consent',
      title: 'Consentimiento',
      icon: 'document-text-outline',
      required: appointment.requiresConsent,
      description: 'Capturar firma y consentimiento del cliente'
    },
    {
      key: 'evidence',
      title: 'Evidencias',
      icon: 'camera-outline',
      required: true,
      description: 'Subir fotos antes y después del servicio'
    },
    {
      key: 'payment',
      title: 'Pago',
      icon: 'card-outline',
      required: true,
      description: 'Procesar pago del servicio'
    },
    {
      key: 'inventory',
      title: 'Inventario',
      icon: 'cube-outline',
      required: appointment.usesProducts,
      description: 'Descontar productos utilizados'
    }
  ];

  useEffect(() => {
    validateAppointmentClosure();
  }, [appointment, validationStatus]);

  const validateAppointmentClosure = async () => {
    const context = {
      appointmentId: appointment.id,
      hasPaid: validationStatus.payment?.completed || false,
      hasConsent: validationStatus.consent?.completed || false,
      hasEvidence: validationStatus.evidence?.completed || false,
      hasInventory: validationStatus.inventory?.completed || false,
      requiresConsent: appointment.requiresConsent,
      usesProducts: appointment.usesProducts,
      hoursUntilAppointment: 0 // Ya está en progreso
    };

    const validation = validateAction('closeAppointment', context);
    setValidationResults(validation);
  };

  const handleStepPress = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const renderStepStatus = (step) => {
    const stepValidation = validationStatus[step.key];
    const isCompleted = stepValidation?.completed || false;
    const hasError = stepValidation?.error || false;
    
    if (!step.required && !isCompleted) {
      return {
        icon: 'ellipse-outline',
        color: '#9CA3AF',
        bgColor: '#F3F4F6'
      };
    }
    
    if (isCompleted) {
      return {
        icon: 'checkmark-circle',
        color: '#10B981',
        bgColor: '#D1FAE5'
      };
    }
    
    if (hasError) {
      return {
        icon: 'close-circle',
        color: '#EF4444',
        bgColor: '#FEE2E2'
      };
    }
    
    return {
      icon: 'time-outline',
      color: '#F59E0B',
      bgColor: '#FEF3C7'
    };
  };

  const handleCloseAppointment = async () => {
    if (!isFullyValidated()) {
      Alert.alert(
        'Validación Incompleta',
        'Completa todos los pasos requeridos antes de cerrar la cita'
      );
      return;
    }

    if (!validationResults.allowed) {
      Alert.alert(
        'No Permitido',
        validationResults.requirements.join('\n')
      );
      return;
    }

    if (validationResults.requiresApproval) {
      Alert.alert(
        'Requiere Aprobación',
        `Esta acción requiere aprobación del manager:\n\n${validationResults.warnings.join('\n')}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Solicitar Aprobación', onPress: () => requestManagerApproval() }
        ]
      );
      return;
    }

    setIsClosing(true);
    try {
      await closeAppointment();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar la cita');
    } finally {
      setIsClosing(false);
    }
  };

  const closeAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          validationData: validationStatus,
          notes: 'Cita cerrada desde la aplicación móvil'
        })
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Éxito', 'Cita cerrada correctamente');
        onValidationComplete(data);
      } else {
        throw new Error('Failed to close appointment');
      }
    } catch (error) {
      console.error('Error closing appointment:', error);
      throw error;
    }
  };

  const requestManagerApproval = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/request-approval`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'closeAppointment',
          warnings: validationResults.warnings,
          validationData: validationStatus
        })
      });

      if (response.ok) {
        Alert.alert(
          'Solicitud Enviada',
          'Se ha enviado la solicitud de aprobación al manager'
        );
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la solicitud');
    }
  };

  const renderStepIndicator = (step, index) => {
    const status = renderStepStatus(step);
    const isActive = currentStep === index;
    
    return (
      <TouchableOpacity
        key={step.key}
        onPress={() => handleStepPress(index)}
        className={`flex-row items-center p-4 rounded-lg mb-3 ${
          isActive ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
        }`}
      >
        <View 
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: status.bgColor }}
        >
          <Ionicons name={status.icon} size={20} color={status.color} />
        </View>
        
        <View className="flex-1">
          <Text className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
            {step.title}
            {step.required && <Text className="text-red-500"> *</Text>}
          </Text>
          <Text className={`text-sm ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
            {step.description}
          </Text>
        </View>
        
        {isActive && (
          <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
        )}
      </TouchableOpacity>
    );
  };

  const renderValidationSummary = () => {
    if (!validationResults.warnings || validationResults.warnings.length === 0) {
      return null;
    }

    return (
      <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="warning" size={20} color="#F59E0B" />
          <Text className="text-yellow-800 font-medium ml-2">Advertencias</Text>
        </View>
        {validationResults.warnings.map((warning, index) => (
          <Text key={index} className="text-yellow-700 text-sm">
            • {warning}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-900">
          Cerrar Cita
        </Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Información de la cita */}
        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="font-medium text-gray-900 mb-1">
            {appointment.client?.name}
          </Text>
          <Text className="text-gray-600 mb-1">
            {appointment.service?.name}
          </Text>
          <Text className="text-sm text-gray-500">
            {new Date(appointment.scheduledDate).toLocaleString()}
          </Text>
        </View>

        {/* Advertencias de validación */}
        {renderValidationSummary()}

        {/* Pasos de validación */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Pasos de Validación
          </Text>
          {steps.map((step, index) => renderStepIndicator(step, index))}
        </View>

        {/* Progreso general */}
        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="font-medium text-gray-900 mb-2">Progreso General</Text>
          <View className="flex-row items-center">
            <View className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
              <View 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(Object.values(validationStatus).filter(s => s?.completed).length / steps.filter(s => s.required).length) * 100}%` 
                }}
              />
            </View>
            <Text className="text-sm text-gray-600">
              {Object.values(validationStatus).filter(s => s?.completed).length}/
              {steps.filter(s => s.required).length}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón de cierre */}
      <View className="p-4 border-t border-gray-200">
        <TouchableOpacity
          onPress={handleCloseAppointment}
          disabled={!isFullyValidated() || isClosing}
          className={`rounded-lg overflow-hidden ${
            !isFullyValidated() || isClosing ? 'opacity-50' : ''
          }`}
        >
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            className="px-6 py-4"
          >
            <Text className="text-white text-center font-medium">
              {isClosing ? 'Cerrando...' : 'Cerrar Cita'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AppointmentClosureValidator;