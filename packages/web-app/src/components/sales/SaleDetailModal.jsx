import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  XMarkIcon,
  ReceiptPercentIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  BanknotesIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { fetchSaleById, cancelSale, clearCurrentSale } from '@shared/store/slices/salesSlice';
import { formatInTimezone } from '../../utils/timezone';

const SaleDetailModal = ({ saleId, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { currentSale, loading } = useSelector(state => state.sales);
  const business = useSelector(state => state.business?.currentBusiness);
  const timezone = business?.timezone || 'America/Bogota';
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (isOpen && saleId) {
      dispatch(fetchSaleById(saleId));
    }

    return () => {
      dispatch(clearCurrentSale());
    };
  }, [isOpen, saleId, dispatch]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Debe ingresar un motivo de cancelación');
      return;
    }

    setCancelling(true);
    try {
      await dispatch(cancelSale({ saleId: currentSale.id, reason: cancelReason })).unwrap();
      toast.success('Venta cancelada exitosamente');
      setShowCancelConfirm(false);
      setCancelReason('');
      // Recargar detalle
      dispatch(fetchSaleById(saleId));
    } catch (error) {
      toast.error(error.error || 'Error al cancelar la venta');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    // TODO: Implementar impresión de recibo
    toast.info('Función de impresión en desarrollo');
  };

  const formatDate = (dateString) => {
    return formatInTimezone(dateString, timezone, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Completada' },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Cancelada' },
      REFUNDED: { color: 'bg-yellow-100 text-yellow-800', text: 'Reembolsada' },
      PENDING: { color: 'bg-gray-100 text-gray-800', text: 'Pendiente' }
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {Icon && <Icon className="h-4 w-4" />}
        {badge.text}
      </span>
    );
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'CASH':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'CARD':
        return <CreditCardIcon className="h-5 w-5" />;
      default:
        return <BanknotesIcon className="h-5 w-5" />;
    }
  };

  if (!isOpen) return null;

  if (loading || !currentSale) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <ReceiptPercentIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Venta #{currentSale.saleNumber?.split('-')[1] || currentSale.saleNumber}
              </h2>
              <p className="text-sm text-gray-500">{formatDate(currentSale.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(currentSale.status)}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Información General */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Cliente */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">Cliente</h3>
              </div>
              {currentSale.client ? (
                <div>
                  <p className="font-medium">
                    {currentSale.client.firstName} {currentSale.client.lastName}
                  </p>
                  {currentSale.client.phone && (
                    <p className="text-sm text-gray-600">{currentSale.client.phone}</p>
                  )}
                  {currentSale.client.email && (
                    <p className="text-sm text-gray-600">{currentSale.client.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Cliente no registrado</p>
              )}
            </div>

            {/* Vendedor */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserIcon className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">Vendedor</h3>
              </div>
              <p className="font-medium">
                {currentSale.user?.firstName} {currentSale.user?.lastName}
              </p>
              <p className="text-sm text-gray-600">{currentSale.user?.role}</p>
            </div>

            {/* Sucursal */}
            {currentSale.branch && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPinIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold">Sucursal</h3>
                </div>
                <p className="font-medium">{currentSale.branch.name}</p>
                <p className="text-sm text-gray-600">{currentSale.branch.code}</p>
              </div>
            )}

            {/* Método de Pago */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getPaymentIcon(currentSale.paymentMethod)}
                <h3 className="font-semibold">Método de Pago</h3>
              </div>
              <p className="font-medium">{currentSale.paymentMethod}</p>
              <p className="text-sm text-gray-600">
                Pagado: ${currentSale.paidAmount?.toLocaleString()}
              </p>
              {currentSale.changeAmount > 0 && (
                <p className="text-sm text-green-600">
                  Cambio: ${currentSale.changeAmount?.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-4">Productos</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Descuento
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSale.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-gray-500">{item.product?.sku}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        ${item.unitPrice?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {item.discount > 0 ? `-$${item.discount?.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ${item.total?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${currentSale.subtotal?.toLocaleString()}</span>
              </div>
              
              {currentSale.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Descuento:</span>
                  <span>-${currentSale.discount?.toLocaleString()}</span>
                </div>
              )}
              
              {currentSale.tax > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>IVA ({currentSale.taxPercentage}%):</span>
                  <span>${currentSale.tax?.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-blue-600">${currentSale.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {currentSale.notes && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">Notas</h3>
              <p className="text-gray-700">{currentSale.notes}</p>
            </div>
          )}

          {/* Información de Cancelación */}
          {currentSale.status === 'CANCELLED' && (
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">Venta Cancelada</h3>
              <p className="text-sm text-gray-600">
                {formatDate(currentSale.cancelledAt)}
              </p>
              {currentSale.cancellationReason && (
                <p className="text-gray-700 mt-2">
                  Motivo: {currentSale.cancellationReason}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex justify-between">
            <div>
              {currentSale.status === 'COMPLETED' && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancelar Venta
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PrinterIcon className="h-5 w-5" />
                Imprimir
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de cancelación */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Cancelar Venta</h3>
            <p className="text-gray-600 mb-4">
              Esta acción revertirá los movimientos de inventario y marcará la venta como cancelada.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de cancelación *
              </label>
              <textarea
                rows="3"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el motivo..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setCancelReason('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cerrar
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleDetailModal;
