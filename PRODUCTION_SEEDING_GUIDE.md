# 🌱 Guía de Seeding en Producción - Beauty Control

## Variables de Entorno Requeridas en Render

Agrega esta variable en Render → Environment:

```bash
SEED_SECRET_KEY=tu_clave_super_secreta_aqui_123456
```

**⚠️ IMPORTANTE:** Usa una clave fuerte y única. Ejemplo: `BC_seed_prod_2025_xyz789abc`

---

## Opción 1: Endpoints de API (Recomendado) ✅

### Paso 1: Obtener Token de Autenticación

Haz login como OWNER:

```bash
POST https://tu-backend.onrender.com/api/auth/login
Content-Type: application/json

{
  "email": "admin@beautycontrol.co",
  "password": "tu_password"
}
```

Guarda el `accessToken` de la respuesta.

### Paso 2: Ejecutar Seeding Completo

```bash
POST https://tu-backend.onrender.com/api/seed/all
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
X-Seed-Secret: tu_clave_super_secreta_aqui_123456
```

### Paso 3 (Opcional): Ejecutar Seedings Individuales

**Solo Módulos:**
```bash
POST https://tu-backend.onrender.com/api/seed/modules
Authorization: Bearer TU_ACCESS_TOKEN
X-Seed-Secret: tu_clave_secreta
```

**Solo Planes:**
```bash
POST https://tu-backend.onrender.com/api/seed/plans
Authorization: Bearer TU_ACCESS_TOKEN
X-Seed-Secret: tu_clave_secreta
```

**Solo Reglas:**
```bash
POST https://tu-backend.onrender.com/api/seed/rules
Authorization: Bearer TU_ACCESS_TOKEN
X-Seed-Secret: tu_clave_secreta
```

---

## Opción 2: Comando en Render Shell (Alternativa)

### Paso 1: Ir a Render Dashboard

1. Abre tu servicio en Render
2. Ve a **Shell** (consola)

### Paso 2: Ejecutar Scripts Manualmente

```bash
# Ejecutar todos los scripts en orden
cd packages/backend
node scripts/seed-modules.js
node scripts/seed-plans.js
node scripts/seed-rule-templates.js
```

---

## Verificación Post-Seeding

### Consultar Módulos Creados

```bash
GET https://tu-backend.onrender.com/api/modules
Authorization: Bearer TU_ACCESS_TOKEN
```

### Consultar Planes Creados

```bash
GET https://tu-backend.onrender.com/api/plans
Authorization: Bearer TU_ACCESS_TOKEN
```

### Consultar Reglas Creadas

```bash
GET https://tu-backend.onrender.com/api/rule-templates
Authorization: Bearer TU_ACCESS_TOKEN
```

---

## Ejemplo con cURL

```bash
# 1. Login
curl -X POST https://tu-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@beautycontrol.co","password":"tu_password"}'

# 2. Ejecutar seeding (reemplaza TOKEN y SECRET)
curl -X POST https://tu-backend.onrender.com/api/seed/all \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -H "X-Seed-Secret: tu_clave_secreta"
```

---

## Ejemplo con Insomnia/Postman

### Request: Seeding Completo

```
Method: POST
URL: https://tu-backend.onrender.com/api/seed/all

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  X-Seed-Secret: tu_clave_super_secreta_aqui_123456
  Content-Type: application/json
```

---

## Respuesta Esperada

```json
{
  "success": true,
  "message": "Seeding completo ejecutado exitosamente",
  "data": {
    "modules": {
      "created": 15,
      "skipped": 0,
      "total": 15
    },
    "plans": {
      "created": 5,
      "skipped": 0,
      "total": 5
    },
    "rules": {
      "created": 30,
      "updated": 0,
      "skipped": 0,
      "total": 30,
      "totalInDb": 30
    }
  }
}
```

---

## Troubleshooting

### Error: "Seeding no configurado en este entorno"
- Verifica que `SEED_SECRET_KEY` esté configurada en Render

### Error: "Clave de seeding inválida"
- El header `X-Seed-Secret` debe coincidir con `SEED_SECRET_KEY`

### Error: "Solo el OWNER puede ejecutar seeding"
- Debes estar autenticado como usuario con rol `OWNER`

### Error: "Token inválido"
- Tu token expiró, haz login nuevamente

---

## Seguridad

- ✅ Solo usuarios con rol `OWNER` pueden ejecutar seeding
- ✅ Requiere clave secreta en headers
- ✅ Los scripts son idempotentes (puedes ejecutarlos múltiples veces)
- ✅ No duplican datos, solo crean/actualizan

---

## Orden de Ejecución Recomendado

1. **Módulos** (primero)
2. **Planes** (después, porque dependen de módulos)
3. **Reglas** (al final)

El endpoint `/api/seed/all` ejecuta automáticamente en este orden.
