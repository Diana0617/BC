/**
 * Selectores para Specialist Service (precios personalizados)
 */

// Selectores básicos
export const selectSpecialistServiceState = (state) => state.specialistService;

export const selectSpecialistServices = (state) => 
  state.specialistService.specialistServices;

export const selectSelectedSpecialistService = (state) => 
  state.specialistService.selectedSpecialistService;

export const selectSpecialistServiceLoading = (state) => 
  state.specialistService.loading;

export const selectSpecialistServiceError = (state) => 
  state.specialistService.error;

export const selectSpecialistServiceSuccess = (state) => 
  state.specialistService.success;

export const selectSpecialistServiceMessage = (state) => 
  state.specialistService.message;

// Selectores avanzados
export const selectActiveSpecialistServices = (state) => 
  state.specialistService.specialistServices.filter(s => s.isActive);

export const selectInactiveSpecialistServices = (state) => 
  state.specialistService.specialistServices.filter(s => !s.isActive);

export const selectSpecialistServiceById = (state, serviceId) => 
  state.specialistService.specialistServices.find(s => s.serviceId === serviceId);

export const selectHasCustomPrice = (state, serviceId) => {
  const service = state.specialistService.specialistServices.find(
    s => s.serviceId === serviceId
  );
  return service && service.customPrice !== null;
};

export const selectCustomPriceForService = (state, serviceId) => {
  const service = state.specialistService.specialistServices.find(
    s => s.serviceId === serviceId
  );
  return service?.customPrice || null;
};

export const selectSpecialistServicesBySkillLevel = (state, skillLevel) => 
  state.specialistService.specialistServices.filter(s => s.skillLevel === skillLevel);

export const selectBookableSpecialistServices = (state) => 
  state.specialistService.specialistServices.filter(s => s.canBeBooked && s.isActive);

export const selectSpecialistServicesCount = (state) => 
  state.specialistService.specialistServices.length;

export const selectActiveServicesCount = (state) => 
  state.specialistService.specialistServices.filter(s => s.isActive).length;
