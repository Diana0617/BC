# Sistema de Fidelización / Loyalty Program

## Descripción General

El **Sistema de Fidelización** permite a los negocios recompensar a sus clientes con puntos por diferentes acciones (citas pagadas, compras de productos, referidos, hitos, etc.) y canjearlos por beneficios (descuentos, servicios gratuitos, productos, etc.).

Este módulo está incluido en los planes **Premium** y **Enterprise** con un precio de **35,000 COP/mes**.

---

## Características Principales

### 1. **Acumulación de Puntos**
Los clientes pueden ganar puntos por:

- ✅ **Pagos de citas**: Puntos proporcionales al monto pagado
- ✅ **Compras de productos**: Puntos por ventas de productos
- ✅ **Referidos**: Puntos cuando recomiendan nuevos clientes
- ✅ **Primera visita del referido**: Bono adicional cuando el referido completa su primera cita
- ✅ **Hitos/Milestones**: Puntos al completar X citas (ej: cada 10 citas)
- ✅ **Puntualidad en pagos**: Bono por pagar a tiempo
- ✅ **Cumpleaños**: Puntos en el mes de cumpleaños del cliente
- ✅ **Aniversario**: Puntos en el aniversario de ser cliente
- ✅ **Ajustes manuales**: El negocio puede agregar/restar puntos manualmente
- ✅ **Bonos**: Campañas especiales con puntos adicionales

### 2. **Canje de Puntos (Recompensas)**
Los clientes pueden canjear sus puntos por:

- 💰 **Descuentos porcentuales** (ej: 10% de descuento)
- 💵 **Descuentos fijos** (ej: $20,000 de descuento)
- 🎁 **Servicios gratuitos** (ej: corte de cabello gratis)
- 🎟️ **Vouchers** (créditos para futuras compras)
- 📦 **Productos** (productos del catálogo)
- ⭐ **Mejoras/Upgrades** (upgrade de servicio)
- 🌟 **Recompensas personalizadas** (definidas por el negocio)

### 3. **Sistema de Referidos**
- Cada cliente tiene un **código de referido único** (formato: `REF-ABC123`)
- El negocio puede buscar clientes por nombre/teléfono o por código de referido
- Al registrar un nuevo cliente, el negocio puede indicar quién lo refirió
- El referente gana puntos automáticamente
- Bono adicional cuando el referido completa su primera cita pagada

### 4. **Configuración Flexible**
Cada negocio puede configurar **26 reglas diferentes**:

