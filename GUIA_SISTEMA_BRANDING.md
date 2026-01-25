# Guía del Sistema de Branding

## 📖 Visión General

El sistema de branding de Beauty Control permite que cada negocio personalice los colores, fuentes y logo de su interfaz. Los cambios se aplican automáticamente en toda la aplicación.

## 🎨 Arquitectura

### 1. **BrandingContext** (`src/contexts/BrandingContext.jsx`)
- Carga el branding desde Redux cuando el usuario inicia sesión
- Establece variables CSS globales en el documento
- Proporciona el hook `useBranding()` para acceder al branding en componentes

### 2. **Variables CSS Globales** (`src/index.css`)
Definidas en `:root`:
```css
--color-primary        /* Color principal del negocio */
--color-secondary      /* Color secundario */
--color-accent         /* Color de acento */
--font-family          /* Fuente personalizada */
--color-primary-rgb    /* Versión RGB del color primario */
--color-secondary-rgb  /* Versión RGB del color secundario */
--color-accent-rgb     /* Versión RGB del color de acento */
```

### 3. **Clases CSS Branded** (`src/styles/components.css`)
Clases CSS que usan las variables globales para aplicar branding automáticamente.

## 🚀 Cómo Usar el Branding

### Opción 1: Clases CSS Branded (Recomendado)

Las clases más fáciles de usar:

```jsx
// Botones
<button className="btn-branded-primary">Guardar</button>
<button className="btn-branded-secondary">Cancelar</button>
<button className="btn-branded-outline">Ver más</button>

// Fondos y gradientes
<div className="bg-branded-gradient">
  Contenido con gradiente branded
</div>

// Textos
<h1 className="text-branded-primary">Título con color primario</h1>
<p className="text-branded-secondary">Texto con color secundario</p>

// Bordes
<div className="border-2 border-branded-primary rounded-lg">
  Card con borde branded
</div>

// Cards
<div className="card-branded card-branded-accent">
  Card con acento branded
</div>

// Inputs
<input className="input-branded" type="text" />

// Badges
<span className="badge-branded-primary">Activo</span>
<span className="badge-branded-secondary">Pendiente</span>
```

### Opción 2: Variables CSS Directas

Para estilos inline o casos especiales:

```jsx
// Estilos inline
<div style={{ backgroundColor: 'var(--color-primary)' }}>
  Fondo con color primario
</div>

<button style={{ 
  backgroundColor: 'var(--color-primary)',
  color: 'white',
  border: 'none'
}}>
  Botón personalizado
</button>

// En archivos CSS
.mi-componente {
  background-color: var(--color-primary);
  color: white;
  border: 2px solid var(--color-secondary);
}

.mi-componente:hover {
  background-color: var(--color-secondary);
}
```

### Opción 3: Hook useBranding()

Para lógica más compleja:

```jsx
import { useBranding } from '../contexts/BrandingContext'

function MiComponente() {
  const { branding, isLoading } = useBranding()

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <div>
      {/* Acceder a los valores directamente */}
      <div style={{ backgroundColor: branding.primaryColor }}>
        Color primario: {branding.primaryColor}
      </div>

      {/* Logo del negocio */}
      {branding.logo && (
        <img src={branding.logo} alt="Logo" />
      )}

      {/* Fuente personalizada */}
      <p style={{ fontFamily: branding.fontFamily }}>
        Texto con fuente personalizada
      </p>
    </div>
  )
}
```

### Opción 4: Componentes Branded Existentes

Usa los componentes ya creados:

```jsx
import BrandedButton from '../components/BrandedButton'
import BrandedHeader from '../components/BrandedHeader'

function MiPagina() {
  return (
    <div>
      <BrandedHeader title="Mi Página" />
      
      <BrandedButton variant="primary">
        Acción Principal
      </BrandedButton>
      
      <BrandedButton variant="secondary">
        Acción Secundaria
      </BrandedButton>
      
      <BrandedButton variant="outline">
        Acción Outline
      </BrandedButton>
    </div>
  )
}
```

## 📋 Clases CSS Disponibles

### Botones
- `btn-branded-primary` - Botón con color primario
- `btn-branded-secondary` - Botón con color secundario
- `btn-branded-outline` - Botón con borde del color primario

### Fondos
- `bg-branded-gradient` - Gradiente primario → secundario

### Textos
- `text-branded-primary` - Texto color primario
- `text-branded-secondary` - Texto color secundario

### Bordes
- `border-branded-primary` - Borde color primario
- `border-branded-secondary` - Borde color secundario

### Cards
- `card-branded` - Card básica con estilos branded
- `card-branded-accent` - Card con borde superior del color primario

### Inputs
- `input-branded` - Input con foco del color primario

### Badges
- `badge-branded-primary` - Badge con color primario
- `badge-branded-secondary` - Badge con color secundario

## 🎯 Migración de Componentes Existentes

### Antes (clases Tailwind hardcodeadas):
```jsx
<button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
  Guardar
</button>
```

