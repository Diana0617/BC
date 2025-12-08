# 🧪 Test para el Fix de Contraseñas

## Problema encontrado:
Cuando un usuario ya existía, no se actualizaba la contraseña en el endpoint `/api/owner/businesses`

## Fix aplicado:
Se agregó código para actualizar la contraseña del usuario existente cuando se proporciona `ownerPassword`

## Para probar el fix:

### 1. Login como OWNER
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "owner@beautycontrol.com",
  "password": "Owner123!"
}
```

### 2. Crear negocio con contraseña específica
```
POST http://localhost:3001/api/owner/businesses
Content-Type: application/json
Authorization: Bearer {{TOKEN_DEL_OWNER}}

{
  "businessName": "Salón Test Password Fix",
  "businessEmail": "salon-test@example.com",
  "businessPhone": "+57 300 123 4567",
  "address": "Calle Test 123",
  "city": "Bogotá",
  "country": "Colombia",
  "ownerEmail": "test-password@example.com",
  "ownerFirstName": "Test",
  "ownerLastName": "Password",
  "ownerPhone": "+57 300 765 4321",
  "ownerPassword": "MiPasswordDePrueba123!",
  "subscriptionPlanId": "{{PLAN_ID}}"
}
```

### 3. Intentar login con las credenciales nuevas
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test-password@example.com",
  "password": "MiPasswordDePrueba123!"
}
```

## Qué debería pasar:

### ANTES del fix:
- Si el usuario `test-password@example.com` ya existía, se usaría su contraseña anterior o `TempPassword123!`
- El login con `MiPasswordDePrueba123!` fallaría

### DESPUÉS del fix:
- El usuario existente tendrá su contraseña actualizada a `MiPasswordDePrueba123!`
- El login debería funcionar correctamente

## Obtener Plan ID:
```
GET http://localhost:3001/api/owner/plans
Authorization: Bearer {{TOKEN_DEL_OWNER}}
```

## Para verificar en BD (opcional):
```javascript
const bcrypt = require('bcryptjs');
const { User } = require('./src/models');

User.findOne({ where: { email: 'test-password@example.com' } })
  .then(user => {
    if (user) {
      const isValid = bcrypt.compareSync('MiPasswordDePrueba123!', user.password);
      console.log('Password válida:', isValid);
    }
  });
```

## Casos de prueba:

1. **Usuario nuevo**: Debería crear el usuario con la contraseña especificada
2. **Usuario existente**: Debería actualizar la contraseña del usuario existente
3. **Sin contraseña**: Debería usar la contraseña por defecto `TempPassword123!`