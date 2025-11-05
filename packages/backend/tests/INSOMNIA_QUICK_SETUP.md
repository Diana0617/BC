# 🚀 Insomnia Quick Setup - WhatsApp Admin API Testing

## 📦 Paso 1: Importar Colección

1. **Abre Insomnia Desktop**
2. **Import Data**:
   - Click en `Application` → `Preferences` → `Data` → `Import Data`
   - Selecciona el archivo: `packages/backend/tests/integration/whatsapp-admin-insomnia-collection.json`
3. **Verificar**: Deberías ver una colección llamada "WhatsApp Admin API" con 22 requests en 6 carpetas

## 🔑 Paso 2: Configurar Variables de Entorno

### Opción A: Variables Automáticas (Recomendado)

Después de importar, Insomnia debería tener estas variables configuradas automáticamente:

```json
{
  "base_url": "http://localhost:3001",
  "business_id": "TU_BUSINESS_ID_AQUI",
  "auth_token": "TU_TOKEN_AQUI"
}
```

### Opción B: Configuración Manual

Si las variables no se importaron, configúralas así:

1. Click en el dropdown de `Environment` (arriba a la izquierda)
2. Click en `Manage Environments`
3. Selecciona `WhatsApp Admin - Development`
4. Edita el JSON:

```json
{
  "base_url": "http://localhost:3001",
  "business_id": "d7af77b9-09cf-4d6b-b159-6249be87935e",
  "auth_token": "OBTENER_DESPUES_DE_LOGIN"
}
```

## 🔐 Paso 3: Obtener Token de Autenticación

### Método 1: Usar el Request de Login en Insomnia

1. Ve a la carpeta `0. Authentication`
2. Ejecuta el request `Login`
3. Copia el `accessToken` de la respuesta
4. Pega el token en la variable de entorno `auth_token`

### Método 2: Usar cURL (más rápido)

```bash
# En la terminal, ejecuta:
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mercedeslobeto@gmail.com","password":"Admin*7754"}' | python -m json.tool

# Copia el accessToken de la respuesta y pégalo en auth_token
```

### Credenciales de Prueba

**Email**: `mercedeslobeto@gmail.com`  
**Password**: `Admin*7754`  
**Business ID**: `d7af77b9-09cf-4d6b-b159-6249be87935e`

## 📁 Estructura de la Colección

La colección tiene **22 endpoints** organizados en **6 carpetas**:

### 1. Token Management (5 endpoints)
- ✅ `POST` - Store WhatsApp Token
- ✅ `GET` - Get Token Info
- ✅ `POST` - Refresh Token
- ✅ `DELETE` - Delete Token
- ✅ `POST` - Test Connection

### 2. Embedded Signup (2 endpoints)
- ✅ `POST` - Initialize Signup
- ✅ `POST` - Complete Signup

### 3. Template Management (6 endpoints)
- ✅ `GET` - List Templates
- ✅ `GET` - Get Template by ID
- ✅ `POST` - Create Template
- ✅ `PUT` - Update Template
- ✅ `DELETE` - Delete Template
- ✅ `POST` - Submit Template to Meta

### 4. Message History (2 endpoints)
- ✅ `GET` - List Messages
- ✅ `GET` - Get Message by ID

### 5. Webhook Events (3 endpoints)
- ✅ `GET` - List Webhook Events
- ✅ `GET` - Get Webhook Event by ID
- ✅ `POST` - Replay Webhook Event

### 6. Webhooks (Meta) (4 endpoints)
- ✅ `GET` - Webhook Verification (Meta)
- ✅ `POST` - Receive Webhook (Meta)
- ✅ `POST` - Message Status Webhook
- ✅ `POST` - Template Status Webhook

## 🧪 Orden Recomendado de Testing

### Fase 1: Autenticación y Configuración Base
1. **Login** → Obtener token
2. **Get Token Info** → Verificar estado actual (debería decir `hasToken: false`)

### Fase 2: Sin Token WhatsApp (Validar Errores)
Estos deberían retornar errores porque no hay token configurado:

3. **List Templates** → Error esperado
4. **List Messages** → Error esperado
5. **List Webhook Events** → Debería funcionar (lista vacía)

### Fase 3: Configurar Token Manualmente (Simulación)
6. **Store WhatsApp Token** → Guardar un token de prueba
   - Body de ejemplo:
   ```json
   {
     "accessToken": "test_token_123456",
     "phoneNumberId": "123456789",
     "wabaId": "987654321",
     "phoneNumber": "+573001234567"
   }
   ```
7. **Get Token Info** → Verificar que ahora dice `hasToken: true`
8. **Test Connection** → Probar conexión (puede fallar si el token es fake)

