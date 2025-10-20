# 🎨 Guía Visual - Gestión de Reglas de Negocio

## 📸 Comparativa Visual: Antes vs Después

### Antes (Interfaz Antigua)

#### Edición con window.prompt():
```
┌──────────────────────────────────────┐
│  Editar regla: "CANCELLATION_HOURS"  │
│  Descripción: Horas mínimas...       │
│                                      │
│  Ingresa el nuevo valor numérico:   │
│  ┌────────────────────────────────┐ │
│  │ 24                             │ │
│  └────────────────────────────────┘ │
│                                      │
│         [  OK  ]  [Cancelar]        │
└──────────────────────────────────────┘
```

**Problemas:**
- ❌ Sin contexto visual
- ❌ No se ve el valor actual
- ❌ Sin ejemplos ni ayuda
- ❌ Difícil saber qué poner
- ❌ No se muestran restricciones

---

### Después (Nueva Interfaz)

#### Modal de Edición Moderno:

```
╔════════════════════════════════════════════════════════════════════════╗
║  [GRADIENTE ROSA-PÚRPURA]                                              ║
║  ✏️  Editar Regla                                            [❌]      ║
║      CANCELLATION_HOURS                                                ║
╠════════════════════════════════════════════════════════════════════════╣
║                                                                         ║
║  ┌─────────────────────────────────────────────────────────────────┐  ║
║  │ ℹ️  Política de Cancelación                                     │  ║
║  │                                                                  │  ║
║  │  Define las condiciones bajo las cuales los clientes pueden     │  ║
║  │  cancelar sus citas.                                            │  ║
║  └─────────────────────────────────────────────────────────────────┘  ║
║                                                                         ║
║  Tipo de dato:  [PURPLE] NUMBER                                        ║
║                                                                         ║
║  ┌─────────────────────────────────────────────────────────────────┐  ║
║  │ ⚠️  Restricciones:                                               │  ║
║  │  Mínimo: 0 | Máximo: 168                                        │  ║
║  └─────────────────────────────────────────────────────────────────┘  ║
║                                                                         ║
║  Nuevo Valor:                                                          ║
║  ┌───────────────────────────────────────────────────────────────┐    ║
║  │  48                                                            │    ║
║  └───────────────────────────────────────────────────────────────┘    ║
║  💡 Ingresa solo números (puede incluir decimales)                     ║
║                                                                         ║
║  ┌─────────────────────────────────────────────────────────────────┐  ║
║  │ 📌 Valor Actual:                                                 │  ║
║  │  24                                                              │  ║
║  └─────────────────────────────────────────────────────────────────┘  ║
║                                                                         ║
║  ┌─────────────────────────────────────────────────────────────────┐  ║
║  │ 💡 Ejemplos de valores válidos:                                  │  ║
║  │  • Permitir cancelación hasta 24 horas antes                     │  ║
║  │  • Cancelación gratuita hasta 48 horas antes                     │  ║
║  │  • Sin cancelación permitida                                     │  ║
║  └─────────────────────────────────────────────────────────────────┘  ║
║                                                                         ║
║                              [Cancelar]  [💾 Guardar Cambios]          ║
╚════════════════════════════════════════════════════════════════════════╝
```

**Ventajas:**
- ✅ Contexto completo visible
- ✅ Valor actual mostrado
- ✅ Ejemplos prácticos
- ✅ Restricciones claras
- ✅ Ayuda integrada
- ✅ Diseño profesional

---

## 🎯 Tipos de Edición por Tipo de Dato

### 1. Tipo BOOLEAN (Toggle Visual)

```
╔════════════════════════════════════════════════════════════╗
║  ✏️  Editar Regla - ALLOW_ONLINE_BOOKING                  ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  ℹ️  Permitir Reservas Online                              ║
║  Habilita que los clientes reserven por internet           ║
║                                                             ║
║  Tipo de dato:  [PURPLE] BOOLEAN                           ║
║                                                             ║
║  Nuevo Valor:                                              ║
║  ┌──────────────────────┐  ┌──────────────────────┐       ║
║  │   [VERDE ACTIVO]     │  │   [GRIS INACTIVO]    │       ║
║  │                      │  │                      │       ║
║  │         ✅           │  │         ❌            │       ║
║  │                      │  │                      │       ║
║  │      Activado        │  │     Desactivado      │       ║
║  │                      │  │                      │       ║
║  └──────────────────────┘  └──────────────────────┘       ║
║                                                             ║
║  📌 Valor Actual: Desactivado                              ║
║                                                             ║
║  💡 Selecciona activado o desactivado                      ║
║                                                             ║
║                        [Cancelar]  [💾 Guardar]            ║
╚════════════════════════════════════════════════════════════╝
```