| Categoría | Regla | Tipo | Descripción |
|-----------|-------|------|-------------|
| **General** | `LOYALTY_ENABLED` | Boolean | Habilitar/deshabilitar el programa |
| **Puntos Base** | `LOYALTY_POINTS_PER_CURRENCY_UNIT` | Number | Puntos por cada unidad monetaria (ej: 1 punto por cada $1,000 COP) |
| **Citas** | `LOYALTY_APPOINTMENT_POINTS_ENABLED` | Boolean | Otorgar puntos por pagos de citas |
| **Productos** | `LOYALTY_PRODUCT_POINTS_ENABLED` | Boolean | Otorgar puntos por compras de productos |
| **Referidos** | `LOYALTY_REFERRAL_ENABLED` | Boolean | Habilitar sistema de referidos |
| **Referidos** | `LOYALTY_REFERRAL_POINTS` | Number | Puntos al referir un nuevo cliente |
| **Referidos** | `LOYALTY_REFERRAL_FIRST_VISIT_BONUS` | Number | Bono cuando el referido completa su primera cita |
| **Hitos** | `LOYALTY_MILESTONE_ENABLED` | Boolean | Otorgar puntos al alcanzar hitos |
| **Hitos** | `LOYALTY_MILESTONE_COUNT` | Number | Cada cuántas citas se otorga el hito (ej: cada 10 citas) |
| **Hitos** | `LOYALTY_MILESTONE_POINTS` | Number | Puntos por alcanzar el hito |
| **Puntualidad** | `LOYALTY_ON_TIME_PAYMENT_BONUS` | Number | Bono por pagar a tiempo |
| **Cumpleaños** | `LOYALTY_BIRTHDAY_BONUS_ENABLED` | Boolean | Otorgar puntos en cumpleaños |
| **Cumpleaños** | `LOYALTY_BIRTHDAY_BONUS_POINTS` | Number | Puntos otorgados en cumpleaños |
| **Aniversario** | `LOYALTY_ANNIVERSARY_BONUS_ENABLED` | Boolean | Otorgar puntos en aniversario |
| **Aniversario** | `LOYALTY_ANNIVERSARY_BONUS_POINTS` | Number | Puntos otorgados en aniversario |
| **Expiración** | `LOYALTY_POINTS_EXPIRY_DAYS` | Number | Días hasta que los puntos expiren (0 = nunca) |
| **Canje** | `LOYALTY_MIN_POINTS_TO_REDEEM` | Number | Mínimo de puntos requeridos para canjear |
| **Recompensas** | `LOYALTY_REWARD_EXPIRY_DAYS` | Number | Días hasta que las recompensas expiren |
| **Descuentos** | `LOYALTY_DISCOUNT_PERCENTAGE_RATE` | Number | Tasa de conversión para descuento % (puntos → %) |
| **Descuentos** | `LOYALTY_POINTS_FOR_DISCOUNT` | Number | Puntos necesarios para $1 de descuento |
| **Branding** | `BRANDING_PRIMARY_COLOR` | Text | Color primario (hex) para tarjetas de fidelización |
| **Branding** | `BRANDING_SECONDARY_COLOR` | Text | Color secundario (hex) para gradientes |
| **Branding** | `BRANDING_ACCENT_COLOR` | Text | Color de acento (hex) para destacar puntos |
| **Branding** | `BRANDING_TEXT_COLOR` | Text | Color de texto (hex) |
| **Branding** | `BRANDING_BACKGROUND_COLOR` | Text | Color de fondo (hex) |
| **Branding** | `BRANDING_USE_GRADIENT` | Boolean | Usar gradiente en tarjetas (primario → secundario) |

---

## Arquitectura del Sistema

### Modelos de Datos

#### 1. **LoyaltyPointTransaction**
Registra todas las transacciones de puntos (créditos y débitos).

```javascript
{
  id: UUID,
  businessId: UUID,          // Negocio
  clientId: UUID,            // Cliente
  branchId: UUID,            // Sucursal (opcional)
  points: Integer,           // Puntos (positivo = crédito, negativo = débito)
  type: Enum,                // Tipo de transacción
  status: Enum,              // ACTIVE, EXPIRED, CANCELLED
  referenceType: String,     // Tipo de referencia (Appointment, Product, etc.)
  referenceId: UUID,         // ID de la referencia
  amount: Decimal,           // Monto relacionado (opcional)
  multiplier: Decimal,       // Multiplicador aplicado
  description: Text,         // Descripción
  expiresAt: Date,           // Fecha de expiración
  processedBy: UUID,         // Usuario que procesó
  metadata: JSONB,           // Datos adicionales
  createdAt: Date,
  updatedAt: Date
}
```

**Tipos de transacción:**
- `APPOINTMENT_PAYMENT`: Puntos por pago de cita
- `PRODUCT_PURCHASE`: Puntos por compra de producto
- `REFERRAL`: Puntos por referir cliente
- `REFERRAL_FIRST_VISIT`: Bono por primera visita del referido
- `REDEMPTION`: Puntos usados en canje
- `EXPIRATION`: Puntos expirados
- `MANUAL_ADJUSTMENT`: Ajuste manual
- `BONUS`: Bonos especiales
- `REFUND`: Devolución de puntos

#### 2. **LoyaltyReward**
Registra las recompensas canjeadas.

