import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert, 
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video } from 'expo-av';

const { width: screenWidth } = Dimensions.get('window');

const EvidenceUploader = ({ 
  appointmentId, 
  type = 'before', // 'before' | 'after' | 'process'
  onUploadComplete,
  onUploadError,
  existingEvidence = []
}) => {
  const [evidence, setEvidence] = useState(existingEvidence);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const maxFiles = type === 'process' ? 10 : 5; // Más archivos para evidencia de proceso
  const allowedTypes = ['image', 'video']; // PDFs solo para consentimientos

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    // Solicitar permisos para cámara y galería
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'La aplicación necesita acceso a la cámara y galería para subir evidencias'
      );
    }
  };

  const showUploadOptions = () => {
    Alert.alert(
      'Seleccionar evidencia',
      'Elige cómo quieres agregar la evidencia',
      [
        { text: 'Cámara', onPress: () => openCamera() },
        { text: 'Galería', onPress: () => openGallery() },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        videoMaxDuration: 60, // 60 segundos máximo para videos
      });

      if (!result.canceled && result.assets[0]) {
        await handleMediaSelected(result.assets[0]);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'No se pudo abrir la cámara');
    }
  };

  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        selectionLimit: maxFiles - evidence.length,
        allowsEditing: false,
        quality: 0.8,
        videoMaxDuration: 120, // 2 minutos máximo para videos de galería
      });

      if (!result.canceled && result.assets) {
        for (const asset of result.assets) {
          await handleMediaSelected(asset);
        }
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'No se pudo abrir la galería');
    }
  };

  const handleMediaSelected = async (asset) => {
    // Validar tamaño del archivo
    if (asset.fileSize > 100 * 1024 * 1024) { // 100MB
      Alert.alert('Archivo muy grande', 'El archivo no puede superar los 100MB');
      return;
    }

    // Validar tipo de archivo
    const isImage = asset.type === 'image';
    const isVideo = asset.type === 'video';
    
    if (!isImage && !isVideo) {
      Alert.alert('Formato no válido', 'Solo se permiten imágenes y videos');
      return;
    }

    // Validar límite de archivos
    if (evidence.length >= maxFiles) {
      Alert.alert('Límite alcanzado', `Solo puedes subir máximo ${maxFiles} archivos`);
      return;
    }

    await uploadToCloudinary(asset);
  };

  const uploadToCloudinary = async (asset) => {
    setUploading(true);
    
    try {
      // Crear FormData para envío
      const formData = new FormData();
      formData.append('evidence', {
        uri: asset.uri,
        type: asset.type === 'image' ? 'image/jpeg' : 'video/mp4',
        name: `evidence_${Date.now()}.${asset.type === 'image' ? 'jpg' : 'mp4'}`
      });

      // Llamar API del backend para upload con compresión automática
      const response = await fetch(
        `/api/appointments/${appointmentId}/evidence/${type}`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        const newEvidence = {
          id: Date.now(),
          type: asset.type,
          url: result.data.main?.url || result.data.url,
          thumbnail: result.data.thumbnail?.url,
          uploadedAt: new Date().toISOString(),
          originalName: asset.fileName || `evidence_${Date.now()}`,
          size: asset.fileSize,
          cloudinaryPublicId: result.data.main?.public_id || result.data.public_id
        };

        setEvidence(prev => [...prev, newEvidence]);
        
        if (onUploadComplete) {
          onUploadComplete(newEvidence);
        }

        Alert.alert('Éxito', 'Evidencia subida correctamente');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading evidence:', error);
      Alert.alert('Error', 'No se pudo subir la evidencia. Intenta de nuevo.');
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
    }
  };

  const deleteEvidence = async (evidenceItem) => {
    Alert.alert(
      'Eliminar evidencia',
      '¿Estás seguro de que quieres eliminar esta evidencia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => confirmDeleteEvidence(evidenceItem)
        }
      ]
    );
  };

  const confirmDeleteEvidence = async (evidenceItem) => {
    try {
      // Llamar API para eliminar de Cloudinary
      const response = await fetch(
        `/api/appointments/${appointmentId}/evidence/${evidenceItem.id}`, 
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        setEvidence(prev => prev.filter(item => item.id !== evidenceItem.id));
        Alert.alert('Éxito', 'Evidencia eliminada correctamente');
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting evidence:', error);
      Alert.alert('Error', 'No se pudo eliminar la evidencia');
    }
  };

  const openMediaModal = (evidenceItem) => {
    setSelectedMedia(evidenceItem);
    setModalVisible(true);
  };

  const renderEvidenceItem = (item, index) => {
    const isImage = item.type === 'image';
    const isVideo = item.type === 'video';

    return (
      <TouchableOpacity
        key={item.id || index}
        onPress={() => openMediaModal(item)}
        className="relative bg-gray-100 rounded-lg overflow-hidden mr-3 mb-3"
        style={{ width: screenWidth * 0.28, height: screenWidth * 0.28 }}
      >
        {isImage && (
          <Image
            source={{ uri: item.thumbnail || item.url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        )}
        
        {isVideo && (
          <View className="w-full h-full bg-gray-200 items-center justify-center">
            <Ionicons name="play-circle" size={40} color="#6B7280" />
          </View>
        )}

        {/* Overlay con información */}
        <View className="absolute top-1 right-1 bg-black/50 rounded px-1">
          <Text className="text-white text-xs">
            {isImage ? 'IMG' : 'VID'}
          </Text>
        </View>

        {/* Botón eliminar */}
        <TouchableOpacity
          onPress={() => deleteEvidence(item)}
          className="absolute top-1 left-1 bg-red-500 rounded-full p-1"
        >
          <Ionicons name="close" size={12} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderMediaModal = () => {
    if (!selectedMedia) return null;

    const isImage = selectedMedia.type === 'image';
    const isVideo = selectedMedia.type === 'video';

    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/90 items-center justify-center">
          <View className="w-full max-w-sm mx-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-medium">Evidencia</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-gray-800 rounded-full p-2"
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Media */}
            <View className="bg-white rounded-lg overflow-hidden mb-4">
              {isImage && (
                <Image
                  source={{ uri: selectedMedia.url }}
                  style={{ width: '100%', height: 300 }}
                  resizeMode="contain"
                />
              )}
              
              {isVideo && (
                <Video
                  source={{ uri: selectedMedia.url }}
                  style={{ width: '100%', height: 300 }}
                  shouldPlay={false}
                  useNativeControls
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Info */}
            <View className="bg-gray-800 rounded-lg p-3">
              <Text className="text-white text-sm mb-1">
                Tipo: {selectedMedia.type === 'image' ? 'Imagen' : 'Video'}
              </Text>
              <Text className="text-gray-300 text-xs">
                Subido: {new Date(selectedMedia.uploadedAt).toLocaleDateString()}
              </Text>
              {selectedMedia.size && (
                <Text className="text-gray-300 text-xs">
                  Tamaño: {(selectedMedia.size / 1024 / 1024).toFixed(1)} MB
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'before': return 'Evidencia - Antes';
      case 'after': return 'Evidencia - Después';
      case 'process': return 'Evidencia - Proceso';
      default: return 'Evidencia';
    }
  };

  const getTypeDescription = () => {
    switch (type) {
      case 'before': return 'Fotos del estado inicial del cliente';
      case 'after': return 'Fotos del resultado final del servicio';
      case 'process': return 'Fotos y videos del proceso durante el servicio';
      default: return 'Evidencia del servicio';
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-900 mb-1">
          {getTypeTitle()}
        </Text>
        <Text className="text-sm text-gray-600">
          {getTypeDescription()}
        </Text>
        <Text className="text-xs text-gray-500 mt-1">
          {evidence.length}/{maxFiles} archivos
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Grid de evidencias existentes */}
        {evidence.length > 0 && (
          <View className="mb-6">
            <View className="flex-row flex-wrap">
              {evidence.map((item, index) => renderEvidenceItem(item, index))}
            </View>
          </View>
        )}

        {/* Estado vacío */}
        {evidence.length === 0 && (
          <View className="items-center justify-center py-12">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 text-center mb-2">
              No hay evidencias subidas
            </Text>
            <Text className="text-gray-400 text-sm text-center">
              Toca el botón de agregar para subir fotos o videos
            </Text>
          </View>
        )}

        {/* Información sobre compresión automática */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={16} color="#3B82F6" />
            <Text className="text-blue-800 font-medium ml-2 text-sm">
              Compresión Automática
            </Text>
          </View>
          <Text className="text-blue-700 text-xs">
            Las imágenes grandes se comprimen automáticamente para optimizar el almacenamiento y la velocidad de carga.
          </Text>
        </View>
      </ScrollView>

      {/* Botón agregar evidencia */}
      {evidence.length < maxFiles && (
        <View className="p-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={showUploadOptions}
            disabled={uploading}
            className={`rounded-lg overflow-hidden ${uploading ? 'opacity-50' : ''}`}
          >
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              className="px-6 py-4 flex-row items-center justify-center"
            >
              {uploading ? (
                <>
                  <Ionicons name="cloud-upload-outline" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Subiendo...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Agregar Evidencia
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal para ver evidencia */}
      {renderMediaModal()}
    </View>
  );
};

export default EvidenceUploader;