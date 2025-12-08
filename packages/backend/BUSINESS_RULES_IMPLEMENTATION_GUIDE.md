# 📋 Guía: Cómo Implementar Nuevas Reglas de Negocio

## 🎯 Ejemplos Implementados

### ✅ **Reglas Completamente Implementadas**

1. **APPOINTMENT_CLOSURE_POLICY** - ¿Pueden especialistas cerrar turnos sin comprobante?
2. **COMMISSION_SIGNATURE_POLICY** - ¿Se requiere firma para cargar comisiones?
3. **CLIENT_PRIVACY_POLICY** - ¿Qué datos personales pueden ver las especialistas?
4. **TRANSFER_PROOF_POLICY** - ¿Se requiere comprobante de transferencia para agendar?
5. **EXPENSE_RECEIPT_POLICY** - ¿Se pueden crear gastos sin comprobante?

## 📊 **Análisis de Reglas de Negocio**

### 🟢 **PERFECTAS para Sistema de Reglas** (Solo Configuración)

| Regla | Descripción | Implementación |
|-------|-------------|----------------|
| **Comisiones sin firma** | ¿Requiere firma para cargar comisiones? | ✅ COMMISSION_SIGNATURE_POLICY |
| **Comisiones opcionales** | ¿El negocio maneja comisiones? | 🔄 SPECIALIST_COMMISSION_POLICY |
| **Gastos sin comprobante** | ¿Permitir gastos sin recibo? | ✅ EXPENSE_RECEIPT_POLICY |
| **Visibilidad comisiones** | ¿Recepcionista ve todas las comisiones? | 🔄 COMMISSION_VISIBILITY_POLICY |
| **Historial de clientes** | ¿Especialistas ven historial completo? | 🔄 CLIENT_HISTORY_ACCESS_POLICY |
| **Datos personales** | ¿Especialistas ven datos personales? | ✅ CLIENT_PRIVACY_POLICY |
| **Comprobante transferencia** | ¿Requiere comprobante para agendar? | ✅ TRANSFER_PROOF_POLICY |

### 🟡 **HÍBRIDAS** (Reglas + Configuración de Sistema)

| Regla | Por qué es Híbrida | Solución |
|-------|-------------------|----------|
| **Consentimientos por especialidad** | Necesita configurar qué especialidades | Regla + Config de Especialidades |
| **Múltiples citas** | Lógica de validación compleja | Regla + Validadores Personalizados |
| **Restricción citas duplicadas** | Validación temporal y de servicios | Regla + Sistema de Restricciones |
| **Venta de inventario** | Permisos específicos por especialista | Regla + Sistema de Permisos |

### 🔴 **REQUIEREN DESARROLLO** (Nuevas Funcionalidades)

| Regla | Requerimiento | Prioridad |
|-------|---------------|-----------|
| **Documentos especialistas** | Sistema de roles híbridos | Media |
| **Categorías de gastos** | CRUD de categorías | Alta |
| **Métodos de pago** | Sistema de configuración pagos | Alta |
| **Rol Specialist/Receptionist** | Roles compuestos | Baja |
| **Workflow de cobranza** | Sistema de cobranza | Media |

## 🔧 Estructura de una Nueva Regla

### 1. **Definir la Regla**

```json
{
  "key": "APPOINTMENT_CLOSURE_POLICY",
  "name": "Política de Cierre de Turnos", 
  "description": "Define si las especialistas pueden cerrar turnos sin subir comprobante de pago",
  "category": "SERVICE_POLICY",
  "allowCustomization": true,
  "defaultValue": {
    "allow_closure_without_payment_proof": false,
    "require_specialist_notes": true,
    "require_supervisor_approval": true,
    "max_amount_without_proof": 50000,
    "notification_settings": {
      "notify_admin": true,
      "notify_business_owner": true
    }
  }
}
```

### 2. **Categorías Disponibles**

Las categorías están definidas en `/src/models/RuleTemplate.js`:

- `PAYMENT_POLICY` - Políticas de pago y cobros
- `CANCELLATION_POLICY` - Políticas de cancelación
- `BOOKING_POLICY` - Políticas de reservas
- `WORKING_HOURS` - Horarios de trabajo
- `NOTIFICATION_POLICY` - Políticas de notificaciones
- `REFUND_POLICY` - Políticas de reembolsos
- `SERVICE_POLICY` - **Políticas de servicios** ← Usamos esta
- `GENERAL` - Reglas generales

