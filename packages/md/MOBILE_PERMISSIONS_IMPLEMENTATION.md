# ✅ Sistema de Permisos Mobile - Implementación Completa

## 📋 Resumen

Se ha implementado el **sistema de permisos granulares** en la app móvil de Business Control, integrándose completamente con el sistema de permisos del backend y Redux shared.

---

## 🏗️ Arquitectura

### Componentes Creados

```
packages/business-control-mobile/src/
├── hooks/
│   └── usePermissions.js              ✅ Hook principal de permisos
│
└── components/
    └── permissions/
        ├── PermissionGuard.js         ✅ Guardia de permisos
        ├── PermissionButton.js        ✅ Botón con validación
        └── index.js                   ✅ Exports
```

### Redux Integration

**Modificaciones en `packages/shared/src/store/reactNativeStore.js`:**

1. ✅ Importado `permissionsReducer`
2. ✅ Agregado al store: `permissions: permissionsReducer`
3. ✅ Exportados thunks:
   - `fetchAllPermissions`
   - `fetchUserPermissions`
   - `grantUserPermission`
   - `revokeUserPermission`
   - `resetToDefaults`
4. ✅ Exportados selectores:
   - `selectUserPermissions`
   - `selectAllPermissions`
   - `selectPermissionsLoading`
   - `selectPermissionsError`

---

## 🎯 Uso

### 1. Hook `usePermissions`

```javascript
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = () => {
  const { 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    isSpecialist,
    userRole 
  } = usePermissions();
  
  // Verificar permiso individual
  const canCreate = hasPermission('appointments.create');
  
  // Verificar cualquiera (OR)
  const canManage = hasAnyPermission([
    'appointments.edit',
    'appointments.delete'
  ]);
  
  // Verificar todos (AND)
  const canFullAccess = hasAllPermissions([
    'appointments.create',
    'appointments.edit',
    'appointments.delete'
  ]);
  
  return (
    <View>
      {canCreate && <Button title="Crear Turno" />}
    </View>
  );
};
```

### 2. Componente `PermissionGuard`

Protege componentes basado en permisos:

```javascript
import { PermissionGuard } from '../components/permissions';

const MyScreen = () => {
  return (
    <View>
      {/* Ocultar si no tiene permiso */}
      <PermissionGuard permission="appointments.create">
        <CreateButton />
      </PermissionGuard>
      
      {/* Mostrar fallback */}
      <PermissionGuard 
        permission="appointments.edit"
        fallback={<Text>Sin permisos de edición</Text>}
      >
        <EditForm />
      </PermissionGuard>
      
      {/* Mostrar mensaje de error */}
      <PermissionGuard 
        permission="appointments.delete"
        showMessage
        message="Necesitas permiso para eliminar turnos"
      >
        <DeleteButton />
      </PermissionGuard>
      
      {/* Verificar cualquier permiso (OR) */}
      <PermissionGuard 
        permission={['appointments.edit', 'appointments.update']}
        requireAll={false}
      >
        <UpdateButton />
      </PermissionGuard>
      
      {/* Verificar todos los permisos (AND) */}
      <PermissionGuard 
        permission={[
          'appointments.create',
          'clients.create'
        ]}
        requireAll={true}
      >
        <AdvancedFeature />
      </PermissionGuard>
    </View>
  );
};
```

### 3. Componente `PermissionButton`

Botón que se oculta/deshabilita sin permisos:

