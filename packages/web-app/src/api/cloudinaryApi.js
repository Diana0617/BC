import { apiClient } from './auth';

/**
 * API para subir archivos a Cloudinary
 */
export const cloudinaryApi = {
  
  /**
   * Subir archivo (imagen o PDF) de factura de proveedor
   * @param {string} businessId - ID del negocio
   * @param {File} file - Archivo a subir
   * @param {string} invoiceNumber - Número de factura (opcional, para nombrar el archivo)
   */
 uploadInvoiceFile: async (businessId, file, invoiceNumber = null) => {
  console.log('📤 Subiendo archivo:', { file, invoiceNumber, type: file?.type, size: file?.size });
  
  const formData = new FormData();
  formData.append('file', file);
  if (invoiceNumber) {
    formData.append('invoiceNumber', invoiceNumber);
  }

  console.log('📦 FormData creado:', formData);
  console.log('🔍 ¿Es FormData?', formData instanceof FormData);

  // NO establecer Content-Type manualmente, el navegador lo hará con el boundary correcto
  const response = await apiClient.post(
    `/api/business/${businessId}/upload/invoice`,
    formData
  );
  return response.data;
},

  /**
   * Subir imagen de producto
   * @param {string} businessId - ID del negocio
   * @param {File} file - Imagen a subir
   * @param {string} productName - Nombre del producto (opcional, para nombrar el archivo)
   */
  uploadProductImage: async (businessId, file, productName = null) => {
    console.log('📤 Subiendo imagen de producto:', { file, productName, type: file?.type, size: file?.size });
    
    const formData = new FormData();
    formData.append('file', file);
    if (productName) {
      formData.append('productName', productName);
    }

    const response = await apiClient.post(
      `/api/business/${businessId}/upload/product-image`,
      formData
    );
    return response.data;
  },

  /**
   * Subir comprobante de pago (para reservas online)
   * @param {File} file - Imagen del comprobante
   * @param {string} bookingReference - Referencia de la reserva (opcional, para nombrar el archivo)
   */
  uploadPaymentProof: async (file, bookingReference = null) => {
    console.log('📤 Subiendo comprobante de pago:', { file, bookingReference, type: file?.type, size: file?.size });
    
    const formData = new FormData();
    formData.append('file', file);
    if (bookingReference) {
      formData.append('bookingReference', bookingReference);
    }

    // Endpoint público para subir comprobantes
    const response = await apiClient.post(
      '/api/public/bookings/upload-payment-proof',
      formData
    );
    return response.data;
  },

  /**
   * Subir imagen de código QR para métodos de pago
   * @param {string} businessId - ID del negocio
   * @param {File} file - Imagen del código QR
   * @param {string} methodName - Nombre del método de pago (opcional, para nombrar el archivo)
   */
  uploadQRImage: async (businessId, file, methodName = null) => {
    console.log('📤 Subiendo imagen QR:', { file, methodName, type: file?.type, size: file?.size });
    
    const formData = new FormData();
    formData.append('file', file);
    if (methodName) {
      formData.append('methodName', methodName);
    }

    const response = await apiClient.post(
      `/api/business/${businessId}/upload/qr-image`,
      formData
    );
    return response.data;
  },

  /**
   * Eliminar archivo de Cloudinary
   * @param {string} businessId - ID del negocio
   * @param {string} publicId - Public ID del archivo en Cloudinary
   */
  deleteFile: async (businessId, publicId) => {
    const response = await apiClient.delete(
      `/api/business/${businessId}/upload/file`,
      {
        data: { publicId }
      }
    );
    return response.data;
  }
};

export default cloudinaryApi;
