# Uso de Redux Permissions en Frontend

## 🎯 Instalación Completa

El sistema de permisos ya está integrado en Redux Shared. Los archivos creados son:

```
packages/shared/src/
  api/
    ✅ permissions.js (API client)
  store/
    slices/
      ✅ permissionsSlice.js (Redux slice)
      ✅ index.js (exportaciones actualizadas)
    ✅ index.js (store actualizado con permissions reducer)
```

---

## 📦 Imports en Componentes

### Import básico
```javascript
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllPermissions,
  fetchTeamMembersWithPermissions,
  fetchUserPermissions,
  grantUserPermission,
  revokeUserPermission,
  setCurrentEditingUser,
  clearCurrentEditingUser
} from '@beauty-control/shared/store/slices';
```

### Import de utilidades
```javascript
import {
  groupPermissionsByCategory,
  getCategoryEmoji,
  getCategoryColor,
  getRoleColor,
  hasPermission
} from '@beauty-control/shared/api/permissions';
```

---

## 🔧 Uso en Componentes React

### 1. Panel de Permisos (Tablero Trello)

```jsx
// pages/business/permissions/PermissionsBoard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllPermissions,
  fetchTeamMembersWithPermissions,
  setCurrentEditingUser
} from '@beauty-control/shared/store/slices';

const PermissionsBoard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const businessId = user?.businessId;
  
  const {
    teamMembers,
    loadingTeamMembers,
    teamMembersError
  } = useSelector(state => state.permissions);

  useEffect(() => {
    if (businessId) {
      // Cargar catálogo de permisos
      dispatch(fetchAllPermissions());
      
      // Cargar miembros del equipo con sus permisos
      dispatch(fetchTeamMembersWithPermissions(businessId));
    }
  }, [dispatch, businessId]);

  const handleEditUser = (member) => {
    dispatch(setCurrentEditingUser(member));
  };

  if (loadingTeamMembers) {
    return <div>Cargando equipo...</div>;
  }

  if (teamMembersError) {
    return <div>Error: {teamMembersError}</div>;
  }

  return (
    <div className="permissions-board">
      <h1>Gestión de Permisos del Equipo</h1>
      
      <div className="team-cards-grid">
        {teamMembers.map(member => (
          <PermissionCard
            key={member.id}
            member={member}
            onEdit={() => handleEditUser(member)}
          />
        ))}
      </div>
    </div>
  );
};

export default PermissionsBoard;
```

---

### 2. Card de Miembro

```jsx
// components/permissions/PermissionCard.jsx
import React from 'react';
import { getRoleColor } from '@beauty-control/shared/api/permissions';

const PermissionCard = ({ member, onEdit }) => {
  const { permissionsSummary } = member;
  const hasCustomizations = 
    permissionsSummary.customGranted > 0 || 
    permissionsSummary.customRevoked > 0;

  return (
    <div className="permission-card">
      {/* Avatar y Nombre */}
      <div className="card-header">
        <div className="avatar">
          {member.avatar ? (
            <img src={member.avatar} alt={member.firstName} />
          ) : (
            <span>👤</span>
          )}
        </div>
        <div>
          <h3>{member.firstName} {member.lastName}</h3>
          <span 
            className="role-badge"
            style={{ backgroundColor: getRoleColor(member.role) }}
          >
            {member.role}
          </span>
        </div>
      </div>

      {/* Resumen */}
      <div className="card-body">
        <p className="total">✓ {permissionsSummary.total} permisos activos</p>
        
        {Object.entries(permissionsSummary.byCategory).map(([cat, count]) => (
          <p key={cat} className="category-count">
            • {cat}: {count.active}/{count.total}
          </p>
        ))}

        {hasCustomizations && (
          <div className="customizations">
            {permissionsSummary.customGranted > 0 && (
              <p className="granted">🎁 +{permissionsSummary.customGranted} concedidos</p>
            )}
            {permissionsSummary.customRevoked > 0 && (
              <p className="revoked">🚫 -{permissionsSummary.customRevoked} revocados</p>
            )}
          </div>
        )}
      </div>

      {/* Botón Editar */}
      <button onClick={onEdit} className="edit-button">
        ✏️ Editar Permisos
      </button>
    </div>
  );
};

export default PermissionCard;
```

