# 🔐 PLAN DE MIGRACIÓN: AUTENTICACIÓN MOBILE → WEB

## 📊 ANÁLISIS ACTUAL

### MOBILE tiene:
1. ✅ **LoginScreen.js** - Pantalla completa con:
   - Campo subdomain (código de negocio)
   - Email y password
   - Diseño moderno con gradientes
   - Instrucciones claras para subdomain
   - Integración con Redux
   - Auto-detección de rol

2. ⚠️ **ForgotPasswordScreen.js** - Básica "Próximamente"

3. ✅ **RoleSelectionScreen.js** - Selector de rol (no usado actualmente)

### WEB tiene:
1. ✅ **LoginModal.jsx** - Modal simple sin:
   - ❌ Campo subdomain
   - ❌ Diseño similar al mobile
   - ✓ Email y password
   - ✓ Forgot password integrado
   - ✓ Integración con Redux

2. ✅ **ResetPasswordPage.jsx** - Página completa funcional

3. ❌ **No hay registro público** - Se registra desde admin/owner

---

## 🎯 OBJETIVO

Adaptar las pantallas de auth de mobile a web para:
1. Agregar campo **subdomain** al login web
2. Mejorar el diseño visual del login
3. Crear página completa de login (no solo modal)
4. Mantener funcionalidad de forgot password
5. Preparar para futura funcionalidad de registro

---

## 📝 PLAN DE IMPLEMENTACIÓN

### **FASE 1: Login Page Completa con Subdomain**
**Prioridad: CRÍTICA**

#### Archivos a crear:
```
packages/web-app/src/pages/auth/
  ├── LoginPage.jsx          (nuevo - página completa)
  ├── ForgotPasswordPage.jsx (nuevo - página completa)
  └── RegisterPage.jsx       (nuevo - futuro)
```

#### Archivos a mantener:
- `LoginModal.jsx` - Mantener para uso en landing/subscription
- `ResetPasswordPage.jsx` - Ya existe y funciona

---

## 🔨 IMPLEMENTACIÓN DETALLADA

### 1. LoginPage.jsx - Nueva página completa

**Características a implementar:**

#### Layout y Diseño:
```javascript
- Gradiente de fondo (similar a mobile)
- Card central con glassmorphism
- Logo de Control de Negocios
- Responsive (desktop, tablet, mobile)
- Animaciones sutiles
```

#### Campos del formulario:
```javascript
1. Subdomain (código de negocio)
   - Label: "Código de tu negocio"
   - Placeholder: "bella-vista"
   - Helper text: "Tu dominio completo: {subdomain}.controldenegocios.com"
   - Warning box explicativo (igual que mobile)
   - Icon: Business/Shop
   - Lowercase automático
   - Validación requerida

2. Email
   - Label: "Correo electrónico"
   - Placeholder: "tucorreo@example.com"
   - Type: email
   - Icon: Mail
   - Validación requerida

3. Password
   - Label: "Contraseña"
   - Placeholder: "Tu contraseña"
   - Type: password (toggle show/hide)
   - Icon: Lock
   - Eye icon para mostrar/ocultar
   - Validación requerida
```

#### Funcionalidades:
```javascript
- Integración con Redux (loginUser action)
- Manejo de errores visual
- Loading states
- Auto-redirect según rol:
  * OWNER → /owner/dashboard
  * BUSINESS/BUSINESS_OWNER → /business/profile
  * BUSINESS_SPECIALIST → /dashboard/specialist
  * SPECIALIST → /dashboard/specialist
  * RECEPTIONIST → /dashboard/receptionist
  * RECEPTIONIST_SPECIALIST → /dashboard/receptionist-specialist
- Link a "¿Olvidaste tu contraseña?"
- Link a registro (futuro)
```

#### Estructura del componente:
```javascript
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '@shared/store/slices/authSlice'
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle 
} from 'lucide-react'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    subdomain: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  
  // ... resto de la implementación
}
```

---

### 2. ForgotPasswordPage.jsx - Nueva página completa

**Características a implementar:**

#### Layout similar a LoginPage:
```javascript
- Mismo gradiente de fondo
- Card central
- Logo
- Responsive
```

#### Campos del formulario:
```javascript
1. Subdomain
   - Igual que en login
   
2. Email
   - Campo principal para recuperación
```

#### Funcionalidades:
```javascript
- Dispatch forgotPassword action
- Estados: idle, loading, success, error
- Mensaje de éxito claro
- Link para volver al login
- Timer de 60 segundos para reenviar
```

---

### 3. Actualizar Routing

**Archivo a modificar:** `packages/web-app/src/App.jsx`

```javascript
// Rutas públicas
<Route path="/login" element={<LoginPage />} />
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/register" element={<RegisterPage />} /> // Futuro
<Route path="/reset-password" element={<ResetPasswordPage />} />

// Mantener modal para landing
// LoginModal se usa en LandingPage y SubscriptionPage
```

