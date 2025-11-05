# WhatsApp Admin API - Testing Quick Start

## 🚀 Inicio Rápido

### Paso 1: Iniciar el Backend

```bash
cd packages/backend
npm run dev
```

Espera a ver el mensaje:
```
✅ Servidor corriendo en puerto 5000
✅ Base de datos conectada
```

---

### Paso 2: Obtener Token de Autenticación

Opción A - Con cURL:
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"tu-email@example.com","password":"tu-password"}'
```

Opción B - Con el script helper:
```bash
cd packages/backend/tests
bash quick-start-testing.sh
```

Guarda el token que recibes en la respuesta.

---

### Paso 3: Configurar Insomnia

1. **Abrir Insomnia**

2. **Importar colección**:
   - Click en `Import/Export` o `Create` → `Import From` → `File`
   - Seleccionar: `packages/backend/tests/integration/whatsapp-admin-insomnia-collection.json`

3. **Configurar variables de entorno**:
   - Click en `No Environment` → `Manage Environments`
   - Editar `Base Environment`
   - Actualizar:
     ```json
     {
       "base_url": "http://localhost:5000",
       "business_id": "TU_BUSINESS_ID",
       "auth_token": "TU_TOKEN_AQUI"
     }
     ```

---

### Paso 4: Ejecutar Tests

Sigue el orden de testing recomendado:

#### 📁 Carpeta 1: Token Management (7 requests)

1. ✅ **1.1 Get Token Info** - Verificar estado actual
2. ✅ **1.5 Test Connection** - Probar conexión (fallará si no hay token)
3. ✅ **1.7 Get Token Audit** - Ver log de operaciones
4. ✅ **1.6 Get Token History** - Ver historial de cambios

#### 📁 Carpeta 2: Embedded Signup (2 requests)

5. ✅ **2.1 Get Embedded Signup Config** - Obtener configuración OAuth

#### 📁 Carpeta 3: Template Management (6 requests)

6. ✅ **3.1 List Templates** - Ver plantillas (probablemente vacío)
7. ✅ **3.2 Create Template** - Crear plantilla de prueba
8. ✅ **3.3 Update Template** - Actualizar plantilla creada
9. ✅ **3.5 Delete Template** - Eliminar plantilla de prueba

#### 📁 Carpeta 4: Message History (2 requests)

10. ✅ **4.1 List Messages** - Ver mensajes enviados

#### 📁 Carpeta 5: Webhook Events (3 requests)

11. ✅ **5.1 List Webhook Events** - Ver eventos de webhook

#### 📁 Carpeta 6: Health & Stats (2 requests)

12. ✅ **6.1 Health Check** - Estado de salud
13. ✅ **6.2 Get Statistics** - Estadísticas generales

---

## ✅ Checklist de Validación Rápida

### Tests Básicos (5 min)

- [ ] Backend corriendo sin errores
- [ ] Login exitoso (token obtenido)
- [ ] GET /health retorna 200
- [ ] GET /stats retorna 200
- [ ] GET /token retorna 200
- [ ] Request sin Authorization retorna 401
- [ ] Request con token inválido retorna 401

### Tests de Token Management (10 min)

- [ ] Get token info - retorna estado actual
- [ ] Get token audit - retorna log de operaciones
- [ ] Get token history - retorna cambios (puede estar vacío)
- [ ] Test connection sin token - retorna error esperado

### Tests de Templates (15 min)

- [ ] List templates - retorna array (vacío ok)
- [ ] Create template - crea DRAFT exitosamente
- [ ] Update template - actualiza template DRAFT
- [ ] Delete template - elimina template DRAFT
- [ ] Intentar eliminar APPROVED - retorna error 400
- [ ] Template con name inválido - retorna error de validación

### Tests de Messages (5 min)

- [ ] List messages - retorna array con paginación
- [ ] List con filtros (status, fecha) - funciona correctamente
- [ ] Get message detail (si existe alguno)

### Tests de Webhooks (5 min)

- [ ] List webhook events - retorna array
- [ ] List con filtro de eventType - funciona
- [ ] Get event detail (si existe alguno)

### Tests de Security (10 min)

- [ ] Sin Authorization header - 401
- [ ] Token inválido - 401
- [ ] BusinessId diferente - 403
- [ ] Campos requeridos faltantes - 400
- [ ] Validación de tipos de datos - 400

---

## 🎯 Tests Mínimos para Validar (15 min)

Si tienes poco tiempo, ejecuta estos **6 requests esenciales**:

1. **Health Check** - Verifica que el sistema está up
   ```
   GET /api/business/:businessId/admin/whatsapp/health
   Expected: 200, { success: true, data: { status, hasToken, config } }
   ```

2. **Get Stats** - Verifica que las estadísticas funcionan
   ```
   GET /api/business/:businessId/admin/whatsapp/stats
   Expected: 200, estadísticas de templates/messages/webhooks
   ```

3. **Get Token Info** - Verifica gestión de tokens
   ```
   GET /api/business/:businessId/admin/whatsapp/token
   Expected: 200, info del token actual (o sin token)
   ```

4. **List Templates** - Verifica templates endpoint
   ```
   GET /api/business/:businessId/admin/whatsapp/templates?page=1&limit=10
   Expected: 200, array de templates con paginación
   ```

5. **Create Template** - Verifica creación
   ```
   POST /api/business/:businessId/admin/whatsapp/templates
   Body: { name, language, category, components }
   Expected: 201, template creado con status DRAFT
   ```

6. **Authentication Test** - Verifica seguridad
   ```
   GET /api/business/:businessId/admin/whatsapp/token
   Sin header Authorization
   Expected: 401, error de autenticación
   ```

---

## 📊 Resultados Esperados

### ✅ Success (200/201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación completada"
}
```

