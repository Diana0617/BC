import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon,
  ShieldCheckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

/**
 * Componente para mostrar el estado de suscripción con distinción clara entre Trial y Pago
 * 
 * @param {Object} subscription - Objeto de suscripción
 * @param {boolean} compact - Mostrar versión compacta
 * @param {boolean} showDetails - Mostrar detalles adicionales (fechas, días restantes)
 */
const SubscriptionStatusBadge = ({ subscription, compact = false, showDetails = true }) => {
  if (!subscription) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <XCircleIcon className="w-4 h-4" />
        Sin suscripción
      </span>
    );
  }

  const calculateDaysRemaining = (targetDate) => {
    if (!targetDate) return 0;
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const getStatusConfig = () => {
    const status = subscription.status;

    // TRIAL - Trial activo esperando primer pago
    if (status === 'TRIAL') {
      const trialDays = calculateDaysRemaining(subscription.trialEndDate);
      const isExpiringSoon = trialDays <= 2;

      return {
        label: 'Trial Gratis',
        sublabel: `${trialDays} día${trialDays !== 1 ? 's' : ''} restante${trialDays !== 1 ? 's' : ''}`,
        color: isExpiringSoon ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-blue-100 text-blue-800 border-blue-300',
        icon: ShieldCheckIcon,
        iconColor: isExpiringSoon ? 'text-yellow-600' : 'text-blue-600',
        details: {
          message: `Se cobrará automáticamente el ${formatDate(subscription.trialEndDate)}`,
          type: 'info'
        }
      };
    }

    // ACTIVE - Suscripción activa y pagada
    if (status === 'ACTIVE') {
      const daysUntilRenewal = calculateDaysRemaining(subscription.endDate);
      const isExpiringSoon = daysUntilRenewal <= 7;

      return {
        label: 'Suscripción Activa',
        sublabel: isExpiringSoon 
          ? `Renueva en ${daysUntilRenewal} día${daysUntilRenewal !== 1 ? 's' : ''}` 
          : `Válida hasta ${formatDate(subscription.endDate)}`,
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircleIcon,
        iconColor: 'text-green-600',
        details: {
          message: isExpiringSoon 
            ? `Renovación automática el ${formatDate(subscription.endDate)}`
            : `Próxima renovación: ${formatDate(subscription.endDate)}`,
          type: 'success'
        }
      };
    }

    // PENDING - Pago pendiente
    if (status === 'PENDING') {
      return {
        label: 'Pago Pendiente',
        sublabel: 'Esperando confirmación de pago',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: ClockIcon,
        iconColor: 'text-blue-600',
        details: {
          message: 'El pago está siendo procesado',
          type: 'info'
        }
      };
    }

    // OVERDUE - Pago vencido/fallido
    if (status === 'OVERDUE') {
      const metadata = subscription.metadata || {};
      const failedAttempts = metadata.failed_payment_attempts || 0;
      const maxAttempts = 3;

      return {
        label: 'Pago Vencido',
        sublabel: `Intento ${failedAttempts}/${maxAttempts}`,
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: ExclamationTriangleIcon,
        iconColor: 'text-orange-600',
        details: {
          message: 'Por favor actualiza tu método de pago',
          type: 'warning'
        }
      };
    }

    // SUSPENDED - Suspendida
    if (status === 'SUSPENDED') {
      const metadata = subscription.metadata || {};
      const reason = metadata.suspension_reason || 'unknown';
      
      const reasonMessages = {
        'missing_payment_method': 'Sin método de pago configurado',
        'payment_failed_max_attempts': 'Múltiples fallos de pago',
        'trial_payment_failed_max_attempts': 'Fallo en activación post-trial',
        'expired_payment_method': 'Método de pago expirado'
      };

      return {
        label: 'Suscripción Suspendida',
        sublabel: reasonMessages[reason] || 'Contacta soporte',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircleIcon,
        iconColor: 'text-red-600',
        details: {
          message: 'Actualiza tu método de pago para reactivar',
          type: 'error'
        }
      };
    }

    // EXPIRED - Expirada
    if (status === 'EXPIRED') {
      return {
        label: 'Suscripción Expirada',
        sublabel: `Expiró el ${formatDate(subscription.endDate)}`,
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircleIcon,
        iconColor: 'text-red-600',
        details: {
          message: 'Renueva tu suscripción para continuar',
          type: 'error'
        }
      };
    }

    // CANCELLED - Cancelada
    if (status === 'CANCELLED' || status === 'CANCELED') {
      return {
        label: 'Suscripción Cancelada',
        sublabel: formatDate(subscription.cancelledAt) || 'Cancelada',
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: XCircleIcon,
        iconColor: 'text-gray-600',
        details: {
          message: 'Esta suscripción fue cancelada',
          type: 'info'
        }
      };
    }

    // Default/Unknown
    return {
      label: status || 'Desconocido',
      sublabel: '-',
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: ClockIcon,
      iconColor: 'text-gray-600',
      details: {
        message: '',
        type: 'info'
      }
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Versión compacta (solo badge)
  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
        <span className="font-semibold">{config.label}</span>
      </span>
    );
  }

  // Versión completa con detalles
  return (
    <div className="space-y-2">
      {/* Badge principal */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.color}`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{config.label}</span>
          {config.sublabel && (
            <span className="text-xs opacity-90">{config.sublabel}</span>
          )}
        </div>
      </div>

      {/* Detalles adicionales */}
      {showDetails && config.details.message && (
        <div className={`text-xs p-2 rounded-md flex items-start gap-2 ${
          config.details.type === 'error' ? 'bg-red-50 text-red-700' :
          config.details.type === 'warning' ? 'bg-orange-50 text-orange-700' :
          config.details.type === 'success' ? 'bg-green-50 text-green-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          <CreditCardIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{config.details.message}</span>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatusBadge;