---

### 3. Modal de Edición

```jsx
// components/permissions/PermissionEditorModal.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserPermissions,
  grantUserPermission,
  revokeUserPermission,
  resetToDefaults,
  clearCurrentEditingUser
} from '@beauty-control/shared/store/slices';
import {
  groupPermissionsByCategory,
  getCategoryEmoji,
  getCategoryColor
} from '@beauty-control/shared/api/permissions';

const PermissionEditorModal = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const businessId = user?.businessId;
  
  const {
    currentEditingUser,
    currentUserPermissions,
    loadingUserPermissions,
    savingPermission,
    saveSuccess,
    saveError
  } = useSelector(state => state.permissions);

  useEffect(() => {
    if (currentEditingUser && businessId) {
      dispatch(fetchUserPermissions({
        userId: currentEditingUser.id,
        businessId
      }));
    }
  }, [dispatch, currentEditingUser, businessId]);

  const handleTogglePermission = async (permissionKey, currentlyGranted) => {
    const action = currentlyGranted ? revokeUserPermission : grantUserPermission;
    
    await dispatch(action({
      userId: currentEditingUser.id,
      businessId,
      permissionKey,
      notes: `Modificado desde panel de permisos`
    }));

    // Recargar permisos después de modificar
    dispatch(fetchUserPermissions({
      userId: currentEditingUser.id,
      businessId
    }));
  };

  const handleReset = async () => {
    if (confirm('¿Seguro que deseas resetear los permisos a los valores por defecto?')) {
      await dispatch(resetToDefaults({
        userId: currentEditingUser.id,
        businessId
      }));

      // Recargar permisos
      dispatch(fetchUserPermissions({
        userId: currentEditingUser.id,
        businessId
      }));
    }
  };

  const handleClose = () => {
    dispatch(clearCurrentEditingUser());
  };

  if (!currentEditingUser) return null;

  if (loadingUserPermissions) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <p>Cargando permisos...</p>
        </div>
      </div>
    );
  }

  const permissionsByCategory = groupPermissionsByCategory(
    currentUserPermissions?.permissions || []
  );

  const hasCustomizations = 
    currentUserPermissions?.customizations?.extraGranted?.length > 0 ||
    currentUserPermissions?.customizations?.revoked?.length > 0;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <button onClick={handleClose}>← Volver</button>
          <h2>Editar Permisos</h2>
          <button onClick={handleClose}>✕</button>
        </div>

        {/* User Info */}
        <div className="user-info">
          <h3>👤 {currentEditingUser.firstName} {currentEditingUser.lastName}</h3>
          <p>💼 {currentEditingUser.role}</p>
        </div>

        {/* Customization Warning */}
        {hasCustomizations && (
          <div className="customization-warning">
            <p>⚠️ Este usuario tiene {
              currentUserPermissions.customizations.extraGranted.length +
              currentUserPermissions.customizations.revoked.length
            } permisos personalizados</p>
            <button onClick={handleReset}>🔄 Restablecer a defaults</button>
          </div>
        )}

        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="success-message">✅ Cambios guardados correctamente</div>
        )}
        {saveError && (
          <div className="error-message">❌ Error: {saveError}</div>
        )}

        {/* Permissions by Category */}
        <div className="permissions-list">
          {Object.entries(permissionsByCategory).map(([category, permissions]) => (
            <PermissionCategory
              key={category}
              category={category}
              permissions={permissions}
              onToggle={handleTogglePermission}
              saving={savingPermission}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={handleClose}>Cancelar</button>
          <button onClick={handleClose} className="primary">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default PermissionEditorModal;
```

---

### 4. Categoría de Permisos (Accordion)

