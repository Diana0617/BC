// Script para verificar el estado inicial de ownerPlans en Redux
// Se puede ejecutar en el navegador para debuggear

const checkOwnerPlansState = () => {
  // Verificar si Redux DevTools está disponible
  if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    console.log('🔍 Verificando estado de ownerPlans...');
    
    // Obtener el store desde la ventana global (solo para desarrollo)
    const state = window.store?.getState();
    
    if (state) {
      console.log('📊 Estado completo del store:', state);
      console.log('📋 Estado de ownerPlans:', state.ownerPlans);
      
      if (state.ownerPlans) {
        console.log('📦 plans:', state.ownerPlans.plans);
        console.log('🔢 plans type:', typeof state.ownerPlans.plans);
        console.log('📏 plans isArray:', Array.isArray(state.ownerPlans.plans));
        console.log('📊 plans length:', state.ownerPlans.plans?.length);
      } else {
        console.error('❌ ownerPlans slice no encontrado en el estado');
      }
    } else {
      console.error('❌ No se pudo acceder al estado del store');
      console.log('💡 Intentando obtener desde window.__REDUX_STORE__...');
      
      const altStore = window.__REDUX_STORE__;
      if (altStore) {
        const altState = altStore.getState();
        console.log('📊 Estado alternativo:', altState.ownerPlans);
      }
    }
  } else {
    console.warn('⚠️ Redux DevTools no disponible');
  }
};

// Exportar para uso manual
if (typeof window !== 'undefined') {
  window.checkOwnerPlansState = checkOwnerPlansState;
  console.log('🛠️ Función checkOwnerPlansState() disponible en window');
}

export default checkOwnerPlansState;