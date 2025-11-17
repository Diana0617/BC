import React from 'react';
import { AlertTriangleIcon, XCircleIcon, InfoIcon, XIcon, CreditCardIcon } from 'lucide-react';

const SubscriptionWarningBanner = ({ warning, onDismiss, onRenew }) => {
  if (!warning) return null;

  const getIconAndColor = () => {
    switch (warning.severity) {
      case 'error':
        return {
          icon: <XCircleIcon className="h-6 w-6" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          buttonColor: 'text-red-600 hover:text-red-800',
          renewButtonColor: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          icon: <AlertTriangleIcon className="h-6 w-6" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          buttonColor: 'text-yellow-600 hover:text-yellow-800',
          renewButtonColor: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'info':
      default:
        return {
          icon: <InfoIcon className="h-6 w-6" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          buttonColor: 'text-blue-600 hover:text-blue-800',
          renewButtonColor: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const { icon, bgColor, borderColor, textColor, iconColor, buttonColor, renewButtonColor } = getIconAndColor();

  const showRenewButton = warning.type === 'TRIAL_EXPIRED' || warning.type === 'TRIAL_ENDING';

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} p-4 mb-4 rounded-r-lg shadow-sm`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${iconColor}`}>
          {icon}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>
            {warning.message}
          </p>
          {warning.daysLeft && !warning.dataRetention && (
            <p className={`text-xs mt-1 ${textColor} opacity-75`}>
              Días restantes: {warning.daysLeft}
            </p>
          )}
          {warning.dataRetention && (
            <p className={`text-xs mt-1 ${textColor} font-semibold`}>
              ⚠️ Tus datos se eliminarán automáticamente en {warning.dataRetention.daysLeft} día{warning.dataRetention.daysLeft !== 1 ? 's' : ''} si no renuevas.
            </p>
          )}
          {showRenewButton && (
            <div className="mt-3">
              <button
                onClick={onRenew}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${renewButtonColor} transition-colors duration-200`}
              >
                <CreditCardIcon className="h-4 w-4" />
                Renovar Suscripción
              </button>
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex ${buttonColor} focus:outline-none`}
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionWarningBanner;
