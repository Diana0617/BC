import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  XIcon,
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  FileTextIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react';
import supplierInvoiceApi from '../../../../api/supplierInvoiceApi';

const SupplierAccountSummary = ({ supplierId, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSummary();
  }, [supplierId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierInvoiceApi.getSupplierAccountSummary(
        user.businessId,
        supplierId
      );
      
      if (response.success) {
        setSummary(response.data);
      }
    } catch (err) {
      console.error('Error loading supplier summary:', err);
      setError('Error al cargar el resumen de cuenta');
    } finally {
      setLoading(false);
    }
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      APPROVED: { color: 'bg-blue-100 text-blue-800', label: 'Aprobada' },
      PAID: { color: 'bg-green-100 text-green-800', label: 'Pagada' },
      OVERDUE: { color: 'bg-red-100 text-red-800', label: 'Vencida' },
      DISPUTED: { color: 'bg-orange-100 text-orange-800', label: 'Disputada' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', label: 'Cancelada' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando resumen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircleIcon className="w-6 h-6" />
            <h3 className="font-semibold">Error</h3>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div>
            <h2 className="text-xl font-bold">Estado de Cuenta</h2>
            <p className="text-sm text-blue-100 mt-1">
              {summary?.supplier?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSignIcon className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-blue-700 font-medium uppercase tracking-wide">
                  Total Comprado
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {formatCurrency(summary?.totalAmount || 0)}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {summary?.totalInvoices || 0} facturas
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-xs text-green-700 font-medium uppercase tracking-wide">
                  Total Pagado
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(summary?.totalPaid || 0)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {summary?.invoicesByStatus?.PAID || 0} pagadas
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUpIcon className="w-5 h-5 text-orange-600" />
                <span className="text-xs text-orange-700 font-medium uppercase tracking-wide">
                  Pendiente
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {formatCurrency(summary?.totalPending || 0)}
              </div>
              <div className="text-xs text-orange-600 mt-1">
                Por pagar
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircleIcon className="w-5 h-5 text-red-600" />
                <span className="text-xs text-red-700 font-medium uppercase tracking-wide">
                  Vencido
                </span>
              </div>
              <div className="text-2xl font-bold text-red-900">
                {formatCurrency(summary?.totalOverdue || 0)}
              </div>
              <div className="text-xs text-red-600 mt-1">
                {summary?.invoicesByStatus?.OVERDUE || 0} facturas
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                NIT/ID Fiscal
              </div>
              <div className="font-medium text-gray-900">
                {summary?.supplier?.taxId || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Email
              </div>
              <div className="text-sm text-gray-900">
                {summary?.supplier?.email || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Teléfono
              </div>
              <div className="text-sm text-gray-900">
                {summary?.supplier?.phone || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Total Facturas
              </div>
              <div className="font-medium text-gray-900">
                {summary?.totalInvoices || 0}
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Facturas por Estado
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(summary?.invoicesByStatus || {}).map(([status, count]) => (
                <div key={status} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {count}
                  </div>
                  <div className="text-xs text-gray-600">
                    {status === 'PENDING' && 'Pendiente'}
                    {status === 'APPROVED' && 'Aprobada'}
                    {status === 'PAID' && 'Pagada'}
                    {status === 'OVERDUE' && 'Vencida'}
                    {status === 'DISPUTED' && 'Disputada'}
                    {status === 'CANCELLED' && 'Cancelada'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice List */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileTextIcon className="w-5 h-5" />
              Historial de Facturas
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Factura
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Fecha Emisión
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Vencimiento
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Pendiente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary?.invoices?.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No hay facturas registradas
                        </td>
                      </tr>
                    ) : (
                      summary?.invoices?.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(invoice.issueDate)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(invoice.dueDate)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-gray-900">
                            {formatCurrency(invoice.total)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-orange-600 font-medium">
                            {invoice.remainingAmount > 0 ? formatCurrency(invoice.remainingAmount) : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {getStatusBadge(invoice.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierAccountSummary;