## 🚀 Pasos para Implementar

### **Paso 1: OWNER Crea el Template**

```http
POST /api/rule-templates/owner/templates
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "key": "APPOINTMENT_CLOSURE_POLICY",
  "name": "Política de Cierre de Turnos",
  "description": "Define si las especialistas pueden cerrar turnos sin subir comprobante de pago",
  "defaultValue": {
    "allow_closure_without_payment_proof": false,
    "require_specialist_notes": true,
    "require_supervisor_approval": true,
    "max_amount_without_proof": 50000,
    "notification_settings": {
      "notify_admin": true,
      "notify_business_owner": true
    }
  },
  "category": "SERVICE_POLICY",
  "allowCustomization": true
}
```

### **Paso 2: BUSINESS Adopta la Regla**

```http
POST /api/business/rules/setup
Authorization: Bearer {BUSINESS_TOKEN}
X-Subdomain: {BUSINESS_SUBDOMAIN}
Content-Type: application/json

{
  "templateKeys": ["APPOINTMENT_CLOSURE_POLICY"],
  "autoActivate": true
}
```

### **Paso 3: BUSINESS Personaliza (Opcional)**

```http
PUT /api/business/rules/APPOINTMENT_CLOSURE_POLICY  
Authorization: Bearer {BUSINESS_TOKEN}
X-Subdomain: {BUSINESS_SUBDOMAIN}
Content-Type: application/json

{
  "customValue": {
    "allow_closure_without_payment_proof": true,
    "require_specialist_notes": false,
    "require_supervisor_approval": false,
    "max_amount_without_proof": 100000,
    "notification_settings": {
      "notify_admin": false,
      "notify_business_owner": true
    },
    "custom_business_notes": "Confiamos en nuestras especialistas experimentadas"
  },
  "isActive": true
}
```

### **Paso 4: Consultar Valores Efectivos**

```http
GET /api/rule-templates/business/templates/effective?category=SERVICE_POLICY
Authorization: Bearer {BUSINESS_TOKEN}
X-Subdomain: {BUSINESS_SUBDOMAIN}
```

## 📊 Casos de Uso de la Nueva Regla

### **Escenario A: Salón Conservador**
- ❌ `allow_closure_without_payment_proof: false`
- ✅ `require_supervisor_approval: true`
- 💰 `max_amount_without_proof: 0`

### **Escenario B: Salón con Confianza**
- ✅ `allow_closure_without_payment_proof: true`
- ❌ `require_supervisor_approval: false`
- 💰 `max_amount_without_proof: 100000`

### **Escenario C: Híbrido**
- ✅ `allow_closure_without_payment_proof: true`
- ✅ `require_specialist_notes: true`
- 💰 `max_amount_without_proof: 50000`

## 🔄 Flujo de Implementación en Frontend

```javascript
// 1. Consultar regla efectiva
const closurePolicy = await getRuleByKey('APPOINTMENT_CLOSURE_POLICY');

// 2. Validar en cierre de turno
if (!closurePolicy.allow_closure_without_payment_proof) {
  // Requerir comprobante
  showPaymentProofUpload();
}

if (closurePolicy.require_specialist_notes) {
  // Requerir notas
  showNotesField();
}

if (closurePolicy.require_supervisor_approval) {
  // Requerir aprobación
  notifySupervisor();
}
```

## 🎯 Patrones de Naming

### **Keys de Reglas**
- Usar UPPER_SNAKE_CASE
- Incluir categoría: `{CATEGORY}_{PURPOSE}`
- Ejemplos:
  - `PAYMENT_POLICY_ADVANCE`
  - `SERVICE_POLICY_CLOSURE`
  - `BOOKING_POLICY_CANCELLATION`

### **Campos de defaultValue**
- Usar snake_case
- Ser descriptivos
- Agrupar configuraciones relacionadas:

```json
{
  "main_setting": true,
  "threshold_amount": 50000,
  "notification_settings": {
    "notify_admin": true,
    "notify_owner": false
  },
  "approval_settings": {
    "require_approval": true,
    "approval_levels": ["supervisor", "manager"]
  }
}
```

