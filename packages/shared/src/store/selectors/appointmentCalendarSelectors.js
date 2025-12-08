import { createSelector } from '@reduxjs/toolkit';

/**
 * 📆 APPOINTMENT CALENDAR SELECTORS
 * Selectores para vista de calendario de citas
 */

// ==================== BASE SELECTORS ====================

export const selectAppointmentCalendarState = (state) => state.appointmentCalendar;

export const selectAppointments = (state) => state.appointmentCalendar.appointments;

export const selectCalendarAppointments = (state) => state.appointmentCalendar.calendarAppointments;

export const selectSelectedAppointment = (state) => state.appointmentCalendar.selectedAppointment;

export const selectAppointmentFilters = (state) => state.appointmentCalendar.filters;

export const selectAppointmentPagination = (state) => state.appointmentCalendar.pagination;

export const selectAppointmentLoading = (state) => state.appointmentCalendar.loading;

export const selectAppointmentError = (state) => state.appointmentCalendar.error;

export const selectAppointmentSuccess = (state) => state.appointmentCalendar.success;

export const selectAppointmentMessage = (state) => state.appointmentCalendar.message;

// ==================== VALIDATION SELECTORS ====================

/**
 * Selectores para el sistema de validación de citas
 * Agregados para manejar errores de reglas de negocio
 */

// Errores de validación de reglas de negocio
export const selectValidationErrors = (state) => state.appointmentCalendar.validationErrors;

// Advertencias no bloqueantes
export const selectWarnings = (state) => state.appointmentCalendar.warnings;

// Progreso de subida de evidencia (0-100)
export const selectUploadProgress = (state) => state.appointmentCalendar.uploadProgress;

// Verificar si hay errores de validación
export const selectHasValidationErrors = createSelector(
  [selectValidationErrors],
  (errors) => errors && errors.length > 0
);

// Verificar si hay advertencias
export const selectHasWarnings = createSelector(
  [selectWarnings],
  (warnings) => warnings && warnings.length > 0
);

// Verificar si está en proceso de subida
export const selectIsUploading = createSelector(
  [selectUploadProgress],
  (progress) => progress > 0 && progress < 100
);

// Obtener el primer error de validación (para mostrar en toast)
export const selectFirstValidationError = createSelector(
  [selectValidationErrors],
  (errors) => errors && errors.length > 0 ? errors[0] : null
);

// Obtener el primer warning (para mostrar en toast)
export const selectFirstWarning = createSelector(
  [selectWarnings],
  (warnings) => warnings && warnings.length > 0 ? warnings[0] : null
);

// Verificar si se puede completar la cita (sin errores de validación)
export const selectCanCompleteAppointment = createSelector(
  [selectValidationErrors, selectAppointmentLoading],
  (errors, loading) => !loading && (!errors || errors.length === 0)
);

// ==================== MEMOIZED SELECTORS ====================

// Obtener citas por fecha específica
export const selectAppointmentsByDate = createSelector(
  [selectCalendarAppointments, (state, date) => date],
  (appointments, date) => {
    if (!date) return [];
    const targetDate = new Date(date).toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate || apt.startTime).toISOString().split('T')[0];
      return aptDate === targetDate;
    });
  }
);

// Obtener citas por especialista
export const selectAppointmentsBySpecialist = createSelector(
  [selectCalendarAppointments, (state, specialistId) => specialistId],
  (appointments, specialistId) => {
    if (!specialistId) return [];
    return appointments.filter(apt => apt.specialistId === specialistId);
  }
);

// Obtener citas por sucursal
export const selectAppointmentsByBranch = createSelector(
  [selectCalendarAppointments, (state, branchId) => branchId],
  (appointments, branchId) => {
    if (!branchId) return [];
    return appointments.filter(apt => apt.branchId === branchId);
  }
);

// Obtener citas por estado
export const selectAppointmentsByStatus = createSelector(
  [selectCalendarAppointments, (state, status) => status],
  (appointments, status) => {
    if (!status) return appointments;
    return appointments.filter(apt => apt.status === status);
  }
);

// Obtener citas confirmadas
export const selectConfirmedAppointments = createSelector(
  [selectCalendarAppointments],
  (appointments) => {
    return appointments.filter(apt => apt.status === 'CONFIRMED');
  }
);

// Obtener citas pendientes
export const selectPendingAppointments = createSelector(
  [selectCalendarAppointments],
  (appointments) => {
    return appointments.filter(apt => apt.status === 'PENDING');
  }
);

// Obtener citas completadas
export const selectCompletedAppointments = createSelector(
  [selectCalendarAppointments],
  (appointments) => {
    return appointments.filter(apt => apt.status === 'COMPLETED');
  }
);

