import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { subscriptionStatusApi } from '../../../../../../shared/src/api/subscriptionStatusApi'

export const useBusinessSetup = () => {
  const business = useSelector(state => state.business?.currentBusiness)
  
  // Estados locales
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])

  // Definir pasos del setup con useMemo para evitar re-renders
  const setupSteps = useMemo(() => [
    {
      id: 'basic-info',
      name: 'Información Básica',
      description: 'Datos generales del negocio',
      required: true
    },
    {
      id: 'specialists',
      name: 'Especialistas',
      description: 'Agregar el equipo de trabajo',
      required: true
    },
    {
      id: 'services',
      name: 'Servicios',
      description: 'Catálogo de servicios',
      required: true
    },
    {
      id: 'schedule',
      name: 'Horarios',
      description: 'Configurar horarios de atención',
      required: true
    },
    {
      id: 'taxxa-config',
      name: 'Facturación',
      description: 'Configurar numeración y datos de Taxxa',
      required: false,
      moduleRequired: 'BILLING'
    },
    {
      id: 'inventory-config',
      name: 'Inventario',
      description: 'Configurar productos e inventario',
      required: false,
      moduleRequired: 'INVENTORY'
    },
    {
      id: 'suppliers-config',
      name: 'Proveedores',
      description: 'Configurar proveedores y compras',
      required: false,
      moduleRequired: 'PURCHASES'
    }
  ], [])

  // Cargar datos de suscripción y configuración
  useEffect(() => {
    // Verificar pasos completados
    const checkCompletedSteps = async () => {
      const completed = []

      try {
        // Verificar información básica
        if (business?.name && business?.email && business?.phone) {
          if (!completed.includes('basic-info')) {
            completed.push('basic-info')
          }
        }

        // Verificar especialistas (esto requeriría una API call)
        // TODO: Implementar verificación de especialistas
        
        // Verificar servicios (esto requeriría una API call)
        // TODO: Implementar verificación de servicios
        
        // Verificar horarios (esto requeriría una API call)
        // TODO: Implementar verificación de horarios

        setCompletedSteps(completed)
      } catch (error) {
        console.error('Error verificando pasos completados:', error)
      }
    }

    const loadBusinessSetupData = async () => {
      if (!business?.id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Obtener datos de suscripción
        const subscriptionResponse = await subscriptionStatusApi.checkSubscriptionStatus(business.id)
        setSubscriptionData(subscriptionResponse.data)

        // Verificar qué pasos ya están completados
        await checkCompletedSteps()

      } catch (error) {
        console.error('Error cargando datos del negocio:', error)
        setError('Error al cargar la configuración del negocio')
      } finally {
        setIsLoading(false)
      }
    }

    loadBusinessSetupData()
  }, [business?.id, business?.name, business?.email, business?.phone])

  // Función externa para verificar pasos completados
  const checkCompletedStepsExternal = async () => {
    if (!business?.id) return
    
    const completed = []

    try {
      // Verificar información básica
      if (business?.name && business?.email && business?.phone) {
        if (!completed.includes('basic-info')) {
          completed.push('basic-info')
        }
      }

      // Verificar especialistas (esto requeriría una API call)
      // TODO: Implementar verificación de especialistas
      
      // Verificar servicios (esto requeriría una API call)
      // TODO: Implementar verificación de servicios
      
      // Verificar horarios (esto requeriría una API call)
      // TODO: Implementar verificación de horarios

      setCompletedSteps(completed)
    } catch (error) {
      console.error('Error verificando pasos completados:', error)
    }
  }

  // Obtener módulos disponibles basados en la suscripción
  const availableModules = useMemo(() => {
    if (!subscriptionData?.plan?.modules) return []
    
    return subscriptionData.plan.modules.map(module => module.code)
  }, [subscriptionData])

  // Filtrar pasos basados en módulos disponibles
  const filteredSetupSteps = useMemo(() => {
    return setupSteps.filter(step => {
      // Incluir pasos requeridos
      if (step.required) return true
      
      // Incluir pasos de módulos si el módulo está disponible
      if (step.moduleRequired) {
        return availableModules.includes(step.moduleRequired)
      }
      
      return true
    })
  }, [availableModules, setupSteps])

  // Calcular progreso del setup
  const setupProgress = useMemo(() => {
    if (filteredSetupSteps.length === 0) return 100
    
    const totalSteps = filteredSetupSteps.length
    const completedCount = filteredSetupSteps.filter(step => 
      completedSteps.includes(step.id)
    ).length
    
    return Math.round((completedCount / totalSteps) * 100)
  }, [filteredSetupSteps, completedSteps])

  // Paso actual (primer paso no completado)
  const currentStep = useMemo(() => {
    const currentStepIndex = filteredSetupSteps.findIndex(step => 
      !completedSteps.includes(step.id)
    )
    return currentStepIndex >= 0 ? currentStepIndex : filteredSetupSteps.length - 1
  }, [filteredSetupSteps, completedSteps])

  // Funciones de utilidad
  const isStepCompleted = (stepId) => completedSteps.includes(stepId)
  
  const completeStep = (stepId) => {
    setCompletedSteps(prev => {
      if (!prev.includes(stepId)) {
        return [...prev, stepId]
      }
      return prev
    })
  }
  
  const resetStep = (stepId) => {
    setCompletedSteps(prev => prev.filter(id => id !== stepId))
  }

  // Verificar si el setup está completo
  const isSetupComplete = setupProgress === 100

  // Obtener siguiente paso no completado
  const getNextStep = () => {
    const nextStep = filteredSetupSteps.find(step => !completedSteps.includes(step.id))
    return nextStep || null
  }

  // Obtener información de suscripción formateada
  const subscriptionInfo = useMemo(() => {
    if (!subscriptionData) return null

    return {
      planName: subscriptionData.plan?.name || 'Plan no identificado',
      status: subscriptionData.status || 'UNKNOWN',
      expiresAt: subscriptionData.expiresAt,
      isActive: subscriptionData.status === 'ACTIVE',
      modules: subscriptionData.plan?.modules || [],
      limits: subscriptionData.limits || {},
      usage: subscriptionData.usage || {}
    }
  }, [subscriptionData])

  return {
    // Datos
    setupSteps: filteredSetupSteps,
    currentStep,
    completedSteps,
    setupProgress,
    availableModules,
    subscriptionInfo,
    business,
    
    // Estados
    isLoading,
    error,
    isSetupComplete,
    
    // Funciones
    isStepCompleted,
    completeStep,
    resetStep,
    getNextStep,
    checkCompletedSteps: checkCompletedStepsExternal
  }
}