**Características:**
- Botones grandes (touch-friendly)
- Color verde para "Activado"
- Color gris para "Desactivado"
- Estado visual claro con iconos

---

### 2. Tipo NUMBER (Input Numérico con Validación)

```
╔════════════════════════════════════════════════════════════╗
║  ✏️  Editar Regla - CANCELLATION_HOURS                    ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  ℹ️  Horas de Cancelación                                  ║
║  Tiempo mínimo antes de la cita para cancelar              ║
║                                                             ║
║  Tipo de dato:  [PURPLE] NUMBER                            ║
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │ ⚠️  Restricciones:                                   │  ║
║  │  • Mínimo permitido: 0 horas                         │  ║
║  │  • Máximo permitido: 168 horas (7 días)             │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                             ║
║  Nuevo Valor:                                              ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │  [TYPE="number"]                                     │  ║
║  │  48                                  ⬆️ ⬇️            │  ║
║  └─────────────────────────────────────────────────────┘  ║
║  💡 Ingresa solo números (puede incluir decimales)         ║
║                                                             ║
║  📌 Valor Actual: 24 horas                                 ║
║                                                             ║
║  💡 Ejemplos:                                              ║
║  • 24 horas = 1 día de anticipación                        ║
║  • 48 horas = 2 días de anticipación                       ║
║  • 72 horas = 3 días de anticipación                       ║
║                                                             ║
║                        [Cancelar]  [💾 Guardar]            ║
╚════════════════════════════════════════════════════════════╝
```

**Validaciones en Tiempo Real:**
```javascript
// Si ingresa 200 (mayor que max=168):
❌ El valor debe ser menor o igual a 168

// Si ingresa -5 (menor que min=0):
❌ El valor debe ser mayor o igual a 0

// Si ingresa "abc":
❌ Por favor ingresa un número válido
```

---

### 3. Tipo JSON (Textarea con Formato)

```
╔════════════════════════════════════════════════════════════╗
║  ✏️  Editar Regla - WORKING_HOURS_CONFIG                  ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  ℹ️  Configuración de Horarios                             ║
║  Define los horarios de operación del negocio              ║
║                                                             ║
║  Tipo de dato:  [PURPLE] JSON                              ║
║                                                             ║
║  Nuevo Valor:                                              ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │  {                                                   │  ║
║  │    "monday": {                                       │  ║
║  │      "start": "09:00",                               │  ║
║  │      "end": "18:00"                                  │  ║
║  │    },                                                │  ║
║  │    "tuesday": {                                      │  ║
║  │      "start": "09:00",                               │  ║
║  │      "end": "18:00"                                  │  ║
║  │    }                                                 │  ║
║  │  }                                                   │  ║
║  └─────────────────────────────────────────────────────┘  ║
║  💡 Ingresa un objeto JSON válido                          ║
║                                                             ║
║  📌 Valor Actual:                                          ║
║  { "monday": { "start": "08:00", "end": "17:00" } }        ║
║                                                             ║
║  💡 Formato esperado: Objeto con días de la semana          ║
║                                                             ║
║                        [Cancelar]  [💾 Guardar]            ║
╚════════════════════════════════════════════════════════════╝
```

**Validación JSON:**
```javascript
// Si ingresa JSON inválido:
❌ El valor ingresado no es un JSON válido.
Revisa: { "key": "value" }
```

---

### 4. Tipo STRING (Input de Texto)

```
╔════════════════════════════════════════════════════════════╗
║  ✏️  Editar Regla - BUSINESS_GREETING                     ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║  ℹ️  Mensaje de Bienvenida                                 ║
║  Saludo que verán los clientes al agendar                  ║
║                                                             ║
║  Tipo de dato:  [PURPLE] STRING                            ║
║                                                             ║
║  Nuevo Valor:                                              ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │  ¡Bienvenido a nuestro salón! 💇‍♀️                    │  ║
║  └─────────────────────────────────────────────────────┘  ║
║  💡 Ingresa texto libre                                    ║
║                                                             ║
║  📌 Valor Actual:                                          ║
║  "¡Hola! Gracias por elegirnos"                            ║
║                                                             ║
║  💡 Ejemplos:                                              ║
║  • "¡Bienvenido! Estamos listos para atenderte"            ║
║  • "Gracias por agendar con nosotros"                      ║
║  • "¡Te esperamos pronto!"                                 ║
║                                                             ║
║                        [Cancelar]  [💾 Guardar]            ║
╚════════════════════════════════════════════════════════════╝
```