// Obtener citas canceladas
export const selectCancelledAppointments = createSelector(
  [selectCalendarAppointments],
  (appointments) => {
    return appointments.filter(apt => apt.status === 'CANCELLED');
  }
);

// Obtener citas agrupadas por fecha
export const selectAppointmentsByDateGroup = createSelector(
  [selectCalendarAppointments],
  (appointments) => {
    return appointments.reduce((acc, apt) => {
      const date = new Date(apt.appointmentDate || apt.startTime).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(apt);
      return acc;
    }, {});
  }
);

// Obtener citas agrupadas por especialista
export const selectAppointmentsBySpecialistGroup = createSelector(
  [selectCalendarAppointments],
  (appointments) => {
    return appointments.reduce((acc, apt) => {
      const specialistId = apt.specialistId;
      if (!acc[specialistId]) acc[specialistId] = [];
      acc[specialistId].push(apt);
      return acc;
    }, {});
  }
);

// Filtrar citas por filtros activos
export const selectFilteredAppointments = createSelector(
  [selectCalendarAppointments, selectAppointmentFilters],
  (appointments, filters) => {
    let filtered = [...appointments];
    
    // Filtrar por rango de fechas
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(apt => 
        new Date(apt.appointmentDate || apt.startTime) >= startDate
      );
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(apt => 
        new Date(apt.appointmentDate || apt.startTime) <= endDate
      );
    }
    
    // Filtrar por sucursal
    if (filters.branchId) {
      filtered = filtered.filter(apt => apt.branchId === filters.branchId);
    }
    
    // Filtrar por especialista
    if (filters.specialistId) {
      filtered = filtered.filter(apt => apt.specialistId === filters.specialistId);
    }
    
    // Filtrar por estado
    if (filters.status) {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }
    
    return filtered;
  }
);

// Contar citas por estado
export const selectAppointmentCountByStatus = createSelector(
  [selectCalendarAppointments],
  (appointments) => {
    return appointments.reduce((acc, apt) => {
      const status = apt.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }
);

// Obtener estadísticas del calendario
export const selectCalendarStats = createSelector(
  [selectCalendarAppointments],
  (appointments) => {
    return {
      total: appointments.length,
      pending: appointments.filter(apt => apt.status === 'PENDING').length,
      confirmed: appointments.filter(apt => apt.status === 'CONFIRMED').length,
      completed: appointments.filter(apt => apt.status === 'COMPLETED').length,
      cancelled: appointments.filter(apt => apt.status === 'CANCELLED').length,
      noShow: appointments.filter(apt => apt.status === 'NO_SHOW').length
    };
  }
);

// Verificar si hay filtros activos
export const selectHasActiveFilters = createSelector(
  [selectAppointmentFilters],
  (filters) => {
    return !!(filters.startDate || filters.endDate || filters.branchId || 
              filters.specialistId || filters.status);
  }
);

// Obtener información de paginación completa
export const selectPaginationInfo = createSelector(
  [selectAppointmentPagination],
  (pagination) => {
    const { page = 1, limit = 20, total = 0 } = pagination;
    const totalPages = Math.ceil(total / limit);
    return {
      currentPage: page,
      pageSize: limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }
);

// Verificar si está cargando
export const selectIsAppointmentLoading = createSelector(
  [selectAppointmentLoading],
  (loading) => loading
);

// Verificar si hay error
export const selectHasAppointmentError = createSelector(
  [selectAppointmentError],
  (error) => !!error
);

// Obtener citas del día actual
export const selectTodayAppointments = createSelector(
  [selectCalendarAppointments],
  (appointments) => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate || apt.startTime).toISOString().split('T')[0];
      return aptDate === today;
    });
  }
);

// Obtener próximas citas (futuras)
export const selectUpcomingAppointments = createSelector(
  [selectCalendarAppointments],
  (appointments) => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.appointmentDate || apt.startTime) > now)
      .sort((a, b) => 
        new Date(a.appointmentDate || a.startTime) - new Date(b.appointmentDate || b.startTime)
      );
  }
);

// Obtener citas pasadas
export const selectPastAppointments = createSelector(
  [selectCalendarAppointments],
  (appointments) => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.appointmentDate || apt.startTime) < now)
      .sort((a, b) => 
        new Date(b.appointmentDate || b.startTime) - new Date(a.appointmentDate || a.startTime)
      );
  }
);

// Obtener citas de la semana actual
export const selectThisWeekAppointments = createSelector(
  [selectCalendarAppointments],
  (appointments) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate || apt.startTime);
      return aptDate >= startOfWeek && aptDate < endOfWeek;
    });
  }
);
