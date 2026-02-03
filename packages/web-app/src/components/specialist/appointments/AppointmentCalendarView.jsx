import  { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay,  startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatInTimezone } from '../../../utils/timezone';

/**
 * Vista de calendario para citas del especialista
 * Soporta vista diaria, semanal y mensual
 */
export default function AppointmentCalendarView({ appointments, currentDate, period, onAppointmentClick }) {
  
  // Obtener timezone del negocio
  const business = useSelector(state => state.business?.currentBusiness)
  const timezone = business?.timezone || 'America/Bogota'
  
  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-gray-400',
      CONFIRMED: 'bg-blue-500',
      IN_PROGRESS: 'bg-yellow-500',
      COMPLETED: 'bg-green-500',
      CANCELED: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completado',
      CANCELED: 'Cancelado',
      NO_SHOW: 'No asistió',
      RESCHEDULED: 'Reprogramado'
    };
    return texts[status] || status;
  };

  // Función para generar el tooltip con información completa (usando timezone)
  const getTooltipText = (apt) => {
    console.log('🔍 Appointment data:', JSON.stringify(apt, null, 2)); // DEBUG
    const clientName = apt.client ? `${apt.client.firstName} ${apt.client.lastName}` : apt.clientName;
    const clientPhone = apt.client?.phone || apt.clientPhone || 'N/A';
    const specialistName = apt.specialist ? `${apt.specialist.firstName} ${apt.specialist.lastName}` : apt.specialistName || '';
    const serviceName = apt.service?.name || apt.serviceName;
    const branchName = apt.branch?.name || apt.branchName || '';
    const duration = apt.service?.duration || '';
    const price = apt.totalAmount || apt.service?.price || '';
    
    // Formatear horas en timezone del negocio
    const startTimeFormatted = formatInTimezone(apt.startTime, timezone, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const endTimeFormatted = formatInTimezone(apt.endTime, timezone, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    return `Cliente: ${clientName}
Teléfono: ${clientPhone}${specialistName ? `\nEspecialista: ${specialistName}` : ''}
Servicio: ${serviceName}${duration ? `\nDuración: ${duration} min` : ''}${price ? `\nPrecio: $${price.toLocaleString()}` : ''}
Horario: ${startTimeFormatted} - ${endTimeFormatted}
Estado: ${getStatusText(apt.status)}${branchName ? `\nSucursal: ${branchName}` : ''}${apt.notes ? `\nNotas: ${apt.notes}` : ''}`;
  };

  // Compute all data at the top level
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const appointmentsByHour = useMemo(() => {
    const byHour = {};
    appointments.forEach(apt => {
      const startDate = new Date(apt.startTime);
      if (isSameDay(startDate, currentDate)) {
        const hour = startDate.getHours();
        if (!byHour[hour]) byHour[hour] = [];
        byHour[hour].push(apt);
      }
    });
    return byHour;
  }, [appointments, currentDate]);

  const appointmentsByDayWeek = useMemo(() => {
    const byDay = {};
    daysOfWeek.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      byDay[dayKey] = appointments.filter(apt => 
        isSameDay(new Date(apt.startTime), day)
      );
    });
    return byDay;
  }, [appointments, daysOfWeek]);

  const appointmentsByDayMonth = useMemo(() => {
    const byDay = {};
    calendarDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      byDay[dayKey] = appointments.filter(apt => 
        isSameDay(new Date(apt.startTime), day)
      );
    });
    return byDay;
  }, [appointments, calendarDays]);

  // Vista Diaria - Timeline por horas
  if (period === 'day') {
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM a 8 PM
    return (
      <div className="space-y-1">
        {hours.map(hour => (
          <div key={hour} className="flex items-start gap-3 py-2 border-b border-gray-100 hover:bg-gray-50">
            <div className="w-20 flex-shrink-0 text-sm font-medium text-gray-600">
              {hour.toString().padStart(2, '0')}:00
            </div>
            <div className="flex-1 min-h-[40px]">
              {appointmentsByHour[hour]?.map(apt => {
                const startDate = new Date(apt.startTime);
                const endDate = new Date(apt.endTime);
                const clientName = apt.client ? `${apt.client.firstName} ${apt.client.lastName}` : apt.clientName;
                const serviceName = apt.service?.name || apt.serviceName;
                
                return (
                  <div
                    key={apt.id}
                    onClick={() => onAppointmentClick(apt)}
                    title={getTooltipText(apt)}
                    className={`${getStatusColor(apt.status)} text-white px-3 py-2 rounded-lg mb-1 cursor-pointer hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{clientName}</p>
                        <p className="text-xs opacity-90 truncate">{serviceName}</p>
                      </div>
                      <div className="text-xs font-medium whitespace-nowrap">
                        {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Vista Semanal - Columnas por día
  if (period === 'week') {
    return (
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map(day => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayAppointments = appointmentsByDayWeek[dayKey] || [];
          const isCurrentDay = isSameDay(day, new Date());
          
          return (
            <div key={dayKey} className="min-h-[300px]">
              {/* Header del día */}
              <div className={`text-center p-2 rounded-t-lg ${isCurrentDay ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                <div className="text-xs font-medium uppercase">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div className={`text-2xl font-bold ${isCurrentDay ? 'text-white' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
              </div>
              
              {/* Citas del día */}
              <div className="space-y-1 p-1 bg-gray-50 rounded-b-lg min-h-[260px]">
                {dayAppointments.map(apt => {
                  const startDate = new Date(apt.startTime);
                  const clientName = apt.client 
                    ? `${apt.client.firstName} ${apt.client.lastName}` 
                    : apt.clientName;
                  
                  return (
                    <div
                      key={apt.id}
                      onClick={() => onAppointmentClick(apt)}
                      title={getTooltipText(apt)}
                      className={`${getStatusColor(apt.status)} text-white px-2 py-1.5 rounded text-xs cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                      <div className="font-semibold truncate">{format(startDate, 'HH:mm')}</div>
                      <div className="truncate opacity-90">{clientName}</div>
                    </div>
                  );
                })}
                {dayAppointments.length === 0 && (
                  <div className="text-center text-gray-400 text-xs py-4">
                    Sin citas
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vista Mensual - Calendario completo
  if (period === 'month') {
    // Agrupar días en semanas
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <div className="space-y-1">
        {/* Encabezados de días */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Semanas */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-1">
            {week.map(day => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayAppointments = appointmentsByDayMonth[dayKey] || [];
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={dayKey}
                  className={`min-h-[100px] p-2 border rounded-lg ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-0.5">
                    {dayAppointments.slice(0, 3).map(apt => (
                      <div
                        key={apt.id}
                        onClick={() => onAppointmentClick(apt)}
                        title={getTooltipText(apt)}
                        className={`${getStatusColor(apt.status)} text-white px-1.5 py-0.5 rounded text-xs cursor-pointer hover:opacity-90 transition-opacity truncate`}
                      >
                        {format(new Date(apt.startTime), 'HH:mm')}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
