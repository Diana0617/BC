# 🔐 Permisos vs 📋 Reglas de Negocio - Guía de Uso

**Fecha:** Octubre 19, 2025  
**Sistema:** Beauty Control  

---

## 🤔 ¿Cuál es la Diferencia?

### 🔐 PERMISOS (Sistema de Permisos)
**"¿QUIÉN puede hacer QUÉ?"**

Los **permisos** controlan **acceso a funcionalidades** basado en el **rol del usuario**.

**Ejemplos:**
- ✅ ¿Puede este especialista **ver todas las citas** o solo las suyas?
- ✅ ¿Puede esta recepcionista **crear nuevos clientes**?
- ✅ ¿Puede este usuario **editar servicios**?
- ✅ ¿Puede este especialista **cerrar citas cobrando**?
- ✅ ¿Puede este usuario **ver reportes financieros**?

**Características:**
- Se asignan **por usuario** en un negocio específico
- Tienen **defaults por rol** (BUSINESS, SPECIALIST, RECEPTIONIST, etc.)
- Se pueden **personalizar** para usuarios específicos
- Son de tipo **ON/OFF** (concedido o revocado)

---

### 📋 REGLAS DE NEGOCIO (Business Rules)
**"¿CÓMO funciona el negocio?"**

Las **reglas de negocio** controlan **políticas y configuraciones** que aplican a **TODO EL NEGOCIO**.

**Ejemplos:**
- ✅ ¿Con cuántas horas de anticipación se puede cancelar sin penalización? → `24 horas`
- ✅ ¿Cuántas citas máximas puede hacer un cliente al día? → `10 citas`
- ✅ ¿Qué porcentaje de comisión llevan los especialistas? → `50%`
- ✅ ¿Requiere fotos antes/después para completar citas? → `true/false`
- ✅ ¿Cuántos días de validez tiene un voucher? → `30 días`

**Características:**
- Se configuran **por negocio** (aplican a todos)
- Pueden ser **números, booleanos, strings**
- Definen **límites, tiempos, porcentajes, políticas**
- Cada negocio puede tener **valores diferentes**

---

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Cerrar Cita con Pago

**❌ ANTES (confuso - todo era regla):**
```javascript
// Regla de negocio
CITAS_REQUIERE_COMPROBANTE_PAGO: true/false
```
**Problema:** No permitía diferenciar entre usuarios. O todos podían o nadie.

**✅ AHORA (separado):**

**PERMISO** (quién puede):
```javascript
// Usuario A: SPECIALIST
permissions: [
  'appointments.close_with_payment'  // ✅ CONCEDIDO
  'payments.create'                   // ✅ CONCEDIDO
]

// Usuario B: SPECIALIST
permissions: [
  'appointments.close_with_payment'  // ❌ REVOCADO
  'payments.create'                   // ❌ REVOCADO
]
```

**REGLA** (validaciones):
```javascript
// Reglas del negocio (aplican a todos los que tienen permiso)
REQUIRE_FULL_PAYMENT: false         // Puede cerrar sin pago completo
REQUIRE_MINIMUM_PAYMENT: 50         // Pero al menos 50% pagado
```

**Resultado:**
- Usuario A puede cerrar citas cobrando (tiene permiso)
- Usuario B NO puede cerrar citas cobrando (permiso revocado)
- Ambos deben cumplir con el 50% mínimo de pago (regla del negocio)

---

### Ejemplo 2: Ver Reportes

**PERMISO** (quién puede ver):
```javascript
// BUSINESS: puede ver todos los reportes
'reports.view_all'

// SPECIALIST: solo sus propios reportes
'reports.view_own'

// RECEPTIONIST: ningún reporte
(sin permisos de reportes)
```

**REGLA** (configuración de reportes):
```javascript
// No existe - los reportes no tienen reglas de negocio
// Solo permisos controlan el acceso
```

---

### Ejemplo 3: Cancelación de Citas

**PERMISO** (quién puede cancelar):
```javascript
// RECEPTIONIST: puede cancelar cualquier cita
'appointments.cancel'

// SPECIALIST: solo puede cancelar sus propias citas
'appointments.cancel' + validación de "solo propias"
```

**REGLA** (políticas de cancelación):
```javascript
// Aplican a TODOS los que tienen permiso para cancelar
CITAS_HORAS_CANCELACION: 24                    // Mínimo 24h antes
CITAS_HORAS_VOUCHER_CANCELACION: 24            // Genera voucher si cancela 24h antes
CITAS_VOUCHER_VALIDEZ_DIAS: 30                 // Voucher válido 30 días
CITAS_VOUCHER_PORCENTAJE_VALOR: 100            // Voucher por 100% del valor
CITAS_MAX_CANCELACIONES_PERMITIDAS: 3         // Máximo 3 cancelaciones
CITAS_PERIODO_RESETEO_CANCELACIONES: 30       // Se resetea cada 30 días
CITAS_BLOQUEO_TEMPORAL_DIAS: 15                // 15 días de bloqueo si excede
```

