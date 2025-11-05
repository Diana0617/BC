# 🚀 Sistema de Suscripciones Beauty Control

## 📋 Descripción General

Este documento describe el flujo completo de suscripciones implementado en Beauty Control, que permite a nuevos usuarios crear cuentas de negocio mediante un proceso de 3 pasos: selección de plan, registro de negocio y procesamiento de pago.

## 🏗️ Arquitectura del Sistema

### Frontend (React Web App)
- **SubscriptionPage.jsx** - Coordinador principal del flujo
- **PlanSelection.jsx** - Selección de planes con características
- **BusinessRegistration.jsx** - Registro de negocio con validación de subdominio
- **PaymentFlow.jsx** - Simulador de pagos con tarjetas de prueba

### Backend (Node.js + Express)
- **SubscriptionController.js** - Lógica de creación de suscripciones
- **subscription.js** - Rutas API para suscripciones
- **Modelos** - Business, User, BusinessSubscription, SubscriptionPayment, BusinessRules

## 🔄 Flujo de Suscripción

### Paso 1: Selección de Plan
```
Usuario accede a /subscribe
↓
Visualiza planes disponibles con:
- Características incluidas
- Precios
- Limitaciones por plan
↓
Selecciona un plan y avanza
```

### Paso 2: Registro de Negocio
```
Formulario de registro que incluye:
- Datos del negocio (nombre, tipo, contacto, dirección)
- Datos del usuario administrador (nombre, email, contraseña)
- Generación automática de subdominio
- Validación en tiempo real de disponibilidad
↓
Acepta términos y condiciones
```

### Paso 3: Procesamiento de Pago
```
Simulador de pago con tarjetas de prueba:
- 4242424242424242 (Aprobada)
- 4000000000000002 (Declinada)
- 4000000000009995 (Fondos insuficientes)
- 4000000000000119 (En proceso)
↓
Procesa el pago y envía todo al backend
```

## 🛠️ Implementación Técnica

### Estructura de Datos Enviada al Backend

```json
{
  "planId": 1,
  "businessData": {
    "name": "Mi Salón de Belleza",
    "businessCode": "mi-salon-belleza-123",
    "type": "salon",
    "phone": "+57 300 123 4567",
    "email": "contacto@misalon.com",
    "address": "Calle 123 #45-67",
    "city": "Bogotá",
    "country": "Colombia"
  },
  "userData": {
    "firstName": "María",
    "lastName": "García",
    "email": "maria@misalon.com",
    "phone": "+57 300 987 6543",
    "password": "password123"
  },
  "paymentData": {
    "transactionId": "tx_123456789",
    "method": "card",
    "amount": 50000,
    "currency": "COP",
    "status": "APPROVED"
  },
  "acceptedTerms": {
    "terms": true,
    "privacy": true,
    "marketing": false
  }
}
```

### Proceso en el Backend

1. **Validación de Datos**
   ```javascript
   // Verificar que el plan existe
   const plan = await SubscriptionPlan.findByPk(planId)
   
   // Verificar disponibilidad del subdominio
   const existingBusiness = await Business.findOne({
     where: { businessCode: businessData.businessCode }
   })
   
   // Verificar que el email no existe
   const existingUser = await User.findOne({
     where: { email: userData.email }
   })
   ```

2. **Creación de Entidades** (en transacción)
   ```javascript
   // 1. Crear el negocio
   const business = await Business.create({
     name: businessData.name,
     businessCode: businessData.businessCode,
     currentPlanId: planId,
     status: 'TRIAL',
     trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
   })
   
   // 2. Crear reglas predeterminadas
   await BusinessRules.create({ businessId: business.id })
   
   // 3. Crear usuario administrador
   const user = await User.create({
     firstName: userData.firstName,
     lastName: userData.lastName,
     email: userData.email,
     password: hashedPassword,
     role: 'BUSINESS',
     businessId: business.id
   })
   
   // 4. Crear suscripción
   const subscription = await BusinessSubscription.create({
     businessId: business.id,
     subscriptionPlanId: planId,
     status: 'TRIAL',
     startDate: new Date(),
     endDate: endDate,
     amount: plan.price
   })
   
   // 5. Registrar pago
   const payment = await SubscriptionPayment.create({
     businessSubscriptionId: subscription.id,
     transactionId: paymentData.transactionId,
     amount: paymentData.amount,
     status: paymentData.status
   })
   ```

## 🗂️ Modelos de Base de Datos

### Business
```sql
CREATE TABLE businesses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  business_code VARCHAR(100) UNIQUE, -- Subdominio
  current_plan_id INTEGER REFERENCES subscription_plans(id),
  status VARCHAR(50) DEFAULT 'TRIAL',
  trial_end_date TIMESTAMP,
  -- ... otros campos
);
```

