import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { setFilters } from '../../redux/slices/specialistDashboardSlice';
import { useAppointments } from '../../hooks/useAppointments';

export default function SpecialistCalendarSimple() {
  const dispatch = useDispatch();
  
  // Redux state
  const { filters } = useSelector(state => state.specialistDashboard);
  
  // Local state - simplificado
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  
  // Hook para appointments
  const { 
    appointments: rawAppointments, 
    loading, 
    error, 
    refetch 
  } = useAppointments();

  // Formatear appointments para el calendario
  const calendarEvents = useMemo(() => {
    if (!rawAppointments?.length) {
      console.log('📅 No appointments for calendar');
      return [];
    }

    const events = rawAppointments.map(appointment => {
      try {
        // Fechas UTC directas del backend
        const start = new Date(appointment.startTime);
        const end = new Date(appointment.endTime);
        
        // Validar fechas
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn('Invalid appointment date:', appointment);
          return null;
        }

        return {
          title: `${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`.trim() || 'Cliente',
          start,
          end,
          id: appointment.id,
          // Datos adicionales
          clientName: `${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`.trim(),
          serviceName: appointment.service?.name || 'Servicio',
          status: appointment.status || 'PENDING',
          originalAppointment: appointment
        };
      } catch (error) {
        console.error('Error formatting appointment for calendar:', error);
        return null;
      }
    }).filter(Boolean);

    console.log('📅 Calendar events created:', events.length);
    return events;
  }, [rawAppointments]);

  // Navegar fechas
  const navigateDate = useCallback((direction) => {
    const newDate = new Date(calendarDate);
    
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCalendarDate(newDate);
    
    // Actualizar filtros para cargar datos del nuevo día
    const dateString = newDate.toISOString().split('T')[0];
    dispatch(setFilters({
      ...filters,
      date: dateString,
      period: viewMode
    }));
  }, [calendarDate, viewMode, filters, dispatch]);

  // Ir a hoy
  const goToToday = useCallback(() => {
    const today = new Date();
    setCalendarDate(today);
    
    const todayString = today.toISOString().split('T')[0];
    dispatch(setFilters({
      ...filters,
      date: todayString,
      period: viewMode
    }));
  }, [viewMode, filters, dispatch]);

  // Cambiar modo de vista
  const changeViewMode = useCallback((mode) => {
    setViewMode(mode);
    dispatch(setFilters({
      ...filters,
      period: mode
    }));
  }, [filters, dispatch]);

  // Manejar presión en evento
  const handleEventPress = useCallback((event) => {
    console.log('Event pressed:', event);
    Alert.alert(
      `${event.clientName}`,
      `Servicio: ${event.serviceName}\nEstado: ${event.status}`,
      [{ text: 'OK' }]
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* Header con navegación */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateDate('prev')}>
          <Ionicons name="chevron-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToToday} style={styles.dateButton}>
          <Text style={styles.dateText}>
            {calendarDate.toLocaleDateString('es-CO', { 
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              timeZone: 'America/Bogota'
            })}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigateDate('next')}>
          <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Selector de vista */}
      <View style={styles.viewSelector}>
        {['day', 'week', 'month'].map(mode => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.viewButton,
              viewMode === mode && styles.activeViewButton
            ]}
            onPress={() => changeViewMode(mode)}
          >
            <Text style={[
              styles.viewButtonText,
              viewMode === mode && styles.activeViewButtonText
            ]}>
              {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : 'Mes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Calendario */}
      <View style={styles.calendarContainer}>
        <Calendar
          events={calendarEvents}
          height={500}
          date={calendarDate}
          mode={viewMode}
          onPressEvent={handleEventPress}
          locale="es-CO"
          ampm={false}
          showTime={true}
          scrollOffsetMinutes={480} // Empezar a las 8:00 AM
          eventCellStyle={(event) => ({
            backgroundColor: 
              event.status === 'COMPLETED' ? '#10b981' :
              event.status === 'IN_PROGRESS' ? '#f59e0b' :
              event.status === 'CONFIRMED' ? '#3b82f6' :
              event.status === 'CANCELED' ? '#ef4444' :
              '#9ca3af',
          })}
          renderEvent={(event) => (
            <View style={styles.eventContainer}>
              <Text style={styles.eventTime} numberOfLines={1}>
                {event.start.toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'America/Bogota'
                })}
              </Text>
              <Text style={styles.eventTitle} numberOfLines={1}>
                {event.title}
              </Text>
              <Text style={styles.eventService} numberOfLines={1}>
                {event.serviceName}
              </Text>
            </View>
          )}
        />
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando eventos...</Text>
        </View>
      )}

      {/* Debug info */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          Eventos: {calendarEvents.length} | Fecha: {calendarDate.toDateString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeViewButton: {
    backgroundColor: '#3b82f6',
  },
  viewButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeViewButtonText: {
    color: 'white',
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventContainer: {
    flex: 1,
    padding: 4,
  },
  eventTime: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  eventService: {
    fontSize: 10,
    color: 'white',
    opacity: 0.9,
  },
  loadingContainer: {
    position: 'absolute',
    top: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingText: {
    color: '#64748b',
    fontSize: 16,
  },
  debugContainer: {
    padding: 12,
    backgroundColor: '#f1f5f9',
  },
  debugText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});