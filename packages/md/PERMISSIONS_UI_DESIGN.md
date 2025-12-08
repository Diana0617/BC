# Diseño Frontend: Panel de Permisos Estilo Trello

## 🎨 Visión General

Un sistema visual intuitivo tipo Trello para que los dueños de negocio (BUSINESS) puedan gestionar permisos de su equipo de forma clara y rápida.

---

## 📐 Estructura de Componentes

### 1. Vista Principal: `PermissionsBoard.jsx`

**Layout tipo Trello horizontal:**
```
┌──────────────────────────────────────────────────────────────────┐
│  🎯 Gestión de Permisos del Equipo                               │
│  Spa Belleza Total                                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [🔍 Buscar miembro]  [Filtrar por: Todos ▼]  [+ Invitar]       │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                            │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │  │
│  │  │ Card 1  │  │ Card 2  │  │ Card 3  │  │ Card 4  │ ... │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ← scroll horizontal →                                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**Card de Miembro:**
```
┌──────────────────────────┐
│  👤 María López          │ ← Avatar + Nombre
│  📋 Recepcionista        │ ← Rol con badge color
├──────────────────────────┤
│                          │
│  ✓ 12 permisos activos   │ ← Resumen numérico
│                          │
│  • Citas: 7/9           │ ← Categorías resumidas
│  • Pagos: 2/4           │
│  • Clientes: 3/6        │
│                          │
│  🏷️ Sin modificaciones  │ ← Estado (default/custom)
│                          │
├──────────────────────────┤
│  [✏️ Editar Permisos]    │ ← CTA principal
└──────────────────────────┘
```

**Card con Modificaciones:**
```
┌──────────────────────────┐
│  👤 Juan Pérez           │
│  💼 Especialista         │
├──────────────────────────┤
│                          │
│  ✓ 7 permisos activos    │
│                          │
│  • Citas: 5/9 ⚠️        │ ← Indicador de custom
│  • Pagos: 0/4           │
│  • Clientes: 2/6        │
│                          │
│  🎁 +2 concedidos        │ ← Permisos extra
│  🚫 -1 revocado          │ ← Permisos quitados
│                          │
├──────────────────────────┤
│  [✏️ Editar Permisos]    │
└──────────────────────────┘
```

---

### 2. Modal de Edición: `PermissionEditorModal.jsx`

**Layout de Modal Full-Screen:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ← Volver                EDITAR PERMISOS                    ✕   │
│                                                                  │
│  👤 Juan Pérez Gómez                                            │
│  💼 Especialista                                                │
│  📅 Miembro desde: 15/03/2025                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️ Este usuario tiene 2 permisos personalizados                │
│  [🔄 Restablecer a defaults del rol]                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │  📅 CITAS                                 [Expandir ▼]   │  │
│  │  ─────────────────────────────────────────────────────   │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │ □ Ver todas las citas                           │    │  │
│  │  │   Solo puede ver sus propias citas              │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │ ✓ Ver mis citas                    [DEFAULT] 🏷️ │    │  │
│  │  │   Puede ver su propia agenda                    │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │ ✓ Crear citas                       [EXTRA] 🎁  │    │  │
│  │  │   Puede agendar nuevas citas                    │    │  │
│  │  │   ℹ️ Concedido por: Admin el 10/10/2025         │    │  │
│  │  │   📝 "Especialista senior, maneja agenda"       │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │ □ Editar citas                                  │    │  │
│  │  │   Puede modificar detalles de citas             │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │ ✓ Completar citas                  [EXTRA] 🎁   │    │  │
│  │  │   Puede marcar citas como finalizadas           │    │  │
│  │  │   ℹ️ Concedido por: Admin el 10/10/2025         │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  💰 PAGOS                                [Expandir ▼]    │  │
│  │  ─────────────────────────────────────────────────────   │  │
│  │  (Similar estructura...)                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  👥 CLIENTES                             [Expandir ▼]    │  │
│  │  ─────────────────────────────────────────────────────   │  │
│  │  (Similar estructura...)                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  [Cancelar]                               [Guardar Cambios] ✓  │
└─────────────────────────────────────────────────────────────────┘
```

**Interacción Toggle de Permiso:**

Al hacer click en un checkbox:
```
┌─────────────────────────────────────────────────────────┐
│  ¿Conceder permiso "Crear citas"?                       │
│                                                          │
│  Este permiso NO está incluido por defecto para         │
│  el rol ESPECIALISTA.                                   │
│                                                          │
│  Notas (opcional):                                      │
│  ┌────────────────────────────────────────────────────┐│
│  │ Especialista senior, puede gestionar su agenda    ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  [Cancelar]  [Confirmar]                                │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Componentes Reutilizables

#### `PermissionCard.jsx`
```jsx
<PermissionCard
  user={user}
  permissionsSummary={summary}
  onEdit={() => openModal(user.id)}
  hasCustomizations={true}
