# ✅ Checklist Rápido: Conectar WhatsApp Business

**Tiempo:** 30 minutos | **Costo:** Gratis (1000 conversaciones/mes)

---

## 📝 Pre-requisitos (Prepara esto antes)

```
□ Cuenta Facebook personal
□ Número de teléfono NO usado en WhatsApp personal
□ Tarjeta de crédito/débito para verificación
□ Documentos del negocio (opcional, según país)
```

---

## 🚀 Configuración Paso a Paso

### PASO 1️⃣: Meta Business Manager (5 min)
```
1. Ir a: https://business.facebook.com/
2. Crear cuenta → Ingresar nombre negocio
3. Verificar email
4. [Guardar] Email y contraseña usados
```

### PASO 2️⃣: Crear App WhatsApp (5 min)
```
1. Ir a: https://developers.facebook.com/
2. Mis aplicaciones → Crear aplicación
3. Tipo: "Empresa" (Business)
4. Nombre: "WhatsApp - [Tu Salón]"
5. Agregar producto: WhatsApp
6. [Copiar] App ID desde Settings → Basic
```

### PASO 3️⃣: Verificar Número (5 min)
```
1. WhatsApp → API Setup → Add phone number
2. Ingresar: +57 XXX XXX XXXX
3. Recibir código SMS
4. Verificar
5. [Copiar] Phone Number ID (aparece después)
6. [Copiar] WABA ID (arriba del Phone Number ID)
```

### PASO 4️⃣: Token Permanente (10 min)
```
1. Ir a: https://business.facebook.com/
2. Configuración → Usuarios del sistema
3. Agregar → "WhatsApp Beauty Control"
4. Agregar activos → Apps → [Tu app]
5. Permisos: whatsapp_business_messaging
6. Generar token → [COPIAR Y GUARDAR]
```

### PASO 5️⃣: Webhook (3 min)
```
1. Tu app → WhatsApp → Configuration
2. Webhook → Edit
3. Callback URL:
   https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp
   
4. Verify token:
   beauty_control_webhook_verify_2024
   
5. Subscribe: messages ✓ message_status ✓
6. Verify and save
```

### PASO 6️⃣: Método de Pago (2 min)
```
1. Meta Business → Configuración → Pagos
2. Agregar método de pago
3. Ingresar tarjeta (no se cobrará aún)
```

### PASO 7️⃣: Conectar en Beauty Control (2 min)
```
1. Beauty Control → Mi Negocio → Perfil → WhatsApp
2. Pegar:
   • Access Token: [del paso 4]
   • Phone Number ID: [del paso 3]
   • WABA ID: [del paso 3]
3. Guardar → Probar Conexión
4. Ver: ✅ "Conexión exitosa"
```

---

## 📋 Datos que Debes Guardar

Completa esta tabla con TUS datos:

| Campo | Dónde encontrarlo | Tu valor |
|-------|-------------------|----------|
| **App ID** | developers.facebook.com → App → Settings → Basic | _____________ |
| **Phone Number ID** | App → WhatsApp → API Setup → Phone numbers | _____________ |
| **WABA ID** | App → WhatsApp → API Setup (arriba) | _____________ |
| **Access Token** | Business Suite → Usuarios del sistema → Token | EAAA_________ |
| **Número verificado** | El que verificaste en paso 3 | +57 _________ |

---

## ⚡ Prueba Final (1 min)

```
□ Beauty Control muestra: Estado "Conectado" ✅
□ Aparece nombre verificado de tu negocio
□ Aparece tu número de teléfono
□ Botón "Probar Conexión" responde OK
```

---

## 🆘 Errores Comunes

| Error | Solución |
|-------|----------|
| "Token inválido" | Genera nuevo token en paso 4 |
| "Webhook failed" | Revisa que verify token sea exacto |
| "No puedo enviar mensaje" | Falta método de pago (paso 6) |
| "Número no verificado" | Re-verifica en Meta Dashboard |

---

## 📞 ¿Necesitas Ayuda?

**Soporte Beauty Control:**
- 📧 soporte@beautycontrol.com
- 💬 WhatsApp: +57 XXX XXX XXXX
- 🕐 Lun-Vie 9am-6pm

**Meta Support:**
- 🌐 https://developers.facebook.com/support/

---

## 🎯 Después de Conectar

Ya puedes usar estas funciones:

```
✅ Recordatorios automáticos de citas
✅ Confirmaciones de agendamiento
✅ Envío de recibos digitales
✅ Mensajes promocionales
✅ Respuestas automatizadas
```

---

**📌 IMPORTANTE:** 
- Guarda esta información en lugar seguro
- NO compartas tu token con nadie
- Primer mes: 1000 conversaciones GRATIS
- Después: ~$0.01 USD por mensaje (varía por país)

---

🎉 **¡Listo para comenzar!**
