# 👨‍⚕️ GUÍA DE CREACIÓN DE ESPECIALISTAS Y RECEPTIONIST_SPECIALIST

## 📋 Tabla de Contenidos
1. [Crear Especialista (SPECIALIST)](#crear-especialista)
2. [Crear Recepcionista-Especialista (RECEPTIONIST_SPECIALIST)](#crear-receptionist_specialist)
3. [Asignar Sucursales](#asignar-sucursales)
4. [Configurar Precios Personalizados](#configurar-precios-personalizados)
5. [Crear Horarios](#crear-horarios)
6. [Ejemplos Completos](#ejemplos-completos)

---

## 1️⃣ Crear Especialista (SPECIALIST)

### Endpoint
```
POST /api/business/specialists
```

### Headers
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

### Body - Campos Requeridos
```json
{
  "name": "Dr. Juan Pérez",
  "email": "juan.perez@example.com",
  "phone": "+57 300 123 4567",
  "password": "SecurePassword123!",
  "role": "SPECIALIST",
  "branchId": 1  // ID de la sucursal principal
}
```

### Body - Campos Opcionales
```json
{
  "name": "Dr. Juan Pérez",
  "email": "juan.perez@example.com",
  "phone": "+57 300 123 4567",
  "password": "SecurePassword123!",
  "role": "SPECIALIST",
  "branchId": 1,
  
  // Campos opcionales
  "specialization": "Dermatología Estética",
  "bio": "Especialista en tratamientos faciales y corporales con 10 años de experiencia",
  "profileImage": "https://ejemplo.com/foto-perfil.jpg",
  "licenseNumber": "MED-12345",
  "experience": "10 años",
  "education": "Universidad Nacional - Medicina Estética",
  "languages": ["Español", "Inglés"],
  "certifications": ["Botox Certificado", "Rellenos Dérmicos"],
  "isActive": true
}
```

### Respuesta Exitosa (201 Created)
```json
{
  "status": "success",
  "message": "Especialista creado exitosamente",
  "data": {
    "id": 15,
    "name": "Dr. Juan Pérez",
    "email": "juan.perez@example.com",
    "phone": "+57 300 123 4567",
    "role": "SPECIALIST",
    "branchId": 1,
    "businessId": 5,
    "specialization": "Dermatología Estética",
    "bio": "Especialista en tratamientos faciales...",
    "isActive": true,
    "createdAt": "2025-10-10T12:00:00.000Z",
    "updatedAt": "2025-10-10T12:00:00.000Z"
  }
}
```

---

## 2️⃣ Crear Recepcionista-Especialista (RECEPTIONIST_SPECIALIST)

### Endpoint
```
POST /api/business/specialists
```

### Headers
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

### Body - Campos Requeridos
```json
{
  "name": "María González",
  "email": "maria.gonzalez@example.com",
  "phone": "+57 310 987 6543",
  "password": "SecurePassword456!",
  "role": "RECEPTIONIST_SPECIALIST",
  "branchId": 1  // Sucursal principal
}
```

### Body - Campos Completos
```json
{
  "name": "María González",
  "email": "maria.gonzalez@example.com",
  "phone": "+57 310 987 6543",
  "password": "SecurePassword456!",
  "role": "RECEPTIONIST_SPECIALIST",
  "branchId": 1,
  
  // Información como especialista
  "specialization": "Manicure y Pedicure",
  "bio": "Especialista en manicure, pedicure y diseño de uñas. También gestiono la recepción.",
  "profileImage": "https://ejemplo.com/maria-perfil.jpg",
  "experience": "5 años",
  "education": "Técnico en Estética y Cosmetología",
  "languages": ["Español"],
  "certifications": ["Técnicas de Nail Art", "Atención al Cliente"],
  
  // Información como recepcionista
  "workSchedule": {
    "monday": { "start": "08:00", "end": "18:00" },
    "tuesday": { "start": "08:00", "end": "18:00" },
    "wednesday": { "start": "08:00", "end": "18:00" },
    "thursday": { "start": "08:00", "end": "18:00" },
    "friday": { "start": "08:00", "end": "18:00" },
    "saturday": { "start": "09:00", "end": "14:00" }
  },
  "isActive": true
}
```

### Respuesta Exitosa (201 Created)
```json
{
  "status": "success",
  "message": "Recepcionista-Especialista creado exitosamente",
  "data": {
    "id": 16,
    "name": "María González",
    "email": "maria.gonzalez@example.com",
    "phone": "+57 310 987 6543",
    "role": "RECEPTIONIST_SPECIALIST",
    "branchId": 1,
    "businessId": 5,
    "specialization": "Manicure y Pedicure",
    "bio": "Especialista en manicure...",
    "isActive": true,
    "createdAt": "2025-10-10T12:30:00.000Z",
    "updatedAt": "2025-10-10T12:30:00.000Z"
  }
}
```

---

## 3️⃣ Asignar Sucursales Adicionales (Multi-Branch)

### ¿Cuándo usar?
- El especialista trabaja en múltiples sucursales
- El RECEPTIONIST_SPECIALIST cubre varias sedes

### Endpoint
```
POST /api/user-branches
```

### Body
```json
{
  "userId": 15,  // ID del especialista
  "branchId": 2, // ID de la sucursal adicional
  "isDefault": false
}
```

### Asignar Múltiples Sucursales
```json
// Sucursal 2
POST /api/user-branches
{
  "userId": 15,
  "branchId": 2,
  "isDefault": false
}

// Sucursal 3
POST /api/user-branches
{
  "userId": 15,
  "branchId": 3,
  "isDefault": false
}
```

### Respuesta
```json
{
  "status": "success",
  "message": "Sucursal asignada exitosamente",
  "data": {
    "id": 5,
    "userId": 15,
    "branchId": 2,
    "isDefault": false,
    "createdAt": "2025-10-10T13:00:00.000Z"
  }
}
```

### Obtener Sucursales del Usuario
```
GET /api/user-branches/user/15
```

**Respuesta:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 4,
      "userId": 15,
      "branchId": 1,
      "isDefault": true,
      "branch": {
        "id": 1,
        "name": "Sede Principal",
        "address": "Calle 123 #45-67",
        "color": "#FF6B6B"
      }
    },
    {
      "id": 5,
      "userId": 15,
      "branchId": 2,
      "isDefault": false,
      "branch": {
        "id": 2,
        "name": "Sede Norte",
        "address": "Avenida 80 #12-34",
        "color": "#4ECDC4"
      }
    }
  ]
}
```

---

## 4️⃣ Configurar Precios Personalizados

### ¿Cuándo usar?
- El especialista cobra tarifas diferentes a las del servicio base
- RECEPTIONIST_SPECIALIST cobra diferente cuando actúa como especialista

### Endpoint
```
POST /api/specialists/:specialistId/services
```

### Body
```json
{
  "serviceId": 10,     // ID del servicio (ej: Manicure)
  "branchId": 1,       // ID de la sucursal
  "customPrice": 50000, // Precio personalizado
  "duration": 60,       // Duración en minutos (opcional)
  "isActive": true
}
```

### Ejemplo: Configurar Múltiples Servicios
```json
// Servicio 1: Manicure
POST /api/specialists/15/services
{
  "serviceId": 10,
  "branchId": 1,
  "customPrice": 50000,
  "duration": 60,
  "isActive": true
}

// Servicio 2: Pedicure
POST /api/specialists/15/services
{
  "serviceId": 11,
  "branchId": 1,
  "customPrice": 60000,
  "duration": 75,
  "isActive": true
}

// Servicio 3: Diseño de Uñas
POST /api/specialists/15/services
{
  "serviceId": 12,
  "branchId": 1,
  "customPrice": 35000,
  "duration": 45,
  "isActive": true
}
```

### Respuesta
```json
{
  "status": "success",
  "message": "Servicio configurado exitosamente",
  "data": {
    "id": 8,
    "specialistId": 15,
    "serviceId": 10,
    "branchId": 1,
    "customPrice": "50000.00",
    "duration": 60,
    "isActive": true,
    "createdAt": "2025-10-10T14:00:00.000Z"
  }
}
```

### Obtener Servicios del Especialista
```
GET /api/specialists/15/services?branchId=1
```

**Respuesta:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 8,
      "specialistId": 15,
      "serviceId": 10,
      "branchId": 1,
      "customPrice": "50000.00",
      "duration": 60,
      "isActive": true,
      "service": {
        "id": 10,
        "name": "Manicure",
        "basePrice": "45000.00",
        "description": "Manicure tradicional"
      }
    },
    {
      "id": 9,
      "specialistId": 15,
      "serviceId": 11,
      "branchId": 1,
      "customPrice": "60000.00",
      "duration": 75,
      "isActive": true,
      "service": {
        "id": 11,
        "name": "Pedicure",
        "basePrice": "55000.00",
        "description": "Pedicure completo"
      }
    }
  ]
}
```

---

## 5️⃣ Crear Horarios (Schedules)

### Endpoint
```
POST /api/schedules
```

### Body - Horario Semanal Básico
```json
{
  "specialistId": 15,
  "branchId": 1,
  "businessId": 5,
  
  // Lunes a Viernes (9:00 AM - 6:00 PM)
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
  
  // Sábado (9:00 AM - 2:00 PM)
  "saturdayStart": "09:00",
  "saturdayEnd": "14:00",
  
  // Domingo cerrado
  "sundayStart": null,
  "sundayEnd": null
}
```

### Body - Horario con Excepciones
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
  "saturdayEnd": "14:00",
  
  // Excepciones (días festivos, eventos especiales)
  "exceptionDates": [
    "2025-12-25",  // Navidad
    "2025-12-31",  // Fin de año
    "2026-01-01"   // Año nuevo
  ],
  
  // Vacaciones
  "vacationStart": "2025-12-20",
  "vacationEnd": "2026-01-05"
}
```

### Respuesta
```json
{
  "status": "success",
  "message": "Horario creado exitosamente",
  "data": {
    "id": 10,
    "specialistId": 15,
    "branchId": 1,
    "businessId": 5,
    "mondayStart": "09:00:00",
    "mondayEnd": "18:00:00",
    "tuesdayStart": "09:00:00",
    "tuesdayEnd": "18:00:00",
    // ... resto de días
    "exceptionDates": ["2025-12-25", "2025-12-31", "2026-01-01"],
    "vacationStart": "2025-12-20",
    "vacationEnd": "2026-01-05",
    "createdAt": "2025-10-10T15:00:00.000Z"
  }
}
```

### Generar Slots Automáticos
```
POST /api/schedules/generate-slots
```

**Body:**
```json
{
  "scheduleId": 10,
  "startDate": "2025-10-15",
  "endDate": "2025-11-15",
  "slotDuration": 60  // 60 minutos por slot
}
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Slots generados exitosamente",
  "data": {
    "generated": 120,  // 120 slots creados
    "slots": [
      {
        "id": 1001,
        "scheduleId": 10,
        "date": "2025-10-15",
        "startTime": "2025-10-15T09:00:00.000Z",
        "endTime": "2025-10-15T10:00:00.000Z",
        "status": "AVAILABLE",
        "duration": 60
      },
      {
        "id": 1002,
        "scheduleId": 10,
        "date": "2025-10-15",
        "startTime": "2025-10-15T10:00:00.000Z",
        "endTime": "2025-10-15T11:00:00.000Z",
        "status": "AVAILABLE",
        "duration": 60
      }
      // ... más slots
    ]
  }
}
```

---

## 6️⃣ Ejemplos Completos

### Ejemplo 1: Crear Especialista en Dermatología
```bash
# 1. Crear especialista
curl -X POST http://localhost:3001/api/business/specialists \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dra. Ana Martínez",
    "email": "ana.martinez@beautycontrol.com",
    "phone": "+57 300 111 2222",
    "password": "Secure123!",
    "role": "SPECIALIST",
    "branchId": 1,
    "specialization": "Dermatología Estética",
    "bio": "Dermatóloga certificada con 15 años de experiencia",
    "licenseNumber": "MED-67890",
    "experience": "15 años",
    "education": "Universidad de los Andes - Medicina",
    "certifications": ["Dermatología", "Medicina Estética"],
    "isActive": true
  }'

