# 🧪 INSOMNIA - Guía Rápida para Crear Especialistas

## 📋 Requisitos Previos
1. Tener un usuario BUSINESS autenticado
2. Tener el `authToken` del usuario BUSINESS
3. Tener creada al menos una sucursal (Branch)
4. Tener creados los servicios que ofrecerá el especialista

---

## 🔐 1. Login como BUSINESS (Obtener Token)

### Request
```
POST {{base_url}}/api/auth/login
```

### Headers
```json
{
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "email": "owner@example.com",
  "password": "tu_password",
  "subdomain": "tu-negocio"
}
```

### Response (Guardar el token)
```json
{
  "status": "success",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "..."
    },
    "user": {
      "id": 1,
      "email": "owner@example.com",
      "role": "BUSINESS",
      "businessId": 5
    }
  }
}
```

**⚠️ IMPORTANTE:** Copia el `accessToken` y úsalo en todos los siguientes requests.

---

## 👨‍⚕️ 2. Crear Especialista (SPECIALIST)

### Request
```
POST {{base_url}}/api/business/specialists
```

### Headers
```json
{
  "Authorization": "Bearer <accessToken_del_paso_1>",
  "Content-Type": "application/json"
}
```

### Body - Ejemplo Mínimo
```json
{
  "name": "Dr. Juan Pérez",
  "email": "juan.perez@example.com",
  "phone": "+57 300 123 4567",
  "password": "JuanPerez123!",
  "role": "SPECIALIST",
  "branchId": 1
}
```

### Body - Ejemplo Completo
```json
{
  "name": "Dr. Juan Pérez",
  "email": "juan.perez@example.com",
  "phone": "+57 300 123 4567",
  "password": "JuanPerez123!",
  "role": "SPECIALIST",
  "branchId": 1,
  "specialization": "Dermatología Estética",
  "bio": "Especialista en tratamientos faciales y corporales con 10 años de experiencia",
  "profileImage": "https://example.com/foto.jpg",
  "licenseNumber": "MED-12345",
  "experience": "10 años",
  "education": "Universidad Nacional - Medicina Estética",
  "languages": ["Español", "Inglés"],
  "certifications": ["Botox Certificado", "Rellenos Dérmicos"],
  "isActive": true
}
```

### Response Exitosa
```json
{
  "status": "success",
  "message": "Especialista creado exitosamente",
  "data": {
    "id": 15,
    "name": "Dr. Juan Pérez",
    "email": "juan.perez@example.com",
    "role": "SPECIALIST",
    "branchId": 1,
    "businessId": 5,
    "isActive": true
  }
}
```

---

## 👥 3. Crear Recepcionista-Especialista (RECEPTIONIST_SPECIALIST)

### Request
```
POST {{base_url}}/api/business/specialists
```

### Headers
```json
{
  "Authorization": "Bearer <accessToken_del_paso_1>",
  "Content-Type": "application/json"
}
```

### Body - Ejemplo Mínimo
```json
{
  "name": "María González",
  "email": "maria.gonzalez@example.com",
  "phone": "+57 310 987 6543",
  "password": "Maria123!",
  "role": "RECEPTIONIST_SPECIALIST",
  "branchId": 1
}
```

### Body - Ejemplo Completo
```json
{
  "name": "María González",
  "email": "maria.gonzalez@example.com",
  "phone": "+57 310 987 6543",
  "password": "Maria123!",
  "role": "RECEPTIONIST_SPECIALIST",
  "branchId": 1,
  "specialization": "Manicure y Pedicure",
  "bio": "Especialista en manicure, pedicure y diseño de uñas. También gestiono la recepción.",
  "profileImage": "https://example.com/maria.jpg",
  "experience": "5 años",
  "education": "Técnico en Estética y Cosmetología",
  "languages": ["Español"],
  "certifications": ["Técnicas de Nail Art", "Atención al Cliente"],
  "isActive": true
}
```

### Response Exitosa
```json
{
  "status": "success",
  "message": "Recepcionista-Especialista creado exitosamente",
  "data": {
    "id": 16,
    "name": "María González",
    "email": "maria.gonzalez@example.com",
    "role": "RECEPTIONIST_SPECIALIST",
    "branchId": 1,
    "businessId": 5,
    "isActive": true
  }
}
```

---

## 🏢 4. Asignar Sucursales Adicionales (Opcional)

Si el especialista trabaja en múltiples sucursales:

### Request
```
POST {{base_url}}/api/user-branches
```

### Headers
```json
{
  "Authorization": "Bearer <accessToken>",
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "userId": 15,
  "branchId": 2,
  "isDefault": false
}
```

---

## 💰 5. Configurar Precios Personalizados (Opcional)

### Request
```
POST {{base_url}}/api/specialists/15/services
```

