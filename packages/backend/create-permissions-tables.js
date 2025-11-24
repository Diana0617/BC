/**
 * Script para crear las tablas del sistema de permisos
 * Ejecutar con: node create-permissions-tables.js
 */

const { sequelize } = require('./src/config/database');
const Permission = require('./src/models/Permission');
const RoleDefaultPermission = require('./src/models/RoleDefaultPermission');
const UserBusinessPermission = require('./src/models/UserBusinessPermission');

async function createPermissionsTables() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    console.log('\n📋 Creando tablas de permisos...');
    
    // Crear las tablas EN ORDEN (primero permissions, luego las que dependen de ella)
    await Permission.sync({ force: false });
    console.log('✅ Tabla permissions creada/actualizada');
    
    // Esperar un poco para asegurar que la tabla existe
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await RoleDefaultPermission.sync({ force: false });
    console.log('✅ Tabla role_default_permissions creada/actualizada');
    
    await UserBusinessPermission.sync({ force: false });
    console.log('✅ Tabla user_business_permissions creada/actualizada');

    console.log('\n🎉 ¡Todas las tablas de permisos fueron creadas exitosamente!');
    
    // Opcional: Insertar permisos base
    const permissionsCount = await Permission.count();
    if (permissionsCount === 0) {
      console.log('\n📝 Insertando permisos base...');
      await seedBasePermissions();
    } else {
      console.log(`\n✅ Ya existen ${permissionsCount} permisos en la base de datos`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear las tablas:', error);
    console.error('Detalles:', error.message);
    process.exit(1);
  }
}

