# 📋 Sistema de Comprobantes Obligatorios en Gastos

## 🎯 Descripción

Este sistema permite a cada negocio configurar si los comprobantes (imágenes o PDFs) son **obligatorios** u **opcionales** al registrar gastos.

## 🔧 Configuración Inicial

### 1. Crear la Regla en Base de Datos

Ejecutar el script SQL:

```bash
# Local
psql -U postgres -d beautycontrol < add_expense_receipt_rule.sql

# Azure
# Usar Azure Data Studio, pgAdmin o herramienta PostgreSQL
```

El script crea la regla con estos valores:
- **Key**: `GASTOS_COMPROBANTE_REQUERIDO`
- **Tipo**: `BOOLEAN`
- **Valor por defecto**: `false` (comprobantes opcionales)
- **Personalizable**: Sí (cada negocio puede cambiarla)
- **Categoría**: `GENERAL`

### 2. Verificar Creación

```sql
SELECT 
  id,
  key,
  type,
  "defaultValue",
  "isActive"
FROM rule_templates
WHERE key = 'GASTOS_COMPROBANTE_REQUERIDO';
```

## 📱 Uso desde el Frontend

### Para Negocios (BUSINESS)

#### Asignar la Regla

1. Ir a **Configuración del Negocio** → **Reglas de Negocio**
2. En la sección "Reglas Disponibles", buscar: **"Comprobante Requerido en Gastos"**
3. Hacer clic en **"Asignar"** o arrastrar a la columna de reglas asignadas
4. La regla aparecerá en "Mis Reglas Activas"

#### Personalizar la Regla

**Opción A: Desde la UI (BusinessRuleModalV2)**

1. En "Mis Reglas Activas", localizar la regla
2. Hacer clic en el botón **"Editar"** (icono de lápiz)
3. Cambiar el valor:
   - `true` = Comprobantes **obligatorios** ✅
   - `false` = Comprobantes **opcionales** (por defecto)
4. Guardar cambios

**Opción B: Desde la API**

```javascript
// PUT /api/business/rules/GASTOS_COMPROBANTE_REQUERIDO
// Headers: Authorization: Bearer {business_token}

const response = await fetch('/api/business/rules/GASTOS_COMPROBANTE_REQUERIDO', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${businessToken}`,
    'X-Subdomain': 'mi-negocio'
  },
  body: JSON.stringify({
    customValue: true, // true = obligatorio, false = opcional
    isActive: true
  })
});
```

### Comportamiento en el Formulario de Gastos

#### Cuando `isReceiptRequired = false` (Opcional)

- Label: **"Comprobante (Opcional)"**
- ✅ Permite crear gastos sin comprobante
- 💡 Si la categoría recomienda comprobante (`requiresReceipt: true`), muestra mensaje azul de recomendación
- 📝 No bloquea el guardado

#### Cuando `isReceiptRequired = true` (Obligatorio)

- Label: **"Comprobante *"** (con asterisco rojo)
- ⚠️ Muestra alerta roja: "Tu negocio requiere adjuntar un comprobante para todos los gastos"
- ❌ No permite guardar el gasto sin adjuntar imagen/PDF
- 🔒 Validación en frontend (próximamente también en backend)

## 🏗️ Arquitectura Técnica

### Frontend (ExpenseFormModal.jsx)

```javascript
// Lectura de la regla desde Redux
const businessRules = useSelector(state => state.businessRule?.assignedRules || []);
const receiptRequiredRule = businessRules.find(r => r.key === 'GASTOS_COMPROBANTE_REQUERIDO');
const isReceiptRequired = receiptRequiredRule?.customValue 
  ?? receiptRequiredRule?.effective_value 
  ?? receiptRequiredRule?.defaultValue 
  ?? false;

// Validación en formulario
const validate = () => {
  const newErrors = {};
  
  // ... otras validaciones ...
  
  // Validar comprobante si la regla lo requiere
  if (isReceiptRequired && !selectedFile && !filePreview) {
    newErrors.file = 'El comprobante es obligatorio según la política de tu negocio';
  }
  
  return Object.keys(newErrors).length === 0;
};
```

### Backend (BusinessExpense - Opcional)

Actualmente el backend solo **advierte** si la categoría requiere comprobante pero NO bloquea la creación.

Para agregar validación basada en regla de negocio (futuro):

```javascript
// En BusinessExpenseController.createExpense

// 1. Obtener la regla del negocio
const receiptRule = await BusinessRule.findOne({
  where: { 
    businessId,
    key: 'GASTOS_COMPROBANTE_REQUERIDO',
    isActive: true 
  }
});

// 2. Determinar si el comprobante es requerido
const isReceiptRequired = receiptRule?.customValue 
  ?? receiptRule?.effective_value 
  ?? false;

