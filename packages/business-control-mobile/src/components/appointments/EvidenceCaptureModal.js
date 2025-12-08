import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

/**
 * Modal para capturar evidencia fotográfica del procedimiento
 * Organiza fotos en: Antes, Después, Documentos
 */
const EvidenceCaptureModal = ({
  visible,
  onClose,
  onSave,
  initialEvidence = { before: [], after: [], documents: [] },
  appointment
}) => {
  const [activeTab, setActiveTab] = useState('after'); // Por defecto "Después"
  const [evidence, setEvidence] = useState(initialEvidence);
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

  /**
   * Capturar foto con cámara
   */
  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        addImageToEvidence(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al capturar foto:', error);
      Alert.alert('Error', 'No se pudo capturar la foto');
    }
  };

  /**
   * Seleccionar foto de galería
   */
  const handlePickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Deshabilitado para evitar problemas en Android
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        result.assets.forEach(asset => {
          addImageToEvidence(asset.uri);
        });
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  /**
   * Agregar imagen al array correspondiente
   */
  const addImageToEvidence = (uri) => {
    setEvidence(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], uri]
    }));
  };

  /**
   * Eliminar imagen del array
   */
  const removeImage = (index) => {
    Alert.alert(
      'Eliminar foto',
      '¿Estás seguro de eliminar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setEvidence(prev => ({
              ...prev,
              [activeTab]: prev[activeTab].filter((_, i) => i !== index)
            }));
          }
        }
      ]
    );
  };

  /**
   * Guardar evidencia
   */
  const handleSave = async () => {
    const totalPhotos = evidence.before.length + evidence.after.length + evidence.documents.length;
    
    if (totalPhotos === 0) {
      Alert.alert(
        'Sin fotos',
        '¿Deseas continuar sin capturar ninguna foto?',
        [
          { text: 'Volver', style: 'cancel' },
          { text: 'Continuar', onPress: () => onSave(evidence) }
        ]
      );
      return;
    }

    setUploading(true);
    try {
      await onSave(evidence);
    } catch (error) {
      console.error('Error al guardar evidencia:', error);
      Alert.alert('Error', 'No se pudo guardar la evidencia');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Renderizar tab button
   */
  const renderTabButton = (tab, label, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={activeTab === tab ? '#3b82f6' : '#6b7280'} 
      />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
        {label}
      </Text>
      {evidence[tab].length > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{evidence[tab].length}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  /**
   * Renderizar galería de fotos
   */
  const renderGallery = () => {
    const images = evidence[activeTab];

    if (images.length === 0) {
      return (
        <View style={styles.emptyGallery}>
          <Ionicons name="images-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>
            {activeTab === 'before' 
              ? 'No hay fotos del estado inicial'
              : activeTab === 'after'
              ? 'No hay fotos del resultado'
              : 'No hay documentos adjuntos'}
          </Text>
          <Text style={styles.emptySubtext}>
            Usa los botones de abajo para capturar o seleccionar fotos
          </Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.gallery}
        contentContainerStyle={styles.galleryContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageGrid}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

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
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Captura de Evidencia</Text>
              {appointment && (
                <Text style={styles.headerSubtitle}>
                  {appointment.service?.name || 'Procedimiento'}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {renderTabButton('before', 'Antes', 'arrow-back-circle-outline')}
            {renderTabButton('after', 'Después', 'arrow-forward-circle-outline')}
            {renderTabButton('documents', 'Docs', 'document-text-outline')}
          </View>

          {/* Gallery */}
          <View style={styles.content}>
            {renderGallery()}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <View style={styles.captureButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cameraButton]}
                onPress={handleTakePhoto}
                disabled={uploading}
              >
                <Ionicons name="camera" size={24} color="#ffffff" />
                <Text style={styles.actionButtonText}>Cámara</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.galleryButton]}
                onPress={handlePickImage}
                disabled={uploading}
              >
                <Ionicons name="images" size={24} color="#ffffff" />
                <Text style={styles.actionButtonText}>Galería</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, uploading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                  <Text style={styles.saveButtonText}>
                    Continuar {evidence.before.length + evidence.after.length + evidence.documents.length > 0 
                      ? `(${evidence.before.length + evidence.after.length + evidence.documents.length} fotos)` 
                      : ''}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
    height: '90%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    gap: 8,
  },
  tabButtonActive: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabButtonTextActive: {
    color: '#3b82f6',
  },
  badge: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  emptyGallery: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  gallery: {
    flex: 1,
  },
  galleryContent: {
    padding: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    width: (width - 56) / 2,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    gap: 12,
  },
  captureButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cameraButton: {
    backgroundColor: '#8b5cf6',
  },
  galleryButton: {
    backgroundColor: '#06b6d4',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#10b981',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default EvidenceCaptureModal;
