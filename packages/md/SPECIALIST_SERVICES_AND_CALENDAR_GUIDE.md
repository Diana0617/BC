# 📘 Guía: Servicios de Especialistas y Calendario

## 📋 Índice
1. [Sistema de Servicios para Especialistas](#sistema-de-servicios-para-especialistas)
2. [Relaciones de Base de Datos](#relaciones-de-base-de-datos)
3. [Endpoints Disponibles](#endpoints-disponibles)
4. [Sistema de Calendario](#sistema-de-calendario)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Implementación en el Frontend](#implementación-en-el-frontend)

---

## 🎯 Sistema de Servicios para Especialistas

### ¿Cómo funciona?

El sistema usa una **tabla intermedia** (`specialist_services`) que conecta especialistas con servicios en una relación **muchos-a-muchos**. Esto permite:

- ✅ Un especialista puede ofrecer múltiples servicios
- ✅ Un servicio puede ser ofrecido por múltiples especialistas
- ✅ Cada especialista puede tener **precio personalizado** para cada servicio
- ✅ Cada especialista puede tener **nivel de habilidad** diferente para cada servicio
- ✅ Control de qué servicios se pueden reservar online por especialista

---

## 🗄️ Relaciones de Base de Datos

### Tablas Principales

#### 1️⃣ **users** (Especialistas)
```javascript
{
  id: UUID,
  firstName: String,
  lastName: String,
  email: String,
  role: 'SPECIALIST' | 'RECEPTIONIST_SPECIALIST',
  businessId: UUID
}
```

#### 2️⃣ **services** (Servicios del Negocio)
```javascript
{
  id: UUID,
  businessId: UUID,
  name: String,              // "Corte de Cabello"
  description: Text,
  price: Decimal(10,2),      // Precio BASE del servicio
  duration: Integer,         // Duración en minutos
  category: String,
  isActive: Boolean
}
```

#### 3️⃣ **specialist_services** (Tabla Intermedia)
```javascript
{
  id: UUID,
  specialistId: UUID,              // FK → users
  serviceId: UUID,                 // FK → services
  
  // PERSONALIZACIÓN POR ESPECIALISTA
  customPrice: Decimal(10,2),      // null = usa precio base del servicio
  skillLevel: ENUM,                // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  averageDuration: Integer,        // Duración promedio de ESTE especialista
  commissionPercentage: Decimal,   // Comisión específica para este servicio
  
  // CONFIGURACIÓN DE RESERVAS
  isActive: Boolean,               // Si el especialista ACTUALMENTE ofrece este servicio
  canBeBooked: Boolean,            // Si se puede reservar online
  requiresApproval: Boolean,       // Si requiere aprobación del especialista
  maxBookingsPerDay: Integer,      // Máximo de reservas diarias para ESTE servicio
  
  // METADATA
  assignedAt: Date,
  assignedBy: UUID,
  notes: Text
}
```

### Índices Únicos
```sql
UNIQUE (specialistId, serviceId) -- Un especialista no puede tener el mismo servicio duplicado
```

---

## 🔌 Endpoints Disponibles

### Base URL
```
/api/specialists/{specialistId}/services
```

### 1️⃣ **GET** - Listar Servicios del Especialista

**Ruta:** `GET /api/specialists/:specialistId/services`

**Query Params:**
- `isActive` (optional): `true` | `false`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-specialist-service-1",
      "specialistId": "uuid-specialist",
      "serviceId": "uuid-service-1",
      "customPrice": 35000,
      "skillLevel": "EXPERT",
      "averageDuration": 25,
      "commissionPercentage": 60,
      "isActive": true,
      "canBeBooked": true,
      "requiresApproval": false,
      "maxBookingsPerDay": 8,
      "service": {
        "id": "uuid-service-1",
        "name": "Corte de Cabello Masculino",
        "description": "Corte personalizado",
        "price": 30000,        // ← Precio BASE
        "duration": 30
      }
    }
  ]
}
```

> 💡 **Nota:** Si `customPrice` es `null`, se usa el precio del servicio (`service.price`)

---

### 2️⃣ **POST** - Asignar Servicio al Especialista

**Ruta:** `POST /api/specialists/:specialistId/services`

**Permisos:** Solo `BUSINESS` u `OWNER`

**Body:**
```json
{
  "serviceId": "uuid-service-1",           // ✅ REQUERIDO
  "customPrice": 35000,                    // null = usa precio base
  "skillLevel": "EXPERT",                  // BEGINNER | INTERMEDIATE | ADVANCED | EXPERT
  "averageDuration": 25,                   // Duración en minutos
  "commissionPercentage": 60,              // 0-100
  "canBeBooked": true,
  "requiresApproval": false,
  "maxBookingsPerDay": 8,
  "notes": "Especialista con 10 años de experiencia"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Servicio asignado exitosamente",
  "data": {
    "id": "uuid-specialist-service-1",
    "specialistId": "uuid-specialist",
    "serviceId": "uuid-service-1",
    "customPrice": 35000,
    "service": {
      "name": "Corte de Cabello Masculino"
    }
  }
}
```

**Errores Posibles:**
- `404`: Especialista o servicio no encontrado
- `409`: El servicio ya está asignado a este especialista
- `403`: No tienes permisos

---

### 3️⃣ **PUT** - Actualizar Configuración del Servicio

**Ruta:** `PUT /api/specialists/:specialistId/services/:serviceId`

**Permisos:** Solo `BUSINESS` u `OWNER`

**Body (todos los campos son opcionales):**
```json
{
  "customPrice": 40000,
  "isActive": true,
  "skillLevel": "EXPERT",
  "averageDuration": 20,
  "commissionPercentage": 65,
  "canBeBooked": true,
  "requiresApproval": true,
  "maxBookingsPerDay": 5,
  "notes": "Actualizado el precio"
}
```

---

### 4️⃣ **DELETE** - Quitar Servicio del Especialista

**Ruta:** `DELETE /api/specialists/:specialistId/services/:serviceId`

**Permisos:** Solo `BUSINESS` u `OWNER`

**Respuesta:**
```json
{
  "success": true,
  "message": "Servicio eliminado exitosamente"
}
```

> ⚠️ **Nota:** Esto **elimina permanentemente** la relación. Si quieres desactivar temporalmente, usa `PUT` con `isActive: false`

---

## 📅 Sistema de Calendario

### Dos Modelos de Calendario

#### 1️⃣ **Schedule** (Calendario General - RECOMENDADO)

**Tabla:** `schedules`

**Uso:** Horarios del negocio y especialistas con configuración avanzada

**Campos Principales:**
```javascript
{
  id: UUID,
  businessId: UUID,
  specialistId: UUID,           // null = horario general del negocio
  type: 'BUSINESS_DEFAULT' | 'SPECIALIST_CUSTOM' | 'TEMPORARY_OVERRIDE',
  name: String,                 // "Horario de Verano", "Horario de María"
  isActive: Boolean,
  isDefault: Boolean,           // Solo un horario default por especialista
  effectiveFrom: Date,          // Desde cuándo es efectivo
  effectiveTo: Date,            // Hasta cuándo es efectivo
  
  weeklySchedule: {             // JSONB con horarios por día
    monday: {
      enabled: true,
      shifts: [
        {
          start: "09:00",
          end: "18:00",
          breakStart: "12:00",
          breakEnd: "13:00"
        }
      ]
    },
    tuesday: { ... },
    // ... resto de días
  },
  
  slotDuration: 30,             // Duración de cada slot (minutos)
  bufferTime: 5,                // Tiempo entre citas (minutos)
  timezone: "America/Bogota",
  
  exceptions: [                 // Excepciones (vacaciones, días especiales)
    {
      date: "2025-12-25",
      type: "CLOSED",
      reason: "Navidad"
    }
  ]
}
```

**Ventajas:**
- ✅ Soporte para múltiples turnos por día
- ✅ Manejo de excepciones (vacaciones, días festivos)
- ✅ Horarios temporales
- ✅ Configuración de slots y buffer times
- ✅ Zonas horarias

---

#### 2️⃣ **SpecialistBranchSchedule** (Horario por Sucursal)

**Tabla:** `specialist_branch_schedules`

**Uso:** Cuando un especialista trabaja en múltiples sucursales con horarios diferentes

**Campos:**
```javascript
{
  id: UUID,
  specialistId: UUID,          // FK → specialist_profiles
  branchId: UUID,              // FK → branches
  dayOfWeek: 'monday' | 'tuesday' | ...,
  startTime: TIME,             // "09:00"
  endTime: TIME,               // "18:00"
  isActive: Boolean,
  priority: Integer,           // Para resolver conflictos
  notes: Text
}
```

**Índice Único:**
```sql
UNIQUE (specialistId, branchId, dayOfWeek)
```

**Ventajas:**
- ✅ Perfecto para multi-sucursal
- ✅ Un registro por día/sucursal
- ✅ Más simple que Schedule

---

### ¿Cuál Calendario Usar?

| Escenario | Modelo Recomendado |
|-----------|-------------------|
| Negocio con una sola sucursal | `Schedule` |
| Horarios con múltiples turnos | `Schedule` |
| Necesitas manejar excepciones | `Schedule` |
| Múltiples sucursales por especialista | `SpecialistBranchSchedule` |
| Configuración simple | `SpecialistBranchSchedule` |

> 💡 **Recomendación General:** Usa `Schedule` porque es más flexible y completo.

---

## 🎨 Ejemplos de Uso

### Ejemplo 1: Asignar Servicio a Especialista

```bash
# Paso 1: Obtener ID del especialista
GET /api/business/:businessId/config/specialists

# Paso 2: Obtener ID del servicio
GET /api/business/:businessId/config/services

# Paso 3: Asignar servicio al especialista
POST /api/specialists/uuid-specialist/services
{
  "serviceId": "uuid-service-corte",
  "customPrice": 35000,
  "skillLevel": "EXPERT",
  "commissionPercentage": 60
}
```

---

### Ejemplo 2: Listar Servicios de un Especialista

```bash
GET /api/specialists/uuid-specialist/services?isActive=true
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-ss-1",
      "customPrice": 35000,
      "service": {
        "name": "Corte de Cabello",
        "price": 30000
      }
    }
  ]
}
```

---

### Ejemplo 3: Crear Calendario para Especialista

```bash
POST /api/schedules
{
  "businessId": "uuid-business",
  "specialistId": "uuid-specialist",
  "type": "SPECIALIST_CUSTOM",
  "name": "Horario de María",
  "isDefault": true,
  "weeklySchedule": {
    "monday": {
      "enabled": true,
      "shifts": [
        {
          "start": "09:00",
          "end": "13:00"
        },
        {
          "start": "14:00",
          "end": "18:00"
        }
      ]
    },
    "tuesday": {
      "enabled": true,
      "shifts": [
        { "start": "09:00", "end": "18:00" }
      ]
    },
    "wednesday": { "enabled": false, "shifts": [] },
    "thursday": {
      "enabled": true,
      "shifts": [
        { "start": "09:00", "end": "18:00" }
      ]
    },
    "friday": {
      "enabled": true,
      "shifts": [
        { "start": "09:00", "end": "18:00" }
      ]
    },
    "saturday": {
      "enabled": true,
      "shifts": [
        { "start": "10:00", "end": "14:00" }
      ]
    },
    "sunday": { "enabled": false, "shifts": [] }
  },
  "slotDuration": 30,
  "bufferTime": 5,
  "exceptions": [
    {
      "date": "2025-12-25",
      "type": "CLOSED",
      "reason": "Navidad"
    }
  ]
}
```

---

### Ejemplo 4: Horario por Sucursal (Multi-Branch)

```bash
# Especialista trabaja en Sucursal A los lunes y martes
POST /api/specialist-branch-schedules
{
  "specialistId": "uuid-specialist",
  "branchId": "uuid-branch-a",
  "dayOfWeek": "monday",
  "startTime": "09:00",
  "endTime": "13:00"
}