### Después (usando branding):
```jsx
<button className="btn-branded-primary">
  Guardar
</button>
```

O si necesitas mantener algunas clases de Tailwind:

```jsx
<button className="btn-branded-primary flex items-center gap-2">
  <SaveIcon />
  Guardar
</button>
```

### Ejemplo completo de migración:

**Antes:**
```jsx
<div className="bg-white border-2 border-indigo-500 rounded-lg p-4">
  <h2 className="text-indigo-600 font-bold text-xl mb-2">Título</h2>
  <p className="text-gray-600 mb-4">Contenido</p>
  <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
    Acción
  </button>
</div>
```

**Después:**
```jsx
<div className="card-branded card-branded-accent p-4">
  <h2 className="text-branded-primary font-bold text-xl mb-2">Título</h2>
  <p className="text-gray-600 mb-4">Contenido</p>
  <button className="btn-branded-primary">
    Acción
  </button>
</div>
```

## 🔧 Configuración del Branding

Los negocios configuran su branding en:
**Perfil del Negocio → Pestaña Branding**

Campos configurables:
- `primaryColor` - Color principal (HEX)
- `secondaryColor` - Color secundario (HEX)
- `accentColor` - Color de acento (HEX)
- `fontFamily` - Fuente (nombre de fuente de Google Fonts)
- `logo` - URL del logo (cargado a Cloudinary)

## 🐛 Debugging

### Ver valores de branding en consola:
El BrandingContext imprime en consola cada vez que se aplica branding:
```
🎨 Branding aplicado: {primaryColor: '#ec4899', secondaryColor: '#8b5cf6', ...}
```

### Inspeccionar variables CSS:
Abre DevTools → Elements → Selecciona `<html>` → Busca en Styles:
```css
:root {
  --color-primary: #ec4899;
  --color-secondary: #8b5cf6;
  --color-accent: #3b82f6;
  ...
}
```

### Verificar que BrandingProvider esté activo:
```jsx
import { useBranding } from '../contexts/BrandingContext'

function TestBranding() {
  const { branding } = useBranding()
  console.log('Branding actual:', branding)
  return <div>Check console</div>
}
```

## 📝 Componente de Demo

Para probar el sistema de branding completo:

```jsx
import BrandingDemo from '../components/BrandingDemo'

// En cualquier página protegida:
<BrandingDemo />
```

Este componente muestra:
- Colores actuales del branding
- Logo (si existe)
- Todos los componentes branded disponibles
- Variables CSS globales

## ✅ Checklist de Implementación

Al crear nuevos componentes:

- [ ] ¿Usa botones? → Usar `btn-branded-primary`, `btn-branded-secondary`, `btn-branded-outline`
- [ ] ¿Usa colores de marca? → Usar `text-branded-primary`, `bg-branded-gradient`, etc.
- [ ] ¿Tiene inputs con foco? → Usar `input-branded`
- [ ] ¿Necesita logo? → Usar `useBranding()` y `branding.logo`
- [ ] ¿Necesita fuente personalizada? → Ya está aplicada globalmente vía `var(--font-family)`
- [ ] ¿Usa bordes destacados? → Usar `border-branded-primary`

## 🎓 Mejores Prácticas

1. **Prioridad de uso:**
   1. Clases CSS branded (`.btn-branded-primary`)
   2. Variables CSS (`var(--color-primary)`)
   3. Hook `useBranding()` (solo cuando necesites lógica condicional)

2. **No hardcodear colores de marca:**
   ❌ `className="bg-indigo-600"`
   ✅ `className="btn-branded-primary"`

3. **Mantener colores neutros neutros:**
   Los colores como grises, rojos (errores), verdes (éxito) pueden mantenerse:
   - `text-gray-600`, `bg-gray-50`, `border-gray-200` ✅
   - `bg-red-500` (errores), `bg-green-500` (éxito) ✅

4. **Combinar con Tailwind:**
   Puedes combinar clases branded con utilidades de Tailwind:
   ```jsx
   <button className="btn-branded-primary flex items-center gap-2 shadow-lg">
     <Icon /> Texto
   </button>
   ```

## 🔄 Actualización Automática

El branding se actualiza automáticamente cuando:
- El usuario cambia el branding en la configuración
- El usuario cambia de negocio
- La página se recarga

No es necesario forzar actualizaciones manualmente.

## 🌐 Soporte de Navegadores

El sistema funciona en todos los navegadores modernos que soporten:
- CSS Custom Properties (variables CSS)
- ES6+ JavaScript

## 📚 Recursos Adicionales

- Ver implementación completa: `src/contexts/BrandingContext.jsx`
- Ver clases CSS: `src/styles/components.css`
- Ver configuración Tailwind: `tailwind.config.js`
- Ver componentes ejemplo: `src/components/BrandedButton.jsx`, `src/components/BrandedHeader.jsx`
- Ver demo: `src/components/BrandingDemo.jsx`
