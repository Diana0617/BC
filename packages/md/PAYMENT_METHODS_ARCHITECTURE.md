# 🔄 Arquitectura de Métodos de Pago

## 🏗️ Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    MÉTODOS DE PAGO - ARQUITECTURA               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐                    ┌──────────────────────┐
│                      │                    │                      │
│     WEB-APP          │                    │      MOBILE APP      │
│  (Administración)    │                    │    (Operación)       │
│                      │                    │                      │
│  Role: BUSINESS      │                    │  Role: SPECIALIST    │
│        OWNER         │                    │                      │
│                      │                    │                      │
├──────────────────────┤                    ├──────────────────────┤
│                      │                    │                      │
│  ✅ CONFIGURAR       │                    │  ❌ No configurar    │
│  ├─ Crear métodos    │                    │                      │
│  ├─ Editar métodos   │                    │  ✅ USAR            │
│  ├─ Eliminar métodos │                    │  ├─ Ver métodos     │
│  ├─ Activar/Desact.  │                    │  ├─ Seleccionar     │
│  └─ Info bancaria    │                    │  ├─ Registrar pago  │
│                      │                    │  └─ Subir comprob.  │
│                      │                    │                      │
└──────────┬───────────┘                    └──────────┬───────────┘
           │                                           │
           │                                           │
           └───────────────┬───────────────────────────┘
                           │
                           ▼
                 ┌─────────────────────┐
                 │                     │
                 │   BACKEND (API)     │
                 │   Puerto 3001       │
                 │                     │
                 │  11 Endpoints       │
                 │  ├─ GET methods     │
                 │  ├─ POST create     │
                 │  ├─ PUT update      │
                 │  ├─ DELETE remove   │
                 │  └─ POST reorder    │
                 │                     │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │                     │
                 │   PostgreSQL        │
                 │                     │
                 │  business_payment_  │
                 │  config             │
                 │  ├─ id              │
                 │  ├─ businessId      │
                 │  ├─ paymentMethods  │
                 │  │   (JSONB array)  │
                 │  └─ timestamps      │
                 │                     │
                 │  appointment_       │
                 │  payments           │
                 │  ├─ id              │
                 │  ├─ appointmentId   │
                 │  ├─ amount          │
                 │  ├─ methodId        │
                 │  ├─ proofUrl        │
                 │  └─ status          │
                 │                     │
                 └─────────────────────┘
```

## 📊 Comparativa de Funcionalidades

### Web-App (Business Profile)

```
┌────────────────────────────────────────────────────────┐
│  💳 Métodos de Pago                              [+]   │
│  Configura los métodos de pago que aceptarás          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ 💰 Efectivo      │  │ 📱 Yape          │           │
│  │ CASH             │  │ QR                │           │
│  │ Orden #1      ✓  │  │ +51987654321     │           │
│  │                  │  │ ☑ Comprobante    │           │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │           │
│  │ │   Editar     │ │  │ │   Editar     │ │           │
│  │ └──────────────┘ │  │ └──────────────┘ │           │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │           │
│  │ │   Eliminar   │ │  │ │   Eliminar   │ │           │
│  │ └──────────────┘ │  │ └──────────────┘ │           │
│  └──────────────────┘  └──────────────────┘           │
│                                                        │
│  [+ Agregar Método de Pago]                          │
│                                                        │
└────────────────────────────────────────────────────────┘

Características:
✅ CRUD completo
✅ Formulario con validaciones
✅ Campos condicionales (banco/teléfono)
✅ Activar/desactivar
✅ Reordenar (futuro)
✅ Vista en grid responsive
```

### Mobile App (Registro de Pago)

```
┌────────────────────────────────────────────────────────┐
│  💰 Registrar Pago                              [X]    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Cita: Corte de Cabello                              │
│  Total: S/ 50.00                                      │
│  Pagado: S/ 0.00                                      │
│  Pendiente: S/ 50.00                                  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Monto a Registrar                              │  │
│  │  [S/ 50.00                                    ] │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Método de Pago                                 │  │
│  │  [Seleccionar método ▼]                         │  │
│  │                                                  │  │
│  │  • 💰 Efectivo                                  │  │
│  │  • 📱 Yape (+51987654321)                       │  │
│  │  • 💳 Transferencia BCP                         │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  📸 Comprobante de Pago (opcional)                    │
│  ┌─────────────────────────────────────────────────┐  │
│  │  [📷 Subir Foto]                                │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  Referencia/Nº Operación (opcional)                  │
│  [OP-123456789                                      ] │
│                                                        │
│  Notas                                                │
│  [Pago realizado en efectivo                        ] │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │            [ Registrar Pago ]                    │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘

Características:
✅ Solo lectura de métodos
✅ Selección de método configurado
✅ Upload de comprobante
✅ Validación de monto
✅ Notas y referencia
❌ NO puede crear/editar métodos
```

## 🔐 Control de Acceso

### Endpoints y Permisos

| Endpoint | Web-App | Mobile | Backend Check |
|----------|---------|--------|---------------|
| `GET /payment-methods` | ✅ BUSINESS | ✅ SPECIALIST | `businessId match` |
| `POST /payment-methods` | ✅ BUSINESS | ❌ No | `role === BUSINESS` |
| `PUT /payment-methods/:id` | ✅ BUSINESS | ❌ No | `role === BUSINESS` |
| `DELETE /payment-methods/:id` | ✅ BUSINESS | ❌ No | `role === BUSINESS` |
| `POST /appointments/:id/payments` | ❌ No | ✅ SPECIALIST | `businessId match` |
| `POST /payments/:id/proof` | ❌ No | ✅ SPECIALIST | `businessId match` |

### Middleware de Autenticación

```javascript
// Backend: routes/paymentRoutes.js

