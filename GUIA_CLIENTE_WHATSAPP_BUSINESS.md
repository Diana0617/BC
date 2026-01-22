# 📱 Guía para Clientes: Conectar WhatsApp Business a Beauty Control

**Última actualización:** Enero 2026  
**Tiempo estimado:** 30-45 minutos  
**Dificultad:** Media

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:

- [ ] **Cuenta de Meta Business** (Facebook Business Manager)
- [ ] **Número de teléfono** que NO esté asociado a WhatsApp personal
- [ ] **Acceso de administrador** a la cuenta de Meta Business
- [ ] **Método de pago** válido (tarjeta de crédito/débito)
- [ ] **Acceso a tu cuenta** en Beauty Control

---

## 🎯 Paso 1: Crear/Verificar Cuenta de Meta Business

### 1.1 Crear Cuenta de Meta Business (si no tienes una)

1. Ve a https://business.facebook.com/
2. Clic en **"Crear cuenta"**
3. Ingresa:
   - Nombre de tu negocio
   - Tu nombre completo
   - Correo electrónico del negocio
4. Completa la verificación por correo electrónico

### 1.2 Verificar tu Negocio

Meta puede solicitar documentos para verificar tu negocio:
- Registro mercantil o certificado de existencia
- Cédula/pasaporte del propietario
- Comprobante de domicilio

**Nota:** La verificación puede tardar 1-3 días hábiles.

---

## 🚀 Paso 2: Crear App de WhatsApp Business Platform

### 2.1 Acceder a Meta for Developers

1. Ve a https://developers.facebook.com/
2. Inicia sesión con tu cuenta de Facebook (la misma de Meta Business)
3. Clic en **"Mis aplicaciones"** (esquina superior derecha)
4. Clic en **"Crear aplicación"**

### 2.2 Configurar la Aplicación

1. **Tipo de aplicación:** Selecciona **"Empresa"** (Business)
2. **Detalles de la aplicación:**
   - **Nombre:** `WhatsApp - [Nombre de tu Salón]`
   - **Correo de contacto:** Tu email de negocio
   - **Cuenta empresarial:** Selecciona tu Meta Business Account
3. Clic en **"Crear aplicación"**

### 2.3 Agregar Producto WhatsApp

1. En el panel izquierdo, busca **"WhatsApp"**
2. Clic en **"Configurar"** o **"Add Product"**
3. Meta te mostrará el panel de configuración de WhatsApp

---

## 📞 Paso 3: Configurar Número de WhatsApp

### 3.1 Agregar Número de Teléfono

1. En el panel de WhatsApp, ve a **"API Setup"**
2. Sección **"Phone numbers"**
3. Clic en **"Add phone number"**
4. Selecciona tu método:
   - **Opción A:** Usar número nuevo (recomendado)
   - **Opción B:** Migrar número existente de WhatsApp Business App

### 3.2 Verificar el Número

1. **Método SMS:**
   - Ingresa tu número con código de país (ej: +57 301 234 5678)
   - Recibirás un código SMS
   - Ingresa el código de verificación

2. **Método Llamada:**
   - Si no recibes SMS, solicita verificación por llamada
   - Recibirás una llamada automática con el código

### 3.3 Guardar Información Importante

Una vez verificado, **copia y guarda** estos datos en un lugar seguro:

```
📋 DATOS DE CONEXIÓN WHATSAPP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
App ID: [Aparece en Panel → Settings → Basic]
Phone Number ID: [Aparece en API Setup → Phone numbers]
WABA ID: [Aparece en API Setup → Account Info]
Número verificado: +57 XXX XXX XXXX
```

---

## 🔑 Paso 4: Obtener Token de Acceso (Método Manual)

### 4.1 Generar Token Temporal

1. En **API Setup**, busca la sección **"Temporary access token"**
2. Clic en **"Generate token"** o el icono de copiar
3. Copia el token que aparece (empieza con `EAAA...`)

⚠️ **IMPORTANTE:** Este token expira en 24 horas. Úsalo solo para pruebas iniciales.

### 4.2 Generar Token Permanente (Recomendado)

Para un token que no expire, sigue estos pasos:

