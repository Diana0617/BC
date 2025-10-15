# 📋 Guía de Validaciones de Citas - Beauty Control

## 🎯 Descripción General

El sistema de citas incluye **validaciones integrales** que aseguran que las reglas de negocio configuradas por cada empresa se cumplan antes de permitir acciones críticas como:

- ✅ Completar una cita
- 📅 Reprogramar una cita
- ✏️ Actualizar una cita

---

## 🔐 Validaciones de Consentimiento (FM-26 Integration)

### ¿Cuándo se valida el consentimiento?

Cuando un **servicio/procedimiento** tiene marcado `requiresConsent = true`, el sistema valida que:

1. El cliente haya firmado el consentimiento (`Appointment.hasConsent = true`)
2. Exista una fecha de firma válida (`Appointment.consentSignedAt`)
3. El registro de firma exista en la tabla `consent_signatures` (si hay `consentTemplateId`)
4. La firma no esté revocada (`status !== 'REVOKED'`)

### Ejemplo de Configuración

```sql
-- Servicio que requiere consentimiento
UPDATE services 
SET 
  requires_consent = true,
  consent_template_id = 'uuid-del-template-toxina-botulinica'
WHERE name = 'Aplicación de Toxina Botulínica';
```

### Respuesta de Error

Si intentas completar una cita SIN consentimiento firmado:

```json
{
  "success": false,
  "error": "No se puede completar la cita",
  "validationErrors": [
    "Esta cita requiere consentimiento informado firmado"
  ]
}
```

---

## 📸 Validaciones de Evidencia Fotográfica

### Reglas de Negocio Disponibles

El sistema soporta 3 tipos de reglas de evidencia:

| Código de Regla | Descripción | Validación |
|----------------|-------------|------------|
| `REQUIRE_BEFORE_PHOTO` | Exige al menos 1 foto "antes" del procedimiento | `evidence.before.length > 0` |
| `REQUIRE_AFTER_PHOTO` | Exige al menos 1 foto "después" del procedimiento | `evidence.after.length > 0` |
| `REQUIRE_BOTH_PHOTOS` | Exige ambas fotos (antes y después) | Ambas condiciones anteriores |

### Ejemplo de Configuración

```sql
-- Activar regla que requiere ambas fotos
INSERT INTO business_rules (
  business_id,
  rule_template_id,
  is_active,
  notes
) VALUES (
  'uuid-del-negocio',
  (SELECT id FROM rule_templates WHERE code = 'REQUIRE_BOTH_PHOTOS'),
  true,
  'Obligatorio para procedimientos estéticos'
);
```

### Respuesta de Error

```json
{
  "success": false,
  "error": "No se puede completar la cita",
  "validationErrors": [
    "Se requiere foto \"antes\" del procedimiento",
    "Se requiere foto \"después\" del procedimiento"
  ]
}
```

---

## 💰 Validaciones de Pago

### Reglas de Negocio Disponibles

| Código de Regla | Descripción | Validación |
|----------------|-------------|------------|
| `REQUIRE_FULL_PAYMENT` | Exige pago completo antes de completar | `pendingAmount === 0` |
| `REQUIRE_MINIMUM_PAYMENT` | Exige pago mínimo (% configurable) | `paidAmount >= (totalAmount * minPercentage / 100)` |

### Ejemplo de Configuración

```sql
-- Requiere pago mínimo del 50%
INSERT INTO business_rules (
  business_id,
  rule_template_id,
  custom_value, -- 👈 Sobrescribe el valor default
  is_active
) VALUES (
  'uuid-del-negocio',
  (SELECT id FROM rule_templates WHERE code = 'REQUIRE_MINIMUM_PAYMENT'),
  '{"minPercentage": 50}', -- 50% mínimo
  true
);
```

### Respuesta de Error

