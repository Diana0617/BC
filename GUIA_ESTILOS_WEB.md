# 🎨 GUÍA DE ESTILO - Beauty Control Web App

## 📋 Paleta de Colores

### Colores Principales

#### Primary (Fucsia) - Para CTAs y elementos destacados
```jsx
// Uso: Botones principales, links, elementos interactivos destacados
bg-primary-500     // #ec4899 - Color principal
bg-primary-600     // Hover states
text-primary-500   // Textos fucsia
border-primary-500 // Bordes fucsia
```

#### Secondary (Purple) - Complemento del fucsia
```jsx
// Uso: Gradientes, elementos secundarios
bg-secondary-500   // #8b5cf6
```

#### Gradiente Principal (Fucsia → Purple)
```jsx
// Uso: Botones principales, headers importantes
bg-gradient-to-r from-primary-500 to-secondary-500
bg-gradient-primary // Clase predefinida
```

### Backgrounds

```jsx
bg-background          // #ffffff - Fondo principal (SIEMPRE blanco)
bg-background-secondary // #f8fafc - Fondo secundario (gris muy claro)
bg-background-tertiary  // #f1f5f9 - Fondo terciario
bg-background-dark      // #1e293b - Fondo oscuro (login, etc)
```

### Textos

```jsx
text-text-primary   // #1e293b - Texto principal (gris muy oscuro)
text-text-secondary // #475569 - Texto secundario
text-text-tertiary  // #64748b - Texto terciario
text-text-disabled  // #94a3b8 - Texto deshabilitado
text-text-on-dark   // #f8fafc - Texto sobre fondos oscuros
```

### Bordes

```jsx
border-border       // #e2e8f0 - Border por defecto
border-border-light // #f1f5f9 - Border claro
border-border-dark  // #cbd5e1 - Border más visible
border-border-focus // #ec4899 - Border en foco (fucsia)
```

### Estados

```jsx
// Success (Verde)
bg-success          // #10b981
bg-success-light    // #d1fae5
text-success-dark   // #059669

// Error (Rojo)
bg-error            // #ef4444
bg-error-light      // #fee2e2
text-error-dark     // #dc2626

// Warning (Amarillo/Ámbar)
bg-warning          // #f59e0b
bg-warning-light    // #fef3c7
text-warning-dark   // #d97706

// Info (Azul)
bg-info             // #3b82f6
bg-info-light       // #dbeafe
text-info-dark      // #1e40af
```

### Colores de Acento (Funcionales)

```jsx
// Blue (Para emails, información)
bg-accent-blue      // #3b82f6
from-accent-blue to-accent-blue-light // Gradiente azul-cyan

// Green (Para success, confirmaciones)
bg-accent-green     // #10b981
from-accent-green to-accent-green-light // Gradiente verde-teal

// Amber (Para warnings, alertas)
bg-accent-amber     // #f59e0b
```

---

## 🧩 Componentes Reutilizables

### Botones

```jsx
// Botón Principal (Fucsia con gradiente)
<button className="btn-primary">
  Guardar Cambios
</button>

// Botón Secundario
<button className="btn-secondary">
  Cancelar
</button>

// Botón Outline
<button className="btn-outline">
  Ver Más
</button>

// Botón Ghost (sin fondo)
<button className="btn-ghost">
  Editar
</button>

// Botón Peligro
<button className="btn-danger">
  Eliminar
</button>

// Botón Success
<button className="btn-success">
  Confirmar
</button>
```

### Cards

```jsx
// Card Normal
<div className="card p-6">
  <h3>Título del Card</h3>
  <p>Contenido...</p>
</div>

// Card Grande
<div className="card-lg p-8">
  <h2>Título Grande</h2>
  <p>Contenido...</p>
</div>

// Card Oscuro
<div className="card-dark p-6">
  <h3>Título en fondo oscuro</h3>
</div>

// Card con Glassmorphism
<div className="glass rounded-3xl p-8">
  <h3>Card con efecto vidrio</h3>
</div>
```

### Inputs

```jsx
// Input Base
<input 
  type="text"
  className="input-base"
  placeholder="Ingresa tu nombre"
/>

// Input con Error
<input 
  type="email"
  className="input-base input-error"
  placeholder="Email inválido"
/>

// Input con Icono (estructura completa)
<div className="input-with-icon">
  <div className="icon-gradient-primary">
    <Mail className="w-5 h-5 text-white" />
  </div>
  <input 
    type="email"
    className="flex-1 bg-transparent border-none outline-none"
    placeholder="tucorreo@example.com"
  />
</div>

// Label
<label className="label-base">
  Nombre completo
</label>
```

### Alertas

```jsx
// Success
<div className="alert-success">
  <CheckCircle className="w-5 h-5" />
  <p>Operación completada exitosamente</p>
</div>

// Error
<div className="alert-error">
  <AlertCircle className="w-5 h-5" />
  <p>Ha ocurrido un error</p>
</div>

// Warning
<div className="alert-warning">
  <AlertTriangle className="w-5 h-5" />
  <p>Ten cuidado con esta acción</p>
</div>

// Info
<div className="alert-info">
  <Info className="w-5 h-5" />
  <p>Información importante</p>
</div>
```

### Badges

```jsx
<span className="badge-primary">Nuevo</span>
<span className="badge-success">Activo</span>
<span className="badge-warning">Pendiente</span>
<span className="badge-error">Cancelado</span>
<span className="badge-info">Info</span>
```

---

## 📐 Layouts

### Página Completa con Fondo Blanco

