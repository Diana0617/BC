# 🎨 Guía de Edición de Servicios en el Modal de Turnos

## 📱 Vista del Modal - Estado Normal

Cuando abres un turno en estado `IN_PROGRESS`, `CONFIRMED` o `PENDING`, verás la sección de servicios con un botón **"Editar"**:

```
┌─────────────────────────────────────────────────┐
│ 📋 Servicios                    [✏️ Editar]    │
├─────────────────────────────────────────────────┤
│                                                 │
│   ├─ Corte de Cabello                          │
│   │  Duración: 30 min                 $40,000  │
│                                                 │
│   ├─ Arreglo de Barba                          │
│   │  Duración: 30 min                 $35,000  │
│                                                 │
│   ────────────────────────────────────────────  │
│   Duración total: 60 min                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ✏️ Modo de Edición - Agregar/Quitar Servicios

Al hacer clic en **"Editar"**, el modal cambia a modo de edición:

```
┌─────────────────────────────────────────────────┐
│ 📋 Servicios                                    │
├─────────────────────────────────────────────────┤
│                                                 │
│ Servicios seleccionados:                        │
│                                                 │
│ ┌─────────────────────────────────────────┐    │
│ │ Corte de Cabello              [➖]      │    │
│ │ 30 min • $40,000                        │    │
│ └─────────────────────────────────────────┘    │
│                                                 │
│ ┌─────────────────────────────────────────┐    │
│ │ Arreglo de Barba              [➖]      │    │
│ │ 30 min • $35,000                        │    │
│ └─────────────────────────────────────────┘    │
│                                                 │
│ ─────────────────────────────────────────────  │
│                                                 │
│ Agregar servicios:                              │
│ ┌───────────────────────────────────────┐      │
│ │ 📦 Coloración              [➕]       │      │
│ │    45 min • $75,000                   │      │
│ │                                        │      │
│ │ 📦 Tratamiento Capilar     [➕]       │      │
│ │    60 min • $90,000                   │      │
│ │                                        │      │
│ │ 📦 Lavado Premium          [➕]       │      │
│ │    15 min • $15,000                   │      │
│ └───────────────────────────────────────┘      │
│                                                 │
│ ┌─────────────────────────────────────────┐    │
│ │ Resumen:                                │    │
│ │ Total servicios: 2                       │    │
│ │ Duración: 60 min  •  $75,000            │    │
│ └─────────────────────────────────────────┘    │
│                                                 │
│ [  Cancelar  ]  [ ✓ Guardar Cambios ]          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🎬 Flujo de Uso - Caso Real

### **Escenario: Juan Pérez decide agregar Coloración**

**1. Estado inicial del turno:**
- ✅ Corte de Cabello (30 min - $40,000)
- ✅ Arreglo de Barba (30 min - $35,000)
- **Total:** 60 min - $75,000

**2. Durante el turno, Juan dice:**
> "Me gustaría agregarme coloración"

**3. El especialista hace clic en** `[✏️ Editar]`

**4. Se muestra el modo de edición con:**
- Lista de servicios actuales (con botón ➖ para quitar)
- Lista de servicios disponibles (con botón ➕ para agregar)

**5. El especialista hace clic en** `[➕]` **junto a "Coloración"**

**6. El resumen se actualiza en tiempo real:**
```
┌─────────────────────────────────────┐
│ Resumen:                            │
│ Total servicios: 3                  │
│ Duración: 105 min  •  $150,000     │
└─────────────────────────────────────┘
```

**7. El especialista hace clic en** `[✓ Guardar Cambios]`

**8. El sistema:**
- ✅ Valida que no hay conflictos con la siguiente cita
- ✅ Actualiza la duración (60 min → 105 min)
- ✅ Actualiza el monto ($75,000 → $150,000)
- ✅ Recalcula `endTime` automáticamente
- ✅ Muestra notificación de éxito
- ✅ Vuelve a la vista normal con los 3 servicios

---

## ⚠️ Validaciones Automáticas

### **Conflicto de Horario Detectado**

Si agregar servicios causa conflicto con la siguiente cita:

```
┌─────────────────────────────────────────────────┐
│ ❌ Error                                         │
├─────────────────────────────────────────────────┤
│                                                 │
│ No se pueden agregar estos servicios.           │
│                                                 │
│ El nuevo horario (hasta 11:45) entra en         │
│ conflicto con otra cita a las 11:30             │
│                                                 │
│ Sugerencia: Reagendar la siguiente cita o       │
│ seleccionar menos servicios.                     │
│                                                 │
│              [   Entendido   ]                   │
└─────────────────────────────────────────────────┘
```

### **Sin Servicios Seleccionados**

Si intentas guardar sin servicios:

```
🔴 Debes tener al menos un servicio
```

### **Estado de Cita Bloqueado**

En citas `COMPLETED` o `CANCELED`, el botón **"Editar"** NO aparece.

