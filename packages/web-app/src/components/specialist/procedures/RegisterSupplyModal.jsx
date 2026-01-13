/* eslint-disable no-unused-vars */
import  { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  XMarkIcon,
  BeakerIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { createSupply, clearCreateSuccess, clearSupplyError } from '@shared/store/slices/procedureSupplySlice';
import { fetchProducts } from '@shared/store/slices/productsSlice';

/**
 * RegisterSupplyModal - Modal para registrar consumo de productos en procedimientos
 * 
 * @param {Boolean} isOpen - Si el modal está abierto
 * @param {Function} onClose - Callback para cerrar el modal
 * @param {String} appointmentId - ID del turno/cita
 * @param {String} specialistId - ID del especialista
 * @param {String} branchId - ID de la sucursal (opcional)
 * @param {String} shiftId - ID del turno de caja (opcional)
 */
const RegisterSupplyModal = ({ 
  isOpen, 
  onClose, 
  appointmentId, 
  specialistId,
  branchId = null,
  shiftId = null
}) => {
  const dispatch = useDispatch();
  const { loading, createSuccess, error } = useSelector(state => state.procedureSupply);
  const { products } = useSelector(state => state.products);
  const user = useSelector(state => state.auth?.user);
  const businessId = user?.businessId;

  const [supplies, setSupplies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    reason: '',
    notes: ''
  });

  // Cargar productos al abrir
  useEffect(() => {
    if (isOpen && businessId) {
      dispatch(fetchProducts({ 
        businessId,
        productType: 'FOR_PROCEDURES,BOTH',
        isActive: true
      }));
    }
  }, [isOpen, businessId, dispatch]);

  // Manejar éxito
  useEffect(() => {
    if (createSuccess) {
      toast.success('Consumo registrado exitosamente');
      // Limpiar el formulario actual
      setSupplies([]);
      setSearchTerm('');
      setSelectedProduct(null);
      setFormData({ reason: '', notes: '' });
      dispatch(clearCreateSuccess());
    }
  }, [createSuccess, dispatch]);

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error.error || 'Error al registrar el consumo');
      dispatch(clearSupplyError());
    }
  }, [error, dispatch]);

  const handleClose = () => {
    setSupplies([]);
    setSearchTerm('');
    setSelectedProduct(null);
    setFormData({ reason: '', notes: '' });
    onClose();
  };

  // Agregar producto a la lista
  const handleAddSupply = () => {
    if (!selectedProduct) return;

    const existing = supplies.find(s => s.productId === selectedProduct.id);
    if (existing) {
      toast.error('Este producto ya está en la lista');
      return;
    }

    setSupplies([...supplies, {
      productId: selectedProduct.id,
      product: selectedProduct,
      quantity: 1,
      unit: 'unit'
    }]);

    setSelectedProduct(null);
    setSearchTerm('');
  };

  // Actualizar cantidad
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) return;
    
    setSupplies(supplies.map(supply =>
      supply.productId === productId
        ? { ...supply, quantity: newQuantity }
        : supply
    ));
  };

  // Actualizar unidad
  const handleUnitChange = (productId, newUnit) => {
    setSupplies(supplies.map(supply =>
      supply.productId === productId
        ? { ...supply, unit: newUnit }
        : supply
    ));
  };

  // Eliminar producto
  const handleRemoveSupply = (productId) => {
    setSupplies(supplies.filter(s => s.productId !== productId));
  };

  // Filtrar productos
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Validar y enviar
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (supplies.length === 0) {
      toast.error('Debe agregar al menos un producto');
      return;
    }

    // Registrar cada consumo
    for (const supply of supplies) {
      const supplyData = {
        branchId: branchId || null,
        appointmentId: appointmentId || null,
        shiftId: shiftId || null,
        specialistId: specialistId || user?.id,
        productId: supply.productId,
        quantity: parseFloat(supply.quantity),
        unit: supply.unit,
        reason: formData.reason,
        notes: formData.notes
      };

      try {
        await dispatch(createSupply(supplyData)).unwrap();
      } catch (error) {
        // El error se maneja en el useEffect
        break;
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <BeakerIcon className="h-6 w-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Registrar Consumo de Productos
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex h-[calc(90vh-120px)]">
          {/* Columna Izquierda - Productos */}
          <div className="w-2/3 p-6 border-r overflow-y-auto">
            {/* Buscar Producto */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Producto para Procedimiento
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre o SKU del producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Lista de productos filtrados */}
              {searchTerm && (
                <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">
                      No se encontraron productos
                    </div>
                  ) : (
                    filteredProducts.map(product => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product);
                          handleAddSupply();
                        }}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Costo: ${product.cost?.toLocaleString()}
                          </p>
                          {product.trackInventory && (
                            <p className="text-sm text-gray-500">
                              Stock: {product.currentStock} {product.unit}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Lista de Consumos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Productos a Registrar ({supplies.length})
              </h3>

              {supplies.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BeakerIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No hay productos agregados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {supplies.map(supply => (
                    <div key={supply.productId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold">{supply.product.name}</h4>
                          <p className="text-sm text-gray-500">{supply.product.sku}</p>
                          <p className="text-sm text-purple-600 font-medium">
                            Costo: ${supply.product.cost?.toLocaleString()}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSupply(supply.productId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Cantidad */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={supply.quantity}
                            onChange={(e) => handleQuantityChange(supply.productId, parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>

                        {/* Unidad */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unidad
                          </label>
                          <select
                            value={supply.unit}
                            onChange={(e) => handleUnitChange(supply.productId, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="unit">Unidades</option>
                            <option value="ml">Mililitros (ml)</option>
                            <option value="gr">Gramos (gr)</option>
                            <option value="kg">Kilogramos (kg)</option>
                            <option value="oz">Onzas (oz)</option>
                            <option value="lb">Libras (lb)</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t text-right">
                        <span className="text-sm text-gray-600">
                          Costo Total: ${((supply.quantity * (supply.product.cost || 0)).toFixed(2))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha - Información General */}
          <div className="w-1/3 p-6 bg-gray-50 overflow-y-auto">
            {/* Motivo/Procedimiento */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Procedimiento/Motivo *
              </label>
              <input
                type="text"
                required
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: Alisado con keratina"
              />
            </div>

            {/* Notas */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                rows="4"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Observaciones, particularidades del procedimiento..."
              />
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-lg mb-3">Resumen</h3>
              
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Total productos:</span>
                <span>{supplies.length}</span>
              </div>
              
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Cantidad total:</span>
                <span>
                  {supplies.reduce((sum, s) => sum + s.quantity, 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Costo Total:</span>
                <span className="text-purple-600">
                  ${supplies.reduce((sum, s) => 
                    sum + (s.quantity * (s.product.cost || 0)), 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-2">
              <button
                type="submit"
                disabled={loading || supplies.length === 0}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registrando...' : 'Registrar Consumos'}
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
      </div>
    </div>
  );
};

export default RegisterSupplyModal;
