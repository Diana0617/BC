# Cómo Asignar Servicios a Especialistas

## Problema Identificado

Los especialistas se crearon sin servicios asignados, por lo que la tabla `specialist_services` está vacía. Esto causa que:
- El filtro de servicios por especialista no muestre nada
- Los especialistas no puedan realizar servicios en las citas

## Solución Implementada

### Backend ✅
Se modificó `BusinessConfigService.createSpecialist()` para aceptar `serviceIds` en el `profileData`:

```javascript
// En packages/backend/src/services/BusinessConfigService.js (línea ~430)
// Si se enviaron serviceIds, crear las relaciones en specialist_services
if (profileData.serviceIds && Array.isArray(profileData.serviceIds) && profileData.serviceIds.length > 0) {
  const SpecialistService = require('../models/SpecialistService');
  
  const serviceAssignments = profileData.serviceIds.map(serviceId => ({
    specialistId: profile.id,
    serviceId: serviceId,
    businessId: businessId,
    isActive: true
  }));
  
  await SpecialistService.bulkCreate(serviceAssignments, { transaction });
  console.log(`✅ ${serviceAssignments.length} servicios asignados al especialista ${profile.id}`);
}
```

### Frontend - Asignar Servicios a Especialistas Existentes

**Pasos en la Web App:**

1. **Ir a Configuración del Negocio**
   - Navega a `/business/profile` o haz clic en "Mi Negocio" en el menú

2. **Ir a Sección de Especialistas**
   - Haz clic en la pestaña "Especialistas"

3. **Editar el Especialista**
   - Encuentra el especialista que necesita servicios
   - Haz clic en el botón de editar (icono de lápiz)

4. **Ir a la Pestaña "Servicios"**
   - En el formulario de edición, verás 3 pestañas: Info, Servicios, Calendario
   - Haz clic en "Servicios"

5. **Asignar Servicio**
   - Verás dos secciones:
     - **Servicios Asignados**: Lista de servicios actuales (estará vacía)
     - **Asignar Nuevo Servicio**: Formulario para agregar servicios

6. **Completar el Formulario**
   - **Servicio*** (requerido): Selecciona un servicio del dropdown
   - **Precio Personalizado** (opcional): Si el especialista cobra diferente al precio base
   - **Nivel de Habilidad**: Principiante, Intermedio, Avanzado, Experto
   - **Comisión (%)** (opcional): Porcentaje de comisión específico para este servicio

7. **Guardar**
   - Haz clic en "Asignar Servicio"
   - Verás el mensaje: "✅ Servicio asignado correctamente"
   - El servicio aparecerá en la lista de "Servicios Asignados"

8. **Repetir para Más Servicios**
   - Puedes asignar múltiples servicios al mismo especialista
   - Solo aparecerán servicios que aún no están asignados

## Verificación

### Verificar en Base de Datos:
```sql
-- Ver servicios asignados a todos los especialistas
SELECT 
  sp.id as specialist_id,
  u.firstName || ' ' || u.lastName as specialist_name,
  s.name as service_name,
  ss.customPrice,
  ss.skillLevel,
  ss.isActive
FROM specialist_services ss
JOIN specialist_profiles sp ON ss.specialistId = sp.id
JOIN users u ON sp.userId = u.id
JOIN services s ON ss.serviceId = s.id
ORDER BY specialist_name, service_name;
```

### Verificar en la App Web:
1. Crear una nueva cita
2. Seleccionar un especialista
3. El dropdown de servicios debe mostrar solo los servicios de ese especialista

### Verificar en la App Móvil:
1. Abrir "Nueva Cita"
2. Seleccionar un especialista
3. Los servicios deben filtrarse automáticamente

## API Endpoints Relacionados

### Asignar Servicio a Especialista
```http
POST /api/business/:businessId/specialists/:specialistId/services
Content-Type: application/json

{
  "serviceId": "uuid-del-servicio",
  "customPrice": 150000,  // Opcional
  "skillLevel": "ADVANCED",  // Opcional: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  "commissionPercentage": 60  // Opcional
}
```

### Obtener Servicios de un Especialista
```http
GET /api/business/:businessId/specialists/:specialistId/services
```

### Quitar Servicio de un Especialista
```http
DELETE /api/business/:businessId/specialists/:specialistId/services/:serviceId
```

## Para Futuros Especialistas

Cuando se actualice el frontend para seleccionar servicios durante la **creación** (no solo edición), se enviará:

```javascript
// En el handleSubmit de SpecialistsSection.jsx
const profileData = {
  // ... otros campos ...
  serviceIds: ['uuid-servicio-1', 'uuid-servicio-2']  // IDs simples
};

await businessSpecialistsApi.createSpecialist(activeBusiness.id, {
  userData,
  profileData
});
```

El backend ya está preparado para recibir y procesar estos `serviceIds`.

## Mejora Futura Sugerida

Para facilitar la creación, se podría:
1. Agregar un paso 2.5 en el wizard de creación con un checklist de servicios
2. Permitir seleccionar múltiples servicios con checkboxes
3. Enviar los `serviceIds` en el payload inicial

Pero por ahora, el flujo de **crear primero → asignar servicios después** funciona perfectamente y ya está implementado.

## Resumen

✅ **Backend actualizado**: Acepta `serviceIds` en creación de especialistas
✅ **UI existente**: Permite asignar servicios en modo edición
✅ **APIs funcionando**: `assignServiceToSpecialist` y `removeServiceFromSpecialist`
⏳ **Pendiente**: Asignar servicios a los especialistas existentes vía UI web

---

**Siguiente paso**: Ve a la web app, edita cada especialista y asigna sus servicios correspondientes.
