import React, { useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import esLocale from '@fullcalendar/core/locales/es'

/**
 * FullCalendarView - Componente de calendario visual con FullCalendar
 * 
 * @param {Array} appointments - Array de citas a mostrar
 * @param {Function} onDateClick - Callback cuando se hace click en una fecha
 * @param {Function} onEventClick - Callback cuando se hace click en un evento
 * @param {Function} onDateSelect - Callback cuando se selecciona un rango de fechas
 * @param {Date} initialDate - Fecha inicial del calendario
 * @param {Array} branches - Array de sucursales (opcional, para colorear por sucursal)
 * @param {Array} branchColors - Array de colores Tailwind para sucursales
 * @param {Boolean} showAllBranches - Si true, colorea eventos por sucursal en lugar de por estado
 */
const FullCalendarView = ({
  appointments = [],
  onDateClick,
  onEventClick,
  onDateSelect,
  initialDate = new Date(),
  height = 'auto',
  branches = [],
  branchColors = [],
  showAllBranches = false
}) => {
  
  // Colores por estado de cita
  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#FFA500',      // Naranja
      CONFIRMED: '#4CAF50',    // Verde
      IN_PROGRESS: '#2196F3',  // Azul
      COMPLETED: '#9E9E9E',    // Gris
      CANCELED: '#F44336',     // Rojo
      NO_SHOW: '#FF6347',      // Rojo tomate
      RESCHEDULED: '#FFD700'   // Dorado
    }
    return colors[status] || '#9E9E9E'
  }
  
  // Obtener color de la sucursal (colores vibrantes y diferenciados)
  const getBranchColor = (branchId) => {
    if (!showAllBranches || !branches.length || !branchId) return null;
    
    const branchIndex = branches.findIndex(b => b.id === branchId);
    if (branchIndex === -1) return null;
    
    // Colores vibrantes y claramente diferenciables para cada sucursal
    const branchColorPalette = [
      '#3B82F6', // Azul brillante
      '#10B981', // Verde brillante
      '#8B5CF6', // Púrpura brillante
      '#EF4444', // Rojo brillante
      '#F59E0B', // Amarillo/Naranja brillante
      '#6366F1'  // Índigo brillante
    ];
    
    return branchColorPalette[branchIndex % branchColorPalette.length];
  };
  
  // Transformar appointments al formato de FullCalendar
  const events = useMemo(() => {
    return appointments.map(appointment => {
      const specialistName = appointment.specialist 
        ? `${appointment.specialist.firstName} ${appointment.specialist.lastName}`
        : appointment.specialistName || 'Sin asignar';
      
      const clientName = appointment.client 
        ? `${appointment.client.firstName} ${appointment.client.lastName}`
        : appointment.clientName || 'Cliente';
      
      // Obtener nombre(s) del servicio - usar services array si está disponible, sino el singular
      let serviceName;
      let servicesList = [];
      
      if (appointment.services && Array.isArray(appointment.services) && appointment.services.length > 0) {
        // Si hay múltiples servicios, mostrarlos todos
        servicesList = appointment.services.map(s => s.name);
        if (servicesList.length > 1) {
          // Mostrar primer servicio + cantidad adicional
          serviceName = `${servicesList[0]} (+${servicesList.length - 1} más)`;
        } else {
          serviceName = servicesList[0];
        }
      } else {
        // Backward compatibility: usar el campo singular
        serviceName = appointment.service?.name || appointment.serviceName || 'Servicio';
        servicesList = [serviceName];
      }
      
      const branchName = appointment.branch?.name || appointment.branchName || 'N/A';
      const branchId = appointment.branch?.id || appointment.branchId;
      
      // Determinar color del evento
      let eventColor;
      if (showAllBranches && branchId) {
        // Si estamos mostrando todas las sucursales, usar color de sucursal
        eventColor = getBranchColor(branchId) || getStatusColor(appointment.status);
      } else {
        // Si no, usar color del perfil del especialista o color por estado
        eventColor = appointment.specialist?.specialistProfile?.profileColor || getStatusColor(appointment.status);
      }
      
      // Agregar nombre de sucursal al título cuando se muestran todas (sin ícono, solo para tooltip)
      const titlePrefix = (showAllBranches && branchName) ? `[${branchName}] ` : '';
      
      return {
        id: appointment.id,
        title: `${titlePrefix}${clientName} - ${serviceName}`,
        start: appointment.startTime,
        end: appointment.endTime,
        backgroundColor: eventColor,
        borderColor: eventColor,
        extendedProps: {
          appointmentId: appointment.id,
          clientName: clientName,
          clientPhone: appointment.client?.phone || appointment.clientPhone,
          specialistName: specialistName,
          specialistId: appointment.specialist?.id,
          serviceName: serviceName,
          servicesList: servicesList, // Array con todos los nombres de servicios
          servicePrice: appointment.service?.price || appointment.servicePrice,
          serviceDuration: appointment.service?.duration,
          totalAmount: appointment.totalAmount,
          status: appointment.status,
          branchName: branchName,
          branchId: branchId,
          branchColor: eventColor,
          notes: appointment.notes,
          showBranchIndicator: showAllBranches,
          // Datos adicionales para el detalle
          appointment: appointment
        }
      };
    })
  }, [appointments, showAllBranches, branches, branchColors])

  // Handler para click en evento
  const handleEventClick = (info) => {
    if (onEventClick) {
      onEventClick({
        event: info.event,
        appointmentId: info.event.id,
        extendedProps: info.event.extendedProps
      })
    }
  }

  // Handler para click en fecha
  const handleDateClick = (info) => {
    if (onDateClick) {
      onDateClick({
        date: info.date,
        dateStr: info.dateStr,
        allDay: info.allDay
      })
    }
  }

  // Handler para selección de rango de fechas
  const handleDateSelect = (info) => {
    if (onDateSelect) {
      onDateSelect({
        start: info.start,
        end: info.end,
        startStr: info.startStr,
        endStr: info.endStr,
        allDay: info.allDay
      })
    }
  }

  return (
    <div className="full-calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        initialDate={initialDate}
        locale={esLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        }}
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
          list: 'Lista'
        }}
        events={events}
        editable={false}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        select={handleDateSelect}
        height={height}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false
        }}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false,
          hour12: false
        }}
        allDaySlot={false}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:30:00"
        nowIndicator={true}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
          startTime: '09:00',
          endTime: '18:00'
        }}
        eventContent={(eventInfo) => {
          const props = eventInfo.event.extendedProps;
          const isListView = eventInfo.view.type === 'listWeek';
          const isDayView = eventInfo.view.type === 'timeGridDay';
          const isWeekView = eventInfo.view.type === 'timeGridWeek';
          
          // Vista de lista - más detalles
          if (isListView) {
            return (
              <div className="fc-event-custom px-2 py-1">
                <div className="text-sm font-semibold">
                  {props.clientName}
                </div>
                <div className="text-xs text-gray-600">
                  👤 {props.specialistName}
                </div>
                {props.showBranchIndicator && props.branchName && (
                  <div className="text-xs text-gray-600 font-medium">
                    🏪 {props.branchName}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {props.serviceName}
                </div>
              </div>
            );
          }
          
          // Vista de día/semana - detalles completos
          if (isDayView || isWeekView) {
            return (
              <div className="fc-event-custom px-2 py-1 cursor-pointer hover:opacity-90 transition-opacity text-white">
                <div className="text-xs font-semibold truncate">
                  {eventInfo.timeText && (
                    <span className="mr-1">{eventInfo.timeText}</span>
                  )}
                </div>
                <div className="text-xs font-medium truncate">
                  {props.clientName}
                </div>
                <div className="text-xs truncate opacity-90">
                  👤 {props.specialistName}
                </div>
                {props.showBranchIndicator && props.branchName && (
                  <div className="text-xs truncate opacity-90 font-medium">
                    🏪 {props.branchName}
                  </div>
                )}
                <div className="text-xs truncate opacity-80">
                  {props.serviceName}
                </div>
              </div>
            );
          }
          
          // Vista de mes - versión compacta con indicador de sucursal
          return (
            <div className="fc-event-custom px-1 py-0.5 cursor-pointer hover:opacity-90 transition-opacity">
              <div 
                className="text-xs font-semibold truncate"
                style={{ 
                  color: props.showBranchIndicator && props.branchColor ? props.branchColor : 'inherit',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                {props.showBranchIndicator && props.branchName && (
                  <span className="mr-1">●</span>
                )}
                {props.clientName} - {props.serviceName}
              </div>
            </div>
          );
        }}
        eventDidMount={(info) => {
          // Agregar tooltip con más información
          const props = info.event.extendedProps;
          info.el.title = `
Cliente: ${props.clientName}
Teléfono: ${props.clientPhone || 'N/A'}
Especialista: ${props.specialistName}
Servicio: ${props.serviceName}
Duración: ${props.serviceDuration || 'N/A'} min
Precio: $${props.totalAmount || props.servicePrice || 'N/A'}
Estado: ${props.status}
${props.branchName ? 'Sucursal: ' + props.branchName : ''}
${props.notes ? 'Notas: ' + props.notes : ''}
          `.trim();
        }}
      />

      {/* Estilos personalizados */}
      <style jsx global>{`
        .full-calendar-wrapper {
          background: white;
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .fc {
          font-family: inherit;
        }
        
        .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .fc-button {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
          text-transform: capitalize;
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
        }
        
        .fc-button:hover {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }
        
        .fc-button-active {
          background-color: #1e40af !important;
          border-color: #1e40af !important;
        }
        
        .fc-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .fc-daygrid-day-number {
          font-weight: 500;
          color: #374151;
        }
        
        .fc-col-header-cell {
          background-color: #f3f4f6;
          font-weight: 600;
          color: #4b5563;
          text-transform: uppercase;
          font-size: 0.75rem;
        }
        
        .fc-daygrid-day-top {
          justify-content: center;
        }
        
        .fc-event {
          border-radius: 0.25rem;
          cursor: pointer;
        }
        
        .fc-event:hover {
          opacity: 0.85;
        }
        
        /* Vista mensual: fondo blanco con borde de color */
        .fc-daygrid-event {
          padding: 2px 4px;
          background-color: rgba(255, 255, 255, 0.95) !important;
          border: 2px solid currentColor !important;
          border-left-width: 4px;
        }
        
        /* Vista semanal/diaria: fondo de color (del backgroundColor del evento) */
        .fc-timegrid-event {
          border: none !important;
          /* El background-color viene del evento */
        }
        
        .fc-timegrid-event .fc-event-custom {
          color: white !important;
        }
        
        .fc-event-custom {
          overflow: hidden;
        }
        
        .fc-daygrid-day.fc-day-today {
          background-color: #eff6ff !important;
        }
        
        .fc-timegrid-slot {
          height: 3rem;
        }
        
        .fc-list-event:hover {
          background-color: #f3f4f6;
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
            width: 100%;
          }
          
          .fc-button {
            padding: 0.375rem 0.5rem;
            font-size: 0.875rem;
          }
          
          .fc-toolbar-title {
            font-size: 1rem;
            margin: 0.5rem 0;
          }
        }
      `}</style>
    </div>
  )
}

export default FullCalendarView
