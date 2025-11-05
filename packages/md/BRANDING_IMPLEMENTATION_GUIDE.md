# 🎨 Guía de Implementación de Branding

## ✅ Lo que ya está implementado:

### Web App (`packages/web-app`)
- ✅ `BrandingContext` - Provee el branding a toda la app
- ✅ `BrandedHeader` - Header con logo y colores personalizados
- ✅ `BrandedButton` - Botones con colores del branding
- ✅ Integrado en `App.jsx` con `<BrandingProvider>`
- ✅ `BusinessProfile` ya usa el branding en el header

### Mobile App (`packages/business-control-mobile`)
- ✅ `BrandingContext` - Provee el branding a toda la app
- ✅ `BrandedHeader` - Header nativo con logo y colores
- ✅ `BrandedButton` - Botones nativos con colores del branding
- ✅ Integrado en `App.js` con `<BrandingProvider>`

---

## 📱 Cómo Usar en la WEB

### 1. Usar el Hook en cualquier componente:

```jsx
import { useBranding } from '../contexts/BrandingContext'

function MiComponente() {
  const { branding, isLoading } = useBranding()
  
  return (
    <div>
      {/* Usar logo */}
      {branding?.logo && <img src={branding.logo} alt="Logo" />}
      
      {/* Usar colores */}
      <div style={{ backgroundColor: branding.primaryColor }}>
        Color primario
      </div>
    </div>
  )
}
```

### 2. Usar CSS Variables (automáticamente disponibles):

```css
.mi-clase {
  background-color: var(--color-primary);
  color: var(--color-secondary);
  font-family: var(--font-family);
}
```

### 3. Usar BrandedButton:

```jsx
import BrandedButton from '../components/BrandedButton'

function MiComponente() {
  return (
    <>
      <BrandedButton variant="primary" onClick={handleSave}>
        Guardar
      </BrandedButton>
      
      <BrandedButton variant="secondary" onClick={handleCancel}>
        Cancelar
      </BrandedButton>
      
      <BrandedButton variant="outline" onClick={handleEdit}>
        Editar
      </BrandedButton>
    </>
  )
}
```

### 4. Usar BrandedHeader:

```jsx
import BrandedHeader from '../components/BrandedHeader'

function MiPagina() {
  return (
    <div>
      <BrandedHeader 
        title="Mi Página"
        subtitle="Descripción de la página"
        actions={
          <button onClick={handleAction}>Acción</button>
        }
      />
      {/* Resto del contenido */}
    </div>
  )
}
```

---

## 📱 Cómo Usar en la APP MÓVIL

### 1. Usar el Hook en cualquier componente:

```javascript
import { useBranding } from '../contexts/BrandingContext'
import { View, Text, Image } from 'react-native'

function MiPantalla() {
  const { branding, colors, isLoading } = useBranding()
  
  return (
    <View>
      {/* Usar logo */}
      {branding?.logo && (
        <Image 
          source={{ uri: branding.logo }} 
          style={{ width: 50, height: 50 }}
        />
      )}
      
      {/* Usar colores */}
      <View style={{ backgroundColor: colors.primary }}>
        <Text style={{ color: '#FFFFFF' }}>Color primario</Text>
      </View>
      
      <View style={{ backgroundColor: colors.secondary }}>
        <Text style={{ color: '#FFFFFF' }}>Color secundario</Text>
      </View>
    </View>
  )
}
```

### 2. Usar BrandedButton:

```javascript
import BrandedButton from '../components/BrandedButton'

function MiPantalla() {
  return (
    <View>
      <BrandedButton 
        variant="primary" 
        size="large"
        onPress={handleSave}
      >
        Guardar
      </BrandedButton>
      
      <BrandedButton 
        variant="secondary" 
        onPress={handleCancel}
      >
        Cancelar
      </BrandedButton>
      
      <BrandedButton 
        variant="outline" 
        size="small"
        onPress={handleEdit}
      >
        Editar
      </BrandedButton>
      
      <BrandedButton 
        variant="ghost"
        loading={isSaving}
        disabled={!isValid}
        onPress={handleSubmit}
      >
        Enviar
      </BrandedButton>
    </View>
  )
}
```

### 3. Usar BrandedHeader:

```javascript
import BrandedHeader from '../components/BrandedHeader'
import { TouchableOpacity, Text } from 'react-native'

function MiPantalla() {
  return (
    <View>
      <BrandedHeader 
        title="Mi Pantalla"
        subtitle="Descripción"
        showLogo={true}
        rightComponent={
          <TouchableOpacity onPress={handleSettings}>
            <Text>⚙️</Text>
          </TouchableOpacity>
        }
      />
      {/* Resto del contenido */}
    </View>
  )
}
```