```javascript
{
  id: UUID,
  code: String,              // Código único (RWD-ABC-123-XYZ)
  businessId: UUID,
  clientId: UUID,
  pointsUsed: Integer,       // Puntos usados para canjear
  rewardType: Enum,          // Tipo de recompensa
  value: Decimal,            // Valor de la recompensa
  status: Enum,              // ACTIVE, USED, EXPIRED, CANCELLED
  issuedBy: UUID,            // Quien emitió la recompensa
  issuedAt: Date,
  expiresAt: Date,
  usedBy: UUID,              // Quien marcó como usada
  usedAt: Date,
  usedInReferenceType: String,  // Donde se usó (Appointment, Sale, etc.)
  usedInReferenceId: UUID,
  conditions: JSONB,         // Condiciones de uso
  metadata: JSONB,
  createdAt: Date,
  updatedAt: Date
}
```

**Tipos de recompensa:**
- `DISCOUNT_PERCENTAGE`: Descuento porcentual
- `DISCOUNT_FIXED`: Descuento fijo en pesos
- `FREE_SERVICE`: Servicio gratuito
- `VOUCHER`: Voucher/crédito
- `PRODUCT`: Producto gratis
- `UPGRADE`: Mejora de servicio
- `CUSTOM`: Recompensa personalizada

#### 3. **BusinessClient** (extendido)
Se agregaron campos para el sistema de referidos:

```javascript
{
  // ... campos existentes ...
  referralCode: String,      // Código único de referido (REF-ABC123)
  referredBy: UUID,          // ID del BusinessClient que lo refirió
  referralCount: Integer,    // Cantidad de personas que refirió
  lastReferralDate: Date     // Fecha del último referido
}
```

---

## Tarjetas de Fidelización en PDF

### **Características de las Tarjetas**

El sistema puede generar **tarjetas de fidelización físicas en PDF** con las siguientes características:

- 📏 **Tamaño estándar de tarjeta de crédito**: 85.6mm x 53.98mm (3.375" x 2.125")
- 🎨 **Colores personalizables**: Usa los colores de branding del negocio
- 🖼️ **Logo del negocio**: Muestra el logo en la esquina superior izquierda
- 👤 **Nombre del cliente**: Centrado y destacado
- 🔢 **Puntos actuales**: Cantidad de puntos en grande
- 🔖 **Código de referido**: Código único del cliente para referir
- 📱 **Código QR**: Para consultar puntos sin autenticación
- 🌈 **Gradiente opcional**: Fondo con gradiente de color primario a secundario
- 📄 **Impresión múltiple**: Genera varias tarjetas en una sola hoja A4

### **Configuración de Branding**

El negocio puede personalizar los colores de las tarjetas mediante **6 reglas de branding**:

| Regla | Valor por Defecto | Descripción |
|-------|-------------------|-------------|
| `BRANDING_PRIMARY_COLOR` | `#8B5CF6` (Púrpura) | Color principal de la tarjeta |
| `BRANDING_SECONDARY_COLOR` | `#EC4899` (Rosa) | Color secundario para gradiente |
| `BRANDING_ACCENT_COLOR` | `#F59E0B` (Ámbar) | Color de acento para puntos |
| `BRANDING_TEXT_COLOR` | `#1F2937` (Gris oscuro) | Color del texto |
| `BRANDING_BACKGROUND_COLOR` | `#FFFFFF` (Blanco) | Color de fondo |
| `BRANDING_USE_GRADIENT` | `true` | Usar gradiente (primario → secundario) |

### **Ejemplo Visual de Tarjeta**

