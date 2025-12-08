# ✅ Recordatorios de Consentimiento en Calendario - Plan de Implementación

## 📋 Requisitos

Cuando un especialista ve una cita en su calendario, debe poder ver:
1. ⚠️ Si la cita requiere consentimiento firmado
2. ✅ Estado actual del consentimiento (firmado/pendiente)
3. 🚫 Bloqueo o advertencia al intentar completar sin consentimiento

## 🔧 Cambios Necesarios

### 1. Backend - AppointmentController
- [ ] Incluir información de consentimientos en la respuesta de citas
- [ ] Agregar `service.consentTemplateId` a los includes
- [ ] Buscar si existe firma del cliente (`ConsentSignature`)
- [ ] Agregar campo `requiresConsent` y `consentSigned` en la respuesta

### 2. Frontend Web - FullCalendarView
- [ ] Mostrar icono de consentimiento en la cita
- [ ] Color o badge diferente si falta consentimiento
- [ ] Tooltip con estado del consentimiento

### 3. Mobile - Vista del Especialista
- [ ] Vista de cita con estado de consentimiento destacado
- [ ] Botón para solicitar firma de consentimiento
- [ ] Bloqueo de "Completar Cita" si falta consentimiento requerido

### 4. Modal de Detalle de Cita
- [ ] Sección de consentimientos
- [ ] Botón "Ver Consentimiento" si está firmado
- [ ] Botón "Solicitar Firma" si está pendiente
- [ ] Link directo al editor de consentimientos

## 📝 Estructura de Datos

```javascript
// Respuesta de la API de citas:
{
  id: 'cita-123',
  service: {
    id: 'servicio-456',
    name: 'Aplicación Botox',
    consentTemplateId: 'template-789' // null si no requiere
  },
  consentInfo: {
    required: true, // Si el servicio tiene template
    signed: false,  // Si existe ConsentSignature
    signatureId: null, // ID de la firma si existe
    signedAt: null,
    signedBy: null
  }
}
```

## 🎨 UI/UX

### Calendario:
```
┌─────────────────────────────┐
│ 09:00 - 09:30               │
│ Juan Pérez                  │
│ 👨‍⚕️ Dr. López              │
│ 💉 Aplicación Botox         │
│ ⚠️ Consentimiento pendiente │ <- Alerta visual
└─────────────────────────────┘
```

### Estados:
- ✅ Verde: Consentimiento firmado
- ⚠️ Amarillo: Consentimiento pendiente (pero no bloqueante)
- 🚫 Rojo: Consentimiento requerido y no firmado (bloquea completar)

### Modal de Completar Cita:
```
Si falta consentimiento requerido:
┌─────────────────────────────────────┐
│ ⚠️ Advertencia                      │
│ Esta cita requiere consentimiento   │
│ firmado antes de completarse.       │
│                                     │
│ [Ver Consentimiento]                │
│ [Solicitar Firma Ahora]             │
│ [Cancelar]                          │
└─────────────────────────────────────┘
```

## 🔄 Flujo de Trabajo

1. Especialista abre su calendario
2. Ve citas con indicadores de consentimiento
3. Al hacer click en una cita:
   - Si no requiere consentimiento → Normal
   - Si requiere y está firmado → Muestra check verde
   - Si requiere y NO está firmado → Muestra advertencia
4. Al intentar completar:
   - Valida consentimiento
   - Si falta, muestra modal de advertencia
   - Ofrece solicitar firma directamente

## 📱 Integración Mobile

### Notificación Push (futuro):
```
"Recordatorio: Juan Pérez tiene cita a las 09:00"
"⚠️ Falta firmar consentimiento de Botox"
[Ver Detalles] [Enviar Link de Firma]
```

## 🚀 Prioridades

**ALTA** (para la demo):
- [x] Editor de consentimientos funcionando
- [ ] Mostrar estado en calendario web
- [ ] Advertencia al completar sin firma

**MEDIA** (post-demo):
- [ ] Vista mobile del especialista
- [ ] Solicitar firma desde la app
- [ ] Recordatorios automáticos

**BAJA** (futuro):
- [ ] Notificaciones push
- [ ] Firma desde WhatsApp/Email
- [ ] Dashboard de consentimientos pendientes

---

**Nota**: El editor de consentimientos ya está funcionando. Solo falta conectarlo con el flujo de citas y recordatorios visuales.
