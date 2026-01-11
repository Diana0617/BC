import React from 'react';
import { 
  ClockIcon, 
  UserIcon, 
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Tarjeta de cita para especialistas
 * Muestra información completa de la cita con indicadores visuales de estado
 */
export default function AppointmentCard({ appointment, onClick }) {
  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-gray-100 text-gray-700 border-gray-300',
      CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-300',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      COMPLETED: 'bg-green-100 text-green-700 border-green-300',
      CANCELED: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completado',
      CANCELED: 'Cancelado',
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: ClockIcon,
      CONFIRMED: CheckCircleIcon,
      IN_PROGRESS: ArrowPathIcon,
      COMPLETED: CheckCircleIcon,
      CANCELED: XCircleIcon,
    };
    return icons[status] || ClockIcon;
  };

  // Formatear fecha
  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime);
  
  let dayLabel = '';
  if (isToday(startDate)) {
    dayLabel = 'Hoy';
  } else if (isTomorrow(startDate)) {
    dayLabel = 'Mañana';
  } else if (isYesterday(startDate)) {
    dayLabel = 'Ayer';
  } else {
    dayLabel = format(startDate, "EEE, d MMM", { locale: es });
  }

  const timeRange = `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`;
  
  const clientName = appointment.client 
    ? `${appointment.client.firstName} ${appointment.client.lastName}`
    : appointment.clientName || 'Sin nombre';
    
  const serviceName = appointment.service?.name || appointment.serviceName || 'Sin servicio';
  
  const StatusIcon = getStatusIcon(appointment.status);

  return (
    <div 
      onClick={() => onClick(appointment)}
      className="bg-white border-l-4 border-blue-500 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Header: Fecha */}
      <div className="flex items-center gap-2 mb-3 text-gray-600 text-sm">
        <ClockIcon className="w-4 h-4" />
        <span className="font-medium">{dayLabel}</span>
        <span className="text-gray-400">•</span>
        <span>{timeRange}</span>
      </div>

      {/* Contenido Principal */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Cliente */}
          <div className="flex items-center gap-2 mb-2">
            <UserIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {clientName}
            </h3>
          </div>

          {/* Servicio */}
          <div className="flex items-center gap-2 text-gray-600">
            <TagIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <p className="text-sm truncate">{serviceName}</p>
          </div>

          {/* Monto si está completado */}
          {appointment.status === 'COMPLETED' && appointment.totalAmount && (
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                Total: <span className="font-semibold text-gray-900">
                  ${appointment.totalAmount.toLocaleString('es-CO')}
                </span>
              </span>
              {appointment.specialistCommission && (
                <span className="text-green-600">
                  Comisión: <span className="font-semibold">
                    ${appointment.specialistCommission.toLocaleString('es-CO')}
                  </span>
                </span>
              )}
            </div>
          )}

          {/* Notas si existen */}
          {appointment.notes && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-1">
              📝 {appointment.notes}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(appointment.status)}`}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-xs font-medium whitespace-nowrap">
            {getStatusText(appointment.status)}
          </span>
        </div>
      </div>

      {/* Origin Badge (si existe) */}
      {appointment.origin && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            {appointment.origin === 'online' && '🌐 Agendado online'}
            {appointment.origin === 'business' && '🏢 Agendado en negocio'}
            {appointment.origin === 'specialist' && '👤 Agendado por especialista'}
          </span>
        </div>
      )}
    </div>
  );
}
