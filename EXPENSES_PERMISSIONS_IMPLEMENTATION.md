# Sistema de Permisos para Gastos (Expenses) - Implementación Completada

## ✅ Cambios Realizados

### 1. **Script de Seed de Permisos** 📝
**Archivo:** `packages/backend/scripts/seed-expenses-permissions.js`

Crea los siguientes permisos en la categoría `EXPENSES`:
- ✅ `expenses.view` - Ver Gastos
- ✅ `expenses.create` - Registrar Gastos
- ✅ `expenses.edit` - Editar Gastos
- ✅ `expenses.delete` - Eliminar Gastos
- ✅ `expenses.approve` - Aprobar Gastos
- ✅ `expenses.categories` - Gestionar Categorías de Gastos

**Permisos por defecto para roles:**
- **BUSINESS**: Todos los permisos activados ✅
- **RECEPTIONIST**: Por defecto desactivados (deben habilitarse manualmente) ❌
- **RECEPTIONIST_SPECIALIST**: Por defecto desactivados (deben habilitarse manualmente) ❌
- **SPECIALIST**: Sin acceso por defecto ❌

### 2. **Backend - Verificación de Permisos** 🔐
**Archivo:** `packages/backend/src/controllers/BusinessExpenseController.js`

Se agregó verificación de permisos en:
- ✅ `getCategories()` - Requiere `expenses.view`
- ✅ `createCategory()` - Requiere `expenses.categories`
- ✅ `getExpenses()` - Requiere `expenses.view`
- ✅ `createExpense()` - Requiere `expenses.create`
- ✅ `updateExpense()` - Requiere `expenses.edit`
- ✅ `deleteExpense()` - Requiere `expenses.delete`
- ✅ `approveExpense()` - Requiere `expenses.approve`

Ahora los endpoints retornan `403 Forbidden` si el usuario no tiene el permiso requerido.

### 3. **Frontend - Hook de Permisos** ⚛️
**Archivo:** `packages/web-app/src/hooks/useUserPermissions.js`

Se agregó el objeto `expenses` con las siguientes propiedades:
```javascript
expenses: {
  view: canViewExpenses,
  create: canCreateExpenses,
  edit: canEditExpenses,
  delete: canDeleteExpenses,
  approve: canApproveExpenses,
  categories: canManageExpenseCategories
}
```

### 4. **Frontend - Editor de Permisos** 🎯
**Archivo:** `packages/web-app/src/components/permissions/PermissionsEditorModal.jsx`

Se agregó el emoji 💸 para la categoría `EXPENSES` en el modal de edición de permisos.

### 5. **Frontend - Componentes de Gastos** 📊
**Archivos modificados:**
- `packages/web-app/src/pages/business/profile/sections/MovementsSection.jsx`
- `packages/web-app/src/components/business/profile/ExpensesTab.jsx`

**Cambios:**
- ✅ La pestaña "Gastos del Negocio" solo se muestra si el usuario tiene `expenses.view`
- ✅ Botón "Nuevo Gasto" solo visible con `expenses.create`
- ✅ Botones de editar/eliminar condicionados a `expenses.edit` y `expenses.delete`
- ✅ Botones de aprobar/marcar como pagado condicionados a `expenses.approve`

---

## 🚀 Pasos para Activar el Sistema

### Paso 1: Ejecutar el Script de Seed

Desde la terminal, en la carpeta del backend:

```bash
cd packages/backend
node scripts/seed-expenses-permissions.js
```

Esto creará los permisos en la base de datos y configurará los permisos por defecto para cada rol.

**Salida esperada:**
```
🔐 Iniciando seed de permisos de EXPENSES...
✅ Permiso creado: expenses.view
✅ Permiso creado: expenses.create
✅ Permiso creado: expenses.edit
✅ Permiso creado: expenses.delete
✅ Permiso creado: expenses.approve
✅ Permiso creado: expenses.categories

📋 Configurando permisos por defecto...
✅ Permiso por defecto creado: BUSINESS -> expenses.view (true)
✅ Permiso por defecto creado: BUSINESS -> expenses.create (true)
...
✨ Seed de permisos de EXPENSES completado exitosamente
```

### Paso 2: Otorgar Permisos a un Recepcionista

**Opción A: Desde la interfaz web (UI)**
1. Iniciar sesión como **BUSINESS** (administrador)
2. Ir a **Perfil del Negocio** → **Gestión de Staff**
3. Hacer clic en **"Editar Permisos"** en el miembro del equipo (recepcionista)
4. Expandir la categoría **💸 EXPENSES**
5. Activar los permisos deseados:
   - ✅ Ver Gastos (`expenses.view`)
   - ✅ Registrar Gastos (`expenses.create`)
   - ✅ Editar Gastos (`expenses.edit`) - Opcional
6. Los cambios se guardan automáticamente

**Opción B: Desde la base de datos (SQL - solo para desarrollo/testing)**
```sql
-- Otorgar permisos de ver y crear gastos a un recepcionista específico
INSERT INTO "user_business_permissions" ("userId", "businessId", "permissionId", "isGranted", "grantedBy", "grantedAt")
SELECT 
  'USER_ID_DEL_RECEPCIONISTA',
  'BUSINESS_ID',
  p.id,
  true,
  'BUSINESS_OWNER_USER_ID',
  NOW()
FROM "permissions" p
WHERE p.key IN ('expenses.view', 'expenses.create')
ON CONFLICT ("userId", "permissionId") 
DO UPDATE SET "isGranted" = true;
```

