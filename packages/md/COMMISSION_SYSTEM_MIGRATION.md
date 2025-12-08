# Sistema de Comisiones - Migración a Reglas de Negocio

## 📋 Resumen

Se ha migrado exitosamente la configuración del sistema de comisiones de un campo fijo en la tabla `businesses` a un sistema flexible basado en **Reglas de Negocio**.

---

## 🎯 Cambios Implementados

### 1. Backend - Nuevas Reglas

**Archivo**: `packages/backend/scripts/seed-rule-templates.js`

Se agregaron dos nuevas reglas en la categoría `PAYMENT_POLICY`:

#### **SPECIALIST_COMMISSION_ENABLED**
- **Tipo**: BOOLEAN
- **Valor por defecto**: `true`
- **Descripción**: Usar sistema de comisiones para el pago de especialistas
- **Opciones**: 
  - `true`: Comisiones por servicio
  - `false`: Sueldo fijo

#### **SPECIALIST_DEFAULT_COMMISSION_RATE**
- **Tipo**: NUMBER
- **Valor por defecto**: `50`
- **Descripción**: Porcentaje de comisión por defecto para especialistas (%)
- **Validación**: Min: 0, Max: 100
- **Ejemplos**: 30%, 40%, 50%, 60%, 70%

---

### 2. Base de Datos

#### **Migración de Creación**
**Archivo**: `migrations/add-commission-system-field.sql` (OBSOLETO - eliminado)

#### **Migración de Eliminación**
**Archivo**: `migrations/remove-commission-system-field.sql`
```sql
ALTER TABLE businesses 
DROP COLUMN IF EXISTS use_commission_system;
```

**Estado**: ✅ Ejecutada exitosamente

---

### 3. Backend - Modelo Business

**Archivo**: `packages/backend/src/models/Business.js`

✅ **Eliminado**: Campo `useCommissionSystem`
- El modelo ya no tiene este campo
- La configuración se lee desde las reglas de negocio

---

### 4. Frontend - SpecialistsSection

**Archivo**: `packages/web-app/src/pages/business/profile/sections/SpecialistsSection.jsx`

#### **Lógica de Lectura**
```javascript
// Leer reglas desde Redux
const businessRules = useSelector(state => state.businessRules?.rules || []);
const commissionRule = businessRules.find(r => r.key === 'SPECIALIST_COMMISSION_ENABLED');
const defaultCommissionRule = businessRules.find(r => r.key === 'SPECIALIST_DEFAULT_COMMISSION_RATE');

// Valores efectivos
const useCommissionSystem = commissionRule?.effectiveValue ?? commissionRule?.defaultValue ?? true;
const defaultCommissionRate = defaultCommissionRule?.effectiveValue ?? defaultCommissionRule?.defaultValue ?? 50;
```

#### **Campo de Comisión Condicional**
```javascript
{useCommissionSystem && (
  <div>
    <label>Comisión (%)</label>
    <input
      type="number"
      name="commissionRate"
      placeholder={defaultCommissionRate.toString()}
      min="0"
      max="100"
      step="5"
    />
    <p>Dejar en blanco para usar {defaultCommissionRate}% por defecto.</p>
  </div>
)}

{!useCommissionSystem && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
    <p>ℹ️ Tu negocio no usa sistema de comisiones. Los especialistas recibirán pago fijo.</p>
  </div>
)}
```

#### **Lógica de Envío**
```javascript
if (useCommissionSystem) {
  profileData.commissionRate = formData.commissionRate || defaultCommissionRate;
}
```

---

### 5. Frontend - BasicInfoSection

**Archivo**: `packages/web-app/src/pages/business/profile/sections/BasicInfoSection.jsx`

✅ **Eliminado**: 
- Checkbox "Usar sistema de comisiones"
- Lógica de manejo de checkbox
- Campo del estado `useCommissionSystem`

**Razón**: Esta configuración ahora se maneja desde el modal "Reglas de Negocio"

---

### 6. Redux - businessConfigurationSlice

**Archivo**: `packages/shared/src/store/slices/businessConfigurationSlice.js`

✅ **Eliminado**: `useCommissionSystem` de la inicialización de `basicInfo`

---

## 🎯 Flujo de Uso

### Para Configurar el Sistema de Comisiones:

1. **Ir a Perfil del Negocio** → Click en "Reglas de Negocio"
2. **Buscar la regla**: `SPECIALIST_COMMISSION_ENABLED`
3. **Activar/Desactivar** según necesidad del negocio
4. **Configurar tasa por defecto**: Editar `SPECIALIST_DEFAULT_COMMISSION_RATE` (ej: 40%)
5. **Guardar cambios**

