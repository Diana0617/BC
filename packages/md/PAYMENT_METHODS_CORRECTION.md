# ✅ Corrección: Métodos de Pago en Web-App

## 🔄 Cambio de Arquitectura

### ❌ Implementación Incorrecta (Mobile)
Inicialmente implementamos la configuración de métodos de pago en el **mobile app**, lo cual era incorrecto porque:

- ❌ El mobile es para **usuarios especialistas** (SPECIALIST role)
- ❌ Los especialistas NO deberían configurar métodos de pago del negocio
- ❌ La configuración administrativa debe estar en la **web-app**

### ✅ Implementación Correcta (Web-App)
La configuración de métodos de pago ahora está en la **web-app** porque:

- ✅ La web-app es para **administradores del negocio** (BUSINESS/OWNER role)
- ✅ Solo los owners/admins deben configurar métodos de pago
- ✅ Centraliza toda la configuración administrativa

---

## 📱 Responsabilidades por Plataforma

### Web-App (Administración)
**Usuarios:** BUSINESS, OWNER  
**Funciones:**
- ✅ Configurar métodos de pago (Yape, Plin, Transferencias, etc.)
- ✅ Editar información bancaria
- ✅ Activar/desactivar métodos
- ✅ Definir si requieren comprobante
- ✅ Establecer orden de prioridad

**Ubicación:** `/business/profile` → Sección "Métodos de Pago"

### Mobile App (Operación)
**Usuarios:** SPECIALIST  
**Funciones:**
- ✅ **Ver** métodos de pago configurados
- ✅ **Seleccionar** método al registrar un pago
- ✅ **Subir** comprobante de pago (si el método lo requiere)
- ✅ **Consultar** pagos registrados en citas
- ❌ **NO** pueden crear/editar métodos de pago

**Ubicación:** Modal de registro de pago en citas

---

## 🏗️ Nueva Implementación Web-App

### 1. Componente Principal
**Archivo:** `packages/web-app/src/pages/business/profile/sections/PaymentMethodsSection.jsx`

```jsx
// Características principales:
- CRUD completo de métodos de pago
- Validación de formularios
- Campos condicionales por tipo (Transferencia/QR)
- Activar/desactivar métodos
- Eliminación con confirmación
- Integración con API backend
```

### 2. Integración en BusinessProfile
**Archivo:** `packages/web-app/src/pages/business/profile/BusinessProfile.jsx`

```javascript
// Agregado a modulesSections:
{
  id: 'payment-methods',
  name: 'Métodos de Pago',
  icon: CreditCardIcon,
  component: PaymentMethodsSection,
  alwaysVisible: true, // Disponible para todos los planes
  setupStep: 'payment-methods-config'
}
```

### 3. Navegación
```
Web App Login (BUSINESS) → 
Business Profile → 
Sidebar → 
"Métodos de Pago" → 
CRUD de métodos
```

---

## 🎨 UI/UX Web-App

### Layout Principal
```
┌────────────────────────────────────────────────┐
│  💳 Métodos de Pago                      [+]   │
│  Configura los métodos de pago que aceptarás  │
├────────────────────────────────────────────────┤
│                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
│  │ 💰 Efectivo │  │ 📱 Yape     │  │ 💳 Visa││
│  │ CASH        │  │ QR          │  │ CARD   ││
│  │ [Editar]    │  │ +51987...   │  │ [Edit] ││
│  │ [Eliminar]  │  │ ✓ Comprobante│ │ [Del]  ││
│  └─────────────┘  └─────────────┘  └─────────┘│
│                                                │
└────────────────────────────────────────────────┘
```

### Modal de Creación/Edición
```
┌──────────────────────────────────────┐
│  Nuevo Método de Pago           [X]  │
├──────────────────────────────────────┤
│                                      │
│  Nombre: [Yape                    ]  │
│  Tipo:   [Código QR ▼]               │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 📱 Información de Pago QR      │  │
│  │                                │  │
│  │  Teléfono: [+51987654321]     │  │
│  │  Titular:  [Beauty Salon SAC] │  │
│  └────────────────────────────────┘  │
│                                      │
│  ☑ Requiere comprobante              │
│                                      │
│  Descripción:                        │
│  [Pago mediante código QR de Yape]   │
│                                      │
├──────────────────────────────────────┤
│            [Cancelar]  [Crear]       │
└──────────────────────────────────────┘
```

---

## 🔧 Características Implementadas

### Gestión de Métodos
- ✅ **Crear** nuevo método de pago
- ✅ **Editar** método existente
- ✅ **Eliminar** método (soft delete o hard delete)
- ✅ **Activar/Desactivar** método
- ✅ **Visualizar** todos los métodos configurados

### Tipos de Pago Soportados
```javascript
CASH        → Efectivo (sin campos bancarios)
CARD        → Tarjeta (sin campos bancarios)
TRANSFER    → Transferencia (banco, cuenta, CCI, titular)
QR          → Código QR (teléfono, titular)
ONLINE      → Pago en línea (sin campos)
OTHER       → Otro (sin campos)
```

### Validaciones
```javascript
// Campos requeridos
- name (siempre)
- type (siempre)

// Campos condicionales
- accountNumber (requerido si type === 'TRANSFER')
- phoneNumber (requerido si type === 'QR')

// Opcional
- bankName, accountType, cci, holderName
- description
- requiresProof
```

