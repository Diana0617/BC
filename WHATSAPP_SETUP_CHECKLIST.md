# ✅ CHECKLIST COMPLETO - WhatsApp Integration

## 📋 Resumen del Estado Actual

Tu integración de WhatsApp está **95% completa**. Solo faltan algunos pasos de configuración.

---

## 🎯 PASO 1: Configurar Variables de Entorno Backend

### A. Generar ENCRYPTION_KEY

Ejecuta en tu terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado (debe ser un string de 64 caracteres hexadecimales).

### B. Crear/Editar archivo `.env` en `packages/backend/`

Agrega estas variables:

```env
# WhatsApp Business Platform
META_APP_ID=1928881431390804
META_APP_SECRET=tu_app_secret_de_meta
WHATSAPP_CONFIG_ID=884984130753544
WHATSAPP_WEBHOOK_VERIFY_TOKEN=beauty_control_webhook_verify_2024
ENCRYPTION_KEY=<pegar_el_resultado_del_paso_A>
```

**¿Dónde obtener META_APP_SECRET?**
1. Ve a https://developers.facebook.com
2. Selecciona tu app "Control de Negocios"
3. Settings → Basic
4. Copia el "App Secret"

---

## 🗄️ PASO 2: Crear Tablas en la Base de Datos

### Opción A: Ejecutar Migración SQL (RECOMENDADO)

```bash
# Conectarse a tu base de datos y ejecutar:
psql -U tu_usuario -d beauty_control_dev -f packages/backend/migrations/create_whatsapp_tables.sql
```

### Opción B: Dejar que Sequelize las cree (solo desarrollo)

En `packages/backend/.env`:
```env
DISABLE_SYNC=false
```

Luego reinicia el backend. Sequelize creará las tablas automáticamente.

**⚠️ IMPORTANTE:** En producción, SIEMPRE usa la migración SQL (Opción A).

---

## 🚀 PASO 3: Probar Localmente

### A. Iniciar Backend

```bash
cd packages/backend
npm install  # por si acaso
npm start
```

Deberías ver:
```
✅ Servidor corriendo en puerto 5000
✅ Base de datos conectada
✅ Tablas sincronizadas
```

### B. Iniciar Frontend

```bash
cd packages/web-app
npm install  # por si acaso
npm run dev
```

Deberías ver:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### C. Abrir en Navegador

1. Ve a http://localhost:5173
2. Inicia sesión con un usuario BUSINESS
3. Ve a Perfil → WhatsApp
4. Deberías ver la sección de WhatsApp con el botón "Conectar con Meta Business"

---

## 🔍 PASO 4: Verificar que Todo Funciona

### Checklist de Verificación:

- [ ] Backend inicia sin errores
- [ ] Frontend inicia sin errores
- [ ] Puedes ver la sección de WhatsApp en el perfil
- [ ] El botón "Conectar con Meta Business" aparece
- [ ] Al hacer clic, se abre el diálogo de Meta (ventana emergente)

---

## 🌐 PASO 5: Configurar en Meta for Developers

Antes de que un negocio pueda conectarse, necesitas:

### A. Verificar App en Meta

1. Ve a https://developers.facebook.com
2. Selecciona tu app "Control de Negocios"
3. Verifica que esté en modo "Live" (no "Development")

### B. Configurar Webhook

1. En Meta Dashboard → WhatsApp → Configuration
2. Webhook URL: `https://tu-backend.com/api/webhooks/whatsapp`
3. Verify Token: `beauty_control_webhook_verify_2024` (mismo que en .env)
4. Webhook Fields: Selecciona:
   - `messages`
   - `message_status`
   - `messaging_product`

### C. Agregar Dominios Autorizados

En Meta Dashboard → Settings → Basic → App Domains:

Agrega:
- `localhost` (para desarrollo)
- Tu dominio de producción (ej: `controldenegocios.com`)

---

## 👥 PASO 6: Probar Conexión de un Negocio

### Como Usuario BUSINESS:

1. **Ir a WhatsApp Section**
   - Perfil → WhatsApp