/>
```

**Props:**
- `user`: { id, firstName, lastName, role, avatar }
- `permissionsSummary`: { total, byCategory, customGranted, customRevoked }
- `onEdit`: callback
- `hasCustomizations`: boolean

---

#### `PermissionToggle.jsx`
```jsx
<PermissionToggle
  permission={permission}
  isGranted={true}
  source="default" // 'default' | 'custom'
  metadata={{ grantedBy, grantedAt, notes }}
  onChange={handleToggle}
/>
```

**Estados visuales:**
1. **Default ON**: ✓ checkmark azul + badge "DEFAULT"
2. **Default OFF**: □ checkbox gris
3. **Custom ON**: ✓ checkmark verde + badge "EXTRA" 🎁
4. **Custom OFF (revoked)**: □ checkbox rojo + badge "REVOCADO" 🚫

---

#### `PermissionCategory.jsx`
```jsx
<PermissionCategory
  title="Citas"
  icon="📅"
  permissions={appointmentsPermissions}
  isExpanded={true}
  onToggle={handleToggle}
/>
```

Accordion colapsable por categoría.

---

### 4. Estado Global (Redux)

**Slice: `permissionsSlice.js`**

```javascript
const permissionsSlice = createSlice({
  name: 'permissions',
  initialState: {
    allPermissions: [], // Catálogo completo
    teamMembers: [], // Miembros del equipo con resumen
    currentEditingUser: null,
    userPermissions: null, // Permisos del usuario siendo editado
    loading: false,
    error: null
  },
  reducers: {
    // ...
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPermissions.fulfilled, (state, action) => {
        state.allPermissions = action.payload;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.teamMembers = action.payload;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.userPermissions = action.payload;
      })
      .addCase(grantPermission.fulfilled, (state, action) => {
        // Actualizar estado local
      })
      .addCase(revokePermission.fulfilled, (state, action) => {
        // Actualizar estado local
      });
  }
});
```

**Async Thunks:**
```javascript
export const fetchAllPermissions = createAsyncThunk(
  'permissions/fetchAll',
  async () => {
    const response = await api.get('/api/permissions');
    return response.data.data;
  }
);

export const fetchTeamMembers = createAsyncThunk(
  'permissions/fetchTeam',
  async (businessId) => {
    // Obtener usuarios del negocio
    // Para cada usuario, obtener resumen de permisos
    const users = await api.get(`/api/business/${businessId}/users`);
    
    const membersWithPermissions = await Promise.all(
      users.data.data.map(async (user) => {
        const perms = await api.get(
          `/api/permissions/user/${user.id}/business/${businessId}`
        );
        return {
          ...user,
          permissionsSummary: calculateSummary(perms.data.data)
        };
      })
    );
    
    return membersWithPermissions;
  }
);

export const grantPermission = createAsyncThunk(
  'permissions/grant',
  async ({ userId, businessId, permissionKey, notes }) => {
    const response = await api.post('/api/permissions/grant', {
      userId,
      businessId,
      permissionKey,
      notes
    });
    return response.data.data;
  }
);
```

---

## 🎨 Paleta de Colores

### Roles
- **BUSINESS**: `#8B5CF6` (purple-500)
- **SPECIALIST**: `#3B82F6` (blue-500)
- **RECEPTIONIST**: `#10B981` (green-500)
- **RECEPTIONIST_SPECIALIST**: `#F59E0B` (amber-500)

### Estados de Permisos
- **Default**: `#60A5FA` (blue-400)
- **Custom Granted**: `#34D399` (green-400) + 🎁
- **Custom Revoked**: `#F87171` (red-400) + 🚫
- **Hover**: `#DBEAFE` (blue-100)

### Categorías
- **Citas**: 📅 `#3B82F6`
- **Pagos**: 💰 `#10B981`
- **Clientes**: 👥 `#F59E0B`
- **Comisiones**: 💸 `#8B5CF6`
- **Inventario**: 📦 `#6366F1`
- **Reportes**: 📊 `#EC4899`

---

## 📱 Responsive Design

### Desktop (>1024px)
- Grid 4 columnas de cards
- Modal full-width con sidebar de categorías

### Tablet (768-1024px)
- Grid 3 columnas de cards
- Modal full-screen

### Mobile (<768px)
- Grid 1 columna (stack vertical)
- Modal full-screen con navegación por tabs

---

## 🎭 Animaciones y Feedback