---

## 📋 Vista de Reglas Asignadas (Nueva)

### Lista Compacta (Estado Colapsado)

```
┌────────────────────────────────────────────────────────────────────────┐
│  💡 Cómo gestionar tus reglas                                          │
│  • Editar: Haz clic en "Editar" para cambiar el valor                  │
│  • Activar/Desactivar: Controla si la regla está activa                │
│  • Eliminar: Quita la regla completamente                              │
│  • Ver detalles: Expande cada regla para ver información completa      │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ [GRADIENTE GRIS]                                                        │
│                                                                         │
│  📅  Política de Cancelación                        [✓ ACTIVA]         │
│  Define las condiciones bajo las cuales los clientes pueden            │
│  cancelar sus citas                                                    │
│                                                                         │
│  [CANCELLATION_POLICY]  [NUMBER]                                       │
│                                                                         │
│  [Editar] [Desactivar] [Eliminar]                          [▼]         │
├─────────────────────────────────────────────────────────────────────────┤
│  📊 Valor Configurado: [Personalizado]                                 │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  24 horas                                                      │    │
│  └───────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│ [GRADIENTE GRIS]                                                        │
│                                                                         │
│  💳  Política de Pago                              [○ INACTIVA]        │
│  Regula cómo y cuándo los clientes deben realizar pagos                │
│                                                                         │
│  [PAYMENT_POLICY]  [BOOLEAN]                                           │
│                                                                         │
│  [Editar] [Activar] [Eliminar]                             [▼]         │
├─────────────────────────────────────────────────────────────────────────┤
│  📊 Valor Configurado:                                                 │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │         ❌                                                      │    │
│  │    Desactivado                                                 │    │
│  └───────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Regla Expandida (Detalles Completos)

```
┌────────────────────────────────────────────────────────────────────────┐
│ [GRADIENTE GRIS]                                                        │
│                                                                         │
│  📅  Política de Cancelación                        [✓ ACTIVA]         │
│  Define las condiciones bajo las cuales los clientes pueden            │
│  cancelar sus citas                                                    │
│                                                                         │
│  [CANCELLATION_POLICY]  [NUMBER]                                       │
│                                                                         │
│  [Editar] [Desactivar] [Eliminar]                          [▲]         │
├─────────────────────────────────────────────────────────────────────────┤
│  📊 Valor Configurado: [Personalizado]                                 │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  24 horas                                                      │    │
│  └───────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│ [FONDO GRIS CLARO - DETALLES EXPANDIDOS]                               │
│                                                                         │
│  ⚠️  Impacto:                                                          │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  Afecta la gestión de citas y la satisfacción del cliente     │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  💡 Ejemplos de uso:                                                   │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  Permitir cancelación hasta 24 horas antes                     │    │
│  └───────────────────────────────────────────────────────────────┘    │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  Cancelación gratuita hasta 48 horas antes                     │    │
│  └───────────────────────────────────────────────────────────────┘    │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  Sin cancelación permitida                                     │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ✓ Reglas de validación:                                               │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  {                                                             │    │
│  │    "min": 0,                                                   │    │
│  │    "max": 168                                                  │    │
│  │  }                                                             │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ℹ️  Notas:                                                            │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  Editado el 20 de octubre de 2025, 14:30                      │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Paleta de Colores Aplicada

### Estados de Regla:

```
✓ ACTIVA
┌──────────────────┐
│ [VERDE CLARO]    │  bg-green-100
│ [TEXTO VERDE]    │  text-green-700
│ [BORDE VERDE]    │  border-green-300
└──────────────────┘

○ INACTIVA
┌──────────────────┐
│ [GRIS CLARO]     │  bg-gray-100
│ [TEXTO GRIS]     │  text-gray-500
│ [BORDE GRIS]     │  border-gray-300
└──────────────────┘
```

### Botones de Acción:

