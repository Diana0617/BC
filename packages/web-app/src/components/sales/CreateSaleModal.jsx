import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  XMarkIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  UserIcon,
  CreditCardIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  TicketIcon,
  StarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { createSale, clearCreateSuccess, clearSalesError } from '@shared/store/slices/salesSlice';
import { fetchProducts } from '@shared/store/slices/productsSlice';
import { searchClients, getClientVouchers, getClientBalance } from '@shared';
import branchApi from '../../api/branchApi';

/**
 * CreateSaleModal - Modal mejorado para registrar ventas
 * Con: selección de clientes, pago mixto, loyalty points, vouchers
 */
const CreateSaleModal = ({ isOpen, onClose, shiftId = null, branchId: initialBranchId = null }) => {
  const dispatch = useDispatch();
  const { loading, createSuccess, error } = useSelector(state => state.sales);
  const currentSale = useSelector(state => state.sales.currentSale);
  const { products } = useSelector(state => state.products);
  const user = useSelector(state => state.auth?.user);
  const businessId = user?.businessId;

  // Sucursales
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Cliente
  const [clientSearch, setClientSearch] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  
  // Loyalty Points
  const [clientBalance, setClientBalance] = useState(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  
  // Vouchers
  const [clientVouchers, setClientVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  
  // Pago Mixto
  const [mixedPayments, setMixedPayments] = useState([
    { method: 'CASH', amount: '' }
  ]);

  const [formData, setFormData] = useState({
    discountType: 'NONE',
    discountValue: 0,
    paymentMethod: 'CASH',
    paidAmount: '',
    notes: ''
  });

  // Cargar sucursales al abrir
  useEffect(() => {
    const loadBranches = async () => {
      if (isOpen && businessId) {
        setLoadingBranches(true);
        try {
          const response = await branchApi.getBranches(businessId);
          const userBranches = response.data || [];
          setBranches(userBranches);
          console.log('🏢 Branches loaded:', userBranches);
          
          // Si hay un branchId inicial (de turno de caja), auto-seleccionarlo
          if (initialBranchId) {
            const branch = userBranches.find(b => b.id === initialBranchId);
            if (branch) {
              setSelectedBranch(branch);
              console.log('🏢 Auto-selected branch:', branch.name);
            }
          }
        } catch (err) {
          console.error('Error loading branches:', err);
          toast.error('Error al cargar sucursales');
        } finally {
          setLoadingBranches(false);
        }
      }
    };

    loadBranches();
  }, [isOpen, businessId, initialBranchId]);

  // Cargar productos cuando se selecciona una sucursal
  useEffect(() => {
    if (selectedBranch && businessId) {
      console.log('🏪 Loading products for branch:', selectedBranch.name, 'ID:', selectedBranch.id);
      
      dispatch(fetchProducts({ 
        businessId,
        productType: 'FOR_SALE,BOTH',
        isActive: true,
        branchId: selectedBranch.id
      }));
    }
  }, [selectedBranch, businessId, dispatch]);

  // Buscar clientes
  useEffect(() => {
    const searchClientsDebounced = async () => {
      if (clientSearch.length >= 2 && businessId) {
        try {
          const response = await searchClients(businessId, { q: clientSearch, limit: 10 });
          setClients(response.data?.data || []);
          setShowClientDropdown(true);
        } catch (error) {
          console.error('Error buscando clientes:', error);
        }
      } else {
        setClients([]);
        setShowClientDropdown(false);
      }
    };

    const timeoutId = setTimeout(searchClientsDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [clientSearch, businessId]);

  // Cargar datos del cliente seleccionado
  useEffect(() => {
    const loadClientData = async () => {
      if (selectedClient && businessId) {
        try {
          // Cargar balance de puntos
          const balanceResponse = await getClientBalance(selectedClient.id);
          setClientBalance(balanceResponse.data);

          // Cargar vouchers activos
          const vouchersResponse = await getClientVouchers(businessId, selectedClient.id);
          const activeVouchers = (vouchersResponse.data?.vouchers || []).filter(v => v.status === 'ACTIVE');
          setClientVouchers(activeVouchers);
        } catch (error) {
          console.error('Error cargando datos del cliente:', error);
        }
      } else {
        setClientBalance(null);
        setClientVouchers([]);
        setPointsToUse(0);
        setSelectedVoucher(null);
      }
    };

    loadClientData();
  }, [selectedClient, businessId]);

  // Manejar éxito
  useEffect(() => {
    if (createSuccess) {
      toast.success('Venta registrada exitosamente');
      
      // currentSale contiene la venta recién creada con el recibo
      if (currentSale && currentSale.sale && currentSale.sale.id) {
        // Descargar el recibo automáticamente
        downloadReceipt(currentSale.sale.id);
      }
      
      handleClose();
      dispatch(clearCreateSuccess());
    }
  }, [createSuccess, currentSale, dispatch]);

  // Función para descargar el recibo PDF
  const downloadReceipt = async (saleId) => {
    try {
      const { salesApi } = await import('@shared');
      const response = await salesApi.downloadSaleReceiptPDF(saleId);
      
      // Crear URL temporal para descargar
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo-venta-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Recibo descargado');
    } cSelectedBranch(null);
    setBranches([]);
    setatch (error) {
      console.error('Error descargando recibo:', error);
      toast.error('Error al descargar el recibo');
    }
  };

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error.error || 'Error al registrar la venta');
      dispatch(clearSalesError());
    }
  }, [error, dispatch]);

  const handleClose = () => {
    setItems([]);
    setSearchTerm('');
    setSelectedProduct(null);
    setClientSearch('');
    setClients([]);
    setSelectedClient(null);
    setClientBalance(null);
    setClientVouchers([]);
    setPointsToUse(0);
    setSelectedVoucher(null);
    setMixedPayments([{ method: 'CASH', amount: '' }]);
    setFormData({
      discountType: 'NONE',
      discountValue: 0,
      paymentMethod: 'CASH',
      paidAmount: '',
      notes: ''
    });
    onClose();
  };

  // Seleccionar cliente
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  // Agregar producto al carrito
  const handleAddProduct = () => {
    if (!selectedProduct) return;

    const existing = items.find(item => item.productId === selectedProduct.id);
    if (existing) {
      toast.error('Este producto ya está en el carrito');
      return;
    }

    setItems([...items, {
      productId: selectedProduct.id,
      product: selectedProduct,
      quantity: 1,
      unitPrice: selectedProduct.price,
      discountType: 'NONE',
      discountValue: 0
    }]);

    setSelectedProduct(null);
    setSearchTerm('');
  };

  // Actualizar cantidad
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setItems(items.map(item => 
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Actualizar descuento de item
  const handleItemDiscountChange = (productId, discountType, discountValue) => {
    setItems(items.map(item =>
      item.productId === productId
        ? { ...item, discountType, discountValue: parseFloat(discountValue) || 0 }
        : item
    ));
  };

  // Eliminar producto
  const handleRemoveItem = (productId) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  // Agregar método de pago (para MIXED)
  const handleAddPaymentMethod = () => {
    setMixedPayments([...mixedPayments, { method: 'CASH', amount: '' }]);
  };

  // Actualizar método de pago
  const handleUpdatePaymentMethod = (index, field, value) => {
    const updated = [...mixedPayments];
    updated[index][field] = value;
    setMixedPayments(updated);
  };

  // Eliminar método de pago
  const handleRemovePaymentMethod = (index) => {
    if (mixedPayments.length === 1) {
      toast.error('Debe haber al menos un método de pago');
      return;
    }
    setMixedPayments(mixedPayments.filter((_, i) => i !== index));
  };

  // Calcular subtotal
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // Calcular descuento total
  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    
    // Descuentos por item
    const itemDiscounts = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      if (item.discountType === 'PERCENTAGE') {
        return sum + (itemSubtotal * item.discountValue / 100);
      } else if (item.discountType === 'FIXED') {
        return sum + item.discountValue;
      }
      return sum;
    }, 0);

    // Descuento general
    let generalDiscount = 0;
    if (formData.discountType === 'PERCENTAGE') {
      generalDiscount = subtotal * formData.discountValue / 100;
    } else if (formData.discountType === 'FIXED') {
      generalDiscount = formData.discountValue;
    }

    // Descuento por puntos (1 punto = 1 peso)
    const pointsDiscount = pointsToUse;

    // Descuento por voucher
    const voucherDiscount = selectedVoucher ? parseFloat(selectedVoucher.amount) : 0;

    return itemDiscounts + generalDiscount + pointsDiscount + voucherDiscount;
  };

  // Calcular total (sin IVA)
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return Math.max(0, subtotal - discount);
  };

  // Calcular total pagado (para pago mixto)
  const calculateTotalPaid = () => {
    if (formData.paymentMethod === 'MIXED') {
      return mixedPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    }
    return parseFloat(formData.paidAmount) || 0;
  };

  // Calcular cambio
  const calculateChange = () => {
    const total = calculateTotal();
    const paid = calculateTotalPaid();
    return Math.max(0, paid - total);
  };

  // Filtrar productos
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug: Ver productos y su stock
  useEffect(() => {
    if (products.length > 0 && isOpen) {
      console.log('📦 Total products loaded:', products.length);
      console.log('📦 Sample product with branchStocks:', products[0]);
      console.log('📦 Products with branchStocks:', products.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        trackInventory: p.trackInventory,
        branchStocks: p.branchStocks?.map(bs => ({
          branchId: bs.branchId,
          currentStock: bs.currentStock
        }))
      })));
    }
  }, [products, isOpen]);

  // Calcular puntos máximos a usar
  const maxPointsToUse = clientBalance 
    ? Math.min(clientBalance.availablePoints, Math.floor(calculateTotal())) 
    : 0;

  // Validar y enviar
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    const total = calculateTotal();
    const paid = calculateTotalPaid();

    if (paid < total) {
      toast.error(`Monto insuficiente. Total: $${total.toLocaleString()}`);
      return;
    }

    // Validar puntos
    if (pointsToUse > maxPointsToUse) {
      toast.error(`Puntos insuficientes. Disponibles: ${maxPointsToUse}`);
      return;
    }