1. Ve a **Meta Business Suite** (https://business.facebook.com/)
2. **Configuración del negocio** → **Usuarios del sistema**
3. Clic en **"Agregar"** → **"Agregar usuario del sistema"**
4. Nombre: `WhatsApp Beauty Control`
5. Rol: **Administrador**
6. **Guardar**

7. Clic en el usuario del sistema creado
8. **Agregar activos** → **Aplicaciones**
9. Selecciona tu app de WhatsApp
10. Permisos: 
    - `whatsapp_business_messaging`
    - `whatsapp_business_management`
11. Clic en **"Generar nuevo token"**
12. **Copia el token** (este no expira)

---

## 🔧 Paso 5: Configurar Webhook en Meta

### 5.1 Agregar URL del Webhook

1. En tu app, ve a **WhatsApp** → **Configuration**
2. Sección **"Webhook"**
3. Clic en **"Edit"** o **"Configure webhooks"**

4. **Callback URL:**
   ```
   https://beautycontrol-api.azurewebsites.net/api/webhooks/whatsapp
   ```

5. **Verify Token:**
   ```
   beauty_control_webhook_verify_2024
   ```

6. Clic en **"Verify and save"**

### 5.2 Suscribirse a Eventos

En **Webhook fields**, activa:
- ✅ `messages` (mensajes entrantes)
- ✅ `message_status` (estado de mensajes)
- ✅ `messaging_postbacks` (respuestas de botones)

---

## 💳 Paso 6: Agregar Método de Pago

WhatsApp requiere un método de pago para enviar mensajes (después de las primeras 1000 conversaciones gratuitas).

### 6.1 Configurar Facturación

1. Ve a **Meta Business Suite**
2. **Configuración del negocio** → **Pagos**
3. **Agregar método de pago**
4. Ingresa datos de tu tarjeta:
   - Número de tarjeta
   - Fecha de vencimiento
   - CVV
   - Dirección de facturación

### 6.2 Configurar Alertas

1. **Configuración de facturación** → **Notificaciones**
2. Activa alertas de:
   - Límite de gasto alcanzado
   - Nuevo cargo procesado
   - Método de pago rechazado

---

## 🎨 Paso 7: Conectar en Beauty Control

Ahora conecta WhatsApp en tu plataforma Beauty Control:

### 7.1 Acceder a Configuración

1. Inicia sesión en **Beauty Control**
2. Ve a **Mi Negocio** → **Perfil**
3. Pestaña **"WhatsApp"**

### 7.2 Ingresar Credenciales (Método Manual)

1. **Access Token:** Pega el token generado en Paso 4.2
2. **Phone Number ID:** Copia desde Meta → API Setup
3. **WABA ID:** Copia desde Meta → API Setup
4. Clic en **"Guardar Configuración"**

### 7.3 Probar Conexión

1. Clic en **"Probar Conexión"**
2. Deberías ver mensaje: ✅ **"Conexión exitosa"**
3. Verifica que aparezca:
   - Nombre verificado de tu negocio
   - Número de teléfono
   - Estado: **Conectado**

---

## ✅ Paso 8: Verificación Final

### 8.1 Checklist de Configuración

- [ ] App de Meta creada y configurada
- [ ] Número de WhatsApp verificado
- [ ] Token de acceso generado (permanente)
- [ ] Webhook configurado y verificado
- [ ] Método de pago agregado
- [ ] Conexión probada en Beauty Control
- [ ] Estado muestra "Conectado"

### 8.2 Enviar Mensaje de Prueba

1. En Beauty Control, ve a **Clientes**
2. Selecciona un cliente de prueba (o agrégalo)
3. Clic en **"Enviar WhatsApp"**
4. Envía un mensaje de prueba
5. Verifica que llegue al número del cliente

---

## 🆘 Solución de Problemas

### Error: "Token inválido"
**Causa:** Token expirado o sin permisos  
**Solución:** Genera nuevo token permanente (Paso 4.2)

### Error: "Número no verificado"
**Causa:** Verificación SMS/llamada no completada  
**Solución:** 
1. Ve a Meta → WhatsApp → API Setup
2. Revisa estado del número
3. Re-verifica si es necesario

### Error: "Webhook verification failed"
**Causa:** Verify Token incorrecto  
**Solución:** Usa exactamente: `beauty_control_webhook_verify_2024`

### Error: "No se puede enviar mensaje"
**Causa:** Sin método de pago configurado  
**Solución:** Agrega tarjeta en Meta Business Suite (Paso 6)

### Error: "Rate limit exceeded"
**Causa:** Demasiados mensajes en poco tiempo  
**Solución:** 
- Espera 1 hora
- Revisa límites en Meta → WhatsApp → Insights
- Solicita aumento de límite si es necesario

---

## 📞 Contacto y Soporte

Si tienes problemas durante la configuración:

**Soporte Beauty Control:**
- Email: soporte@beautycontrol.com
- WhatsApp: +57 XXX XXX XXXX
- Horario: Lun-Vie 9am-6pm

**Soporte Meta/WhatsApp:**
- Centro de ayuda: https://developers.facebook.com/support/
- Documentación: https://developers.facebook.com/docs/whatsapp/

---

## 🔒 Seguridad y Mejores Prácticas

### Protege tus Credenciales

- ❌ **NUNCA** compartas tu token de acceso públicamente
- ❌ **NO** incluyas tokens en código visible
- ✅ Usa tokens permanentes con permisos limitados
- ✅ Rota tokens cada 6 meses
- ✅ Monitorea actividad sospechosa en Meta Business

### Cumplimiento de Políticas

WhatsApp tiene políticas estrictas:
- ✅ Solo mensajes con consentimiento del cliente
- ✅ Incluye opción de darse de baja
- ✅ No envíes spam o contenido prohibido
- ✅ Respeta horarios (no envíes de noche)
- ❌ No envíes promociones excesivas

**Incumplimiento = Suspensión de cuenta**

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp/)
- [Cloud API Quick Start](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Meta Business Suite](https://business.facebook.com/help/)

### Tutoriales en Video
- [Configurar WhatsApp Business API](https://www.youtube.com/results?search_query=whatsapp+business+api+setup)
- [Meta Business Manager Tutorial](https://www.youtube.com/results?search_query=meta+business+manager+tutorial)

### Políticas y Límites
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy/)
- [Messaging Limits](https://developers.facebook.com/docs/whatsapp/messaging-limits)
- [Pricing](https://developers.facebook.com/docs/whatsapp/pricing/)

---

## 🎉 ¡Felicitaciones!

Has configurado exitosamente WhatsApp Business en tu cuenta de Beauty Control. 

Ahora puedes:
- ✅ Enviar recordatorios automáticos de citas
- ✅ Confirmar agendamientos por WhatsApp
- ✅ Enviar recibos digitales
- ✅ Promocionar servicios especiales
- ✅ Mantener comunicación profesional con clientes

**¡Aprovecha al máximo esta herramienta para hacer crecer tu negocio!** 🚀

---

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Plataforma:** Beauty Control  
**Autor:** Equipo Beauty Control
