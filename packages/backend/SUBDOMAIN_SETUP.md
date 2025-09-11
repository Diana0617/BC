# 🌐 Guía de Implementación de Subdominios - Beauty Control

## 📋 Estado Actual
- ✅ **Campo `subdomain` agregado** al modelo Business
- ✅ **Middleware preparado** pero deshabilitado
- ✅ **Rutas de gestión** de subdominios implementadas
- ✅ **Utilidades** de generación y validación listas
- ⏸️ **Validación deshabilitada** por defecto

## 🚀 Activación en Producción

### 1. **Configuración de DNS**
```bash
# Configurar DNS wildcard en tu proveedor (Cloudflare, Route53, etc.)
*.beautycontrol.com -> IP_DEL_SERVIDOR
```

### 2. **Certificado SSL Wildcard**
```bash
# Generar certificado Let's Encrypt wildcard
certbot certonly --dns-cloudflare --dns-cloudflare-credentials ~/.secrets/cloudflare.cfg -d "*.beautycontrol.com"
```

### 3. **Variables de Entorno**
```env
# En producción, cambiar estas variables:
SUBDOMAIN_VALIDATION=true
DOMAIN_BASE=beautycontrol.com
SUBDOMAIN_WILDCARD_SSL=true
```

### 4. **Configuración de CORS**
```javascript
// En server.js, actualizar CORS para múltiples subdominios
const corsOptions = {
  origin: [
    /^https:\/\/[a-z0-9-]+\.beautycontrol\.com$/,
    'https://app.beautycontrol.com',
    'https://www.beautycontrol.com'
  ]
};
```

### 5. **Nginx/Apache Configuration**
```nginx
# Ejemplo Nginx
server {
    listen 443 ssl;
    server_name *.beautycontrol.com;
    
    ssl_certificate /etc/letsencrypt/live/beautycontrol.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beautycontrol.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔧 Uso de las APIs Preparadas

### **Sugerir Subdominio**
```bash
POST /api/auth/suggest-subdomain
Content-Type: application/json

{
  "businessName": "Salón Bella Vista"
}

# Respuesta:
{
  "success": true,
  "data": {
    "suggested": "salon-bella-vista",
    "preview": "https://salon-bella-vista.beautycontrol.com",
    "available": true
  }
}
```

### **Verificar Disponibilidad**
```bash
GET /api/auth/check-subdomain/salon-bella-vista

# Respuesta:
{
  "success": true,
  "data": {
    "subdomain": "salon-bella-vista",
    "available": true,
    "preview": "https://salon-bella-vista.beautycontrol.com"
  }
}
```

## 📝 Flujo de Registro con Subdominio

### **Fase Actual (Desarrollo):**
1. Usuario registra negocio
2. Sistema asigna subdomain automáticamente (opcional)
3. Usuario accede via `app.beautycontrol.com`

### **Fase Producción:**
1. Usuario registra negocio
2. Usuario elige/valida subdomain via API
3. Sistema activa validación de subdomain
4. Usuario accede via `{subdomain}.beautycontrol.com`

## 🔍 Ventajas Preparadas

### **Marketing & Branding:**
- ✅ URLs personalizadas por negocio
- ✅ Mejor SEO individual
- ✅ Marca profesional

### **Técnicas:**
- ✅ Seguridad por subdominio + JWT
- ✅ Isolamiento visual por negocio
- ✅ Analytics segmentados

### **Escalabilidad:**
- ✅ CDN optimizado por subdominio
- ✅ Cache diferenciado
- ✅ Load balancing granular

## 📊 Migración de Desarrollo a Producción

### **Paso 1: Poblar subdominios existentes**
```sql
-- Generar subdominios para negocios existentes
UPDATE businesses 
SET subdomain = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g'))
WHERE subdomain IS NULL;
```

### **Paso 2: Validar unicidad**
```sql
-- Verificar que no hay duplicados
SELECT subdomain, COUNT(*) 
FROM businesses 
WHERE subdomain IS NOT NULL 
GROUP BY subdomain 
HAVING COUNT(*) > 1;
```

### **Paso 3: Activar validación**
```bash
# Cambiar variable de entorno
SUBDOMAIN_VALIDATION=true
```

## 🚨 Consideraciones Importantes

### **Backup:**
- ✅ Siempre permitir acceso via `app.beautycontrol.com`
- ✅ Mantener compatibilidad durante transición

### **Testing:**
- ✅ Probar con múltiples subdominios
- ✅ Verificar SSL en todos los subdominios
- ✅ Testear redirects y CORS

### **Monitoring:**
- ✅ Logs de validación de subdominios
- ✅ Métricas de uso por subdominio
- ✅ Alertas de DNS/SSL

---

## 🎯 Activación Recomendada

**Cuando tengas en producción:**
1. Configurar DNS wildcard
2. Obtener certificado SSL wildcard  
3. Cambiar `SUBDOMAIN_VALIDATION=true`
4. Probar con 2-3 negocios piloto
5. Migrar gradualmente el resto

**¡Todo está preparado para una activación limpia! 🚀**