# API Testing - Beauty Control

## Test Data Creation

### 1. Crear planes de suscripción

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

### 5. Health check

```bash
curl -X GET http://localhost:3001/health
```

## Respuestas esperadas

- ✅ Registro exitoso de CLIENT
- ✅ Login exitoso con token JWT
- ✅ Listado de planes disponibles
- ✅ Creación exitosa de negocio con cambio de rol CLIENT → BUSINESS
- ✅ Obtención de información del negocio
- ✅ Invitación exitosa de empleado
- ❌ Error al intentar crear negocio sin plan válido
- ❌ Error al intentar crear segundo negocio

## Notas importantes

1. **Seguridad**: El token JWT debe incluirse en todas las requests autenticadas
2. **Roles**: El usuario cambia automáticamente de CLIENT a BUSINESS al crear negocio
3. **Multi-tenancy**: Todos los datos están aislados por businessId
4. **Validaciones**: Verificar que las validaciones de negocio funcionen correctamente