```json
{
  "success": false,
  "error": "No se puede completar la cita",
  "validationErrors": [
    "Se requiere pago mínimo del 50% ($50,000). Pagado: $30,000"
  ],
  "warnings": []
}
```

---

## ⏱️ Validaciones de Duración

### Reglas de Negocio Disponibles

| Código de Regla | Descripción | Validación |
|----------------|-------------|------------|
| `MINIMUM_DURATION` | Alerta si la cita duró menos del tiempo esperado | `durationMinutes >= minMinutes` (⚠️ warning) |
| `MAXIMUM_DURATION` | Alerta si la cita excedió el tiempo máximo | `durationMinutes <= maxMinutes` (⚠️ warning) |

**Nota:** Estas validaciones generan **warnings**, NO errores bloqueantes.

### Ejemplo de Configuración

```sql
-- Duración mínima de 30 minutos
INSERT INTO business_rules (
  business_id,
  rule_template_id,
  custom_value,
  is_active
) VALUES (
  'uuid-del-negocio',
  (SELECT id FROM rule_templates WHERE code = 'MINIMUM_DURATION'),
  '{"minMinutes": 30}',
  true
);
```

### Respuesta con Warning

```json
{
  "success": true,
  "message": "Cita completada exitosamente",
  "data": { /* appointment data */ },
  "warnings": [
    "La cita ha durado solo 15 minutos (mínimo recomendado: 30)"
  ]
}
```

---

## 🔄 Flujo de Validación Completo

### 1️⃣ Completar Cita (PATCH /api/appointments/:id/complete)

```javascript
// Endpoint: PATCH /api/appointments/:id/complete?businessId={bizId}
// Body: { rating?: number, feedback?: string, finalAmount?: number }

// ✅ Validaciones ejecutadas:
// 1. Verificar estado de la cita (debe ser CONFIRMED o IN_PROGRESS)
// 2. Validar consentimiento (si Service.requiresConsent === true)
//    - Appointment.hasConsent debe ser true
//    - Debe existir firma válida en consent_signatures
// 3. Validar evidencia fotográfica (según reglas del negocio)
//    - REQUIRE_BEFORE_PHOTO
//    - REQUIRE_AFTER_PHOTO
//    - REQUIRE_BOTH_PHOTOS
// 4. Validar pago (según reglas del negocio)
//    - REQUIRE_FULL_PAYMENT
//    - REQUIRE_MINIMUM_PAYMENT
// 5. Validar duración (warnings)
//    - MINIMUM_DURATION
//    - MAXIMUM_DURATION
// 6. Calcular comisión si está configurada (FM-26)
// 7. Actualizar status = 'COMPLETED', completedAt = NOW()
```

**Ejemplo de Request:**

```bash
curl -X PATCH \
  'http://localhost:5000/api/appointments/uuid-cita/complete?businessId=uuid-biz' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "rating": 5,
    "feedback": "Excelente servicio",
    "finalAmount": 120000
  }'
```

**Ejemplo de Respuesta Exitosa:**

```json
{
  "success": true,
  "message": "Cita completada exitosamente",
  "data": {
    "id": "uuid-cita",
    "status": "COMPLETED",
    "completedAt": "2024-01-20T15:30:00Z",
    "totalAmount": 120000,
    "rating": 5,
    "feedback": "Excelente servicio",
    "specialistCommission": 72000,
    "businessCommission": 48000,
    "Service": { /* service data */ },
    "Client": { /* client data */ }
  },
  "warnings": []
}
```

**Ejemplo de Respuesta con Error:**

```json
{
  "success": false,
  "error": "No se puede completar la cita",
  "validationErrors": [
    "Esta cita requiere consentimiento informado firmado",
    "Se requiere foto \"antes\" del procedimiento",
    "Se requiere foto \"después\" del procedimiento",
    "Se requiere pago mínimo del 50% ($60,000). Pagado: $40,000"
  ],
  "warnings": [
    "La cita ha durado solo 20 minutos (mínimo recomendado: 30)"
  ]
}
```