---

## 🎨 Elementos Visuales

### **Iconos utilizados:**
- ✏️ `PencilSquareIcon` - Botón de editar
- ➕ `PlusCircleIcon` - Agregar servicio
- ➖ `MinusCircleIcon` - Quitar servicio
- ✅ `CheckCircleIcon` - Guardar cambios
- 📋 `TagIcon` - Sección de servicios

### **Colores por estado:**
- 🔵 Azul - Modo edición activo
- 🟢 Verde - Acción exitosa
- 🔴 Rojo - Quitar servicio / Error
- ⚪ Gris - Servicios disponibles

---

## 📊 Información en Tiempo Real

El **Resumen** se actualiza automáticamente mientras agregas/quitas servicios:

| Campo | Cálculo |
|-------|---------|
| **Total servicios** | Cantidad de servicios seleccionados |
| **Duración** | Suma de duraciones de todos los servicios |
| **Precio Total** | Suma de precios de todos los servicios |

---

## 🔄 Sincronización con Backend

Cuando haces clic en **"Guardar Cambios"**, se ejecuta:

```javascript
PUT /api/appointments/:id?businessId={bizId}
{
  "serviceIds": ["uuid1", "uuid2", "uuid3"]
}
```

**El backend:**
1. ✅ Valida servicios activos
2. ✅ Recalcula duración total
3. ✅ Recalcula precio total
4. ✅ Verifica conflictos de horario
5. ✅ Actualiza tabla `appointment_services`
6. ✅ Recalcula `endTime`
7. ✅ Retorna cita actualizada

**El frontend:**
1. ✅ Muestra loading indicator
2. ✅ Recibe respuesta exitosa
3. ✅ Recarga detalles de la cita
4. ✅ Cierra modo de edición
5. ✅ Muestra toast de éxito
6. ✅ Actualiza lista de turnos

---

## 💡 Casos de Uso Adicionales

### **Quitar un servicio que el cliente no quiere:**

1. Click en `[✏️ Editar]`
2. Click en `[➖]` junto al servicio a quitar
3. Revisar resumen actualizado
4. Click en `[✓ Guardar Cambios]`

### **Reemplazar todos los servicios:**

1. Click en `[✏️ Editar]`
2. Quitar todos los servicios actuales con `[➖]`
3. Agregar nuevos servicios con `[➕]`
4. Click en `[✓ Guardar Cambios]`

### **Cancelar edición sin guardar:**

1. Click en `[✏️ Editar]`
2. Hacer cambios
3. Click en `[Cancelar]`
4. Los cambios se descartan y vuelve a la vista normal

---

## 🎯 Beneficios para el Usuario

✅ **Flexibilidad Total** - Cambiar servicios sin salir del turno  
✅ **Visual e Intuitivo** - Interfaz clara con iconos y colores  
✅ **Validación Inmediata** - Errores claros antes de guardar  
✅ **Cálculos Automáticos** - Duración y precio en tiempo real  
✅ **Sin Conflictos** - Valida disponibilidad automáticamente  
✅ **Sincronización** - Cambios reflejados al instante  

---

## 🔒 Permisos y Seguridad

- ✅ Solo usuarios autenticados (`Bearer token`)
- ✅ Solo estados válidos: `PENDING`, `CONFIRMED`, `IN_PROGRESS`
- ✅ Validación de `businessId` para multi-tenancy
- ✅ Servicios deben pertenecer al negocio
- ❌ No permite editar citas `COMPLETED` o `CANCELED`

---

## 📱 Responsive Design

El modal se adapta a diferentes tamaños de pantalla:

- **Desktop:** Modal amplio con 2 columnas
- **Tablet:** Modal medio con 1.5 columnas
- **Mobile:** Modal completo (fullscreen) con scroll

---

## 🎬 Demo en Video

**Secuencia típica:**
1. ⏱️ 0:00 - Abrir turno existente
2. ⏱️ 0:03 - Click en "Editar" servicios
3. ⏱️ 0:05 - Agregar nuevo servicio
4. ⏱️ 0:08 - Ver resumen actualizado
5. ⏱️ 0:10 - Guardar cambios
6. ⏱️ 0:12 - Confirmación exitosa
7. ⏱️ 0:15 - Modal actualizado con nuevos servicios

**Tiempo total:** ~15 segundos ⚡

---

## 🐛 Debugging

Si algo no funciona, revisar:

1. **Console del navegador** - Errores de red
2. **Network tab** - Request/Response del PUT
3. **Toast notifications** - Mensajes de error
4. **Server logs** - Validaciones en backend

---

## 🚀 Próximas Mejoras

Posibles mejoras futuras:
- [ ] Drag & drop para reordenar servicios
- [ ] Aplicar descuento por servicio
- [ ] Sugerir servicios complementarios
- [ ] Historial de cambios en servicios
- [ ] Notificar al cliente por WhatsApp los cambios
