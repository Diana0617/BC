/**
 * Script para conceder permiso de pagos a un especialista
 * Permite que el especialista pueda cobrar sus propios turnos y abrir caja
 */

const { User, Business, Permission, UserBusinessPermission } = require('./src/models');

async function grantPaymentPermission() {
  try {
    console.log('🔐 Concediendo permiso de pagos a especialista...\n');

    // 1. Listar negocios disponibles
    const businesses = await Business.findAll({
      attributes: ['id', 'name', 'email'],
      limit: 10
    });

    console.log('📋 Negocios disponibles:');
    businesses.forEach((b, i) => {
      console.log(`${i + 1}. ${b.name} (${b.email})`);
      console.log(`   ID: ${b.id}\n`);
    });

    // Para este ejemplo, usaremos el primer negocio
    const business = businesses[0];
    console.log(`✅ Usando negocio: ${business.name}\n`);

    // 2. Listar especialistas del negocio
    const specialists = await User.findAll({
      where: { 
        businessId: business.id,
        role: 'SPECIALIST'
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role']
    });

    console.log('👥 Especialistas en el negocio:');
    if (specialists.length === 0) {
      console.log('   ⚠️  No hay especialistas en este negocio');
      return;
    }

    specialists.forEach((s, i) => {
      console.log(`${i + 1}. ${s.firstName} ${s.lastName} (${s.email})`);
      console.log(`   ID: ${s.id}`);
      console.log(`   Rol: ${s.role}\n`);
    });

    // 3. Buscar el permiso 'payments.create'
    const permission = await Permission.findOne({
      where: { key: 'payments.create' }
    });

    if (!permission) {
      console.error('❌ Error: Permiso "payments.create" no encontrado en la base de datos');
      console.log('\n💡 Necesitas ejecutar las migraciones de permisos primero');
      return;
    }

    console.log(`✅ Permiso encontrado: ${permission.name} (${permission.key})\n`);

    // 4. Conceder permiso al primer especialista (o cambia el índice)
    const specialist = specialists[0];
    const adminUser = await User.findOne({
      where: { 
        businessId: business.id,
        role: 'BUSINESS'
      }
    });

    // Verificar si ya tiene el permiso
    const existingPermission = await UserBusinessPermission.findOne({
      where: {
        userId: specialist.id,
        businessId: business.id,
        permissionId: permission.id
      }
    });

    if (existingPermission && existingPermission.isGranted) {
      console.log(`ℹ️  ${specialist.firstName} ya tiene el permiso de cobrar`);
      console.log(`   Concedido el: ${existingPermission.grantedAt}`);
      return;
    }

    // Conceder o actualizar el permiso
    const [userPermission, created] = await UserBusinessPermission.upsert({
      userId: specialist.id,
      businessId: business.id,
      permissionId: permission.id,
      isGranted: true,
      grantedBy: adminUser?.id || specialist.id,
      grantedAt: new Date(),
      notes: 'Permiso concedido vía script - Puede cobrar sus propios turnos'
    });

    console.log('🎉 ¡PERMISO CONCEDIDO!\n');
    console.log('📊 Detalles:');
    console.log(`   Especialista: ${specialist.firstName} ${specialist.lastName}`);
    console.log(`   Email: ${specialist.email}`);
    console.log(`   Permiso: ${permission.name}`);
    console.log(`   Clave: ${permission.key}`);
    console.log(`   Estado: ${created ? 'NUEVO' : 'ACTUALIZADO'}`);
    console.log(`   Fecha: ${new Date().toLocaleString('es-CO')}`);
    
    console.log('\n✅ El especialista ahora puede:');
    console.log('   • Abrir turnos de caja');
    console.log('   • Cobrar sus propios turnos');
    console.log('   • Procesar pagos de sus clientes');
    console.log('   • Ver el widget de Caja en su dashboard');

    console.log('\n🔄 Recarga el dashboard para ver los cambios');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    process.exit();
  }
}

// Ejecutar
grantPaymentPermission();