---

### 4. Actualizar Redux Action (si es necesario)

**Archivo a verificar:** `@shared/store/slices/authSlice.js`

Asegurar que `loginUser` acepte subdomain:
```javascript
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ credentials, rememberMe }, { rejectWithValue }) => {
    try {
      // credentials debe incluir: email, password, subdomain
      const response = await authAPI.login(credentials)
      // ...
    }
  }
)
```

---

## 🎨 DISEÑO VISUAL

### Paleta de colores (de mobile):
```css
Gradiente principal: ['#1e293b', '#334155', '#475569']
Color primario: #ec4899 (pink)
Color secundario: #8b5cf6 (purple)
Gradiente botón: ['#ec4899', '#8b5cf6']

Alternativas:
- Email: ['#3b82f6', '#06b6d4'] (blue-cyan)
- Password: ['#10b981', '#14b8a6'] (green-teal)
- Subdomain: ['#ec4899', '#8b5cf6'] (pink-purple)
```

### Componentes visuales:
```javascript
1. Input con icono en gradiente
   - Fondo gris claro
   - Border de 2px
   - Border-radius 16px
   - Icono en cuadrado con gradiente
   - Altura 64px

2. Botón principal
   - Gradiente de fondo
   - Texto blanco bold
   - Shadow grande
   - Hover: shadow XL + translate -0.5
   - Border-radius 16px
   - Altura 64px

3. Warning box (para subdomain)
   - Fondo amarillo claro #fef3c7
   - Border-left amarillo #f59e0b
   - Padding 12px
   - Border-radius 8px
   - Icono 💡
```

---

## 📱 RESPONSIVE DESIGN

### Desktop (>1024px):
```css
- Card centrado, max-width: 480px
- Padding generoso
- Inputs grandes (h-16)
- Texto legible
```

### Tablet (768px - 1024px):
```css
- Card centrado, max-width: 400px
- Padding medio
- Inputs medianos (h-14)
```

### Mobile (<768px):
```css
- Full width con padding lateral
- Inputs compactos (h-12)
- Texto más pequeño
- Stack vertical de elementos
```

---

## 🧪 TESTING

### Tests a implementar:

1. **Validación de campos:**
   - [ ] Subdomain requerido
   - [ ] Email requerido y formato válido
   - [ ] Password requerido

2. **Integración:**
   - [ ] Login exitoso redirige correctamente
   - [ ] Errores se muestran visualmente
   - [ ] Loading states funcionan

3. **Navegación:**
   - [ ] Link a forgot password funciona
   - [ ] Redirect según rol funciona
   - [ ] Volver desde forgot password funciona

4. **Responsive:**
   - [ ] Se ve bien en desktop
   - [ ] Se ve bien en tablet
   - [ ] Se ve bien en mobile

---

## 🔄 COMPARACIÓN: MODAL vs PÁGINA

### Mantener LoginModal para:
- Landing page pública
- Subscription page
- Acceso rápido desde páginas públicas

### Nueva LoginPage para:
- Ruta principal /login
- Acceso desde navegación
- Experiencia completa de login
- Mejor UX para usuarios registrados

### Ventajas de tener ambos:
1. ✅ Flexibilidad de uso
2. ✅ Mejor UX en cada contexto
3. ✅ No romper funcionalidad existente
4. ✅ Modal para conversión rápida
5. ✅ Página para experiencia completa

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Paso 1: Crear LoginPage.jsx
- [ ] Estructura básica del componente
- [ ] Layout con gradiente
- [ ] Logo y título
- [ ] Formulario con 3 campos (subdomain, email, password)
- [ ] Warning box para subdomain
- [ ] Botón de login con loading
- [ ] Link a forgot password
- [ ] Integración con Redux
- [ ] Manejo de errores
- [ ] Redirección por rol
- [ ] Responsive design
- [ ] Estilos con Tailwind

### Paso 2: Crear ForgotPasswordPage.jsx
- [ ] Estructura básica del componente
- [ ] Layout similar a LoginPage
- [ ] Formulario con subdomain y email
- [ ] Integración con Redux
- [ ] Estados de success/error
- [ ] Link para volver a login
- [ ] Responsive design

### Paso 3: Actualizar Routing
- [ ] Agregar ruta /login
- [ ] Agregar ruta /forgot-password
- [ ] Verificar que /reset-password funciona
- [ ] Actualizar redirects de auth

### Paso 4: Testing
- [ ] Probar login exitoso
- [ ] Probar errores de validación
- [ ] Probar forgot password
- [ ] Probar responsive
- [ ] Probar en diferentes roles

### Paso 5: Actualizar LoginModal (opcional)
- [ ] Agregar campo subdomain al modal
- [ ] Mantener funcionalidad existente

---