### Paso 3: Verificar Funcionamiento

**Como Recepcionista:**
1. Iniciar sesión con cuenta de recepcionista
2. Ir a **Perfil del Negocio** → **Movimientos del Negocio**
3. Verificar que aparezca la pestaña **"Gastos del Negocio"** 💸
4. Hacer clic en **"Nuevo Gasto"** (solo si tiene permiso `expenses.create`)
5. Completar y guardar el gasto

**Como Business (Admin):**
1. Puede ver, aprobar, editar y eliminar gastos
2. Puede gestionar categorías de gastos
3. Puede otorgar/revocar permisos a otros usuarios

---

## 📋 Permisos por Nivel

| Permiso | BUSINESS | RECEPTIONIST* | RECEPTIONIST_SPECIALIST* | SPECIALIST* |
|---------|----------|---------------|--------------------------|-------------|
| **Ver Gastos** | ✅ Siempre | ❌ Debe otorgarse | ❌ Debe otorgarse | ❌ Debe otorgarse |
| **Crear Gastos** | ✅ Siempre | ❌ Debe otorgarse | ❌ Debe otorgarse | ❌ Debe otorgarse |
| **Editar Gastos** | ✅ Siempre | ❌ Puede otorgarse | ❌ Puede otorgarse | ❌ Nunca |
| **Eliminar Gastos** | ✅ Siempre | ❌ Nunca | ❌ Nunca | ❌ Nunca |
| **Aprobar Gastos** | ✅ Siempre | ❌ Nunca | ❌ Nunca | ❌ Nunca |
| **Gestionar Categorías** | ✅ Siempre | ❌ Nunca | ❌ Nunca | ❌ Nunca |

**\*Roles Autorizables por BUSINESS:**
- ✅ `RECEPTIONIST` - Puede recibir: view, create, edit
- ✅ `RECEPTIONIST_SPECIALIST` - Puede recibir: view, create, edit  
- ✅ `SPECIALIST` - Puede recibir: view, create (NO edit)

**Restricciones importantes:**
- Solo **BUSINESS** puede: eliminar gastos, aprobar gastos y gestionar categorías
- **SPECIALIST**: Por defecto NO ve opciones de gastos en su dashboard
- Los permisos deben otorgarse manualmente desde "Gestión de Staff"

---

## 🧪 Testing

Para probar el sistema de permisos:

1. **Crear usuario de prueba (recepcionista):**
   ```bash
   cd packages/backend
   node scripts/create-test-users.js
   ```

2. **Sin permisos:** Intentar acceder a gastos → No debe ver la pestaña

3. **Otorgar `expenses.view`:** Debe ver la pestaña y lista de gastos, pero sin botones de acción

4. **Otorgar `expenses.create`:** Debe aparecer botón "Nuevo Gasto"

5. **Otorgar `expenses.edit`:** Debe aparecer botón "Editar" en cada gasto

6. **Revocar permisos:** La pestaña desaparece/botones se ocultan inmediatamente

---

## 🔧 Troubleshooting

### Problema: Los permisos no aparecen en el modal
**Solución:** Verificar que el script de seed se ejecutó correctamente:
```bash
node scripts/seed-expenses-permissions.js
```

### Problema: La pestaña "Gastos" no aparece
**Causas posibles:**
1. El usuario no tiene el permiso `expenses.view`
2. El frontend no está cargando los permisos correctamente
3. Verificar en consola del navegador: buscar `[useUserPermissions]`

### Problema: Backend retorna 403 Forbidden
**Solución:** El usuario necesita el permiso correspondiente. Verificar en el modal de permisos que el permiso esté activado.

### Problema: Los cambios de permisos no se reflejan inmediatamente
**Solución:** Cerrar sesión y volver a iniciar, o refrescar la página (F5).

---

## 📝 Notas Importantes

1. **Seguridad:** Los permisos se validan tanto en backend como en frontend. El backend SIEMPRE valida, el frontend solo oculta controles.

2. **Persistencia:** Los permisos personalizados sobrescriben los permisos por defecto del rol.

3. **Auditoría:** Todos los cambios de permisos quedan registrados con `grantedBy` y `grantedAt` en la BD.

4. **Performance:** El hook `useUserPermissions` usa `useMemo` para optimizar el rendimiento.

5. **Multi-tenancy:** Los permisos son por negocio (`businessId`), no globales.

---

## 🎯 Próximos Pasos Sugeridos

1. ✅ **Ejecutar el seed de permisos** (obligatorio)
2. ✅ **Probar con un recepcionista de prueba**
3. ✅ **Otorgar permisos desde la UI**
4. ⚠️ **Documentar para el equipo** qué permisos otorgar a cada rol
5. ⚠️ **Configurar permisos en producción** según las necesidades del negocio

---

**Implementado por:** GitHub Copilot (Claude Sonnet 4.5)  
**Fecha:** Febrero 7, 2026  
**Versión:** 1.0.0
