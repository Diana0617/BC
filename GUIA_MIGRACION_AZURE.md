# 🚀 Guía de Migración a Azure - Control de Negocios

## 📋 Resumen de Migración

**Origen:**
- Backend: Render
- Base de Datos: Neon (PostgreSQL)

**Destino:**
- Backend: Azure App Service
- Base de Datos: Azure Database for PostgreSQL - Flexible Server

**Se mantiene:**
- Frontend: Vercel
- Imágenes: Cloudinary
- WhatsApp: Meta Business Platform

---

## ⏱️ Tiempo Estimado Total: 3-4 horas

---

# PARTE 1: PREPARACIÓN (30 minutos)

## 1.1. Requisitos Previos

✅ Cuenta de Azure (crear en https://azure.microsoft.com/free/)  
✅ Azure CLI instalado  
✅ Acceso a tu repositorio GitHub  
✅ Backup de base de datos actual  

---

## 1.2. Instalar Azure CLI

### Windows:
```powershell
# Descargar e instalar desde:
https://aka.ms/installazurecliwindows
```

### Verificar instalación:
```bash
az --version
az login
```

Esto abrirá el navegador para que inicies sesión.

---

## 1.3. Crear Backup de Base de Datos Actual

**En Neon Dashboard:**

1. Ve a https://console.neon.tech/
2. Selecciona tu proyecto
3. Ve a "Operations" → "Restore"
4. Anota la connection string actual

**Backup manual (opcional):**
```bash
# Instalar pg_dump si no lo tienes
# Windows: viene con PostgreSQL

# Hacer backup
pg_dump "postgresql://neondb_owner:TU_PASSWORD@ep-curly-union-aek8wz8r-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require" > backup_$(date +%Y%m%d).sql
```

---

# PARTE 2: CREAR BASE DE DATOS EN AZURE (45 minutos)

## 2.1. Crear Resource Group

```bash
# Crear grupo de recursos
az group create \
  --name beautycontrol-rg \
  --location eastus

# Verificar
az group list --output table
```

---

## 2.2. Crear PostgreSQL Server

```bash
# Crear servidor PostgreSQL (toma 5-10 minutos)
az postgres flexible-server create \
  --resource-group beautycontrol-rg \
  --name beautycontrol-db \
  --location eastus \
  --admin-user dbadmin \
  --admin-password "TuPasswordSeguro123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15 \
  --storage-size 32 \
  --public-access 0.0.0.0 \
  --yes

# Esto creará:
# - Servidor: beautycontrol-db.postgres.database.azure.com
# - Usuario: dbadmin
# - Base de datos: postgres (por defecto)
```

**Costos:**
- Standard_B1ms: ~$12-20 USD/mes
- 32GB almacenamiento incluido
- Backups automáticos 7 días

---

## 2.3. Configurar Firewall de Base de Datos

```bash
# Permitir acceso desde tu IP actual (para migración)
az postgres flexible-server firewall-rule create \
  --resource-group beautycontrol-rg \
  --name beautycontrol-db \
  --rule-name AllowMyIP \
  --start-ip-address TU_IP \
  --end-ip-address TU_IP

# Permitir acceso desde Azure Services (importante para App Service)
az postgres flexible-server firewall-rule create \
  --resource-group beautycontrol-rg \
  --name beautycontrol-db \
  --rule-name AllowAllAzureIps \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

**Para obtener tu IP:**
```bash
curl ifconfig.me
```

---

## 2.4. Crear Base de Datos

```bash
# Conectar al servidor
az postgres flexible-server connect \
  --name beautycontrol-db \
  --admin-user dbadmin \
  --admin-password "TuPasswordSeguro123!"

# En el prompt de PostgreSQL, ejecutar:
CREATE DATABASE beautycontrol;
\q
```

---

## 2.5. Migrar Datos de Neon a Azure

### Opción A: Usar pg_dump/pg_restore (Recomendado)

```bash
# 1. Exportar desde Neon
pg_dump "postgresql://neondb_owner:NEON_PASSWORD@ep-curly-union-aek8wz8r-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require" \
  --format=custom \
  --no-owner \
  --no-acl \
  > backup_neon.dump

# 2. Importar a Azure
pg_restore \
  --host=beautycontrol-db.postgres.database.azure.com \
  --port=5432 \
  --username=dbadmin \
  --dbname=beautycontrol \
  --no-owner \
  --no-acl \
  backup_neon.dump

# Ingresar password cuando lo solicite: TuPasswordSeguro123!
```

### Opción B: Usar SQL directo

```bash
# 1. Exportar desde Neon a SQL
pg_dump "postgresql://neondb_owner:NEON_PASSWORD@..." > backup.sql

# 2. Importar a Azure
psql \
  "host=beautycontrol-db.postgres.database.azure.com port=5432 dbname=beautycontrol user=dbadmin password=TuPasswordSeguro123! sslmode=require" \
  < backup.sql
```

---

## 2.6. Verificar Migración de Datos

```bash
# Conectar a Azure PostgreSQL
psql "host=beautycontrol-db.postgres.database.azure.com port=5432 dbname=beautycontrol user=dbadmin password=TuPasswordSeguro123! sslmode=require"

# Verificar tablas
\dt

# Contar registros en tablas principales
SELECT COUNT(*) FROM businesses;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM clients;
SELECT COUNT(*) FROM appointments;

# Salir
\q
```

---

## 2.7. Obtener Connection String de Azure

```bash
# Obtener detalles del servidor
az postgres flexible-server show \
  --resource-group beautycontrol-rg \
  --name beautycontrol-db \
  --output table

# Connection string para tu app:
postgresql://dbadmin:TuPasswordSeguro123!@beautycontrol-db.postgres.database.azure.com:5432/beautycontrol?sslmode=require
```

**Guarda este connection string**, lo usaremos en el backend.

---

# PARTE 3: MIGRAR BACKEND A AZURE APP SERVICE (60 minutos)

## 3.1. Crear App Service Plan

```bash
# Crear plan (tier B1 - Basic)
az appservice plan create \
  --name beautycontrol-plan \
  --resource-group beautycontrol-rg \
  --location eastus \
  --sku B1 \
  --is-linux

# Verificar
az appservice plan show \
  --name beautycontrol-plan \
  --resource-group beautycontrol-rg
```

**Costo:** ~$13 USD/mes

---

## 3.2. Crear Web App

```bash
# Crear Web App con Node.js 18
az webapp create \
  --resource-group beautycontrol-rg \
  --plan beautycontrol-plan \
  --name beautycontrol-api \
  --runtime "NODE:18-lts" \
  --deployment-local-git

# Esto creará:
# - URL: https://beautycontrol-api.azurewebsites.net
# - Git remote para deployment
```

---

## 3.3. Configurar Variables de Entorno

```bash
# Configurar todas las variables de entorno
az webapp config appsettings set \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DATABASE_URL="postgresql://dbadmin:TuPasswordSeguro123!@beautycontrol-db.postgres.database.azure.com:5432/beautycontrol?sslmode=require" \
    JWT_SECRET="tu_jwt_secret_aqui" \
    JWT_EXPIRES_IN="24h" \
    JWT_REFRESH_EXPIRES_IN="7d" \
    META_APP_ID="1928881431390804" \
    META_APP_SECRET="793aa3cfe4cfbadd8c2268478d4f99af" \
    WHATSAPP_CONFIG_ID="884984130753544" \
    WHATSAPP_WEBHOOK_VERIFY_TOKEN="beauty_control_webhook_verify_2024" \
    ENCRYPTION_KEY="f2ca5316d90d0019c8a3babd497211bf57619106acdda82a3355f890fcf87590" \
    CLOUDINARY_CLOUD_NAME="dxfgdwmwd" \
    CLOUDINARY_API_KEY="577318946718494" \
    CLOUDINARY_API_SECRET="cjL1SHIhqtXWr8BQzAi4KYj3Mt0" \
    BASE_URL="https://beautycontrol-api.azurewebsites.net" \
    ALLOWED_ORIGINS="https://www.controldenegocios.com,https://controldenegocios.com" \
    DISABLE_SYNC=true

# Verificar variables
az webapp config appsettings list \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api \
  --output table
```

---

## 3.4. Configurar Deployment desde GitHub

### Opción A: GitHub Actions (Recomendado)

```bash
# 1. Crear Service Principal para GitHub Actions
az ad sp create-for-rbac \
  --name "beautycontrol-github-actions" \
  --role contributor \
  --scopes /subscriptions/TU_SUBSCRIPTION_ID/resourceGroups/beautycontrol-rg \
  --sdk-auth

# Esto devuelve JSON - copiarlo completo
```

**2. Configurar en GitHub:**

1. Ve a tu repositorio: https://github.com/Diana0617/BC
2. Settings → Secrets and variables → Actions
3. New repository secret:
   - Name: `AZURE_CREDENTIALS`
   - Value: [pegar el JSON del paso anterior]

**3. Crear archivo de workflow:**

```bash
# En tu proyecto local
mkdir -p .github/workflows
```

Crear archivo `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches:
      - main
    paths:
      - 'packages/backend/**'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Install dependencies
      working-directory: ./packages/backend
      run: npm ci
    
    - name: Run tests
      working-directory: ./packages/backend
      run: npm test --if-present
    
    - name: Login to Azure
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: beautycontrol-api
        package: ./packages/backend
```

**4. Commit y push:**

```bash
git add .github/workflows/azure-deploy.yml
git commit -m "feat: Add Azure deployment workflow"
git push origin main
```

---

### Opción B: Deployment Manual (Para Testing)

```bash
# 1. Comprimir backend
cd packages/backend
zip -r backend.zip . -x "node_modules/*" -x ".git/*"

# 2. Deploy a Azure
az webapp deployment source config-zip \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api \
  --src backend.zip
```

---

## 3.5. Configurar Start Command

```bash
# Configurar comando de inicio
az webapp config set \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api \
  --startup-file "node server.js"
```

---

## 3.6. Habilitar Logs

```bash
# Habilitar logs de aplicación
az webapp log config \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api \
  --application-logging filesystem \
  --detailed-error-messages true \
  --failed-request-tracing true \
  --web-server-logging filesystem

# Ver logs en tiempo real
az webapp log tail \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api
```

---

## 3.7. Verificar Deployment

```bash
# Health check
curl https://beautycontrol-api.azurewebsites.net/health

# Debe responder:
# {"status":"ok","timestamp":"..."}

# Verificar que el backend responde
curl https://beautycontrol-api.azurewebsites.net/api/health
```

---

# PARTE 4: ACTUALIZAR FRONTEND (30 minutos)

## 4.1. Actualizar Variables de Entorno en Vercel

1. Ve a Vercel Dashboard: https://vercel.com/
2. Selecciona tu proyecto web-app
3. Settings → Environment Variables
4. Actualizar `VITE_API_URL`:

```
VITE_API_URL=https://beautycontrol-api.azurewebsites.net
```

5. Redeploy:
   - Deployments → Click en el último deploy → ... → Redeploy

---

## 4.2. Actualizar Shared Package (si es necesario)

Si tienes la URL hardcoded en `packages/shared/src/constants/api.js`:

```javascript
// packages/shared/src/constants/api.js
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  process.env.REACT_APP_API_URL || 
  'https://beautycontrol-api.azurewebsites.net'
```

Commit y push:
```bash
git add packages/shared/src/constants/api.js
git commit -m "feat: Update API URL to Azure"
git push origin main
```

---

# PARTE 5: ACTUALIZAR WEBHOOKS DE WHATSAPP (15 minutos)

## 5.1. Actualizar en Meta for Developers

1. Ve a https://developers.facebook.com/apps/1928881431390804/
2. WhatsApp → Configuration
3. Actualizar Webhook URL:

```
Callback URL: https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp
Verify Token: beauty_control_webhook_verify_2024
```

4. Click "Verify and Save"
5. Subscribe to webhook fields:
   - ✅ messages
   - ✅ message_status

---

# PARTE 6: TESTING Y VERIFICACIÓN (30 minutos)

## 6.1. Checklist de Verificación

### Backend API
```bash
# 1. Health check
curl https://beautycontrol-api.azurewebsites.net/health

# 2. Login (reemplaza con usuario real)
curl -X POST https://beautycontrol-api.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@email.com","password":"tupassword"}'

# 3. Test endpoint protegido (usa el token del paso anterior)
curl https://beautycontrol-api.azurewebsites.net/api/businesses \
  -H "Authorization: Bearer TU_TOKEN"
```

### Base de Datos
```bash
# Conectar y verificar
psql "host=beautycontrol-db.postgres.database.azure.com port=5432 dbname=beautycontrol user=dbadmin password=TuPasswordSeguro123! sslmode=require"

# Verificar datos
SELECT COUNT(*) FROM businesses;
SELECT COUNT(*) FROM users;
```

### Frontend
1. Abrir https://www.controldenegocios.com/
2. Hacer login
3. Verificar que carga dashboard
4. Crear una cita de prueba
5. Verificar que se guarda

### WhatsApp
1. Crear cita con recordatorio
2. Verificar que se envía el mensaje
3. Revisar logs en Azure:
```bash
az webapp log tail \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api \
  --filter "whatsapp"
```

---

## 6.2. Monitoreo

### Ver métricas en tiempo real:

```bash
# CPU, Memory, Requests
az monitor metrics list \
  --resource beautycontrol-api \
  --resource-group beautycontrol-rg \
  --resource-type "Microsoft.Web/sites" \
  --metric "CpuPercentage" "MemoryPercentage" "Requests"
```

### Portal Azure:
1. Ve a https://portal.azure.com/
2. Busca "beautycontrol-api"
3. Monitoring → Metrics
4. Monitoring → Logs

---

# PARTE 7: OPTIMIZACIÓN Y PRODUCCIÓN (Opcional)

## 7.1. Habilitar Always On

```bash
# Mantener la app siempre activa (evita cold starts)
az webapp config set \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api \
  --always-on true
```

**Nota:** Always On solo está disponible en Basic tier o superior.

---

## 7.2. Configurar Auto-scaling (Opcional)

```bash
# Crear regla de auto-scaling
az monitor autoscale create \
  --resource-group beautycontrol-rg \
  --resource beautycontrol-api \
  --resource-type Microsoft.Web/serverfarms \
  --name autoscale-beautycontrol \
  --min-count 1 \
  --max-count 3 \
  --count 1

# Regla: escalar cuando CPU > 70%
az monitor autoscale rule create \
  --resource-group beautycontrol-rg \
  --autoscale-name autoscale-beautycontrol \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1
```

---

## 7.3. Configurar Custom Domain (Opcional)

Si quieres usar `api.controldenegocios.com`:

```bash
# 1. Agregar custom domain
az webapp config hostname add \
  --resource-group beautycontrol-rg \
  --webapp-name beautycontrol-api \
  --hostname api.controldenegocios.com

# 2. Habilitar HTTPS
az webapp config ssl bind \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

**Antes necesitas:**
1. Crear registro DNS CNAME: `api.controldenegocios.com` → `beautycontrol-api.azurewebsites.net`
2. Esperar propagación DNS (15-30 minutos)

---

# PARTE 8: DESACTIVAR SERVICIOS ANTIGUOS (15 minutos)

## 8.1. Render

1. Ve a https://dashboard.render.com/
2. Selecciona tu servicio backend
3. Settings → Delete Service
4. Confirma

## 8.2. Neon (Opcional - mantener backup temporal)

**Recomendación:** Mantener Neon activo por 1-2 semanas como backup antes de eliminarlo.

Después de verificar que todo funciona:
1. Ve a https://console.neon.tech/
2. Selecciona proyecto
3. Settings → Delete Project

---

# RESUMEN DE COSTOS

## Antes (Render + Neon):
```
Render (Starter):     $25/mes
Neon (Launch):        $19/mes
Cloudinary:           $89/mes
─────────────────────────────
TOTAL:                $133/mes
```

## Después (Azure):
```
App Service (B1):           $13/mes
PostgreSQL (B1ms):          $20/mes
Cloudinary:                 $89/mes
─────────────────────────────
TOTAL:                      $122/mes

AHORRO:                     $11/mes ($132/año)
```

## Beneficios Adicionales:
✅ Todo en un solo proveedor  
✅ Mejor integración entre servicios  
✅ SLA 99.95% garantizado  
✅ Soporte 24/7  
✅ Más opciones de escalabilidad  

---

# 📞 SOPORTE Y TROUBLESHOOTING

## Errores Comunes

### Error: "Cannot connect to database"

**Solución:**
```bash
# Verificar firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group beautycontrol-rg \
  --name beautycontrol-db

# Agregar tu IP si no está
az postgres flexible-server firewall-rule create \
  --resource-group beautycontrol-rg \
  --name beautycontrol-db \
  --rule-name AllowMyIP \
  --start-ip-address TU_IP \
  --end-ip-address TU_IP
```

---

### Error: "App Service not responding"

**Solución:**
```bash
# Ver logs
az webapp log tail \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api

# Restart app
az webapp restart \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api
```

---

### Error: "Deployment failed"

**Solución:**
```bash
# Ver deployment logs
az webapp log deployment list \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api

# Ver detalles del último deployment
az webapp log deployment show \
  --resource-group beautycontrol-rg \
  --name beautycontrol-api \
  --deployment-id <id>
```

---

## Comandos Útiles de Monitoreo

```bash
# Ver estado de recursos
az resource list \
  --resource-group beautycontrol-rg \
  --output table

# Ver costos actuales
az consumption usage list \
  --start-date 2025-12-01 \
  --end-date 2025-12-31 \
  --output table

# Ver actividad reciente
az monitor activity-log list \
  --resource-group beautycontrol-rg \
  --max-events 20
```

---

## Rollback Plan

Si algo sale mal y necesitas volver a Render/Neon:

1. **Base de Datos:**
   - Restaurar backup en Neon
   - Actualizar `DATABASE_URL` en Render

2. **Backend:**
   - Render automáticamente usa el último deployment exitoso
   - O hacer redeploy desde GitHub

3. **Frontend:**
   - Actualizar `VITE_API_URL` en Vercel a URL de Render
   - Redeploy

---

# 🎉 ¡MIGRACIÓN COMPLETADA!

Tu aplicación ahora está corriendo en Azure con:

✅ Backend en Azure App Service  
✅ Base de datos en Azure PostgreSQL  
✅ Deployment automático desde GitHub  
✅ Logs centralizados  
✅ Monitoring incluido  
✅ Backup automático de BD  

**Próximos Pasos:**
1. Monitorear por 1 semana
2. Optimizar queries de BD si es necesario
3. Configurar alertas de monitoring
4. Considerar auto-scaling si el tráfico crece

---

**Guía creada:** Diciembre 2025  
**Versión:** 1.0  
**Autor:** Control de Negocios - Equipo DevOps
