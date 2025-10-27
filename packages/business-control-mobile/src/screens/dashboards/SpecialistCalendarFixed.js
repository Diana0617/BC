import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Calendar, Agenda } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { setFilters } from '@shared/store/slices/specialistDashboardSlice';
import { useAppointments } from '../../hooks/useAppointments';

const SpecialistCalendarFixed = ({ navigation }) => {
  // Estados locales
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' o 'agenda'
  const [selectedDate, setSelectedDate] = useState(() => {
    // VALIDACIÓN DE FECHA INICIAL
    try {
      const today = new Date();
      if (isNaN(today.getTime())) {
        console.warn('⚠️ Fecha actual inválida, usando 2025-10-27');
        return '2025-10-27';
      }
      return today.toISOString().split('T')[0];
    } catch (err) {
      console.warn('⚠️ Error obteniendo fecha actual:', err.message);
      return '2025-10-27'; // Fallback seguro
    }
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Redux
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const filters = useSelector(state => state.specialistDashboard.filters);

  // Hook para appointments - NO usar en useEffect para evitar bucles
  const { 
    appointments: rawAppointments, 
    loading, 
    error, 
    fetchAppointments
  } = useAppointments();

  // SOLO inicializar filtros UNA VEZ
  useEffect(() => {
    if (user?.businessId && !isInitialized) {
      // VALIDACIÓN DE FECHA SEGURA
      let today;
      try {
        today = new Date().toISOString().split('T')[0];
        // Verificar que la fecha sea válida
        const testDate = new Date(today);
        if (isNaN(testDate.getTime())) {
          throw new Error('Fecha inválida');
        }
      } catch (err) {
        console.warn('⚠️ Error con fecha actual, usando fallback:', err.message);
        today = '2025-10-27'; // Fallback seguro
      }
      
      console.log('🎯 INICIALIZACIÓN ÚNICA - Setting filters');
      dispatch(setFilters({
        date: today,
        period: 'month',
        businessId: user.businessId,
        branchId: null,
        status: null
      }));
      
      setSelectedDate(today);
      setIsInitialized(true);
    }
  }, [user?.businessId, isInitialized, dispatch]);

  // CARGAR appointments solo cuando esté inicializado
  useEffect(() => {
    if (isInitialized && filters.businessId) {
      const appointmentFilters = {
        businessId: filters.businessId,
        date: selectedDate,
        period: 'month',
        branchId: null,
        status: null
      };
      
      console.log('📅 CARGA ÚNICA - Loading appointments:', appointmentFilters);
      console.log('📅 DEBUGGING - Selected date:', selectedDate, 'Type:', typeof selectedDate);
      
      fetchAppointments(appointmentFilters);
    }
  }, [isInitialized, filters.businessId, selectedDate]); // NO incluir fetchAppointments
  
  // LOGGING DE APPOINTMENTS PARA DEBUG
  useEffect(() => {
    if (rawAppointments?.length) {
      console.log('🔍 DEBUGGING APPOINTMENTS:');
      rawAppointments.forEach((appointment, index) => {
        console.log(`Appointment ${index + 1}:`, {
          id: appointment.id,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          startTimeType: typeof appointment.startTime,
          endTimeType: typeof appointment.endTime
        });
      });
    }
  }, [rawAppointments]);

  // Formatear appointments para calendario - MEMOIZADO CON VALIDACIÓN DE FECHAS
  const markedDates = useMemo(() => {
    const marked = {};
    
    console.log('🔄 Procesando appointments para marcar fechas:', rawAppointments?.length || 0);
    
    if (rawAppointments?.length) {
      rawAppointments.forEach(appointment => {
        try {
          // VALIDACIÓN ROBUSTA DE FECHAS
          const startTime = appointment.startTime;
          if (!startTime) {
            console.warn('⚠️ Appointment sin startTime:', appointment.id);
            return;
          }

          const startDate = new Date(startTime);
          
          // Verificar si la fecha es válida
          if (isNaN(startDate.getTime())) {
            console.warn('⚠️ Fecha inválida en appointment:', appointment.id, startTime);
            return;
          }

          // Verificar rangos razonables (no fechas muy antiguas o muy futuras)
          const currentYear = new Date().getFullYear();
          const appointmentYear = startDate.getFullYear();
          
          if (appointmentYear < currentYear - 1 || appointmentYear > currentYear + 5) {
            console.warn('⚠️ Fecha fuera de rango razonable:', appointment.id, startTime);
            return;
          }

          const date = startDate.toISOString().split('T')[0];
          
          if (!marked[date]) {
            marked[date] = {
              marked: true,
              dots: [{
                key: appointment.id,
                color: appointment.status === 'COMPLETED' ? '#10b981' :
                       appointment.status === 'CONFIRMED' ? '#3b82f6' :
                       appointment.status === 'CANCELED' ? '#ef4444' :
                       '#9ca3af'
              }]
            };
          } else {
            marked[date].dots.push({
              key: appointment.id,
              color: '#3b82f6'
            });
          }
        } catch (err) {
          console.warn('⚠️ Error procesando appointment:', appointment.id, err.message);
        }
      });
    }
    
    // Marcar día seleccionado
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = '#3b82f6';
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: '#3b82f6'
      };
    }
    
    console.log('✅ Fechas marcadas:', Object.keys(marked).length);
    return marked;
  }, [rawAppointments, selectedDate]);

  // Formatear appointments para agenda - MEMOIZADO CON VALIDACIÓN DE FECHAS
  const agendaItems = useMemo(() => {
    const items = {};
    
    console.log('🔄 Procesando appointments para agenda:', rawAppointments?.length || 0);
    
    if (rawAppointments?.length) {
      rawAppointments.forEach(appointment => {
        try {
          // VALIDACIÓN ROBUSTA DE FECHAS
          const startTime = appointment.startTime;
          const endTime = appointment.endTime;
          
          if (!startTime || !endTime) {
            console.warn('⚠️ Appointment sin startTime o endTime:', appointment.id);
            return;
          }

          const startDate = new Date(startTime);
          const endDate = new Date(endTime);
          
          // Verificar si las fechas son válidas
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.warn('⚠️ Fechas inválidas en appointment:', appointment.id, { startTime, endTime });
            return;
          }

          // Verificar rangos razonables
          const currentYear = new Date().getFullYear();
          const appointmentYear = startDate.getFullYear();
          
          if (appointmentYear < currentYear - 1 || appointmentYear > currentYear + 5) {
            console.warn('⚠️ Fecha fuera de rango razonable:', appointment.id, startTime);
            return;
          }

          const date = startDate.toISOString().split('T')[0];
          
          if (!items[date]) {
            items[date] = [];
          }
          
          items[date].push({
            id: appointment.id,
            name: `${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`.trim() || 'Cliente',
            service: appointment.service?.name || 'Servicio',
            time: `${startDate.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })} - ${endDate.toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}`,
            status: appointment.status,
            appointment: appointment
          });
        } catch (err) {
          console.warn('⚠️ Error procesando appointment para agenda:', appointment.id, err.message);
        }
      });
      
      // Ordenar por hora
      Object.keys(items).forEach(date => {
        items[date].sort((a, b) => {
          return new Date(a.appointment.startTime) - new Date(b.appointment.startTime);
        });
      });
    }
    
    console.log('✅ Items de agenda procesados');
    return items;
  }, [rawAppointments]);

  // Manejar selección de fecha - SIN useCallback para evitar bucles
  const handleDayPress = (day) => {
    try {
      // VALIDAR FECHA SELECCIONADA
      const dateString = day.dateString;
      if (!dateString) {
        console.warn('⚠️ dateString vacío en handleDayPress');
        return;
      }

      const testDate = new Date(dateString);
      if (isNaN(testDate.getTime())) {
        console.warn('⚠️ Fecha inválida seleccionada:', dateString);
        return;
      }

      console.log('📅 Fecha seleccionada:', dateString);
      setSelectedDate(dateString);
    } catch (err) {
      console.warn('⚠️ Error en handleDayPress:', err.message);
    }
  };

  // Cambiar modo de vista
  const toggleViewMode = () => {
    setViewMode(viewMode === 'calendar' ? 'agenda' : 'calendar');
  };

  // Obtener color del status
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#10b981';
      case 'CONFIRMED': return '#3b82f6';
      case 'IN_PROGRESS': return '#f59e0b';
      case 'CANCELED': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  // Obtener texto del status
  const getStatusText = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Completada';
      case 'CONFIRMED': return 'Confirmada';
      case 'IN_PROGRESS': return 'En progreso';
      case 'CANCELED': return 'Cancelada';
      case 'PENDING': return 'Pendiente';
      default: return status;
    }
  };

  // Renderizar item de agenda
  const renderAgendaItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.agendaItem}
      onPress={() => {
        Alert.alert(
          'Detalles de la cita',
          `Cliente: ${item.name}\nServicio: ${item.service}\nHora: ${item.time}\nEstado: ${getStatusText(item.status)}`
        );
      }}
    >
      <View style={styles.agendaItemContent}>
        <View style={styles.agendaItemHeader}>
          <Text style={styles.agendaItemTime}>{item.time}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        <Text style={styles.agendaItemClient}>{item.name}</Text>
        <Text style={styles.agendaItemService}>{item.service}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Inicializando calendario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con toggle */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Mi Calendario</Text>
        
        <TouchableOpacity onPress={toggleViewMode} style={styles.toggleButton}>
          <Ionicons 
            name={viewMode === 'calendar' ? 'list' : 'calendar'} 
            size={24} 
            color="#3b82f6" 
          />
        </TouchableOpacity>
      </View>

      {/* Fecha seleccionada */}
      <View style={styles.dateInfo}>
        <Text style={styles.selectedDate}>
          {(() => {
            try {
              const date = new Date(selectedDate);
              if (isNaN(date.getTime())) {
                return 'Fecha inválida';
              }
              return date.toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            } catch (err) {
              console.warn('⚠️ Error formateando fecha:', err.message);
              return 'Error en fecha';
            }
          })()}
        </Text>
        <Text style={styles.appointmentCount}>
          {agendaItems[selectedDate]?.length || 0} citas
        </Text>
      </View>

      {/* Loading/Error */}
      {loading && (
        <View style={styles.statusContainer}>
          <Text>Cargando citas...</Text>
        </View>
      )}

      {error && (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {/* Contenido principal */}
      {viewMode === 'calendar' ? (
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#3b82f6',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#3b82f6',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#3b82f6',
              selectedDotColor: '#ffffff',
              arrowColor: '#3b82f6',
              disabledArrowColor: '#d9e1e8',
              monthTextColor: '#2d4150',
              indicatorColor: '#3b82f6',
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
            hideExtraDays={true}
            firstDay={1}
            showWeekNumbers={false}
          />
          
          {/* Lista de citas del día seleccionado */}
          <ScrollView style={styles.dayAppointments}>
            <Text style={styles.dayAppointmentsTitle}>
              Citas para {new Date(selectedDate).toLocaleDateString('es-CO', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </Text>
            {agendaItems[selectedDate]?.length ? (
              agendaItems[selectedDate].map(item => renderAgendaItem(item))
            ) : (
              <Text style={styles.noAppointments}>No hay citas para este día</Text>
            )}
          </ScrollView>
        </View>
      ) : (
        <Agenda
          items={agendaItems}
          selected={selectedDate}
          renderItem={renderAgendaItem}
          renderEmptyDate={() => (
            <View style={styles.emptyDate}>
              <Text style={styles.emptyDateText}>Sin citas</Text>
            </View>
          )}
          showClosingKnob={true}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#3b82f6',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#3b82f6',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#3b82f6',
            selectedDotColor: '#ffffff',
            arrowColor: '#3b82f6',
            monthTextColor: '#2d4150',
            agendaKnobColor: '#3b82f6',
            agendaDayTextColor: '#2d4150',
            agendaDayNumColor: '#2d4150',
            agendaTodayColor: '#3b82f6',
            agendaKnobColor: '#3b82f6'
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  toggleButton: {
    padding: 8,
  },
  dateInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  appointmentCount: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  statusContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
  },
  calendarContainer: {
    flex: 1,
  },
  dayAppointments: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
  },
  dayAppointmentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginVertical: 16,
    textTransform: 'capitalize',
  },
  agendaItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  agendaItemContent: {
    flex: 1,
  },
  agendaItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  agendaItemTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  agendaItemClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  agendaItemService: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyDate: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyDateText: {
    color: '#64748b',
    fontSize: 14,
  },
  noAppointments: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    marginTop: 32,
    fontStyle: 'italic',
  },
});

export default SpecialistCalendarFixed;