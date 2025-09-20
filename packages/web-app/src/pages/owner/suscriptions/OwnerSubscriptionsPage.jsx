import React, { useEffect, useState } from 'react';
import { useOwnerPayments } from '@shared/hooks/useOwnerPayments';

const OwnerSubscriptionsPage = () => {
  const { payments, loading, errors, pagination, helpers, actions, filters } = useOwnerPayments();
  const pageSize = pagination?.limit || 10;

  // La carga de pagos se gestiona desde el hook useOwnerPayments, no desde aquí

  useEffect(() => {
    console.log('Pagos y suscripciones:', payments);
  }, [payments]);

  let errorMsg = '';
  if (errors) {
    if (typeof errors === 'string') errorMsg = errors;
    else if (errors.message) errorMsg = errors.message;
    else {
      const firstError = Object.values(errors).find(e => e);
      if (firstError) errorMsg = firstError;
    }
  }

  // Filtros de estado de pago (valores válidos del backend)
  const paymentStatuses = ['APPROVED', 'PENDING', 'CANCELLED', 'FAILED'];

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">Gestión de Pagos y Suscripciones</h1>

      {/* Filtros y búsqueda */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <span className="font-semibold text-gray-700">Filtrar por estado de pago:</span>
        <button
          className={`px-3 py-1 rounded border text-xs font-bold ${filters.status === '' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border-indigo-600'} transition`}
          onClick={() => actions.changeStatus('')}
        >Todos</button>
        {paymentStatuses.map(status => (
          <button
            key={status}
            className={`px-3 py-1 rounded border text-xs font-bold ${filters.status === status ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border-indigo-600'} transition`}
            onClick={() => actions.changeStatus(status)}
          >{status}</button>
        ))}
        <input
          type="text"
          className="ml-6 px-3 py-1 border rounded text-sm focus:ring focus:ring-indigo-200"
          placeholder="Buscar negocio o usuario..."
          value={filters.search || ''}
          onChange={e => actions.setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
        {errorMsg && (
          <div className="text-center text-red-600 font-semibold py-4">Error: {errorMsg}</div>
        )}
        <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
          <thead className="bg-indigo-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Negocio</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Plan</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Estado Pago</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Método</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Fecha Pago</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Estado Suscripción</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Inicio</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Fin</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Usuario</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Descripción</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Notas</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Referencia</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Monto</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Comisión</th>
              <th className="px-4 py-3 text-left font-semibold text-indigo-700">Monto Neto</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading && loading.payments && (
              <tr><td colSpan={15} className="p-8 text-center text-indigo-500 font-semibold">Cargando pagos y suscripciones...</td></tr>
            )}
            {!loading.payments && payments.length === 0 && (
              <tr><td colSpan={15} className="p-8 text-center text-gray-400">No hay pagos ni suscripciones registradas.</td></tr>
            )}
            {!loading.payments && payments.map(payment => {
              const sub = payment.subscription || {};
              const metadata = payment.metadata || {};
              const registrationData = metadata.registrationData || {};
              const userData = registrationData.userData || {};
              const businessData = registrationData.businessData || {};
              
              return (
                <tr key={payment.id} className="hover:bg-indigo-50 transition">
                  <td className="px-4 py-3 uppercase font-semibold text-gray-700">{sub.business?.name || metadata.businessId || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{sub.plan?.name || metadata.planId || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${payment.status === 'APPROVED' ? 'bg-green-100 text-green-700' : payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{payment.status || '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{payment.paymentMethod || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{payment.paidAt ? new Date(payment.paidAt).toLocaleString('es-CO') : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : sub.status === 'TRIAL' ? 'bg-blue-100 text-blue-700' : sub.status === 'EXPIRED' ? 'bg-gray-100 text-gray-700' : sub.status === 'CANCELED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{sub.status || '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{sub.startDate ? new Date(sub.startDate).toLocaleDateString('es-CO') : '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{sub.endDate ? new Date(sub.endDate).toLocaleDateString('es-CO') : '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{userData.email || businessData.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{payment.description || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{payment.notes || '-'}</td>
                  <td className="px-4 py-3 text-gray-700">{payment.transactionId || '-'}</td>
                  <td className="px-4 py-3 text-gray-700 font-bold">{payment.amount}</td>
                  <td className="px-4 py-3 text-gray-700">{payment.commissionFee || '-'}</td>
                  <td className="px-4 py-3 text-gray-700 font-bold">{payment.netAmount || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Paginación */}
        <div className="flex justify-between items-center py-6 px-2">
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white font-bold disabled:opacity-50"
            disabled={pagination.page === 1}
            onClick={() => actions.changePage(pagination.page - 1)}
          >Anterior</button>
          <span className="text-gray-700 font-semibold">Página {pagination.page} de {pagination?.totalPages || 1}</span>
          <button
            className="px-4 py-2 rounded bg-indigo-600 text-white font-bold disabled:opacity-50"
            disabled={pagination.page === (pagination?.totalPages || 1)}
            onClick={() => actions.changePage(pagination.page + 1)}
          >Siguiente</button>
        </div>
      </div>
    </div>
  );
};

export default OwnerSubscriptionsPage;


