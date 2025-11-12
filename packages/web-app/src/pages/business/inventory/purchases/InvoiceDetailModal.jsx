import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  XIcon,
  CheckCircleIcon,
  DownloadIcon,
  FileTextIcon,
  CalendarIcon,
  DollarSignIcon,
  PackageIcon
} from 'lucide-react';
import branchApi from '../../../../api/branchApi';
import PayInvoiceModal from './PayInvoiceModal';

const InvoiceDetailModal = ({ invoice, onClose, onApprove, onRefresh }) => {
  const { user } = useSelector((state) => state.auth);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [approving, setApproving] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const response = await branchApi.getBranches(user.businessId);
      if (response.success) {
        setBranches(response.data);
        if (response.data.length > 0) {
          setSelectedBranch(response.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading branches:', err);
    }
  };

  const handleApprove = async () => {
    if (!selectedBranch) {
      alert('Debes seleccionar una sucursal');
      return;
    }

    if (!confirm('¿Estás seguro de aprobar esta factura? Se actualizará el inventario.')) {
      return;
    }

    setApproving(true);
    await onApprove(invoice.id, selectedBranch);
    setApproving(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Factura {invoice.invoiceNumber}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {invoice.supplier?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Supplier Info */}
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Proveedor
              </div>
              <div className="font-medium text-gray-900">{invoice.supplier?.name}</div>
              <div className="text-sm text-gray-600">{invoice.supplier?.taxId}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Contacto
              </div>
              <div className="text-sm text-gray-600">{invoice.supplier?.email}</div>
              <div className="text-sm text-gray-600">{invoice.supplier?.phone}</div>
            </div>
          </div>

          {/* Invoice Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Fecha de Emisión
                </div>
                <div className="font-medium text-gray-900">
                  {formatDate(invoice.issueDate)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Fecha de Vencimiento
                </div>
                <div className="font-medium text-gray-900">
                  {formatDate(invoice.dueDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PackageIcon className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Productos</h3>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Costo Unit.
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{item.productName}</div>
                        <div className="text-xs text-gray-500">{item.sku}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IVA:</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(invoice.tax)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span className="text-gray-900">Total:</span>
              <span className="text-blue-600">
                {formatCurrency(invoice.total)}
              </span>
            </div>
            {invoice.remainingAmount > 0 && invoice.status !== 'PENDING' && (
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-600">Pendiente de Pago:</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(invoice.remainingAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Notas:</div>
              <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {invoice.notes}
              </div>
            </div>
          )}

          {/* Attachments */}
          {invoice.attachments?.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Archivos Adjuntos:</div>
              <div className="space-y-2">
                {invoice.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileTextIcon className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {attachment.fileName || 'Documento adjunto'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {attachment.fileType || 'PDF/Imagen'}
                      </div>
                    </div>
                    <DownloadIcon className="w-5 h-5 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Approve Section */}
          {invoice.status === 'PENDING' && (
            <div className="border-t pt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Aprobar Factura
                    </h4>
                    <p className="text-sm text-blue-800">
                      Al aprobar esta factura, se actualizará automáticamente el inventario en la sucursal seleccionada.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Sucursal donde se recibirán los productos:
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Seleccionar sucursal...</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} {branch.isMain && '(Principal)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cerrar
          </button>
          {invoice.status === 'APPROVED' && invoice.remainingAmount > 0 && (
            <button
              onClick={() => setShowPayModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <DollarSignIcon className="w-5 h-5" />
              Registrar Pago
            </button>
          )}
          {invoice.status === 'PENDING' && (
            <button
              onClick={handleApprove}
              disabled={!selectedBranch || approving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleIcon className="w-5 h-5" />
              {approving ? 'Aprobando...' : 'Aprobar Factura'}
            </button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayModal && (
        <PayInvoiceModal
          invoice={invoice}
          onClose={() => setShowPayModal(false)}
          onPaymentSuccess={() => {
            setShowPayModal(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default InvoiceDetailModal;