async function seedBasePermissions() {
  const basePermissions = [
    // APPOINTMENTS
    { key: 'appointments.view', name: 'Ver Citas', description: 'Permite ver el calendario y listado de citas', category: 'appointments' },
    { key: 'appointments.create', name: 'Crear Citas', description: 'Permite agendar nuevas citas', category: 'appointments' },
    { key: 'appointments.edit', name: 'Editar Citas', description: 'Permite modificar citas existentes', category: 'appointments' },
    { key: 'appointments.delete', name: 'Eliminar Citas', description: 'Permite cancelar o eliminar citas', category: 'appointments' },
    { key: 'appointments.manage_all', name: 'Gestionar Todas las Citas', description: 'Permite gestionar citas de todos los especialistas', category: 'appointments' },

    // CLIENTS
    { key: 'clients.view', name: 'Ver Clientes', description: 'Permite ver información de clientes', category: 'clients' },
    { key: 'clients.create', name: 'Crear Clientes', description: 'Permite registrar nuevos clientes', category: 'clients' },
    { key: 'clients.edit', name: 'Editar Clientes', description: 'Permite modificar información de clientes', category: 'clients' },
    { key: 'clients.delete', name: 'Eliminar Clientes', description: 'Permite eliminar clientes', category: 'clients' },
    { key: 'clients.view_history', name: 'Ver Historial', description: 'Permite ver historial completo de clientes', category: 'clients' },

    // PAYMENTS
    { key: 'payments.view', name: 'Ver Pagos', description: 'Permite ver pagos y transacciones', category: 'payments' },
    { key: 'payments.create', name: 'Registrar Pagos', description: 'Permite registrar nuevos pagos', category: 'payments' },
    { key: 'payments.refund', name: 'Realizar Reembolsos', description: 'Permite procesar reembolsos', category: 'payments' },
    { key: 'payments.reports', name: 'Ver Reportes de Pagos', description: 'Permite ver reportes financieros', category: 'payments' },

    // SERVICES
    { key: 'services.view', name: 'Ver Servicios', description: 'Permite ver catálogo de servicios', category: 'services' },
    { key: 'services.create', name: 'Crear Servicios', description: 'Permite crear nuevos servicios', category: 'services' },
    { key: 'services.edit', name: 'Editar Servicios', description: 'Permite modificar servicios existentes', category: 'services' },
    { key: 'services.delete', name: 'Eliminar Servicios', description: 'Permite eliminar servicios', category: 'services' },

    // INVENTORY
    { key: 'inventory.view', name: 'Ver Inventario', description: 'Permite ver productos e inventario', category: 'inventory' },
    { key: 'inventory.create', name: 'Crear Productos', description: 'Permite agregar productos al inventario', category: 'inventory' },
    { key: 'inventory.edit', name: 'Editar Inventario', description: 'Permite modificar productos y stock', category: 'inventory' },
    { key: 'inventory.delete', name: 'Eliminar Productos', description: 'Permite eliminar productos', category: 'inventory' },
    { key: 'inventory.movements', name: 'Gestionar Movimientos', description: 'Permite registrar entradas y salidas', category: 'inventory' },

    // STAFF
    { key: 'staff.view', name: 'Ver Equipo', description: 'Permite ver lista de empleados', category: 'staff' },
    { key: 'staff.create', name: 'Agregar Miembros', description: 'Permite agregar nuevos miembros al equipo', category: 'staff' },
    { key: 'staff.edit', name: 'Editar Miembros', description: 'Permite modificar información del equipo', category: 'staff' },
    { key: 'staff.delete', name: 'Eliminar Miembros', description: 'Permite eliminar miembros del equipo', category: 'staff' },
    { key: 'staff.permissions', name: 'Gestionar Permisos', description: 'Permite asignar permisos a otros usuarios', category: 'staff' },

    // REPORTS
    { key: 'reports.view', name: 'Ver Reportes', description: 'Permite ver reportes y estadísticas', category: 'reports' },
    { key: 'reports.export', name: 'Exportar Reportes', description: 'Permite exportar reportes', category: 'reports' },
    { key: 'reports.financial', name: 'Reportes Financieros', description: 'Permite ver reportes financieros detallados', category: 'reports' },

    // SETTINGS
    { key: 'settings.view', name: 'Ver Configuración', description: 'Permite ver configuración del negocio', category: 'settings' },
    { key: 'settings.edit', name: 'Editar Configuración', description: 'Permite modificar configuración general', category: 'settings' },
    { key: 'settings.business', name: 'Configuración del Negocio', description: 'Permite modificar datos del negocio', category: 'settings' },
    { key: 'settings.subscription', name: 'Gestionar Suscripción', description: 'Permite gestionar plan y pagos', category: 'settings' }
  ];

  try {
    await Permission.bulkCreate(basePermissions, { ignoreDuplicates: true });
    console.log(`✅ ${basePermissions.length} permisos base insertados`);

    // Insertar permisos por defecto para roles
    await seedDefaultRolePermissions();
  } catch (error) {
    console.error('❌ Error al insertar permisos:', error);
  }
}

