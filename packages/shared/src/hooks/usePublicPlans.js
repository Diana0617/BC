import { useState, useEffect } from 'react';
import { plansApi } from '../api/plansApi';

/**
 * Hook para cargar planes públicos para la landing page
 * Utiliza la API pública existente /api/plans sin autenticación
 * Solo obtiene planes ACTIVOS con módulos incluidos automáticamente
 */
export const usePublicPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPublicPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando planes públicos desde API...');
      
      // Usar la API existente - includeModules=true por defecto en peticiones públicas
      const response = await plansApi.getPlans({ 
        status: 'ACTIVE',
        includeModules: true,
        limit: 20 // Obtener hasta 20 planes
      });
      
      console.log('📦 Respuesta de la API:', response.data);
      
      if (response.data && response.data.success) {
        const plansData = response.data.data || [];
        
        console.log(`✅ ${plansData.length} planes cargados exitosamente`);
        
        // Transformar datos para la landing page si es necesario
        const transformedPlans = plansData.map(plan => {
          // Convertir precios menores o iguales a 1 a 0 (planes gratuitos)
          const numericPrice = parseFloat(plan.price) || 0;
          const actualPrice = numericPrice <= 1 ? 0 : numericPrice;
          
          return {
          ...plan,
          // Convertir precio de centavos a pesos si viene en centavos
          price: actualPrice,
          displayPrice: actualPrice >= 1000 ? actualPrice : actualPrice * 100,
          // Extraer features de los módulos si no existen
          features: plan.features && plan.features.length > 0 
            ? plan.features 
            : plan.modules?.filter(module => module.PlanModule?.isIncluded)
                .map(module => module.displayName || module.name) || [
                'Funcionalidades incluidas en el plan',
                'Acceso a la plataforma',
                'Soporte técnico'
              ],
          // Determinar si es popular
          isPopular: plan.isPopular || false,
          // Formatear duración
          durationType: plan.duration >= 30 ? 'MONTHS' : 'DAYS',
          displayDuration: plan.duration >= 30 ? Math.floor(plan.duration / 30) : plan.duration
          };
        });
        
        setPlans(transformedPlans);
      } else {
        throw new Error(response.data?.message || 'Error cargando planes');
      }
    } catch (err) {
      console.error('❌ Error fetching public plans:', err);
      setError(err.response?.data?.message || err.message || 'Error cargando planes');
      
      // Fallback: usar planes mock solo en caso de error
      console.log('🔄 Usando planes mock como fallback...');
      const mockPlans = [
        {
          id: 'mock-1',
          name: 'Básico',
          displayPrice: 49900,
          price: 49900,
          currency: 'COP',
          duration: 30,
          durationType: 'MONTHS',
          displayDuration: 1,
          description: 'Perfecto para negocios pequeños que están empezando',
          isPopular: false,
          status: 'ACTIVE',
          features: [
            'Gestión básica de inventario',
            'Hasta 100 productos',
            'Reportes básicos',
            'Soporte por email',
            'Acceso web'
          ]
        },
        {
          id: 'mock-2',
          name: 'Profesional',
          displayPrice: 99900,
          price: 99900,
          currency: 'COP',
          duration: 30,
          durationType: 'MONTHS',
          displayDuration: 1,
          description: 'La opción más popular para negocios en crecimiento',
          isPopular: true,
          status: 'ACTIVE',
          features: [
            'Gestión completa de inventario',
            'Productos ilimitados',
            'Reportes avanzados',
            'Gestión de proveedores',
            'Soporte prioritario',
            'App móvil incluida',
            'Múltiples usuarios'
          ]
        },
        {
          id: 'mock-3',
          name: 'Empresarial',
          displayPrice: 199900,
          price: 199900,
          currency: 'COP',
          duration: 30,
          durationType: 'MONTHS',
          displayDuration: 1,
          description: 'Para empresas que necesitan el máximo control',
          isPopular: false,
          status: 'ACTIVE',
          features: [
            'Todo lo del plan Profesional',
            'Análisis predictivo',
            'Integración con sistemas externos',
            'Automatización avanzada',
            'Soporte dedicado 24/7',
            'Personalización completa',
            'Capacitación incluida'
          ]
        }
      ];
      
      setPlans(mockPlans);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    refetch: fetchPublicPlans
  };
};

/**
 * Hook para iniciar proceso de compra/registro de un plan
 * Por ahora redirige al formulario de registro con plan preseleccionado
 * En el futuro se integrará con pasarela de pagos
 */
export const usePlanPurchase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiatePurchase = async (planId, userData = null) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🛒 Iniciando proceso de compra para plan: ${planId}`);

      // Por ahora, redirigir a formulario de registro con plan preseleccionado
      // TODO: En el futuro, integrar con pasarela de pagos (Wompi, PayU, etc.)
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/register?plan=${planId}`;
      
      console.log(`🔗 Redirigiendo a: ${redirectUrl}`);

      return {
        success: true,
        redirectUrl: redirectUrl,
        message: 'Redirigiendo a registro...'
      };

    } catch (err) {
      console.error('❌ Error initiating purchase:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error procesando compra';
      setError(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    initiatePurchase
  };
};

// Export por defecto para compatibilidad con el sistema de hooks compartido
const usePublicPlansHook = () => {
  return {
    usePublicPlans,
    usePlanPurchase
  };
};

export default usePublicPlansHook;