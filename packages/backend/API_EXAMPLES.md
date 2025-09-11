# 📋 Guía de APIs - Beauty Control

## 🔐 **Autenticación**

### **Registro de Usuario**
```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "firstName": "María",
  "lastName": "González", 
  "email": "maria@salon-bella.com",
  "password": "MiPassword123!",
  "phone": "+57 300 123 4567",
  "role": "BUSINESS"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "uuid-aqui",
      "firstName": "María",
      "lastName": "González",
      "email": "maria@salon-bella.com",
      "role": "BUSINESS"
    },
    "tokens": {
      "accessToken": "jwt-token-aqui",
      "refreshToken": "refresh-token-aqui",
      "expiresIn": "24h"
    }
  }
}
```

### **Login**
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "maria@salon-bella.com",
  "password": "MiPassword123!"
}
```

### **Obtener Perfil** (requiere autenticación)
```http
GET http://localhost:3001/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🌐 **Subdominios (Preparados)**

### **Sugerir Subdominio**
```http
POST http://localhost:3001/api/auth/suggest-subdomain
Content-Type: application/json

{
  "businessName": "Salón Bella Vista"
}
```

### **Verificar Disponibilidad**
```http
GET http://localhost:3001/api/auth/check-subdomain/salon-bella-vista
```

## 📊 **Utilidad**

### **Health Check**
```http
GET http://localhost:3001/health
```

---

## 🔍 **Roles Disponibles:**
- `CLIENT` - Cliente del sistema
- `RECEPTIONIST` - Recepcionista  
- `SPECIALIST` - Especialista/Empleado
- `BUSINESS` - Administrador del negocio
- `OWNER` - Super administrador (múltiples negocios)

## ⚠️ **Validaciones:**
- **firstName, lastName:** Mínimo 2 caracteres
- **email:** Formato válido y único
- **password:** Mínimo 8 caracteres
- **phone:** Opcional, formato libre
- **role:** Opcional, por defecto 'CLIENT'

## 🚨 **Errores Comunes:**
```json
{
  "success": false,
  "error": "Los campos firstName, lastName, email y password son requeridos"
}

{
  "success": false, 
  "error": "Ya existe una cuenta con este email"
}

{
  "success": false,
  "error": "La contraseña debe tener al menos 8 caracteres"
}
```