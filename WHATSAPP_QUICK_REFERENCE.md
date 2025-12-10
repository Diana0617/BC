# 📱 Guía Rápida de Conexión de WhatsApp

## Para el Owner de la App (Tú - Beauty Control)

### ✅ Ya Completaste:
1. ✅ Creaste la app "Control de Negocios" en Meta for Developers
2. ✅ Configuraste el webhook de WhatsApp
3. ✅ Obtuviste el Configuration ID (884984130753544)
4. ✅ Agregaste las variables de entorno en Render
5. ✅ Actualizaste el código del frontend y backend

### 🎯 Lo Que Falta (Opcional):
- **Agregar dominio en Meta:** Para que funcione en producción, agrega tu dominio de Vercel en Meta for Developers → Settings → Domains
- **Agregar variables en Vercel:** Para que el frontend de producción funcione

### 🚫 NO Necesitas:
- ❌ Conectar TU propio WhatsApp Business
- ❌ Hacer más configuraciones en Meta
- ❌ Obtener tokens para cada negocio (se hace automáticamente)

---

## Para los Business Owners (Usuarios de Beauty Control)

### 📝 Requisitos:
1. **Cuenta de Facebook** (personal)
2. **Meta Business Suite** (se puede crear durante el proceso)
3. **Número de teléfono** que NO esté en WhatsApp personal
4. **Acceso al número** para recibir código de verificación

### 🚀 Pasos Simples:

#### 1️⃣ **Abrir Beauty Control**
- Ir a Perfil → WhatsApp
- Ver botón "Conectar con Meta Business"

#### 2️⃣ **Hacer Clic en el Botón**
- Se abre ventana de Meta
- Iniciar sesión con Facebook

#### 3️⃣ **Seleccionar/Crear Meta Business**
- Si ya tiene: Seleccionar de la lista
- Si no tiene: Crear nueva (2 minutos)

#### 4️⃣ **Configurar WhatsApp**
- Nombre del negocio visible
- Categoría (Spa, Salón, etc.)
- Descripción opcional

#### 5️⃣ **Verificar Número**
- Ingresar número de teléfono
- Recibir código (SMS o llamada)
- Ingresar código de 6 dígitos

#### 6️⃣ **Autorizar Permisos**
- Permitir acceso a WhatsApp Business
- Click en "Autorizar"

#### 7️⃣ **¡Listo! ✅**
- Conexión exitosa
- Ya puede enviar mensajes
- Ya puede crear plantillas

---

## 🎯 Flujo Técnico (Para Desarrolladores)

```
Business User → Click "Conectar"
       ↓
   SDK de Facebook
       ↓
   Meta OAuth Dialog
       ↓
  Login con Facebook
       ↓
Seleccionar/Crear Meta Business
       ↓
Configurar WhatsApp Business
       ↓
  Verificar Número
       ↓
   Autorizar Permisos
       ↓
   Meta retorna CODE
       ↓
Backend recibe CODE
       ↓
Backend intercambia CODE por ACCESS_TOKEN
       ↓
Backend obtiene PHONE_NUMBER_ID y WABA_ID
       ↓
Backend guarda TOKEN encriptado en DB
       ↓
   ✅ Conexión Exitosa
```

---

## 🔐 Datos que se Guardan por Negocio

En la tabla `whatsapp_tokens`:
- `business_id` (relación con el negocio)
- `encrypted_access_token` (token encriptado AES-256-GCM)
- `phone_number_id` (ID del número en Meta)
- `waba_id` (WhatsApp Business Account ID)
- `phone_number` (número de teléfono del negocio)
- `token_type` (manual o embedded_signup)
- `is_active` (estado de la conexión)
- `permissions` (permisos otorgados)
- `source` (de dónde vino el token)

---

## 🌐 URLs Importantes

### Para Testing Local:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Webhook: https://bc-16wt.onrender.com/api/webhooks/whatsapp

### Para Producción:
- Frontend: https://[tu-dominio].vercel.app
- Backend: https://bc-16wt.onrender.com
- Webhook: https://bc-16wt.onrender.com/api/webhooks/whatsapp

---

## 🧪 Cómo Probar Localmente

### 1. Levantar Backend:
```bash
cd packages/backend
npm start
```

### 2. Levantar Frontend:
```bash
cd packages/web-app
npm run dev
```

### 3. Abrir en Navegador:
```
http://localhost:5173
```

### 4. Iniciar Sesión como Business Owner:
- Usar credenciales de un negocio de prueba
- Ir a Perfil → WhatsApp
- Click en "Conectar con Meta Business"

### 5. Completar Flujo:
- Se abrirá el diálogo de Meta
- Completar el proceso de conexión
- Verificar que se guarde correctamente

### 6. Verificar en DB:
```sql
SELECT 
  id,
  business_id,
  phone_number,
  phone_number_id,
  is_active,
  token_type,
  created_at
FROM whatsapp_tokens
WHERE business_id = [tu_business_id];
```

---

## 🐛 Debugging

### Ver logs del Backend:
```bash
# En desarrollo local
npm start

# En Render
Dashboard → Logs
```

### Ver errores en Frontend:
```javascript
// Abrir consola del navegador (F12)
// Ver errores de Redux
// Ver errores del SDK de Facebook
```

### Verificar que el SDK se cargó:
```javascript
// En consola del navegador
console.log(window.FB)
// Debe mostrar el objeto FB
```

### Verificar configuración:
```javascript
// En Redux DevTools
// Ver state.whatsappToken.embeddedSignupConfig
{
  appId: "1928881431390804",
  configId: "884984130753544",
  redirectUri: "...",
  state: "..."
}
```

---

## 📊 Métricas para Monitorear

### En Meta Business Manager:
- Número de mensajes enviados
- Calidad del número (Green/Yellow/Red)
- Límites de mensajes
- Plantillas aprobadas/rechazadas

### En Beauty Control:
- Negocios con WhatsApp conectado
- Total de mensajes enviados
- Tasa de entrega
- Tasa de lectura

---

## 🚀 Deployment Checklist

### Backend (Render):
- [ ] Variables de entorno configuradas
- [ ] Webhook verificado en Meta
- [ ] Base de datos con migraciones aplicadas
- [ ] Logs funcionando correctamente

### Frontend (Vercel):
- [ ] Variables de entorno configuradas
- [ ] Dominio agregado en Meta
- [ ] Build exitoso
- [ ] Preview funcionando

### Meta (Control de Negocios):
- [ ] App en modo público o development
- [ ] Dominios autorizados agregados
- [ ] Configuration ID activo
- [ ] Webhook subscrito a eventos

---

## 📞 Contacto y Soporte

Para cualquier duda técnica:
- 📧 Email de desarrollo
- 💬 Slack/Discord del equipo
- 📚 Documentación interna

Para usuarios finales:
- 📧 soporte@beautycontrol.co
- 💬 WhatsApp de soporte
- 📚 Centro de ayuda

---

**¡Configuración Completa!** 🎉

Ya estás listo para que los Business Owners conecten sus WhatsApp y empiecen a enviar mensajes automáticos a sus clientes.