# Respuesta: { "data": { "id": 20, ... } }

# 2. Asignar a sucursal adicional
curl -X POST http://localhost:3001/api/user-branches \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 20,
    "branchId": 2,
    "isDefault": false
  }'

# 3. Configurar servicios con precios personalizados
curl -X POST http://localhost:3001/api/specialists/20/services \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 5,
    "branchId": 1,
    "customPrice": 250000,
    "duration": 90,
    "isActive": true
  }'

# 4. Crear horario
curl -X POST http://localhost:3001/api/schedules \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "specialistId": 20,
    "branchId": 1,
    "businessId": 5,
    "mondayStart": "10:00",
    "mondayEnd": "19:00",
    "tuesdayStart": "10:00",
    "tuesdayEnd": "19:00",
    "wednesdayStart": "10:00",
    "wednesdayEnd": "19:00",
    "thursdayStart": "10:00",
    "thursdayEnd": "19:00",
    "fridayStart": "10:00",
    "fridayEnd": "19:00"
  }'

# Respuesta: { "data": { "id": 15, ... } }

# 5. Generar slots para el próximo mes
curl -X POST http://localhost:3001/api/schedules/generate-slots \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": 15,
    "startDate": "2025-11-01",
    "endDate": "2025-11-30",
    "slotDuration": 90
  }'
