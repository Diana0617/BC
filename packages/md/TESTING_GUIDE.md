# API Testing - Beauty Control

## Test Data Creation

### 1. Scripts de Testing Automatizados

#### Testing del Rol OWNER (Nuevo)
```bash
# Ejecutar todas las pruebas del administrador de la plataforma
node test-owner.js
```

Este script prueba:
- ✅ Registro de usuario OWNER
- ✅ Login con token JWT
- ✅ Obtener estadísticas de la plataforma
- ✅ Listar todos los negocios
- ✅ Crear negocio manualmente
- ✅ Cambiar estado de negocio (ACTIVE/SUSPENDED/INACTIVE)
- ✅ Crear suscripciones manuales
- ✅ Cancelar suscripciones

#### Testing General del Sistema
```bash
# Script principal de testing
node test-user.js
```

### 2. Crear planes de suscripción

```bash
curl -X POST http://localhost:3001/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plan Básico",
    "description": "Plan ideal para salones pequeños con funcionalidades esenciales",
    "price": 29000,
    "currency": "COP",
    "billingPeriod": "MONTHLY",
    "features": {
      "maxUsers": 3,
      "maxClients": 100,
      "appointments": true,
      "inventory": false,
      "reports": "basic",
      "customization": false
    },
    "isActive": true
  }'
```

```bash
curl -X POST http://localhost:3001/api/plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plan Profesional",
    "description": "Plan completo para salones en crecimiento",
    "price": 59000,
    "currency": "COP",
    "billingPeriod": "MONTHLY",
    "features": {
      "maxUsers": 10,
      "maxClients": 500,
      "appointments": true,
      "inventory": true,
      "reports": "advanced",
      "customization": true
    },
    "isActive": true
  }'
```

### 2. Test del flujo completo

#### 2.1 Registrar un usuario CLIENT

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "Password123!",
    "firstName": "María",
    "lastName": "García",
    "phone": "+57300123456",
    "role": "CLIENT"
  }'
```

#### 2.2 Login del usuario

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "Password123!"
  }'
```

*Guardar el token para las siguientes pruebas*

#### 2.3 Obtener planes disponibles

```bash
curl -X GET http://localhost:3001/api/plans \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 2.4 Crear un negocio (como CLIENT)

```bash
curl -X POST http://localhost:3001/api/business \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salón Bella Vista",
    "description": "Salón de belleza especializado en cortes y peinados",
    "businessType": "SALON",
    "address": "Calle 123 #45-67",
    "phone": "+57300654321",
    "email": "info@bellavista.com",
    "city": "Bogotá",
    "country": "Colombia",
    "subscriptionPlanId": "PLAN_ID_FROM_STEP_3",
    "paymentReference": "PAYMENT_REF_123456"
  }'
```

#### 2.5 Obtener información del negocio

```bash
curl -X GET http://localhost:3001/api/business/my-business \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 2.6 Invitar empleado (como BUSINESS owner)

```bash
curl -X POST http://localhost:3001/api/business/invite-employee \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "empleado@bellavista.com",
    "firstName": "Carlos",
    "lastName": "Martínez",
    "phone": "+57300987654",
    "role": "SPECIALIST",
    "position": "Estilista Senior"
  }'
```

### 3. Verificar flujo de roles

El usuario debería haber cambiado automáticamente de `CLIENT` a `BUSINESS` después de crear el negocio.

#### 3.1 Verificar perfil actual

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Errores esperados (para verificar seguridad)

#### 4.1 Intentar crear negocio sin suscripción válida

```bash
curl -X POST http://localhost:3001/api/business \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Otro Salón",
    "businessType": "SALON",
    "subscriptionPlanId": "invalid-plan-id",
    "paymentReference": "invalid-payment"
  }'
```

#### 4.2 Intentar crear segundo negocio

```bash
curl -X POST http://localhost:3001/api/business \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Segundo Salón",
    "businessType": "SALON",
    "subscriptionPlanId": "VALID_PLAN_ID",
    "paymentReference": "VALID_PAYMENT"
  }'
```

### 5. Testing del Rol OWNER (Administrador de Plataforma)

