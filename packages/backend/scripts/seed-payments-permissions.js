const { Permission, RoleDefaultPermission } = require('../src/models');

/**
 * Script para crear permisos de PAYMENTS si no existen
 */
async function seedPaymentsPermissions() {
  try {
    console.log('🔐 Iniciando seed de permisos de PAYMENTS...');

    const paymentsPermissions = [
      {
        key: 'payments.view',
        name: 'Ver Pagos',
        description: 'Permite ver el historial de pagos y transacciones',
        category: 'PAYMENTS',
        isActive: true
      },
      {
        key: 'payments.create',
        name: 'Cobrar Turnos',
        description: 'Permite cobrar pagos en citas (requiere abrir turno de caja para efectivo)',
        category: 'PAYMENTS',
        isActive: true
      },
      {
        key: 'payments.refund',
        name: 'Reembolsar Pagos',
        description: 'Permite procesar reembolsos de pagos',
        category: 'PAYMENTS',
        isActive: true
      },
      {
        key: 'payments.config',
        name: 'Configurar Métodos de Pago',
        description: 'Permite gestionar métodos de pago del negocio',
        category: 'PAYMENTS',
        isActive: true
      }
    ];

    for (const permData of paymentsPermissions) {
      const [permission, created] = await Permission.findOrCreate({
        where: { key: permData.key },
        defaults: permData
      });

      if (created) {
        console.log(`✅ Permiso creado: ${permData.key}`);
      } else {
        console.log(`ℹ️  Permiso ya existe: ${permData.key}`);
      }
    }

    // Configurar permisos por defecto para roles
    console.log('\n📋 Configurando permisos por defecto...');

    const rolePermissions = [
      // BUSINESS tiene todos los permisos de pagos
      { role: 'BUSINESS', permissionKey: 'payments.view', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'payments.create', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'payments.refund', isGranted: true },
      { role: 'BUSINESS', permissionKey: 'payments.config', isGranted: true },

      // RECEPTIONIST puede ver y cobrar
      { role: 'RECEPTIONIST', permissionKey: 'payments.view', isGranted: true },
      { role: 'RECEPTIONIST', permissionKey: 'payments.create', isGranted: true },

      // RECEPTIONIST_SPECIALIST puede ver y cobrar
      { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'payments.view', isGranted: true },
      { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'payments.create', isGranted: true },

      // SPECIALIST por defecto NO puede cobrar (debe habilitarse manualmente)
      { role: 'SPECIALIST', permissionKey: 'payments.view', isGranted: false },
      { role: 'SPECIALIST', permissionKey: 'payments.create', isGranted: false }
    ];

    for (const rp of rolePermissions) {
      const permission = await Permission.findOne({ where: { key: rp.permissionKey } });
      
      if (!permission) {
        console.log(`⚠️  Permiso no encontrado: ${rp.permissionKey}`);
        continue;
      }

      const [roleDefaultPerm, created] = await RoleDefaultPermission.findOrCreate({
        where: {
          role: rp.role,
          permissionId: permission.id
        },
        defaults: {
          role: rp.role,
          permissionId: permission.id,
          isGranted: rp.isGranted
        }
      });

      if (created) {
        console.log(`✅ Permiso por defecto creado: ${rp.role} -> ${rp.permissionKey} (${rp.isGranted})`);
      } else {
        // Actualizar si ya existe
        await roleDefaultPerm.update({ isGranted: rp.isGranted });
        console.log(`🔄 Permiso por defecto actualizado: ${rp.role} -> ${rp.permissionKey} (${rp.isGranted})`);
      }
    }

    console.log('\n✨ Seed de permisos de PAYMENTS completado exitosamente');
    return { success: true };

  } catch (error) {
    console.error('❌ Error en seed de permisos de PAYMENTS:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedPaymentsPermissions()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = seedPaymentsPermissions;
