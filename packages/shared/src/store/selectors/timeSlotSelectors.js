import { createSelector } from '@reduxjs/toolkit';

/**
 * 🕐 TIME SLOT SELECTORS
 * Selectores para gestión de slots de tiempo
 */

// ==================== BASE SELECTORS ====================

export const selectTimeSlotState = (state) => state.timeSlot;

export const selectTimeSlots = (state) => state.timeSlot.slots;

export const selectAvailableSlots = (state) => state.timeSlot.availableSlots;

export const selectSelectedSlot = (state) => state.timeSlot.selectedSlot;

export const selectSlotsByDate = (state) => state.timeSlot.slotsByDate;

export const selectTimeSlotLoading = (state) => state.timeSlot.loading;

export const selectTimeSlotError = (state) => state.timeSlot.error;

export const selectTimeSlotSuccess = (state) => state.timeSlot.success;

export const selectTimeSlotMessage = (state) => state.timeSlot.message;

// ==================== MEMOIZED SELECTORS ====================

// Obtener slots por fecha específica
export const selectSlotsBySpecificDate = createSelector(
  [selectTimeSlots, (state, date) => date],
  (slots, date) => {
    if (!date) return [];
    const targetDate = new Date(date).toISOString().split('T')[0];
    return slots.filter(slot => {
      const slotDate = slot.date || slot.startTime?.split('T')[0];
      return slotDate === targetDate;
    });
  }
);

// Obtener slots disponibles por fecha
export const selectAvailableSlotsByDate = createSelector(
  [selectAvailableSlots, (state, date) => date],
  (slots, date) => {
    if (!date) return slots;
    const targetDate = new Date(date).toISOString().split('T')[0];
    return slots.filter(slot => {
      const slotDate = slot.date || slot.startTime?.split('T')[0];
      return slotDate === targetDate;
    });
  }
);

// Obtener slots por especialista
export const selectSlotsBySpecialist = createSelector(
  [selectTimeSlots, (state, specialistId) => specialistId],
  (slots, specialistId) => {
    if (!specialistId) return [];
    return slots.filter(slot => slot.specialistId === specialistId);
  }
);

// Obtener slots por sucursal
export const selectSlotsByBranch = createSelector(
  [selectTimeSlots, (state, branchId) => branchId],
  (slots, branchId) => {
    if (!branchId) return [];
    return slots.filter(slot => slot.branchId === branchId);
  }
);

// Obtener slots por estado
export const selectSlotsByStatus = createSelector(
  [selectTimeSlots, (state, status) => status],
  (slots, status) => {
    if (!status) return slots;
    return slots.filter(slot => slot.status === status);
  }
);

// Obtener slots bloqueados
export const selectBlockedSlots = createSelector(
  [selectTimeSlots],
  (slots) => {
    return slots.filter(slot => slot.status === 'BLOCKED');
  }
);

// Obtener slots reservados
export const selectBookedSlots = createSelector(
  [selectTimeSlots],
  (slots) => {
    return slots.filter(slot => slot.status === 'BOOKED');
  }
);

// Obtener slots de descanso
export const selectBreakSlots = createSelector(
  [selectTimeSlots],
  (slots) => {
    return slots.filter(slot => slot.status === 'BREAK');
  }
);

// Obtener estadísticas de slots
export const selectSlotStats = createSelector(
  [selectTimeSlots],
  (slots) => {
    return {
      total: slots.length,
      available: slots.filter(s => s.status === 'AVAILABLE').length,
      booked: slots.filter(s => s.status === 'BOOKED').length,
      blocked: slots.filter(s => s.status === 'BLOCKED').length,
      break: slots.filter(s => s.status === 'BREAK').length
    };
  }
);

// Obtener slots agrupados por fecha desde slotsByDate
export const selectSlotsGroupedByDate = createSelector(
  [selectSlotsByDate],
  (slotsByDate) => {
    // Ya vienen agrupados, solo devolver
    return slotsByDate;
  }
);

// Obtener fechas con slots disponibles
export const selectDatesWithAvailableSlots = createSelector(
  [selectAvailableSlots],
  (slots) => {
    const dates = new Set();
    slots.forEach(slot => {
      const date = slot.date || slot.startTime?.split('T')[0];
      if (date) dates.add(date);
    });
    return Array.from(dates).sort();
  }
);