```javascript
import { PermissionButton } from '../components/permissions';

const AppointmentActions = () => {
  return (
    <View>
      {/* Botón básico */}
      <PermissionButton
        permission="appointments.create"
        onPress={handleCreate}
        icon="add-circle-outline"
      >
        Crear Turno
      </PermissionButton>
      
      {/* Con variantes */}
      <PermissionButton
        permission="appointments.delete"
        onPress={handleDelete}
        icon="trash-outline"
        variant="danger"
      >
        Eliminar
      </PermissionButton>
      
      {/* Mostrar deshabilitado en vez de ocultar */}
      <PermissionButton
        permission="appointments.edit"
        onPress={handleEdit}
        showDisabled={true}
        icon="pencil-outline"
      >
        Editar Turno
      </PermissionButton>
      
      {/* Con loading */}
      <PermissionButton
        permission="appointments.create"
        onPress={handleSubmit}
        loading={isSubmitting}
        icon="save-outline"
        variant="success"
      >
        Guardar
      </PermissionButton>
    </View>
  );
};
```

### Variantes disponibles:
- `primary` (default) - Azul
- `secondary` - Gris
- `danger` - Rojo
- `success` - Verde
- `outline` - Transparente con borde

---

## 🔄 Cargar Permisos al Login

**Modificar `LoginScreen.js` o `MainNavigator.js`:**

```javascript
import { useDispatch } from 'react-redux';
import { fetchUserPermissions } from '@shared/store/reactNativeStore';

// En el login exitoso o al montar el componente autenticado
useEffect(() => {
  if (user?.id && user?.businessId) {
    // Cargar permisos del usuario
    dispatch(fetchUserPermissions({
      userId: user.id,
      businessId: user.businessId
    }));
  }
}, [user, dispatch]);
```

**Ejemplo completo en SpecialistDashboard:**

```javascript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserPermissions, 
  selectUser, 
  selectUserPermissions 
} from '@shared/store/reactNativeStore';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionButton } from '../components/permissions';

const SpecialistDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { hasPermission } = usePermissions();
  
  // Cargar permisos al montar
  useEffect(() => {
    if (user?.id && user?.businessId) {
      dispatch(fetchUserPermissions({
        userId: user.id,
        businessId: user.businessId
      }));
    }
  }, [user, dispatch]);
  
  return (
    <View>
      <Text>Mis Turnos</Text>
      
      {/* Solo mostrar si tiene permiso */}
      <PermissionButton
        permission="appointments.create"
        onPress={handleCreateAppointment}
        icon="add-circle-outline"
      >
        Crear Turno
      </PermissionButton>
    </View>
  );
};
```

---

## 🧪 Testing

### Probar con diferentes roles:

```javascript
// En desarrollo, puedes forzar diferentes permisos para testing
import { grantUserPermission } from '@shared/store/reactNativeStore';

// Conceder permiso temporalmente
dispatch(grantUserPermission({
  userId: user.id,
  businessId: user.businessId,
  permissionKey: 'appointments.create'
}));
```

### Verificar en consola:

```javascript
const { checkPermission } = usePermissions();

// Esto imprimirá en consola en modo DEV
checkPermission('appointments.create');
// Output: 🔐 Permiso "appointments.create": ✅ Concedido (SPECIALIST)
```

---

## 📊 Permisos Disponibles

### Appointments (Turnos)
- `appointments.view` - Ver turnos
- `appointments.view_all` - Ver todos los turnos (no solo propios)
- `appointments.create` - Crear turnos
- `appointments.edit` - Editar turnos
- `appointments.cancel` - Cancelar turnos
- `appointments.complete` - Completar turnos
- `appointments.delete` - Eliminar turnos

### Clients (Clientes)
- `clients.view` - Ver clientes
- `clients.create` - Crear clientes
- `clients.edit` - Editar clientes
- `clients.delete` - Eliminar clientes
- `clients.view_history` - Ver historial

### Services (Servicios)
- `services.view` - Ver servicios
- `services.create` - Crear servicios
- `services.edit` - Editar servicios
- `services.delete` - Eliminar servicios

### Payments (Pagos)
- `payments.view` - Ver pagos
- `payments.create` - Registrar pagos
- `payments.edit` - Editar pagos
- `payments.delete` - Eliminar pagos

### Evidence (Evidencia)
- `evidence.upload` - Subir fotos de evidencia
- `consents.capture` - Capturar consentimientos