### ❌ Error (400/401/403/404/500)
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [ ... ]  // Solo en errores de validación
}
```

### 📄 Paginación
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

---

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Verificar puerto 5000 libre
netstat -ano | findstr :5000

# Verificar variables de entorno
cat .env | grep WHATSAPP_ENCRYPTION_KEY

# Verificar conexión a BD
npm run check
```

### Error 401 - No autorizado
- Verificar que el token esté en el header `Authorization: Bearer TOKEN`
- Token puede haber expirado (genera uno nuevo)
- Verificar que `JWT_SECRET` en `.env` sea correcto

### Error 403 - Acceso denegado
- Verificar que el `businessId` en la URL sea correcto
- Verificar que el usuario tenga acceso a ese negocio

### Error 500 - Server error
- Revisar logs del backend en la terminal
- Verificar que `WHATSAPP_ENCRYPTION_KEY` esté configurado
- Verificar conexión a base de datos

---

## 📝 Documentar Resultados

Mientras testas, anota:

1. **Endpoints que funcionan**: ✅
2. **Endpoints con errores**: ❌ (especifica el error)
3. **Validaciones que funcionan**: ✅
4. **Edge cases encontrados**: 📌
5. **Bugs encontrados**: 🐛

---

## 🎉 Al Completar

Cuando termines el testing manual:

1. ✅ Todos los endpoints validados
2. ✅ Security funcionando (auth/authz)
3. ✅ Validaciones correctas
4. ✅ Error handling apropiado

**Siguiente paso**: FASE 5 - Sandbox Configuration con Meta API real

---

## 💡 Tips

- **Usa variables**: Insomnia permite usar `{{ _.variable }}` en las URLs
- **Duplica requests**: Para probar diferentes casos (success, error, etc.)
- **Organiza por carpetas**: Mantén los tests organizados
- **Documenta errores**: Captura de pantalla si encuentras bugs
- **Testing incremental**: Empieza con lo simple (health check) y avanza

---

**¿Listo para empezar?** 🚀

1. Backend corriendo: `npm run dev`
2. Insomnia abierto con colección importada
3. Variables configuradas
4. ¡Ejecuta el primer request! (Health Check)