```jsx
<div className="page-container">
  <div className="content-wrapper">
    <h1 className="section-title">Título de la Página</h1>
    <p className="section-subtitle">Subtítulo descriptivo</p>
    
    {/* Contenido */}
  </div>
</div>
```

### Página con Fondo Oscuro (Login, Auth)

```jsx
<div className="page-container-dark flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    <div className="glass rounded-3xl p-8">
      {/* Contenido */}
    </div>
  </div>
</div>
```

### Contenedor de Contenido

```jsx
// Ancho máximo normal (7xl)
<div className="content-wrapper">
  {/* Contenido */}
</div>

// Ancho máximo reducido (4xl) - Para formularios, etc
<div className="content-wrapper-sm">
  {/* Contenido */}
</div>
```

---

## ✨ Efectos y Animaciones

### Animaciones de Entrada

```jsx
// Fade in
<div className="animate-fade-in">
  Aparece gradualmente
</div>

// Fade in desde abajo
<div className="animate-fade-in-up">
  Aparece desde abajo
</div>

// Bounce in
<div className="animate-bounce-in">
  Aparece con rebote
</div>

// Slide desde derecha
<div className="animate-slide-in-right">
  Desliza desde derecha
</div>
```

### Efectos Hover

```jsx
// Elevación
<div className="hover-lift">
  Se eleva al hacer hover
</div>

// Escala
<div className="hover-scale">
  Crece al hacer hover
</div>

// Brillo/Glow
<div className="hover-glow">
  Brilla al hacer hover
</div>
```

### Gradientes de Iconos

```jsx
// Gradiente Principal (Fucsia → Purple)
<div className="icon-gradient-primary">
  <Icon className="w-5 h-5 text-white" />
</div>

// Gradiente Azul
<div className="icon-gradient-blue">
  <Icon className="w-5 h-5 text-white" />
</div>

// Gradiente Verde
<div className="icon-gradient-green">
  <Icon className="w-5 h-5 text-white" />
</div>
```

---

## 📝 Tipografía

### Títulos

```jsx
<h1 className="heading-1">Título Principal</h1>      // 4xl
<h2 className="heading-2">Título Secundario</h2>    // 3xl
<h3 className="heading-3">Título Terciario</h3>     // 2xl
<h4 className="heading-4">Título Pequeño</h4>       // xl
```

### Textos de Cuerpo

```jsx
<p className="body-large">Texto grande</p>          // lg
<p className="body-base">Texto normal</p>           // base
<p className="body-small">Texto pequeño</p>         // sm
<p className="body-xs">Texto muy pequeño</p>        // xs
```

---

## 🎯 Reglas de Uso

### ✅ SIEMPRE:

1. **Fondo blanco en páginas principales**: `bg-background`
2. **Texto principal gris oscuro**: `text-text-primary`
3. **Detalles en fucsia**: `text-primary-500` o `bg-primary-500`
4. **Botones principales con gradiente**: `btn-primary` o `bg-gradient-primary`
5. **Cards con shadow suave**: `card` o `card-lg`
6. **Bordes suaves**: `border-border`

### ❌ EVITAR:

1. Usar colores HEX directamente (usar las clases definidas)
2. Mezclar múltiples colores de acento sin razón
3. Fondos de colores intensos en páginas principales
4. Textos negros puros (#000000) - usar `text-text-primary`
5. Botones sin estados hover/disabled

---

## 📦 Ejemplo de Página Completa

```jsx
import { Mail, Lock, Building2 } from 'lucide-react'

const ExamplePage = () => {
  return (
    <div className="page-container">
      <div className="content-wrapper-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="heading-1 mb-2">Título de la Página</h1>
          <p className="body-large">Descripción de la página</p>
        </div>

        {/* Card Principal */}
        <div className="card-lg p-8">
          <h2 className="heading-3 mb-6">Formulario de Ejemplo</h2>

          {/* Alerta Info */}
          <div className="alert-info mb-6">
            <Info className="w-5 h-5" />
            <p className="text-sm">Información importante antes de continuar</p>
          </div>

          <form className="space-y-6">
            {/* Input con Icono */}
            <div>
              <label className="label-base">Correo electrónico</label>
              <div className="input-with-icon">
                <div className="icon-gradient-blue">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <input 
                  type="email"
                  className="flex-1 bg-transparent border-none outline-none"
                  placeholder="tucorreo@example.com"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button type="submit" className="btn-primary flex-1">
                Guardar
              </button>
              <button type="button" className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Cards de Información */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="card p-6 hover-lift">
            <div className="icon-gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="heading-4 mb-2">Característica 1</h3>
            <p className="body-small">Descripción de la característica</p>
          </div>
          {/* Más cards... */}
        </div>
      </div>
    </div>
  )
}
```

---

## 🔧 Configuración

Todos estos estilos están definidos en:
- `tailwind.config.js` - Configuración de colores y utilidades
- `src/styles/components.css` - Componentes reutilizables
- `src/index.css` - Importación y configuración base

Para usar en cualquier componente, simplemente aplica las clases:

```jsx
<div className="card p-6">
  <h3 className="heading-3 text-primary-500">Título</h3>
  <p className="body-base">Contenido del card</p>
  <button className="btn-primary mt-4">Acción</button>
</div>
```

---

## 🎨 Herramientas de Diseño

Para visualizar los colores:
- Primary: `#ec4899` 🌸
- Secondary: `#8b5cf6` 💜
- Background: `#ffffff` ⚪
- Text Primary: `#1e293b` ⚫
- Text Secondary: `#475569` 🔘

---

**Nota**: Esta guía se actualizará conforme se agreguen más componentes y patrones.