2. **Conectar con Meta**
   - Click en "Conectar con Meta Business"
   - Iniciar sesión con Facebook
   - Seleccionar/Crear Meta Business Account
   - Configurar WhatsApp Business
   - Verificar número de teléfono

3. **Verificar Conexión Exitosa**
   - Deberías ver: "✅ Conectado"
   - Ver tu número de teléfono
   - Estado: "Activo"

---

## 🧪 PASO 7: Probar Envío de Mensajes

### A. Crear una Plantilla de Prueba

1. En Meta Business Manager:
   - WhatsApp → Message Templates
   - Create Template
   - Nombre: `prueba_bienvenida`
   - Categoría: TRANSACTIONAL
   - Contenido: "Hola {{1}}, bienvenido a {{2}}"
   - Enviar para aprobación

2. Espera aprobación (puede tardar 24-48 horas)

### B. Enviar Mensaje de Prueba

Una vez aprobada la plantilla:

1. En Beauty Control → Perfil → WhatsApp → Mensajes
2. Click "Enviar Mensaje"
3. Selecciona cliente
4. Selecciona plantilla
5. Completa variables
6. Enviar

---

## 📊 PASO 8: Monitoreo y Debugging

### Ver Logs del Backend

```bash
# En desarrollo
cd packages/backend
npm start

# Verás logs de:
# - Tokens guardados
# - Mensajes enviados
# - Webhooks recibidos
```

### Ver Logs en la Base de Datos

```sql
-- Ver tokens almacenados
SELECT 
  business_id,
  token_type,
  is_active,
  metadata->>'phoneNumberId' as phone_number_id,
  created_at
FROM whatsapp_tokens;

-- Ver mensajes enviados
SELECT 
  business_id,
  "to" as destinatario,
  message_type,
  status,
  sent_at
FROM whatsapp_messages
ORDER BY created_at DESC
LIMIT 10;

-- Ver eventos de webhook
SELECT 
  business_id,
  event_type,
  processed,
  received_at
FROM whatsapp_webhook_events
ORDER BY received_at DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting Común

### Error: "SDK de Facebook no está cargado"

**Solución:**
- Verifica que `VITE_WHATSAPP_APP_ID` esté en `.env` del frontend
- Refresca la página con Ctrl+F5

### Error: "No se pudo guardar el token"

**Solución:**
- Verifica que `ENCRYPTION_KEY` esté configurado en backend
- Verifica que las tablas existan en la BD
- Revisa logs del backend

### Error: "Webhook verification failed"

**Solución:**
- Verifica que `WHATSAPP_WEBHOOK_VERIFY_TOKEN` coincida en:
  - Backend .env
  - Meta Dashboard → Webhook setup

### Error: "Invalid phone number"

**Solución:**
- El número debe incluir código de país
- Formato: +57XXXXXXXXXX (sin espacios ni guiones)
- No puede estar registrado en WhatsApp personal

---

## 🎉 ¡LISTO!

Si completaste todos los pasos y todo funciona:

✅ Tu integración de WhatsApp está 100% funcional
✅ Cada negocio puede conectar su WhatsApp
✅ Pueden enviar mensajes personalizados
✅ Puedes monitorear todo desde la plataforma

---

## 📝 Próximos Pasos (Opcional)

### Mejoras Adicionales:

1. **Automatización de Mensajes**
   - Recordatorios de citas automáticos
   - Mensajes de cumpleaños
   - Follow-ups post-servicio

2. **Dashboard de Analytics**
   - Métricas de mensajes enviados/leídos
   - Tasas de entrega
   - Reportes por negocio

3. **Templates Predefinidos**
   - Biblioteca de plantillas comunes
   - Templates sugeridos por industria

4. **Notificaciones**
   - Alertas cuando un template es aprobado/rechazado
   - Notificaciones de fallos en envío

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs del backend
2. Revisa la consola del navegador (F12)
3. Verifica las variables de entorno
4. Consulta las guías en `/GUIA_CONEXION_WHATSAPP_PASO_A_PASO.md`

---

**Última actualización:** 2026-01-18