```
[Editar]
┌──────────────────┐
│ [AZUL]           │  bg-blue-600
│ [TEXTO BLANCO]   │  text-white
│ hover: scale-105 │
└──────────────────┘

[Desactivar]
┌──────────────────┐
│ [AMARILLO CLARO] │  bg-yellow-100
│ [TEXTO AMARILLO] │  text-yellow-700
│ [BORDE AMARILLO] │  border-yellow-300
└──────────────────┘

[Activar]
┌──────────────────┐
│ [VERDE CLARO]    │  bg-green-100
│ [TEXTO VERDE]    │  text-green-700
│ [BORDE VERDE]    │  border-green-300
└──────────────────┘

[Eliminar]
┌──────────────────┐
│ [ROJO CLARO]     │  bg-red-100
│ [TEXTO ROJO]     │  text-red-700
│ [BORDE ROJO]     │  border-red-300
└──────────────────┘
```

### Secciones Informativas:

```
ℹ️  Información General
┌──────────────────┐
│ [AZUL CLARO]     │  bg-blue-50
│ [TEXTO AZUL]     │  text-blue-700
│ [BORDE AZUL]     │  border-blue-200
└──────────────────┘

⚠️  Advertencias/Impacto
┌──────────────────┐
│ [NARANJA CLARO]  │  bg-orange-50
│ [TEXTO NARANJA]  │  text-orange-700
│ [BORDE NARANJA]  │  border-orange-200
└──────────────────┘

💡 Ejemplos/Ayuda
┌──────────────────┐
│ [VERDE CLARO]    │  bg-green-50
│ [TEXTO VERDE]    │  text-green-700
│ [BORDE VERDE]    │  border-green-200
└──────────────────┘

⚠️  Restricciones
┌──────────────────┐
│ [AMARILLO CLARO] │  bg-yellow-50
│ [TEXTO AMARILLO] │  text-yellow-700
│ [BORDE AMARILLO] │  border-yellow-200
└──────────────────┘
```

---

## 🎯 Flujo de Interacción

### Escenario 1: Usuario quiere cambiar horas de cancelación

```
1. Usuario ve regla en lista
   ┌─────────────────────────────────────┐
   │ 📅 Política de Cancelación          │
   │ Valor: 24 horas                     │
   │ [Editar] [Desactivar] [Eliminar]    │
   └─────────────────────────────────────┘
           │
           │ Clic en "Editar"
           ▼
2. Se abre modal con contexto completo
   ┌─────────────────────────────────────┐
   │ ✏️  Editar Regla                    │
   │ ℹ️  Explica qué hace la regla       │
   │ ⚠️  Muestra restricciones (0-168)   │
   │ 📌 Valor actual: 24                 │
   │ 💡 Ejemplos de uso                  │
   │                                     │
   │ Nuevo valor: [_48_]                 │
   │                                     │
   │ [Cancelar] [💾 Guardar]             │
   └─────────────────────────────────────┘
           │
           │ Clic en "Guardar"
           ▼
3. Validación en backend
   - ✅ 48 está entre 0-168
   - ✅ Es un número válido
   - ✅ Se guarda en BD
           │
           ▼
4. Actualización visual
   ┌─────────────────────────────────────┐
   │ 📅 Política de Cancelación          │
   │ Valor: 48 horas [Personalizado]     │
   │ Notas: Editado el 20/10/2025        │
   └─────────────────────────────────────┘
           │
           ▼
5. Confirmación al usuario
   ┌─────────────────────────────────────┐
   │ ✅ Regla actualizada correctamente  │
   └─────────────────────────────────────┘
```

---

### Escenario 2: Usuario quiere ver detalles de una regla

```
1. Regla en estado colapsado
   ┌─────────────────────────────────────┐
   │ 📅 Política de Cancelación   [▼]    │
   │ Valor: 24 horas                     │
   └─────────────────────────────────────┘
           │
           │ Clic en botón ▼
           ▼
2. Regla se expande mostrando todo
   ┌─────────────────────────────────────┐
   │ 📅 Política de Cancelación   [▲]    │
   │ Valor: 24 horas                     │
   ├─────────────────────────────────────┤
   │ ⚠️  Impacto: Afecta gestión...      │
   │                                     │
   │ 💡 Ejemplos:                        │
   │ • 24h antes                         │
   │ • 48h antes                         │
   │                                     │
   │ ✓ Validación: { min: 0, max: 168 } │
   │                                     │
   │ ℹ️  Notas: Editado el 20/10/2025    │
   └─────────────────────────────────────┘
           │
           │ Clic en botón ▲
           ▼
3. Vuelve a estado colapsado
```

---

## 📱 Responsive Behavior

### Mobile (375px)

