import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  XIcon,
  UploadIcon,
  ImageIcon,
  TrashIcon,
  CheckCircleIcon
} from 'lucide-react';
import productApi from '../../../../api/productApi';

const UploadImageModal = ({ product, onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await productApi.uploadProductImage(
        user.businessId,
        product.id,
        formData
      );

      if (response.success) {
        setSelectedFile(null);
        setPreviewUrl(null);
        onSuccess();
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageIndex) => {
    if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) {
      return;
    }

    try {
      setDeleting(imageIndex);
      setError(null);

      const response = await productApi.deleteProductImage(
        user.businessId,
        product.id,
        imageIndex
      );

      if (response.success) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err.message || 'Error al eliminar la imagen');
    } finally {
      setDeleting(null);
    }
  };

  const existingImages = product.images || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              Gestionar Imágenes
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Upload Section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Subir Nueva Imagen</h4>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {!previewUrl ? (
                <label className="flex flex-col items-center cursor-pointer">
                  <UploadIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 mb-1">
                    Haz clic para seleccionar una imagen
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, WEBP hasta 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <UploadIcon className="h-5 w-5" />
                    {uploading ? 'Subiendo...' : 'Subir Imagen'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Imágenes Actuales ({existingImages.length})
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.thumbnail?.url || image.main?.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                        Principal
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteImage(index)}
                      disabled={deleting === index}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting === index ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingImages.length === 0 && !previewUrl && (
            <div className="text-center py-8">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                Este producto no tiene imágenes
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadImageModal;
