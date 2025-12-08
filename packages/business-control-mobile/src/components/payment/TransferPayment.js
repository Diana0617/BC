// =====================================================
// TRANSFER PAYMENT - Componente para pagos por transferencia
// =====================================================
// Muestra información bancaria y permite subir comprobante
// =====================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';

const TransferPayment = ({
  method,
  amount,
  appointment,
  onSuccess,
  onCancel
}) => {
  const [reference, setReference] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copiado', 'Información copiada al portapapeles');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos permisos para acceder a tus fotos'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProofImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permisos necesarios',
        'Necesitamos permisos para usar la cámara'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProofImage(result.assets[0]);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Agregar comprobante',
      'Selecciona una opción',
      [
        { text: 'Cámara', onPress: takePhoto },
        { text: 'Galería', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!reference.trim()) {
      Alert.alert('Error', 'Por favor ingresa el número de referencia');
      return;
    }

    if (method.requiresProof && !proofImage) {
      Alert.alert('Error', 'Este método requiere comprobante de pago');
      return;
    }

    setUploading(true);

    try {
      let proofUrl = null;
      
      if (proofImage) {
        // Aquí subirías la imagen a tu servicio de storage
        // proofUrl = await uploadImage(proofImage);
        proofUrl = proofImage.uri; // Temporal
      }

      const transferData = {
        reference: reference.trim(),
        proofUrl,
        bankInfo: method.bankInfo
      };

      onSuccess?.(transferData);
    } catch (error) {
      console.error('Error processing transfer:', error);
      Alert.alert('Error', 'No se pudo procesar el pago');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transferencia Bancaria</Text>
        <Text style={styles.methodName}>{method.name}</Text>
      </View>

      {/* Monto */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Monto a transferir</Text>
        <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
      </View>

      {/* Información Bancaria */}
      <View style={styles.bankCard}>
        <View style={styles.bankHeader}>
          <Ionicons name="business-outline" size={24} color="#3b82f6" />
          <Text style={styles.bankTitle}>Datos bancarios</Text>
        </View>

        {method.bankInfo?.bankName && (
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Banco:</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => copyToClipboard(method.bankInfo.bankName)}
            >
              <Text style={styles.bankValue}>{method.bankInfo.bankName}</Text>
              <Ionicons name="copy-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {method.bankInfo?.accountType && (
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Tipo:</Text>
            <Text style={styles.bankValue}>{method.bankInfo.accountType}</Text>
          </View>
        )}

        {method.bankInfo?.accountNumber && (
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Cuenta:</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => copyToClipboard(method.bankInfo.accountNumber)}
            >
              <Text style={styles.bankValue}>{method.bankInfo.accountNumber}</Text>
              <Ionicons name="copy-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {method.bankInfo?.accountHolder && (
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Titular:</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => copyToClipboard(method.bankInfo.accountHolder)}
            >
              <Text style={styles.bankValue}>{method.bankInfo.accountHolder}</Text>
              <Ionicons name="copy-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {method.bankInfo?.documentNumber && (
          <View style={styles.bankRow}>
            <Text style={styles.bankLabel}>Documento:</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => copyToClipboard(method.bankInfo.documentNumber)}
            >
              <Text style={styles.bankValue}>{method.bankInfo.documentNumber}</Text>
              <Ionicons name="copy-outline" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Número de referencia */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Número de referencia *</Text>
        <TextInput
          style={styles.textInput}
          value={reference}
          onChangeText={setReference}
          placeholder="Ingresa el número de referencia"
          placeholderTextColor="#9ca3af"
        />
        <Text style={styles.inputHelp}>
          Este número aparece en el comprobante del banco
        </Text>
      </View>

      {/* Comprobante */}
      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>
          Comprobante de pago {method.requiresProof && '*'}
        </Text>
        
        {proofImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: proofImage.uri }} style={styles.proofImage} />
            <TouchableOpacity 
              style={styles.changeImageButton}
              onPress={showImageOptions}
            >
              <Ionicons name="pencil" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={showImageOptions}
          >
            <Ionicons name="camera-outline" size={32} color="#6b7280" />
            <Text style={styles.uploadText}>Agregar comprobante</Text>
            <Text style={styles.uploadHelp}>Foto o imagen del comprobante</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Instrucciones */}
      <View style={styles.instructionsCard}>
        <View style={styles.instructionsHeader}>
          <Ionicons name="information-circle-outline" size={20} color="#3b82f6" />
          <Text style={styles.instructionsTitle}>Instrucciones</Text>
        </View>
        <Text style={styles.instructionsText}>
          1. Realiza la transferencia a la cuenta mostrada arriba{'\n'}
          2. Guarda el comprobante de la transferencia{'\n'}
          3. Ingresa el número de referencia{'\n'}
          4. Sube una foto del comprobante{'\n'}
          5. Confirma el registro del pago
        </Text>
      </View>

      {/* Botones */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={uploading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={handleSubmit}
          disabled={uploading || !reference.trim()}
        >
          <Text style={styles.confirmButtonText}>
            {uploading ? 'Procesando...' : 'Registrar Pago'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  header: {
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },

  methodName: {
    fontSize: 16,
    color: '#6b7280',
  },

  amountCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },

  amountLabel: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 4,
  },

  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },

  bankCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  bankTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },

  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },

  bankLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  bankValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },

  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },

  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937',
  },

  inputHelp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  imageContainer: {
    position: 'relative',
    alignSelf: 'center',
  },

  proofImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },

  changeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 32,
    alignItems: 'center',
  },

  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginTop: 8,
  },

  uploadHelp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  instructionsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },

  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },

  instructionsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },

  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },

  confirmButton: {
    backgroundColor: '#10b981',
  },

  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default TransferPayment;