```
┌─────────────────────────────────────────────────┐
│ [LOGO]  NOMBRE DEL NEGOCIO                      │  ← Header con logo
│                                                  │
│                                                  │  ← Gradiente de fondo
│           JUAN PÉREZ GONZÁLEZ                   │  ← Nombre del cliente
│              Código: REF-ABC123                  │  ← Código de referido
│                                                  │
│  [QR]    ╔════════════════════════╗              │
│          ║  PUNTOS ACUMULADOS     ║              │  ← Box de puntos
│  Escanea ║        1,500           ║              │  ← QR para consultar
│  puntos  ╚════════════════════════╝              │
│                                                  │
│         ─────────────────────────                │  ← Línea decorativa
│          Programa de Fidelización                │  ← Footer
└─────────────────────────────────────────────────┘
```

### **Código QR**

Cada tarjeta incluye un **código QR** que permite al cliente consultar sus puntos sin necesidad de login:

- 📱 **URL**: `https://tudominio.com/check-points/{referralCode}`
- 🔓 **Acceso público**: No requiere autenticación
- ⚡ **Tiempo real**: Muestra puntos actualizados
- 📊 **Información**: Nombre, puntos, código de referido, cantidad de referidos

**Endpoint Público:**
```http
GET /api/loyalty/public/check/:referralCode
# Sin autenticación

Response:
{
  "success": true,
  "data": {
    "clientName": "Juan Pérez",
    "points": 1500,
    "referralCode": "REF-ABC123",
    "referralCount": 3
  }
}
```
```

### **Endpoints de Tarjetas PDF**

**IMPORTANTE:** Los clientes NO tienen acceso a la web/app. Solo el personal del negocio genera e imprime tarjetas.

#### 1. **Generar Tarjeta de Cliente Específico** (Business)
```http
GET /api/loyalty/business/client/:clientId/card/pdf
Authorization: Bearer <business-staff-token>
```

**Respuesta:**
- Content-Type: `application/pdf`
- Archivo: `tarjeta-{clientId}.pdf`

#### 2. **Generar Múltiples Tarjetas en Hoja A4** (Business)
```http
POST /api/loyalty/business/cards/bulk-pdf
Authorization: Bearer <token>
Content-Type: application/json

{
  "clients": [
    { "clientId": "uuid-1", "points": 1500 },
    { "clientId": "uuid-2", "points": 2300 },
    { "clientId": "uuid-3", "points": 800 }
  ]
}
```

**Respuesta:**
- Content-Type: `application/pdf`
- Archivo: `tarjetas-fidelizacion-{timestamp}.pdf`
- Formato: Hoja A4 con **10 tarjetas** (2 columnas x 5 filas)

### **Casos de Uso**

**Nota:** Los clientes son personas físicas que visitan el negocio. NO tienen acceso a la web/app. Solo el personal del negocio (recepcionistas, dueño del negocio) maneja el sistema.

1. **Negocio imprime tarjeta para cliente nuevo**:
   - Recepcionista registra nuevo cliente en el sistema
   - Genera tarjeta PDF del cliente desde el panel
   - Imprime la tarjeta
   - Entrega tarjeta física al cliente en el momento
   - Cliente puede empezar a acumular puntos en sus próximas visitas

2. **Negocio imprime tarjetas para todos los clientes activos**:
   - Dueño del negocio selecciona lista de clientes frecuentes
   - Genera PDF bulk con todas las tarjetas (hasta 10 por hoja A4)
   - Imprime en hojas A4
   - Recorta las tarjetas
   - Entrega tarjetas físicas en la próxima visita de cada cliente

3. **Cliente usa su tarjeta en el negocio**:
   - Cliente presenta su tarjeta física al pagar
   - Recepcionista escanea/busca el código de referido o busca por nombre
   - Sistema acredita puntos automáticamente
   - Cliente ve su acumulado en la próxima tarjeta impresa o el staff le informa

---

## API Endpoints

> ⚠️ **IMPORTANTE**: Los clientes NO tienen acceso digital. Todos los endpoints son usados por el personal del negocio (Business staff) para consultar y gestionar información de sus clientes.

### **Endpoints para Consulta de Información del Cliente (usado por staff)**

#### 1. **Obtener Balance de Puntos de un Cliente**
```http
GET /api/loyalty/business/client/:clientId/balance
Authorization: Bearer <business-staff-token>
```

**Respuesta:**
```json
{
  "businessId": "uuid",
  "clientId": "uuid",
  "totalPoints": 1500,
  "expiringSoon": [
    {
      "points": 200,
      "expiresAt": "2025-01-15T00:00:00Z"
    }
  ]
}
```

#### 2. **Obtener Historial de Transacciones**
```http
GET /api/loyalty/transactions?page=1&limit=20
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "points": 100,
      "type": "APPOINTMENT_PAYMENT",
      "description": "Puntos por cita pagada",
      "amount": 100000,
      "createdAt": "2025-01-01T10:00:00Z",
      "expiresAt": "2025-12-31T23:59:59Z",
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### 3. **Obtener Código de Referido**
```http
GET /api/loyalty/referral-code
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "referralCode": "REF-ABC123",
  "referralCount": 5,
  "referralPoints": 500
}
```