```

---

### Ejemplo 2: Crear RECEPTIONIST_SPECIALIST para Manicure
```bash
# 1. Crear recepcionista-especialista
curl -X POST http://localhost:3001/api/business/specialists \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laura Ramírez",
    "email": "laura.ramirez@beautycontrol.com",
    "phone": "+57 310 333 4444",
    "password": "Secure456!",
    "role": "RECEPTIONIST_SPECIALIST",
    "branchId": 1,
    "specialization": "Manicure y Pedicure",
    "bio": "Especialista en diseño de uñas y gestión de recepción",
    "experience": "7 años",
    "education": "Técnico en Cosmetología",
    "certifications": ["Nail Art", "Atención al Cliente"],
    "isActive": true
  }'

# Respuesta: { "data": { "id": 21, ... } }

# 2. Configurar servicios (solo servicios que puede realizar)
curl -X POST http://localhost:3001/api/specialists/21/services \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 10,
    "branchId": 1,
    "customPrice": 45000,
    "duration": 60,
    "isActive": true
  }'

curl -X POST http://localhost:3001/api/specialists/21/services \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": 11,
    "branchId": 1,
    "customPrice": 55000,
    "duration": 75,
    "isActive": true
  }'

# 3. Crear horario (trabaja más horas porque también es recepcionista)
curl -X POST http://localhost:3001/api/schedules \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "specialistId": 21,
    "branchId": 1,
    "businessId": 5,
    "mondayStart": "08:00",
    "mondayEnd": "18:00",
    "tuesdayStart": "08:00",
    "tuesdayEnd": "18:00",
    "wednesdayStart": "08:00",
    "wednesdayEnd": "18:00",
    "thursdayStart": "08:00",
    "thursdayEnd": "18:00",
    "fridayStart": "08:00",
    "fridayEnd": "18:00",
    "saturdayStart": "09:00",
    "saturdayEnd": "14:00"
  }'