# Y en Sucursal B los miércoles y jueves
POST /api/specialist-branch-schedules
{
  "specialistId": "uuid-specialist",
  "branchId": "uuid-branch-b",
  "dayOfWeek": "wednesday",
  "startTime": "14:00",
  "endTime": "20:00"
}
```

---

## 🖥️ Implementación en el Frontend

### Componente: Asignar Servicios al Especialista

```jsx
// ServicesAssignmentSection.jsx
const ServicesAssignmentSection = ({ specialistId }) => {
  const [availableServices, setAvailableServices] = useState([]);
  const [assignedServices, setAssignedServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  // Cargar servicios disponibles del negocio
  const loadAvailableServices = async () => {
    const response = await api.get(`/business/${businessId}/config/services`);
    setAvailableServices(response.data.data);
  };

  // Cargar servicios ya asignados al especialista
  const loadAssignedServices = async () => {
    const response = await api.get(`/specialists/${specialistId}/services`);
    setAssignedServices(response.data.data);
  };

  // Asignar nuevo servicio
  const handleAssignService = async (formData) => {
    try {
      await api.post(`/specialists/${specialistId}/services`, {
        serviceId: formData.serviceId,
        customPrice: formData.customPrice || null,
        skillLevel: formData.skillLevel || 'INTERMEDIATE',
        commissionPercentage: formData.commission || 50
      });
      
      await loadAssignedServices();
      setSuccess('✅ Servicio asignado correctamente');
    } catch (error) {
      setError(error.response?.data?.error);
    }
  };

  return (
    <div>
      <h3>Servicios del Especialista</h3>
      
      {/* Lista de servicios asignados */}
      <div>
        {assignedServices.map(ss => (
          <ServiceCard key={ss.id}>
            <h4>{ss.service.name}</h4>
            <p>Precio: ${ss.customPrice || ss.service.price}</p>
            <p>Nivel: {ss.skillLevel}</p>
            <p>Comisión: {ss.commissionPercentage}%</p>
            <button onClick={() => handleRemove(ss.serviceId)}>
              Quitar
            </button>
          </ServiceCard>
        ))}
      </div>

      {/* Formulario para asignar nuevo servicio */}
      <form onSubmit={handleAssignService}>
        <select name="serviceId">
          {availableServices.map(service => (
            <option key={service.id} value={service.id}>
              {service.name} (${service.price})
            </option>
          ))}
        </select>
        
        <input 
          type="number" 
          name="customPrice" 
          placeholder="Precio personalizado (opcional)"
        />
        
        <select name="skillLevel">
          <option value="BEGINNER">Principiante</option>
          <option value="INTERMEDIATE">Intermedio</option>
          <option value="ADVANCED">Avanzado</option>
          <option value="EXPERT">Experto</option>
        </select>
        
        <input 
          type="number" 
          name="commission" 
          placeholder="Comisión (%)"
          min="0"
          max="100"
        />
        
        <button type="submit">Asignar Servicio</button>
      </form>
    </div>
  );
};
```

---

### Componente: Calendario del Especialista

```jsx
// SpecialistScheduleSection.jsx
const SpecialistScheduleSection = ({ specialistId }) => {
  const [schedule, setSchedule] = useState(null);
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const dayLabels = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  const handleSaveSchedule = async (scheduleData) => {
    try {
      await api.post('/schedules', {
        businessId,
        specialistId,
        type: 'SPECIALIST_CUSTOM',
        name: `Horario de ${specialistName}`,
        isDefault: true,
        weeklySchedule: scheduleData,
        slotDuration: 30,
        bufferTime: 5
      });
      
      setSuccess('✅ Calendario guardado correctamente');
    } catch (error) {
      setError(error.response?.data?.error);
    }
  };

  return (
    <div>
      <h3>Calendario Semanal</h3>
      
      {daysOfWeek.map(day => (
        <DayScheduleRow key={day}>
          <label>{dayLabels[day]}</label>
          
          <input 
            type="checkbox"
            checked={schedule?.[day]?.enabled}
            onChange={(e) => toggleDay(day, e.target.checked)}
          />
          
          {schedule?.[day]?.enabled && (
            <div>
              {schedule[day].shifts.map((shift, index) => (
                <ShiftInput key={index}>
                  <input 
                    type="time" 
                    value={shift.start}
                    onChange={(e) => updateShift(day, index, 'start', e.target.value)}
                  />
                  <span>-</span>
                  <input 
                    type="time" 
                    value={shift.end}
                    onChange={(e) => updateShift(day, index, 'end', e.target.value)}
                  />
                  <button onClick={() => removeShift(day, index)}>❌</button>
                </ShiftInput>
              ))}
              
              <button onClick={() => addShift(day)}>
                ➕ Agregar Turno
              </button>
            </div>
          )}
        </DayScheduleRow>
      ))}
      
      <button onClick={() => handleSaveSchedule(schedule)}>
        Guardar Calendario
      </button>
    </div>
  );
};
```

---

## ✅ Checklist de Implementación

### Backend (Ya Implementado)
- ✅ Modelo `SpecialistService` creado
- ✅ Controlador `SpecialistServiceController` con CRUD completo
- ✅ Rutas registradas en `/api/specialists/:specialistId/services`
- ✅ Modelo `Schedule` para calendario avanzado
- ✅ Modelo `SpecialistBranchSchedule` para multi-sucursal
- ✅ Validaciones y permisos implementados

### Frontend (Por Implementar)
- ⬜ Sección de "Servicios" en el formulario de especialista
- ⬜ Lista de servicios asignados
- ⬜ Formulario para asignar nuevos servicios
- ⬜ Editor de precios personalizados
- ⬜ Sección de "Calendario" en el formulario de especialista
- ⬜ Editor de horarios semanales
- ⬜ Soporte para múltiples turnos por día
- ⬜ Gestión de excepciones (vacaciones, etc.)

---

## 🚀 Próximos Pasos

1. **Agregar tab "Servicios" en SpecialistsSection.jsx**
2. **Crear componente ServicesAssignmentSection**
3. **Agregar tab "Calendario" en SpecialistsSection.jsx**
4. **Crear componente ScheduleEditor**
5. **Probar flujo completo de asignación**

---

## 📞 Endpoints de Referencia

```
# SERVICIOS DE ESPECIALISTA
GET    /api/specialists/:specialistId/services
POST   /api/specialists/:specialistId/services
PUT    /api/specialists/:specialistId/services/:serviceId
DELETE /api/specialists/:specialistId/services/:serviceId

# CALENDARIO (Schedule)
GET    /api/schedules
POST   /api/schedules
PUT    /api/schedules/:scheduleId
DELETE /api/schedules/:scheduleId

# HORARIO POR SUCURSAL (SpecialistBranchSchedule)
# (Requiere implementar controlador y rutas)
GET    /api/specialist-branch-schedules
POST   /api/specialist-branch-schedules
PUT    /api/specialist-branch-schedules/:id
DELETE /api/specialist-branch-schedules/:id
```

---

## 🎯 Resumen

**Para agregar un servicio a un especialista:**
1. Usar endpoint `POST /api/specialists/:specialistId/services`
2. Pasar `serviceId` y configuración personalizada
3. El sistema crea registro en `specialist_services`

**Para crear calendario de especialista:**
1. Usar endpoint `POST /api/schedules`
2. Incluir `specialistId` y `weeklySchedule`
3. Configurar turnos, breaks, y excepciones

**Todo está listo en el backend** ✅ - Solo falta implementar la UI en el frontend.