### Hover States
```css
/* Card hover */
.permission-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

/* Toggle hover */
.permission-toggle:hover {
  background-color: #DBEAFE;
  transition: background-color 0.15s ease;
}
```

### Click Feedback
- **Grant permission**: ✨ Sparkle animation + "Permiso concedido"
- **Revoke permission**: ⚠️ Shake animation + "Permiso revocado"
- **Save changes**: ✅ Success toast + "Cambios guardados"

### Loading States
```jsx
{loading && (
  <div className="flex items-center space-x-2">
    <Spinner />
    <span>Actualizando permisos...</span>
  </div>
)}
```

---

## 🧩 Ejemplo de Implementación

### PermissionsBoard.jsx
```jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTeamMembers } from '../store/slices/permissionsSlice';
import PermissionCard from './PermissionCard';
import PermissionEditorModal from './PermissionEditorModal';

const PermissionsBoard = () => {
  const dispatch = useDispatch();
  const { teamMembers, loading } = useSelector(state => state.permissions);
  const { businessId } = useSelector(state => state.auth.user);
  const [editingUser, setEditingUser] = React.useState(null);

  useEffect(() => {
    dispatch(fetchTeamMembers(businessId));
  }, [dispatch, businessId]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gestión de Permisos del Equipo</h1>
        <p className="text-gray-600">
          Configura qué puede hacer cada miembro del equipo
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex space-x-4">
        <input
          type="text"
          placeholder="🔍 Buscar miembro..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <select className="px-4 py-2 border rounded-lg">
          <option>Todos los roles</option>
          <option>Especialistas</option>
          <option>Recepcionistas</option>
        </select>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teamMembers.map(member => (
          <PermissionCard
            key={member.id}
            user={member}
            permissionsSummary={member.permissionsSummary}
            onEdit={() => setEditingUser(member)}
          />
        ))}
      </div>

      {/* Modal de Edición */}
      {editingUser && (
        <PermissionEditorModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default PermissionsBoard;
```

---

### PermissionCard.jsx
```jsx
const PermissionCard = ({ user, permissionsSummary, onEdit }) => {
  const roleColors = {
    BUSINESS: 'bg-purple-500',
    SPECIALIST: 'bg-blue-500',
    RECEPTIONIST: 'bg-green-500',
    RECEPTIONIST_SPECIALIST: 'bg-amber-500'
  };

  const hasCustomizations = 
    permissionsSummary.customGranted > 0 || 
    permissionsSummary.customRevoked > 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      {/* Avatar y Nombre */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.firstName} className="rounded-full" />
          ) : (
            <span className="text-xl">👤</span>
          )}
        </div>
        <div>
          <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
          <span className={`text-xs px-2 py-1 rounded ${roleColors[user.role]} text-white`}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Resumen de Permisos */}
      <div className="space-y-2 mb-4">
        <p className="text-sm font-medium">
          ✓ {permissionsSummary.total} permisos activos
        </p>
        
        {Object.entries(permissionsSummary.byCategory).map(([cat, count]) => (
          <p key={cat} className="text-xs text-gray-600">
            • {cat}: {count.active}/{count.total}
          </p>
        ))}

        {hasCustomizations && (
          <div className="mt-3 pt-3 border-t">
            {permissionsSummary.customGranted > 0 && (
              <p className="text-xs text-green-600">
                🎁 +{permissionsSummary.customGranted} concedidos
              </p>
            )}
            {permissionsSummary.customRevoked > 0 && (
              <p className="text-xs text-red-600">
                🚫 -{permissionsSummary.customRevoked} revocados
              </p>
            )}
          </div>
        )}

        {!hasCustomizations && (
          <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
            🏷️ Sin modificaciones
          </p>
        )}
      </div>

      {/* Botón Editar */}
      <button
        onClick={onEdit}
        className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        ✏️ Editar Permisos
      </button>
    </div>
  );
};

export default PermissionCard;
```

---

## 🚀 Siguiente Paso: Implementación

1. ✅ Crear estructura de carpetas en `packages/web-app/src/`
   ```
   pages/
     business/
       permissions/
         PermissionsBoard.jsx
   components/
     permissions/
       PermissionCard.jsx
       PermissionEditorModal.jsx
       PermissionToggle.jsx
       PermissionCategory.jsx
   store/
     slices/
       permissionsSlice.js
   ```

2. ✅ Implementar componentes base
3. ✅ Integrar con Redux
4. ✅ Conectar con API backend
5. ✅ Testing

---

**Diseño creado:** Octubre 19, 2025  
**Versión:** 1.0.0  
**Framework:** React + Redux Toolkit + Tailwind CSS
