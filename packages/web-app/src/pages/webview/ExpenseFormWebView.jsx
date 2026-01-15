import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchExpenseCategories,
  createExpense,
  selectExpenseCategories,
  selectExpensesLoading,
  selectUserBranches,
  selectUserHasMultipleBranches
} from '@shared';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

/**
 * Componente standalone para cargar gastos desde la app móvil via WebView
 * Este componente está optimizado para uso en mobile y permite a recepcionistas
 * registrar gastos del negocio sin ver los totales o estadísticas
 */
const ExpenseFormWebView = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectExpenseCategories);
  const loading = useSelector(selectExpensesLoading);
  const userBranches = useSelector(selectUserBranches);
  const hasMultipleBranches = useSelector(selectUserHasMultipleBranches);

  const [businessId, setBusinessId] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    expenseDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    vendor: '',
    paymentMethod: 'CASH',
    receiptNumber: '',
    notes: '',
    branchId: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  // Obtener businessId desde URL params o mensaje de React Native
  useEffect(() => {
    // Desde URL params
    const urlParams = new URLSearchParams(window.location.search);
    const bId = urlParams.get('businessId');
    const token = urlParams.get('token');
    
    if (bId) {
      setBusinessId(bId);
      dispatch(fetchExpenseCategories({ businessId: bId }));
    }

    // Si viene token en la URL, guardarlo en sessionStorage
    if (token) {
      sessionStorage.setItem('bc_auth_token', token);
      // También en el objeto global para compatibilidad
      window.__BC_AUTH_TOKEN__ = token;
      console.log('✅ Token recibido vía URL y guardado');
    }

    // Escuchar mensajes desde React Native
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Recibir businessId
        if (data.type === 'BUSINESS_ID' && data.businessId) {
          setBusinessId(data.businessId);
          dispatch(fetchExpenseCategories({ businessId: data.businessId }));
        }
        
        // Recibir token de autenticación
        if (data.type === 'AUTH_TOKEN' && data.token) {
          sessionStorage.setItem('bc_auth_token', data.token);
          window.__BC_AUTH_TOKEN__ = data.token;
          console.log('✅ Token recibido vía mensaje y guardado');
        }

        // Recibir ambos en un solo mensaje
        if (data.type === 'INIT' || data.type === 'CONFIG') {
          if (data.businessId) {
            setBusinessId(data.businessId);
            dispatch(fetchExpenseCategories({ businessId: data.businessId }));
          }
          if (data.token) {
            sessionStorage.setItem('bc_auth_token', data.token);
            window.__BC_AUTH_TOKEN__ = data.token;
            console.log('✅ Token recibido en init y guardado');
          }
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage); // Para Android

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage);
    };
  }, [dispatch]);

  // Notificar a React Native cuando se complete una acción
  const sendMessageToReactNative = (message) => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          file: 'Solo se permiten imágenes (JPG, PNG, WEBP) o archivos PDF' 
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          file: 'El archivo no debe superar los 5MB' 
        }));
        return;
      }

      setSelectedFile(file);
      setErrors(prev => ({ ...prev, file: '' }));

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
    
    if (!businessId) {
      setErrors({ form: 'No se pudo identificar el negocio' });
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      if (selectedFile) {
        submitData.append('receipt', selectedFile);
      }

      await dispatch(createExpense({ 
        businessId, 
        expenseData: submitData 
      })).unwrap();

      setSubmitStatus('success');
      
      // Notificar a React Native
      sendMessageToReactNative({
        type: 'EXPENSE_CREATED',
        success: true
      });

      // Reset form después de 2 segundos
      setTimeout(() => {
        setFormData({
          categoryId: '',
          amount: '',
          expenseDate: format(new Date(), 'yyyy-MM-dd'),
          description: '',
          vendor: '',
          paymentMethod: 'CASH',
          receiptNumber: '',
          notes: '',
          branchId: ''
        });
        setSelectedFile(null);
        setFilePreview(null);
        setSubmitStatus(null);
      }, 2000);

    } catch (error) {
      console.error('Error creating expense:', error);
      setSubmitStatus('error');
      setErrors({ form: error.message || 'Error al crear el gasto' });
      
      sendMessageToReactNative({
        type: 'EXPENSE_CREATED',
        success: false,
        error: error.message
      });
    }
  };

  if (!businessId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-t-lg px-6 py-4 shadow-lg">
          <h1 className="text-xl font-bold text-white">📱 Registrar Gasto</h1>
          <p className="text-sm text-pink-100 mt-1">
            Completa la información del gasto del negocio
          </p>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-green-800">¡Gasto registrado exitosamente!</p>
              <p className="text-sm text-green-600">El formulario se limpiará automáticamente</p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center">
            <XCircleIcon className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <p className="font-medium text-red-800">Error al registrar el gasto</p>
              <p className="text-sm text-red-600">{errors.form}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-lg shadow-lg p-6">
          <div className="space-y-4">
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
                className={`w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
              )}
            </div>

            {/* Monto y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Monto <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500 text-lg">$</span>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
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
                  className={`w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
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
                className={`w-full px-4 py-3 border rounded-lg text-base focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Sucursal (si hay múltiples) */}
            {hasMultipleBranches && (
              <div>
                <label htmlFor="branchId" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  Sucursal
                </label>
                <select
                  id="branchId"
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="">Gasto general del negocio</option>
                  {userBranches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Si no seleccionas sucursal, el gasto será general del negocio
                </p>
              </div>
            )}

            {/* Proveedor */}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            {/* Método de Pago */}
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="CASH">Efectivo</option>
                <option value="CREDIT_CARD">Tarjeta de Crédito</option>
                <option value="DEBIT_CARD">Tarjeta de Débito</option>
                <option value="BANK_TRANSFER">Transferencia</option>
                <option value="DIGITAL_WALLET">Billetera Digital</option>
                <option value="CHECK">Cheque</option>
              </select>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            {/* Comprobante */}
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
                        className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500"
                      >
                        <span className="px-2">Subir archivo</span>
                        <input
                          id="receipt-file"
                          name="receipt-file"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                          onChange={handleFileSelect}
                          className="sr-only"
                        />
                      </label>
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
                        <DocumentIcon className="h-12 w-12 text-red-500" />
                      ) : (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedFile?.name}
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
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <TrashIcon className="h-6 w-6" />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-pink-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Guardando...
                </>
              ) : (
                'Registrar Gasto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormWebView;
