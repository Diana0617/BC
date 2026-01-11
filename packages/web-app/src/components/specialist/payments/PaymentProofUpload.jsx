import React, { useState } from 'react';
import { 
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

/**
 * Componente para subir comprobantes de pago (transferencias, efectivo, etc)
 * Integración con Cloudinary
 */
export default function PaymentProofUpload({ 
  onUpload, 
  onCancel,
  maxFiles = 3 
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState(0);

  const CLOUDINARY_UPLOAD_PRESET = 'beauty_control';
  const CLOUDINARY_CLOUD_NAME = 'dxfgdwmwd';

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    // Validar número de archivos
    if (uploadedUrls.length + files.length > maxFiles) {
      alert(`Solo puedes subir un máximo de ${maxFiles} comprobante(s)`);
      return;
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      alert('Solo se permiten archivos de imagen (JPG, PNG, WEBP)');
      return;
    }

    // Validar tamaño (5MB máximo por archivo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert('Las imágenes no deben superar 5MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      
      const newUrls = [...uploadedUrls, ...urls];
      setUploadedUrls(newUrls);
      
      // Si solo hay una imagen, usarla directamente
      if (newUrls.length === 1) {
        onUpload(newUrls[0]);
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('Error al subir el comprobante. Intenta nuevamente.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'payment_proofs');

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
      xhr.send(formData);
    });
  };

  const handleRemoveImage = (index) => {
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    setUploadedUrls(newUrls);
  };

  const handleConfirm = () => {
    if (uploadedUrls.length === 0) {
      alert('Por favor sube al menos un comprobante');
      return;
    }

    // Si hay múltiples imágenes, enviar un array
    onUpload(uploadedUrls.length === 1 ? uploadedUrls[0] : uploadedUrls);
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      {uploadedUrls.length < maxFiles && (
        <div className="relative">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple={maxFiles > 1}
            onChange={handleFileSelect}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            id="proof-upload"
          />
          <label
            htmlFor="proof-upload"
            className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              uploading 
                ? 'border-gray-300 bg-gray-50' 
                : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            <ArrowUpTrayIcon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="font-medium text-blue-600 mb-1">
              {uploading ? 'Subiendo...' : 'Seleccionar Comprobante'}
            </p>
            <p className="text-sm text-gray-500">
              JPG, PNG o WEBP (máx. 5MB)
            </p>
            {maxFiles > 1 && (
              <p className="text-xs text-gray-400 mt-2">
                Puedes subir hasta {maxFiles} archivos
              </p>
            )}
          </label>
        </div>
      )}

      {/* Barra de Progreso */}
      {uploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-center text-gray-600">
            {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Imágenes Subidas */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Comprobante{uploadedUrls.length > 1 ? 's' : ''} Subido{uploadedUrls.length > 1 ? 's' : ''}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Comprobante ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer"
                  onClick={() => setPreviewUrl(url)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          disabled={uploading}
          className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={uploading || uploadedUrls.length === 0}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCircleIcon className="w-5 h-5" />
          Confirmar
        </button>
      </div>

      {/* Modal de Preview */}
      {previewUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl('')}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewUrl('')}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* Información */}
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-xs text-blue-700 flex items-start gap-2">
          <PhotoIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Asegúrate de que el comprobante sea claro y legible. 
            Debe incluir el monto, fecha y referencia de la transacción.
          </span>
        </p>
      </div>
    </div>
  );
}