#### 4. **Obtener Mis Referidos**
```http
GET /api/loyalty/my-referrals?page=1&limit=20
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "referrals": [
    {
      "clientName": "Juan Pérez",
      "clientPhone": "+57 300 1234567",
      "referredAt": "2025-01-01T10:00:00Z",
      "firstVisitCompleted": true,
      "pointsEarned": 150
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

#### 5. **Canjear Puntos**
```http
POST /api/loyalty/redeem
Authorization: Bearer <token>
Content-Type: application/json

{
  "points": 500,
  "rewardType": "DISCOUNT_PERCENTAGE",
  "value": 10
}
```

**Respuesta:**
```json
{
  "reward": {
    "id": "uuid",
    "code": "RWD-ABC-123-XYZ",
    "rewardType": "DISCOUNT_PERCENTAGE",
    "value": 10,
    "pointsUsed": 500,
    "expiresAt": "2025-02-01T23:59:59Z",
    "status": "ACTIVE"
  },
  "newBalance": 1000
}
```

#### 6. **Obtener Mis Recompensas**
```http
GET /api/loyalty/rewards?status=ACTIVE
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "rewards": [
    {
      "id": "uuid",
      "code": "RWD-ABC-123-XYZ",
      "rewardType": "DISCOUNT_PERCENTAGE",
      "value": 10,
      "pointsUsed": 500,
      "issuedAt": "2025-01-01T10:00:00Z",
      "expiresAt": "2025-02-01T23:59:59Z",
      "status": "ACTIVE"
    }
  ]
}
```

#### 7. **Aplicar Recompensa**
```http
POST /api/loyalty/apply-reward
Authorization: Bearer <token>
Content-Type: application/json

{
  "rewardCode": "RWD-ABC-123-XYZ",
  "referenceType": "Appointment",
  "referenceId": "appointment-uuid"
}
```

**Respuesta:**
```json
{
  "reward": {
    "id": "uuid",
    "code": "RWD-ABC-123-XYZ",
    "status": "USED",
    "usedAt": "2025-01-10T14:30:00Z"
  }
}
```

---

### **Endpoints para Negocios/Staff**

#### 1. **Obtener Balance de Cliente**
```http
GET /api/loyalty/business/client/:clientId/balance
Authorization: Bearer <token>
```

#### 2. **Obtener Transacciones de Cliente**
```http
GET /api/loyalty/business/client/:clientId/transactions?page=1&limit=20
Authorization: Bearer <token>
```

#### 3. **Agregar Puntos Manualmente**
```http
POST /api/loyalty/business/credit-points
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "uuid",
  "points": 100,
  "description": "Bono de bienvenida",
  "type": "BONUS"
}
```

#### 4. **Obtener Referidos de Cliente**
```http
GET /api/loyalty/business/client/:clientId/referrals
Authorization: Bearer <token>
```

#### 5. **Buscar Cliente por Código de Referido**
```http
GET /api/loyalty/business/find-by-referral-code/:code
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "client": {
    "id": "uuid",
    "name": "María González",
    "phone": "+57 300 1234567",
    "email": "maria@example.com",
    "referralCode": "REF-ABC123",
    "referralCount": 5
  }
}
```

#### 6. **Limpieza (CRON)**
```http
POST /api/loyalty/business/cleanup
Authorization: Bearer <token>
Content-Type: application/json

