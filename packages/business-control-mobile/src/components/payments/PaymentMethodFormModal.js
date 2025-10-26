import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

/**
 * Modal para crear/editar métodos de pago
 */
export default function PaymentMethodFormModal({ 
  visible, 
  method = null, 
  onSave, 
  onCancel 
}) {
  const isEditing = !!method;

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    type: 'CASH',
    requiresProof: false,
    icon: 'cash-outline',
    bankInfo: {
      bankName: '',
      accountNumber: '',
      accountType: '',
      holderName: '',
      cci: '',
      phoneNumber: '',
    },
    metadata: {
      description: '',
    },
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Cargar datos si es edición
  useEffect(() => {
    if (method) {
      setFormData({
        name: method.name || '',
        type: method.type || 'CASH',
        requiresProof: method.requiresProof || false,
        icon: method.icon || 'cash-outline',
        bankInfo: method.bankInfo || {
          bankName: '',
          accountNumber: '',
          accountType: '',
          holderName: '',
          cci: '',
          phoneNumber: '',
        },
        metadata: method.metadata || { description: '' },
      });
    } else {
      // Reset para nuevo método
      resetForm();
    }
  }, [method, visible]);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'CASH',
      requiresProof: false,
      icon: 'cash-outline',
      bankInfo: {
        bankName: '',
        accountNumber: '',
        accountType: '',
        holderName: '',
        cci: '',
        phoneNumber: '',
      },
      metadata: {
        description: '',
      },
    });
    setErrors({});
  };

  // Tipos de métodos de pago
  const paymentTypes = [
    { value: 'CASH', label: 'Efectivo', icon: 'cash-outline' },
    { value: 'CARD', label: 'Tarjeta', icon: 'card-outline' },
    { value: 'TRANSFER', label: 'Transferencia', icon: 'swap-horizontal-outline' },
    { value: 'QR', label: 'Código QR', icon: 'qr-code-outline' },
    { value: 'ONLINE', label: 'Pago Online', icon: 'globe-outline' },
    { value: 'OTHER', label: 'Otro', icon: 'ellipsis-horizontal-outline' },
  ];

  // Iconos disponibles
  const availableIcons = [
    'cash-outline',
    'card-outline',
    'swap-horizontal-outline',
    'qr-code-outline',
    'globe-outline',
    'wallet-outline',
    'phone-portrait-outline',
    'business-outline',
    'briefcase-outline',
  ];

  // Validación
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.type) {
      newErrors.type = 'El tipo es requerido';
    }

    // Validar info bancaria si requiere comprobante o es transferencia/QR
    if (formData.requiresProof || ['TRANSFER', 'QR'].includes(formData.type)) {
      if (formData.type === 'TRANSFER' && !formData.bankInfo.accountNumber) {
        newErrors.accountNumber = 'El número de cuenta es requerido para transferencias';
      }
      if (formData.type === 'QR' && !formData.bankInfo.phoneNumber) {
        newErrors.phoneNumber = 'El teléfono es requerido para pagos QR';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Actualizar campo
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Actualizar campo de bankInfo
  const updateBankInfo = (field, value) => {
    setFormData(prev => ({
      ...prev,
      bankInfo: {
        ...prev.bankInfo,
        [field]: value,
      },
    }));
  };

  // Actualizar tipo (y cambiar icono automáticamente)
  const updateType = (type) => {
    const selectedType = paymentTypes.find(t => t.value === type);
    updateField('type', type);
    if (selectedType) {
      updateField('icon', selectedType.icon);
    }
  };

  // Guardar
  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);

    try {
      // Preparar datos para enviar (sin campos vacíos en bankInfo)
      const dataToSend = {
        name: formData.name.trim(),
        type: formData.type,
        requiresProof: formData.requiresProof,
        icon: formData.icon,
      };

      // Solo incluir bankInfo si hay al menos un campo lleno
      const bankInfoFields = Object.values(formData.bankInfo).filter(v => v && v.trim());
      if (bankInfoFields.length > 0) {
        dataToSend.bankInfo = Object.fromEntries(
          Object.entries(formData.bankInfo).filter(([_, v]) => v && v.trim())
        );
      }

      // Incluir metadata si hay descripción
      if (formData.metadata.description.trim()) {
        dataToSend.metadata = {
          description: formData.metadata.description.trim(),
        };
      }

      await onSave(dataToSend);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el método de pago');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  // Determinar si mostrar campos bancarios
  const showBankFields = ['TRANSFER', 'QR'].includes(formData.type) || formData.requiresProof;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
            </Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Nombre */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Nombre del Método <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Ej: Yape, Plin, Efectivo"
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Tipo */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Tipo <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.pickerContainer, errors.type && styles.inputError]}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={updateType}
                  style={styles.picker}
                >
                  {paymentTypes.map((type) => (
                    <Picker.Item key={type.value} label={type.label} value={type.value} />
                  ))}
                </Picker>
              </View>
              {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
            </View>

            {/* Icono */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Icono</Text>
              <View style={styles.iconSelector}>
                {availableIcons.map((iconName) => (
                  <TouchableOpacity
                    key={iconName}
                    onPress={() => updateField('icon', iconName)}
                    style={[
                      styles.iconOption,
                      formData.icon === iconName && styles.iconOptionSelected,
                    ]}
                  >
                    <Ionicons name={iconName} size={24} color={formData.icon === iconName ? '#fff' : '#6b7280'} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Requiere Comprobante */}
            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <View style={styles.switchLabel}>
                  <Text style={styles.label}>¿Requiere comprobante?</Text>
                  <Text style={styles.hint}>
                    Se solicitará foto/PDF del comprobante al registrar pago
                  </Text>
                </View>
                <Switch
                  value={formData.requiresProof}
                  onValueChange={(value) => updateField('requiresProof', value)}
                  trackColor={{ false: '#d1d5db', true: '#86efac' }}
                  thumbColor={formData.requiresProof ? '#10b981' : '#f3f4f6'}
                />
              </View>
            </View>

            {/* Información Bancaria (condicional) */}
            {showBankFields && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información Bancaria</Text>

                {formData.type === 'TRANSFER' && (
                  <>
                    <View style={styles.formGroup}>
                      <Text style={styles.label}>
                        Nombre del Banco {formData.type === 'TRANSFER' && <Text style={styles.required}>*</Text>}
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: BCP, BBVA, Interbank"
                        value={formData.bankInfo.bankName}
                        onChangeText={(text) => updateBankInfo('bankName', text)}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>
                        Número de Cuenta <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        style={[styles.input, errors.accountNumber && styles.inputError]}
                        placeholder="1234567890"
                        keyboardType="numeric"
                        value={formData.bankInfo.accountNumber}
                        onChangeText={(text) => updateBankInfo('accountNumber', text)}
                      />
                      {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Tipo de Cuenta</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Cuenta Corriente, Ahorros, etc."
                        value={formData.bankInfo.accountType}
                        onChangeText={(text) => updateBankInfo('accountType', text)}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>CCI (opcional)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="00211200123456789012"
                        keyboardType="numeric"
                        value={formData.bankInfo.cci}
                        onChangeText={(text) => updateBankInfo('cci', text)}
                      />
                    </View>
                  </>
                )}

                {formData.type === 'QR' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>
                      Teléfono <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.input, errors.phoneNumber && styles.inputError]}
                      placeholder="+51987654321"
                      keyboardType="phone-pad"
                      value={formData.bankInfo.phoneNumber}
                      onChangeText={(text) => updateBankInfo('phoneNumber', text)}
                    />
                    {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                  </View>
                )}

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Titular</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre del titular"
                    value={formData.bankInfo.holderName}
                    onChangeText={(text) => updateBankInfo('holderName', text)}
                  />
                </View>
              </View>
            )}

            {/* Descripción */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notas adicionales sobre este método de pago"
                multiline
                numberOfLines={3}
                value={formData.metadata.description}
                onChangeText={(text) => updateField('metadata', { description: text })}
              />
            </View>
          </ScrollView>

          {/* Footer con botones */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.button, styles.cancelButton]}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.button, styles.saveButton]}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  iconSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    flex: 1,
    marginRight: 12,
  },
  section: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