---

## 📊 Tabla Comparativa

| Característica | 🔐 PERMISOS | 📋 REGLAS DE NEGOCIO |
|----------------|-------------|---------------------|
| **Propósito** | Control de acceso | Configuración de políticas |
| **Pregunta clave** | ¿Quién puede? | ¿Cómo funciona? |
| **Alcance** | Por usuario en un negocio | Todo el negocio |
| **Tipo de dato** | Boolean (ON/OFF) | Number, Boolean, String, JSON |
| **Personalización** | Por usuario | Por negocio |
| **Defaults** | Por rol | Por plantilla |
| **Ejemplo** | "appointments.create" | "CITAS_HORAS_CANCELACION: 24" |

---

## 🔍 ¿Cuándo Usar Cada Uno?

### Usa PERMISOS cuando:
- ✅ Necesitas controlar **acceso a funcionalidades**
- ✅ Quieres **diferenciar entre roles** (BUSINESS, SPECIALIST, etc.)
- ✅ Necesitas **personalizar por usuario** (ej: "este especialista SÍ puede cobrar, pero este otro NO")
- ✅ Es una pregunta de **"¿Puede hacer esto?"**

**Ejemplos:**
```javascript
'appointments.create'      // ¿Puede crear citas?
'payments.refund'          // ¿Puede hacer reembolsos?
'clients.delete'           // ¿Puede eliminar clientes?
'team.manage'              // ¿Puede gestionar el equipo?
```

---

### Usa REGLAS DE NEGOCIO cuando:
- ✅ Defines **límites numéricos** (horas, días, porcentajes)
- ✅ Configuras **políticas del negocio** (ej: "máximo 3 cancelaciones")
- ✅ Estableces **validaciones** (ej: "requiere foto antes/después")
- ✅ Son configuraciones que **aplican a todos** en el negocio
- ✅ Es una pregunta de **"¿Cuánto/Cómo/Cuándo?"**

**Ejemplos:**
```javascript
CITAS_HORAS_CANCELACION: 24           // ¿Cuántas horas antes?
CITAS_MAX_CANCELACIONES_PERMITIDAS: 3 // ¿Cuántas cancelaciones?
REQUIRE_MINIMUM_PAYMENT: 50            // ¿Qué porcentaje mínimo?
COMISIONES_PORCENTAJE_GENERAL: 50     // ¿Qué % de comisión?
```

---

## 🚀 Flujo de Validación Completo

```javascript
// 1️⃣ VERIFICAR PERMISO (¿Tiene acceso?)
if (!hasPermission(user, 'appointments.close_with_payment')) {
  return { error: 'No tienes permiso para cerrar citas cobrando' };
}

// 2️⃣ APLICAR REGLAS DE NEGOCIO (¿Cumple con políticas?)
const rules = await getBusinessRules(businessId);

if (rules.REQUIRE_FULL_PAYMENT && payment < appointmentTotal) {
  return { error: 'Se requiere pago completo' };
}

if (rules.REQUIRE_MINIMUM_PAYMENT) {
  const minPayment = (appointmentTotal * rules.REQUIRE_MINIMUM_PAYMENT) / 100;
  if (payment < minPayment) {
    return { 
      error: `Se requiere al menos ${rules.REQUIRE_MINIMUM_PAYMENT}% de pago` 
    };
  }
}

// 3️⃣ PROCEDER CON LA ACCIÓN
await closeAppointment(appointmentId, payment);
```

---

## 🔄 Migración: De Reglas a Permisos

### Regla Eliminada
```javascript
// ❌ ELIMINADA (ahora es permiso)
{
  key: 'CITAS_REQUIERE_COMPROBANTE_PAGO',
  type: 'BOOLEAN',
  defaultValue: false,
  description: 'Requiere que el especialista suba comprobante de pago'
}
```

### Nuevo Sistema de Permisos
```javascript
// ✅ NUEVO (más granular)
{
  key: 'appointments.close_with_payment',
  name: 'Cerrar cita cobrando',
  description: 'Permite cerrar citas recibiendo pagos',
  category: 'appointments'
}

{
  key: 'appointments.close_without_payment',
  name: 'Cerrar cita sin cobro',
  description: 'Permite cerrar citas sin registrar pago',
  category: 'appointments'
}

{
  key: 'payments.create',
  name: 'Registrar pagos',
  description: 'Permite crear y registrar pagos',
  category: 'payments'
}
```

