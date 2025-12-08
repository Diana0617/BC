import { createSelector } from '@reduxjs/toolkit';

/**
 * 📅 SCHEDULE SELECTORS
 * Selectores para gestión de horarios de especialistas
 */

// ==================== BASE SELECTORS ====================

export const selectScheduleState = (state) => state.schedule;

export const selectSchedules = (state) => state.schedule.schedules;

export const selectCurrentSchedule = (state) => state.schedule.currentSchedule;

export const selectWeeklyView = (state) => state.schedule.weeklyView;

export const selectMonthlyView = (state) => state.schedule.monthlyView;

export const selectGeneratedSlots = (state) => state.schedule.generatedSlots;

export const selectScheduleLoading = (state) => state.schedule.loading;

export const selectScheduleError = (state) => state.schedule.error;

export const selectScheduleSuccess = (state) => state.schedule.success;

export const selectScheduleMessage = (state) => state.schedule.message;

// ==================== MEMOIZED SELECTORS ====================

// Obtener horarios por especialista
export const selectSchedulesBySpecialist = createSelector(
  [selectSchedules, (state, specialistId) => specialistId],
  (schedules, specialistId) => {
    if (!specialistId) return [];
    return schedules.filter(schedule => schedule.specialistId === specialistId);
  }
);

// Obtener horarios por sucursal
export const selectSchedulesByBranch = createSelector(
  [selectSchedules, (state, branchId) => branchId],
  (schedules, branchId) => {
    if (!branchId) return [];
    return schedules.filter(schedule => schedule.branchId === branchId);
  }
);

// Obtener horarios activos (no eliminados)
export const selectActiveSchedules = createSelector(
  [selectSchedules],
  (schedules) => {
    return schedules.filter(schedule => schedule.isActive !== false && !schedule.deletedAt);
  }
);

// Obtener horarios con excepciones
export const selectSchedulesWithExceptions = createSelector(
  [selectSchedules],
  (schedules) => {
    return schedules.filter(schedule => 
      schedule.exceptionDates && schedule.exceptionDates.length > 0
    );
  }
);

// Obtener horarios por especialista y sucursal
export const selectSchedulesBySpecialistAndBranch = createSelector(
  [
    selectSchedules, 
    (state, specialistId) => specialistId,
    (state, specialistId, branchId) => branchId
  ],
  (schedules, specialistId, branchId) => {
    if (!specialistId) return [];
    return schedules.filter(schedule => 
      schedule.specialistId === specialistId &&
      (!branchId || schedule.branchId === branchId)
    );
  }
);

// Obtener días de la semana disponibles del horario actual
export const selectCurrentScheduleAvailableDays = createSelector(
  [selectCurrentSchedule],
  (currentSchedule) => {
    if (!currentSchedule) return [];
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.filter(day => 
      currentSchedule[`${day}Start`] && currentSchedule[`${day}End`]
    );
  }
);

// Verificar si tiene slots generados
export const selectHasGeneratedSlots = createSelector(
  [selectGeneratedSlots],
  (generatedSlots) => {
    return generatedSlots && generatedSlots.length > 0;
  }
);

// Contar total de horarios
export const selectTotalSchedules = createSelector(
  [selectSchedules],
  (schedules) => schedules.length
);

// Contar horarios activos
export const selectActiveSchedulesCount = createSelector(
  [selectActiveSchedules],
  (activeSchedules) => activeSchedules.length
);

// Obtener slots generados agrupados por fecha
export const selectGeneratedSlotsByDate = createSelector(
  [selectGeneratedSlots],
  (generatedSlots) => {
    if (!generatedSlots || generatedSlots.length === 0) return {};
    
    return generatedSlots.reduce((acc, slot) => {
      const date = slot.date || slot.startTime?.split('T')[0];
      if (date) {
        if (!acc[date]) acc[date] = [];
        acc[date].push(slot);
      }
      return acc;
    }, {});
  }
);

// Verificar si está cargando
export const selectIsScheduleLoading = createSelector(
  [selectScheduleLoading],
  (loading) => loading
);

// Verificar si hay error
export const selectHasScheduleError = createSelector(
  [selectScheduleError],
  (error) => !!error
);

// Obtener vista semanal con datos procesados
export const selectProcessedWeeklyView = createSelector(
  [selectWeeklyView],
  (weeklyView) => {
    if (!weeklyView || weeklyView.length === 0) return [];
    
    // Agregar información útil como día de la semana, disponibilidad, etc.
    return weeklyView.map(day => ({
      ...day,
      dayOfWeek: new Date(day.date).toLocaleDateString('es-ES', { weekday: 'long' }),
      hasSlots: day.slots && day.slots.length > 0,
      availableSlots: day.slots?.filter(slot => slot.status === 'AVAILABLE').length || 0
    }));
  }
);

// Obtener vista mensual con estadísticas
export const selectMonthlyViewStats = createSelector(
  [selectMonthlyView],
  (monthlyView) => {
    if (!monthlyView || monthlyView.length === 0) {
      return {
        totalDays: 0,
        daysWithSlots: 0,
        totalSlots: 0,
        availableSlots: 0
      };
    }
    
    return {
      totalDays: monthlyView.length,
      daysWithSlots: monthlyView.filter(day => day.slots && day.slots.length > 0).length,
      totalSlots: monthlyView.reduce((sum, day) => sum + (day.slots?.length || 0), 0),
      availableSlots: monthlyView.reduce((sum, day) => 
        sum + (day.slots?.filter(slot => slot.status === 'AVAILABLE').length || 0), 0
      )
    };
  }
);

// Verificar si el horario actual tiene días configurados
export const selectCurrentScheduleHasDays = createSelector(
  [selectCurrentSchedule],
  (currentSchedule) => {
    if (!currentSchedule) return false;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.some(day => 
      currentSchedule[`${day}Start`] && currentSchedule[`${day}End`]
    );
  }
);

// Obtener horarios con vacaciones activas
export const selectSchedulesOnVacation = createSelector(
  [selectSchedules],
  (schedules) => {
    const today = new Date();
    return schedules.filter(schedule => {
      if (!schedule.vacationStart || !schedule.vacationEnd) return false;
      const start = new Date(schedule.vacationStart);
      const end = new Date(schedule.vacationEnd);
      return today >= start && today <= end;
    });
  }
);