## 🚀 ORDEN DE IMPLEMENTACIÓN SUGERIDO

### Sprint 1 (Día 1-2):
1. Crear `LoginPage.jsx` con estructura básica
2. Implementar campos del formulario
3. Integrar con Redux
4. Agregar ruta en App.jsx

### Sprint 2 (Día 3):
1. Crear `ForgotPasswordPage.jsx`
2. Integrar con Redux
3. Agregar ruta en App.jsx
4. Testing básico

### Sprint 3 (Día 4):
1. Refinamiento visual
2. Responsive design
3. Animaciones y transitions
4. Testing completo

### Sprint 4 (Día 5):
1. Actualizar LoginModal con subdomain (opcional)
2. Documentación
3. Testing final
4. Deploy

---

## 📝 CÓDIGO DE EJEMPLO

### Estructura de LoginPage.jsx:

```javascript
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '@shared/store/slices/authSlice'
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  Loader2
} from 'lucide-react'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoggingIn, loginError } = useSelector(state => state.auth)

  const [formData, setFormData] = useState({
    subdomain: '',
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'subdomain' ? value.toLowerCase() : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const result = await dispatch(loginUser({ 
        credentials: formData, 
        rememberMe: false 
      })).unwrap()
      
      // Redirección por rol
      if (result.user?.role === 'OWNER') {
        navigate('/owner/dashboard')
      } else if (result.user?.role === 'BUSINESS_OWNER' || result.user?.role === 'BUSINESS') {
        navigate('/business/profile')
      } else if (result.user?.role === 'BUSINESS_SPECIALIST' || result.user?.role === 'SPECIALIST') {
        navigate('/dashboard/specialist')
      } else if (result.user?.role === 'RECEPTIONIST') {
        navigate('/dashboard/receptionist')
      } else if (result.user?.role === 'RECEPTIONIST_SPECIALIST') {
        navigate('/dashboard/receptionist-specialist')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 flex items-center justify-center p-4">
      {/* Card principal */}
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4">
            <img src="/logo-cn.png" alt="Logo" className="w-14 h-14" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Control de Negocios
          </h1>
          <p className="text-slate-300 text-lg">
            Gestiona tu negocio profesionalmente
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
            ¡Bienvenido de nuevo!
          </h2>
          <p className="text-slate-600 text-center mb-6">
            Accede a tu cuenta de Control de Negocios
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subdomain input */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Building2 className="w-4 h-4 text-pink-500" />
                Código de tu negocio
              </label>
              
              {/* Warning box */}
              <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-lg mb-3">
                <p className="text-xs font-medium text-amber-900">
                  💡 Ingresa el identificador único de tu salón
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  Ejemplo: Si tu salón se llama "Bella Vista", ingresa: bella-vista
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 h-16 focus-within:border-pink-400 focus-within:ring-4 focus-within:ring-pink-100 transition-all">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2.5 rounded-xl">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <input
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  placeholder="bella-vista"
                  required
                  className="flex-1 bg-transparent border-none outline-none text-lg font-semibold text-slate-800 placeholder:text-slate-400"
                />
              </div>
              
              <p className="text-xs text-slate-500 mt-2">
                Tu dominio completo: <span className="font-medium">{formData.subdomain || 'tu-salon'}.controldenegocios.com</span>
              </p>
            </div>

            {/* Email input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Correo electrónico
              </label>
              <div className="flex items-center gap-4 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 h-16 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 rounded-xl">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tucorreo@example.com"
                  required
                  className="flex-1 bg-transparent border-none outline-none text-base font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Contraseña
              </label>
              <div className="flex items-center gap-4 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 h-16 focus-within:border-green-400 focus-within:ring-4 focus-within:ring-green-100 transition-all">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2.5 rounded-xl">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tu contraseña"
                  required
                  className="flex-1 bg-transparent border-none outline-none text-base font-medium text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {loginError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{loginError}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-3"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Forgot password link */}
          <div className="text-center mt-6">
            <Link 
              to="/forgot-password"
              className="text-pink-500 font-semibold hover:text-pink-600 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
```

---

## 🎯 PRÓXIMOS PASOS

1. **Crear LoginPage.jsx** con el código de ejemplo
2. **Agregar ruta** en App.jsx
3. **Crear ForgotPasswordPage.jsx** similar
4. **Probar** funcionalidad completa
5. **Opcional**: Actualizar LoginModal con subdomain

---

## ✅ RESULTADO ESPERADO

Al finalizar tendremos:
- ✅ Página de login completa con subdomain
- ✅ Diseño moderno y profesional
- ✅ Experiencia similar entre mobile y web
- ✅ Forgot password funcional
- ✅ Auto-redirect por rol
- ✅ Responsive para todos los dispositivos
- ✅ Mantenimiento de LoginModal para otros usos

¿Quieres que comience a implementar el LoginPage.jsx?