// Solo BUSINESS puede configurar
router.post(
  '/:businessId/payment-methods',
  authenticateToken,
  requireRole(['BUSINESS', 'OWNER']),
  PaymentConfigController.createPaymentMethod
)

// Todos pueden ver (filtrado por businessId)
router.get(
  '/:businessId/payment-methods',
  authenticateToken,
  PaymentConfigController.getPaymentMethods
)

// Solo SPECIALIST puede registrar pagos
router.post(
  '/appointments/:id/payments',
  authenticateToken,
  requireRole(['SPECIALIST', 'BUSINESS', 'OWNER']),
  AppointmentPaymentController.createPayment
)
```

## 📱 Estructura de Datos

### PaymentMethod (JSONB en BD)

```javascript
{
  id: "uuid-v4",
  name: "Yape",
  type: "QR",
  isActive: true,
  requiresProof: true,
  icon: "qr-code-outline",
  order: 1,
  bankInfo: {
    phoneNumber: "+51987654321",
    holderName: "Beauty Salon SAC"
  },
  metadata: {
    description: "Pago mediante código QR de Yape",
    createdAt: "2025-01-19T10:00:00Z",
    createdBy: "admin-user-id"
  }
}
```

### AppointmentPayment (Tabla)

```sql
CREATE TABLE appointment_payments (
  id UUID PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method_id UUID NOT NULL,
  payment_method_name VARCHAR(100),
  payment_method_type VARCHAR(50),
  reference_number VARCHAR(100),
  proof_url TEXT,
  status VARCHAR(50) DEFAULT 'COMPLETED',
  notes TEXT,
  registered_by UUID REFERENCES users(id),
  registered_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Flujo de Trabajo

### 1. Configuración (Web-App)

```
BUSINESS login
    ↓
Business Profile → Métodos de Pago
    ↓
[+ Agregar Método]
    ↓
Formulario:
  - Nombre: "Yape"
  - Tipo: "QR"
  - Teléfono: "+51987654321"
  - Requiere comprobante: ✓
    ↓
POST /api/business/{id}/payment-methods
    ↓
Backend valida y guarda en JSONB
    ↓
Método disponible para TODOS los specialists
```

### 2. Uso (Mobile App)

```
SPECIALIST abre cita
    ↓
AppointmentDetailModal
    ↓
[Registrar Pago]
    ↓
GET /api/business/{id}/payment-methods
    ↓
Muestra solo métodos isActive: true
    ↓
Specialist selecciona "Yape"
    ↓
Ingresa monto: S/ 50.00
    ↓
Sube comprobante (foto)
    ↓
POST /api/appointments/{id}/payments
    ↓
Backend registra pago y sube foto a Cloudinary
    ↓
Genera recibo automático (si configurado)
    ↓
Actualiza estado de cita
```

## 📊 Estados de Pago

```javascript
// Estado de la cita
appointment.paymentStatus:
  - PENDING: S/ 0 pagado
  - PARTIAL: S/ 25 de S/ 50
  - PAID: S/ 50 de S/ 50
  - REFUNDED: Reembolsado

// Estado del pago individual
appointmentPayment.status:
  - COMPLETED: Pago exitoso
  - PENDING: En proceso
  - REFUNDED: Reembolsado
  - CANCELLED: Cancelado
```

## 🎨 Código de Colores

### Por Tipo de Pago

```javascript
CASH     → Verde (emerald)  #10b981
CARD     → Azul (blue)      #3b82f6
TRANSFER → Púrpura (purple) #8b5cf6
QR       → Naranja (amber)  #f59e0b
ONLINE   → Índigo (indigo)  #6366f1
OTHER    → Gris (gray)      #6b7280
```

### Por Estado

```javascript
ACTIVE    → Verde ✓
INACTIVE  → Gris ✗
PENDING   → Amarillo ⏳
PAID      → Verde ✅
PARTIAL   → Naranja 🔶
```

## 🔧 Configuración Técnica

### Variables de Entorno

```bash
# Backend (.env)
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beauty_control
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Web-App (.env)
VITE_API_BASE_URL=http://localhost:3001/api

# Mobile (.env)
API_BASE_URL=http://localhost:3001/api
```

### Dependencias

```json
// Web-App
{
  "@heroicons/react": "^2.x.x",
  "axios": "^1.x.x",
  "react-hot-toast": "^2.x.x",
  "react-redux": "^8.x.x"
}

// Mobile (futuro - solo uso)
{
  "expo-image-picker": "^14.x.x",
  "axios": "^1.x.x"
}
```

---

**Conclusión:**
- Web-App = Configuración administrativa
- Mobile App = Uso operativo
- Backend = Validación y persistencia
- Base de datos = Almacenamiento centralizado