// Verificar si una fecha tiene slots disponibles
export const selectDateHasAvailableSlots = createSelector(
  [selectAvailableSlots, (state, date) => date],
  (slots, date) => {
    if (!date) return false;
    const targetDate = new Date(date).toISOString().split('T')[0];
    return slots.some(slot => {
      const slotDate = slot.date || slot.startTime?.split('T')[0];
      return slotDate === targetDate;
    });
  }
);

// Obtener slots disponibles para un especialista en una fecha
export const selectAvailableSlotsForSpecialistAndDate = createSelector(
  [
    selectAvailableSlots,
    (state, specialistId) => specialistId,
    (state, specialistId, date) => date
  ],
  (slots, specialistId, date) => {
    if (!specialistId || !date) return [];
    const targetDate = new Date(date).toISOString().split('T')[0];
    return slots.filter(slot => {
      const slotDate = slot.date || slot.startTime?.split('T')[0];
      return slot.specialistId === specialistId && slotDate === targetDate;
    });
  }
);

// Contar slots por estado
export const selectSlotCountByStatus = createSelector(
  [selectTimeSlots],
  (slots) => {
    return slots.reduce((acc, slot) => {
      const status = slot.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }
);

// Verificar si está cargando
export const selectIsTimeSlotLoading = createSelector(
  [selectTimeSlotLoading],
  (loading) => loading
);

// Verificar si hay error
export const selectHasTimeSlotError = createSelector(
  [selectTimeSlotError],
  (error) => !!error
);

// Obtener slots del día actual
export const selectTodaySlots = createSelector(
  [selectTimeSlots],
  (slots) => {
    const today = new Date().toISOString().split('T')[0];
    return slots.filter(slot => {
      const slotDate = slot.date || slot.startTime?.split('T')[0];
      return slotDate === today;
    });
  }
);

// Obtener slots futuros
export const selectFutureSlots = createSelector(
  [selectTimeSlots],
  (slots) => {
    const now = new Date();
    return slots.filter(slot => {
      const slotTime = new Date(slot.startTime);
      return slotTime > now;
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }
);

// Obtener slots pasados
export const selectPastSlots = createSelector(
  [selectTimeSlots],
  (slots) => {
    const now = new Date();
    return slots.filter(slot => {
      const slotTime = new Date(slot.startTime);
      return slotTime < now;
    }).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }
);

// Obtener duración promedio de slots
export const selectAverageSlotDuration = createSelector(
  [selectTimeSlots],
  (slots) => {
    if (slots.length === 0) return 0;
    const total = slots.reduce((sum, slot) => sum + (slot.duration || 0), 0);
    return Math.round(total / slots.length);
  }
);

// Verificar si hay slots disponibles
export const selectHasAvailableSlots = createSelector(
  [selectAvailableSlots],
  (slots) => slots.length > 0
);

// Obtener slots por rango de horas
export const selectSlotsByTimeRange = createSelector(
  [
    selectTimeSlots,
    (state, startHour) => startHour,
    (state, startHour, endHour) => endHour
  ],
  (slots, startHour, endHour) => {
    if (startHour === undefined || endHour === undefined) return slots;
    
    return slots.filter(slot => {
      const slotHour = new Date(slot.startTime).getHours();
      return slotHour >= startHour && slotHour < endHour;
    });
  }
);

// Obtener slots con información de disponibilidad por especialista
export const selectSlotAvailabilityBySpecialist = createSelector(
  [selectTimeSlots],
  (slots) => {
    const availability = {};
    
    slots.forEach(slot => {
      const specialistId = slot.specialistId;
      if (!availability[specialistId]) {
        availability[specialistId] = {
          total: 0,
          available: 0,
          booked: 0,
          blocked: 0
        };
      }
      
      availability[specialistId].total++;
      if (slot.status === 'AVAILABLE') availability[specialistId].available++;
      if (slot.status === 'BOOKED') availability[specialistId].booked++;
      if (slot.status === 'BLOCKED') availability[specialistId].blocked++;
    });
    
    return availability;
  }
);
