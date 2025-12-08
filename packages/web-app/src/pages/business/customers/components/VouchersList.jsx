/**
 * Lista de Vouchers del Cliente
 * Muestra todos los vouchers (activos, usados, expirados) de un cliente
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  TicketIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { apiClient } from '@shared/api/client';

const VouchersList = ({ client, onCreateVoucher }) => {
  const { currentBusiness } = useSelector(state => state.business);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [includeExpired, setIncludeExpired] = useState(false);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/api/business/${currentBusiness.id}/clients/${client.id}/vouchers`,
        { params: { includeExpired: includeExpired.toString() } }
      );

      if (response.data.success) {
        setVouchers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error('Error al cargar vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id, includeExpired]);

  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado al portapapeles');
  };

  const getStatusBadge = (voucher) => {
    const { status } = voucher;

    const badges = {
      ACTIVE: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircleIcon,
        label: 'Activo'
      },
      USED: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: CheckCircleIcon,
        label: 'Usado'
      },
      EXPIRED: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        icon: ClockIcon,
        label: 'Expirado'
      },
      CANCELLED: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircleIcon,
        label: 'Cancelado'
      }
    };

    const config = badges[status] || badges.ACTIVE;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3.5 w-3.5 mr-1" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mr-3"></div>
        <span className="text-gray-600">Cargando vouchers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con filtros */}
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-900">
          Vouchers ({vouchers.length})
        </h4>
        <div className="flex items-center space-x-3">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={includeExpired}
              onChange={(e) => setIncludeExpired(e.target.checked)}
              className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Incluir expirados
          </label>
          <button
            onClick={onCreateVoucher}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            + Crear Voucher
          </button>
        </div>
      </div>

      {/* Lista de vouchers */}
      {vouchers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">No hay vouchers</h3>
          <p className="mt-2 text-sm text-gray-500">
            Este cliente no tiene vouchers {includeExpired ? '' : 'activos'}.
          </p>
          <button
            onClick={onCreateVoucher}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Crear Primer Voucher
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Código del voucher */}
                  <div className="flex items-center space-x-2 mb-2">
                    <TicketIcon className="h-5 w-5 text-green-600" />
                    <code className="text-sm font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      {voucher.code}
                    </code>
                    <button
                      onClick={() => copyVoucherCode(voucher.code)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copiar código"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Información del voucher */}
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-32">Valor:</span>
                      <span className="text-green-700 font-semibold">
                        ${voucher.amount?.toLocaleString('es-CO')} COP
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-32">Emitido:</span>
                      <span>
                        {new Date(voucher.issuedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-32">Expira:</span>
                      <span className={voucher.status === 'ACTIVE' && new Date(voucher.expiresAt) < new Date() ? 'text-red-600 font-medium' : ''}>
                        {new Date(voucher.expiresAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {voucher.status === 'USED' && voucher.usedAt && (
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-32">Usado:</span>
                        <span className="text-blue-600">
                          {new Date(voucher.usedAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    {voucher.notes && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <span className="font-medium text-gray-700">Notas:</span>
                        <p className="text-gray-600 text-xs mt-1 italic">
                          {voucher.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estado */}
                <div className="ml-4">
                  {getStatusBadge(voucher)}
                </div>
              </div>

              {/* Días hasta expiración (solo para activos) */}
              {voucher.status === 'ACTIVE' && voucher.daysUntilExpiry !== undefined && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {voucher.daysUntilExpiry > 0 ? (
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarDaysIcon className="h-4 w-4 mr-1.5" />
                      <span>
                        Expira en <span className="font-semibold text-gray-700">{voucher.daysUntilExpiry}</span> día{voucher.daysUntilExpiry !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-red-600">
                      <ClockIcon className="h-4 w-4 mr-1.5" />
                      <span className="font-medium">¡Este voucher ha expirado!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VouchersList;
