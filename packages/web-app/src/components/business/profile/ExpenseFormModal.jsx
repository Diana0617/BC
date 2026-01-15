import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  XMarkIcon,
  CloudArrowUpIcon,
  DocumentIcon,
  TrashIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { selectUserBranches, selectUserHasMultipleBranches } from '@shared';

const ExpenseFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  expense = null,
  categories = [],
  loading = false,
  isWebView = false // Para identificar si viene desde mobile
}) => {
  const userBranches = useSelector(selectUserBranches);
  const hasMultipleBranches = useSelector(selectUserHasMultipleBranches);

  const [formData, setFormData] = useState({
    categoryId: '',
    branchId: '', // Sucursal del gasto
    amount: '',
    expenseDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    vendor: '',
    paymentMethod: 'CASH',
    receiptNumber: '',
    notes: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (expense) {
      setFormData({
        categoryId: expense.categoryId || '',
        branchId: expense.branchId || '',
        amount: expense.amount || '',
        expenseDate: expense.expenseDate ? format(new Date(expense.expenseDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        description: expense.description || '',
        vendor: expense.vendor || '',
        paymentMethod: expense.paymentMethod || 'CASH',
        receiptNumber: expense.receiptNumber || '',
        notes: expense.notes || ''
      });
      if (expense.receiptUrl) {
        setFilePreview(expense.receiptUrl);
      }
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Si cambió la categoría, buscar sus detalles
    if (name === 'categoryId' && value) {
      const category = categories.find(cat => cat.id === value);
      setSelectedCategory(category);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          file: 'Solo se permiten imágenes (JPG, PNG, WEBP) o archivos PDF' 
        }));
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          file: 'El archivo no debe superar los 5MB' 
        }));
        return;
      }

      setSelectedFile(file);
      setErrors(prev => ({ ...prev, file: '' }));

      // Create preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview('pdf');
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    // Clear file input
    const fileInput = document.getElementById('receipt-file');
    if (fileInput) fileInput.value = '';
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Selecciona una categoría';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Ingresa un monto válido';
    }
    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Selecciona una fecha';
    }
    if (!formData.description || formData.description.trim().length < 3) {
      newErrors.description = 'La descripción debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const submitData = new FormData();
    
    // Append form data - incluir todos los campos, no solo los truthy
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value !== null && value !== undefined && value !== '') {
        submitData.append(key, value);
      }
    });

    // Append file if selected
    if (selectedFile) {
      submitData.append('receipt', selectedFile);
    }

    // Debug log
    console.log('📤 Enviando FormData con campos:');
    for (let pair of submitData.entries()) {
      console.log(`  ${pair[0]}: ${pair[1]}`);
    }

    await onSubmit(submitData, expense?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white" id="modal-title">
                {expense ? 'Editar Gasto' : 'Nuevo Gasto'}
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            {isWebView && (
              <p className="text-sm text-pink-100 mt-2">
                📱 Registro desde aplicación móvil
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="space-y-4">
              {/* Sucursal (solo si tiene múltiples) */}
              {hasMultipleBranches && (
                <div>
                  <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 mb-1">
                    <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                    Sucursal
                  </label>
                  <select
                    id="branchId"
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="">Gasto general del negocio</option>
                    {userBranches.map(ub => (
                      <option key={ub.branchId} value={ub.branchId}>
                        {ub.branch?.name || 'Sucursal sin nombre'}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Si no seleccionas sucursal, el gasto será general del negocio
                  </p>
                </div>
              )}

              {/* Categoría */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                    errors.categoryId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona una categoría</option>
                  {Array.isArray(categories) && categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                )}
              </div>

              {/* Mensaje de recomendación si la categoría requiere comprobante */}
              {selectedCategory?.requiresReceipt && !selectedFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start">
                  <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Comprobante recomendado
                    </p>
                    <p className="text-xs text-blue-600 mt-0.5">
                      La categoría "{selectedCategory.name}" recomienda adjuntar un comprobante de pago
                    </p>
                  </div>
                </div>
              )}

              {/* Monto y Fecha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Monto <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0"
                      step="0.01"
                      min="0"
                      className={`w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                        errors.amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="expenseDate"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.expenseDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.expenseDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expenseDate}</p>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe el gasto..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Proveedor y Método de Pago */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    id="vendor"
                    name="vendor"
                    value={formData.vendor}
                    onChange={handleChange}
                    placeholder="Nombre del proveedor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="CASH">Efectivo</option>
                    <option value="CREDIT_CARD">Tarjeta de Crédito</option>
                    <option value="DEBIT_CARD">Tarjeta de Débito</option>
                    <option value="BANK_TRANSFER">Transferencia</option>
                    <option value="DIGITAL_WALLET">Billetera Digital</option>
                    <option value="CHECK">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Número de Recibo */}
              <div>
                <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Recibo/Factura
                </label>
                <input
                  type="text"
                  id="receiptNumber"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={handleChange}
                  placeholder="Ej: FAC-001234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              {/* Archivo de Comprobante */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprobante (Opcional)
                </label>
                
                {!filePreview ? (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-pink-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="receipt-file"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                        >
                          <span>Subir archivo</span>
                          <input
                            id="receipt-file"
                            name="receipt-file"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                            onChange={handleFileSelect}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WEBP o PDF hasta 5MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {filePreview === 'pdf' ? (
                          <DocumentIcon className="h-10 w-10 text-red-500" />
                        ) : (
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedFile?.name || 'Archivo actual'}
                          </p>
                          {selectedFile && (
                            <p className="text-xs text-gray-500">
                              {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
                
                {errors.file && (
                  <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                )}
              </div>

              {/* Notas */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Información adicional..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  expense ? 'Actualizar Gasto' : 'Crear Gasto'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
