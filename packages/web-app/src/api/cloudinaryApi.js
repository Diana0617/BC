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
    const formData = new FormData();
    formData.append('file', file);
    if (invoiceNumber) {
      formData.append('invoiceNumber', invoiceNumber);
    }

    const response = await apiClient.post(
      `/api/business/${businessId}/upload/invoice`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
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
