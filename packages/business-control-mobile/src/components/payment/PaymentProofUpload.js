import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

/**
 * Componente para subir comprobante de pago
 * Se muestra cuando el método de pago requiere comprobante (requiresProof: true)
 */
const PaymentProofUpload = ({
  proofImage = null,
  onImageSelected,
  onImageRemoved,
  disabled = false,
  required = false
}) => {
  const [uploading, setUploading] = useState(false);

  // Solicitar permisos de cámara
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Se necesita permiso para acceder a la cámara'
      );
      return false;
    }
    return true;
  };

  // Solicitar permisos de galería
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Se necesita permiso para acceder a la galería'
      );
      return false;
    }
    return true;
  };

  // Tomar foto con cámara
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      setUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        onImageSelected(result.assets[0]);
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    } finally {
      setUploading(false);
    }
  };

  // Seleccionar de galería
  const pickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        onImageSelected(result.assets[0]);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    } finally {
      setUploading(false);
    }
  };

  // Mostrar opciones (cámara o galería)
  const showOptions = () => {
    Alert.alert(
      'Comprobante de pago',
      'Selecciona una opción',
      [
        {
          text: 'Tomar foto',
          onPress: takePhoto
        },
        {
          text: 'Seleccionar de galería',
          onPress: pickImage
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ],
      { cancelable: true }
    );
  };

  // Confirmar eliminación
  const confirmRemove = () => {
    Alert.alert(
      'Eliminar comprobante',
      '¿Estás seguro de eliminar el comprobante?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: onImageRemoved
        }
      ]
    );
  };

  if (uploading) {
    return (
      <View style={styles.uploadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.uploadingText}>Procesando imagen...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>
          Comprobante de pago {required && '*'}
        </Text>
        {required && (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>Requerido</Text>
          </View>
        )}
      </View>

      {proofImage ? (
        // Mostrar imagen seleccionada
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: proofImage.uri }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <TouchableOpacity
              style={[styles.imageButton, styles.changeButton]}
              onPress={showOptions}
              disabled={disabled}
            >
              <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
              <Text style={styles.imageButtonText}>Cambiar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.imageButton, styles.removeButton]}
              onPress={confirmRemove}
              disabled={disabled}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.imageButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Mostrar botón para agregar
        <TouchableOpacity
          style={[styles.uploadButton, disabled && styles.disabledButton]}
          onPress={showOptions}
          disabled={disabled}
        >
          <View style={styles.uploadIconContainer}>
            <Ionicons name="camera-outline" size={32} color="#8B5CF6" />
          </View>
          <Text style={styles.uploadTitle}>Agregar comprobante</Text>
          <Text style={styles.uploadSubtitle}>
            Toma una foto o selecciona de galería
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.helpContainer}>
        <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
        <Text style={styles.helpText}>
          El comprobante puede ser una foto del voucher, transferencia o captura
          de pantalla del pago
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  requiredBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  requiredText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626'
  },
  uploadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12
  },
  uploadingText: {
    fontSize: 14,
    color: '#6B7280'
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8
  },
  disabledButton: {
    opacity: 0.5
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937'
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center'
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6'
  },
  image: {
    width: '100%',
    height: 240
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6
  },
  changeButton: {
    backgroundColor: '#8B5CF6'
  },
  removeButton: {
    backgroundColor: '#EF4444'
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  helpContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16
  }
});

export default PaymentProofUpload;