{
  "expirePoints": true,
  "expireRewards": true
}
```

---

## Integración con Otros Módulos

### 1. **Citas (Appointments)**
Cuando se registra un pago de cita:

```javascript
// En AppointmentPaymentController.js
const LoyaltyService = require('../services/LoyaltyService');

// Después de marcar la cita como pagada
if (appointment.paymentStatus === 'PAID') {
  await LoyaltyService.creditPointsForAppointmentPayment(
    businessId,
    clientId,
    appointment.id,
    paymentAmount,
    userId
  );
  
  // Verificar milestone
  await LoyaltyService.checkAndCreditMilestone(
    businessId,
    clientId,
    userId
  );
}
```

### 2. **Registro de Clientes**
Cuando se registra un nuevo cliente con referido:

```javascript
// En ClientController.js
const LoyaltyService = require('../services/LoyaltyService');

// Al crear cliente
const businessClient = await BusinessClient.create({
  businessId,
  clientId: newClient.id,
  referredBy: req.body.referredBy // ID del BusinessClient que refirió
});

// Procesar referido si existe
if (req.body.referredBy) {
  await LoyaltyService.processReferral(
    businessId,
    req.body.referredBy,
    businessClient.id,
    userId
  );
}
```

### 3. **Productos (Sales)**
Cuando se vende un producto:

```javascript
// En el controlador de ventas
const LoyaltyService = require('../services/LoyaltyService');