---

### 2️⃣ Reprogramar Cita (POST /api/appointments/:id/reschedule)

```javascript
// Endpoint: POST /api/appointments/:id/reschedule?businessId={bizId}
// Body: { newStartTime: ISO, newEndTime: ISO, reason?: string }

// ✅ Validaciones ejecutadas:
// 1. Verificar estado (no puede ser COMPLETED ni CANCELED)
// 2. Validar que newStartTime sea en el futuro
// 3. Validar que endTime > startTime
// 4. Verificar disponibilidad del especialista en nuevo horario
// 5. Advertir si ya ha sido reprogramada muchas veces (warning)
// 6. Guardar historial de reprogramación
```

**Ejemplo de Request:**

```bash
curl -X POST \
  'http://localhost:5000/api/appointments/uuid-cita/reschedule?businessId=uuid-biz' \
  -H 'Authorization: Bearer TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "newStartTime": "2024-01-25T14:00:00Z",
    "newEndTime": "2024-01-25T15:30:00Z",
    "reason": "Cliente solicitó cambio de horario"
  }'
```

**Ejemplo de Respuesta con Advertencia:**

```json
{
  "success": true,
  "message": "Cita reprogramada exitosamente",
  "data": {
    "id": "uuid-cita",
    "status": "RESCHEDULED",
    "startTime": "2024-01-25T14:00:00Z",
    "endTime": "2024-01-25T15:30:00Z",
    "rescheduleHistory": [
      {
        "oldStartTime": "2024-01-20T10:00:00Z",
        "newStartTime": "2024-01-22T11:00:00Z",
        "reason": "Cambio de horario",
        "rescheduledAt": "2024-01-19T09:00:00Z"
      },
      {
        "oldStartTime": "2024-01-22T11:00:00Z",
        "newStartTime": "2024-01-25T14:00:00Z",
        "reason": "Cliente solicitó cambio de horario",
        "rescheduledAt": "2024-01-20T10:00:00Z"
      }
    ]
  },
  "warnings": [
    "Esta cita ya ha sido reprogramada 3 veces"
  ]
}
```

---

### 3️⃣ Actualizar Cita (PUT /api/appointments/:id)

```javascript
// Endpoint: PUT /api/appointments/:id?businessId={bizId}
// Body: { startTime?, endTime?, serviceId?, specialistId?, notes?, branchId? }

// ✅ Validaciones ejecutadas:
// 1. Verificar estado (no puede ser COMPLETED ni CANCELED)
// 2. Si cambia horario: validar disponibilidad del especialista
// 3. Si cambia servicio: validar que esté activo y actualizar precio
// 4. Si cambia especialista: validar que tenga acceso a la sucursal
// 5. Si cambia sucursal: validar que exista y esté activa
```

---

## 🛠️ Configuración de Reglas en la Base de Datos

### Paso 1: Crear Templates de Reglas (Seed Inicial)

```sql
-- Insertar templates de reglas del sistema
INSERT INTO rule_templates (code, name, category, description, value_type, default_value) VALUES
('REQUIRE_CONSENT_FOR_COMPLETION', 'Consentimiento Obligatorio', 'APPOINTMENT', 'Requiere consentimiento firmado antes de completar', 'BOOLEAN', 'true'),
('REQUIRE_BEFORE_PHOTO', 'Foto Antes Obligatoria', 'APPOINTMENT', 'Requiere foto antes del procedimiento', 'BOOLEAN', 'true'),
('REQUIRE_AFTER_PHOTO', 'Foto Después Obligatoria', 'APPOINTMENT', 'Requiere foto después del procedimiento', 'BOOLEAN', 'true'),
('REQUIRE_BOTH_PHOTOS', 'Fotos Antes y Después Obligatorias', 'APPOINTMENT', 'Requiere ambas fotos del procedimiento', 'BOOLEAN', 'true'),
('REQUIRE_FULL_PAYMENT', 'Pago Completo Obligatorio', 'PAYMENT', 'Requiere pago completo antes de completar', 'BOOLEAN', 'true'),
('REQUIRE_MINIMUM_PAYMENT', 'Pago Mínimo Obligatorio', 'PAYMENT', 'Requiere pago mínimo (porcentaje)', 'NUMBER', '50'),
('MINIMUM_DURATION', 'Duración Mínima', 'TIME', 'Alerta si la cita dura menos del tiempo especificado', 'NUMBER', '30'),
('MAXIMUM_DURATION', 'Duración Máxima', 'TIME', 'Alerta si la cita excede el tiempo especificado', 'NUMBER', '240');
```

