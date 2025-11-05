# 🎯 Resumen: Sistema de Servicios y Calendario de Especialistas

## ✅ Lo que YA está implementado en el BACKEND

### 1. **Servicios de Especialistas** ✅ COMPLETO

#### Modelo: `SpecialistService` 
**Tabla:** `specialist_services`

**Funcionalidad:**
- Relación muchos-a-muchos entre `users` (especialistas) y `services`
- Cada especialista puede tener precio personalizado por servicio
- Control de nivel de habilidad (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- Configuración de reservas online
- Sistema de comisiones por servicio

#### Endpoints Disponibles:
```
GET    /api/specialists/:specialistId/services
POST   /api/specialists/:specialistId/services
PUT    /api/specialists/:specialistId/services/:serviceId
DELETE /api/specialists/:specialistId/services/:serviceId
```

#### Controlador: `SpecialistServiceController.js`
**Métodos:**
- ✅ `getSpecialistServices()` - Listar servicios del especialista
- ✅ `assignServiceToSpecialist()` - Asignar servicio
- ✅ `updateSpecialistService()` - Actualizar configuración
- ✅ `removeServiceFromSpecialist()` - Quitar servicio

#### Campos Disponibles:
```javascript
{
  customPrice: Decimal(10,2),           // null = usa precio base
  skillLevel: ENUM,                     // Nivel de habilidad
  averageDuration: Integer,             // Duración promedio
  commissionPercentage: Decimal(5,2),   // Comisión específica
  isActive: Boolean,                    // Si está activo
  canBeBooked: Boolean,                 // Si se puede reservar online
  requiresApproval: Boolean,            // Si requiere aprobación
  maxBookingsPerDay: Integer,           // Máximo de reservas diarias
  notes: Text                           // Notas
}
```

---

### 2. **Sistema de Calendario** ✅ COMPLETO

#### Modelo Principal: `Schedule`
**Tabla:** `schedules`

**Funcionalidad:**
- Horarios del negocio y especialistas
- Soporte para múltiples turnos por día
- Excepciones (vacaciones, días festivos)
- Horarios temporales
- Configuración de slots y tiempos de buffer
- Zonas horarias

#### Endpoints Disponibles:
```
GET    /api/schedules
POST   /api/schedules
GET    /api/schedules/:scheduleId
PUT    /api/schedules/:scheduleId
DELETE /api/schedules/:scheduleId
POST   /api/schedules/:scheduleId/generate-slots
POST   /api/schedules/bulk-generate
GET    /api/schedules/agenda/weekly
GET    /api/schedules/agenda/monthly
POST   /api/schedules/validate-weekly
POST   /api/schedules/:scheduleId/clone
GET    /api/schedules/templates
POST   /api/schedules/from-template
```

#### Controlador: `ScheduleController.js`
**Métodos:**
- ✅ `createSchedule()` - Crear horario
- ✅ `getSchedules()` - Listar horarios
- ✅ `getScheduleDetail()` - Detalle del horario
- ✅ `updateSchedule()` - Actualizar
- ✅ `deleteSchedule()` - Eliminar
- ✅ `generateSlots()` - Generar slots de tiempo
- ✅ `bulkGenerateSlots()` - Generar masivamente
- ✅ `getWeeklyAgenda()` - Agenda semanal
- ✅ `getMonthlyAgenda()` - Agenda mensual
- ✅ `validateWeeklySchedule()` - Validar configuración
- ✅ `cloneSchedule()` - Clonar horario
- ✅ `getScheduleTemplates()` - Plantillas
- ✅ `createFromTemplate()` - Crear desde plantilla

#### Estructura del Horario Semanal:
```javascript
{
  businessId: UUID,
  specialistId: UUID,              // null = horario del negocio
  type: 'BUSINESS_DEFAULT' | 'SPECIALIST_CUSTOM' | 'TEMPORARY_OVERRIDE',
  name: String,                    // "Horario de María"
  isActive: Boolean,
  isDefault: Boolean,
  effectiveFrom: Date,
  effectiveTo: Date,
  
  weeklySchedule: {
    monday: {
      enabled: true,
      shifts: [
        {
          start: "09:00",
          end: "13:00",
          breakStart: "12:00",
          breakEnd: "12:30"
        },
        {
          start: "14:00",
          end: "18:00"
        }
      ]
    },
    tuesday: { ... },
    // ... resto de días
  },
  
  slotDuration: 30,               // Duración de cada slot
  bufferTime: 5,                  // Tiempo entre citas
  timezone: "America/Bogota",
  
  exceptions: [
    {
      date: "2025-12-25",
      type: "CLOSED",
      reason: "Navidad"
    }
  ]
}
```

---

### 3. **Modelo Alternativo: `SpecialistBranchSchedule`** ✅ EXISTE
**Tabla:** `specialist_branch_schedules`

**Funcionalidad:**
- Horarios por sucursal
- Para especialistas que trabajan en múltiples sucursales
- Un registro por día/sucursal

**Estructura:**
```javascript
{
  specialistId: UUID,
  branchId: UUID,
  dayOfWeek: 'monday' | 'tuesday' | ...,
  startTime: TIME,
  endTime: TIME,
  isActive: Boolean,
  priority: Integer,
  notes: Text
}
```

> ⚠️ **Nota:** Este modelo existe pero NO tiene controlador ni rutas implementadas aún.

---

## ⬜ Lo que FALTA implementar en el FRONTEND

### 1. **Sección de Servicios en Especialista**

Agregar un **tab "Servicios"** en `SpecialistsSection.jsx` con:

#### Vista de Lista:
- ✅ Mostrar servicios ya asignados al especialista
- ✅ Precio personalizado vs precio base
- ✅ Nivel de habilidad
- ✅ Comisión
- ✅ Estado (activo/inactivo)
- ✅ Botón para quitar servicio

#### Formulario de Asignación:
- ✅ Dropdown de servicios disponibles
- ✅ Campo de precio personalizado (opcional)
- ✅ Selector de nivel de habilidad
- ✅ Campo de comisión (%)
- ✅ Checkbox "Puede reservarse online"
- ✅ Campo de máximo reservas por día

---

### 2. **Sección de Calendario en Especialista**

Agregar un **tab "Calendario"** en `SpecialistsSection.jsx` con:

#### Editor de Horario Semanal:
- ✅ 7 filas (una por día de la semana)
- ✅ Checkbox para activar/desactivar día
- ✅ Soporte para múltiples turnos por día
  - Campo de hora inicio
  - Campo de hora fin
  - Botón para agregar turno adicional
  - Botón para quitar turno
- ✅ Campo de tiempo de break (opcional)

#### Configuración Adicional:
- ✅ Duración de cada slot (15, 30, 45, 60 minutos)
- ✅ Tiempo de buffer entre citas
- ✅ Fecha de inicio/fin (opcional)

#### Gestión de Excepciones:
- ✅ Lista de fechas especiales
- ✅ Formulario para agregar excepción
  - Fecha
  - Tipo (cerrado, horario especial)
  - Razón/notas

---

## 🚀 Pasos para Implementar

### Paso 1: Agregar Tab "Servicios" al Formulario

```jsx
// En SpecialistsSection.jsx
const [currentTab, setCurrentTab] = useState('info'); // 'info' | 'services' | 'calendar'

<Tabs>
  <Tab active={currentTab === 'info'} onClick={() => setCurrentTab('info')}>
    Información
  </Tab>
  <Tab active={currentTab === 'services'} onClick={() => setCurrentTab('services')}>
    Servicios
  </Tab>
  <Tab active={currentTab === 'calendar'} onClick={() => setCurrentTab('calendar')}>
    Calendario
  </Tab>
</Tabs>

{currentTab === 'info' && renderInfoForm()}
{currentTab === 'services' && renderServicesSection()}
{currentTab === 'calendar' && renderCalendarSection()}
```

### Paso 2: Crear Componente de Servicios

```jsx
const renderServicesSection = () => {
  return (
    <ServicesSection>
      {/* Lista de servicios asignados */}
      <AssignedServices>
        {specialistServices.map(ss => (
          <ServiceCard key={ss.id}>
            <h4>{ss.service.name}</h4>
            <Price>
              {ss.customPrice 
                ? `$${ss.customPrice} (personalizado)` 
                : `$${ss.service.price} (precio base)`
              }
            </Price>
            <Level>Nivel: {ss.skillLevel}</Level>
            <Commission>Comisión: {ss.commissionPercentage}%</Commission>
            <RemoveButton onClick={() => removeService(ss.serviceId)}>
              Quitar
            </RemoveButton>
          </ServiceCard>
        ))}
      </AssignedServices>

      {/* Formulario para asignar nuevo servicio */}
      <AddServiceForm onSubmit={handleAssignService}>
        <Select name="serviceId">
          {availableServices.map(service => (
            <option key={service.id} value={service.id}>
              {service.name} - ${service.price}
            </option>
          ))}
        </Select>
        
        <Input 
          type="number" 
          name="customPrice" 
          placeholder="Precio personalizado (opcional)"
        />
        
        <Select name="skillLevel">
          <option value="BEGINNER">Principiante</option>
          <option value="INTERMEDIATE">Intermedio</option>
          <option value="ADVANCED">Avanzado</option>
          <option value="EXPERT">Experto</option>
        </Select>
        
        <Input 
          type="number" 
          name="commissionPercentage" 
          placeholder="Comisión %"
        />
        
        <Button type="submit">Asignar Servicio</Button>
      </AddServiceForm>
    </ServicesSection>
  );
};
```

### Paso 3: Crear Componente de Calendario

```jsx
const renderCalendarSection = () => {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = {
    monday: 'Lunes',
    tuesday: 'Martes',
    // ... resto
  };

  return (
    <CalendarSection>
      <h3>Horario Semanal</h3>
      
      {daysOfWeek.map(day => (
        <DayRow key={day}>
          <DayLabel>{dayLabels[day]}</DayLabel>
          
          <Checkbox 
            checked={schedule?.[day]?.enabled}
            onChange={(e) => toggleDay(day, e.target.checked)}
          />
          
          {schedule?.[day]?.enabled && (
            <ShiftsContainer>
              {schedule[day].shifts.map((shift, index) => (
                <ShiftRow key={index}>
                  <TimeInput 
                    type="time" 
                    value={shift.start}
                    onChange={(e) => updateShift(day, index, 'start', e.target.value)}
                  />
                  <span>-</span>
                  <TimeInput 
                    type="time" 
                    value={shift.end}
                    onChange={(e) => updateShift(day, index, 'end', e.target.value)}
                  />
                  <RemoveButton onClick={() => removeShift(day, index)}>
                    ❌
                  </RemoveButton>
                </ShiftRow>
              ))}
              
              <AddShiftButton onClick={() => addShift(day)}>
                ➕ Agregar Turno
              </AddShiftButton>
            </ShiftsContainer>
          )}
        </DayRow>
      ))}
      
      <SaveButton onClick={handleSaveSchedule}>
        Guardar Calendario
      </SaveButton>
    </CalendarSection>
  );
};
```

### Paso 4: Implementar Funciones de Servicios

```javascript
// Cargar servicios del especialista
const loadSpecialistServices = async (specialistId) => {
  try {
    const response = await api.get(`/specialists/${specialistId}/services`);
    setSpecialistServices(response.data.data);
  } catch (error) {
    console.error('Error cargando servicios:', error);
  }
};

// Asignar servicio
const handleAssignService = async (formData) => {
  try {
    await api.post(`/specialists/${editingSpecialist.id}/services`, {
      serviceId: formData.serviceId,
      customPrice: formData.customPrice || null,
      skillLevel: formData.skillLevel || 'INTERMEDIATE',
      commissionPercentage: parseFloat(formData.commissionPercentage) || 50
    });
    
    await loadSpecialistServices(editingSpecialist.id);
    setSuccess('✅ Servicio asignado correctamente');
  } catch (error) {
    setError(error.response?.data?.error || 'Error al asignar servicio');
  }
};

// Quitar servicio
const removeService = async (serviceId) => {
  if (!confirm('¿Quitar este servicio del especialista?')) return;
  
  try {
    await api.delete(`/specialists/${editingSpecialist.id}/services/${serviceId}`);
    await loadSpecialistServices(editingSpecialist.id);
    setSuccess('✅ Servicio quitado correctamente');
  } catch (error) {
    setError(error.response?.data?.error);
  }
};
```

### Paso 5: Implementar Funciones de Calendario

```javascript
// Cargar calendario del especialista
const loadSpecialistSchedule = async (specialistId) => {
  try {
    const response = await api.get('/schedules', {
      params: { 
        specialistId,
        type: 'SPECIALIST_CUSTOM'
      }
    });
    
    if (response.data.data.length > 0) {
      setSchedule(response.data.data[0].weeklySchedule);
    } else {
      // Inicializar con horario vacío
      setSchedule(getDefaultWeeklySchedule());
    }
  } catch (error) {
    console.error('Error cargando calendario:', error);
  }
};

// Guardar calendario
const handleSaveSchedule = async () => {
  try {
    const scheduleData = {
      businessId: user.businessId,
      specialistId: editingSpecialist.id,
      type: 'SPECIALIST_CUSTOM',
      name: `Horario de ${editingSpecialist.firstName} ${editingSpecialist.lastName}`,
      isDefault: true,
      weeklySchedule: schedule,
      slotDuration: 30,
      bufferTime: 5,
      timezone: 'America/Bogota'
    };
    
    // Si ya existe un horario, actualizar; si no, crear
    if (existingScheduleId) {
      await api.put(`/schedules/${existingScheduleId}`, scheduleData);
    } else {
      await api.post('/schedules', scheduleData);
    }
    
    setSuccess('✅ Calendario guardado correctamente');
  } catch (error) {
    setError(error.response?.data?.error || 'Error al guardar calendario');
  }
};

// Toggle día
const toggleDay = (day, enabled) => {
  setSchedule(prev => ({
    ...prev,
    [day]: {
      enabled,
      shifts: enabled ? [{ start: '09:00', end: '18:00' }] : []
    }
  }));
};

// Agregar turno
const addShift = (day) => {
  setSchedule(prev => ({
    ...prev,
    [day]: {
      ...prev[day],
      shifts: [
        ...prev[day].shifts,
        { start: '09:00', end: '18:00' }
      ]
    }
  }));
};

// Actualizar turno
const updateShift = (day, index, field, value) => {
  setSchedule(prev => {
    const newShifts = [...prev[day].shifts];
    newShifts[index][field] = value;
    
    return {
      ...prev,
      [day]: {
        ...prev[day],
        shifts: newShifts
      }
    };
  });
};

// Quitar turno
const removeShift = (day, index) => {
  setSchedule(prev => ({
    ...prev,
    [day]: {
      ...prev[day],
      shifts: prev[day].shifts.filter((_, i) => i !== index)
    }
  }));
};
```

---

## 📊 Resumen de Estado

### Backend ✅ COMPLETO
- ✅ Modelos creados
- ✅ Controladores implementados
- ✅ Rutas registradas
- ✅ Validaciones en su lugar
- ✅ Permisos configurados
- ✅ Relaciones de base de datos

### Frontend ⬜ PENDIENTE
- ⬜ Tab "Servicios" en formulario de especialista
- ⬜ Componente de lista de servicios asignados
- ⬜ Formulario de asignación de servicios
- ⬜ Tab "Calendario" en formulario de especialista
- ⬜ Editor de horario semanal
- ⬜ Soporte para múltiples turnos
- ⬜ Gestión de excepciones

---

## 🎯 Próximos Pasos Recomendados

1. **Modificar `SpecialistsSection.jsx`:**
   - Agregar sistema de tabs
   - Implementar tab "Servicios"
   - Implementar tab "Calendario"

2. **Crear APIs en el frontend:**
   - `businessSpecialistsApi.getServices(specialistId)`
   - `businessSpecialistsApi.assignService(specialistId, data)`
   - `businessSpecialistsApi.updateService(specialistId, serviceId, data)`
   - `businessSpecialistsApi.removeService(specialistId, serviceId)`
   - `schedulesApi.getSchedule(specialistId)`
   - `schedulesApi.saveSchedule(data)`

3. **Probar flujo completo:**
   - Crear especialista
   - Asignar servicios
   - Configurar calendario
   - Verificar que todo se guarda correctamente

---

## 🔗 Documentación Completa

Ver archivo: `SPECIALIST_SERVICES_AND_CALENDAR_GUIDE.md` para ejemplos detallados y código completo.
