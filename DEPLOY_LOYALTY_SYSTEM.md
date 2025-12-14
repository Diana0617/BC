# Guía de Deploy - Sistema de Fidelización

## 📋 Resumen de Cambios

- ✅ Sistema completo de fidelización con puntos, recompensas y referidos
- ✅ Tarjetas PDF con QR para consulta pública de puntos
- ✅ Endpoint público sin autenticación: `/api/loyalty/public/check/:referralCode`
- ✅ Página web: `/check-points/:referralCode`
- ✅ 20+ reglas configurables + 6 reglas de branding
- ✅ Módulo incluido en planes Premium y Enterprise

---

## 🚀 Pasos para Deployar

### 1. Commit y Push a Main

```bash
# Verificar cambios
git status

# Agregar todos los cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: Sistema de fidelización con tarjetas QR y consulta pública de puntos"

# Push a la rama principal
git push origin main
```

### 2. Verificar Deploy Automático en Azure

El GitHub Action se ejecutará automáticamente:

1. Ve a: https://github.com/TU_USER/TU_REPO/actions
2. Busca el workflow "Deploy Backend to Azure"
3. Verifica que el deploy se complete exitosamente (✅ verde)
4. Tiempo estimado: 3-5 minutos

### 3. Ejecutar Seeds en Producción

Una vez que el deploy termine, ejecuta los seeds en Azure:

**Opción A: Azure Portal (más fácil)**

1. Ve a [Azure Portal](https://portal.azure.com)
2. Busca tu App Service: `beautycontrol-api`
3. En el menú lateral: **Development Tools** → **SSH** o **Console**
4. Ejecuta:

```bash
# Navegar al directorio
cd /home/site/wwwroot

# 1. Seed de módulos (crea el módulo loyalty)
node scripts/seed-modules.js

# 2. Seed de reglas (crea las 20+ reglas de loyalty + 6 de branding)
node scripts/seed-rule-templates.js

# 3. Seed de planes (agrega loyalty a Premium y Enterprise)
node scripts/seed-plans.js
```

**Opción B: Azure CLI (desde tu terminal)**

```bash
# Login
az login

# Ejecutar comando en Azure
az webapp ssh --name beautycontrol-api --resource-group TU_RESOURCE_GROUP

# Luego ejecuta los mismos comandos de arriba
```

### 4. Verificar en Producción

#### A. Verificar módulo y reglas

```bash
# Consultar módulo loyalty
curl https://beautycontrol-api.azurewebsites.net/api/modules | grep loyalty

# O visita desde el navegador:
# https://beautycontrol-api.azurewebsites.net/api/modules
```

#### B. Probar endpoint público (SIN autenticación)

1. Genera una tarjeta de un cliente desde el panel
2. Escanea el QR o copia el código de referido
3. Abre: `https://beautycontrol.vercel.app/check-points/REF-ABC123`
4. Deberías ver los puntos del cliente

#### C. Probar endpoint API directamente

```bash
curl https://beautycontrol-api.azurewebsites.net/api/loyalty/public/check/REF-ABC123
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "clientName": "Juan Pérez",
    "points": 1500,
    "referralCode": "REF-ABC123",
    "referralCount": 3
  }
}
```

---

## 🔍 Troubleshooting

### El seed falla con "MODULE_NOT_FOUND"

```bash
# Instalar dependencias
cd /home/site/wwwroot
npm install
```

### Error "WHATSAPP_ENCRYPTION_KEY required"

Agrega la variable en Azure Portal:
1. App Service → **Configuration** → **Application settings**
2. New application setting:
   - Name: `WHATSAPP_ENCRYPTION_KEY`
   - Value: `f2ca5316d90d0019c8a3babd497211bf57619106acdda82a3355f890fcf87590`
3. **Save** y **Restart** el App Service

### Error "qrcode module not found"

La dependencia `qrcode` debe instalarse automáticamente. Si no:

```bash
cd /home/site/wwwroot
npm install qrcode
```

### El QR no se genera en el PDF

Verifica la variable de entorno `FRONTEND_URL`:
```bash
# En Azure Portal → Configuration
FRONTEND_URL=https://beautycontrol.vercel.app
```

---

## 📊 Verificación Final

### Checklist Post-Deploy

- [ ] GitHub Action completado exitosamente ✅
- [ ] Seeds ejecutados en Azure sin errores
- [ ] Módulo `loyalty` visible en `/api/modules`
- [ ] Reglas de loyalty visibles en panel de Business Rules
- [ ] Endpoint público funciona: `/api/loyalty/public/check/:code`
- [ ] Página web carga correctamente: `/check-points/:code`
- [ ] Tarjeta PDF se genera con QR
- [ ] QR escaneable y muestra puntos

---

## 🎯 Uso del Sistema

### Para Business (Panel Admin)

1. **Habilitar módulo**:
   - Asegurarse de tener plan Premium o Enterprise
   - Módulo `loyalty` debe aparecer habilitado

2. **Configurar reglas**:
   - Business Rules → Loyalty
   - Ajustar puntos por pago, referidos, etc.
   - Personalizar colores de tarjetas (branding)

3. **Generar tarjeta de un cliente**:
   ```bash
   GET /api/loyalty/business/client/{clientId}/card/pdf
   Authorization: Bearer {token}
   ```

4. **Generar múltiples tarjetas (bulk)**:
   ```bash
   POST /api/loyalty/business/cards/bulk-pdf
   Authorization: Bearer {token}
   Body: { "clients": [{ "clientId": "uuid", "points": 1500 }, ...] }
   ```

### Para Clientes

1. Reciben tarjeta física con QR impreso
2. Escanean QR con su teléfono
3. Ven sus puntos instantáneamente (sin login)
4. URL: `beautycontrol.vercel.app/check-points/{su-codigo}`

---

## 📱 Integración Mobile (Próximo Paso)

Para que recepcionistas/especialistas consulten puntos desde la app:

```javascript
// React Native - WebView
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: `https://beautycontrol.vercel.app/check-points/${referralCode}` }}
  style={{ flex: 1 }}
/>
```

---

## 📞 Soporte

Si algo falla:
1. Revisa logs en Azure Portal → Log Stream
2. Verifica variables de entorno en Configuration
3. Revisa GitHub Actions para ver errores de deploy

---

**✨ Deploy completado! El sistema de fidelización está listo para usar.**