---

## 🎯 Ejemplo Completo: Specialist Dashboard

```javascript
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserPermissions, 
  selectUser 
} from '@shared/store/reactNativeStore';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionButton, PermissionGuard } from '../components/permissions';

const SpecialistDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { 
    hasPermission, 
    hasAnyPermission,
    isSpecialist, 
    permissionsCount 
  } = usePermissions();
  
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Cargar permisos al montar
  useEffect(() => {
    if (user?.id && user?.businessId) {
      dispatch(fetchUserPermissions({
        userId: user.id,
        businessId: user.businessId
      }));
    }
  }, [user, dispatch]);
  
  // Cargar turnos
  const loadAppointments = async () => {
    // ... lógica de carga
  };
  
  useEffect(() => {
    loadAppointments();
  }, []);
  
  const handleCreateAppointment = () => {
    navigation.navigate('CreateAppointment');
  };
  
  const handleEditAppointment = (appointment) => {
    navigation.navigate('EditAppointment', { appointment });
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Turnos</Text>
        <Text style={styles.subtitle}>
          {permissionsCount} permisos activos
        </Text>
      </View>
      
      {/* Botón crear (solo si tiene permiso) */}
      <PermissionButton
        permission="appointments.create"
        onPress={handleCreateAppointment}
        icon="add-circle-outline"
        variant="primary"
        style={styles.createButton}
      >
        Crear Turno
      </PermissionButton>
      
      {/* Lista de turnos */}
      <FlatList
        data={appointments}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.appointmentCard}>
            <Text>{item.serviceName}</Text>
            <Text>{item.clientName}</Text>
            
            {/* Acciones condicionales */}
            <View style={styles.actions}>
              {/* Solo mostrar editar si tiene permiso */}
              <PermissionButton
                permission="appointments.edit"
                onPress={() => handleEditAppointment(item)}
                icon="pencil-outline"
                variant="secondary"
              >
                Editar
              </PermissionButton>
              
              {/* Mostrar si tiene CUALQUIERA de estos permisos */}
              <PermissionGuard
                permission={[
                  'evidence.upload',
                  'consents.capture'
                ]}
              >
                <PermissionButton
                  permission="evidence.upload"
                  onPress={() => uploadEvidence(item)}
                  icon="camera-outline"
                  variant="outline"
                >
                  Evidencia
                </PermissionButton>
              </PermissionGuard>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={loadAppointments} 
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827'
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  },
  createButton: {
    margin: 16
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  }
});

export default SpecialistDashboard;
```

---

## ✅ Checklist de Implementación

### Infraestructura (Completado)
- [x] Hook `usePermissions`
- [x] Hook `usePermissionCheck`
- [x] Hook `usePermissionGroups`
- [x] Componente `PermissionGuard`
- [x] Componente `PermissionButton`
- [x] Integración con `reactNativeStore`
- [x] Export de thunks y selectores

### Próximos Pasos
- [ ] Cargar permisos en login/app mount
- [ ] Integrar en SpecialistDashboard
- [ ] Integrar en ReceptionistDashboard
- [ ] Crear modal de creación de turnos con permisos
- [ ] Crear flujo de gestión de turnos con validaciones
- [ ] Integrar con BusinessRules

---

## 🔗 Referencias

- **Backend Permission Controller**: `packages/backend/src/controllers/PermissionController.js`
- **Permission Middleware**: `packages/backend/src/middleware/permissions.js`
- **Permissions Slice**: `packages/shared/src/store/slices/permissionsSlice.js`
- **Web PermissionsEditorModal**: `packages/web-app/src/components/permissions/PermissionsEditorModal.jsx`
- **Guía Completa**: `PERMISSIONS_SYSTEM_COMPLETE_GUIDE.md`

---

**Estado**: ✅ Fase 1 Completa - Infraestructura de Permisos Mobile
**Siguiente**: Fase 2 - Hook de Gestión de Turnos