# 4. Generar slots
curl -X POST http://localhost:3001/api/schedules/generate-slots \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": 16,
    "startDate": "2025-10-15",
    "endDate": "2025-11-15",
    "slotDuration": 60
  }'
```

---

## 📊 Validaciones y Reglas

### Validaciones del Sistema:

1. **Email único**: No puede haber dos usuarios con el mismo email
2. **Rol válido**: Solo puede ser `SPECIALIST` o `RECEPTIONIST_SPECIALIST`
3. **branchId requerido**: Siempre debe tener una sucursal principal
4. **Password seguro**: Mínimo 8 caracteres (recomendado: letras, números, símbolos)
5. **Phone opcional pero recomendado**: Para notificaciones SMS
6. **businessId automático**: Se asigna desde el token del usuario autenticado

### Restricciones de Precios Personalizados:

1. **customPrice > 0**: No puede ser negativo o cero
2. **serviceId debe existir**: El servicio debe estar creado previamente
3. **branchId debe estar asignado**: Solo puede configurar precios en sucursales asignadas
4. **Un precio por servicio-sucursal**: No puede duplicar la combinación

### Restricciones de Horarios:

1. **Formato de hora**: HH:MM (24 horas)
2. **Start < End**: La hora de inicio debe ser menor que la de fin
3. **Un horario activo por especialista-sucursal**: No puede tener múltiples horarios activos
4. **exceptionDates**: Array de fechas en formato YYYY-MM-DD
5. **vacationStart <= vacationEnd**: Fechas de vacaciones válidas

---

## 🔍 Consultas Útiles

### Listar Todos los Especialistas
```
GET /api/business/specialists?branchId=1
```

### Listar Solo RECEPTIONIST_SPECIALIST
```
GET /api/business/specialists?role=RECEPTIONIST_SPECIALIST
```

### Obtener Información Completa de un Especialista
```
GET /api/business/specialists/15
```

### Ver Horario de un Especialista
```
GET /api/schedules?specialistId=15&branchId=1
```

### Ver Disponibilidad Semanal
```
GET /api/schedules/15/weekly?date=2025-10-15
```

### Ver Disponibilidad Mensual
```
GET /api/schedules/15/monthly?year=2025&month=10
```

### Ver Slots Disponibles para Reservar
```
GET /api/time-slots/available?specialistId=15&date=2025-10-15&serviceId=10
```

---

## ⚠️ Errores Comunes

### Error 400: Email ya existe
```json
{
  "error": "El email ya está registrado"
}
```
**Solución:** Usar un email diferente

### Error 400: Rol inválido
```json
{
  "error": "El rol debe ser SPECIALIST o RECEPTIONIST_SPECIALIST"
}
```
**Solución:** Verificar que `role` sea exactamente `SPECIALIST` o `RECEPTIONIST_SPECIALIST`

### Error 404: Sucursal no encontrada
```json
{
  "error": "Branch not found"
}
```
**Solución:** Verificar que el `branchId` exista en la base de datos

### Error 403: Sin permisos
```json
{
  "error": "No autorizado"
}
```
**Solución:** Solo usuarios con rol `BUSINESS` u `OWNER` pueden crear especialistas

---

## 📝 Notas Importantes

1. **RECEPTIONIST_SPECIALIST** puede:
   - Acceder al módulo de recepción
   - Gestionar citas de todos los especialistas
   - Ver calendario multi-especialista
   - Tener su propio horario como especialista
   - Atender sus propias citas
   - Configurar precios personalizados para sus servicios

2. **Multi-Branch**:
   - Un especialista puede trabajar en múltiples sucursales
   - Los precios pueden ser diferentes por sucursal
   - Los horarios son específicos por sucursal
   - El calendario web filtra por sucursal con colores

3. **Precios Personalizados**:
   - Si no se configura, usa el precio base del servicio
   - Si se configura, usa el precio personalizado
   - Se puede activar/desactivar sin eliminar

4. **Generación de Slots**:
   - Se generan automáticamente desde el horario semanal
   - Respeta excepciones y vacaciones
   - Se pueden bloquear manualmente
   - Estados: AVAILABLE, BOOKED, BLOCKED, BREAK

---

## 🚀 Flujo Completo Recomendado

```
1. Crear Especialista/RECEPTIONIST_SPECIALIST
   ↓
2. Asignar Sucursales Adicionales (si aplica)
   ↓
3. Configurar Precios Personalizados (si aplica)
   ↓
4. Crear Horario Semanal
   ↓
5. Generar Slots Automáticos
   ↓
6. Sistema listo para recibir citas
```

---

**Documentación relacionada:**
- `MULTI_BRANCH_PRICING_IMPLEMENTATION.md` - Sistema multi-sucursal
- `CALENDAR_SYSTEM_REDUX.md` - Sistema de calendario
- `API_ENDPOINTS_UPDATED.md` - Lista completa de endpoints

**Fecha:** Octubre 2025  
**Versión:** 1.0.0
