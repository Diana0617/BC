# Traducción de Reglas de Negocio al Español

## 📋 Resumen

Se han traducido **todas las claves (keys) y descripciones** de las plantillas de reglas de negocio al español para hacerlas más amigables para usuarios en Colombia.

## 🔄 Cambios Realizados

### 1. Script de Seeding Actualizado

**Archivo**: `packages/backend/scripts/seed-rule-templates.js`

Se tradujeron **24 reglas** en total, organizadas en 3 categorías:

#### Gestión de Citas (8 reglas)

| Key Anterior (EN) | Key Nueva (ES) | Descripción |
|-------------------|----------------|-------------|
| `APPOINTMENT_ADVANCE_BOOKING` | `CITAS_DIAS_ANTICIPACION_MAXIMA` | Días máximos de anticipación para agendar citas |
| `APPOINTMENT_MIN_ADVANCE_HOURS` | `CITAS_HORAS_ANTICIPACION_MINIMA` | Horas mínimas de anticipación para agendar citas |
| `APPOINTMENT_CANCELLATION_HOURS` | `CITAS_HORAS_CANCELACION` | Horas de anticipación para cancelar sin penalización |
| `APPOINTMENT_MAX_PER_DAY` | `CITAS_MAXIMAS_POR_DIA` | Número máximo de citas por cliente al día |
| `APPOINTMENT_REMINDER_ENABLED` | `CITAS_RECORDATORIOS_ACTIVADOS` | Activar recordatorios automáticos de citas |
| `APPOINTMENT_REMINDER_HOURS` | `CITAS_HORAS_RECORDATORIO` | Horas de anticipación para enviar recordatorios |
| `APPOINTMENT_ALLOW_OVERLAPPING` | `CITAS_PERMITIR_SIMULTANEAS` | Permitir citas simultáneas con diferentes especialistas |
| `APPOINTMENT_BUFFER_MINUTES` | `CITAS_TIEMPO_LIBRE_ENTRE_CITAS` | Tiempo libre entre citas (en minutos) |

#### Facturación Electrónica (8 reglas)

| Key Anterior (EN) | Key Nueva (ES) | Descripción |
|-------------------|----------------|-------------|
| `INVOICE_AUTO_GENERATION` | `FACTURA_GENERACION_AUTOMATICA` | Generar facturas automáticamente al completar servicios |
| `INVOICE_PAYMENT_TERMS` | `FACTURA_PLAZO_PAGO_DIAS` | Plazo de pago de facturas en días (0 = pago inmediato) |
| `INVOICE_INCLUDE_TAX` | `FACTURA_INCLUIR_IVA` | Incluir IVA en las facturas |
| `INVOICE_TAX_RATE` | `FACTURA_PORCENTAJE_IVA` | Porcentaje de IVA a aplicar (%) |
| `INVOICE_LATE_PAYMENT_FEE` | `FACTURA_RECARGO_MORA` | Recargo por pago tardío (%) |
| `INVOICE_SEND_EMAIL` | `FACTURA_ENVIAR_EMAIL` | Enviar facturas por correo electrónico automáticamente |
| `INVOICE_REQUIRE_SIGNATURE` | `FACTURA_REQUIERE_FIRMA` | Requerir firma digital en facturas electrónicas |
| `INVOICE_NUMBERING_FORMAT` | `FACTURA_FORMATO_NUMERACION` | Formato de numeración de facturas |

#### Políticas Generales (8 reglas)

| Key Anterior (EN) | Key Nueva (ES) | Descripción |
|-------------------|----------------|-------------|
| `BUSINESS_OPERATING_HOURS_START` | `NEGOCIO_HORA_APERTURA` | Hora de inicio de operaciones del negocio |
| `BUSINESS_OPERATING_HOURS_END` | `NEGOCIO_HORA_CIERRE` | Hora de fin de operaciones del negocio |
| `PAYMENT_METHODS_CASH` | `PAGO_ACEPTAR_EFECTIVO` | Aceptar pagos en efectivo |
| `PAYMENT_METHODS_CARD` | `PAGO_ACEPTAR_TARJETA` | Aceptar pagos con tarjeta de crédito/débito |
| `SPECIALIST_COMMISSION_ENABLED` | `ESPECIALISTA_USAR_COMISIONES` | Usar sistema de comisiones para el pago de especialistas |
| `SPECIALIST_DEFAULT_COMMISSION_RATE` | `ESPECIALISTA_PORCENTAJE_COMISION` | Porcentaje de comisión por defecto para especialistas (%) |
| `REFUND_POLICY_ENABLED` | `DEVOLUCION_PERMITIR` | Permitir devoluciones y reembolsos |
| `REFUND_POLICY_DAYS` | `DEVOLUCION_PLAZO_DIAS` | Días límite para solicitar devoluciones |

