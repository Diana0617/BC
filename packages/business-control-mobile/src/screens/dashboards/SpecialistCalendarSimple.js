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
import { setFilters } from '@shared/store/slices/specialistDashboardSlice';
import { useAppointments } from '../../hooks/useAppointments';

export default function SpecialistCalendarSimple() {
  const dispatch = useDispatch();
  
  // Redux state
  const { filters } = useSelector(state => state.specialistDashboard);
  
  // Local state - simplificado
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  const [calendarKey, setCalendarKey] = useState(0); // Key para forzar re-render
  
  // Obtener user para businessId
  const { user } = useSelector(state => state.auth);
  
  // Inicializar filtros cuando el usuario esté disponible
  useEffect(() => {
    if (user?.businessId && !filters.businessId) {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      console.log('📅 Setting filters with businessId:', {
        businessId: user.businessId,
        date: todayString,
        period: viewMode
      });
      
      dispatch(setFilters({
        date: todayString,
        period: viewMode,
        businessId: user.businessId,
        branchId: null,
        status: null
      }));
    }
  }, [user?.businessId, dispatch, viewMode]);
  
  // Actualizar filtros cuando cambie la fecha o modo de vista
  useEffect(() => {
    if (filters.businessId) {
      const dateString = calendarDate.toISOString().split('T')[0];
      if (filters.date !== dateString || filters.period !== viewMode) {
        console.log('📅 Updating filters for date/view change:', {
          oldDate: filters.date,
          newDate: dateString,
          oldPeriod: filters.period,
          newPeriod: viewMode
        });
        
        dispatch(setFilters({
          ...filters,
          date: dateString,
          period: viewMode
        }));
      }
    }
  }, [calendarDate, viewMode, filters, dispatch]);
  
  // Hook para appointments
  const { 
    appointments: rawAppointments, 
    loading, 
    error, 
    refetch,
    fetchAppointments
  } = useAppointments();
  
  // Cargar appointments cuando los filtros estén listos
  useEffect(() => {
    if (filters.businessId && filters.date && filters.period) {
      console.log('📅 Loading appointments with filters:', filters);
      fetchAppointments(filters);
    }
  }, [filters, fetchAppointments]);

  // Formatear appointments para el calendario
  const calendarEvents = useMemo(() => {
    console.log('📅 Calendar Events Debug:', {
      rawAppointments: rawAppointments?.length || 0,
      loading,
      error,
      filters,
      user: user ? { businessId: user.businessId, role: user.role } : null,
      calendarDate: calendarDate.toISOString().split('T')[0]
    });
    
    if (!rawAppointments?.length) {
      console.log('📅 No appointments for calendar');
      return [];
    }

    const events = rawAppointments.map((appointment, index) => {
      try {
        // Fechas UTC directas del backend
        const start = new Date(appointment.startTime);
        const end = new Date(appointment.endTime);
        
        // Validar fechas
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn('Invalid appointment date:', appointment);
          return null;
        }

        // Crear fechas apropiadas según la vista
        let localStart, localEnd;
        
        if (viewMode === 'month') {
          // Para vista mensual, usar las fechas originales
          localStart = new Date(start.getTime());
          localEnd = new Date(end.getTime());
        } else {
          // Para vista día y semana, crear fechas locales sin timezone offset
          const startDate = new Date(appointment.startTime);
          const endDate = new Date(appointment.endTime);
          
          // Crear nuevas fechas ajustando el offset de timezone
          localStart = new Date(startDate.getTime() - (startDate.getTimezoneOffset() * 60000));
          localEnd = new Date(endDate.getTime() - (endDate.getTimezoneOffset() * 60000));
        }

        console.log(`Event ${index}:`, {
          originalStart: start.toISOString(),
          originalEnd: end.toISOString(),
          localStart: localStart.toISOString(),
          localEnd: localEnd.toISOString(),
          title: `${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`.trim(),
          service: appointment.service?.name
        });

        return {
          title: `${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`.trim() || 'Cliente',
          start: localStart,
          end: localEnd,
          id: appointment.id || `event-${index}`,
          // Simplificar datos adicionales
          clientName: `${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`.trim(),
          serviceName: appointment.service?.name || 'Servicio',
          status: appointment.status || 'PENDING'
        };
      } catch (error) {
        console.error('Error formatting appointment for calendar:', error);
        return null;
      }
    }).filter(Boolean);

    console.log('📅 Calendar events created:', events.length);
    console.log('📅 Events array:', events);
    return events;
  }, [rawAppointments, viewMode]); // Agregar viewMode como dependencia

  // Forzar re-render del calendario cuando cambien los eventos
  useEffect(() => {
    if (calendarEvents.length > 0) {
      console.log('🔄 Forcing calendar re-render due to events change');
      setCalendarKey(prev => prev + 1);
    }
  }, [calendarEvents.length]);

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
    const newFilters = {
      ...filters,
      date: dateString,
      period: viewMode
    };
    
    dispatch(setFilters(newFilters));
    
    // Cargar appointments para la nueva fecha
    if (newFilters.businessId) {
      console.log('📅 Navigating to date, loading appointments:', newFilters);
      fetchAppointments(newFilters);
    }
  }, [calendarDate, viewMode, filters, dispatch, fetchAppointments]);

  // Ir a hoy
  const goToToday = useCallback(() => {
    const today = new Date();
    setCalendarDate(today);
    
    const todayString = today.toISOString().split('T')[0];
    const newFilters = {
      ...filters,
      date: todayString,
      period: viewMode
    };
    
    dispatch(setFilters(newFilters));
    
    // Cargar appointments para hoy
    if (newFilters.businessId) {
      console.log('📅 Going to today, loading appointments:', newFilters);
      fetchAppointments(newFilters);
    }
  }, [viewMode, filters, dispatch, fetchAppointments]);

  // Cambiar modo de vista
  const changeViewMode = useCallback((mode) => {
    setViewMode(mode);
    
    const newFilters = {
      ...filters,
      period: mode
    };
    
    dispatch(setFilters(newFilters));
    
    // Recargar appointments con el nuevo período
    if (newFilters.businessId) {
      console.log('📅 Changing view mode, loading appointments:', newFilters);
      fetchAppointments(newFilters);
    }
  }, [filters, dispatch, fetchAppointments]);

  // Manejar presión en evento
  const handleEventPress = useCallback((event) => {
    console.log('Event pressed:', event);
    Alert.alert(
      `${event.clientName}`,
      `Servicio: ${event.serviceName}\nEstado: ${event.status}`,
      [{ text: 'OK' }]
    );
  }, []);

  // Log final antes del render
  console.log('📅 Rendering calendar with:', {
    eventsCount: calendarEvents.length,
    date: calendarDate.toISOString(),
    mode: viewMode,
    events: calendarEvents
  });

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
          key={`calendar-${calendarKey}-${calendarEvents.length}`} // Key única para forzar re-render
          events={calendarEvents}
          height={500}
          date={calendarDate}
          mode={viewMode}
          onPressEvent={handleEventPress}
          locale="es"
          ampm={false}
          showTime={true}
          scrollOffsetMinutes={viewMode === 'day' || viewMode === 'week' ? 720 : 600} // 12:00 PM para día/semana, 10:00 AM para mes
          hourRowHeight={60}
          eventMinHeightForMonthView={20}
          theme={{
            palette: {
              primary: {
                main: '#3b82f6',
                contrastText: '#ffffff',
              },
              gray: {
                100: '#f3f4f6',
                200: '#e5e7eb',
                300: '#d1d5db',
                500: '#6b7280',
                800: '#1f2937',
              },
            },
          }}
          eventCellStyle={(event) => ({
            backgroundColor: '#3b82f6',
            borderRadius: 4,
            padding: 2,
            minHeight: 20,
          })}
          renderEvent={(event) => (
            <View style={[styles.eventContainer, { backgroundColor: '#3b82f6' }]}>
              <Text style={styles.eventTime} numberOfLines={1}>
                {event.start.toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
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
        <Text style={styles.debugText}>
          Raw Appointments: {rawAppointments?.length || 0} | Loading: {loading ? 'Sí' : 'No'}
        </Text>
        {calendarEvents.length > 0 && (
          <Text style={styles.debugText}>
            Primer evento: {calendarEvents[0].title} - {calendarEvents[0].start.toLocaleString('es-CO')}
          </Text>
        )}
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
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    minHeight: 20,
    justifyContent: 'center',
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