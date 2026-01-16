import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  XIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
  FileIcon,
  AlertCircleIcon
} from 'lucide-react';
import supplierInvoiceApi from '../../../../api/supplierInvoiceApi';
import cloudinaryApi from '../../../../api/cloudinaryApi';
import { fetchProducts } from '@shared/store/slices/productsSlice';

const CreateInvoiceModal = ({ onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const { products } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  const [step, setStep] = useState(1); // 1: Proveedor, 2: Items, 3: Resumen
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Branch data
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Supplier data
  const [useExistingSupplier, setUseExistingSupplier] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [supplierData, setSupplierData] = useState({
    name: '',
    email: '',
    phone: '',
    taxId: '',
    address: '',
    city: '',
    country: 'Colombia',
    contactPerson: '',
    paymentTerms: 30
  });

  // Invoice data
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    currency: 'COP',
    taxIncluded: false, // Si el IVA está incluido en los precios
    taxPercentage: 19 // Porcentaje de IVA por defecto (Colombia)
  });

  // Items
  const [items, setItems] = useState([{
    productId: '',
    productName: '',
    sku: '',
    quantity: 1,
    unitCost: 0,
    salePrice: 0, // Precio de venta
    createProduct: false,
    productData: {
      name: '',
      sku: '',
      category: '',
      brand: '',
      unit: 'unidad'
    },
    images: [], // Array de URLs de imágenes para productos nuevos
    uploadingImage: false
  }]);

  // File upload
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    // Load products for selection
    dispatch(fetchProducts({ isActive: true, limit: 1000 }));
    // Load branches
    loadBranches();
  }, [dispatch]);

  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/business/${user.businessId}/branches`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setBranches(data.data || []);
        // Seleccionar la primera sucursal por defecto
        if (data.data && data.data.length > 0) {
          setSelectedBranchId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    // Load suppliers when using existing supplier
    if (useExistingSupplier) {
      loadSuppliers();
    }
  }, [useExistingSupplier]);

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await supplierInvoiceApi.getSuppliers(user.businessId, {
        status: 'ACTIVE',
        limit: 100
      });
      if (response.success) {
        setSuppliers(response.data.suppliers);
      }
    } catch (err) {
      console.error('Error loading suppliers:', err);
      setError('Error al cargar proveedores');
    } finally {
      setLoadingSuppliers(false);
    }
  };

  useEffect(() => {
    // Calculate due date based on payment terms
    if (invoiceData.issueDate && supplierData.paymentTerms) {
      const issueDate = new Date(invoiceData.issueDate);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + parseInt(supplierData.paymentTerms));
      setInvoiceData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0]
      }));
    }
  }, [invoiceData.issueDate, supplierData.paymentTerms]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten archivos PDF o imágenes (JPG, PNG)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo no debe superar los 10MB');
      return;
    }

    try {
      setUploadingFile(true);
      setError(null);

      const response = await cloudinaryApi.uploadInvoiceFile(
        user.businessId,
        file,
        invoiceData.invoiceNumber
      );

      if (response.success) {
        setUploadedFile({
          url: response.data.url,
          publicId: response.data.publicId,
          fileName: file.name,
          fileType: file.type
        });
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Error al subir el archivo');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = async () => {
    if (uploadedFile?.publicId) {
      try {
        await cloudinaryApi.deleteFile(user.businessId, uploadedFile.publicId);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    setUploadedFile(null);
  };

  const addItem = () => {
    setItems([...items, {
      productId: '',
      productName: '',
      sku: '',
      quantity: 1,
      unitCost: 0,
      salePrice: 0,
      createProduct: false,
      productData: {
        name: '',
        sku: '',
        category: '',
        brand: '',
        unit: 'unidad'
      },
      images: [],
      uploadingImage: false
    }]);
  };

  const handleProductImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten imágenes (JPG, PNG, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    try {
      const newItems = [...items];
      newItems[index].uploadingImage = true;
      setItems(newItems);
      setError(null);

      const response = await cloudinaryApi.uploadProductImage(
        user.businessId,
        file,
        items[index].productData.name || `product-${Date.now()}`
      );

      if (response.success) {
        const updatedItems = [...items];
        // Guardar en el formato esperado por el catálogo: { main: {...}, thumbnail: {...} }
        updatedItems[index].images = [
          ...updatedItems[index].images,
          response.data // Ya viene con main y thumbnail
        ];
        updatedItems[index].uploadingImage = false;
        setItems(updatedItems);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error al subir la imagen');
      const newItems = [...items];
      newItems[index].uploadingImage = false;
      setItems(newItems);
    }
  };

  const handleRemoveProductImage = async (itemIndex, imageIndex) => {
    const item = items[itemIndex];
    const image = item.images[imageIndex];

    // Eliminar ambas versiones (main y thumbnail) si existen
    try {
      if (image?.main?.public_id) {
        await cloudinaryApi.deleteFile(user.businessId, image.main.public_id);
      }
      if (image?.thumbnail?.public_id) {
        await cloudinaryApi.deleteFile(user.businessId, image.thumbnail.public_id);
      }
      // Soporte para formato antiguo (si existe)
      if (image?.publicId) {
        await cloudinaryApi.deleteFile(user.businessId, image.publicId);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
    }

    const newItems = [...items];
    newItems[itemIndex].images = newItems[itemIndex].images.filter((_, i) => i !== imageIndex);
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: value,
          productName: product.name,
          sku: product.sku,
          unitCost: parseFloat(product.cost) || 0,
          salePrice: parseFloat(product.price) || 0,
          createProduct: false
        };
      }
    } else if (field === 'createProduct') {
      newItems[index].createProduct = value;
      if (value) {
        newItems[index].productId = '';
      }
    } else if (field === 'unitCost') {
      newItems[index][field] = value;
      // Sugerir precio de venta solo si aún no se ha establecido manualmente
      if (newItems[index].salePrice === 0 || !newItems[index].salePriceManuallySet) {
        newItems[index].salePrice = (parseFloat(value) * 1.3).toFixed(2);
      }
    } else if (field === 'salePrice') {
      newItems[index][field] = value;
      newItems[index].salePriceManuallySet = true; // Marcar que fue establecido manualmente
    } else if (field.startsWith('productData.')) {
      const dataField = field.split('.')[1];
      newItems[index].productData[dataField] = value;
      if (dataField === 'name') {
        newItems[index].productName = value;
      }
      if (dataField === 'sku') {
        newItems[index].sku = value;
      }
    } else {
      newItems[index][field] = value;
    }
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => 
      sum + (parseFloat(item.quantity) * parseFloat(item.unitCost)), 0
    );
    
    let subtotal, tax, total;
    
    if (invoiceData.taxIncluded) {
      // Si el IVA está incluido, el total de items YA incluye el IVA
      total = itemsTotal;
      // Calcular el subtotal sin IVA: total / (1 + porcentaje/100)
      subtotal = total / (1 + (invoiceData.taxPercentage / 100));
      tax = total - subtotal;
    } else {
      // Si el IVA NO está incluido, el total de items es el subtotal
      subtotal = itemsTotal;
      tax = subtotal * (invoiceData.taxPercentage / 100);
      total = subtotal + tax;
    }
    
    return { subtotal, tax, total };
  };

  const validateStep1 = () => {
    if (!selectedBranchId) {
      setError('Debe seleccionar una sucursal destino');
      return false;
    }
    if (useExistingSupplier) {
      if (!selectedSupplierId) {
        setError('Debe seleccionar un proveedor');
        return false;
      }
    } else {
      if (!supplierData.name || !supplierData.taxId) {
        setError('El nombre y NIT del proveedor son requeridos');
        return false;
      }
    }
    if (!invoiceData.invoiceNumber || !invoiceData.issueDate || !invoiceData.dueDate) {
      setError('Número de factura y fechas son requeridos');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (items.length === 0) {
      setError('Debes agregar al menos un producto');
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.createProduct && !item.productId) {
        setError(`Item ${i + 1}: Debes seleccionar un producto o crear uno nuevo`);
        return false;
      }
      if (item.createProduct) {
        if (!item.productData.name || !item.productData.sku) {
          setError(`Item ${i + 1}: Nombre y SKU son requeridos para productos nuevos`);
          return false;
        }
      }
      if (item.quantity <= 0) {
        setError(`Item ${i + 1}: La cantidad debe ser mayor a 0`);
        return false;
      }
      if (item.unitCost <= 0) {
        setError(`Item ${i + 1}: El costo unitario debe ser mayor a 0`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const { subtotal, tax, total } = calculateTotal();

      // Prepare items data
      const processedItems = items.map(item => {
        const itemData = {
          quantity: parseFloat(item.quantity),
          unitCost: parseFloat(item.unitCost),
          total: parseFloat(item.quantity) * parseFloat(item.unitCost)
        };

        if (item.createProduct) {
          itemData.productData = {
            name: item.productData.name,
            sku: item.productData.sku,
            category: item.productData.category,
            brand: item.productData.brand,
            unit: item.productData.unit,
            price: parseFloat(item.salePrice) || (parseFloat(item.unitCost) * 1.3), // Usar precio de venta especificado o calcular 30% markup
            images: item.images || [] // Incluir imágenes del producto
          };
          itemData.productName = item.productData.name;
          itemData.sku = item.productData.sku;
        } else {
          itemData.productId = item.productId;
          itemData.productName = item.productName;
          itemData.sku = item.sku;
          // Incluir precio de venta para actualizar productos existentes si se especificó
          if (item.salePrice && parseFloat(item.salePrice) > 0) {
            itemData.salePrice = parseFloat(item.salePrice);
          }
        }

        return itemData;
      });

      const payload = {
        branchId: selectedBranchId, // Sucursal destino de la compra
        invoiceNumber: invoiceData.invoiceNumber,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        items: processedItems,
        subtotal,
        tax,
        taxIncluded: invoiceData.taxIncluded,
        taxPercentage: invoiceData.taxPercentage,
        total,
        currency: invoiceData.currency,
        notes: invoiceData.notes,
        attachments: uploadedFile ? [{
          url: uploadedFile.url,
          publicId: uploadedFile.publicId,
          fileName: uploadedFile.fileName,
          fileType: uploadedFile.fileType
        }] : []
      };

      if (useExistingSupplier) {
        payload.supplierId = selectedSupplierId;
      } else {
        payload.supplierData = supplierData;
      }

      const response = await supplierInvoiceApi.createInvoice(user.businessId, payload);

      if (response.success) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.response?.data?.message || 'Error al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nueva Factura de Proveedor</h2>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full ${
                    s <= step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Step 1: Supplier & Invoice Info */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Selector de Sucursal */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sucursal Destino
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    📦 Los productos de esta compra se agregarán al inventario de la sucursal seleccionada
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sucursal <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    disabled={loadingBranches}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">
                      {loadingBranches ? 'Cargando sucursales...' : 'Seleccionar sucursal...'}
                    </option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} {branch.code ? `(${branch.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información del Proveedor
                </h3>
                
                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useExistingSupplier}
                      onChange={(e) => setUseExistingSupplier(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Usar proveedor existente
                    </span>
                  </label>
                </div>

                {useExistingSupplier ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proveedor <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedSupplierId}
                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                        disabled={loadingSuppliers}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">
                          {loadingSuppliers ? 'Cargando...' : 'Seleccionar proveedor...'}
                        </option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name} {supplier.taxId ? `- ${supplier.taxId}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={supplierData.name}
                        onChange={(e) => setSupplierData({ ...supplierData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre del proveedor"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIT/ID Fiscal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={supplierData.taxId}
                        onChange={(e) => setSupplierData({ ...supplierData, taxId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="123456789-0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={supplierData.email}
                        onChange={(e) => setSupplierData({ ...supplierData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="proveedor@ejemplo.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={supplierData.phone}
                        onChange={(e) => setSupplierData({ ...supplierData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+57 300 123 4567"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={supplierData.address}
                        onChange={(e) => setSupplierData({ ...supplierData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Calle, número, ciudad"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plazo de Pago (días)
                      </label>
                      <input
                        type="number"
                        value={supplierData.paymentTerms}
                        onChange={(e) => setSupplierData({ ...supplierData, paymentTerms: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información de la Factura
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Factura <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="F-001234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Emisión <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={invoiceData.issueDate}
                      onChange={(e) => setInvoiceData({ ...invoiceData, issueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Vencimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Archivo (PDF/Imagen)
                    </label>
                    {!uploadedFile ? (
                      <label className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <UploadIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {uploadingFile ? 'Subiendo...' : 'Subir archivo'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploadingFile}
                        />
                      </label>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        <FileIcon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-700 flex-1 truncate">
                          {uploadedFile.fileName}
                        </span>
                        <button
                          onClick={handleRemoveFile}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuración de IVA */}
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Configuración de IVA
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={invoiceData.taxIncluded}
                          onChange={(e) => setInvoiceData({ ...invoiceData, taxIncluded: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          IVA incluido en precios
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        Marque si los precios de los productos YA incluyen el IVA
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Porcentaje de IVA (%)
                      </label>
                      <select
                        value={invoiceData.taxPercentage}
                        onChange={(e) => setInvoiceData({ ...invoiceData, taxPercentage: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0">0% (Exento)</option>
                        <option value="5">5%</option>
                        <option value="19">19% (Estándar Colombia)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Notas adicionales sobre la factura..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Items */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Productos
                </h3>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4" />
                  Agregar Producto
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Producto {index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={item.createProduct}
                          onChange={(e) => updateItem(index, 'createProduct', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          Crear producto nuevo
                        </span>
                      </label>
                    </div>

                    {item.createProduct ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Nombre <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.productData.name}
                            onChange={(e) => updateItem(index, 'productData.name', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombre del producto"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            SKU <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={item.productData.sku}
                            onChange={(e) => updateItem(index, 'productData.sku', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="SKU123"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Categoría
                          </label>
                          <input
                            type="text"
                            value={item.productData.category}
                            onChange={(e) => updateItem(index, 'productData.category', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Categoría"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Marca
                          </label>
                          <input
                            type="text"
                            value={item.productData.brand}
                            onChange={(e) => updateItem(index, 'productData.brand', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            placeholder="Marca"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Imágenes del Producto
                          </label>
                          <div className="space-y-2">
                            {/* Preview de imágenes */}
                            {item.images && item.images.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {item.images.map((img, imgIndex) => (
                                  <div key={imgIndex} className="relative group">
                                    <img
                                      src={img.thumbnail?.url || img.main?.url || img.url}
                                      alt="Producto"
                                      className="w-16 h-16 object-cover rounded border border-gray-300"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveProductImage(index, imgIndex)}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <XIcon className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Botón para subir imagen */}
                            <div>
                              <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                <UploadIcon className="w-4 h-4 mr-2" />
                                {item.uploadingImage ? 'Subiendo...' : 'Agregar Imagen'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleProductImageUpload(index, e)}
                                  disabled={item.uploadingImage}
                                  className="hidden"
                                />
                              </label>
                              <p className="mt-1 text-xs text-gray-500">
                                JPG, PNG o WEBP (máx. 5MB)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Producto <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar producto...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} - {p.sku}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Cantidad <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="1"
                          step="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Costo Unitario <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) => updateItem(index, 'unitCost', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Precio de Venta <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.salePrice}
                          onChange={(e) => updateItem(index, 'salePrice', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                          placeholder="Auto-calculado con 30% markup"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Total Compra
                        </label>
                        <input
                          type="text"
                          value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.quantity * item.unitCost)}
                          disabled
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 text-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Resumen de la Factura
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Proveedor:</span>
                  <span className="font-medium text-gray-900">{supplierData.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Factura:</span>
                  <span className="font-medium text-gray-900">{invoiceData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fecha de Emisión:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(invoiceData.issueDate).toLocaleDateString('es-CO')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vencimiento:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(invoiceData.dueDate).toLocaleDateString('es-CO')}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Productos ({items.length})
                </h4>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm border-b border-gray-200 pb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.createProduct ? item.productData.name : item.productName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.quantity} × {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.unitCost)}
                        </div>
                      </div>
                      <div className="font-medium text-gray-900">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.quantity * item.unitCost)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    IVA ({invoiceData.taxPercentage}%{invoiceData.taxIncluded ? ' - incluido' : ''}):
                  </span>
                  <span className="font-medium text-gray-900">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(tax)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-blue-600">
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(total)}
                  </span>
                </div>
                {invoiceData.taxIncluded && (
                  <p className="text-xs text-gray-500 italic">
                    * Los precios ingresados incluyen el IVA
                  </p>
                )}
              </div>

              {uploadedFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <FileIcon className="w-4 h-4" />
                    <span>Archivo adjunto: {uploadedFile.fileName}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-600">
            Paso {step} de 3
          </div>
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Atrás
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando...' : 'Crear Factura'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
