import React, { useState } from 'react';
import { XIcon, PackageIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import supplierInvoiceApi from '../../../../api/supplierInvoiceApi';
import toast from 'react-hot-toast';

const ReceiveGoodsModal = ({ invoice, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [itemsReceived, setItemsReceived] = useState(
    invoice.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      description: item.description,
      quantityOrdered: item.quantityOrdered || item.quantity,
      quantityReceived: item.quantityReceived || 0,
      quantityToReceive: Math.max(0, (item.quantityOrdered || item.quantity) - (item.quantityReceived || 0)),
      unitCost: item.unitCost
    }))
  );

  const handleQuantityChange = (index, value) => {
    const newItems = [...itemsReceived];
    const maxQuantity = newItems[index].quantityOrdered - newItems[index].quantityReceived;
    const quantity = Math.min(Math.max(0, parseInt(value) || 0), maxQuantity);
    newItems[index].quantityToReceive = quantity;
    setItemsReceived(newItems);
  };

  const handleReceiveAll = () => {
    const newItems = itemsReceived.map(item => ({
      ...item,
      quantityToReceive: item.quantityOrdered - item.quantityReceived
    }));
    setItemsReceived(newItems);
  };

  const handleSubmit = async () => {
    try {
      // Validar que al menos un item tenga cantidad
      const itemsToReceive = itemsReceived.filter(item => item.quantityToReceive > 0);
      
      if (itemsToReceive.length === 0) {
        toast.error('Debes especificar al menos una cantidad a recibir');
        return;
      }

      setLoading(true);

      const payload = {
        itemsReceived: itemsToReceive.map(item => ({
          productId: item.productId,
          quantityReceived: item.quantityToReceive
        }))
      };

      const response = await supplierInvoiceApi.receiveGoods(
        invoice.businessId || invoice.Business?.id,
        invoice.id,
        payload
      );

      if (response.success) {
        toast.success(response.message || 'Mercancía recibida exitosamente');
        onSuccess();
      }
    } catch (error) {
      console.error('Error receiving goods:', error);
      toast.error(error.response?.data?.message || 'Error al recibir la mercancía');
    } finally {
      setLoading(false);
    }
  };

  const totalToReceive = itemsReceived.reduce((sum, item) => sum + item.quantityToReceive, 0);
  const totalPending = itemsReceived.reduce(
    (sum, item) => sum + (item.quantityOrdered - item.quantityReceived),
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <PackageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Recibir Mercancía</h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Factura: {invoice.invoiceNumber}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Estado actual */}
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Proveedor:</span>
              <span className="font-medium text-gray-900">{invoice.supplier?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Pendiente de recibir:</span>
              <span className={`font-bold ${totalPending > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {totalPending} unidades
              </span>
            </div>
          </div>

          {/* Alerta si hay items pendientes */}
          {totalPending > 0 && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Tienes productos pendientes de recibir. Ingresa las cantidades que recibiste hoy.
              </p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {itemsReceived.map((item, index) => {
              const pending = item.quantityOrdered - item.quantityReceived;
              const isCompleted = pending === 0;

              return (
                <div
                  key={item.productId}
                  className={`border rounded-lg p-4 ${
                    isCompleted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.productName}
                        </h4>
                        {isCompleted && (
                          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      {item.sku && (
                        <p className="text-xs text-gray-500 mt-0.5">SKU: {item.sku}</p>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-600 mt-1 italic">{item.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <div>
                          <span className="text-gray-600">Ordenado: </span>
                          <span className="font-medium text-gray-900">{item.quantityOrdered}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Ya recibido: </span>
                          <span className="font-medium text-gray-900">{item.quantityReceived}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Pendiente: </span>
                          <span className={`font-bold ${pending > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {pending}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Input de cantidad a recibir */}
                    {!isCompleted && (
                      <div className="flex-shrink-0">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Recibir ahora
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={pending}
                          value={item.quantityToReceive}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          disabled={loading}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center font-medium focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm">
              <span className="text-gray-600">Total a recibir: </span>
              <span className="text-lg font-bold text-blue-600">{totalToReceive} unidades</span>
            </div>
            <button
              onClick={handleReceiveAll}
              disabled={loading || totalPending === 0}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
            >
              Recibir todo lo pendiente
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || totalToReceive === 0}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : `Confirmar Recepción (${totalToReceive})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiveGoodsModal;