#### 5.1 Registrar usuario OWNER

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@beautycontrol.com",
    "password": "AdminPassword123!",
    "firstName": "Administrador",
    "lastName": "Beauty Control",
    "phone": "+57300000000",
    "role": "OWNER"
  }'
```

#### 5.2 Login como OWNER

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@beautycontrol.com",
    "password": "AdminPassword123!"
  }'
```

#### 5.3 Obtener estadísticas de la plataforma

```bash
curl -X GET http://localhost:3001/api/owner/stats/platform \
  -H "Authorization: Bearer OWNER_TOKEN_HERE"
```

#### 5.4 Listar todos los negocios de la plataforma

```bash
curl -X GET "http://localhost:3001/api/owner/businesses?page=1&limit=20" \
  -H "Authorization: Bearer OWNER_TOKEN_HERE"
```

#### 5.5 Crear negocio manualmente

```bash
curl -X POST http://localhost:3001/api/owner/businesses \
  -H "Authorization: Bearer OWNER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Spa Belleza Total",
    "businessEmail": "info@bellezatotal.com",
    "businessPhone": "+57320777888",
    "address": "Calle 123 #45-67",
    "city": "Bogotá",
    "country": "Colombia",
    "ownerEmail": "propietario@bellezatotal.com",
    "ownerFirstName": "Ana",
    "ownerLastName": "Rodríguez",
    "ownerPhone": "+57320888999",
    "subscriptionPlanId": "VALID_PLAN_ID"
  }'
```

#### 5.6 Cambiar estado de un negocio

```bash
curl -X PATCH http://localhost:3001/api/owner/businesses/BUSINESS_ID/status \
  -H "Authorization: Bearer OWNER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SUSPENDED",
    "reason": "Incumplimiento de términos de uso"
  }'
```

#### 5.7 Crear suscripción manual

```bash
curl -X POST http://localhost:3001/api/owner/subscriptions \
  -H "Authorization: Bearer OWNER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "BUSINESS_ID_HERE",
    "subscriptionPlanId": "PLAN_ID_HERE",
    "duration": 3
  }'
```

#### 5.8 Cancelar suscripción

```bash
curl -X PATCH http://localhost:3001/api/owner/subscriptions/SUBSCRIPTION_ID/cancel \
  -H "Authorization: Bearer OWNER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Solicitud del cliente por problemas económicos"
  }'
```

### 6. Health check

```bash
curl -X GET http://localhost:3001/health
```

## Respuestas esperadas

### Flujo Normal
- ✅ Registro exitoso de CLIENT
- ✅ Login exitoso con token JWT
- ✅ Listado de planes disponibles
- ✅ Creación exitosa de negocio con cambio de rol CLIENT → BUSINESS
- ✅ Obtención de información del negocio
- ✅ Invitación exitosa de empleado
- ❌ Error al intentar crear negocio sin plan válido
- ❌ Error al intentar crear segundo negocio

### Flujo OWNER
- ✅ Registro exitoso de OWNER
- ✅ Login exitoso con token específico
- ✅ Acceso a estadísticas globales de la plataforma
- ✅ Listado completo de negocios con paginación
- ✅ Creación manual de negocios con propietarios
- ✅ Gestión de estados de negocios (ACTIVE/SUSPENDED/INACTIVE)
- ✅ Creación y cancelación de suscripciones
- ❌ Error de acceso para usuarios no-OWNER a rutas administrativas

## Notas importantes

1. **Seguridad**: El token JWT debe incluirse en todas las requests autenticadas
2. **Roles**: 
   - CLIENT → BUSINESS: Al crear negocio
   - OWNER: Acceso total a administración de plataforma
3. **Multi-tenancy**: Todos los datos están aislados por businessId (excepto OWNER)
4. **Validaciones**: Verificar que las validaciones de negocio funcionen correctamente
5. **Autorización**: Las rutas de OWNER están protegidas con middleware específico

## Scripts de Testing Disponibles

- `test-user.js`: Testing completo del flujo normal
- `test-owner.js`: Testing específico para funcionalidades de OWNER