### User
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50) DEFAULT 'BUSINESS',
  business_id INTEGER REFERENCES businesses(id),
  -- ... otros campos
);
```

### BusinessSubscription
```sql
CREATE TABLE business_subscriptions (
  id SERIAL PRIMARY KEY,
  business_id INTEGER REFERENCES businesses(id),
  subscription_plan_id INTEGER REFERENCES subscription_plans(id),
  status VARCHAR(50) DEFAULT 'TRIAL',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  amount DECIMAL(10,2),
  -- ... otros campos
);
```

### SubscriptionPayment
```sql
CREATE TABLE subscription_payments (
  id SERIAL PRIMARY KEY,
  business_subscription_id INTEGER REFERENCES business_subscriptions(id),
  transaction_id VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'COP',
  status VARCHAR(50),
  payment_method VARCHAR(50),
  -- ... otros campos
);
```

## 🔗 Endpoints API

### POST /api/subscriptions/create
Crea una nueva suscripción completa.

**Request Body:** Ver estructura de datos arriba

**Response:**
```json
{
  "success": true,
  "message": "Suscripción creada exitosamente",
  "data": {
    "business": {
      "id": 1,
      "name": "Mi Salón de Belleza",
      "businessCode": "mi-salon-belleza-123"
    },
    "user": {
      "id": 1,
      "firstName": "María",
      "lastName": "García",
      "role": "BUSINESS"
    },
    "subscription": {
      "id": 1,
      "status": "TRIAL",
      "startDate": "2025-09-16T00:00:00.000Z",
      "endDate": "2025-10-16T00:00:00.000Z"
    },
    "token": "jwt_token_for_auto_login"
  }
}
```

### GET /api/auth/check-subdomain/:subdomain
Verifica disponibilidad de subdominio.

**Response:**
```json
{
  "available": true
}
```

## 🧪 Simulador de Pagos

Mientras se implementa Wompi, el sistema incluye un simulador con estas tarjetas de prueba:

| Número de Tarjeta | Resultado |
|------------------|-----------|
| 4242424242424242 | ✅ Aprobada |
| 4000000000000002 | ❌ Declinada |
| 4000000000000009 | ❌ Fondos Insuficientes |
| 4000000000000119 | ⏳ Procesando |

## 🚀 Despliegue y Configuración

### Variables de Entorno Requeridas

```env
# Backend
DATABASE_URL=postgresql://user:password@localhost/beauty_control_dev
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001
```

### Comandos de Desarrollo

```bash
# Iniciar backend
cd packages/backend
npm start

# Iniciar frontend web
cd packages/web-app
npm run dev

# Sembrar datos de prueba
cd packages/backend
node scripts/seed-plans.js
```

## 📁 Estructura de Archivos

```
packages/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── SubscriptionController.js
│   │   ├── routes/
│   │   │   └── subscription.js
│   │   └── models/
│   │       ├── Business.js
│   │       ├── User.js
│   │       ├── BusinessSubscription.js
│   │       └── SubscriptionPayment.js
│   └── scripts/
│       └── seed-plans.js
├── web-app/
│   └── src/
│       ├── pages/subscription/
│       │   └── SubscriptionPage.jsx
│       └── components/subscription/
│           ├── PlanSelection.jsx
│           ├── BusinessRegistration.jsx
│           └── PaymentFlow.jsx
└── shared/
    └── [componentes compartidos]
```

## 🔍 Casos de Prueba

### Flujo Exitoso
1. Navegar a `/subscribe`
2. Seleccionar un plan
3. Llenar formulario de registro
4. Usar tarjeta 4242424242424242
5. Verificar creación en base de datos

### Casos de Error
- Email duplicado
- Subdominio no disponible
- Plan inexistente
- Tarjeta declinada

## 🏷️ Estados del Sistema

### Estados de Business
- `TRIAL` - Período de prueba de 30 días
- `ACTIVE` - Suscripción activa y pagada
- `SUSPENDED` - Suspendida por falta de pago
- `CANCELLED` - Cancelada por el usuario

### Estados de BusinessSubscription
- `TRIAL` - En período de prueba
- `ACTIVE` - Activa y funcionando
- `EXPIRED` - Expirada
- `CANCELLED` - Cancelada

### Estados de SubscriptionPayment
- `PENDING` - Pendiente de procesamiento
- `COMPLETED` - Completado exitosamente
- `FAILED` - Fallido
- `REFUNDED` - Reembolsado

## 🔒 Seguridad

- Contraseñas hasheadas con bcryptjs
- Validación de datos en backend
- Tokens JWT para autenticación
- Transacciones de base de datos para consistencia
- Validación de subdominios en tiempo real

## 📈 Próximas Mejoras

- [ ] Integración con Wompi para pagos reales
- [ ] Sistema de invitaciones por email
- [ ] Dashboard post-registro
- [ ] Gestión de renovaciones automáticas
- [ ] Métricas y analytics de suscripciones
- [ ] Sistema de notificaciones
- [ ] Soporte para múltiples métodos de pago

---

## 💡 Notas Técnicas

### Generación de Subdominios
```javascript
// Auto-genera desde el nombre del negocio
const generateSubdomain = (businessName) => {
  return businessName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 30) + '-' + Math.floor(Math.random() * 1000)
}
```

### Validación en Tiempo Real
El frontend valida la disponibilidad del subdominio cada vez que cambia, mostrando feedback inmediato al usuario.

### Transacciones de Base de Datos
Todo el proceso de creación se ejecuta en una sola transacción para garantizar consistencia de datos.

---

**Desarrollado con ❤️ para Beauty Control**