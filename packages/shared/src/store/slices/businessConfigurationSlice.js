import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { subscriptionStatusApi } from '../../api/subscriptionStatusApi'
import { businessBrandingApi } from '../../api/businessBrandingApi'

// AsyncThunk para cargar la configuración del negocio
export const loadBusinessConfiguration = createAsyncThunk(
  'businessConfiguration/loadConfiguration',
  async (businessId, { rejectWithValue }) => {
    try {
      // Cargar datos de suscripción
      const subscriptionResponse = await subscriptionStatusApi.checkSubscriptionStatus(businessId)
      
      // Cargar branding
      let branding = null
      try {
        const brandingResponse = await businessBrandingApi.getBranding(businessId)
        branding = brandingResponse.data
      } catch (error) {
        console.warn('No se pudo cargar branding, usando valores por defecto')
      }
      
      // Cargar configuraciones específicas
      // TODO: Implementar APIs específicas para cada módulo
      const configuration = {
        subscription: subscriptionResponse.data,
        branding: branding,
        basicInfo: null, // TODO: API para datos básicos
        specialists: [], // TODO: API para especialistas
        services: [], // TODO: API para servicios
        schedule: null, // TODO: API para horarios
        taxxa: null, // TODO: API para configuración Taxxa
        inventory: null, // TODO: API para configuración inventario
        suppliers: [] // TODO: API para proveedores
      }
      
      return configuration
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para guardar información básica
export const saveBasicInfo = createAsyncThunk(
  'businessConfiguration/saveBasicInfo',
  async (basicInfoData, { rejectWithValue }) => {
    try {
      // TODO: Implementar API para guardar información básica
      console.log('Guardando información básica:', basicInfoData)
      
      // Simular respuesta de API
      return basicInfoData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para guardar especialistas
export const saveSpecialists = createAsyncThunk(
  'businessConfiguration/saveSpecialists',
  async (specialistsData, { rejectWithValue }) => {
    try {
      // TODO: Implementar API para guardar especialistas
      console.log('Guardando especialistas:', specialistsData)
      
      return specialistsData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para guardar servicios
export const saveServices = createAsyncThunk(
  'businessConfiguration/saveServices',
  async (servicesData, { rejectWithValue }) => {
    try {
      // TODO: Implementar API para guardar servicios
      console.log('Guardando servicios:', servicesData)
      
      return servicesData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para guardar horarios
export const saveSchedule = createAsyncThunk(
  'businessConfiguration/saveSchedule',
  async (scheduleData, { rejectWithValue }) => {
    try {
      // TODO: Implementar API para guardar horarios
      console.log('Guardando horarios:', scheduleData)
      
      return scheduleData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para guardar configuración Taxxa
export const saveTaxxaConfig = createAsyncThunk(
  'businessConfiguration/saveTaxxaConfig',
  async (taxxaData, { rejectWithValue }) => {
    try {
      // TODO: Implementar API para configuración Taxxa
      console.log('Guardando configuración Taxxa:', taxxaData)
      
      return taxxaData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para guardar configuración de inventario
export const saveInventoryConfig = createAsyncThunk(
  'businessConfiguration/saveInventoryConfig',
  async (inventoryData, { rejectWithValue }) => {
    try {
      // TODO: Implementar API para configuración de inventario
      console.log('Guardando configuración de inventario:', inventoryData)
      
      return inventoryData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para guardar proveedores
export const saveSuppliersConfig = createAsyncThunk(
  'businessConfiguration/saveSuppliersConfig',
  async (suppliersData, { rejectWithValue }) => {
    try {
      // TODO: Implementar API para configuración de proveedores
      console.log('Guardando proveedores:', suppliersData)
      
      return suppliersData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// AsyncThunk para cargar branding
export const loadBranding = createAsyncThunk(
  'businessConfiguration/loadBranding',
  async (businessId, { rejectWithValue }) => {
    try {
      const response = await businessBrandingApi.getBranding(businessId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Error al cargar branding')
    }
  }
)

// AsyncThunk para subir logo
export const uploadLogo = createAsyncThunk(
  'businessConfiguration/uploadLogo',
  async ({ businessId, logoFile }, { rejectWithValue }) => {
    try {
      const response = await businessBrandingApi.uploadBusinessLogo(businessId, logoFile)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Error al subir logo')
    }
  }
)

// AsyncThunk para actualizar branding (colores)
export const saveBranding = createAsyncThunk(
  'businessConfiguration/saveBranding',
  async ({ businessId, brandingData }, { rejectWithValue }) => {
    try {
      const response = await businessBrandingApi.updateBranding(businessId, brandingData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Error al guardar branding')
    }
  }
)

const initialState = {
  // Datos de configuración
  subscription: null,
  branding: null,
  basicInfo: null,
  specialists: [],
  services: [],
  schedule: null,
  taxxa: null,
  inventory: null,
  suppliers: [],
  
  // Estados de carga
  loading: false,
  saving: false,
  uploadingLogo: false,
  error: null,
  saveError: null,
  
  // Estados del setup
  completedSteps: [],
  setupProgress: 0,
  currentSection: 'basic-info',
  isSetupMode: false,
  currentStep: 0
}

export const businessConfigurationSlice = createSlice({
  name: 'businessConfiguration',
  initialState,
  reducers: {
    // Limpiar errores
    clearErrors: (state) => {
      state.error = null
      state.saveError = null
    },
    
    // Cambiar sección actual
    setCurrentSection: (state, action) => {
      state.currentSection = action.payload
    },
    
    // Activar/desactivar modo setup
    setSetupMode: (state, action) => {
      state.isSetupMode = action.payload
    },
    
    // Establecer paso actual
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload
    },
    
    // Marcar paso como completado manualmente
    completeStep: (state, action) => {
      const stepId = action.payload
      if (!state.completedSteps.includes(stepId)) {
        state.completedSteps.push(stepId)
        
        // Recalcular progreso
        const totalSteps = 8 // Número total de pasos posibles
        state.setupProgress = Math.round((state.completedSteps.length / totalSteps) * 100)
      }
    },
    
    // Remover paso completado
    uncompleteStep: (state, action) => {
      const stepId = action.payload
      state.completedSteps = state.completedSteps.filter(id => id !== stepId)
      
      // Recalcular progreso
      const totalSteps = 8
      state.setupProgress = Math.round((state.completedSteps.length / totalSteps) * 100)
    },
    
    // Reset del estado
    resetConfiguration: (state) => {
      return { ...initialState }
    },
    
    // Actualizar datos localmente (optimistic updates)
    updateBasicInfo: (state, action) => {
      state.basicInfo = action.payload
    },
    
    updateBranding: (state, action) => {
      state.branding = action.payload
    },
    
    updateSpecialists: (state, action) => {
      state.specialists = action.payload
    },
    
    updateServices: (state, action) => {
      state.services = action.payload
    },
    
    updateSchedule: (state, action) => {
      state.schedule = action.payload
    },
    
    updateTaxxaConfig: (state, action) => {
      state.taxxa = action.payload
    },
    
    updateInventoryConfig: (state, action) => {
      state.inventory = action.payload
    },
    
    updateSuppliers: (state, action) => {
      state.suppliers = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // loadBusinessConfiguration
      .addCase(loadBusinessConfiguration.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadBusinessConfiguration.fulfilled, (state, action) => {
        state.loading = false
        state.subscription = action.payload.subscription
        state.branding = action.payload.branding
        state.basicInfo = action.payload.basicInfo
        state.specialists = action.payload.specialists
        state.services = action.payload.services
        state.schedule = action.payload.schedule
        state.taxxa = action.payload.taxxa
        state.inventory = action.payload.inventory
        state.suppliers = action.payload.suppliers
        
        // Determinar pasos completados basado en datos cargados
        const completed = []
        
        if (state.branding && Object.keys(state.branding).length > 0) {
          completed.push('branding')
        }
        
        if (state.basicInfo && Object.keys(state.basicInfo).length > 0) {
          completed.push('basic-info')
        }
        
        if (state.specialists && state.specialists.length > 0) {
          completed.push('specialists')
        }
        
        if (state.services && state.services.length > 0) {
          completed.push('services')
        }
        
        if (state.schedule && Object.keys(state.schedule).length > 0) {
          completed.push('schedule')
        }
        
        if (state.taxxa && Object.keys(state.taxxa).length > 0) {
          completed.push('taxxa-config')
        }
        
        if (state.inventory && Object.keys(state.inventory).length > 0) {
          completed.push('inventory-config')
        }
        
        if (state.suppliers && state.suppliers.length > 0) {
          completed.push('suppliers-config')
        }
        
        state.completedSteps = completed
        
        // Calcular progreso
        const totalSteps = 8
        state.setupProgress = Math.round((state.completedSteps.length / totalSteps) * 100)
      })
      .addCase(loadBusinessConfiguration.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al cargar la configuración'
      })
      
      // saveBasicInfo
      .addCase(saveBasicInfo.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(saveBasicInfo.fulfilled, (state, action) => {
        state.saving = false
        state.basicInfo = action.payload
        
        // Marcar como completado
        if (action.payload && Object.keys(action.payload).length > 0) {
          if (!state.completedSteps.includes('basic-info')) {
            state.completedSteps.push('basic-info')
          }
        }
        
        const totalSteps = 8
        state.setupProgress = Math.round((state.completedSteps.length / totalSteps) * 100)
      })
      .addCase(saveBasicInfo.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload || 'Error al guardar información básica'
      })
      
      // saveSpecialists
      .addCase(saveSpecialists.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(saveSpecialists.fulfilled, (state, action) => {
        state.saving = false
        state.specialists = action.payload
        
        // Marcar como completado si hay especialistas
        if (action.payload && action.payload.length > 0) {
          if (!state.completedSteps.includes('specialists')) {
            state.completedSteps.push('specialists')
          }
        }
        
        const totalSteps = 8
        state.setupProgress = Math.round((state.completedSteps.length / totalSteps) * 100)
      })
      .addCase(saveSpecialists.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload || 'Error al guardar especialistas'
      })
      
      // saveServices
      .addCase(saveServices.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(saveServices.fulfilled, (state, action) => {
        state.saving = false
        state.services = action.payload
        
        // Marcar como completado si hay servicios
        if (action.payload && action.payload.length > 0) {
          if (!state.completedSteps.includes('services')) {
            state.completedSteps.push('services')
          }
        }
        
        const totalSteps = 8
        state.setupProgress = Math.round((state.completedSteps.length / totalSteps) * 100)
      })
      .addCase(saveServices.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload || 'Error al guardar servicios'
      })
      
      // saveSchedule
      .addCase(saveSchedule.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(saveSchedule.fulfilled, (state, action) => {
        state.saving = false
        state.schedule = action.payload
        
        // Marcar como completado si hay horarios
        if (action.payload && Object.keys(action.payload).length > 0) {
          if (!state.completedSteps.includes('schedule')) {
            state.completedSteps.push('schedule')
          }
        }
        
        const totalSteps = 8
        state.setupProgress = Math.round((state.completedSteps.length / totalSteps) * 100)
      })
      .addCase(saveSchedule.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload || 'Error al guardar horarios'
      })
      
      // saveTaxxaConfig
      .addCase(saveTaxxaConfig.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(saveTaxxaConfig.fulfilled, (state, action) => {
        state.saving = false
        state.taxxa = action.payload
        
        // Marcar como completado si hay configuración
        if (action.payload && Object.keys(action.payload).length > 0) {
          if (!state.completedSteps.includes('taxxa-config')) {
            state.completedSteps.push('taxxa-config')
          }
        }
        
        const totalSteps = 8
        state.setupProgress = Math.round((state.completedSteps.length / totalSteps) * 100)
      })
      .addCase(saveTaxxaConfig.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload || 'Error al guardar configuración Taxxa'
      })
      
      // saveInventoryConfig
      .addCase(saveInventoryConfig.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(saveInventoryConfig.fulfilled, (state, action) => {
        state.saving = false
        state.inventory = action.payload
        
        // Marcar como completado si hay configuración
        if (action.payload && Object.keys(action.payload).length > 0) {
          if (!state.completedSteps.includes('inventory-config')) {
            state.completedSteps.push('inventory-config')
          }
        }
        
        const totalSteps = 8
        state.setupProgress = Math.round((state.completedSteps.length / totalSteps) * 100)
      })
      .addCase(saveInventoryConfig.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload || 'Error al guardar configuración de inventario'
      })
      
      // saveSuppliersConfig
      .addCase(saveSuppliersConfig.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(saveSuppliersConfig.fulfilled, (state, action) => {
        state.saving = false
        state.suppliers = action.payload
        
        // Marcar como completado si hay proveedores
        if (action.payload && action.payload.length > 0) {
          if (!state.completedSteps.includes('suppliers-config')) {
            state.completedSteps.push('suppliers-config')
          }
        }
        
        const totalSteps = 8
        state.setupProgress = Math.round((state.completedSteps.length / totalSteps) * 100)
      })
      .addCase(saveSuppliersConfig.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload || 'Error al guardar configuración de proveedores'
      })
      
      // loadBranding
      .addCase(loadBranding.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadBranding.fulfilled, (state, action) => {
        state.loading = false
        state.branding = action.payload
      })
      .addCase(loadBranding.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Error al cargar branding'
      })
      
      // uploadLogo
      .addCase(uploadLogo.pending, (state) => {
        state.uploadingLogo = true
        state.saveError = null
      })
      .addCase(uploadLogo.fulfilled, (state, action) => {
        state.uploadingLogo = false
        // Actualizar el logo en el branding
        if (!state.branding) {
          state.branding = {}
        }
        state.branding.logo = action.payload.logoUrl
        
        // Marcar branding como completado si tiene datos
        if (state.branding && Object.keys(state.branding).length > 0) {
          if (!state.completedSteps.includes('branding')) {
            state.completedSteps.push('branding')
          }
        }
        
        const totalSteps = 8
        state.setupProgress = Math.round((state.completedSteps.length / totalSteps) * 100)
      })
      .addCase(uploadLogo.rejected, (state, action) => {
        state.uploadingLogo = false
        state.saveError = action.payload || 'Error al subir logo'
      })
      
      // saveBranding
      .addCase(saveBranding.pending, (state) => {
        state.saving = true
        state.saveError = null
      })
      .addCase(saveBranding.fulfilled, (state, action) => {
        state.saving = false
        state.branding = action.payload
        
        // Marcar como completado si hay branding configurado
        if (action.payload && Object.keys(action.payload).length > 0) {
          if (!state.completedSteps.includes('branding')) {
            state.completedSteps.push('branding')
          }
        }
        
        const totalSteps = 8
        state.setupProgress = Math.round((state.completedSteps.length / totalSteps) * 100)
      })
      .addCase(saveBranding.rejected, (state, action) => {
        state.saving = false
        state.saveError = action.payload || 'Error al guardar branding'
      })
  }
})

export const {
  clearErrors,
  setCurrentSection,
  setSetupMode,
  setCurrentStep,
  completeStep,
  uncompleteStep,
  resetConfiguration,
  updateBasicInfo,
  updateBranding,
  updateSpecialists,
  updateServices,
  updateSchedule,
  updateTaxxaConfig,
  updateInventoryConfig,
  updateSuppliers
} = businessConfigurationSlice.actions

export default businessConfigurationSlice.reducer