### Paso 2: Activar Reglas para un Negocio

```sql
-- Negocio "Belleza Premium" activa 3 reglas:

-- 1. Requiere consentimiento firmado
INSERT INTO business_rules (business_id, rule_template_id, is_active, notes)
SELECT 
  'uuid-belleza-premium',
  id,
  true,
  'Todos los procedimientos requieren consentimiento'
FROM rule_templates 
WHERE code = 'REQUIRE_CONSENT_FOR_COMPLETION';

-- 2. Requiere ambas fotos (antes y después)
INSERT INTO business_rules (business_id, rule_template_id, is_active, notes)
SELECT 
  'uuid-belleza-premium',
  id,
  true,
  'Evidencia fotográfica obligatoria para control de calidad'
FROM rule_templates 
WHERE code = 'REQUIRE_BOTH_PHOTOS';

-- 3. Requiere pago mínimo del 30% (sobrescribe el 50% default)
INSERT INTO business_rules (business_id, rule_template_id, custom_value, is_active, notes)
SELECT 
  'uuid-belleza-premium',
  id,
  '{"minPercentage": 30}'::jsonb,
  true,
  'Permitir completar con 30% de anticipo'
FROM rule_templates 
WHERE code = 'REQUIRE_MINIMUM_PAYMENT';
```

### Paso 3: Desactivar una Regla (Sin Eliminarla)

```sql
-- Desactivar regla de pago mínimo temporalmente
UPDATE business_rules
SET 
  is_active = false,
  notes = 'Desactivada temporalmente - Promoción Navidad 2024'
WHERE 
  business_id = 'uuid-belleza-premium'
  AND rule_template_id = (SELECT id FROM rule_templates WHERE code = 'REQUIRE_MINIMUM_PAYMENT');
```

---

## 🔍 Consultas Útiles para Diagnóstico

### Ver Reglas Activas de un Negocio

```sql
SELECT 
  br.id,
  rt.code AS rule_code,
  rt.name AS rule_name,
  rt.category,
  COALESCE(br.custom_value, rt.default_value) AS effective_value,
  br.is_active,
  br.notes,
  br.applied_at
FROM business_rules br
INNER JOIN rule_templates rt ON br.rule_template_id = rt.id
WHERE br.business_id = 'uuid-del-negocio'
  AND br.is_active = true
ORDER BY rt.category, rt.name;
```

### Ver Citas con Validaciones Pendientes

```sql
-- Citas que requieren consentimiento pero no lo tienen
SELECT 
  a.id,
  a.status,
  a.start_time,
  s.name AS service_name,
  s.requires_consent,
  a.has_consent,
  a.consent_signed_at,
  c.first_name || ' ' || c.last_name AS client_name
FROM appointments a
INNER JOIN services s ON a.service_id = s.id
INNER JOIN clients c ON a.client_id = c.id
WHERE a.business_id = 'uuid-del-negocio'
  AND a.status IN ('CONFIRMED', 'IN_PROGRESS')
  AND s.requires_consent = true
  AND (a.has_consent = false OR a.has_consent IS NULL)
ORDER BY a.start_time;
```

### Ver Citas sin Evidencia Fotográfica

