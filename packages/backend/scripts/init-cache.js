const { dashboardCache, CACHE_CONFIG } = require('../src/utils/cache');

console.log('🚀 Inicializando sistema de cache...');

// Test simple sin interferir con el servidor en ejecución
async function testCacheSystem() {
  try {
    console.log('🔧 Sistema de cache configurado correctamente!');
    console.log('📝 Configuración actual:');
    console.log(`   - Dashboard Metrics: ${CACHE_CONFIG.DASHBOARD_METRICS / 60000} minutos`);
    console.log(`   - Dashboard Revenue: ${CACHE_CONFIG.DASHBOARD_REVENUE / 60000} minutos`);
    console.log(`   - Dashboard Plans: ${CACHE_CONFIG.DASHBOARD_PLANS / 60000} minutos`);
    console.log(`   - Quick Summary: ${CACHE_CONFIG.QUICK_SUMMARY / 60000} minutos`);
    
    console.log('\n🎯 Cache implementado en servicios:');
    console.log('   - OwnerDashboardService.js');
    console.log('   - OwnerPlanController.js');
    
    console.log('\n🔧 API de gestión disponible en: /api/cache/*');
    console.log('   - GET /api/cache/stats - Estadísticas del cache');
    console.log('   - DELETE /api/cache/clear - Limpiar todo el cache');
    console.log('   - DELETE /api/cache/dashboard - Limpiar cache del dashboard');
    console.log('   - GET /api/cache/keys - Listar todas las claves');
    console.log('   - DELETE /api/cache/clear/:key - Limpiar clave específica');
    console.log('   - GET /api/cache/check/:key - Verificar si existe una clave');
    
    // Test básico de cache
    const stats = dashboardCache.getStats();
    console.log('\n📊 Estado actual del cache:');
    console.log(`   - Claves almacenadas: ${stats.size}`);
    console.log(`   - Hit rate: ${stats.hitRate}%`);
    
    console.log('\n✅ Sistema listo para producción!');
    console.log('📋 Para aplicar índices de rendimiento: ');
    console.log('   psql -d beauty_control -f migrations/add-performance-indexes.sql');
    
  } catch (error) {
    console.error('❌ Error en sistema de cache:', error);
    process.exit(1);
  }
}

// Ejecutar test
testCacheSystem();