### Headers
```json
{
  "Authorization": "Bearer <accessToken>",
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "serviceId": 10,
  "branchId": 1,
  "customPrice": 50000,
  "duration": 60,
  "isActive": true
}
```

---

## 📅 6. Crear Horario del Especialista

### Request
```
POST {{base_url}}/api/schedules
```

### Headers
```json
{
  "Authorization": "Bearer <accessToken>",
  "Content-Type": "application/json"
}
```

### Body - Horario Lunes a Viernes
```json
{
  "specialistId": 15,
  "branchId": 1,
  "businessId": 5,
  "mondayStart": "09:00",
  "mondayEnd": "18:00",
  "tuesdayStart": "09:00",
  "tuesdayEnd": "18:00",
  "wednesdayStart": "09:00",
  "wednesdayEnd": "18:00",
  "thursdayStart": "09:00",
  "thursdayEnd": "18:00",
  "fridayStart": "09:00",
  "fridayEnd": "18:00",
  "saturdayStart": "09:00",
  "saturdayEnd": "14:00"
}
```

### Response
```json
{
  "status": "success",
  "message": "Horario creado exitosamente",
  "data": {
    "id": 10,
    "specialistId": 15,
    "branchId": 1,
    "mondayStart": "09:00:00",
    "mondayEnd": "18:00:00"
  }
}
```

---

## 🎯 7. Generar Slots Automáticos

### Request
```
POST {{base_url}}/api/schedules/generate-slots
```

### Headers
```json
{
  "Authorization": "Bearer <accessToken>",
  "Content-Type": "application/json"
}
```

### Body
```json
{
  "scheduleId": 10,
  "startDate": "2025-10-15",
  "endDate": "2025-11-15",
  "slotDuration": 60
}
```

### Response
```json
{
  "status": "success",
  "message": "Slots generados exitosamente",
  "data": {
    "generated": 120,
    "slots": [...]
  }
}
```

---

## 🔄 Flujo Completo Recomendado

```
1. Login como BUSINESS (obtener token)
   ↓
2. Crear Especialista o RECEPTIONIST_SPECIALIST
   ↓
3. [Opcional] Asignar sucursales adicionales
   ↓
4. [Opcional] Configurar precios personalizados
   ↓
5. Crear horario semanal
   ↓
6. Generar slots automáticos
   ↓
7. ✅ Especialista listo para usar en la app móvil
```

---

## 📱 Testing en Mobile App

Una vez creado el especialista, puedes:

1. **Abrir la app móvil**
2. **Seleccionar rol:** "Especialista" o "Recepcionista-Especialista"
3. **Login con las credenciales:**
   - Email: `maria.gonzalez@example.com`
   - Password: `Maria123!`
   - Subdomain: `tu-negocio`
4. **Acceder al dashboard** correspondiente
5. **Crear/editar agenda** desde la app

---

## ⚠️ Errores Comunes

### Error 400: Email ya existe
```json
{
  "error": "El email ya está registrado"
}
```
**Solución:** Usar un email diferente.

### Error 401: No autorizado
```json
{
  "error": "No autorizado"
}
```
**Solución:** Verificar que el token en el header `Authorization` sea correcto.

### Error 404: Branch not found
```json
{
  "error": "Branch not found"
}
```
**Solución:** Verificar que el `branchId` exista (crear sucursal primero).

### Error 400: Rol inválido
```json
{
  "error": "El rol debe ser SPECIALIST o RECEPTIONIST_SPECIALIST"
}
```
**Solución:** Usar exactamente `SPECIALIST` o `RECEPTIONIST_SPECIALIST` (mayúsculas).

---

## 🧪 Collection de Insomnia

### Variables de Entorno
```json
{
  "base_url": "http://localhost:3001",
  "auth_token": "",
  "specialist_id": "",
  "schedule_id": ""
}
```

### Uso de Variables
En los headers:
```
Authorization: Bearer {{auth_token}}
```

En las URLs:
```
POST {{base_url}}/api/specialists/{{specialist_id}}/services
```

---

## 📝 Notas Importantes

1. **RECEPTIONIST_SPECIALIST** tiene acceso a:
   - Dashboard de especialista (su agenda)
   - Dashboard de recepcionista (gestión de todos)
   - Calendario multi-especialista
   - Puede crear citas para otros y para sí mismo

2. **SPECIALIST** solo tiene acceso a:
   - Su propia agenda
   - Sus propias citas
   - Su historial de clientes

3. **Passwords:**
   - Mínimo 8 caracteres
   - Recomendado: letras + números + símbolos

4. **businessId:**
   - Se asigna automáticamente desde el token
   - No es necesario enviarlo en el body

---

**Fecha:** Octubre 2025  
**Versión:** 1.0.0