## 📝 Checklist para Nueva Regla

- [ ] ✅ Definir `key` única y descriptiva
- [ ] ✅ Elegir `category` apropiada
- [ ] ✅ Diseñar `defaultValue` con estructura lógica
- [ ] ✅ Permitir `allowCustomization: true` (recomendado)
- [ ] ✅ Probar creación como OWNER
- [ ] ✅ Probar adopción como BUSINESS
- [ ] ✅ Probar personalización
- [ ] ✅ Verificar valores efectivos
- [ ] ✅ Implementar validación en frontend
- [ ] ✅ Documentar casos de uso

## 🔍 Debugging y Monitoreo

### **Ver todas las reglas de un negocio:**
```http
GET /api/business/rules
```

### **Ver templates disponibles:**
```http
GET /api/rule-templates/business/templates/available
```

### **Ver estadísticas (OWNER):**
```http
GET /api/rule-templates/owner/templates/stats
```

¡Con este patrón puedes agregar cualquier regla de negocio que necesites!

## 🎯 **Ejemplos Específicos Implementados**

### **1. Política de Comisiones sin Firma**
```json
{
  "key": "COMMISSION_SIGNATURE_POLICY",
  "name": "Política de Firma para Comisiones",
  "category": "SERVICE_POLICY",
  "defaultValue": {
    "require_signature_for_commissions": true,
    "signature_threshold_amount": 0,
    "allow_digital_signature": false,
    "require_specialist_approval": true
  }
}
```

**Casos de uso:**
- **Salón estricto**: Requiere firma siempre
- **Salón flexible**: Solo para montos altos
- **Salón digital**: Permite firma digital

### **2. Política de Privacidad de Clientes**
```json
{
  "key": "CLIENT_PRIVACY_POLICY", 
  "name": "Política de Privacidad de Clientes",
  "category": "SERVICE_POLICY",
  "defaultValue": {
    "specialist_can_see_personal_data": true,
    "hide_contact_info": false,
    "hide_payment_history": true,
    "hide_medical_history": false
  }
}
```

**Personalización ejemplo:**
```json
{
  "specialist_can_see_personal_data": true,
  "hide_contact_info": false,    // ✅ Ver teléfonos/emails
  "hide_payment_history": false, // ✅ Ver historial pagos  
  "hide_medical_history": false, // ✅ Ver historial médico
  "custom_notes": "Equipo de confianza, acceso completo"
}
```

### **3. Política de Gastos sin Comprobante**
```json
{
  "key": "EXPENSE_RECEIPT_POLICY",
  "name": "Política de Gastos sin Comprobante", 
  "category": "GENERAL",
  "defaultValue": {
    "allow_expenses_without_receipt": false,
    "max_amount_without_receipt": 10000,
    "require_justification": true,
    "require_approval": true
  }
}
```

**Escenarios:**
- **Negocio estricto**: No gastos sin comprobante
- **Negocio flexible**: Hasta $25,000 sin comprobante
- **Negocio de confianza**: Sin límites, solo justificación

## 🚀 **Próximas Reglas a Implementar**

### **Fáciles de Implementar (Solo configuración)**
1. `SPECIALIST_COMMISSION_POLICY` - ¿El negocio maneja comisiones?
2. `COMMISSION_VISIBILITY_POLICY` - ¿Quién puede ver comisiones?
3. `CLIENT_HISTORY_ACCESS_POLICY` - Nivel de acceso al historial
4. `MULTI_BOOKING_POLICY` - ¿Múltiples citas simultáneas?
5. `INVENTORY_SALES_POLICY` - ¿Quién puede vender productos?

### **Requieren Desarrollo Adicional**
1. **Sistema de Categorías de Gastos** - CRUD personalizable
2. **Configuración de Métodos de Pago** - Payment gateway config
3. **Roles Híbridos** - Specialist/Receptionist
4. **Sistema de Consentimientos** - Por especialidad/servicio

## 💡 **Recomendación de Implementación**

1. **Fase 1**: Implementar todas las reglas 🟢 (pura configuración)
2. **Fase 2**: Implementar reglas 🟡 (híbridas)  
3. **Fase 3**: Desarrollar funcionalidades 🔴 (nuevas features)

Esto te dará un sistema robusto de configuración que cubre el 80% de los casos de uso.