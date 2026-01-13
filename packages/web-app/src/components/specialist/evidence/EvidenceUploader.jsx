import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  PhotoIcon, 
  XMarkIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

/**
 * Componente para subir evidencias fotográficas
 * Soporta antes/después del procedimiento
 */
export default function EvidenceUploader({ 
  appointmentId, 
  type = 'before', // 'before' | 'after' | 'process'
  onUploadComplete,
  existingEvidence = []
}) {
  const { token } = useSelector(state => state.auth);
  const [evidence, setEvidence] = useState(existingEvidence);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const maxFiles = type === 'process' ? 10 : 5;

  const getTypeTitle = () => {
    const titles = {
      before: 'Fotos Antes',
      after: 'Fotos Después',
      process: 'Fotos del Proceso'
    };
    return titles[type] || 'Evidencias';
  };

  const getTypeDescription = () => {
    const descriptions = {
      before: 'Captura el estado inicial del cliente',
      after: 'Captura el resultado final',
      process: 'Documenta el proceso completo'
    };
    return descriptions[type] || 'Sube imágenes';
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (evidence.length + files.length > maxFiles) {
      alert(`Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    for (const file of files) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    try {
      setUploading(true);

      // Preparar FormData para enviar al backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Enviar al backend que manejará la subida a Cloudinary
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointmentId}/evidence/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error subiendo archivo');
      }

      const savedEvidence = await response.json();
      
      setEvidence(prev => [...prev, savedEvidence.data]);
      
      if (onUploadComplete) {
        onUploadComplete(savedEvidence.data);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (evidenceItem) => {
    if (!window.confirm('¿Eliminar esta evidencia?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments/${appointmentId}/evidence/${evidenceItem.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Error eliminando evidencia');

      setEvidence(prev => prev.filter(e => e.id !== evidenceItem.id));
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast.error('Error al eliminar la evidencia');
    }
  };

  const openImageModal = (evidenceItem) => {
    setSelectedImage(evidenceItem);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{getTypeTitle()}</h3>
          <p className="text-sm text-gray-600">{getTypeDescription()}</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || evidence.length >= maxFiles}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Subiendo...
            </>
          ) : (
            <>
              <ArrowUpTrayIcon className="w-5 h-5" />
              Subir Foto
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Grid de Imágenes */}
      {evidence.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {evidence.map((item, index) => (
            <div key={item.id || index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={item.url}
                  alt={`Evidencia ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <button
                  onClick={() => openImageModal(item)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                >
                  <EyeIcon className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ))}

          {/* Loading Placeholder */}
          {uploading && (
            <div className="aspect-square rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-xs text-gray-600">Subiendo...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-1">No hay evidencias</p>
          <p className="text-sm text-gray-500">Sube fotos del {type === 'before' ? 'estado inicial' : 'resultado'}</p>
        </div>
      )}

      {/* Contador */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        {evidence.length} / {maxFiles} fotos
      </div>

      {/* Modal de Imagen */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <img
              src={selectedImage.url}
              alt="Evidencia"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