async function seedDefaultRolePermissions() {
  // Primero, obtener todos los permisos creados
  const permissions = await Permission.findAll();
  const permissionMap = {};
  permissions.forEach(p => {
    permissionMap[p.key] = p.id;
  });

  const defaultRolePermissions = [
    // OWNER - Todos los permisos
    { role: 'OWNER', permissionKey: 'appointments.manage_all' },
    { role: 'OWNER', permissionKey: 'clients.view' },
    { role: 'OWNER', permissionKey: 'clients.create' },
    { role: 'OWNER', permissionKey: 'clients.edit' },
    { role: 'OWNER', permissionKey: 'clients.delete' },
    { role: 'OWNER', permissionKey: 'payments.view' },
    { role: 'OWNER', permissionKey: 'payments.create' },
    { role: 'OWNER', permissionKey: 'payments.refund' },
    { role: 'OWNER', permissionKey: 'payments.reports' },
    { role: 'OWNER', permissionKey: 'services.view' },
    { role: 'OWNER', permissionKey: 'services.create' },
    { role: 'OWNER', permissionKey: 'services.edit' },
    { role: 'OWNER', permissionKey: 'services.delete' },
    { role: 'OWNER', permissionKey: 'inventory.view' },
    { role: 'OWNER', permissionKey: 'inventory.create' },
    { role: 'OWNER', permissionKey: 'inventory.edit' },
    { role: 'OWNER', permissionKey: 'inventory.delete' },
    { role: 'OWNER', permissionKey: 'inventory.movements' },
    { role: 'OWNER', permissionKey: 'staff.view' },
    { role: 'OWNER', permissionKey: 'staff.create' },
    { role: 'OWNER', permissionKey: 'staff.edit' },
    { role: 'OWNER', permissionKey: 'staff.delete' },
    { role: 'OWNER', permissionKey: 'staff.permissions' },
    { role: 'OWNER', permissionKey: 'reports.view' },
    { role: 'OWNER', permissionKey: 'reports.export' },
    { role: 'OWNER', permissionKey: 'reports.financial' },
    { role: 'OWNER', permissionKey: 'settings.view' },
    { role: 'OWNER', permissionKey: 'settings.edit' },
    { role: 'OWNER', permissionKey: 'settings.business' },
    { role: 'OWNER', permissionKey: 'settings.subscription' },

    // BUSINESS - Similar a OWNER pero sin gestionar suscripción
    { role: 'BUSINESS', permissionKey: 'appointments.manage_all' },
    { role: 'BUSINESS', permissionKey: 'clients.view' },
    { role: 'BUSINESS', permissionKey: 'clients.create' },
    { role: 'BUSINESS', permissionKey: 'clients.edit' },
    { role: 'BUSINESS', permissionKey: 'payments.view' },
    { role: 'BUSINESS', permissionKey: 'payments.create' },
    { role: 'BUSINESS', permissionKey: 'payments.reports' },
    { role: 'BUSINESS', permissionKey: 'services.view' },
    { role: 'BUSINESS', permissionKey: 'staff.view' },
    { role: 'BUSINESS', permissionKey: 'reports.view' },

    // SPECIALIST - Solo sus propias citas y clientes
    { role: 'SPECIALIST', permissionKey: 'appointments.view' },
    { role: 'SPECIALIST', permissionKey: 'appointments.create' },
    { role: 'SPECIALIST', permissionKey: 'appointments.edit' },
    { role: 'SPECIALIST', permissionKey: 'clients.view' },
    { role: 'SPECIALIST', permissionKey: 'clients.view_history' },
    { role: 'SPECIALIST', permissionKey: 'services.view' },
    { role: 'SPECIALIST', permissionKey: 'inventory.view' },

    // RECEPTIONIST - Gestión de citas y clientes
    { role: 'RECEPTIONIST', permissionKey: 'appointments.view' },
    { role: 'RECEPTIONIST', permissionKey: 'appointments.create' },
    { role: 'RECEPTIONIST', permissionKey: 'appointments.edit' },
    { role: 'RECEPTIONIST', permissionKey: 'appointments.manage_all' },
    { role: 'RECEPTIONIST', permissionKey: 'clients.view' },
    { role: 'RECEPTIONIST', permissionKey: 'clients.create' },
    { role: 'RECEPTIONIST', permissionKey: 'clients.edit' },
    { role: 'RECEPTIONIST', permissionKey: 'services.view' },

    // RECEPTIONIST_SPECIALIST - Combinación de ambos
    { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'appointments.view' },
    { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'appointments.create' },
    { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'appointments.edit' },
    { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'appointments.manage_all' },
    { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'clients.view' },
    { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'clients.create' },
    { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'clients.edit' },
    { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'clients.view_history' },
    { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'services.view' },
    { role: 'RECEPTIONIST_SPECIALIST', permissionKey: 'inventory.view' }
  ];

  // Convertir permissionKey a permissionId
  const rolePermissionsToInsert = defaultRolePermissions
    .filter(rp => permissionMap[rp.permissionKey]) // Solo los que existen
    .map(rp => ({
      role: rp.role,
      permissionId: permissionMap[rp.permissionKey],
      isGranted: true
    }));

  try {
    await RoleDefaultPermission.bulkCreate(rolePermissionsToInsert, { ignoreDuplicates: true });
    console.log(`✅ ${rolePermissionsToInsert.length} permisos por defecto asignados a roles`);
  } catch (error) {
    console.error('❌ Error al asignar permisos por defecto:', error);
    console.error('Detalles:', error.message);
  }
}

// Ejecutar
createPermissionsTables();