```sql
-- Citas que necesitan fotos pero no las tienen
SELECT 
  a.id,
  a.status,
  s.name AS service_name,
  a.evidence,
  (a.evidence->'before') AS before_photos,
  (a.evidence->'after') AS after_photos,
  jsonb_array_length(COALESCE(a.evidence->'before', '[]'::jsonb)) AS before_count,
  jsonb_array_length(COALESCE(a.evidence->'after', '[]'::jsonb)) AS after_count
FROM appointments a
INNER JOIN services s ON a.service_id = s.id
WHERE a.business_id = 'uuid-del-negocio'
  AND a.status = 'IN_PROGRESS'
  AND EXISTS (
    SELECT 1 FROM business_rules br
    INNER JOIN rule_templates rt ON br.rule_template_id = rt.id
    WHERE br.business_id = a.business_id
      AND rt.code IN ('REQUIRE_BEFORE_PHOTO', 'REQUIRE_AFTER_PHOTO', 'REQUIRE_BOTH_PHOTOS')
      AND br.is_active = true
  )
  AND (
    jsonb_array_length(COALESCE(a.evidence->'before', '[]'::jsonb)) = 0
    OR jsonb_array_length(COALESCE(a.evidence->'after', '[]'::jsonb)) = 0
  );
```

---

## 📊 Estadísticas de Cumplimiento

```sql
-- % de citas completadas con todas las validaciones pasadas
WITH validation_stats AS (
  SELECT 
    COUNT(*) AS total_completed,
    COUNT(*) FILTER (WHERE has_consent = true) AS with_consent,
    COUNT(*) FILTER (
      WHERE jsonb_array_length(COALESCE(evidence->'before', '[]'::jsonb)) > 0
        AND jsonb_array_length(COALESCE(evidence->'after', '[]'::jsonb)) > 0
    ) AS with_photos,
    COUNT(*) FILTER (WHERE payment_status = 'PAID') AS fully_paid
  FROM appointments
  WHERE business_id = 'uuid-del-negocio'
    AND status = 'COMPLETED'
    AND completed_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  total_completed,
  ROUND(100.0 * with_consent / total_completed, 2) AS consent_compliance_pct,
  ROUND(100.0 * with_photos / total_completed, 2) AS photo_compliance_pct,
  ROUND(100.0 * fully_paid / total_completed, 2) AS payment_compliance_pct
FROM validation_stats;
```

---

## 🧪 Testing

### Caso de Prueba 1: Completar sin Consentimiento

```bash
# 1. Crear servicio que requiere consentimiento
POST /api/services
{
  "name": "Aplicación Botox",
  "requiresConsent": true,
  "consentTemplateId": "uuid-template-botox"
}

# 2. Crear cita con ese servicio
POST /api/appointments
{
  "serviceId": "uuid-servicio-botox",
  "clientId": "uuid-cliente",
  "startTime": "2024-01-25T10:00:00Z"
}

# 3. Intentar completar SIN haber firmado consentimiento
PATCH /api/appointments/uuid-cita/complete
# ❌ Esperado: Error 400 "Esta cita requiere consentimiento informado firmado"

# 4. Firmar consentimiento
POST /api/consent/signatures
{
  "templateId": "uuid-template-botox",
  "customerId": "uuid-cliente",
  "signatureData": "base64..."
}

# 5. Intentar completar nuevamente
PATCH /api/appointments/uuid-cita/complete
# ✅ Esperado: 200 OK, cita completada
```

### Caso de Prueba 2: Completar sin Evidencia

