# 🎨 Guía Visual: ServiceFormModal con Paquetes

## 📱 Vista Mobile (< 640px)

### 1. Servicio Individual (Comportamiento Normal)
```
┌─────────────────────────────────┐
│  Nuevo Procedimiento        [×] │
├─────────────────────────────────┤
│                                 │
│  Nombre del Procedimiento *     │
│  ┌────────────────────────────┐ │
│  │ Aplicación de Botox        │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌────────────────────────────┐ │
│  │ ☐ ¿Es un paquete multi-    │ │
│  │   sesión?                   │ │
│  └────────────────────────────┘ │
│                                 │
│  Duración (minutos) *           │
│  ┌────────────────────────────┐ │
│  │ 60                         │ │
│  └────────────────────────────┘ │
│                                 │
│  Precio (COP) *                 │
│  ┌────────────────────────────┐ │
│  │ 150000                     │ │
│  └────────────────────────────┘ │
│                                 │
│  Categoría                      │
│  ┌────────────────────────────┐ │
│  │ Estética Facial            │ │
│  └────────────────────────────┘ │
│                                 │
│  ... más campos ...             │
│                                 │
│  ┌────────────────────────────┐ │
│  │  Crear Procedimiento       │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │      Cancelar              │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

### 2. Paquete Multi-Sesión (MULTI_SESSION)
```
┌─────────────────────────────────┐
│  Nuevo Procedimiento        [×] │
├─────────────────────────────────┤
│                                 │
│  Nombre del Procedimiento *     │
│  ┌────────────────────────────┐ │
│  │ Láser Facial Completo      │ │
│  └────────────────────────────┘ │
│                                 │
│  ┌────────────────────────────┐ │
│  │ ☑ ¿Es un paquete multi-    │ │
│  │   sesión?                   │ │
│  │   Marca esta opción si...   │ │
│  └────────────────────────────┘ │
│                                 │
│ ╔═════════════════════════════╗ │
│ ║ Configuración del Paquete   ║ │
│ ╠═════════════════════════════╣ │
│ ║                             ║ │
│ ║ Tipo de Paquete *           ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ Múltiples Sesiones   [▼]│ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║ Varias sesiones del mismo... ║ │
│ ║                             ║ │
│ ║ Número de Sesiones *        ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ 5                       │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ Intervalo entre Sesiones    ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ 30 días                 │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ Precio por Sesión (COP) *   ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ 100000                  │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ Descuento por Paquete (%)   ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ 10                      │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ Descripción del Paquete     ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ Tratamiento completo... │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ Precio Total:           │ ║ │
│ ║ │  $450,000 COP           │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ ☑ Permitir Pago Parcial     ║ │
│ ║   Permite que el cliente... ║ │
│ ╚═════════════════════════════╝ │
│                                 │
│  Duración (minutos) *           │
│  ┌────────────────────────────┐ │
│  │ 45                         │ │
│  └────────────────────────────┘ │
│  Duración de cada sesión        │
│                                 │
│  ... más campos ...             │
│                                 │
│  ┌────────────────────────────┐ │
│  │  Crear Procedimiento       │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │      Cancelar              │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
```

### 3. Paquete con Mantenimiento (WITH_MAINTENANCE)
```
┌─────────────────────────────────┐
│  Nuevo Procedimiento        [×] │
├─────────────────────────────────┤
│                                 │
│  Nombre del Procedimiento *     │
│  ┌────────────────────────────┐ │
│  │ Hydrafacial + Mantenimiento│ │
│  └────────────────────────────┘ │
│                                 │
│  ┌────────────────────────────┐ │
│  │ ☑ ¿Es un paquete multi-    │ │
│  │   sesión?                   │ │
│  └────────────────────────────┘ │
│                                 │
│ ╔═════════════════════════════╗ │
│ ║ Configuración del Paquete   ║ │
│ ╠═════════════════════════════╣ │
│ ║                             ║ │
│ ║ Tipo de Paquete *           ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ Sesión + Mantenimiento  │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║ Una sesión principal...     ║ │
│ ║                             ║ │
│ ║ Precio Sesión Principal *   ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ 200000                  │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ Precio Mantenimiento *      ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ 80000                   │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ Número de Mantenimientos *  ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ 6                       │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ Intervalo entre Sesiones    ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ 30 días                 │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ Descripción del Paquete     ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ Hydrafacial completo... │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ ┌─────────────────────────┐ ║ │
│ ║ │ Precio Total:           │ ║ │
│ ║ │  $680,000 COP           │ ║ │
│ ║ └─────────────────────────┘ ║ │
│ ║                             ║ │
│ ║ ☐ Permitir Pago Parcial     ║ │
│ ╚═════════════════════════════╝ │
│                                 │
│  ... más campos ...             │
│                                 │
└─────────────────────────────────┘
```

## 🖥️ Vista Desktop (≥ 640px)

### Paquete Multi-Sesión en 2 Columnas
```
┌──────────────────────────────────────────────────────────────┐
│  Nuevo Procedimiento                                     [×] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Nombre del Procedimiento *                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Láser Facial Completo                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ☑ ¿Es un paquete de múltiples sesiones?              │  │
│  │   Marca esta opción si este procedimiento requiere... │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│ ╔════════════════════════════════════════════════════════╗  │
│ ║          Configuración del Paquete                     ║  │
│ ╠════════════════════════════════════════════════════════╣  │
│ ║                                                        ║  │
│ ║  Tipo de Paquete *                                     ║  │
│ ║  ┌────────────────────────────────────────────────┐   ║  │
│ ║  │ Múltiples Sesiones Iguales                 [▼] │   ║  │
│ ║  └────────────────────────────────────────────────┘   ║  │
│ ║  Varias sesiones del mismo procedimiento (ej: 5...)   ║  │
│ ║                                                        ║  │
│ ║  ┌────────────────────┐  ┌────────────────────────┐   ║  │
│ ║  │ Número de Sesiones │  │ Intervalo entre Sesiones│  ║  │
│ ║  │ ┌────────────────┐ │  │ ┌─────────────────────┐│  ║  │
│ ║  │ │ 5              │ │  │ │ 30 días             ││  ║  │
│ ║  │ └────────────────┘ │  │ └─────────────────────┘│  ║  │
│ ║  └────────────────────┘  └────────────────────────┘   ║  │
│ ║                                                        ║  │
│ ║  ┌────────────────────┐  ┌────────────────────────┐   ║  │
│ ║  │ Precio por Sesión  │  │ Descuento por Paquete  │   ║  │
│ ║  │ ┌────────────────┐ │  │ ┌─────────────────────┐│  ║  │
│ ║  │ │ 100000         │ │  │ │ 10 %                ││  ║  │
│ ║  │ └────────────────┘ │  │ └─────────────────────┘│  ║  │
│ ║  └────────────────────┘  └────────────────────────┘   ║  │
│ ║                                                        ║  │
│ ║  Descripción del Paquete                               ║  │
│ ║  ┌────────────────────────────────────────────────┐   ║  │
│ ║  │ Tratamiento completo de láser facial con 5... │   ║  │
│ ║  └────────────────────────────────────────────────┘   ║  │
│ ║                                                        ║  │
│ ║  ┌────────────────────────────────────────────────┐   ║  │
│ ║  │ Precio Total del Paquete:      $450,000 COP   │   ║  │
│ ║  └────────────────────────────────────────────────┘   ║  │
│ ║                                                        ║  │
│ ║  ☑ Permitir Pago Parcial                              ║  │
│ ║    Permite que el cliente pague el paquete en cuotas  ║  │
│ ╚════════════════════════════════════════════════════════╝  │
│                                                              │
│  ┌────────────────────┐  ┌────────────────────────────┐    │
│  │ Duración (minutos) │  │                            │    │
│  │ ┌────────────────┐ │  │  (Precio solo si NO es      │    │
│  │ │ 45             │ │  │   paquete)                 │    │
│  │ └────────────────┘ │  │                            │    │
│  │ Duración de cada   │  └────────────────────────────┘    │
│  │ sesión individual  │                                    │
│  └────────────────────┘                                    │
│                                                              │
│  ... más campos (categoría, color, tiempos, etc) ...        │
│                                                              │
│  ┌────────────────────────┐  ┌──────────────────────┐      │
│  │  Crear Procedimiento   │  │      Cancelar        │      │
│  └────────────────────────┘  └──────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