### 2. Frontend Actualizado

**Archivo**: `packages/web-app/src/pages/business/profile/sections/SpecialistsSection.jsx`

**Cambios**:
```javascript
// ANTES
const commissionRule = businessRules.find(r => r.key === 'SPECIALIST_COMMISSION_ENABLED');
const defaultCommissionRule = businessRules.find(r => r.key === 'SPECIALIST_DEFAULT_COMMISSION_RATE');

// DESPUÉS
const commissionRule = businessRules.find(r => r.key === 'ESPECIALISTA_USAR_COMISIONES');
const defaultCommissionRule = businessRules.find(r => r.key === 'ESPECIALISTA_PORCENTAJE_COMISION');
```

### 3. Base de Datos

**Estado Actual**:
- ✅ 24 nuevas reglas en español creadas
- ⚠️ 24 reglas antiguas en inglés pendientes de eliminar

**Script de Migración Creado**: `packages/backend/migrations/remove-english-rules.sql`

## 🚀 Cómo Aplicar los Cambios

### Opción 1: Ejecutar Migración SQL Manual

```bash
# En la terminal de backend
cd packages/backend
psql -U postgres -d beauty_control_dev -f migrations/remove-english-rules.sql
```

### Opción 2: Eliminar desde psql interactivo

```bash
psql -U postgres -d beauty_control_dev
```

Luego ejecutar:
```sql
DELETE FROM rule_templates 
WHERE key LIKE 'APPOINTMENT_%' 
   OR key LIKE 'INVOICE_%' 
   OR key LIKE 'BUSINESS_%' 
   OR key LIKE 'PAYMENT_METHODS_%' 
   OR key LIKE 'SPECIALIST_%' 
   OR key LIKE 'REFUND_POLICY_%';
```

### Opción 3: Eliminar reglas y sus asignaciones

Si hay negocios que ya tienen asignadas las reglas antiguas, primero eliminar las asignaciones:

```sql
-- Eliminar asignaciones de reglas antiguas
DELETE FROM business_rules 
WHERE rule_template_id IN (
  SELECT id FROM rule_templates 
  WHERE key IN (
    'APPOINTMENT_ADVANCE_BOOKING', 'APPOINTMENT_MIN_ADVANCE_HOURS', 
    'APPOINTMENT_CANCELLATION_HOURS', 'APPOINTMENT_MAX_PER_DAY',
    'APPOINTMENT_REMINDER_ENABLED', 'APPOINTMENT_REMINDER_HOURS',
    'APPOINTMENT_ALLOW_OVERLAPPING', 'APPOINTMENT_BUFFER_MINUTES',
    'INVOICE_AUTO_GENERATION', 'INVOICE_PAYMENT_TERMS',
    'INVOICE_INCLUDE_TAX', 'INVOICE_TAX_RATE',
    'INVOICE_LATE_PAYMENT_FEE', 'INVOICE_SEND_EMAIL',
    'INVOICE_REQUIRE_SIGNATURE', 'INVOICE_NUMBERING_FORMAT',
    'BUSINESS_OPERATING_HOURS_START', 'BUSINESS_OPERATING_HOURS_END',
    'PAYMENT_METHODS_CASH', 'PAYMENT_METHODS_CARD',
    'SPECIALIST_COMMISSION_ENABLED', 'SPECIALIST_DEFAULT_COMMISSION_RATE',
    'REFUND_POLICY_ENABLED', 'REFUND_POLICY_DAYS'
  )
);

-- Luego eliminar las plantillas
DELETE FROM rule_templates 
WHERE key IN (
  'APPOINTMENT_ADVANCE_BOOKING', 'APPOINTMENT_MIN_ADVANCE_HOURS', 
  'APPOINTMENT_CANCELLATION_HOURS', 'APPOINTMENT_MAX_PER_DAY',
  'APPOINTMENT_REMINDER_ENABLED', 'APPOINTMENT_REMINDER_HOURS',
  'APPOINTMENT_ALLOW_OVERLAPPING', 'APPOINTMENT_BUFFER_MINUTES',
  'INVOICE_AUTO_GENERATION', 'INVOICE_PAYMENT_TERMS',
  'INVOICE_INCLUDE_TAX', 'INVOICE_TAX_RATE',
  'INVOICE_LATE_PAYMENT_FEE', 'INVOICE_SEND_EMAIL',
  'INVOICE_REQUIRE_SIGNATURE', 'INVOICE_NUMBERING_FORMAT',
  'BUSINESS_OPERATING_HOURS_START', 'BUSINESS_OPERATING_HOURS_END',
  'PAYMENT_METHODS_CASH', 'PAYMENT_METHODS_CARD',
  'SPECIALIST_COMMISSION_ENABLED', 'SPECIALIST_DEFAULT_COMMISSION_RATE',
  'REFUND_POLICY_ENABLED', 'REFUND_POLICY_DAYS'
);
```