### 4. Helpers de color con opacidad:

```javascript
import { useBranding } from '../contexts/BrandingContext'

function MiPantalla() {
  const { getPrimaryColor, getSecondaryColor } = useBranding()
  
  return (
    <View>
      {/* Color primario con 50% de opacidad */}
      <View style={{ backgroundColor: getPrimaryColor(0.5) }}>
        <Text>Fondo semi-transparente</Text>
      </View>
      
      {/* Color secundario con 10% de opacidad */}
      <View style={{ backgroundColor: getSecondaryColor(0.1) }}>
        <Text>Fondo muy transparente</Text>
      </View>
    </View>
  )
}
```

---

## 🎯 Variantes de Botones

### Web y Móvil:

- **`primary`**: Color primario del branding (texto blanco)
- **`secondary`**: Color secundario del branding (texto blanco)
- **`accent`**: Color de acento del branding (texto oscuro)
- **`outline`**: Fondo transparente con borde del color primario
- **`ghost`** (solo móvil): Fondo con 10% de opacidad del color primario

---

## 🚀 Próximos Pasos

### Para aplicar el branding en TODA la app:

1. **Reemplaza botones estáticos** por `<BrandedButton>`
2. **Reemplaza headers** por `<BrandedHeader>`
3. **Usa `useBranding()`** en componentes que necesiten colores dinámicos
4. **Usa CSS Variables** en estilos estáticos (solo web)

### Páginas/Pantallas prioritarias para actualizar:

**Web:**
- ✅ BusinessProfile (ya implementado)
- [ ] Dashboard
- [ ] OnlineBookingPage (página pública - importante!)
- [ ] Modales y formularios

**Móvil:**
- [ ] Pantalla principal/Dashboard
- [ ] Pantallas de citas
- [ ] Perfil del negocio
- [ ] Navegación principal

---

## 🎨 Ejemplo Completo - Página de Booking Público (Web)

```jsx
import { useBranding } from '../../contexts/BrandingContext'
import BrandedHeader from '../../components/BrandedHeader'
import BrandedButton from '../../components/BrandedButton'

function OnlineBookingPage() {
  const { branding, isLoading } = useBranding()
  
  if (isLoading) {
    return <div>Cargando...</div>
  }
  
  return (
    <div>
      <BrandedHeader 
        title={business.name}
        subtitle="Reserva tu cita online"
      />
      
      <div className="p-6">
        <h2 style={{ color: branding.primaryColor }}>
          Selecciona un servicio
        </h2>
        
        {services.map(service => (
          <div 
            key={service.id}
            className="border-2 rounded-lg p-4 mb-4"
            style={{ borderColor: branding.primaryColor }}
          >
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            
            <BrandedButton 
              variant="primary"
              onClick={() => selectService(service)}
            >
              Seleccionar
            </BrandedButton>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 📋 Checklist de Implementación

### Web:
- [x] BrandingContext creado
- [x] BrandingProvider integrado en App.jsx
- [x] BrandedHeader creado
- [x] BrandedButton creado
- [x] CSS Variables configuradas
- [x] BusinessProfile actualizado
- [ ] OnlineBookingPage actualizado
- [ ] Dashboard actualizado
- [ ] Otros componentes actualizados

### Móvil:
- [x] BrandingContext creado
- [x] BrandingProvider integrado en App.js
- [x] BrandedHeader creado
- [x] BrandedButton creado
- [ ] Pantallas principales actualizadas
- [ ] Navegación actualizada

---

## 🐛 Troubleshooting

### El branding no se carga:
1. Verifica que el `business.id` esté disponible
2. Revisa que el backend devuelva el branding correctamente
3. Mira los logs en consola para ver si hay errores

### Los colores no se aplican:
1. Asegúrate de estar usando `useBranding()` dentro de un componente hijo de `<BrandingProvider>`
2. Verifica que el branding tenga valores (no sea `null`)
3. Revisa que estés usando las propiedades correctas (`primaryColor`, `secondaryColor`, etc.)

### El logo no aparece:
1. Verifica que `branding.logo` tenga una URL válida
2. Revisa que la URL sea accesible (Cloudinary)
3. En móvil, verifica que tengas permisos para cargar imágenes externas

---

¿Necesitas ayuda para implementar el branding en alguna página o pantalla específica?