## 🎨 Esquema de Colores

### Servicio Normal
- 🔵 Inputs: `focus:ring-blue-500`
- 🔵 Botón principal: `bg-blue-600`
- 🔵 Checkbox "es paquete": `bg-blue-50 border-blue-200`

### Configuración de Paquete
- 🟣 Fondo: `bg-purple-50`
- 🟣 Bordes: `border-purple-200`
- 🟣 Inputs: `focus:ring-purple-500`
- 🟣 Checkboxes: `text-purple-600`
- 🟣 Precio total: `text-purple-600`

### Estados
- ⚠️ Error: `bg-red-50 border-red-200 text-red-800`
- ✅ Success: implícito al cerrar modal
- ⏳ Loading: `disabled:opacity-50`

## 🔄 Flujo de Interacción

### Escenario 1: Crear Servicio Simple
```
Usuario abre modal
    ↓
Llena nombre, duración, precio
    ↓
NO marca "Es un paquete"
    ↓
Llena resto de campos
    ↓
Click "Crear Procedimiento"
    ↓
Backend valida y guarda
    ↓
Modal se cierra
    ↓
Lista de servicios se actualiza
```

### Escenario 2: Crear Paquete Multi-Sesión
```
Usuario abre modal
    ↓
Llena nombre
    ↓
MARCA "Es un paquete" ☑
    ↓
Aparece sección púrpura
    ↓
Selecciona "Múltiples Sesiones Iguales"
    ↓
Llena: 5 sesiones, $100k c/u, 10% desc
    ↓
Ve precio total: $450,000 (automático)
    ↓
Marca "Permitir pago parcial" (opcional)
    ↓
Llena duración (45 min por sesión)
    ↓
Llena resto de campos
    ↓
Click "Crear Procedimiento"
    ↓
Backend valida packageConfig
    ↓
Backend guarda con isPackage=true
    ↓
Modal se cierra
```