// 3. Validar
if (isReceiptRequired && !req.file) {
  return res.status(400).json({
    success: false,
    message: 'El comprobante es obligatorio según la política de tu negocio'
  });
}
```

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────────────────────┐
│ 1. OWNER crea regla GASTOS_COMPROBANTE_REQUERIDO       │
│    (SQL script o API /api/owner/rule-templates)        │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. BUSINESS asigna regla desde BusinessRuleModalV2     │
│    POST /api/business/rules/setup                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. BUSINESS personaliza regla (opcional)                │
│    PUT /api/business/rules/GASTOS_COMPROBANTE_REQUERIDO│
│    Body: { customValue: true }                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Redux actualiza assignedRules                        │
│    state.businessRule.assignedRules                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. ExpenseFormModal lee regla y aplica validaciones    │
│    - Cambia label (Opcional/Obligatorio)               │
│    - Muestra alertas                                    │
│    - Valida en submit                                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 6. Usuario crea gasto                                   │
│    - Si regla activa: requiere adjuntar comprobante    │
│    - Si regla inactiva: comprobante opcional           │
└─────────────────────────────────────────────────────────┘
```

## 📚 Casos de Uso

### Caso 1: Salón con Control Estricto

**Escenario**: Salón premium que necesita documentar todos los gastos para contabilidad

**Configuración**:
```json
{
  "key": "GASTOS_COMPROBANTE_REQUERIDO",
  "customValue": true,
  "isActive": true
}
```

**Resultado**: 
- ✅ Todos los gastos requieren comprobante obligatorio
- ❌ No se puede guardar sin PDF/imagen
- 📊 Mejor trazabilidad contable

### Caso 2: Negocio Pequeño Flexible

**Escenario**: Peluquería pequeña que confía en su equipo

**Configuración**:
```json
{
  "key": "GASTOS_COMPROBANTE_REQUERIDO",
  "customValue": false,
  "isActive": true
}
```

**Resultado**:
- ✅ Comprobantes opcionales
- 💡 Recomendaciones por categoría (si aplica)
- ⚡ Registro rápido de gastos

### Caso 3: Sistema Mixto

**Escenario**: Spa que quiere flexibilidad pero recomendaciones

**Configuración**:
- Regla global: `customValue: false`
- Categorías específicas con `requiresReceipt: true`

**Resultado**:
- ✅ Gastos generales sin comprobante obligatorio
- 💡 Categorías importantes (ej: "Equipos médicos") muestran recomendación
- 🎯 Balance entre control y agilidad

## 🧪 Testing

### Checklist de Pruebas

- [ ] Script SQL ejecuta sin errores
- [ ] Regla aparece en `GET /api/rule-templates`
- [ ] BusinessRuleModalV2 muestra la regla en "Disponibles"
- [ ] Se puede asignar la regla al negocio
- [ ] Redux actualiza `assignedRules` correctamente
- [ ] ExpenseFormModal lee la regla correctamente
- [ ] Label cambia según valor de regla
- [ ] Validación bloquea submit si falta comprobante (cuando `true`)
- [ ] Validación permite submit sin comprobante (cuando `false`)
- [ ] Se puede personalizar el valor desde la UI
- [ ] Cambios se reflejan inmediatamente en formulario

### Testing con Insomnia

Ver colección: `Business_Rules_Testing.json`

```javascript
// 1. Login y obtener token
POST /api/auth/login

// 2. Ver plantillas disponibles
GET /api/rule-templates/business/templates/available

// 3. Asignar regla
POST /api/business/rules/setup
Body: { "templateKeys": ["GASTOS_COMPROBANTE_REQUERIDO"], "autoActivate": true }

// 4. Ver reglas asignadas
GET /api/business/rules

// 5. Personalizar regla
PUT /api/business/rules/GASTOS_COMPROBANTE_REQUERIDO
Body: { "customValue": true, "isActive": true }

// 6. Ver valor efectivo
GET /api/rule-templates/business/templates/effective
```

## 🐛 Troubleshooting

### La regla no aparece en BusinessRuleModalV2

**Solución**:
1. Verificar que el script SQL se ejecutó correctamente
2. Confirmar que `isActive = true` en `rule_templates`
3. Recargar Redux: `dispatch(getAvailableTemplates())`
4. Revisar consola del navegador

### ExpenseFormModal no lee la regla

**Solución**:
1. Verificar que la regla está asignada al negocio
2. Confirmar que Redux tiene `assignedRules` poblado
3. Debug: `console.log(businessRules, isReceiptRequired)`
4. Verificar que el key es exactamente: `GASTOS_COMPROBANTE_REQUERIDO`

### Validación no funciona

**Solución**:
1. Verificar que `isReceiptRequired` es `true`
2. Comprobar que no hay `filePreview` ni `selectedFile`
3. Revisar logs en consola del navegador
4. Confirmar que `validate()` se llama antes de submit

## 🚀 Próximas Mejoras

- [ ] Validación también en backend (doble capa)
- [ ] Permitir excepciones por rol (ej: OWNER puede omitir)
- [ ] Permitir excepciones por monto (ej: < $10,000 opcional)
- [ ] Logs de auditoría cuando se crea gasto sin comprobante
- [ ] Notificación al admin cuando se personaliza la regla
- [ ] Dashboard de gastos sin comprobante

## 📞 Soporte

Si tienes dudas o problemas:
1. Revisar esta documentación
2. Consultar `Business_Rules_Testing.json` (Insomnia)
3. Revisar logs del backend en consola
4. Contactar al equipo de desarrollo
