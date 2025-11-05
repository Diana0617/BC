# ✅ Checklist de Deployment a Producción

**Fecha**: 18 de Octubre 2025  
**Backend URL**: https://bc-16wt.onrender.com  
**Base de Datos**: Neon PostgreSQL  
**Presentación en**: 2 horas ⏰

---

## 📊 Estado Actual

### ✅ Base de Datos (Neon PostgreSQL)
- [x] Conexión verificada
- [x] Tablas creadas (subscription_plans, modules, businesses, branches, users, clients, etc.)
- [x] Seeders ejecutados:
  - [x] 15 módulos base
  - [x] 5 planes de suscripción
- [x] Usuario administrador creado:
  - **Email**: `Owner@bc.com`
  - **Password**: `AdminPassword123!`
  - **Role**: OWNER
  - **ID**: ea28d9b6-c09d-4597-9614-1fd954dcfc8a

---

## 🔧 1. Configuración de Render (Backend)

### Variables de Entorno REQUERIDAS en Render:

```bash
# 🔴 CRÍTICO - Base de Datos
DATABASE_URL=postgresql://neondb_owner:npg_sVkni1pYdKP4@ep-divine-bread-adt4an18-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# 🔴 CRÍTICO - Configuración
NODE_ENV=production
PORT=5000

# 🔴 CRÍTICO - JWT (generar uno seguro)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_cambiar

# 🟡 IMPORTANTE - CORS (URLs del frontend)
WEB_URL=https://tu-web-app.vercel.app
APP_URL=https://tu-mobile-app.vercel.app

# 🟢 OPCIONAL - Cloudinary (si usas subida de imágenes)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# 🟢 OPCIONAL - Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# 🟢 OPCIONAL - Wompi (pagos)
WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
WOMPI_ENVIRONMENT=sandbox
WOMPI_EVENT_SECRET=
WOMPI_API_URL=https://sandbox.wompi.co
```

### ⚡ Pasos en Render Dashboard:

1. **Ir a**: https://dashboard.render.com
2. **Seleccionar tu servicio**: `bc-16wt` (o el nombre de tu servicio)
3. **Ir a**: "Environment" en el menú lateral
4. **Agregar/Verificar** las variables de entorno críticas (🔴)
5. **Guardar cambios** (Render se redesplegará automáticamente)

---

## 🚀 2. Configuración de Vercel (Frontend)

### Variables de Entorno en Vercel:

```bash
# 🔴 CRÍTICO - URL del Backend
VITE_API_URL=https://bc-16wt.onrender.com

# Si tienes otras variables:
VITE_WOMPI_PUBLIC_KEY=
VITE_APP_NAME=Beauty Control
VITE_APP_VERSION=1.0.0
```

### ⚡ Pasos en Vercel Dashboard:

1. **Ir a**: https://vercel.com/dashboard
2. **Seleccionar tu proyecto**: (web-app o como lo hayas nombrado)
3. **Ir a**: Settings → Environment Variables
4. **Agregar**: `VITE_API_URL` = `https://bc-16wt.onrender.com`
5. **Aplicar a**: Production, Preview, Development (todas)
6. **Guardar y Redesplegar**:
   - Ve a "Deployments"
   - Click en "..." del último deployment
   - Click "Redeploy"

---

## 🧪 3. Tests de Verificación

### Test 1: Backend Healthcheck
```bash
curl https://bc-16wt.onrender.com/api/health
```
**Esperado**: Status 200, mensaje de que el servidor está corriendo

### Test 2: Database Connection
```bash
curl https://bc-16wt.onrender.com/api/db/test
```
**Esperado**: Confirmación de conexión a la base de datos

### Test 3: Login del Usuario Owner
```bash
curl -X POST https://bc-16wt.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "Owner@bc.com",
    "password": "AdminPassword123!"
  }'
```
**Esperado**: Token JWT y datos del usuario

### Test 4: Frontend Login (Manual)
1. Abrir tu web app en Vercel
2. Ir a la página de login
3. Ingresar:
   - Email: `Owner@bc.com`
   - Password: `AdminPassword123!`
4. Verificar que se redirija al dashboard

---

## 🐛 Troubleshooting Común

### ❌ Error: "Cannot connect to database"
**Solución**: Verificar que `DATABASE_URL` en Render sea exactamente:
```
postgresql://neondb_owner:npg_sVkni1pYdKP4@ep-divine-bread-adt4an18-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### ❌ Error: "JWT malformed" o "Invalid token"
**Solución**: Asegurar que `JWT_SECRET` en Render sea el mismo en todos los despliegues

### ❌ Error: "CORS blocked"
**Solución**: Verificar que `WEB_URL` y `APP_URL` en Render coincidan con las URLs de Vercel

### ❌ Frontend no conecta al backend
**Solución**: Verificar que `VITE_API_URL` en Vercel sea `https://bc-16wt.onrender.com`

### ❌ Render está en "Building" por mucho tiempo
**Solución**: 
1. Verificar los logs en Render Dashboard
2. Asegurar que `package.json` tenga el script `"start": "node src/server.js"`

---

## 📝 Comandos Útiles

### Ver logs del backend en Render:
Ir a: https://dashboard.render.com → Tu servicio → Logs

### Ver logs de deploy en Vercel:
Ir a: https://vercel.com/dashboard → Tu proyecto → Deployments → Ver logs

### Regenerar deployment en Vercel:
```bash
# Desde tu terminal local
cd packages/web-app
vercel --prod
```

---

## 🎯 Checklist Final Pre-Presentación

- [ ] Backend en Render está "Live" (verde)
- [ ] Endpoint `/api/health` responde correctamente
- [ ] Login con `Owner@bc.com` funciona desde Postman/Insomnia
- [ ] Frontend en Vercel está desplegado
- [ ] Login desde el frontend funciona
- [ ] Dashboard carga correctamente después del login
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en los logs de Render

---

## 🆘 Si Todo Falla

### Plan B: Reset completo de la base de datos
```bash
cd packages/backend
node scripts/init-production-db.js
```

### Plan C: Verificar el modelo de PurchaseOrder
El script falló en `purchase_orders` por un case-sensitivity issue. Si necesitas esa tabla:

**Archivo**: `packages/backend/src/models/PurchaseOrder.js`

Buscar líneas como:
```javascript
REFERENCES "Businesses" ("id")  // ❌ MAL
REFERENCES "Users" ("id")       // ❌ MAL
```

Cambiar a:
```javascript
REFERENCES "businesses" ("id")  // ✅ BIEN
REFERENCES "users" ("id")       // ✅ BIEN
```

Pero **ESTO NO ES NECESARIO PARA TU PRESENTACIÓN** si no usas purchase orders.

---

## ✅ Credenciales de Acceso Final

### Usuario Administrador
- **Email**: `Owner@bc.com`
- **Password**: `AdminPassword123!`
- **Role**: OWNER
- **Permisos**: Acceso completo al sistema

### URLs de Producción
- **Backend API**: https://bc-16wt.onrender.com
- **Frontend Web**: [TU_URL_DE_VERCEL]
- **Base de Datos**: Neon PostgreSQL (Hosted)

---

**🚀 ¡Buena suerte con tu presentación!**