### Escenario 3: Cálculo Automático de Precio
```
Usuario marca "Es un paquete"
    ↓
Selecciona "Múltiples Sesiones"
    ↓
Escribe: 3 sesiones
    ↓
useEffect detecta cambio
    ↓
Escribe: $100,000 por sesión
    ↓
useEffect recalcula: $300,000
    ↓
Campo "Precio Total" se actualiza
    ↓
Usuario agrega descuento: 15%
    ↓
useEffect recalcula: $255,000
    ↓
Campo "Precio Total" actualizado
```

### Escenario 4: Convertir Servicio a Paquete
```
Usuario edita servicio existente
    ↓
Modal se llena con datos actuales
    ↓
Usuario marca "Es un paquete" ☑
    ↓
Aparece configuración de paquete
    ↓
Usuario configura paquete
    ↓
Price original se ignora
    ↓
totalPrice se calcula automáticamente
    ↓
Usuario guarda
    ↓
Backend actualiza servicio
```

## 📊 Datos en Diferentes Estados

### Estado Inicial (Nuevo Servicio)
```javascript
formData = {
  name: '',
  duration: 30,
  price: '',
  isPackage: false,
  packageType: 'SINGLE',
  totalPrice: '',
  // ...
}

packageConfig = {
  sessions: 3,
  sessionInterval: 30,
  pricing: { perSession: '', discount: 0 }
}
```

### Después de Marcar "Es Paquete" y Configurar
```javascript
formData = {
  name: 'Láser Facial Completo',
  duration: 45,
  price: '', // Ignorado
  isPackage: true,
  packageType: 'MULTI_SESSION',
  totalPrice: '450000', // Auto-calculado
  allowPartialPayment: true,
  pricePerSession: '100000'
}

packageConfig = {
  sessions: 5,
  sessionInterval: 30,
  pricing: {
    perSession: '100000',
    discount: 10
  },
  description: 'Tratamiento completo...'
}
```

### Enviado al Backend
```javascript
{
  name: 'Láser Facial Completo',
  duration: 45,
  price: 450000, // totalPrice
  isPackage: true,
  packageType: 'MULTI_SESSION',
  totalPrice: 450000,
  allowPartialPayment: true,
  pricePerSession: 100000,
  packageConfig: {
    sessions: 5,
    sessionInterval: 30,
    description: 'Tratamiento completo...',
    pricing: {
      perSession: 100000,
      discount: 10
    }
  }
}
```

## 🎯 Elementos de Accesibilidad

### Touch Targets (Mobile)
- ✅ Inputs: `min-h-[44px]`
- ✅ Checkboxes: `h-5 w-5` (20px)
- ✅ Botones: `py-3` (mín 44px total)
- ✅ Select: `py-2` (40px con border/padding)

### Labels
- ✅ Todos los inputs tienen `<label>`
- ✅ Labels asociados con `htmlFor`
- ✅ Asteriscos (*) para campos requeridos
- ✅ Textos de ayuda bajo inputs complejos

### Navegación
- ✅ Tab order lógico (top to bottom)
- ✅ Focus visible en todos los elementos
- ✅ Enter para submit form
- ✅ Escape para cerrar modal (implementado en padre)

### Semántica
- ✅ `<form>` con `onSubmit`
- ✅ `type="number"` para precios/duraciones
- ✅ `required` en campos obligatorios
- ✅ `min`/`max`/`step` en inputs numéricos

## 🔍 Validaciones Visuales

### Campo Vacío Requerido
```
┌─────────────────────────────┐
│ Nombre *                    │
│ ┌─────────────────────────┐ │
│ │                         │ │ ← Rojo si submit sin llenar
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### Precio Calculado
```
╔═══════════════════════════════╗
║ ┌───────────────────────────┐ ║
║ │ Precio Total:             │ ║
║ │  $450,000 COP             │ ║ ← Verde/Púrpura destacado
║ └───────────────────────────┘ ║
╚═══════════════════════════════╝
```

### Error General
```
┌─────────────────────────────────┐
│ ⚠️ Especifica precio por sesión │
│    y al menos 2 sesiones        │ ← Rojo, destacado
└─────────────────────────────────┘
```

---

**Nota:** Esta guía visual representa la estructura y flujo del componente. Los colores reales se definen con Tailwind CSS en el código.