**Ventajas:**
- Más granular (3 permisos vs 1 regla)
- Personalizable por usuario
- Defaults por rol
- Combinable (puede tener unos sí y otros no)

---

## 📋 Lista de Permisos del Sistema

### 📅 Appointments (9 permisos)
```
appointments.view_own               // Ver mis citas
appointments.view_all               // Ver todas las citas
appointments.create                 // Crear citas
appointments.edit                   // Editar citas
appointments.cancel                 // Cancelar citas
appointments.complete               // Completar citas
appointments.close_with_payment     // Cerrar cobrando
appointments.close_without_payment  // Cerrar sin cobro
appointments.view_history           // Ver historial
```

### 💰 Payments (4 permisos)
```
payments.view                       // Ver pagos
payments.create                     // Registrar pagos
payments.refund                     // Hacer reembolsos
payments.view_reports               // Ver reportes financieros
```

### 👥 Clients (6 permisos)
```
clients.view                        // Ver clientes
clients.create                      // Crear clientes
clients.edit                        // Editar clientes
clients.view_history                // Ver historial
clients.view_personal_data          // Ver datos sensibles
clients.delete                      // Eliminar clientes
```

### 💵 Commissions (4 permisos)
```
commissions.view_own                // Ver mis comisiones
commissions.view_all                // Ver todas las comisiones
commissions.approve                 // Aprobar comisiones
commissions.edit_config             // Configurar comisiones
```

### 📦 Inventory (4 permisos)
```
inventory.view                      // Ver inventario
inventory.sell                      // Vender productos
inventory.manage                    // Gestionar inventario
inventory.view_movements            // Ver movimientos
```

### 📊 Reports (3 permisos)
```
reports.view_own                    // Ver mis reportes
reports.view_all                    // Ver todos los reportes
reports.export                      // Exportar reportes
```

### 💅 Services (4 permisos)
```
services.view                       // Ver servicios
services.create                     // Crear servicios
services.edit                       // Editar servicios
services.delete                     // Eliminar servicios
```

### 👨‍💼 Team (3 permisos)
```
team.view                           // Ver equipo
team.manage                         // Gestionar equipo
team.assign_permissions             // Asignar permisos
```

### ⚙️ Config (3 permisos)
```
config.view                         // Ver configuración
config.edit                         // Editar configuración
config.business_rules               // Gestionar reglas de negocio
```

---

## 💡 Buenas Prácticas

### ✅ DO (Haz esto)
1. **Usa permisos para control de acceso**
   ```javascript
   if (!hasPermission(user, 'clients.delete')) {
     return res.status(403).json({ error: 'Sin permiso' });
   }
   ```

2. **Usa reglas para configuración de negocio**
   ```javascript
   const maxCancellations = await getBusinessRule(
     businessId, 
     'CITAS_MAX_CANCELACIONES_PERMITIDAS'
   );
   ```

3. **Combina ambos cuando sea necesario**
   ```javascript
   // Primero: verificar permiso
   checkPermission('appointments.cancel');
   
   // Segundo: aplicar reglas
   checkCancellationPolicy(appointment, rules);
   ```

### ❌ DON'T (No hagas esto)
1. ❌ **No uses reglas para controlar acceso**
   ```javascript
   // MAL
   SPECIALIST_PUEDE_VER_TODOS_LOS_REPORTES: false
   
   // BIEN (usa permiso)
   hasPermission(user, 'reports.view_all')
   ```

2. ❌ **No uses permisos para configuración numérica**
   ```javascript
   // MAL
   hasPermission(user, 'appointments.cancel_24_hours_before')
   
   // BIEN (usa regla)
   CITAS_HORAS_CANCELACION: 24
   ```

3. ❌ **No mezcles conceptos**
   ```javascript
   // MAL - permiso con configuración
   'appointments.cancel_with_24h_notice'
   
   // BIEN - separado
   Permiso: 'appointments.cancel'
   Regla: 'CITAS_HORAS_CANCELACION: 24'
   ```

---

## 🎯 Resumen

| ¿Qué necesitas hacer? | Usa |
|----------------------|-----|
| Controlar quién puede acceder | 🔐 **PERMISOS** |
| Definir límites de tiempo/cantidad | 📋 **REGLAS** |
| Configurar porcentajes/montos | 📋 **REGLAS** |
| Diferenciar entre roles | 🔐 **PERMISOS** |
| Personalizar por usuario | 🔐 **PERMISOS** |
| Aplicar política a todo el negocio | 📋 **REGLAS** |
| Pregunta "¿Puede hacer X?" | 🔐 **PERMISOS** |
| Pregunta "¿Cuánto/Cómo/Cuándo?" | 📋 **REGLAS** |

---

**Actualizado:** Octubre 19, 2025  
**Sistema:** Beauty Control  
**Status:** 📖 Guía de referencia