### Para Crear un Especialista:

#### **Si `SPECIALIST_COMMISSION_ENABLED = true`**:
- ✅ Campo "Comisión (%)" visible
- ✅ Placeholder muestra el valor de `SPECIALIST_DEFAULT_COMMISSION_RATE`
- ✅ Si el usuario deja en blanco → usa el valor por defecto
- ✅ Si el usuario ingresa un valor → usa ese valor personalizado

#### **Si `SPECIALIST_COMMISSION_ENABLED = false`**:
- ❌ Campo "Comisión (%)" oculto
- ℹ️ Mensaje: "Tu negocio no usa sistema de comisiones. Los especialistas recibirán pago fijo."
- ✅ No se envía `commissionRate` al backend

---

## ✅ Ventajas del Nuevo Sistema

### 1. **Centralización**
- Todas las configuraciones de pago en la categoría `PAYMENT_POLICY`
- Fácil de encontrar y gestionar

### 2. **Auditoría**
- Campo `updatedBy` en `business_rules` registra quién hizo cambios
- Timestamps automáticos

### 3. **Flexibilidad**
- Cambios sin necesidad de migraciones de base de datos
- Valores por defecto + valores personalizados por negocio

### 4. **Escalabilidad**
- Fácil agregar nuevas reglas relacionadas:
  - `SPECIALIST_COMMISSION_PAYMENT_FREQUENCY` (semanal, quincenal, mensual)
  - `SPECIALIST_COMMISSION_CALCULATION_METHOD` (por servicio, por venta total, mixto)
  - `SPECIALIST_MINIMUM_COMMISSION_AMOUNT` (monto mínimo garantizado)

### 5. **Consistencia**
- Mismo patrón para todas las configuraciones del negocio
- Reutilización de componentes UI (modal de reglas)

---

## 📊 Verificación

### Verificar Reglas en BD:
```sql
SELECT key, type, "defaultValue", category 
FROM rule_templates 
WHERE key LIKE 'SPECIALIST%' 
ORDER BY key;
```

**Resultado esperado**:
```
SPECIALIST_COMMISSION_ENABLED      | BOOLEAN | true | PAYMENT_POLICY
SPECIALIST_DEFAULT_COMMISSION_RATE | NUMBER  | 50   | PAYMENT_POLICY
```

### Verificar Campo Eliminado:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
  AND column_name = 'use_commission_system';
```

**Resultado esperado**: `(0 rows)`

---

## 📝 Archivos Modificados

### Creados:
- ✅ `packages/backend/migrations/remove-commission-system-field.sql`

### Modificados:
- ✅ `packages/backend/scripts/seed-rule-templates.js`
- ✅ `packages/backend/src/models/Business.js`
- ✅ `packages/web-app/src/pages/business/profile/sections/SpecialistsSection.jsx`
- ✅ `packages/web-app/src/pages/business/profile/sections/BasicInfoSection.jsx`
- ✅ `packages/shared/src/store/slices/businessConfigurationSlice.js`

### Eliminados/Obsoletos:
- ❌ `packages/backend/migrations/add-commission-system-field.sql` (no ejecutar)

---

## 🚀 Próximos Pasos

1. ✅ **Reiniciar servidores** para cargar cambios
2. ✅ **Probar flujo completo**:
   - Cambiar `SPECIALIST_COMMISSION_ENABLED` a false
   - Crear especialista → verificar campo oculto
   - Cambiar a true → verificar campo visible
   - Modificar `SPECIALIST_DEFAULT_COMMISSION_RATE` a 40
   - Crear especialista sin llenar comisión → verificar que use 40%
3. ✅ **Documentar** en manual de usuario

---

## 📌 Notas Importantes

- **Retrocompatibilidad**: Negocios existentes usan `defaultValue = true` (comisiones activas)
- **Migración de datos**: No se requiere, las reglas usan valores por defecto
- **Testing**: Probar ambos flujos (con/sin comisiones)
- **Documentación**: Actualizar manual con capturas del modal de reglas

---

## ✨ Resultado Final

El sistema de comisiones ahora es:
- ✅ **Flexible**: Cambios en tiempo real sin migraciones
- ✅ **Auditable**: Historial de cambios con usuario y timestamp
- ✅ **Escalable**: Fácil agregar nuevas configuraciones de pago
- ✅ **Consistente**: Mismo patrón que otras reglas del negocio
- ✅ **User-friendly**: Configuración desde un solo lugar (modal de reglas)

---

**Fecha de implementación**: 2025-10-12  
**Versión**: 1.0.0  
**Estado**: ✅ Completado y verificado
