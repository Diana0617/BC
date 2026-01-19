import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  FileTextIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  DollarSignIcon,
  Share2Icon
} from 'lucide-react';
import supplierInvoiceApi from '../../../../api/supplierInvoiceApi';
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceDetailModal from './InvoiceDetailModal';
import SupplierAccountSummary from './SupplierAccountSummary';
import DistributeStockModal from '../../../inventory/purchases/DistributeStockModal';

const PurchaseInvoices = () => {
  const { user } = useSelector((state) => state.auth);
  const [invoices, setInvoices] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAccountSummary, setShowAccountSummary] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    supplierId: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 0
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cargar proveedores
  const loadSuppliers = useCallback(async () => {
    if (!user?.businessId) return;
    try {
      const response = await supplierInvoiceApi.getSuppliers(user.businessId);
      if (response.success) {
        setSuppliers(response.data.suppliers || []);
      }
    } catch (err) {
      console.error('Error loading suppliers:', err);
    }
  }, [user?.businessId]);

  // Cargar facturas
  const loadInvoices = useCallback(async () => {
    if (!user?.businessId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Limpiar filtros vacíos antes de enviar
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const response = await supplierInvoiceApi.getInvoices(user.businessId, cleanFilters);
      
      if (response.success) {
        setInvoices(response.data.invoices);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  }, [user?.businessId, filters]);

  // useEffect para cargar proveedores
  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // useEffect para cargar facturas cuando cambien los filtros
  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleCreateInvoice = () => {
    setShowCreateModal(true);
  };

  const handleInvoiceCreated = () => {
    setShowCreateModal(false);
    setSuccess('Factura creada exitosamente');
    loadInvoices();
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const handleApproveInvoice = async (invoiceId, branchId) => {
    try {
      const response = await supplierInvoiceApi.approveInvoice(user.businessId, invoiceId, branchId);
      if (response.success) {
        setSuccess('Factura aprobada e inventario actualizado');
        loadInvoices();
        setShowDetailModal(false);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error approving invoice:', err);
      setError('Error al aprobar la factura');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleViewSupplierAccount = (supplierId) => {
    setSelectedSupplierId(supplierId);
    setShowAccountSummary(true);
  };

  const handleDistribute = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDistributeModal(true);
  };

  

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pendiente' },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon, label: 'Aprobada' },
      PAID: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, label: 'Pagada' },
      OVERDUE: { color: 'bg-red-100 text-red-800', icon: AlertCircleIcon, label: 'Vencida' },
      DISPUTED: { color: 'bg-orange-100 text-orange-800', icon: AlertCircleIcon, label: 'Disputada' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: AlertCircleIcon, label: 'Cancelada' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
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

  const isOverdue = (invoice) => {
    if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') return false;
    const dueDate = new Date(invoice.dueDate);
    const now = new Date();
    return dueDate < now;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas de Proveedores</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona las facturas de compra a tus proveedores
          </p>
        </div>
        <button
          onClick={handleCreateInvoice}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Factura
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <FilterIcon className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor
            </label>
            <select
              value={filters.supplierId}
              onChange={(e) => setFilters({ ...filters, supplierId: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="APPROVED">Aprobada</option>
              <option value="PAID">Pagada</option>
              <option value="OVERDUE">Vencida</option>
              <option value="DISPUTED">Disputada</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', supplierId: '', startDate: '', endDate: '', page: 1, limit: 20 })}
              className="w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando facturas...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center">
            <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No hay facturas registradas</p>
            <button
              onClick={handleCreateInvoice}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear tu primera factura
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Factura
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proveedor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Emisión
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vencimiento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr 
                      key={invoice.id}
                      className={`hover:bg-gray-50 ${isOverdue(invoice) ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {invoice.supplier?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {invoice.supplier?.taxId}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`text-sm ${isOverdue(invoice) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {formatDate(invoice.dueDate)}
                          {isOverdue(invoice) && (
                            <div className="text-xs text-red-500">Vencida</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(invoice.total)}
                        </div>
                        {invoice.remainingAmount > 0 && invoice.status !== 'PENDING' && (
                          <div className="text-xs text-orange-600">
                            Pendiente: {formatCurrency(invoice.remainingAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Ver detalles"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {invoice.status === 'PENDING' && !invoice.metadata?.stockDistributed && (
                            <button
                              onClick={() => handleDistribute(invoice)}
                              className="p-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded"
                              title="Distribuir stock"
                            >
                              <Share2Icon className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewSupplierAccount(invoice.supplierId)}
                            className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                            title="Estado de cuenta"
                          >
                            <DollarSignIcon className="w-4 h-4" />
                          </button>
                          {invoice.attachments?.length > 0 && (
                            <a
                              href={invoice.attachments[0].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded"
                              title="Ver archivo adjunto"
                            >
                              <DownloadIcon className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando {((pagination.page - 1) * filters.limit) + 1} - {Math.min(pagination.page * filters.limit, pagination.total)} de {pagination.total} facturas
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleInvoiceCreated}
        />
      )}

      {showDetailModal && selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInvoice(null);
          }}
          onApprove={handleApproveInvoice}
          onRefresh={loadInvoices}
        />
      )}

      {showAccountSummary && selectedSupplierId && (
        <SupplierAccountSummary
          supplierId={selectedSupplierId}
          onClose={() => {
            setShowAccountSummary(false);
            setSelectedSupplierId(null);
          }}
        />
      )}
      {showDistributeModal && selectedInvoice && (
        <DistributeStockModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowDistributeModal(false);
            setSelectedInvoice(null);
          }}
          onDistributed={() => {
            setShowDistributeModal(false);
            setSelectedInvoice(null);
            loadInvoices();
            setSuccess('Stock distribuido exitosamente');
            setTimeout(() => setSuccess(''), 3000);
          }}
        />
      )}    </div>
  );
};

export default PurchaseInvoices;