```bash
# 1. Activar regla de evidencia obligatoria
INSERT INTO business_rules (business_id, rule_template_id, is_active)
SELECT 'uuid-negocio', id, true 
FROM rule_templates WHERE code = 'REQUIRE_BOTH_PHOTOS';

# 2. Crear cita
POST /api/appointments { ... }

# 3. Intentar completar sin fotos
PATCH /api/appointments/uuid-cita/complete
# ❌ Esperado: Error 400 con mensajes:
#   - "Se requiere foto \"antes\" del procedimiento"
#   - "Se requiere foto \"después\" del procedimiento"

# 4. Subir foto "antes"
POST /api/appointments/uuid-cita/evidence
Form-Data:
  - type: "before"
  - files: [foto1.jpg]

# 5. Intentar completar (aún falta foto "después")
PATCH /api/appointments/uuid-cita/complete
# ❌ Esperado: Error 400 "Se requiere foto \"después\" del procedimiento"

# 6. Subir foto "después"
POST /api/appointments/uuid-cita/evidence
Form-Data:
  - type: "after"
  - files: [foto2.jpg]

# 7. Completar cita
PATCH /api/appointments/uuid-cita/complete
# ✅ Esperado: 200 OK
```

---

## 🔧 Troubleshooting

### Problema: "No se puede completar la cita" pero no sé qué falta

**Solución:** Revisa el array `validationErrors` en la respuesta:

```json
{
  "validationErrors": [
    "Esta cita requiere consentimiento informado firmado",
    "Se requiere foto \"después\" del procedimiento"
  ]
}
```

Cada mensaje indica exactamente qué falta.

---

### Problema: Quiero completar una cita ignorando validaciones

**Solución:** Las validaciones son obligatorias para proteger al negocio. Si necesitas flexibilidad:

1. **Opción 1:** Desactiva temporalmente la regla:
   ```sql
   UPDATE business_rules SET is_active = false WHERE id = 'uuid-regla';
   ```

2. **Opción 2:** Completa los requisitos (firmar consentimiento, subir fotos, etc.)

3. **Opción 3 (NO RECOMENDADO):** Cambia el rol del usuario a OWNER para bypass (ver código).

---

### Problema: La regla de pago mínimo no está funcionando

**Checklist:**

1. ¿La regla está activa?
   ```sql
   SELECT * FROM business_rules WHERE rule_template_id = 
     (SELECT id FROM rule_templates WHERE code = 'REQUIRE_MINIMUM_PAYMENT')
     AND business_id = 'uuid-negocio';
   ```

2. ¿El `customValue` tiene el formato correcto?
   ```json
   { "minPercentage": 50 }
   ```

3. ¿El campo `paidAmount` de la cita está actualizado?
   ```sql
   SELECT id, total_amount, paid_amount, payment_status 
   FROM appointments WHERE id = 'uuid-cita';
   ```

---

## 📚 Recursos Adicionales

- **FM-26 Consent Management:** Ver `CONSENT_MANAGEMENT_README.md`
- **Commission System:** Ver `COMMISSION_SYSTEM_README.md`
- **Business Rules Templates:** Ver `RULE_TEMPLATES_API.md`
- **Appointment API:** Ver `APPOINTMENT_API_README.md`

---

## 🎓 Mejores Prácticas

1. **✅ Configura reglas desde el inicio:**
   - Define qué servicios requieren consentimiento
   - Decide si necesitas evidencia fotográfica
   - Configura políticas de pago mínimo

2. **✅ Comunica las reglas a los especialistas:**
   - Entrena a tu equipo sobre los requisitos
   - Usa los mensajes de error como guía

3. **✅ Monitorea el cumplimiento:**
   - Usa las consultas de estadísticas
   - Identifica citas con validaciones pendientes
   - Corrige antes de completar

4. **✅ No desactives validaciones sin razón:**
   - Las validaciones protegen tu negocio
   - Aseguran calidad y trazabilidad
   - Previenen problemas legales

5. **✅ Usa `customValue` para flexibilidad:**
   - Cada negocio puede tener sus propios valores
   - No necesitas modificar el código

---

**¡Con este sistema de validaciones, Beauty Control garantiza que cada cita cumpla con los estándares de calidad y legales que tu negocio requiere!** 🎉
