import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

export default function SpecialistCalendarReliable() {
  const dispatch = useDispatch();
  
  // Redux state
  const { filters } = useSelector(state => state.specialistDashboard);
  
  // Local state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [viewMode, setViewMode] = useState('agenda'); // calendar, agenda
  
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
        period: 'day'
      });
      
      dispatch(setFilters({
        date: todayString,
        period: 'day',
        businessId: user.businessId,
        branchId: null,
        status: null
      }));
    }
  }, [user?.businessId, filters.businessId, dispatch]); // Mantener filters.businessId para evitar re-ejecución
  
  // Hook para appointments
  const { 
    appointments: rawAppointments, 
    loading, 
    error, 
    fetchAppointments
  } = useAppointments();

  // Envolver fetchAppointments en useCallback SIMPLIFICADO
  const fetchAppointmentsCallback = useCallback((newFilters) => {
    console.log('📞 Fetching appointments with:', newFilters);
    fetchAppointments(newFilters);
  }, []); // Sin dependencias para evitar bucles
  
  // Cargar appointments cuando los filtros estén listos
  useEffect(() => {
    if (filters.businessId && selectedDate) {
      const newFilters = {
        ...filters,
        date: selectedDate,
        period: 'month'
      };
      
      console.log('📅 Loading appointments with filters:', newFilters);
      fetchAppointmentsCallback(newFilters);
    }
  }, [filters.businessId, selectedDate]); // Sin fetchAppointmentsCallback

  // Formatear appointments para react-native-calendars
  const markedDates = useMemo(() => {
    const marked = {};
    
    if (rawAppointments?.length) {
      rawAppointments.forEach(appointment => {
        const date = new Date(appointment.startTime).toISOString().split('T')[0];
        
        if (!marked[date]) {
          marked[date] = {
            marked: true,
            dots: [{
              key: appointment.id,
              color: appointment.status === 'COMPLETED' ? '#10b981' :
                     appointment.status === 'IN_PROGRESS' ? '#f59e0b' :
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
    
    console.log('📅 Marked dates:', Object.keys(marked).length, 'days with events');
    return marked;
  }, [rawAppointments, selectedDate]);

  // Formatear appointments para agenda
  const agendaItems = useMemo(() => {
    const items = {};
    
    if (rawAppointments?.length) {
      rawAppointments.forEach(appointment => {
        const date = new Date(appointment.startTime).toISOString().split('T')[0];
        
        if (!items[date]) {
          items[date] = [];
        }
        
        const startTime = new Date(appointment.startTime);
        const endTime = new Date(appointment.endTime);
        
        items[date].push({
          id: appointment.id,
          name: `${appointment.client?.firstName || ''} ${appointment.client?.lastName || ''}`.trim() || 'Cliente',
          service: appointment.service?.name || 'Servicio',
          time: `${startTime.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })} - ${endTime.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}`,
          status: appointment.status,
          appointment: appointment
        });
      });
      
      // Ordenar por hora
      Object.keys(items).forEach(date => {
        items[date].sort((a, b) => {
          return new Date(a.appointment.startTime) - new Date(b.appointment.startTime);
        });
      });
    }
    
    console.log('📅 Agenda items total dates:', Object.keys(items).length);
    return items;
  }, [rawAppointments]); // Solo depende de rawAppointments

  // Manejar selección de fecha
  const handleDayPress = useCallback((day) => {
    console.log('📅 Date selected:', day.dateString);
    setSelectedDate(day.dateString);
    
    // Actualizar filtros
    const newFilters = {
      ...filters,
      date: day.dateString,
      period: 'day'
    };
    
    dispatch(setFilters(newFilters));
  }, [filters, dispatch]);

  // Renderizar evento en agenda
  const renderItem = useCallback((item) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'COMPLETED': return '#10b981';
        case 'IN_PROGRESS': return '#f59e0b';
        case 'CONFIRMED': return '#3b82f6';
        case 'CANCELED': return '#ef4444';
        default: return '#9ca3af';
      }
    };

    return (
      <TouchableOpacity 
        style={[styles.agendaItem, { borderLeftColor: getStatusColor(item.status) }]}
        onPress={() => {
          Alert.alert(
            item.name,
            `Servicio: ${item.service}\nHora: ${item.time}\nEstado: ${item.status}`,
            [{ text: 'OK' }]
          );
        }}
      >
        <View style={styles.agendaItemContent}>
          <Text style={styles.agendaItemTime}>{item.time}</Text>
          <Text style={styles.agendaItemName}>{item.name}</Text>
          <Text style={styles.agendaItemService}>{item.service}</Text>
        </View>
      </TouchableOpacity>
    );
  }, []);

  // Renderizar día vacío
  const renderEmptyDate = useCallback(() => {
    return (
      <View style={styles.emptyDate}>
        <Text style={styles.emptyDateText}>No hay citas programadas</Text>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* Header con selector de vista */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendario de Citas</Text>
        
        <View style={styles.viewSelector}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === 'calendar' && styles.activeViewButton
            ]}
            onPress={() => setViewMode('calendar')}
          >
            <Text style={[
              styles.viewButtonText,
              viewMode === 'calendar' && styles.activeViewButtonText
            ]}>
              Calendario
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === 'agenda' && styles.activeViewButton
            ]}
            onPress={() => setViewMode('agenda')}
          >
            <Text style={[
              styles.viewButtonText,
              viewMode === 'agenda' && styles.activeViewButtonText
            ]}>
              Agenda
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendario o Agenda */}
      {viewMode === 'calendar' ? (
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="multi-dot"
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#3b82f6',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#3b82f6',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: '#3b82f6',
              disabledArrowColor: '#d9e1e8',
              monthTextColor: '#2d4150',
              indicatorColor: '#3b82f6',
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13
            }}
          />
          
          {/* Lista de citas del día seleccionado */}
          <View style={styles.dayAppointments}>
            <Text style={styles.dayAppointmentsTitle}>
              Citas del {new Date(selectedDate).toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            
            <ScrollView style={styles.appointmentsList}>
              {agendaItems[selectedDate]?.length ? (
                agendaItems[selectedDate].map((item, index) => (
                  <View key={index}>
                    {renderItem(item)}
                  </View>
                ))
              ) : (
                renderEmptyDate()
              )}
            </ScrollView>
          </View>
        </View>
      ) : (
        <Agenda
          items={agendaItems}
          selected={selectedDate}
          renderItem={renderItem}
          renderEmptyDate={renderEmptyDate}
          rowHasChanged={(r1, r2) => r1.name !== r2.name}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#3b82f6',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#3b82f6',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#00adf5',
            selectedDotColor: '#ffffff',
            arrowColor: '#3b82f6',
            disabledArrowColor: '#d9e1e8',
            monthTextColor: '#2d4150',
            indicatorColor: '#3b82f6',
            agendaDayTextColor: '#2d4150',
            agendaDayNumColor: '#2d4150',
            agendaTodayColor: '#3b82f6',
            agendaKnobColor: '#3b82f6'
          }}
        />
      )}

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando citas...</Text>
        </View>
      )}

      {/* Debug info */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          Fecha: {selectedDate} | Citas: {agendaItems[selectedDate]?.length || 0} | Total: {rawAppointments?.length || 0}
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
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
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
  },
  dayAppointments: {
    flex: 1,
    padding: 16,
  },
  dayAppointmentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  appointmentsList: {
    flex: 1,
  },
  agendaItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 4,
    borderLeftWidth: 4,
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
    padding: 16,
  },
  agendaItemTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 4,
  },
  agendaItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  agendaItemService: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyDate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyDateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
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