selectedBranch?.i
    const saleData = {
      branchId: branchId || null,
      clientId: selectedClient?.id || null,
      shiftId: shiftId || null,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        discountType: item.discountType,
        discountValue: item.discountValue
      })),
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      paymentMethod: formData.paymentMethod,
      paidAmount: paid,
      mixedPayments: formData.paymentMethod === 'MIXED' ? mixedPayments : null,
      loyaltyPointsUsed: pointsToUse,
      voucherCode: selectedVoucher?.code || null,
      notes: formData.notes
    };

    await dispatch(createSale(saleData));
  };

  if (!isOpen) return null;

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const total = calculateTotal();
  const totalPaid = calculateTotalPaid();
  const change = calculateChange();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-green-50">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Nueva Venta</h2>
            </div>
            {selectedBranch && (
              <div className="flex items-center gap-2 ml-9">
                <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Sucursal: {selectedBranch.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBranch(null)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline ml-2"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Selector de Sucursal */}
        {!selectedBranch ? (
          <div className="p-8">
            <div className="text-center mb-6">
              <BuildingOfficeIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Selecciona la Sucursal
              </h3>
              <p className="text-gray-600">
                Elige en qué sucursal se realizará la venta
              </p>
            </div>

            {loadingBranches ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Cargando sucursales...</p>
              </div>
            ) : branches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay sucursales disponibles</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {branches.map(branch => (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setSelectedBranch(branch)}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <BuildingOfficeIcon className="h-6 w-6 text-blue-600 group-hover:text-blue-700 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 truncate">
                          {branch.name}
                        </h4>
                        {branch.address && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {branch.address}
                          </p>
                        )}
                        {branch.phone && (
                          <p className="text-xs text-gray-400 mt-1">
                            {branch.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex h-[calc(90vh-120px)]">
          {/* Columna Izquierda - Productos */}
          <div className="w-2/3 p-6 border-r overflow-y-auto">
            {/* Buscar Producto */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Producto
              </label>
              <input
                type="text"
                placeholder="Nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              {searchTerm && (
                <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">No se encontraron productos</div>
                  ) : (
                    filteredProducts.map(product => {
                      const branchStock = product.branchStocks?.find(bs => bs.branchId === branchId);
                      const availableStock = branchStock?.currentStock || 0;
                      const hasStock = availableStock > 0 || !product.trackInventory;
                                            console.log(`📊 Product: ${product.name}`, {
                        branchId: branchId,
                        allBranchStocks: product.branchStocks,
                        foundBranchStock: branchStock,
                        availableStock: availableStock,
                        hasStock: hasStock,
                        trackInventory: product.trackInventory
                      });
                                            return (
                        <div
                          key={product.id}
                          onClick={() => {
                            if (hasStock) {
                              setSelectedProduct(product);
                              handleAddProduct();
                            } else {
                              toast.error(`${product.name} no tiene stock disponible en esta sucursal`);
                            }
                          }}
                          className={`p-3 border-b last:border-b-0 flex justify-between ${
                            hasStock ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div>
                            <p className={`font-medium ${!hasStock ? 'text-gray-400' : ''}`}>{product.name}</p>
                            <p className="text-sm text-gray-500">{product.sku}</p>
                            {product.trackInventory && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-medium ${
                                  hasStock ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  Stock: {availableStock} {product.unit || 'unidades'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-blue-600">${product.price?.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Carrito */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Carrito ({items.length})</h3>
              
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCartIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay productos en el carrito</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.productId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">{item.product.sku}</p>
                          <p className="text-sm text-blue-600 font-medium">${item.unitPrice?.toLocaleString()} c/u</p>
                        </div>
                        <button type="button" onClick={() => handleRemoveItem(item.productId)} className="text-red-500 hover:text-red-700">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Cantidad */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => handleQuantityChange(item.productId, item.quantity - 1)} className="p-1 border rounded hover:bg-gray-100">
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                              className="w-20 px-2 py-1 border rounded text-center"
                            />
                            <button type="button" onClick={() => handleQuantityChange(item.productId, item.quantity + 1)} className="p-1 border rounded hover:bg-gray-100">
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Descuento Item */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Descuento</label>
                          <div className="flex gap-2">
                            <select
                              value={item.discountType}
                              onChange={(e) => handleItemDiscountChange(item.productId, e.target.value, item.discountValue)}
                              className="px-2 py-1 border rounded text-sm"
                            >
                              <option value="NONE">Sin desc.</option>
                              <option value="PERCENTAGE">%</option>
                              <option value="FIXED">$</option>
                            </select>
                            {item.discountType !== 'NONE' && (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.discountValue}
                                onChange={(e) => handleItemDiscountChange(item.productId, item.discountType, e.target.value)}
                                className="flex-1 px-2 py-1 border rounded text-sm"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t text-right">
                        <span className="text-lg font-bold">Subtotal: ${(item.quantity * item.unitPrice).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha - Resumen y Pago */}
          <div className="w-1/3 p-6 bg-gray-50 overflow-y-auto">
            {/* Buscar Cliente */}
            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="inline h-4 w-4 mr-1" />
                Cliente (Opcional)
              </label>
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  setShowClientDropdown(true);
                }}
                onFocus={() => setShowClientDropdown(true)}
                className="w-full px-3 py-2 border rounded-lg"
              />
              
              {showClientDropdown && clients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {clients.map(client => (
                    <div
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className="p-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.email} - {client.phone}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedClient && (
                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="font-medium text-blue-900">{selectedClient.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient(null);
                      setClientSearch('');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Cambiar cliente
                  </button>
                </div>
              )}
            </div>

            {/* Loyalty Points */}
            {clientBalance && clientBalance.availablePoints > 0 && (
              <div className="mb-6 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-purple-900 mb-2">
                  <StarIcon className="inline h-4 w-4 mr-1" />
                  Puntos de Fidelidad
                </label>
                <p className="text-sm text-purple-700 mb-2">
                  Disponibles: <span className="font-bold">{clientBalance.availablePoints} puntos</span>
                </p>
                <input
                  type="number"
                  min="0"
                  max={maxPointsToUse}
                  value={pointsToUse}
                  onChange={(e) => setPointsToUse(Math.min(parseInt(e.target.value) || 0, maxPointsToUse))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Puntos a usar"
                />
                <p className="text-xs text-purple-600 mt-1">
                  Descuento: ${pointsToUse.toLocaleString()}
                </p>
              </div>
            )}

            {/* Vouchers */}
            {clientVouchers.length > 0 && (
              <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                <label className="block text-sm font-medium text-green-900 mb-2">
                  <TicketIcon className="inline h-4 w-4 mr-1" />
                  Vouchers Disponibles
                </label>
                <select
                  value={selectedVoucher?.id || ''}
                  onChange={(e) => {
                    const voucher = clientVouchers.find(v => v.id === e.target.value);
                    setSelectedVoucher(voucher || null);
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Sin voucher</option>
                  {clientVouchers.map(voucher => (
                    <option key={voucher.id} value={voucher.id}>
                      {voucher.code} - ${parseFloat(voucher.amount).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Descuento General */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ReceiptPercentIcon className="inline h-4 w-4 mr-1" />
                Descuento General
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="NONE">Sin descuento</option>
                  <option value="PERCENTAGE">%</option>
                  <option value="FIXED">$</option>
                </select>
                {formData.discountType !== 'NONE' && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="0"
                  />
                )}
              </div>
            </div>

            {/* Método de Pago */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCardIcon className="inline h-4 w-4 mr-1" />
                Método de Pago
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="CASH">Efectivo</option>
                <option value="CARD">Tarjeta</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="MIXED">Mixto</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>

            {/* Pago Mixto */}
            {formData.paymentMethod === 'MIXED' ? (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desglose de Pagos
                </label>
                {mixedPayments.map((payment, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <select
                      value={payment.method}
                      onChange={(e) => handleUpdatePaymentMethod(index, 'method', e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="CASH">Efectivo</option>
                      <option value="CARD">Tarjeta</option>
                      <option value="TRANSFER">Transferencia</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={payment.amount}
                      onChange={(e) => handleUpdatePaymentMethod(index, 'amount', e.target.value)}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                      placeholder="Monto"
                    />
                    {mixedPayments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePaymentMethod(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddPaymentMethod}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Agregar método
                </button>
              </div>
            ) : (
              /* Monto Pagado Simple */
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BanknotesIcon className="inline h-4 w-4 mr-1" />
                  Monto Recibido *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            )}

            {/* Notas */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
              <textarea
                rows="2"
                value={formData.notes}
        )}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Observaciones..."
              />
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-lg p-4 space-y-2 mb-6">
              <h3 className="font-semibold text-lg mb-3">Resumen</h3>
              
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Descuentos:</span>
                  <span>-${discount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-blue-600">${total.toLocaleString()}</span>
              </div>

              {totalPaid > 0 && (
                <div className="flex justify-between text-green-600 font-semibold pt-2">
                  <span>Total Recibido:</span>
                  <span>${totalPaid.toLocaleString()}</span>
                </div>
              )}

              {change > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Cambio:</span>
                  <span>${change.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="space-y-2">
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : 'Registrar Venta'}
              </button>
              
              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default CreateSaleModal;
