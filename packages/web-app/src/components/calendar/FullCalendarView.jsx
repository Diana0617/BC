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
 */
const FullCalendarView = ({
  appointments = [],
  onDateClick,
  onEventClick,
  onDateSelect,
  initialDate = new Date(),
  height = 'auto'
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
  
  // Transformar appointments al formato de FullCalendar
  const events = useMemo(() => {
    return appointments.map(appointment => {
      const specialistName = appointment.specialist 
        ? `${appointment.specialist.firstName} ${appointment.specialist.lastName}`
        : appointment.specialistName || 'Sin asignar';
      
      const clientName = appointment.client 
        ? `${appointment.client.firstName} ${appointment.client.lastName}`
        : appointment.clientName || 'Cliente';
      
      const serviceName = appointment.service?.name || appointment.serviceName || 'Servicio';
      
      // Usar el color del perfil del especialista, o color por defecto según estado
      const eventColor = appointment.specialist?.specialistProfile?.profileColor || getStatusColor(appointment.status);
      
      return {
        id: appointment.id,
        title: `${clientName} - ${serviceName}`,
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
          servicePrice: appointment.service?.price || appointment.servicePrice,
          serviceDuration: appointment.service?.duration,
          totalAmount: appointment.totalAmount,
          status: appointment.status,
          branchName: appointment.branch?.name || appointment.branchName,
          notes: appointment.notes,
          // Datos adicionales para el detalle
          appointment: appointment
        }
      };
    })
  }, [appointments])

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
          return (
            <div className="fc-event-custom px-2 py-1 cursor-pointer hover:opacity-90 transition-opacity">
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
              <div className="text-xs truncate opacity-80">
                {props.serviceName}
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
${props.notes ? '\nNotas: ' + props.notes : ''}
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
          border-left-width: 3px;
          cursor: pointer;
        }
        
        .fc-event:hover {
          opacity: 0.8;
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
