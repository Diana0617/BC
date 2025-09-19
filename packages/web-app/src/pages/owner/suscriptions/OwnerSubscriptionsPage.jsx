import React, { useEffect } from 'react';
import { useOwnerPayments } from '@shared/hooks/useOwnerPayments';

const OwnerSubscriptionsPage = () => {
  const { payments, loading, errors, pagination } = useOwnerPayments();

  // loading.payments es el booleano correcto

  useEffect(() => {
    console.log('Pagos y suscripciones:', payments);
  }, [payments]);

  // Extraer el mensaje de error relevante
  let errorMsg = '';
  if (errors) {
    if (typeof errors === 'string') errorMsg = errors;
    else if (errors.message) errorMsg = errors.message;
    else {
      // Buscar el primer campo con valor en el objeto errors
      const firstError = Object.values(errors).find(e => e);
      if (firstError) errorMsg = firstError;
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Pagos y Suscripciones</h1>
      <div className="overflow-x-auto">
        {errorMsg && (
          <div className="text-center text-red-600 mb-4">Error: {errorMsg}</div>
        )}
        <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2">ID Pago</th>
              <th className="px-2 py-2">Negocio</th>
              <th className="px-2 py-2">Plan</th>
              <th className="px-2 py-2">Monto</th>
              <th className="px-2 py-2">Moneda</th>
              <th className="px-2 py-2">Estado Pago</th>
              <th className="px-2 py-2">Método</th>
              <th className="px-2 py-2">Fecha Pago</th>
              <th className="px-2 py-2">ID Suscripción</th>
              <th className="px-2 py-2">Estado Suscripción</th>
              <th className="px-2 py-2">Inicio</th>
              <th className="px-2 py-2">Fin</th>
              <th className="px-2 py-2">Usuario</th>
              <th className="px-2 py-2">Email Usuario</th>
              <th className="px-2 py-2">Descripción</th>
              <th className="px-2 py-2">Notas</th>
              <th className="px-2 py-2">Referencia</th>
              <th className="px-2 py-2">Tipo Pago</th>
              <th className="px-2 py-2">Comisión</th>
              <th className="px-2 py-2">Monto Neto</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && loading.payments && (
              <tr><td colSpan={20} className="p-8 text-center">Cargando pagos y suscripciones...</td></tr>
            )}
            {!loading.payments && payments.length === 0 && (
              <tr><td colSpan={20} className="p-8 text-center">No hay pagos ni suscripciones registradas.</td></tr>
            )}
            {!loading.payments && payments.map(payment => {
              const sub = payment.subscription || {};
              const metadata = payment.metadata || {};
              return (
                <tr key={payment.id}>
                  <td className="px-2 py-2">{payment.id}</td>
                  <td className="px-2 py-2">{sub.business?.name || metadata.businessId || '-'}</td>
                  <td className="px-2 py-2">{sub.plan?.name || metadata.planId || '-'}</td>
                  <td className="px-2 py-2">{payment.amount}</td>
                  <td className="px-2 py-2">{payment.currency || '-'}</td>
                  <td className="px-2 py-2">{payment.status || '-'}</td>
                  <td className="px-2 py-2">{payment.paymentMethod || '-'}</td>
                  <td className="px-2 py-2">{payment.paidAt ? new Date(payment.paidAt).toLocaleString('es-CO') : '-'}</td>
                  <td className="px-2 py-2">{sub.id || payment.businessSubscriptionId || '-'}</td>
                  <td className="px-2 py-2">{sub.status || '-'}</td>
                  <td className="px-2 py-2">{sub.startDate ? new Date(sub.startDate).toLocaleDateString('es-CO') : '-'}</td>
                  <td className="px-2 py-2">{sub.endDate ? new Date(sub.endDate).toLocaleDateString('es-CO') : '-'}</td>
                  <td className="px-2 py-2">{metadata.userEmail || '-'}</td>
                  <td className="px-2 py-2">{sub.business?.email || metadata.businessEmail || '-'}</td>
                  <td className="px-2 py-2">{payment.description || '-'}</td>
                  <td className="px-2 py-2">{payment.notes || '-'}</td>
                  <td className="px-2 py-2">{payment.externalReference || '-'}</td>
                  <td className="px-2 py-2">{metadata.paymentType || '-'}</td>
                  <td className="px-2 py-2">{payment.commissionFee || '-'}</td>
                  <td className="px-2 py-2">{payment.netAmount || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerSubscriptionsPage;