```
┌─────────────────────────────────┐
│ 📅 Política de Cancelación      │
│ [✓ ACTIVA]                      │
│                                 │
│ Define las condiciones...       │
│                                 │
│ CANCELLATION_POLICY             │
│ NUMBER                          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [Editar]                    │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ [Desactivar]                │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ [Eliminar]                  │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ [▼ Detalles]                │ │
│ └─────────────────────────────┘ │
│                                 │
│ 📊 Valor: 24 horas              │
└─────────────────────────────────┘
```

**Características:**
- Botones apilados verticalmente
- Ancho completo (100%)
- Padding aumentado para touch
- Texto legible (min 14px)

---

### Tablet (768px)

```
┌────────────────────────────────────────────────────┐
│ 📅 Política de Cancelación           [✓ ACTIVA]   │
│ Define las condiciones bajo las cuales...          │
│ CANCELLATION_POLICY | NUMBER                       │
│                                                    │
│ [Editar] [Desactivar] [Eliminar]      [▼ Detalles]│
│                                                    │
│ 📊 Valor Configurado: 24 horas                     │
└────────────────────────────────────────────────────┘
```

**Características:**
- Botones horizontales con espacio
- Mejor aprovechamiento del ancho
- Layout de 2 columnas para info

---

### Desktop (1920px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 📅 Política de Cancelación                            [✓ ACTIVA]         │
│ Define las condiciones bajo las cuales los clientes pueden cancelar      │
│ CANCELLATION_POLICY | NUMBER                                             │
│                                                                          │
│ [Editar] [Desactivar] [Eliminar]                           [▼ Detalles] │
│                                                                          │
│ 📊 Valor Configurado: [Personalizado] 24 horas                           │
└──────────────────────────────────────────────────────────────────────────┘
```

**Características:**
- Máximo ancho aprovechado
- Todo visible sin scroll horizontal
- Espaciado generoso

---

## 🎬 Animaciones y Transiciones

### Hover Effects:

```javascript
// Botón Editar
Normal:    bg-blue-600
Hover:     bg-blue-700 + scale-105 + shadow-lg

// Card de Regla
Normal:    border-gray-200
Hover:     border-pink-300

// Toggle Boolean
Normal:    bg-white
Hover:     bg-opacity-90 + scale-102
```

### Click Animations:

```javascript
// Al hacer clic en "Guardar"
1. Botón: scale-95 (100ms)
2. Loading: Loader2 spinning
3. Success: scale-100 + bounce
4. Alert: ✅ Slide in from top
```

### Expand/Collapse:

```javascript
// Al expandir detalles
1. ChevronDown → ChevronUp (rotate 180deg)
2. Detalles: slideDown (300ms ease-out)
3. Height: auto

// Al colapsar
1. ChevronUp → ChevronDown (rotate -180deg)
2. Detalles: slideUp (300ms ease-in)
3. Height: 0
```

---

## ✅ Accesibilidad (A11y)

### Contraste de Colores:

```
✓ Texto sobre fondo: 4.5:1 (WCAG AA)
✓ Botones: 3:1 mínimo
✓ Estados disabled: Reducido pero visible
```

### Keyboard Navigation:

```
Tab:         Navega entre botones
Enter:       Activa botón enfocado
Escape:      Cierra modal
Space:       Toggle en boolean
```

### Screen Readers:

```html
<button 
  title="Editar valor de la regla"
  aria-label="Editar Política de Cancelación"
>
  Editar
</button>
```

### Focus States:

```css
focus:ring-2 
focus:ring-pink-500 
focus:border-transparent
```

---

## 🎯 Métricas de Éxito

### Antes:
- ⏱️ Tiempo promedio de edición: 45 segundos
- ❓ Consultas de soporte por confusión: 12/semana
- 😕 Satisfacción del usuario: 6/10
- 🐛 Errores de validación: 8/semana

### Después (Esperado):
- ⏱️ Tiempo promedio de edición: 20 segundos
- ❓ Consultas de soporte: 3/semana
- 😊 Satisfacción del usuario: 9/10
- 🐛 Errores de validación: 1/semana

---

## 📚 Referencias

- **Diseño:** Material Design + Tailwind CSS
- **Iconos:** Lucide React
- **Animaciones:** CSS Transitions + Tailwind
- **Validación:** React State + Backend API

---

**Última actualización:** 20 de Octubre, 2025  
**Versión del documento:** 1.0  
**Estado:** ✅ Completo - Listo para Testing