### Fase 4: Templates CRUD
9. **Create Template** → Crear una plantilla
   - Body de ejemplo:
   ```json
   {
     "name": "appointment_reminder",
     "language": "es",
     "category": "UTILITY",
     "components": [
       {
         "type": "BODY",
         "text": "Hola {{1}}, te recordamos tu cita el {{2}} a las {{3}}"
       }
     ]
   }
   ```
10. **List Templates** → Ver la plantilla creada
11. **Get Template by ID** → Obtener detalles de una plantilla
12. **Update Template** → Modificar una plantilla
13. **Delete Template** → Eliminar una plantilla (opcional)

### Fase 5: Messages y Webhooks
14. **List Messages** → Ver historial de mensajes
15. **List Webhook Events** → Ver eventos recibidos
16. **Replay Webhook Event** → Reprocesar un evento (si hay alguno)

### Fase 6: Meta Webhooks (Cuando tengas Sandbox)
17. **Webhook Verification** → Meta usa esto para verificar tu webhook
18. **Receive Webhook** → Recibir eventos de Meta
19. **Message Status Webhook** → Actualización de estado de mensaje
20. **Template Status Webhook** → Actualización de estado de plantilla

## ⚠️ Notas Importantes

### Estados Esperados SIN Token WhatsApp Real:

| Endpoint | Estado Esperado | Razón |
|----------|----------------|-------|
| Login | ✅ 200 OK | Autenticación local funciona |
| Get Token Info | ✅ 200 OK | Retorna `hasToken: false` |
| List Templates | ❌ Error | No hay token configurado |
| List Messages | ❌ Error | No hay token configurado |
| List Webhook Events | ✅ 200 OK | Solo consulta DB local |
| Store Token | ✅ 201 Created | Guarda en DB (aunque sea fake) |

### Estados Esperados CON Token WhatsApp Real (Meta Sandbox):

| Endpoint | Estado Esperado | Razón |
|----------|----------------|-------|
| List Templates | ✅ 200 OK | Consulta a Meta API |
| Create Template | ✅ 201 Created | Crea en DB y Meta |
| Submit Template | ✅ 200 OK | Envía a Meta para aprobación |
| Test Connection | ✅ 200 OK | Valida token con Meta |

## 🐛 Troubleshooting

### Error: "Token de acceso requerido"
**Solución**: Verifica que la variable `auth_token` esté configurada correctamente en el ambiente de Insomnia.

### Error: "No tienes acceso a este negocio"
**Solución**: Verifica que el `business_id` en la URL coincida con el businessId del usuario autenticado.

### Error: "Error al obtener plantillas"
**Solución**: Normal si no hay token de WhatsApp configurado. Configura un token primero con "Store WhatsApp Token".

### Error: "Cannot connect to localhost:3001"
**Solución**: 
```bash
# Asegúrate de que el backend esté corriendo:
cd packages/backend
npm run dev
```

### Error: "Invalid token format"
**Solución**: El token debe ser un JWT válido. Obtén uno nuevo ejecutando el request de Login.

## 📊 Checklist de Testing

- [ ] Backend corriendo en puerto 3001
- [ ] Colección importada en Insomnia
- [ ] Variables de entorno configuradas
- [ ] Token de autenticación obtenido
- [ ] Endpoint de login probado (200 OK)
- [ ] Endpoint de get token info probado (200 OK)
- [ ] Endpoint de list templates probado (error esperado sin WhatsApp token)
- [ ] Endpoint de store token probado (201 Created)
- [ ] Endpoints CRUD de templates probados
- [ ] Endpoints de messages probados
- [ ] Endpoints de webhook events probados

## 🎯 Próximo Paso: Meta Sandbox

Cuando recibas las credenciales de Meta Sandbox, tendrás que:

1. **Actualizar .env** con las credenciales reales:
   ```env
   META_APP_ID=tu_app_id_real
   META_CONFIGURATION_ID=tu_config_id_real
   META_APP_SECRET=tu_app_secret_real
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=tu_verify_token
   ```

2. **Probar Embedded Signup**:
   - Usar el endpoint "Initialize Signup"
   - Abrir la URL retornada en el navegador
   - Completar el flujo de OAuth con Meta
   - Usar el código retornado en "Complete Signup"

3. **Probar Template Real**:
   - Crear template con estructura válida de Meta
   - Submeter a Meta para aprobación
   - Esperar aprobación (~15 minutos)
   - Enviar mensaje de prueba

---

**¡Listo para empezar testing! 🚀**

Si tienes algún problema, revisa el archivo `FASE_4_TESTING_GUIDE.md` para más detalles.