### Visual Feedback
- ✅ Colores por tipo de pago
- ✅ Gradientes en cards
- ✅ Iconos descriptivos
- ✅ Estado activo/inactivo visual
- ✅ Badges de información
- ✅ Toasts de confirmación

---

## 🔌 API Backend (Sin Cambios)

El backend **NO requiere modificaciones** porque ya estaba bien diseñado:

### Endpoints (ya existentes)
```
GET    /api/business/:businessId/payment-methods
POST   /api/business/:businessId/payment-methods
PUT    /api/business/:businessId/payment-methods/:methodId
DELETE /api/business/:businessId/payment-methods/:methodId
POST   /api/business/:businessId/payment-methods/reorder
```

### Base de Datos (ya existente)
- Tabla: `business_payment_config`
- Campo: `paymentMethods` (JSONB array)
- Estructura ya definida correctamente

---

## 📱 Cambios Pendientes en Mobile

### Eliminar Componentes de Configuración
```bash
# Archivos a eliminar del mobile:
packages/business-control-mobile/src/hooks/usePaymentMethods.js
packages/business-control-mobile/src/components/payments/PaymentMethodCard.js
packages/business-control-mobile/src/components/payments/PaymentMethodFormModal.js
packages/business-control-mobile/src/screens/settings/PaymentMethodsScreen.js
```

### Modificar SettingsScreen
```javascript
// Eliminar sección "Pagos y Facturación"
// Ya que los especialistas no configuran pagos
```

### Crear Componentes de Uso (NO configuración)
```javascript
// 1. PaymentMethodSelector.js
// Para seleccionar método al registrar un pago
// Solo lectura de métodos configurados en web

// 2. PaymentProofUpload.js
// Para subir comprobante según método seleccionado

// 3. PaymentHistoryList.js
// Para ver pagos registrados en una cita
```

---

## 🎯 Próximos Pasos

### Fase 1: Limpiar Mobile ✅
1. Eliminar componentes de configuración
2. Eliminar rutas de settings/payment-methods
3. Actualizar documentación

### Fase 2: Crear Componentes de Uso en Mobile
1. **PaymentMethodSelector** (dropdown para seleccionar)
2. **PaymentRegistrationModal** (registrar pago en cita)
3. **PaymentProofUpload** (subir foto de comprobante)
4. **PaymentHistoryItem** (mostrar pago en detalle de cita)

### Fase 3: Integrar en AppointmentDetailModal
1. Mostrar resumen de pagos (total, pagado, pendiente)
2. Botón "Registrar Pago"
3. Historial de pagos de la cita
4. Estado visual (PENDING/PARTIAL/PAID)

### Fase 4: Testing Completo
1. Configurar métodos en web-app
2. Ver métodos disponibles en mobile
3. Registrar pago en cita desde mobile
4. Subir comprobante
5. Verificar persistencia

---

## 📊 Comparación de Responsabilidades

| Funcionalidad | Web-App | Mobile |
|--------------|---------|--------|
| **Crear métodos** | ✅ BUSINESS | ❌ No |
| **Editar métodos** | ✅ BUSINESS | ❌ No |
| **Eliminar métodos** | ✅ BUSINESS | ❌ No |
| **Activar/Desactivar** | ✅ BUSINESS | ❌ No |
| **Ver métodos** | ✅ BUSINESS | ✅ SPECIALIST |
| **Seleccionar método** | ❌ No aplica | ✅ SPECIALIST |
| **Registrar pago** | ❌ No aplica | ✅ SPECIALIST |
| **Subir comprobante** | ❌ No aplica | ✅ SPECIALIST |
| **Ver historial** | ✅ BUSINESS | ✅ SPECIALIST |

---

## 🔐 Permisos y Roles

### BUSINESS/OWNER (Web-App)
```javascript
// Puede hacer TODO con métodos de pago
permissions: [
  'payment-methods:create',
  'payment-methods:read',
  'payment-methods:update',
  'payment-methods:delete',
  'payment-methods:toggle',
  'payments:view-all'
]
```

### SPECIALIST (Mobile)
```javascript
// Solo puede USAR métodos configurados
permissions: [
  'payment-methods:read',     // Ver métodos disponibles
  'payments:create',          // Registrar pagos
  'payments:upload-proof',    // Subir comprobantes
  'payments:view-own'         // Ver pagos que registró
]
```

---

## 📝 Notas Técnicas

### Sincronización
- Web-app configura → Backend actualiza → Mobile consulta
- No hay caché en mobile de métodos de pago
- Siempre consulta últimos métodos activos desde API

### Performance
- Web-app: Sin límite de métodos
- Mobile: Solo muestra métodos `isActive: true`
- API filtra automáticamente en GET

### Seguridad
- JWT con rol BUSINESS requerido para modificar
- JWT con rol SPECIALIST suficiente para leer
- Validación de businessId en backend

---

## ✅ Resumen

### Antes (Incorrecto)
```
Mobile App (SPECIALIST) → Configurar Métodos ❌
```

### Ahora (Correcto)
```
Web-App (BUSINESS) → Configurar Métodos ✅
Mobile App (SPECIALIST) → Usar Métodos Configurados ✅
```

### Beneficios
1. ✅ Separación clara de responsabilidades
2. ✅ Seguridad mejorada (specialists no configuran)
3. ✅ Experiencia de usuario correcta
4. ✅ Centralización administrativa
5. ✅ Mobile más simple y enfocado

---

**Próximo paso:** Limpiar mobile y crear componentes de uso (no configuración)