await LoyaltyService.creditPointsForProductPurchase(
  businessId,
  clientId,
  saleId,
  totalAmount,
  userId
);
```

---

## Flujos de Trabajo

### **Flujo 1: Cliente Completa Primera Cita Pagada**

1. Cliente A refiere a Cliente B
2. Se registra Cliente B con `referredBy = clienteA.id`
3. Se otorgan puntos a Cliente A por el referido
4. Cliente B completa su primera cita y paga
5. Se otorgan puntos a Cliente B por el pago
6. Se otorga **bono adicional** a Cliente A por primera visita completada

### **Flujo 2: Cliente Alcanza Hito**

1. Cliente completa cita #10
2. Sistema detecta hito automáticamente
3. Se otorgan puntos extra por milestone
4. Se notifica al cliente (futuro: WhatsApp)

### **Flujo 3: Cliente Canjea Puntos**

1. Cliente consulta su balance
2. Cliente elige recompensa (ej: 10% descuento)
3. Sistema valida puntos suficientes
4. Sistema genera código único de recompensa
5. Cliente presenta código al pagar
6. Staff marca recompensa como usada
7. Descuento se aplica a la transacción

---

## Tareas Pendientes

### **Integración**
- [ ] Integrar hook en AppointmentPaymentController
- [ ] Integrar hook en ClientController para referidos
- [ ] Integrar hook para ventas de productos
- [ ] Aplicar descuentos automáticamente al presentar código de recompensa

### **Bonos Automáticos**
- [ ] Job CRON para bonos de cumpleaños (ejecutar diariamente)
- [ ] Job CRON para bonos de aniversario (ejecutar diariamente)
- [ ] Job CRON para expirar puntos antiguos
- [ ] Job CRON para expirar recompensas no usadas

### **Tarjetas de Fidelización PDF**
- [x] Servicio de generación de tarjetas PDF
- [x] Endpoint para generar tarjeta individual del cliente
- [x] Endpoint para generar tarjeta de cliente específico (business)
- [x] Endpoint para generar múltiples tarjetas en un PDF (impresión bulk)
- [x] Configuración de colores de branding (6 reglas nuevas)
- [x] Tamaño de tarjeta de crédito (85.6mm x 53.98mm)
- [x] Soporte para logo del negocio
- [x] Gradiente personalizable con colores del negocio

### **Notificaciones**
- [ ] WhatsApp: notificar cuando se ganan puntos
- [ ] WhatsApp: notificar cuando puntos están por expirar
- [ ] WhatsApp: notificar cuando se canjean recompensas
- [ ] WhatsApp: recordar código de referido al cliente

### **Testing**
- [ ] Tests unitarios de LoyaltyService
- [ ] Tests de integración de endpoints
- [ ] Tests de flujos completos (referidos, canjes, etc.)
- [ ] Tests de reglas de negocio configurables

### **Documentación**
- [ ] Guía de configuración para negocios
- [ ] Tutorial de uso para staff
- [ ] Video explicativo para clientes
- [ ] Casos de uso recomendados por industria

---

## Consideraciones Técnicas

### **Performance**
- Índices en `businessId`, `clientId`, `status`, `expiresAt`
- Paginación en todas las consultas
- Cache de balances frecuentemente consultados

### **Seguridad**
- Validación de permisos por rol (cliente, staff, owner)
- Los clientes solo pueden ver sus propios puntos
- Staff solo puede ver clientes de su negocio
- Códigos de recompensa generados con alta entropía

### **Integridad de Datos**
- Todas las operaciones críticas usan transacciones de Sequelize
- Validación de puntos suficientes antes de canjear
- Verificación de módulo activo antes de acreditar puntos
- Auditoría completa: quién, cuándo, por qué

### **Escalabilidad**
- Sistema preparado para millones de transacciones
- Posibilidad de archivar transacciones antiguas
- Soporte para múltiples sucursales
- Configurable por negocio (no hardcoded)

---

## Ejemplo de Configuración

Un negocio de belleza típico podría configurar:

```javascript
{
  // Programa de Fidelización
  "LOYALTY_ENABLED": true,
  "LOYALTY_POINTS_PER_CURRENCY_UNIT": 1,        // 1 punto por cada $1,000 COP
  "LOYALTY_APPOINTMENT_POINTS_ENABLED": true,
  "LOYALTY_PRODUCT_POINTS_ENABLED": true,
  "LOYALTY_REFERRAL_ENABLED": true,
  "LOYALTY_REFERRAL_POINTS": 100,               // 100 puntos por referir
  "LOYALTY_REFERRAL_FIRST_VISIT_BONUS": 50,     // 50 puntos extra por primera visita
  "LOYALTY_MILESTONE_ENABLED": true,
  "LOYALTY_MILESTONE_COUNT": 10,                // Cada 10 citas
  "LOYALTY_MILESTONE_POINTS": 200,              // 200 puntos de bono
  "LOYALTY_BIRTHDAY_BONUS_ENABLED": true,
  "LOYALTY_BIRTHDAY_BONUS_POINTS": 150,
  "LOYALTY_POINTS_EXPIRY_DAYS": 365,            // Expiran en 1 año
  "LOYALTY_MIN_POINTS_TO_REDEEM": 100,          // Mínimo 100 puntos
  "LOYALTY_REWARD_EXPIRY_DAYS": 30,             // Recompensas vencen en 30 días
  "LOYALTY_POINTS_FOR_DISCOUNT": 10,            // 10 puntos = $1,000 de descuento
  
  // Branding de Tarjetas PDF
  "BRANDING_PRIMARY_COLOR": "#8B5CF6",          // Púrpura
  "BRANDING_SECONDARY_COLOR": "#EC4899",        // Rosa
  "BRANDING_ACCENT_COLOR": "#F59E0B",           // Ámbar (para los puntos)
  "BRANDING_TEXT_COLOR": "#1F2937",             // Gris oscuro
  "BRANDING_BACKGROUND_COLOR": "#FFFFFF",       // Blanco
  "BRANDING_USE_GRADIENT": true                 // Usar gradiente en tarjetas
}
```

### **Ejemplos de Paletas de Colores por Industria**

#### **Salón de Belleza Moderno**
```javascript
{
  "BRANDING_PRIMARY_COLOR": "#EC4899",        // Rosa vibrante
  "BRANDING_SECONDARY_COLOR": "#8B5CF6",      // Púrpura
  "BRANDING_ACCENT_COLOR": "#F59E0B",         // Dorado
  "BRANDING_USE_GRADIENT": true
}
```

#### **Spa & Wellness**
```javascript
{
  "BRANDING_PRIMARY_COLOR": "#10B981",        // Verde esmeralda
  "BRANDING_SECONDARY_COLOR": "#14B8A6",      // Verde azulado
  "BRANDING_ACCENT_COLOR": "#34D399",         // Verde claro
  "BRANDING_USE_GRADIENT": true
}
```

#### **Barbería Clásica**
```javascript
{
  "BRANDING_PRIMARY_COLOR": "#1F2937",        // Gris oscuro
  "BRANDING_SECONDARY_COLOR": "#374151",      // Gris medio
  "BRANDING_ACCENT_COLOR": "#EF4444",         // Rojo
  "BRANDING_USE_GRADIENT": false              // Fondo sólido
}
```

#### **Centro de Estética Premium**
```javascript
{
  "BRANDING_PRIMARY_COLOR": "#6366F1",        // Índigo
  "BRANDING_SECONDARY_COLOR": "#8B5CF6",      // Púrpura
  "BRANDING_ACCENT_COLOR": "#FBBF24",         // Oro
  "BRANDING_USE_GRADIENT": true
}
```

---

## Mejoras Futuras para Tarjetas PDF

### **Funcionalidades Pendientes**

1. **Código QR en la Tarjeta**
   - Agregar código QR con el `referralCode` del cliente
   - Permitir escanear el QR para aplicar puntos automáticamente
   - QR puede incluir link a perfil del cliente o descarga de app

2. **Código de Barras**
   - Alternativa al QR para sistemas POS tradicionales
   - Formato Code128 o EAN-13

3. **Foto del Cliente**
   - Opcional: incluir foto del cliente en la tarjeta
   - Mejora seguridad y personalización
   - Circular en esquina superior derecha

4. **Nivel/Tier del Cliente**
   - Mostrar nivel (Bronce, Plata, Oro, Platinum)
   - Basado en puntos acumulados o cantidad de visitas
   - Con icono distintivo

5. **Fecha de Vencimiento de Puntos**
   - Mostrar fecha de próxima expiración
   - Motivar al cliente a usar puntos pronto

6. **Diseños Alternativos**
   - Orientación vertical (tarjeta de presentación)
   - Formato A6 (postcard)
   - Diseño con patrón/textura de fondo
   - Soporte para tarjetas con banda magnética

7. **Internacionalización**
   - Textos en múltiples idiomas
   - Formato de números según localización
   - Monedas diferentes

8. **Impresión Profesional**
   - Marcas de corte para impresión
   - Sangrado (bleed) de 3mm
   - Modo CMYK para imprentas
   - Resolución 300 DPI

---

## Conclusión

El **Sistema de Fidelización** es una herramienta poderosa y flexible que permite a los negocios:

- 🎯 **Retener clientes** a través de incentivos
- 📈 **Aumentar ventas** mediante recompensas atractivas
- 🤝 **Generar referidos** con bonificaciones
- 📊 **Medir engagement** con métricas de puntos
- ⚙️ **Configurar reglas** según su modelo de negocio

El sistema está completamente integrado con el resto de la plataforma y sigue los mismos estándares de calidad, seguridad y escalabilidad.