```jsx
// components/permissions/PermissionCategory.jsx
import React, { useState } from 'react';
import { getCategoryEmoji, getCategoryColor } from '@beauty-control/shared/api/permissions';

const PermissionCategory = ({ category, permissions, onToggle, saving }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="permission-category">
      <div 
        className="category-header" 
        onClick={() => setExpanded(!expanded)}
        style={{ borderLeftColor: getCategoryColor(category) }}
      >
        <span>{getCategoryEmoji(category)} {category.toUpperCase()}</span>
        <button>{expanded ? '▼' : '▶'}</button>
      </div>

      {expanded && (
        <div className="category-body">
          {permissions.map(perm => (
            <PermissionToggle
              key={perm.permission.key}
              permission={perm}
              onToggle={onToggle}
              disabled={saving}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PermissionCategory;
```

---

### 5. Toggle de Permiso Individual

```jsx
// components/permissions/PermissionToggle.jsx
import React from 'react';

const PermissionToggle = ({ permission, onToggle, disabled }) => {
  const { permission: perm, isGranted, source } = permission;
  
  const getBadge = () => {
    if (source === 'default' && isGranted) {
      return <span className="badge default">DEFAULT</span>;
    }
    if (source === 'custom' && isGranted) {
      return <span className="badge custom-granted">EXTRA 🎁</span>;
    }
    if (source === 'custom' && !isGranted) {
      return <span className="badge custom-revoked">REVOCADO 🚫</span>;
    }
    return null;
  };

  const getCheckboxClass = () => {
    if (source === 'default' && isGranted) return 'checkbox-default';
    if (source === 'custom' && isGranted) return 'checkbox-granted';
    if (source === 'custom' && !isGranted) return 'checkbox-revoked';
    return 'checkbox-normal';
  };

  return (
    <div className="permission-toggle">
      <label className={getCheckboxClass()}>
        <input
          type="checkbox"
          checked={isGranted}
          onChange={() => onToggle(perm.key, isGranted)}
          disabled={disabled}
        />
        <span className="permission-name">{perm.name}</span>
        {getBadge()}
      </label>
      
      <p className="permission-description">{perm.description}</p>
      
      {permission.grantedBy && (
        <div className="permission-metadata">
          <p>ℹ️ Concedido por: {permission.grantedBy.firstName} el {
            new Date(permission.grantedAt).toLocaleDateString()
          }</p>
          {permission.notes && <p>📝 {permission.notes}</p>}
        </div>
      )}
    </div>
  );
};

export default PermissionToggle;
```

---

## 🎨 Estilos CSS Sugeridos

```css
/* PermissionsBoard.css */
.permissions-board {
  padding: 2rem;
}

.team-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

/* PermissionCard */
.permission-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.permission-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.customizations {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.granted {
  color: #10b981;
  font-size: 0.875rem;
}

.revoked {
  color: #ef4444;
  font-size: 0.875rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
}

/* Permission Toggle */
.permission-toggle {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.checkbox-default input:checked + .permission-name {
  color: #3b82f6;
}

.checkbox-granted input:checked + .permission-name {
  color: #10b981;
}

.checkbox-revoked + .permission-name {
  color: #ef4444;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.badge.default {
  background: #dbeafe;
  color: #1e40af;
}

.badge.custom-granted {
  background: #d1fae5;
  color: #065f46;
}

.badge.custom-revoked {
  background: #fee2e2;
  color: #991b1b;
}
```

---

## 🔄 Flujo Completo de Uso

1. **Usuario BUSINESS entra a `/permissions`**
2. **Se dispara `fetchTeamMembersWithPermissions`** - Carga todos los miembros con resumen
3. **Se muestran cards** con resumen visual de permisos
4. **Click en "Editar Permisos"** - Abre modal
5. **Se dispara `fetchUserPermissions`** - Carga permisos detallados del usuario
6. **Usuario toggle un checkbox** - Llama `grantUserPermission` o `revokeUserPermission`
7. **Success** - Se actualiza localmente + se recarga `fetchUserPermissions`
8. **Cerrar modal** - Vuelve al tablero actualizado

---

## 📝 Próximos Pasos

1. ✅ Redux setup completo
2. ⏳ Implementar componentes React según diseño Trello
3. ⏳ Testing E2E del flujo completo
4. ⏳ Agregar animaciones y feedback visual

---

**Documentado:** Octubre 19, 2025  
**Sistema:** Redux Permissions  
**Versión:** 1.0.0
