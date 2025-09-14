import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPlans, 
  createPlan, 
  updatePlan, 
  deletePlan,
  selectPlans,
  selectPlansLoading,
  selectPlansError,
  selectCreatePlanLoading,
  selectCreatePlanError,
  selectUpdatePlanLoading,
  selectUpdatePlanError,
  selectDeletePlanLoading,
  selectDeletePlanError
} from '../../../../shared/src/store/slices/plansSlice.js';

/**
 * Componente de prueba para verificar el funcionamiento del Redux slice de planes
 */
const ReduxPlansTest = () => {
  const dispatch = useDispatch();
  
  // Selectores del estado
  const plans = useSelector(selectPlans);
  const loading = useSelector(selectPlansLoading);
  const error = useSelector(selectPlansError);
  const createLoading = useSelector(selectCreatePlanLoading);
  const createError = useSelector(selectCreatePlanError);
  const updateLoading = useSelector(selectUpdatePlanLoading);
  const updateError = useSelector(selectUpdatePlanError);
  const deleteLoading = useSelector(selectDeletePlanLoading);
  const deleteError = useSelector(selectDeletePlanError);

  const [availableModules, setAvailableModules] = useState([]);

  // Cargar planes al montar el componente
  useEffect(() => {
    console.log('🔍 ReduxPlansTest: Cargando planes...');
    dispatch(fetchPlans());
    
    // Cargar módulos disponibles
    loadAvailableModules();
  }, [dispatch]);

  // Función para cargar módulos disponibles
  const loadAvailableModules = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/plans/available-modules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bc_auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableModules(data.data || []);
        console.log('📦 Módulos disponibles:', data.data);
      }
    } catch (error) {
      console.warn('⚠️ No se pudieron cargar los módulos:', error);
    }
  };

  // Log del estado cuando cambie
  useEffect(() => {
    console.log('📊 ReduxPlansTest - Estado actual:', {
      plans: plans,
      plansCount: Array.isArray(plans) ? plans.length : 'No es array',
      loading,
      error
    });
  }, [plans, loading, error]);

  // Función de prueba para crear un plan
  const handleTestCreatePlan = async () => {
    console.log('🚀 Test: Creando plan...');
    
    // Usar módulos válidos si están disponibles
    const moduleIds = availableModules.length > 0 
      ? availableModules.slice(0, 2).map(module => ({
          moduleId: module.id,
          isIncluded: true,
          limitQuantity: null,
          additionalPrice: 0,
          configuration: {}
        }))
      : [];
    
    const newPlan = {
      name: `Plan Test ${Date.now()}`,
      description: 'Plan de prueba creado desde Redux',
      price: 99.99,
      currency: 'COP',
      duration: 1,
      durationType: 'MONTHS',
      maxUsers: 10,
      maxClients: 50,
      maxAppointments: 100,
      storageLimit: 1000,
      status: 'ACTIVE',
      isPopular: false,
      trialDays: 7,
      features: {
        reports: true,
        notifications: true,
        customization: false
      },
      limitations: {
        maxBranches: 1,
        supportLevel: 'basic'
      },
      modules: moduleIds
    };

    console.log('📦 Creando plan con módulos:', moduleIds);

    try {
      const result = await dispatch(createPlan(newPlan)).unwrap();
      console.log('✅ Plan creado exitosamente:', result);
    } catch (error) {
      console.error('❌ Error al crear plan:', error);
    }
  };

  // Función de prueba para actualizar un plan
  const handleTestUpdatePlan = async () => {
    if (!Array.isArray(plans) || plans.length === 0) {
      console.warn('⚠️ No hay planes para actualizar');
      return;
    }

    const planToUpdate = plans[0];
    const updates = {
      name: `${planToUpdate.name} - Actualizado`,
      description: 'Plan actualizado desde Redux Test',
      price: parseFloat(planToUpdate.price) + 10,
      maxUsers: planToUpdate.maxUsers + 5,
      trialDays: 14
    };

    console.log('📝 Test: Actualizando plan...', planToUpdate.id);

    try {
      const result = await dispatch(updatePlan({ 
        planId: planToUpdate.id, 
        planData: updates 
      })).unwrap();
      console.log('✅ Plan actualizado exitosamente:', result);
    } catch (error) {
      console.error('❌ Error al actualizar plan:', error);
    }
  };

  // Función de prueba para cambiar estado de un plan (usando endpoint status existente)
  const handleTestTogglePlan = async () => {
    if (!Array.isArray(plans) || plans.length === 0) {
      console.warn('⚠️ No hay planes para cambiar estado');
      return;
    }

    const planToToggle = plans[0];
    console.log('🔄 Test: Cambiando estado del plan...', planToToggle.id);
    console.log('📊 Estado actual:', planToToggle.status);

    // Determinar el nuevo estado (toggle manual)
    const newStatus = planToToggle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    console.log('📊 Nuevo estado:', newStatus);

    try {
      // Usar updatePlan en lugar de togglePlanStatus temporalmente
      const result = await dispatch(updatePlan({ 
        planId: planToToggle.id, 
        planData: { status: newStatus }
      })).unwrap();
      console.log('✅ Estado cambiado exitosamente:', result);
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
    }
  };

  // Función de prueba para eliminar un plan
  const handleTestDeletePlan = async () => {
    if (!Array.isArray(plans) || plans.length === 0) {
      console.warn('⚠️ No hay planes para eliminar');
      return;
    }

    const planToDelete = plans[plans.length - 1]; // Eliminar el último
    console.log('🗑️ Test: Eliminando plan...', planToDelete.id);

    if (window.confirm(`¿Estás seguro de eliminar el plan "${planToDelete.name}"?`)) {
      try {
        await dispatch(deletePlan(planToDelete.id)).unwrap();
        console.log('✅ Plan eliminado exitosamente');
      } catch (error) {
        console.error('❌ Error al eliminar plan:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🧪 Test Redux Plans Slice
      </h2>

      {/* Estado actual */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Estado Actual</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Planes:</strong> {Array.isArray(plans) ? plans.length : 'No es array'}
          </div>
          <div>
            <strong>Loading:</strong> {loading ? '✅' : '❌'}
          </div>
          <div>
            <strong>Error:</strong> {error || 'Ninguno'}
          </div>
          <div>
            <strong>Create Loading:</strong> {createLoading ? '✅' : '❌'}
          </div>
          <div>
            <strong>Módulos Disponibles:</strong> {availableModules.length}
          </div>
          <div>
            <strong>Update Loading:</strong> {updateLoading ? '✅' : '❌'}
          </div>
        </div>
        
        {availableModules.length > 0 && (
          <div className="mt-4">
            <strong>Módulos:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableModules.map(module => (
                <span key={module.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {module.name} (ID: {module.id})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botones de prueba */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Acciones de Prueba</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => dispatch(fetchPlans())}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
          >
            {loading ? 'Cargando...' : 'Recargar Planes'}
          </button>

          <button
            onClick={handleTestCreatePlan}
            disabled={createLoading}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
          >
            {createLoading ? 'Creando...' : 'Crear Plan'}
          </button>

          <button
            onClick={handleTestUpdatePlan}
            disabled={updateLoading || !Array.isArray(plans) || plans.length === 0}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
          >
            {updateLoading ? 'Actualizando...' : 'Actualizar Plan'}
          </button>

          <button
            onClick={handleTestTogglePlan}
            disabled={updateLoading || !Array.isArray(plans) || plans.length === 0}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
          >
            {updateLoading ? 'Actualizando...' : 'Toggle Estado (Update)'}
          </button>
        </div>

        <div className="mt-4">
          <button
            onClick={handleTestDeletePlan}
            disabled={deleteLoading || !Array.isArray(plans) || plans.length === 0}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
          >
            {deleteLoading ? 'Eliminando...' : 'Eliminar Último Plan'}
          </button>
        </div>
      </div>

      {/* Lista de planes */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Planes Cargados</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando planes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>❌ Error: {error}</p>
          </div>
        ) : !Array.isArray(plans) ? (
          <div className="text-center py-8 text-orange-600">
            <p>⚠️ Los planes no son un array: {typeof plans}</p>
            <pre className="mt-2 text-left">{JSON.stringify(plans, null, 2)}</pre>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>📭 No hay planes cargados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg">{plan.name}</h4>
                <p className="text-gray-600 text-sm mb-2">{plan.description}</p>
                <div className="space-y-1 text-sm">
                  <p><strong>Precio:</strong> ${plan.price}</p>
                  <p><strong>Ciclo:</strong> {plan.billing_cycle}</p>
                  <p><strong>Estado:</strong> 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      plan.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      plan.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.status}
                    </span>
                  </p>
                  <p><strong>Módulos:</strong> {plan.modules?.length || 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Errores */}
      {(createError || updateError || deleteError) && (
        <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400">
          <h4 className="text-red-800 font-semibold">Errores:</h4>
          {createError && <p className="text-red-700">Create: {createError}</p>}
          {updateError && <p className="text-red-700">Update: {updateError}</p>}
          {deleteError && <p className="text-red-700">Delete: {deleteError}</p>}
        </div>
      )}
    </div>
  );
};

export default ReduxPlansTest;