## ✅ Verificación

Después de aplicar los cambios, verificar:

### 1. Backend - Verificar reglas en DB

```sql
-- Ver todas las reglas (debe mostrar solo las 24 en español)
SELECT key, description FROM rule_templates ORDER BY key;

-- Contar reglas (debe ser 24)
SELECT COUNT(*) FROM rule_templates;
```

### 2. Frontend - Probar en UI

1. Iniciar servidor web:
   ```bash
   cd packages/web-app
   npm run dev
   ```

2. Navegar a: **Perfil del Negocio → Reglas de Negocio**

3. Verificar que se muestran con nombres en español:
   - ✅ `CITAS_DIAS_ANTICIPACION_MAXIMA`
   - ✅ `ESPECIALISTA_USAR_COMISIONES`
   - ✅ `ESPECIALISTA_PORCENTAJE_COMISION`
   - ✅ `FACTURA_INCLUIR_IVA`
   - ✅ etc.

### 3. Funcionalidad de Comisiones

1. Ir a **Perfil del Negocio → Reglas de Negocio**
2. Buscar `ESPECIALISTA_PORCENTAJE_COMISION`
3. Hacer clic en **"Editar"**
4. Cambiar el valor (ej: de 50 a 40)
5. Ir a **Especialistas** y crear un nuevo especialista
6. Verificar que el placeholder muestre el nuevo valor

## 📊 Ejemplo de Visualización en UI

### Antes (Inglés)
```
Key: SPECIALIST_COMMISSION_ENABLED
Description: Usar sistema de comisiones para el pago de especialistas
```

### Después (Español)
```
Key: ESPECIALISTA_USAR_COMISIONES
Description: Usar sistema de comisiones para el pago de especialistas
```

## 🎯 Beneficios

1. ✅ **Mejor UX para usuarios colombianos**: Keys en español más intuitivas
2. ✅ **Consistencia**: Todo el sistema en español
3. ✅ **Mantenibilidad**: Código más legible para el equipo hispanohablante
4. ✅ **Escalabilidad**: Base sólida para agregar más reglas en el futuro

## 📝 Notas Importantes

- Las reglas antiguas en inglés pueden seguir funcionando hasta que se ejecute la migración
- Si hay negocios con reglas asignadas, se deben migrar antes de eliminar las plantillas antiguas
- El sistema maneja gracefully la ausencia de reglas (usa valores por defecto)

## 🔗 Archivos Modificados

1. ✅ `packages/backend/scripts/seed-rule-templates.js` - 24 reglas traducidas
2. ✅ `packages/web-app/src/pages/business/profile/sections/SpecialistsSection.jsx` - Referencias actualizadas
3. ✅ `packages/backend/migrations/remove-english-rules.sql` - Script de limpieza
4. ✅ `packages/web-app/CUSTOM_COMMISSION_GUIDE.md` - Guía de uso actualizada

---

**Fecha de traducción**: ${new Date().toLocaleDateString('es-ES')}  
**Idioma objetivo**: Español (Colombia)  
**Estado**: ✅ Completado - Pendiente ejecutar migración SQL
